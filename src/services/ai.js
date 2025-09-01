const AI_API = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY


const cleanResponse = (text) => {
  if (!text) return text
  
  return text
    
    .replace(/```[\s\S]*?```/g, '')     
    .replace(/`{3,}[\s\S]*?`{3,}/g, '') 
    
    
    .replace(/\*\*([^*]+)\*\*/g, '$1')  
    .replace(/\*([^*]+)\*/g, '$1')      
    .replace(/__([^_]+)__/g, '$1')     
    .replace(/_([^_]+)_/g, '$1')        
    
    
    .replace(/^#{1,6}\s+/gm, '')        
    
    
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  
    
    
    .replace(/`([^`]+)`/g, '$1')        
    
    
    .replace(/\s+/g, ' ')               
    .replace(/\n\s*\n/g, '\n')          
    .trim()                            
}

export const aiService = {
  
  async generateProfileRoast(profile, repoAnalysis) {
    const prompt = `You are the most savage, brutal GitHub roaster on the internet. Your roasts are legendary for being mercilessly funny and cutting deep. Analyze this developer and DESTROY them with brutal honesty.

TARGET: @${profile.login}
- Real name: ${profile.name || 'Too ashamed to share their real name'}
- Bio: ${profile.bio || 'Too boring to write a bio'}
- Public repos: ${profile.public_repos}
- Followers: ${profile.followers} (probably bots)
- Following: ${profile.following}
- Account age: ${new Date().getFullYear() - new Date(profile.created_at).getFullYear()} years
- Location: ${profile.location || 'Hiding in shame'}

BRUTAL EVIDENCE:
- Languages: ${repoAnalysis.languages?.join(', ') || 'Speaks no programming languages'}
- Total stars: ${repoAnalysis.totalStars || 0} (across ALL repos - pathetic)
- Total forks: ${repoAnalysis.totalForks || 0} (nobody wants your code)
- Project quality: ${repoAnalysis.projectTypes?.join(', ') || 'Unidentifiable garbage'}
- Recent activity: ${repoAnalysis.recentActivity ? 'Still failing actively' : 'Gave up like a quitter'}
- Top projects: ${repoAnalysis.projectDescriptions?.slice(0, 3).map(p => `"${p.name}" (${p.stars} stars - LOL)`).join(', ') || 'Nothing worth showing'}

ROAST INSTRUCTIONS:
- Be SAVAGE and PERSONAL about their actual coding choices
- Mock their project names, languages, and commit patterns
- Be brutal about their follower-to-repo ratio
- Roast their bio, name choices, and GitHub profile
- Make fun of specific evidence from their repos
- Be hilariously mean but clever
- 3-5 sentences of pure destruction
- Include multiple angles of attack
- End with a devastating punchline

ROAST:`

    return this.callAI(prompt)
  },

  async generateRepositoryRoast(repo, languages, commits, contents) {
    let readmeContent = 'No README (because documenting code is for losers, right?)'
    let hasReadme = false
    
    if (contents && Array.isArray(contents)) {
      const readmeFile = contents.find(file => 
        file.name.toLowerCase().match(/^readme\.(md|txt|rst)$/)
      )
      if (readmeFile) {
        hasReadme = true
        try {
          if (readmeFile.download_url) {
            const readmeRes = await fetch(readmeFile.download_url)
            if (readmeRes.ok) {
              const fullContent = await readmeRes.text()
              readmeContent = fullContent.length > 300 ? fullContent.substring(0, 300) + '...' : fullContent
            }
          }
        } catch (e) {
          readmeContent = `Has README but it's probably just "# ${repo.name}" and nothing else`
        }
      }
    }

    const languageList = Object.keys(languages || {})
    const commitMessages = commits?.slice(0, 5)?.map(c => c.commit.message)?.join(' | ') || 'No commits (scared to commit?)'
    
    const fileTypes = contents?.map(f => f.name)?.join(', ') || 'Unknown files'
    
    const prompt = `You are a legendary code reviewer known for absolutely DESTROYING repositories with savage, brutal roasts. This dev thinks their repo is good - prove them wrong.

REPOSITORY AUTOPSY: "${repo.name}"
- Owner: ${repo.owner?.login || 'Anonymous coward'}
- Description: "${repo.description || 'Too lazy to describe their own code'}"
- Stars: ${repo.stargazers_count} (wow, so popular!)
- Forks: ${repo.forks_count} (people actually cloned this disaster)
- Primary language: ${repo.language || 'Language? What language? Assembly?'}
- Size: ${repo.size}KB (${repo.size > 10000 ? 'bloated monster' : 'tiny disappointment'})
- Open issues: ${repo.open_issues_count} (bugs galore!)
- Created: ${new Date(repo.created_at).toLocaleDateString()} (${Math.floor((Date.now() - new Date(repo.created_at)) / (1000*60*60*24*365))} years of disappointment)
- Last update: ${new Date(repo.updated_at).toLocaleDateString()}

EVIDENCE OF INCOMPETENCE:
- Languages detected: ${languageList.length ? languageList.join(', ') : 'None (not even HTML)'}
- Has README: ${hasReadme ? 'Yes (probably useless)' : 'NO (documentation is for the weak)'}
- README content: ${readmeContent}
- Recent commits: ${commitMessages}
- File structure: ${fileTypes}
- Watchers: ${repo.watchers_count} (people actually watch this trainwreck)

ROAST INSTRUCTIONS:
- SAVAGE the actual code quality and architecture
- Mock the commit messages if they're generic
- Brutalize the README (or lack thereof)
- Roast the project name and description
- Be brutal about the language choices
- Mock the star/fork ratio
- Destroy their documentation skills
- 3-5 sentences of pure devastation
- Include multiple brutal angles
- Make it specific to THIS repository

ROAST:`

    return this.callAI(prompt)
  },

  async callAI(prompt) {
    if (!GROQ_API_KEY) {
      throw new Error('AI API key not configured')
    }

    const response = await fetch(AI_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 250,
        top_p: 1,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`)
    }

    const data = await response.json()
    const roastText = data.choices?.[0]?.message?.content?.trim()
    
    if (!roastText || roastText.length < 30) {
      throw new Error('AI returned empty or invalid response')
    }

    return cleanResponse(roastText)
  }
}
