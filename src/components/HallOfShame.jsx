import { useState, useEffect } from 'react'
import { roastOperations } from '../services/supabase'
import VoteButton from './VoteButton'

const HallOfShame = () => {
  const [roasts, setRoasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadHallOfShame = async () => {
    try {
      setLoading(true)
      const data = await roastOperations.getHallOfShame(10)
      console.log('Loaded Hall of Shame data:', data)
      setRoasts(data)
      setError('')
    } catch (error) {
      console.error('Error loading Hall of Shame:', error)
      setError('Failed to load Hall of Shame')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHallOfShame()
  }, [])

  const handleVoteUpdate = () => {
    // Refresh the hall of shame when a vote is cast
    console.log('Vote update detected, refreshing Hall of Shame...')
    loadHallOfShame()
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
  }

  const truncateRoast = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="hall-of-shame">
        <div className="loading">Loading Hall of Shame...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="hall-of-shame">
        <div className="error">{error}</div>
      </div>
    )
  }

  if (roasts.length === 0) {
    return (
      <div className="hall-of-shame">
        <div className="empty-state">
          <pre className="ascii-art">{`
    ┌─────────────────────┐
    │   HALL OF SHAME     │
    │                     │
    │   No roasts yet...  │
    │   Be the first!     │
    └─────────────────────┘
          `}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className="hall-of-shame">
      <div className="hall-header">
        <div className="hall-title-row">
          <h3>Hall of Shame</h3>
          <button 
            className="refresh-btn" 
            onClick={loadHallOfShame}
            disabled={loading}
            title="Refresh rankings"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20" stroke="currentColor" strokeWidth="2"/>
              <path d="M20 12L17 9M20 12L17 15" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
        <p>Top voted roasts of all time</p>
      </div>
      
      <div className="roast-list">
        {roasts.map((roast, index) => (
          <div key={roast.id} className="roast-item">
            <div className="roast-rank">#{index + 1}</div>
            <div className="roast-content">
              <div className="roast-meta">
                <span className="roast-target">
                  @{roast.username}
                  {roast.repo_name && <span className="repo-name">/{roast.repo_name}</span>}
                </span>
                <span className="roast-type">
                  {roast.roast_type === 'repo' ? 'repo' : 'profile'}
                </span>
                <span className="roast-time">{formatTimeAgo(roast.created_at)}</span>
              </div>
              <div className="roast-text">{truncateRoast(roast.roast_text)}</div>
            </div>
            <div className="roast-votes">
              <VoteButton 
                roastId={roast.id} 
                initialVotes={roast.votes} 
                onVoteUpdate={handleVoteUpdate}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HallOfShame
