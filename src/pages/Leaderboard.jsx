import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWeb3Modal } from '../context/Web3ModalContext'
import { useContractWrite, useWaitForTransaction, useContractRead } from 'wagmi'
import { parseEther } from 'viem'
import { GameConfig, loadConfig } from '../utils/config'

// Vault ABI - 只包含需要用到的函数
const VAULT_ABI = [
  {
    name: 'claimDividend',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    name: 'getPendingDividend',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'isTopPlayer',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  }
]

export default function Leaderboard() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('all')
  const [vaultAddress, setVaultAddress] = useState('')
  const [claimStatus, setClaimStatus] = useState('idle') // idle, claiming, success, error
  const [claimTxHash, setClaimTxHash] = useState('')
  const [claimError, setClaimError] = useState('')
  const [pendingDividend, setPendingDividend] = useState('0')

  const { address, isConnected } = useWeb3Modal()
  const { writeContractAsync } = useContractWrite({
    mode: 'recklesslyUnprepared'
  })
  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: claimTxHash,
    query: {
      enabled: !!claimTxHash
    }
  })

  // 读取配置获取 Vault 地址
  useEffect(() => {
    loadConfig().then(config => {
      setVaultAddress(config.vaultAddress || '')
    })
  }, [])

  // 监听交易成功
  useEffect(() => {
    if (isSuccess && claimStatus === 'claiming') {
      setClaimStatus('success')
      setPendingDividend('0')
    }
  }, [isSuccess])

  // 读取待领取分红
  const { data: pendingData } = useContractRead({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'getPendingDividend',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!vaultAddress && vaultAddress !== '0x0000000000000000000000000000000000000000'
    }
  })

  useEffect(() => {
    if (pendingData) {
      setPendingDividend(pendingData.toString())
    }
  }, [pendingData])

  // 领取分红
  const handleClaimDividend = async () => {
    if (!isConnected) {
      alert('请先连接钱包')
      return
    }

    if (!vaultAddress || vaultAddress === '0x0000000000000000000000000000000000000000') {
      alert('Vault 地址未配置')
      return
    }

    try {
      setClaimStatus('claiming')
      setClaimError('')

      const txHash = await writeContractAsync({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'claimDividend',
        args: []
      })

      setClaimTxHash(txHash)
    } catch (error) {
      console.error('领取分红失败:', error)
      setClaimError(error.message || '领取失败')
      setClaimStatus('error')
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [timeFilter])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/leaderboard?filter=' + timeFilter)
      const result = await response.json()
      if (result.success) {
        setPlayers(result.data)
      } else {
        setPlayers([])
      }
    } catch (error) {
      console.error('获取排行榜失败:', error)
      setPlayers([])
    }
    setLoading(false)
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return rank
    }
  }

  const getRankClass = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-500/20 border-yellow-500'
      case 2: return 'bg-gray-400/20 border-gray-400'
      case 3: return 'bg-orange-600/20 border-orange-600'
      default: return 'bg-white/5 border-white/10'
    }
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* 领取分红区域 */}
        {isConnected && vaultAddress && vaultAddress !== '0x0000000000000000000000000000000000000000' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-8 text-center"
          >
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">💰 分红领取</h2>
            
            {claimStatus === 'success' ? (
              <div className="text-green-400 text-lg mb-4">
                ✅ 分红领取成功！
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <span className="text-gray-400">可领取：</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    {pendingDividend && pendingDividend !== '0' 
                      ? (Number(pendingDividend) / 1e18).toFixed(6) 
                      : '0'
                    } BNB
                  </span>
                </div>
                
                {claimStatus === 'error' && (
                  <div className="text-red-400 mb-4 text-sm">
                    ❌ {claimError || '领取失败'}
                  </div>
                )}
                
                <button
                  onClick={handleClaimDividend}
                  disabled={claimStatus === 'claiming' || isConfirming || !pendingDividend || pendingDividend === '0'}
                  className={`px-8 py-3 rounded-lg font-bold text-lg transition-all ${
                    pendingDividend && pendingDividend !== '0'
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {claimStatus === 'claiming' || isConfirming 
                    ? '⏳ 交易确认中...' 
                    : pendingDividend && pendingDividend !== '0' 
                      ? '🎁 领取分红' 
                      : '暂无分红可领'
                  }
                </button>
              </>
            )}
            
            {!isConnected && (
              <div className="text-gray-400">
                请先连接钱包查看分红
              </div>
            )}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏆 排行榜</h1>
          <p className="text-gray-400">全球最强龙虾养殖者</p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="glass-card p-1 rounded-lg flex">
            {[{ id: 'all', label: '总榜' }, { id: 'daily', label: '今日' }, { id: 'weekly', label: '本周' }].map((filter) => (
              <button key={filter.id} onClick={() => setTimeFilter(filter.id)} className={`px-6 py-2 rounded-lg transition-all ${timeFilter === filter.id ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-5 gap-6 p-4 bg-white/10 text-gray-400 font-bold">
            <div className="text-center">排名</div>
            <div>玩家</div>
            <div className="text-center">等级</div>
            <div className="text-center">龙虾名称</div>
            <div className="text-right">总经验</div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl animate-spin">⏳</div>
              <p className="text-gray-400 mt-4">加载中...</p>
            </div>
          ) : (
            players.map((player, index) => (
              <motion.div key={player.rank} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="grid grid-cols-5 gap-6 p-4 border-b border-white/10 hover:bg-white/5 items-center">
                <div className="text-center">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 ${player.rank <= 3 ? 'text-2xl' : 'text-lg font-bold'} ${getRankClass(player.rank)}`}>
                    {getRankIcon(player.rank)}
                  </span>
                </div>
                <div className="text-white font-mono break-all text-sm">{player.address}</div>
                <div className="text-center">
                  <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-bold whitespace-nowrap">Lv.{player.level}</span>
                </div>
                <div className="text-center text-gray-300">{player.lobsterName}</div>
                <div className="text-right text-yellow-400 font-bold">{player.totalExp.toLocaleString()}</div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
