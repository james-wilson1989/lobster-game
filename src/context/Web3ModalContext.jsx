import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork, useConfig } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

const Web3ModalContext = createContext()

export function Web3ModalProvider({ children }) {
  const config = useConfig()
  const { address, isConnected, status } = useAccount({ config })
  const { connect } = useConnect({ config })
  const { disconnect } = useDisconnect({ config })
  const { chain } = useNetwork({ config })
  const { switchNetwork } = useSwitchNetwork({ config })

  const [isModalOpen, setIsModalOpen] = useState(false)

  // 连接钱包
  const connectWallet = useCallback(async () => {
    try {
      await connect({ connector: new InjectedConnector() })
      setIsModalOpen(false)
    } catch (error) {
      console.error('连接钱包失败:', error)
    }
  }, [connect])

  // 断开钱包
  const disconnectWallet = useCallback(() => {
    disconnect()
  }, [disconnect])

  // 切换网络
  const changeNetwork = useCallback(async (chainId) => {
    if (switchNetwork) {
      switchNetwork(chainId)
    }
  }, [switchNetwork])

  // 打开连接模态框
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  // 钱包连接后保存地址并触发事件
  useEffect(() => {
    if (address) {
      localStorage.setItem('walletAddress', address)
      window.dispatchEvent(new CustomEvent('walletConnected', { detail: address }))
    } else {
      localStorage.removeItem('walletAddress')
    }
  }, [address])

  return (
    <Web3ModalContext.Provider value={{
      address,
      isConnected,
      status,
      chain,
      connectWallet,
      disconnectWallet,
      changeNetwork,
      isModalOpen,
      openModal,
      closeModal,
      Chains: { BSC: 56, ETH: 1, POLYGON: 137 }
    }}>
      {children}
    </Web3ModalContext.Provider>
  )
}

export function useWeb3Modal() {
  const context = useContext(Web3ModalContext)
  if (!context) {
    throw new Error('useWeb3Modal must be used within a Web3ModalProvider')
  }
  return context
}
