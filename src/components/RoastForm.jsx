import { useState } from 'react'

const RoastForm = ({ onSubmit, loading }) => {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('profile') // 'profile' or 'repo'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    if (mode === 'profile') {
      onSubmit(input.trim(), 'profile')
    } else {
      // Parse username/repo format
      const parts = input.trim().split('/')
      if (parts.length !== 2) {
        alert('Repository format should be: username/repository-name')
        return
      }
      onSubmit(input.trim(), 'repo', parts[0], parts[1])
    }
  }

  const getPlaceholder = () => {
    return mode === 'profile' ? 'octocat' : 'octocat/Hello-World'
  }

  const getLabel = () => {
    return mode === 'profile' 
      ? '$ github-roast [username]'
      : '$ repo-roast [username/repository]'
  }

  return (
    <div className="roast-form">
      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'profile' ? 'active' : ''}`}
          onClick={() => setMode('profile')}
          disabled={loading}
        >
          Profile
        </button>
        <button
          className={`mode-btn ${mode === 'repo' ? 'active' : ''}`}
          onClick={() => setMode('repo')}
          disabled={loading}
        >
          Repository
        </button>
      </div>
      
      <form className="terminal-form" onSubmit={handleSubmit}>
        <label htmlFor="input">{getLabel()}</label>
        <input
          id="input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={getPlaceholder()}
          autoFocus
          required
          autoComplete="off"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? 'Roasting...' : 'Roast It!'}
        </button>
      </form>
    </div>
  )
}

export default RoastForm
