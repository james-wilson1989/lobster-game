import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { WagmiConfig } from 'wagmi'
import { Web3ModalProvider } from './context/Web3ModalContext'
import { GameProvider } from './context/GameContext'
import App from './App'
import './index.css'
import { config } from './utils/wagmiConfig'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <WagmiConfig config={config}>
        <Web3ModalProvider>
          <GameProvider>
            <App />
          </GameProvider>
        </Web3ModalProvider>
      </WagmiConfig>
    </BrowserRouter>
  </React.StrictMode>
)
