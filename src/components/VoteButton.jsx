import { useState, useEffect } from 'react'
import { roastOperations } from '../services/supabase'
import { getUserFingerprint } from '../services/fingerprint'

const VoteButton = ({ roastId, initialVotes = 0, onVoteUpdate }) => {
  const [votes, setVotes] = useState(initialVotes)
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(false)

  console.log('VoteButton rendered with roastId:', roastId, 'initialVotes:', initialVotes)

  // Update votes when initialVotes changes (from parent refresh)
  useEffect(() => {
    setVotes(initialVotes)
  }, [initialVotes])

  useEffect(() => {
    // Skip vote status check for now due to 406 errors
    // The database constraint will prevent duplicate votes
    console.log('Skipping vote status check to avoid 406 errors')
  }, [roastId])

  const handleVote = async () => {
    if (hasVoted || loading) return

    setLoading(true)
    try {
      const fingerprint = getUserFingerprint()
      console.log('Voting for roast:', roastId, 'with fingerprint:', fingerprint)
      
      // Check rate limit
      const voteCount = await roastOperations.getUserVoteCount(fingerprint, 1)
      console.log('Current vote count for user:', voteCount)
      
      if (voteCount >= 20) {
        alert('Vote limit reached. Try again later.')
        return
      }

      const updatedRoast = await roastOperations.voteRoast(roastId, fingerprint)
      console.log('Vote successful, updated roast:', updatedRoast)
      
      setVotes(updatedRoast.votes)
      setHasVoted(true)
      
      // Call the callback to update parent component
      if (onVoteUpdate) {
        onVoteUpdate(updatedRoast)
      }
    } catch (error) {
      console.error('Detailed voting error:', error)
      
      if (error.message.includes('Already voted')) {
        setHasVoted(true)
        alert('You have already voted on this roast!')
      } else {
        console.error('Error voting:', error)
        alert(`Failed to vote: ${error.message}`)
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
