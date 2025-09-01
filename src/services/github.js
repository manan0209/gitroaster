const GITHUB_API = 'https://api.github.com'

export const githubService = {
 
  async getProfile(username) {
    const res = await fetch(`${GITHUB_API}/users/${username}`)
    if (!res.ok) throw new Error('GitHub user not found!')
    return res.json()
  },

 
  async getRepositories(username, perPage = 10) {
    const res = await fetch(`${GITHUB_API}/users/${username}/repos?sort=updated&per_page=${perPage}`)
    if (!res.ok) throw new Error('Could not fetch repos')
    return res.json()
  },

  
  async getRepository(username, repoName) {
    const res = await fetch(`${GITHUB_API}/repos/${username}/${repoName}`)
    if (!res.ok) throw new Error('Repository not found!')
    return res.json()
  },

 
  async getRepositoryContents(username, repoName, path = '') {
    const res = await fetch(`${GITHUB_API}/repos/${username}/${repoName}/contents/${path}`)
    if (!res.ok) return null
    return res.json()
  },

  
  async getRepositoryLanguages(username, repoName) {
    const res = await fetch(`${GITHUB_API}/repos/${username}/${repoName}/languages`)
    if (!res.ok) return {}
    return res.json()
  },

  
  async getRecentCommits(username, repoName, perPage = 10) {
    const res = await fetch(`${GITHUB_API}/repos/${username}/${repoName}/commits?per_page=${perPage}`)
    if (!res.ok) return []
    return res.json()
  }
}
