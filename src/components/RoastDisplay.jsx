import { useState } from 'react'
import VoteButton from './VoteButton'

const RoastDisplay = ({ roast, profile, repo, onShare, onCopy }) => {
  if (!roast) return null

  return (
    <div className="roast-container">
      {profile && (
        <div className="profile-card">
          <img src={profile.avatar_url} alt="avatar" className="avatar" />
          <div className="profile-info">
            <span className="profile-name">{profile.name || profile.login}</span>
            <span className="profile-username">@{profile.login}</span>
            <div className="profile-stats">
              <span>Repos: {profile.public_repos}</span>
              <span>Followers: {profile.followers}</span>
              <span>Following: {profile.following}</span>
            </div>
          </div>
        </div>
      )}

      {repo && (
        <div className="repo-card">
          <div className="repo-info">
            <span className="repo-name">{repo.name}</span>
            <span className="repo-full-name">{repo.full_name}</span>
            <div className="repo-stats">
              <span>Stars: {repo.stargazers_count}</span>
              <span>Forks: {repo.forks_count}</span>
              <span>Language: {repo.language || 'Unknown'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="roast-content">
        <div className="roast-header">
          <span className="roast-title">Your Roast</span>
          <div className="roast-actions">
            {roast.id && <VoteButton roastId={roast.id} initialVotes={roast.votes} />}
            <button className="copy-btn" onClick={onCopy} title="Copy roast">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="roast">{roast.roast_text || roast}</div>
        <button className="share-btn" onClick={onShare}>
          Share This Roast
        </button>
      </div>
    </div>
  )
}

export default RoastDisplay
