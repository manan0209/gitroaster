import { useState } from 'react'

const TabBar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'roast', label: 'Roast', icon: '>' },
    { id: 'hall-of-shame', label: 'Hall of Shame', icon: '#' },
    { id: 'roast-of-day', label: 'Roast of Day', icon: '*' }
  ]

  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

export default TabBar
