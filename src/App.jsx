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
      projectDescriptions: []
    }
    
    repos.forEach(repo => {
      if (repo.language && !analysis.languages.includes(repo.language)) {
        analysis.languages.push(repo.language)
      }
      
      if (repo.description || repo.name.toLowerCase().includes('readme')) {
        analysis.hasReadmes++
      }
      
      analysis.totalStars += repo.stargazers_count
      analysis.totalForks += repo.forks_count
      
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      if (new Date(repo.updated_at) > sixMonthsAgo) {
        analysis.recentActivity = true
      }
      
      if (repo.name || repo.description) {
        analysis.projectDescriptions.push({
          name: repo.name,
          description: repo.description,
          stars: repo.stargazers_count,
          language: repo.language
        })
      }
      
      // Identify project types based on name patterns
      const name = repo.name.toLowerCase()
      if (name.includes('hello') || name.includes('test') || name.includes('practice')) {
        analysis.projectTypes.push('tutorial/practice')
      } else if (name.includes('clone') || name.includes('copy')) {
        analysis.projectTypes.push('clone project')
      } else if (name.includes('bot') || name.includes('scraper')) {
        analysis.projectTypes.push('automation')
      } else if (name.includes('api') || name.includes('backend')) {
        analysis.projectTypes.push('backend')
      } else if (name.includes('frontend') || name.includes('react') || name.includes('vue')) {
        analysis.projectTypes.push('frontend')
      }
    })
    
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
    const shareText = `Just got roasted by GitRoaster!\n\n"${roast}"\n\n${target} | Check out GitRoaster for your own roast!`
    
    if (navigator.share) {
      navigator.share({
        title: 'GitRoaster - My GitHub Roast',
        text: shareText,
        url: window.location.href
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        const originalTip = tip
        setTip('Roast copied to clipboard! Share it with your friends!')
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
      // Fallback for older browsers
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
    // Update the savedRoast with new vote count
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
        // Profile roasting
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
        
        // Save to database
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
          // Continue without saving
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
          roastText = await aiService.generateRepositoryRoast(repoData, {}, [], [])
        } catch (aiError) {
          console.error('AI API Error:', aiError)
          roastText = getRepoFallback(repoData)
        }
        
        setRoast(roastText)
        
        // Save to database
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
          // Continue without saving
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
