import { useState, useEffect } from 'react'
import { roastOperations } from '../services/supabase'
import { getUserFingerprint } from '../services/fingerprint'

const VoteButton = ({ roastId, initialVotes = 0 }) => {
  const [votes, setVotes] = useState(initialVotes)
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkVoteStatus = async () => {
      try {
        const fingerprint = getUserFingerprint()
        const voted = await roastOperations.hasVoted(roastId, fingerprint)
        setHasVoted(voted)
      } catch (error) {
        console.error('Error checking vote status:', error)
      }
    }

    if (roastId) {
      checkVoteStatus()
    }
  }, [roastId])

  const handleVote = async () => {
    if (hasVoted || loading) return

    setLoading(true)
    try {
      const fingerprint = getUserFingerprint()
      
      // Check rate limit
      const voteCount = await roastOperations.getUserVoteCount(fingerprint, 1)
      if (voteCount >= 20) {
        alert('Vote limit reached. Try again later.')
        return
      }

      const updatedRoast = await roastOperations.voteRoast(roastId, fingerprint)
      setVotes(updatedRoast.votes)
      setHasVoted(true)
    } catch (error) {
      if (error.message.includes('Already voted')) {
        setHasVoted(true)
      } else {
        console.error('Error voting:', error)
        alert('Failed to vote. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className={`vote-btn ${hasVoted ? 'voted' : ''}`}
      onClick={handleVote}
      disabled={hasVoted || loading}
      title={hasVoted ? 'Already voted' : 'Vote for this roast'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 14L12 9L17 14H7Z" fill="currentColor"/>
      </svg>
      <span>{votes}</span>
    </button>
  )
}

export default VoteButton
