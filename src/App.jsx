import { useState } from 'react';
import './App.css';

const GITHUB_API = 'https://api.github.com/users/'
const GITHUB_REPOS_API = 'https://api.github.com/users/'
const AI_API = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

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
];

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
  ];
  return brutalRoasts[Math.floor(Math.random() * brutalRoasts.length)];
};

const funTips = [
  "Tip: Don't take it personally. Even Linus gets roasted!",
  "Pro tip: The more you code, the more you get roasted.",
  "Remember: It's all in good fun!",
  "Roasts are AI-generated. Blame the robots, not me!",
  "Share your roast with friends for maximum laughs."
];


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
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [roast, setRoast] = useState('')
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [tip, setTip] = useState(funTips[Math.floor(Math.random() * funTips.length)])

  const shareRoast = () => {
    const shareText = `🔥 Just got roasted by GitRoaster! 🔥\n\n"${roast}"\n\n@${profile?.login} | Check out GitRoaster for your own roast!`
    
    if (navigator.share) {
      
      navigator.share({
        title: 'GitRoaster - My GitHub Roast',
        text: shareText,
        url: window.location.href
      }).catch(console.error)
    } else {
      
      navigator.clipboard.writeText(shareText).then(() => {
        
        const originalTip = tip
        setTip('🔥 Roast copied to clipboard! Share it with your friends!')
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
      setTip('📋 Roast copied to clipboard!')
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
      setTip('📋 Roast copied to clipboard!')
      setTimeout(() => setTip(originalTip), 2000)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setRoast('')
    setProfile(null)
    setTip(funTips[Math.floor(Math.random() * funTips.length)])
    
    try {
      console.log('Testing API key...', GROQ_API_KEY ? 'Key present' : 'No key')
      
      
      const res = await fetch(GITHUB_API + username)
      if (!res.ok) throw new Error('GitHub user not found!')
      const profile = await res.json()
      setProfile(profile)
      
      
      console.log('Analyzing repositories...')
      const repoAnalysis = await analyzeRepositories(username)
      console.log('Repository analysis:', repoAnalysis)
      
     
      const contextualPrompt = `You are a savage, hilarious GitHub roaster. Analyze this developer's profile and BRUTALLY roast them based on their actual projects and coding patterns. Be mercilessly funny but clever.

PROFILE:
- Username: @${profile.login}
- Name: ${profile.name || 'No name set'}
- Bio: ${profile.bio || 'No bio'}
- Repos: ${profile.public_repos}
- Followers: ${profile.followers}
- Following: ${profile.following}
- Joined: ${new Date(profile.created_at).getFullYear()}

REPOSITORY ANALYSIS:
- Languages used: ${repoAnalysis.languages?.join(', ') || 'Unknown'}
- Total stars across all repos: ${repoAnalysis.totalStars || 0}
- Total forks: ${repoAnalysis.totalForks || 0}
- Project types: ${repoAnalysis.projectTypes?.join(', ') || 'Mysterious projects'}
- Recent activity: ${repoAnalysis.recentActivity ? 'Yes' : 'Nope, probably gave up'}
- Sample projects: ${repoAnalysis.projectDescriptions?.slice(0, 3).map(p => `"${p.name}" (${p.stars} stars)`).join(', ') || 'Nothing worth mentioning'}

ROAST THEM BRUTALLY based on their actual projects, language choices, naming conventions, star counts, and coding patterns. Make it personal, savage, but hilarious. Focus on their actual work, not just numbers. Keep it SHORT and PUNCHY - maximum 2-3 sentences that hit hard:`
      
      const aiRes = await fetch(AI_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama3-8b-8192", 
          messages: [
            {
              role: "user",
              content: contextualPrompt
            }
          ],
          temperature: 0.9,
          max_tokens: 150, 
          top_p: 1,
          stream: false
        })
      })
      
      if (!aiRes.ok) {
        const errorText = await aiRes.text()
        console.error('AI API Error:', aiRes.status, errorText)
        
        if (aiRes.status === 401) {
          setRoast(`AI authentication failed! Using backup roast:\n\n${getPersonalizedFallback(profile)}`)
          return
        }
        
        setRoast(`AI service unavailable. Here's a roast based on your repos:\n\n${getPersonalizedFallback(profile)}`)
        return
      }
      
      const aiData = await aiRes.json()
      console.log('AI response:', aiData)
      
      let roastText = ''
      if (aiData.choices && aiData.choices[0]?.message?.content) {
        roastText = aiData.choices[0].message.content.trim()
      }
      
      if (!roastText || roastText.length < 50) {
        roastText = getPersonalizedFallback(profile)
      }
      
      setRoast(roastText)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="terminal-bg">
      <div className="terminal-window">
        <div className="terminal-header">GitRoaster v1.0</div>
        <form className="terminal-form" onSubmit={handleSubmit}>
          <label htmlFor="username">$ github-roast <span style={{color:'#ffb86c'}}>[username]</span></label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="octocat"
            autoFocus
            required
            autoComplete="off"
          />
          <button type="submit" disabled={loading || !username}>
            {loading ? 'Roasting...' : 'Roast Me!'}
          </button>
        </form>
        <div className="terminal-output">
          {error && <div className="error">{error}</div>}
          {!profile && !roast && !error && (
            <pre className="terminal-ascii">{`
   _____ _ _   _____                 _            
  / ____(_) | |  __ \               | |           
 | |  __ _| |_| |__) |___  ___ _ __ | |_ ___ _ __ 
 | | |_ | | __|  _  // _ \/ _ \ '_ \| __/ _ \ '__|
 | |__| | | |_| | \ \  __/  __/ | | | ||  __/ |   
  \_____|_|\__|_|  \_\___|\___|_| |_|\__\___|_|   
`}</pre>
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
          {roast && (
            <div className="roast-container">
              <div className="roast-header">
                <span className="roast-title">🔥 Your Roast</span>
                <button className="copy-btn" onClick={copyRoast} title="Copy roast">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
              <div className="roast">{roast}</div>
              <button className="share-btn" onClick={shareRoast}>
                🔥 Share This Roast
              </button>
            </div>
          )}
        </div>
        <div className="terminal-tip">{tip}</div>
      </div>
    </div>
  )
}

export default App
