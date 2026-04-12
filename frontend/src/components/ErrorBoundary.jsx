import React from 'react'

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'DM Sans, system-ui, sans-serif', padding: 24 }}>
          <div style={{ fontSize: 64 }}>😕</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: '#78716c', margin: 0 }}>This dish isn't available right now. Please try again.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => window.location.href = '/home'}
              style={{ background: '#D85A30', color: 'white', border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              Go Home
            </button>
            <button onClick={() => window.location.reload()}
              style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              Retry
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
