import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWeb3Modal } from '../context/Web3ModalContext'
import { useGame } from '../context/GameContext'
import { GameConfig, loadConfig } from '../utils/config'
import { erc20ABI } from '../utils/erc20ABI'
import { useContractWrite } from 'wagmi'

export default function Game() {
  const { address, isConnected, status: walletStatus } = useWeb3Modal()
  const { lobster, feedLobster, isLoading, error } = useGame()
  const [feedAmount, setFeedAmount] = useState(1)
  const [txStatus, setTxStatus] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenBalance, setTokenBalance] = useState(null)
  const [checkingBalance, setCheckingBalance] = useState(false)

  // 等待钱包状态加载完成
  const isWalletLoading = walletStatus === 'loading'

  // 创始人钱包地址
  const FOUNDER_ADDRESS = '0x01db37579e55ce13f4504019025e36047bdad845'

  // 合约写入
  const { writeContractAsync } = useContractWrite()

  // 检查代币余额
  const checkTokenBalance = async () => {
    if (!tokenAddress || !address) {
      setTxStatus('请输入代币合约地址')
      return
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
      setTxStatus('无效的合约地址')
      return
    }

    setCheckingBalance(true)
    setTxStatus('正在检查代币余额...')
    
    try {
      // 这里需要用 wagmi 来读取代币余额
      // 暂时显示提示信息
      setTxStatus(`代币地址已设置: ${tokenAddress.slice(0,6)}...${tokenAddress.slice(-4)}`)
      setTokenBalance('已连接')
    } catch (err) {
      setTxStatus('检查余额失败: ' + err.message)
    } finally {
      setCheckingBalance(false)
    }
  }

  // 处理喂养 - 先转账到创始人钱包，再记录到后端
  const handleFeed = async () => {
    if (!isConnected) {
      alert('请先连接钱包')
      return
    }

    if (!tokenAddress) {
      setTxStatus('请先输入代币合约地址')
      return
    }

    // 验证数量
    const amount = parseInt(feedAmount)
    if (isNaN(amount) || amount < (GameConfig.minFeedAmount || 1)) {
      setTxStatus('喂养数量太少')
      return
    }
    if (amount > (GameConfig.maxFeedAmount || 100)) {
      setTxStatus('喂养数量超出上限')
      return
    }

    // 检查每日限制
    const dailyLimit = GameConfig.dailyFeedLimit || 10
    const todayFeedCount = lobster?.todayFeedCount || 0
    if (todayFeedCount >= dailyLimit) {
      setTxStatus('今日喂养次数已用完')
      return
    }

    setTxStatus('正在发起转账...')

    try {
      // 将代币数量转为小单位（假设18位小数）
      const tokenAmountWei = BigInt(amount) * BigInt(10 ** 18)

      // 1. 先发起代币转账到创始人钱包
      const txHash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20ABI,
        functionName: 'transfer',
        args: [FOUNDER_ADDRESS, tokenAmountWei]
      })

      setTxStatus('转账已发起，等待确认...')

      // 2. 等待几秒后调用后端记录
      setTimeout(async () => {
        const success = await feedLobster(feedAmount, tokenAddress)
        if (success) {
          setTxStatus('喂养成功！🦞 代币已转到创始人钱包')
        } else {
          setTxStatus('转账成功但记录失败，请联系管理员')
        }
      }, 5000) // 等待5秒让交易确认

    } catch (err) {
      console.error('转账失败:', err)
      if (err.message && err.message.includes('用户取消')) {
        setTxStatus('已取消转账')
      } else {
        setTxStatus('转账失败: ' + (err.message || '未知错误'))
      }
      return
    }
  }

  // 计算经验进度
  const expProgress = lobster 
    ? (lobster.experience / lobster.experienceToNextLevel) * 100 
    : 0

  // 计算预计获得经验
  const expectedExp = feedAmount * 10

  // 每日限制
  const dailyLimit = GameConfig.dailyFeedLimit || 10
  const todayFeedCount = lobster?.todayFeedCount || 0
  const remainingFeeds = dailyLimit - todayFeedCount
  const maxFeedAmount = GameConfig.maxFeedAmount || 100
  const minFeedAmount = GameConfig.minFeedAmount || 1

  // 检查是否还能喂养
  const canFeed = remainingFeeds > 0

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        {/* 钱包状态加载中 */}
        {isWalletLoading ? (
          <div className="glass-card p-12 text-center">
            <div className="text-6xl mb-6">⏳</div>
            <h2 className="text-3xl text-white font-bold mb-4">正在加载...</h2>
            <p className="text-gray-400">请稍候，正在检查钱包连接状态</p>
          </div>
        ) : !isConnected ? (
          <div className="glass-card p-12 text-center">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-3xl text-white font-bold mb-4">请先连接钱包</h2>
            <p className="text-gray-400 mb-6">连接钱包后可开始养殖你的龙虾</p>
            <a href="/" className="glass-button gold-button inline-block text-lg px-8 py-3">
              连接钱包
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：龙虾展示 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl text-white font-bold mb-6 text-center">
                {lobster?.name || '我的龙虾'}
              </h2>
              
              {/* 龙虾图片 */}
              <div className="relative flex justify-center mb-8">
                <img 
                  src="/lobster.svg" 
                  alt="龙虾" 
                  className={`w-48 h-48 ${lobster ? 'animate-bounce' : ''}`}
                />
                {lobster && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-black font-bold px-3 py-1 rounded-full">
                    Lv.{lobster.level}
                  </div>
                )}
              </div>

              {/* 等级进度条 */}
              {lobster && (
                <div className="mb-6">
                  <div className="flex justify-between text-white mb-2">
                    <span>等级 {lobster.level}</span>
                    <span>升级需要 {lobster.experienceToNextLevel} 经验</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill experience-fill" 
                      style={{ width: `${expProgress}%` }}
                    />
                  </div>
                  <div className="text-center text-gray-400 mt-2">
                    {lobster.experience} / {lobster.experienceToNextLevel} 经验
                  </div>
                </div>
              )}

              {/* 统计数据 */}
              {lobster && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg text-center">
                    <div className="text-gray-400 text-sm">总经验</div>
                    <div className="text-white text-xl font-bold">{lobster.totalExperience}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg text-center">
                    <div className="text-gray-400 text-sm">今日分红</div>
                    <div className="text-yellow-400 text-xl font-bold">{lobster.dailyDividend} LBC</div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* 右侧：喂养和分红 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* 代币配置 */}
              <div className="glass-card p-6">
                <h3 className="text-xl text-white font-bold mb-4 flex items-center">
                  <img src="/token.svg" alt="代币" className="w-5 h-5 mr-2" />
                  代币合约设置
                </h3>
                
                <div className="mb-4">
                  <label className="text-gray-400 block mb-2">代币合约地址 (ERC-20)</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="0x..."
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-sm font-mono"
                    />
                    <button
                      onClick={checkTokenBalance}
                      disabled={checkingBalance}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors"
                    >
                      {checkingBalance ? '...' : '确认'}
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    输入你要使用的代币合约地址 (例如 USDT, USDC 等)
                  </p>
                </div>

                {tokenBalance && (
                  <div className="bg-white/5 p-3 rounded-lg">
                    <span className="text-green-400">✓ 代币已设置</span>
                  </div>
                )}
              </div>

              {/* 代币余额 */}
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl text-white font-bold flex items-center">
                    <img src="/token.svg" alt="代币" className="w-6 h-6 mr-2" />
                    代币余额
                  </h3>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl font-bold text-yellow-400">
                    {tokenAddress ? `${tokenAddress.slice(0,6)}...${tokenAddress.slice(-4)}` : '未设置'}
                  </div>
                  <div className="text-gray-400">{GameConfig.tokenSymbol}</div>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  {tokenAddress ? '使用真实代币喂养' : '请先在上方设置代币合约地址'}
                </p>
              </div>

              {/* 喂养区域 */}
              <div className="glass-card p-6">
                <h3 className="text-xl text-white font-bold mb-4">🦞 喂养龙虾</h3>
                
                {/* 喂养限制提示 */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">今日喂养:</span>
                    <span className={canFeed ? 'text-blue-400' : 'text-red-400'}>
                      {todayFeedCount} / {dailyLimit} 次
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-400">每次金额:</span>
                    <span className="text-gray-300">{minFeedAmount} - {maxFeedAmount}</span>
                  </div>
                  {!canFeed && (
                    <div className="text-red-400 text-sm mt-2 text-center">
                      ⚠️ 今日喂养次数已用完，明天再来吧！
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="text-gray-400 block mb-2">喂养数量 (每次 {minFeedAmount}-{maxFeedAmount})</label>
                  <div className="flex space-x-2">
                    {[1, 5, 10, Math.min(50, maxFeedAmount)].filter((v, i, a) => v <= maxFeedAmount && a.indexOf(v) === i).map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setFeedAmount(amount)}
                        className={`flex-1 py-2 rounded-lg transition-all ${
                          feedAmount === amount
                            ? 'bg-red-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <input
                      type="number"
                      min={minFeedAmount}
                      max={maxFeedAmount}
                      value={feedAmount}
                      onChange={(e) => {
                        let val = parseInt(e.target.value) || minFeedAmount
                        if (val < minFeedAmount) val = minFeedAmount
                        if (val > maxFeedAmount) val = maxFeedAmount
                        setFeedAmount(val)
                      }}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-center text-xl"
                    />
                  </div>
                </div>

                {/* 预计收益 */}
                <div className="bg-white/5 p-4 rounded-lg mb-4">
                  <div className="flex justify-between text-gray-400 mb-2">
                    <span>消耗代币:</span>
                    <span className="text-white">{feedAmount} {GameConfig.tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>获得经验:</span>
                    <span className="text-green-400">+{expectedExp} XP</span>
                  </div>
                </div>

                {/* 喂养按钮 */}
                <button
                  onClick={handleFeed}
                  disabled={isLoading || !canFeed}
                  className={`glass-button w-full py-4 text-lg ${!canFeed ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? '处理中...' : !canFeed ? '🚫 今日次数已用完' : `🦞 喂养 (${feedAmount} ${GameConfig.tokenSymbol})`}
                </button>

                {/* 状态提示 */}
                {txStatus && (
                  <div className={`mt-4 p-3 rounded-lg text-center ${
                    txStatus.includes('成功') ? 'bg-green-500/20 text-green-400' :
                    txStatus.includes('失败') ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {txStatus}
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-center">
                    {error}
                  </div>
                )}
              </div>

              {/* 分红区域 */}
              {lobster && lobster.dailyDividend > 0 && (
                <div className="glass-card p-6 glow-effect">
                  <h3 className="text-xl text-white font-bold mb-4">💎 每日分红</h3>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-yellow-500 mb-2">
                      {lobster.dailyDividend}
                    </div>
                    <div className="text-gray-400">{GameConfig.tokenSymbol} / 天</div>
                  </div>
                  <button className="glass-button gold-button w-full py-3">
                    💰 提取分红
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
