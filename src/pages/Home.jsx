import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWeb3Modal } from '../context/Web3ModalContext'

export default function Home() {
  const { address, isConnected, connectWallet } = useWeb3Modal()

  const formatAddress = (addr) => `${addr?.slice(0, 6)}...${addr?.slice(-4)}`

  const features = [
    { title: 'Web3养殖', desc: '连接钱包，养育你的专属龙虾', icon: '🦞' },
    { title: '代币喂养', desc: '使用代币喂养，等级越高分红越多', icon: '🪙' },
    { title: '每日分红', desc: '根据龙虾等级获取每日分红收益', icon: '💰' },
    { title: '排行榜', desc: '与全球玩家竞争，展示你的实力', icon: '🏆' }
  ]

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="mb-8">
          <img src="/lobster.svg" alt="龙虾大亨" className="w-32 h-32 mx-auto" />
          <h1 className="text-5xl font-bold text-white mt-4 mb-2">龙虾大亨</h1>
          <p className="text-xl text-gray-300">Web3 区块链养殖游戏</p>
        </div>

        {isConnected ? (
          <div className="glass-card p-8 max-w-md mx-auto">
            <div className="text-green-400 text-lg mb-4">✓ 已连接钱包</div>
            <div className="text-white mb-2">地址: {formatAddress(address)}</div>
            <Link to="/game" className="glass-button gold-button inline-block mt-4 text-lg">
              进入游戏 →
            </Link>
          </div>
        ) : (
          <div className="glass-card p-8 max-w-md mx-auto">
            <h2 className="text-2xl text-white mb-6">立即开始游戏</h2>
            <button onClick={connectWallet} className="glass-button gold-button w-full text-lg py-4">
              🦊 连接 MetaMask 钱包
            </button>
            <p className="text-gray-400 text-sm mt-4">请安装 MetaMask 钱包插件</p>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }} className="glass-card p-6 text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl text-white font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
