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
    const prompt = `DEVELOPER DESTRUCTION PROTOCOL INITIATED

You are the ULTIMATE GitHub roasting machine - a digital assassin armed with wit sharper than a segfault and humor darker than a production server crash at 3 AM. You're about to absolutely DEMOLISH this developer's entire existence with comedic precision that would make a stand-up comedian weep.

 TARGET LOCKED: @${profile.login}
 ALIAS: ${profile.name || 'Too embarrassed to share their real identity'}  
 BIO ANALYSIS: "${profile.bio || 'Bio so boring they left it blank - classic move'}"
 COORDINATES: ${profile.location || 'Hiding in a basement somewhere'}

 PATHETIC DIGITAL FOOTPRINT:
 Repos: ${profile.public_repos} (quantity ≠ quality, my friend)
 Followers: ${profile.followers} (probably your alt accounts)
 Following: ${profile.following} (desperately seeking validation)
 Account Age: ${new Date().getFullYear() - new Date(profile.created_at).getFullYear()} years (of documented failure)

 CRIMINAL CODING EVIDENCE:
 Languages: ${repoAnalysis.languages?.join(', ') || 'Speaks fluent Google Translate'}
 Total Stars: ${repoAnalysis.totalStars || 0} (across ALL repos - your mom's proud though)
 Total Forks: ${repoAnalysis.totalForks || 0} (nobody wants to touch this with a 10-foot pointer)
 Project Types: ${repoAnalysis.projectTypes?.join(', ') || 'Unidentified coding objects'}
 Activity Status: ${repoAnalysis.recentActivity ? 'Still committing crimes against code' : 'Gave up faster than Internet Explorer loading'}
 Top Disasters: ${repoAnalysis.projectDescriptions?.slice(0, 3).map(p => `"${p.name}" (${p.stars} stars - participation trophy)`).join(', ') || 'Nothing worth mentioning (shocking)'}

 ROASTING OBJECTIVES:
1. ANNIHILATE their username like it's a memory leak
2. OBLITERATE their bio/name choices with surgical precision  
3. SAVAGE their follower-to-repo ratio like it's legacy code
4. DESTROY their language choices and project names
5. BRUTALIZE their star count with zero mercy
6. DEMOLISH their coding patterns and repo themes
7. Use ABSURD ANALOGIES and MEME-WORTHY COMPARISONS
8. Channel the energy of a disappointed senior developer
9. Be so funny they'll share it while dying inside
10. End with a SOUL-CRUSHING PUNCHLINE

⚡ COMEDY REQUIREMENTS:
- Roast them like they just pushed to main without a PR
- Use developer humor, internet culture, and coding disasters
- Make comparisons to broken code, failed startups, and tech disasters  
- Be CREATIVELY BRUTAL but hilariously entertaining
- Include their actual stats and choices, not generic insults
- 4-6 sentences of pure comedic annihilation
- End with something so savage it becomes their GitHub bio

 EXECUTE MAXIMUM ROAST:`

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
    
    const prompt = ` PROJECT DESTRUCTION PROTOCOL 9000 ACTIVATED 

You are the ULTIMATE project roaster - part code reviewer, part business consultant, part comedian, and 100% SAVAGE. You don't just roast code - you ANNIHILATE entire project concepts, business models, and life choices. You're about to deliver a MULTI-DIMENSIONAL BEATDOWN that covers everything from the code to the cosmic irrelevance of this project.

 TARGET ACQUIRED: "${repo.name}"
 PROJECT PERPETRATOR: ${repo.owner?.login} (RIP their dignity)
 PROJECT DELUSION: "${repo.description || 'Too ashamed to describe this fever dream'}"

 PATHETIC STATISTICS:
 Stars: ${repo.stargazers_count} (charity stars from relatives)
 Forks: ${repo.forks_count} (nobody wants to inherit this mess)
 Language: ${repo.language || 'Ancient hieroglyphics'}
 Size: ${repo.size}KB (${repo.size > 10000 ? 'more bloated than a Thanksgiving dinner' : 'tinier than their chances of success'})
 Issues: ${repo.open_issues_count} (bugs or features? We may never know)
 Age: ${Math.floor((Date.now() - new Date(repo.created_at)) / (1000*60*60*24*365))} years (of wasted electricity)
 Watchers: ${repo.watchers_count} (digital rubberneckers)

 FORENSIC EVIDENCE:
 Tech Stack: ${languageList.length ? languageList.join(', ') : 'Powered by tears and regret'}
 Documentation: ${hasReadme ? 'EXISTS (probably copy-pasted from a tutorial)' : 'MISSING (explaining this would break the Geneva Convention)'}
${hasReadme ? '📖 README Analysis: "' + readmeContent.substring(0, 150) + (readmeContent.length > 150 ? '..." (More riveting than watching paint dry)' : '"') : ''}
 Commit Poetry: "${commitMessages}"
 File Architecture: ${fileTypes.substring(0, 100)}${fileTypes.length > 100 ? '... (digital hoarding at its finest)' : ''}

 PROJECT ANNIHILATION OBJECTIVES:
1. SAVAGE the project name like it personally insulted your ancestors
2. DEMOLISH the entire concept and its place in the universe
3. OBLITERATE the business case and market viability  
4. DESTROY the target audience (do they even exist?)
5. BRUTALIZE the technical choices and architecture
6. ANNIHILATE the commit messages and development process
7. ROAST the README's attempt at explaining this catastrophe
8. MOCK the competition (spoiler: there isn't any because nobody wants this)
9. QUESTION their life choices that led to this moment
10. COMPARE it to other disasters in human history

 PROJECT ROASTING DIMENSIONS:
 BUSINESS IMPACT: Roast the market need, target users, monetization potential
 CONCEPT ORIGINALITY: Mock if it's the 47th todo app or another blockchain cat game
 REAL-WORLD VALUE: Question if humanity is better or worse off with this existing
 EXECUTION QUALITY: Savage the gap between vision and reality
 COMMERCIAL VIABILITY: Destroy any dreams of this making money
 INNOVATION LEVEL: Compare to revolutionary projects (spoiler: it's not even close)

⚡ ROASTING STYLE REQUIREMENTS:
- Channel the energy of a venture capitalist rejecting a pitch while eating popcorn
- Compare their project to historical failures, abandoned startups, and extinct species
- Mock the very existence and purpose of this project in the grand scheme of things
- Use BUSINESS HUMOR mixed with technical roasting
- Question why this exists when better alternatives are available
- Be so funny about the concept that VCs will share this roast
- Include jokes about market research, user interviews, and product-market fit (or lack thereof)
- 5-7 sentences of pure project concept destruction
- End with a punchline that questions their career path

 EXECUTE PROJECT OBLITERATION:`

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
        temperature: 0.95,
        max_tokens: 400,
        top_p: 1,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`)
    }

    const data = await response.json()
    const roastText = data.choices?.[0]?.message?.content?.trim()
    
    if (!roastText || roastText.length < 20) {
      throw new Error('AI returned empty or invalid response')
    }

    // Clean up the response before returning
    return cleanResponse(roastText)
  }
}
