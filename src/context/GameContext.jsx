import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const GameContext = createContext()

// 使用环境变量或默认空字符串
const API_BASE = import.meta.env.VITE_API_URL || ''

export function GameProvider({ children }) {
  const [lobster, setLobster] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [walletAddress, setWalletAddress] = useState(null)
  const [isApiConnected, setIsApiConnected] = useState(false)

  // 从后端获取玩家数据
  const fetchPlayer = useCallback(async (address) => {
    if (!address) return
    
    setIsLoading(true)
    try {
      const apiUrl = API_BASE ? `${API_BASE}/api/player/${address}` : `/api/player/${address}`
      const res = await fetch(apiUrl)
      
      // 检查响应状态
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      
      const data = await res.json()
      
      if (data.success) {
        setLobster(data.data)
        setIsApiConnected(true)
      } else if (data.message === '玩家不存在') {
        // 自动创建新玩家
        await createPlayer(address)
      }
    } catch (err) {
      console.error('获取玩家失败:', err)
      setError('无法连接到服务器 - 使用本地模式')
      setIsApiConnected(false)
      // 尝试从本地存储加载
      const saved = localStorage.getItem(`lobster_${address.toLowerCase()}`)
      if (saved) {
        try {
          setLobster(JSON.parse(saved))
        } catch (e) {
          // 本地没有数据，创建新玩家
          await createPlayerLocal(address)
        }
      } else {
        await createPlayerLocal(address)
      }
    } finally {
      setIsLoading(false)
    }
  }, [API_BASE])

  // 本地模式创建玩家
  const createPlayerLocal = async (address, name = '小青龙') => {
    const localPlayer = {
      id: address.toLowerCase(),
      address: address.toLowerCase(),
      lobsterName: name,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      totalExperience: 0,
      dailyDividend: 0,
      totalEarned: 0,
      lastFeedTime: 0,
      todayFeedCount: 0,
      lastFeedDate: ''
    }
    setLobster(localPlayer)
    localStorage.setItem(`lobster_${address.toLowerCase()}`, JSON.stringify(localPlayer))
  }

  // 创建新玩家
  const createPlayer = async (address, name = '小青龙') => {
    try {
      const apiUrl = API_BASE ? `${API_BASE}/api/player` : '/api/player'
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, lobsterName: name })
      })
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      
      const data = await res.json()
      
      if (data.success) {
        setLobster(data.data)
        setIsApiConnected(true)
      }
    } catch (err) {
      console.error('创建玩家失败:', err)
      // API 失败时创建本地玩家
      await createPlayerLocal(address, name)
      setError('无法连接到服务器 - 使用本地模式')
    }
  }

  // 喂养龙虾 - 调用后端 API
  const feedLobster = async (tokenAmount, tokenAddress = '') => {
    if (!walletAddress) {
      setError('请先连接钱包')
      return false
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const apiUrl = API_BASE ? `${API_BASE}/api/feed` : '/api/feed'
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: walletAddress, 
          tokenAmount,
          tokenAddress
        })
      })
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      
      const data = await res.json()
      
      if (data.success) {
        setLobster(data.data.player)
        return true
      } else {
        setError(data.message || '喂养失败')
        return false
      }
    } catch (err) {
      console.error('喂养失败:', err)
      // 本地模式：更新本地数据
      const currentLobster = lobster || JSON.parse(localStorage.getItem(`lobster_${walletAddress.toLowerCase()}`) || '{}')
      if (currentLobster && currentLobster.level) {
        const expGain = tokenAmount * 10
        let newExp = currentLobster.experience + expGain
        let newLevel = currentLobster.level
        let newExpToNext = currentLobster.experienceToNextLevel
        
        while (newExp >= newExpToNext) {
          newExp -= newExpToNext
          newLevel += 1
          newExpToNext = Math.floor(newExpToNext * 1.5)
        }
        
        const dailyDividend = Math.floor(newLevel * newLevel * 10)
        const updatedLobster = {
          ...currentLobster,
          level: newLevel,
          experience: newExp,
          experienceToNextLevel: newExpToNext,
          totalExperience: currentLobster.totalExperience + expGain,
          dailyDividend,
          lastFeedTime: Date.now(),
          todayFeedCount: (currentLobster.todayFeedCount || 0) + 1
        }
        setLobster(updatedLobster)
        localStorage.setItem(`lobster_${walletAddress.toLowerCase()}`, JSON.stringify(updatedLobster))
        setError('本地模式：数据已保存到浏览器')
        return true
      }
      setError('网络错误，请稍后重试')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // 提取分红 - 调用后端 API
  const claimDividend = async () => {
    if (!walletAddress) {
      setError('请先连接钱包')
      return false
    }

    if (!lobster || lobster.dailyDividend <= 0) {
      setError('没有可提取的分红')
      return false
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const apiUrl = API_BASE ? `${API_BASE}/api/claim-dividend` : '/api/claim-dividend'
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress })
      })
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      
      const data = await res.json()
      
      if (data.success) {
        setLobster(data.data.player)
        return true
      } else {
        setError(data.message || '提取分红失败')
        return false
      }
    } catch (err) {
      console.error('提取分红失败:', err)
      // 本地模式
      if (lobster) {
        const updatedLobster = {
          ...lobster,
          dailyDividend: 0,
          totalEarned: (lobster.totalEarned || 0) + lobster.dailyDividend
        }
        setLobster(updatedLobster)
        localStorage.setItem(`lobster_${walletAddress.toLowerCase()}`, JSON.stringify(updatedLobster))
        setError('本地模式：数据已保存到浏览器')
        return true
      }
      setError('网络错误，请稍后重试')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // 初始化 - 等待钱包地址
  useEffect(() => {
    // 监听钱包地址变化
    const checkAddress = () => {
      // 从 localStorage 获取钱包地址（由 Web3ModalContext 设置）
      const savedAddress = localStorage.getItem('walletAddress')
      if (savedAddress && savedAddress !== walletAddress) {
        setWalletAddress(savedAddress)
        fetchPlayer(savedAddress)
      }
    }

    checkAddress()
    
    // 定期检查钱包地址变化
    const interval = setInterval(checkAddress, 1000)
    return () => clearInterval(interval)
  }, [walletAddress, fetchPlayer])

  // 监听自定义事件（当钱包连接时）
  useEffect(() => {
    const handleWalletConnected = (event) => {
      const address = event.detail
      if (address) {
        setWalletAddress(address)
        fetchPlayer(address)
      }
    }

    window.addEventListener('walletConnected', handleWalletConnected)
    return () => window.removeEventListener('walletConnected', handleWalletConnected)
  }, [fetchPlayer])

  return (
    <GameContext.Provider value={{
      lobster,
      isLoading,
      error,
      feedLobster,
      claimDividend,
      isConnected: !!walletAddress,
      address: walletAddress,
      refreshPlayer: () => fetchPlayer(walletAddress)
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
