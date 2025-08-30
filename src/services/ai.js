const AI_API = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

export const aiService = {
  // Generate profile roast
  async generateProfileRoast(profile, repoAnalysis) {
    const prompt = `You are a savage, hilarious GitHub roaster. Analyze this developer's profile and BRUTALLY roast them based on their actual projects and coding patterns. Be mercilessly funny but clever.

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

    return this.callAI(prompt)
  },

  // Generate repository roast
  async generateRepositoryRoast(repo, languages, commits, contents) {
    const readmeContent = contents?.find(file => 
      file.name.toLowerCase().includes('readme')
    )?.content || 'No README found'

    const commitMessages = commits.slice(0, 5).map(c => c.commit.message).join(', ')

    const prompt = `You are a savage code reviewer who roasts repositories mercilessly. Analyze this specific repository and BRUTALLY roast it based on the actual code, commits, and project structure.

REPOSITORY: ${repo.name}
- Description: ${repo.description || 'No description'}
- Stars: ${repo.stargazers_count}
- Forks: ${repo.forks_count}
- Language: ${repo.language || 'Unknown'}
- Size: ${repo.size} KB
- Issues: ${repo.open_issues_count}
- Last updated: ${repo.updated_at}
- Created: ${repo.created_at}

LANGUAGES: ${Object.keys(languages).join(', ') || 'None detected'}

RECENT COMMITS: ${commitMessages || 'No recent commits'}

README CONTENT: ${readmeContent.length > 500 ? readmeContent.substring(0, 500) + '...' : readmeContent}

ROAST THIS REPOSITORY specifically. Focus on the code quality, commit messages, documentation, project structure, and actual implementation. Be savage about naming conventions, lack of tests, poor documentation, or questionable architectural decisions. Keep it SHORT and BRUTAL - 2-3 sentences maximum:`

    return this.callAI(prompt)
  },

  // Call AI API
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
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 150,
        top_p: 1,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`)
    }

    const data = await response.json()
    const roastText = data.choices?.[0]?.message?.content?.trim()
    
    if (!roastText || roastText.length < 50) {
      throw new Error('AI returned empty or invalid response')
    }

    return roastText
  }
}
