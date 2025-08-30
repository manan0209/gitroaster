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

const funTips = [
  "Tip: Don't take it personally. Even Linus gets roasted!",
  "Pro tip: The more you code, the more you get roasted.",
  "Remember: It's all in good fun!",
  "Roasts are AI-generated. Blame the robots, not me!",
  "Share your roast with friends for maximum laughs."
]

const analyzeRepositories = async (username) => {
  try {
    const repos = await githubService.getRepositories(username, 10)
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

const analyzeRepository = async (username, repoName) => {
  try {
    const [repo, languages, commits, contents] = await Promise.all([
      githubService.getRepository(username, repoName),
      githubService.getRepositoryLanguages(username, repoName),
      githubService.getRecentCommits(username, repoName, 10),
      githubService.getRepositoryContents(username, repoName)
    ])

    return { repo, languages, commits, contents }
  } catch (error) {
    throw new Error('Failed to analyze repository: ' + error.message)
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('roast')
  const [loading, setLoading] = useState(false)
  const [roast, setRoast] = useState(null)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [repo, setRepo] = useState(null)
  const [tip, setTip] = useState(funTips[Math.floor(Math.random() * funTips.length)])

  const handleRoastSubmit = async (input, mode, username, repoName) => {
    setLoading(true)
    setError('')
    setRoast(null)
    setProfile(null)
    setRepo(null)
    setTip(funTips[Math.floor(Math.random() * funTips.length)])
    
    try {
      let roastResult = null
      let profileData = null
      let repoData = null

      if (mode === 'profile') {
        // Profile roasting logic
        profileData = await githubService.getProfile(input)
        setProfile(profileData)
        
        const repoAnalysis = await analyzeRepositories(input)
        console.log('Repository analysis:', repoAnalysis)
        
        try {
          const roastText = await aiService.generateProfileRoast(profileData, repoAnalysis)
          roastResult = { roast_text: roastText }
        } catch (aiError) {
          console.error('AI API Error:', aiError)
          roastResult = { roast_text: getPersonalizedFallback(profileData) }
        }
      } else {
        // Repository roasting logic
        const repoAnalysisData = await analyzeRepository(username, repoName)
        repoData = repoAnalysisData.repo
        setRepo(repoData)
        
        try {
          const roastText = await aiService.generateRepositoryRoast(
            repoAnalysisData.repo,
            repoAnalysisData.languages,
            repoAnalysisData.commits,
            repoAnalysisData.contents
          )
          roastResult = { roast_text: roastText }
        } catch (aiError) {
          console.error('AI API Error:', aiError)
          // Generate fallback repo roast
          roastResult = { 
            roast_text: `${repoData.name}? More like ${repoData.stargazers_count} people accidentally clicked star. Your ${repoData.language || 'mystery'} code is so bad, even Stack Overflow refuses to help. ${repoData.open_issues_count} open issues and counting - at least the bugs are consistent.`
          }
        }
      }

      // Save roast to database
      try {
        const fingerprint = getUserFingerprint()
        const savedRoast = await roastOperations.saveRoast(
          mode === 'profile' ? input : username,
          roastResult.roast_text,
          mode,
          mode === 'repo' ? repoName : null,
          fingerprint
        )
        setRoast(savedRoast)
      } catch (dbError) {
        console.error('Database save error:', dbError)
        // Still show the roast even if save fails
        setRoast(roastResult)
      }

    } catch (err) {
      console.error('Roast generation error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    const roastText = roast?.roast_text || roast
    const target = profile?.login || `${repo?.owner?.login}/${repo?.name}`
    const shareText = `Just got roasted by GitRoaster!\n\n"${roastText}"\n\n@${target} | Check out GitRoaster for your own roast!`
    
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

  const handleCopy = () => {
    const roastText = roast?.roast_text || roast
    navigator.clipboard.writeText(roastText).then(() => {
      const originalTip = tip
      setTip('Roast copied to clipboard!')
      setTimeout(() => setTip(originalTip), 2000)
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = roastText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      const originalTip = tip
      setTip('Roast copied to clipboard!')
      setTimeout(() => setTip(originalTip), 2000)
    })
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'hall-of-shame':
        return <HallOfShame />
      case 'roast-of-day':
        return <RoastOfTheDay />
      default:
        return (
          <div className="roast-tab">
            <RoastForm onSubmit={handleRoastSubmit} loading={loading} />
            
            {error && <div className="error">{error}</div>}
            
            {!profile && !repo && !roast && !error && !loading && (
              <pre className="terminal-ascii">{`
   _____ _ _   _____                 _            
  / ____(_) | |  __ \               | |           
 | |  __ _| |_| |__) |___  ___ _ __ | |_ ___ _ __ 
 | | |_ | | __|  _  // _ \/ _ \ '_ \| __/ _ \ '__|
 | |__| | | |_| | \ \  __/  __/ | | | ||  __/ |   
  \_____|_|\__|_|  \_\___|\___|_| |_|\__\___|_|   
                                                   
              GitRoaster v2.0
            Now with voting and more!
`}</pre>
            )}
            
            {loading && (
              <div className="loading">
                <div className="loading-text">Analyzing and generating roast...</div>
                <div className="loading-bar">
                  <div className="loading-progress"></div>
                </div>
              </div>
            )}
            
            {roast && (
              <RoastDisplay
                roast={roast}
                profile={profile}
                repo={repo}
                onShare={handleShare}
                onCopy={handleCopy}
              />
            )}
          </div>
        )
    }
  }

  return (
    <div className="terminal-bg">
      <div className="terminal-window">
        <div className="terminal-header">
          GitRoaster v2.0
          <span className="version-badge">New Features!</span>
        </div>
        
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="terminal-content">
          {renderContent()}
        </div>
        
        <div className="terminal-tip">{tip}</div>
      </div>
    </div>
  )
}

export default App
