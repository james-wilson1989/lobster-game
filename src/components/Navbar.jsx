import { Link, useLocation } from 'react-router-dom'
import { useWeb3Modal } from '../context/Web3ModalContext'
import { useGame } from '../context/GameContext'

export default function Navbar() {
  const { address, disconnectWallet } = useWeb3Modal()
  const { lobster } = useGame()
  const location = useLocation()

  const formatAddress = (addr) => {
    if (!addr) return '未连接'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const navLinks = [
    { path: '/', label: '首页' },
    { path: '/game', label: '养殖' },
    { path: '/leaderboard', label: '排行榜' },
  ]

  return (
    <nav className="bg-gray-900/90 backdrop-blur-sm mb-8 sticky top-0 z-50 mx-4 rounded-xl border border-gray-700">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/lobster.svg" alt="Logo" className="w-10 h-10" />
            <span className="text-2xl font-bold text-white">龙虾大亨</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-lg font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-orange-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {lobster && (
              <div className="hidden sm:flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-yellow-400">Lv.{lobster.level}</span>
                <span className="text-white">{lobster.name}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 text-sm">{formatAddress(address)}</span>
              <button
                onClick={disconnectWallet}
                className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded-lg"
              >
                断开
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
