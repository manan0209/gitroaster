const GITHUB_API = 'https://api.github.com'

export const githubService = {
  // Get user profile
  async getProfile(username) {
    const res = await fetch(`${GITHUB_API}/users/${username}`)
    if (!res.ok) throw new Error('GitHub user not found!')
    return res.json()
  },

  // Get user repositories
  async getRepositories(username, perPage = 10) {
    const res = await fetch(`${GITHUB_API}/users/${username}/repos?sort=updated&per_page=${perPage}`)
    if (!res.ok) throw new Error('Could not fetch repos')
    return res.json()
  },

  // Get specific repository
  async getRepository(username, repoName) {
    const res = await fetch(`${GITHUB_API}/repos/${username}/${repoName}`)
    if (!res.ok) throw new Error('Repository not found!')
    return res.json()
  },

  // Get repository contents (README, etc.)
  async getRepositoryContents(username, repoName, path = '') {
    const res = await fetch(`${GITHUB_API}/repos/${username}/${repoName}/contents/${path}`)
    if (!res.ok) return null
    return res.json()
  },

  // Get repository languages
  async getRepositoryLanguages(username, repoName) {
    const res = await fetch(`${GITHUB_API}/repos/${username}/${repoName}/languages`)
    if (!res.ok) return {}
    return res.json()
  },

  // Get recent commits
  async getRecentCommits(username, repoName, perPage = 10) {
    const res = await fetch(`${GITHUB_API}/repos/${username}/${repoName}/commits?per_page=${perPage}`)
    if (!res.ok) return []
    return res.json()
  }
}
