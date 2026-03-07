import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const GameContext = createContext()

const API_BASE = '/api'

export function GameProvider({ children }) {
  const [lobster, setLobster] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [walletAddress, setWalletAddress] = useState(null)

  // 从后端获取玩家数据
  const fetchPlayer = useCallback(async (address) => {
    if (!address) return
    
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/player/${address}`)
      const data = await res.json()
      
      if (data.success) {
        setLobster(data.data)
      } else if (data.message === '玩家不存在') {
        // 自动创建新玩家
        await createPlayer(address)
      }
    } catch (err) {
      console.error('获取玩家失败:', err)
      setError('无法连接到服务器')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 创建新玩家
  const createPlayer = async (address, name = '小青龙') => {
    try {
      const res = await fetch(`${API_BASE}/player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, lobsterName: name })
      })
      const data = await res.json()
      
      if (data.success) {
        setLobster(data.data)
      }
    } catch (err) {
      console.error('创建玩家失败:', err)
      setError('无法创建玩家')
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
      const res = await fetch(`${API_BASE}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: walletAddress, 
          tokenAmount,
          tokenAddress
        })
      })
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
      const res = await fetch(`${API_BASE}/claim-dividend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress })
      })
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
