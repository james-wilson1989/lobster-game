import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Game from './pages/Game'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import { loadConfig } from './utils/config'

function App() {
  const [configLoaded, setConfigLoaded] = useState(false)

  useEffect(() => {
    // 启动时加载外部配置
    loadConfig().then(() => {
      setConfigLoaded(true)
    })
  }, [])
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
