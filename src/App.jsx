import { useState } from 'react'
import './App.css'

// Components
import HallOfShame from './components/HallOfShame'
import VoteButton from './components/VoteButton'

// Services
import { githubService } from './services/github'
import { aiService } from './services/ai'
import { roastOperations } from './services/supabase'
import { getUserFingerprint } from './services/fingerprint'

const GITHUB_API = 'https://api.github.com/users/'
const GITHUB_REPOS_API = 'https://api.github.com/users/'

const fallbackRoasts = [
  "Wow, your GitHub is so empty, even tumbleweeds are bored.",
  "Your commit history is like a ghost town. Did you forget your password?",
  "With this many repos, you must be allergic to open source.",
  "Your profile is so quiet, even crickets left.",
  "If your GitHub was a party, even the bots wouldn't show up.",
  "Your repo list is so short, it could be a tweet.",
  "Legend says your last commit is still waiting for a friend.",
  "I've seen more activity in a library's silent section.",
  "Your contribution graph looks like a barcode for 'empty'.",
  "Even your README files are embarrassed to be there."
]

const getPersonalizedFallback = (profile) => {
  const brutalRoasts = [
    `@${profile.login}: ${profile.public_repos} repos and ${profile.followers} followers? Your coding career is moving backwards faster than Internet Explorer loading a webpage. I've seen more life in a cemetery's guest book.`,
    
    `${profile.followers} followers? Congratulations! You've managed to disappoint ${profile.followers} people and counting. Your contribution graph looks like my heart monitor after seeing your code - flatlining.`,
    
    `Joined GitHub in ${new Date(profile.created_at).getFullYear()} and only ${profile.public_repos} repos? At this rate, you'll have a decent portfolio by the time the sun burns out. Your commits are rarer than my compliments.`,
    
    `@${profile.login}, your GitHub profile is like a ghost town that even ghosts avoid. ${profile.public_repos} repos? I've seen more productivity from a broken printer. Your followers probably follow you by accident.`,
    
    `${profile.public_repos} repositories of what I can only assume is digital despair. Your code probably makes Stack Overflow moderators cry themselves to sleep. ${profile.followers} followers who clearly haven't seen your commit history.`,
    
    `Your GitHub stats are like participation trophies - technically they exist, but nobody's impressed. ${profile.public_repos} repos of pure disappointment and ${profile.followers} followers who probably need glasses.`,
    
    `@${profile.login}: Your programming skills are like your repository count - disappointingly low. I've seen more action in a library's silent section. Your contribution graph is flatter than my enthusiasm for your code.`,
    
    `${profile.followers} followers? Even my spam folder gets more engagement. Your ${profile.public_repos} repos are like modern art - confusing, pointless, and nobody really understands why they exist.`
  ]
  return brutalRoasts[Math.floor(Math.random() * brutalRoasts.length)]
}

const getRepoFallback = (repo) => {
  const repoRoasts = [
    `${repo.name}? More like ${repo.stargazers_count} people accidentally clicked star. Your ${repo.language || 'mystery'} code is so bad, even Stack Overflow refuses to help.`,
    
    `${repo.open_issues_count} open issues and counting - at least the bugs are consistent. ${repo.forks_count} forks? That's generous, probably just people trying to fix your code.`,
    
    `Last updated ${new Date(repo.updated_at).toLocaleDateString()}? Even your commits have given up. ${repo.stargazers_count} stars for this masterpiece of digital disappointment.`,
    
    `${repo.description || 'No description'} - even your repo description is more exciting than your code. ${repo.language} development at its finest... if you squint and look away.`
  ]
  return repoRoasts[Math.floor(Math.random() * repoRoasts.length)]
}

const funTips = [
  "Tip: Don't take it personally. Even Linus gets roasted!",
  "Pro tip: The more you code, the more you get roasted.",
  "Remember: It's all in good fun!",
  "Roasts are AI-generated. Blame the robots, not me!",
  "Share your roast with friends for maximum laughs."
]

const analyzeRepositories = async (username) => {
  try {
    const reposRes = await fetch(`${GITHUB_REPOS_API}${username}/repos?sort=updated&per_page=10`)
    if (!reposRes.ok) return { error: 'Could not fetch repos' }
    
    const repos = await reposRes.json()
    const analysis = {
      totalRepos: repos.length,
      languages: [],
      projectTypes: [],
      hasReadmes: 0,
      totalStars: 0,
      totalForks: 0,
      recentActivity: false,
      projectDescriptions: [],
      averageSize: 0,
      totalIssues: 0
    }
    
    for (const repo of repos) {
      if (repo.language && !analysis.languages.includes(repo.language)) {
        analysis.languages.push(repo.language)
      }
      
      try {
        const contentsRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/contents`)
        if (contentsRes.ok) {
          const contents = await contentsRes.json()
          const hasReadme = contents.some(file => 
            file.name.toLowerCase().match(/^readme\.(md|txt|rst)$/)
          )
          if (hasReadme) analysis.hasReadmes++
        }
      } catch (e) {
        if (repo.name.toLowerCase().includes('readme')) {
          analysis.hasReadmes++
        }
      }
      
      analysis.totalStars += repo.stargazers_count
      analysis.totalForks += repo.forks_count
      analysis.totalIssues += repo.open_issues_count
      analysis.averageSize += repo.size
      
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      if (new Date(repo.updated_at) > sixMonthsAgo) {
        analysis.recentActivity = true
      }
      
      analysis.projectDescriptions.push({
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count,
        language: repo.language,
        size: repo.size,
        issues: repo.open_issues_count,
        forks: repo.forks_count
      })
      
      const name = repo.name.toLowerCase()
      const desc = (repo.description || '').toLowerCase()
      
      if (name.includes('hello') || name.includes('test') || name.includes('practice') || name.includes('tutorial')) {
        analysis.projectTypes.push('tutorial/learning')
      } else if (name.includes('clone') || name.includes('copy') || desc.includes('clone')) {
        analysis.projectTypes.push('clone project')
      } else if (name.includes('bot') || name.includes('scraper') || desc.includes('bot')) {
        analysis.projectTypes.push('automation/bot')
      } else if (name.includes('api') || name.includes('backend') || name.includes('server')) {
        analysis.projectTypes.push('backend/api')
      } else if (name.includes('frontend') || name.includes('react') || name.includes('vue') || name.includes('app')) {
        analysis.projectTypes.push('frontend/app')
      } else if (name.includes('fork') || repo.fork) {
        analysis.projectTypes.push('forked repo')
      } else if (repo.stargazers_count === 0 && repo.forks_count === 0) {
        analysis.projectTypes.push('abandoned project')
      }
    }
    
    analysis.averageSize = Math.round(analysis.averageSize / repos.length)
    
    return analysis
  } catch (error) {
    return { error: 'Failed to analyze repos' }
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('profile')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [roast, setRoast] = useState('')
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [repo, setRepo] = useState(null)
  const [savedRoast, setSavedRoast] = useState(null)
  const [tip, setTip] = useState(funTips[Math.floor(Math.random() * funTips.length)])

  const shareRoast = () => {
    const target = activeTab === 'profile' ? `@${profile?.login}` : `${repo?.full_name}`
    const shareText = `🔥 Just got BRUTALLY roasted by GitRoaster! 🔥\n\n"${roast}"\n\nTarget: ${target}\n\n💀 Think you can handle the heat? Get your own savage roast at:\n https://gitroaster.vercel.app\n\n#GitRoaster #CodeRoast #GitHub`
    
    if (navigator.share) {
      navigator.share({
        title: 'GitRoaster - My Brutal GitHub Roast',
        text: shareText,
        url: 'https://gitroaster.vercel.app'
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        const originalTip = tip
        setTip('Epic roast copied to clipboard! Share the brutality!')
        setTimeout(() => setTip(originalTip), 3000)
      }).catch(() => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
        window.open(twitterUrl, '_blank')
      })
    }
  }

  const copyRoast = () => {
    navigator.clipboard.writeText(roast).then(() => {
      const originalTip = tip
      setTip('Roast copied to clipboard!')
      setTimeout(() => setTip(originalTip), 2000)
    }).catch(() => {

      const textArea = document.createElement('textarea')
      textArea.value = roast
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      const originalTip = tip
      setTip('Roast copied to clipboard!')
      setTimeout(() => setTip(originalTip), 2000)
    })
  }

  const handleVoteUpdate = (updatedRoast) => {

    if (savedRoast && updatedRoast.id === savedRoast.id) {
      setSavedRoast(updatedRoast)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    
    setLoading(true)
    setError('')
    setRoast('')
    setProfile(null)
    setRepo(null)
    setSavedRoast(null)
    setTip(funTips[Math.floor(Math.random() * funTips.length)])
    
    try {
      if (activeTab === 'profile') {

        const res = await fetch(GITHUB_API + input)
        if (!res.ok) throw new Error('GitHub user not found!')
        const profileData = await res.json()
        setProfile(profileData)
        
        const repoAnalysis = await analyzeRepositories(input)
        console.log('Repository analysis:', repoAnalysis)
        
        let roastText = ''
        try {
          roastText = await aiService.generateProfileRoast(profileData, repoAnalysis)
        } catch (aiError) {
          console.error('AI API Error:', aiError)
          roastText = getPersonalizedFallback(profileData)
        }
        
        setRoast(roastText)
        
        try {
          const fingerprint = getUserFingerprint()
          
          const saved = await roastOperations.saveRoast(
            input,
            roastText,
            'profile',
            null,
            fingerprint
          )
          
          setSavedRoast(saved)
        } catch (dbError) {
          console.error('Database save error:', dbError)
        }
        
      } else if (activeTab === 'repo') {
        // Repository roasting
        const [username, repoName] = input.split('/')
        if (!username || !repoName) {
          throw new Error('Please enter in format: username/repository')
        }
        
        const repoRes = await fetch(`${GITHUB_API}${username}`)
        const repoDataRes = await fetch(`https://api.github.com/repos/${username}/${repoName}`)
        
        if (!repoRes.ok) throw new Error('GitHub user not found!')
        if (!repoDataRes.ok) throw new Error('Repository not found!')
        
        const repoData = await repoDataRes.json()
        setRepo(repoData)
        
        let roastText = ''
        try {
          // Fetch actual repository data for accurate roasting
          const [languages, commits, contents] = await Promise.all([
            githubService.getRepositoryLanguages(username, repoName),
            githubService.getRecentCommits(username, repoName, 10),
            githubService.getRepositoryContents(username, repoName)
          ])
          
          console.log('Repository analysis:', {
            languages,
            commitsCount: commits?.length,
            contentsCount: contents?.length,
            hasReadme: contents?.some(f => f.name.toLowerCase().match(/^readme\.(md|txt|rst)$/))
          })
          
          roastText = await aiService.generateRepositoryRoast(repoData, languages, commits, contents)
        } catch (aiError) {
          console.error('AI API Error:', aiError)
          roastText = getRepoFallback(repoData)
        }
        
        setRoast(roastText)
        
        
        try {
          const fingerprint = getUserFingerprint()
          
          const saved = await roastOperations.saveRoast(
            username,
            roastText,
            'repo',
            repoName,
            fingerprint
          )
          
          setSavedRoast(saved)
        } catch (dbError) {
          console.error('Database save error:', dbError)
          
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderMainContent = () => {
    if (activeTab === 'hall-of-shame') {
      return <HallOfShame />
    }

    return (
      <div className="main-content">
        <form className="terminal-form" onSubmit={handleSubmit}>
          <label htmlFor="input">
            $ github-roast 
            <span style={{color:'#ffb86c'}}>
              [{activeTab === 'profile' ? 'username' : 'username/repo'}]
            </span>
          </label>
          <input
            id="input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={activeTab === 'profile' ? 'octocat' : 'octocat/Hello-World'}
            autoFocus
            required
            autoComplete="off"
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? 'Roasting...' : 'Roast Now!'}
          </button>
        </form>

        <div className="terminal-output">
          {error && <div className="error">{error}</div>}
          
          {!profile && !repo && !roast && !error && !loading && (
            <pre className="terminal-ascii">{`
   _____ _ _   _____                 _            
  / ____(_) | |  __ \               | |           
 | |  __ _| |_| |__) |___  ___ _ __ | |_ ___ _ __ 
 | | |_ | | __|  _  // _ \/ _ \ '_ \| __/ _ \ '__|
 | |__| | | |_| | \ \  __/  __/ | | | ||  __/ |   
  \_____|_|\__|_|  \_\___|\___|_| |_|\__\___|_|   
                                                   
              v2.0 - Now with voting!
`}</pre>
          )}
          
          {loading && (
            <div className="loading">
              <div className="loading-text">Analyzing and generating brutal roast...</div>
              <div className="loading-dots">...</div>
            </div>
          )}
          
          {profile && (
            <div className="profile-card">
              <img src={profile.avatar_url} alt="avatar" className="avatar" />
              <div className="profile-info">
                <span className="profile-name">{profile.name || profile.login}</span>
                <span className="profile-username">@{profile.login}</span>
                <div className="profile-stats">
                  <span>Repos: {profile.public_repos}</span>
                  <span>Followers: {profile.followers}</span>
                  <span>Following: {profile.following}</span>
                </div>
              </div>
            </div>
          )}
          
          {repo && (
            <div className="repo-card">
              <div className="repo-info">
                <span className="repo-name">{repo.full_name}</span>
                <span className="repo-description">{repo.description || 'No description'}</span>
                <div className="repo-stats">
                  <span>Language: {repo.language || 'Unknown'}</span>
                  <span>Stars: {repo.stargazers_count}</span>
                  <span>Forks: {repo.forks_count}</span>
                  <span>Issues: {repo.open_issues_count}</span>
                </div>
              </div>
            </div>
          )}
          
          {roast && (
            <div className="roast-container">
              <div className="roast-header">
                <span className="roast-title">Your Roast</span>
                <div className="roast-actions">
                  {savedRoast && (
                    <VoteButton 
                      roastId={savedRoast.id} 
                      initialVotes={savedRoast.votes} 
                      onVoteUpdate={handleVoteUpdate}
                    />
                  )}
                  <button className="copy-btn" onClick={copyRoast} title="Copy roast">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="roast">{roast}</div>
              <button className="share-btn" onClick={shareRoast}>
                Share This Roast
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="terminal-bg">

      <a 
        href="https://github.com/manan0209/gitroaster" 
        target="_blank" 
        rel="noopener noreferrer"
        className="github-star-btn"
        title="Star on GitHub"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.58C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.695 3.735 16.68C4.68 16.665 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.295C7.17 16.995 4.38 15.96 4.38 11.37C4.38 10.065 4.845 8.985 5.61 8.145C5.49 7.845 5.07 6.615 5.73 4.965C5.73 4.965 6.735 4.65 9.03 6.195C9.99 5.925 11.01 5.79 12.03 5.79C13.05 5.79 14.07 5.925 15.03 6.195C17.325 4.635 18.33 4.965 18.33 4.965C18.99 6.615 18.57 7.845 18.45 8.145C19.215 8.985 19.68 10.05 19.68 11.37C19.68 15.975 16.875 16.995 14.205 17.295C14.64 17.67 15.015 18.39 15.015 19.515C15.015 21.12 15 22.41 15 22.815C15 23.13 15.225 23.505 15.825 23.385C18.2072 22.5807 20.2772 21.0497 21.7437 19.0074C23.2101 16.965 23.9993 14.5143 24 12C24 5.37 18.63 0 12 0Z" fill="currentColor"/>
        </svg>
        <span>Star</span>
      </a>
      
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="header-left">
            <span className="header-title">GitRoaster v2.0</span>
          </div>
          <div className="header-tabs">
            <button 
              className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button 
              className={`tab ${activeTab === 'repo' ? 'active' : ''}`}
              onClick={() => setActiveTab('repo')}
            >
              Repository
            </button>
            <button 
              className={`tab ${activeTab === 'hall-of-shame' ? 'active' : ''}`}
              onClick={() => setActiveTab('hall-of-shame')}
            >
              Hall of Shame
            </button>
          </div>
        </div>
        
        {renderMainContent()}
        
        <div className="terminal-tip">{tip}</div>
      </div>
    </div>
  )
}

export default App
