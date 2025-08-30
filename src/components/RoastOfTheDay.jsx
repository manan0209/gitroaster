import { useState, useEffect } from 'react'
import { roastOperations } from '../services/supabase'
import VoteButton from './VoteButton'

const RoastOfTheDay = () => {
  const [roast, setRoast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadRoastOfTheDay = async () => {
      try {
        setLoading(true)
        const data = await roastOperations.getRoastOfTheDay()
        setRoast(data)
      } catch (error) {
        console.error('Error loading Roast of the Day:', error)
        setError('Failed to load Roast of the Day')
      } finally {
        setLoading(false)
      }
    }

    loadRoastOfTheDay()
  }, [])

  if (loading) {
    return (
      <div className="roast-of-day">
        <div className="loading">Loading Roast of the Day...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="roast-of-day">
        <div className="error">{error}</div>
      </div>
    )
  }

  if (!roast) {
    return (
      <div className="roast-of-day">
        <div className="empty-state">
          <pre className="ascii-art">{`
    ┌─────────────────────┐
    │   ROAST OF THE DAY  │
    │                     │
    │   No roast today... │
    │   Check back later! │
    └─────────────────────┘
          `}</pre>
          <p>The daily roast will be selected from yesterday's most voted roasts.</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="roast-of-day">
      <div className="daily-header">
        <h3>Roast of the Day</h3>
        <p>{formatDate(new Date())}</p>
      </div>
      
      <div className="featured-roast">
        <div className="crown">👑</div>
        <div className="roast-card">
          <div className="roast-meta">
            <span className="roast-target">
              @{roast.username}
              {roast.repo_name && <span className="repo-name">/{roast.repo_name}</span>}
            </span>
            <span className="roast-type">
              {roast.roast_type === 'repo' ? 'repository' : 'profile'} roast
            </span>
          </div>
          <div className="roast-text">{roast.roast_text}</div>
          <div className="roast-actions">
            <VoteButton roastId={roast.id} initialVotes={roast.votes} />
            <span className="winner-badge">Daily Winner</span>
          </div>
        </div>
      </div>
      
      <div className="daily-info">
        <p>This roast was selected as yesterday's most voted. New daily roast updates at midnight UTC.</p>
      </div>
    </div>
  )
}

export default RoastOfTheDay
