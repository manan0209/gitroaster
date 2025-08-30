import { useState, useEffect } from 'react'
import { roastOperations } from '../services/supabase'
import VoteButton from './VoteButton'

const HallOfShame = () => {
  const [roasts, setRoasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadHallOfShame = async () => {
      try {
        setLoading(true)
        const data = await roastOperations.getHallOfShame(10)
        setRoasts(data)
      } catch (error) {
        console.error('Error loading Hall of Shame:', error)
        setError('Failed to load Hall of Shame')
      } finally {
        setLoading(false)
      }
    }

    loadHallOfShame()
  }, [])

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
        <h3>Hall of Shame</h3>
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
              <VoteButton roastId={roast.id} initialVotes={roast.votes} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HallOfShame
