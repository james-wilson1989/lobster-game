import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { WagmiConfig } from 'wagmi'
import { Web3ModalProvider } from './context/Web3ModalContext'
import { GameProvider } from './context/GameContext'
import App from './App'
import './index.css'
import { config } from './utils/wagmiConfig'

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          color: 'white',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️ 应用加载失败</h1>
          <div style={{
            background: 'rgba(255,0,0,0.2)',
            padding: '20px',
            borderRadius: '10px',
            maxWidth: '600px',
            wordBreak: 'break-all'
          }}>
            <p style={{ color: '#ff6b6b' }}>{this.state.error?.message || '未知错误'}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#E53935',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 全局错误监听
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error)
})

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason)
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <WagmiConfig config={config}>
          <Web3ModalProvider>
            <GameProvider>
              <App />
            </GameProvider>
          </Web3ModalProvider>
        </WagmiConfig>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
