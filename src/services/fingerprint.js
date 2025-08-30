// Generate a browser fingerprint for anonymous user tracking
export const generateFingerprint = () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.fillText('GitRoaster fingerprint', 2, 2)
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|')
  
  // Simple hash function
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36)
}

// Get or create stored fingerprint
export const getUserFingerprint = () => {
  const stored = localStorage.getItem('gitroaster_fingerprint')
  if (stored) return stored
  
  const newFingerprint = generateFingerprint()
  localStorage.setItem('gitroaster_fingerprint', newFingerprint)
  return newFingerprint
}
