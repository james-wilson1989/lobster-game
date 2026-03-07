// 游戏配置 - 从外部文件读取
let cachedConfig = null

const defaultConfig = {
  // 这些是默认值
  tokenAddress: '0x0000000000000000000000000000000000000000',
  tokenDecimals: 18,
  tokenSymbol: 'TEST',
  feedCost: 1,
  dividendRate: 10,
  baseExpRequired: 100,
  expMultiplier: 1.5,
  gameContractAddress: '0x0000000000000000000000000000000000000000',
  vaultAddress: '0x0000000000000000000000000000000000000000',
  chainId: 97,
  rpcUrl: 'https://bsc-testnet.publicnode.com',
  minFeedAmount: 1,
  maxFeedAmount: 100,
  dailyFeedLimit: 10
}

export const GameConfig = { ...defaultConfig }

// 从 URL 参数获取配置覆盖
function getUrlConfig() {
  const params = new URLSearchParams(window.location.search)
  const urlConfig = {}
  
  const keys = [
    'tokenAddress', 'tokenDecimals', 'tokenSymbol', 'feedCost',
    'dividendRate', 'baseExpRequired', 'expMultiplier',
    'gameContractAddress', 'vaultAddress', 'chainId', 'rpcUrl',
    'minFeedAmount', 'maxFeedAmount', 'dailyFeedLimit'
  ]
  
  keys.forEach(key => {
    const value = params.get(key)
    if (value !== null) {
      // 数字类型转换
      if (['tokenDecimals', 'feedCost', 'dividendRate', 'baseExpRequired', 'chainId', 'minFeedAmount', 'maxFeedAmount', 'dailyFeedLimit'].includes(key)) {
        urlConfig[key] = Number(value)
      } else if (key === 'expMultiplier') {
        urlConfig[key] = parseFloat(value)
      } else {
        urlConfig[key] = value
      }
    }
  })
  
  if (Object.keys(urlConfig).length > 0) {
    console.log('🔗 从URL加载配置:', urlConfig)
  }
  return urlConfig
}

// 异步加载外部配置
export async function loadConfig() {
  if (cachedConfig) return cachedConfig

  // 先获取URL参数覆盖
  const urlConfig = getUrlConfig()

  try {
    // 优先从后端 API 获取配置
    const response = await fetch('/api/config')
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data) {
        cachedConfig = { ...defaultConfig, ...data.data, ...urlConfig }
        Object.assign(GameConfig, cachedConfig)
        console.log('✅ 配置加载成功 (from API):', GameConfig)
        return cachedConfig
      }
    }
  } catch (err) {
    console.warn('⚠️ 无法从API加载配置，尝试静态文件...')
  }

  try {
    // 备选：从 public/config.json 获取
    const response = await fetch('/config.json')
    if (response.ok) {
      const config = await response.json()
      cachedConfig = { ...defaultConfig, ...config, ...urlConfig }
      Object.assign(GameConfig, cachedConfig)
      console.log('✅ 配置加载成功 (from file):', GameConfig)
    }
  } catch (err) {
    console.warn('⚠️ 无法加载外部配置，使用默认配置:', err)
  }

  // 最后应用URL参数覆盖
  if (Object.keys(urlConfig).length > 0) {
    cachedConfig = { ...cachedConfig, ...urlConfig }
    Object.assign(GameConfig, cachedConfig)
  }

  return GameConfig
}

// 导出默认配置（同步使用）
export default GameConfig
