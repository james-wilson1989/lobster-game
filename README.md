# 🦞 龙虾大亨 - Web3区块链养殖游戏

一个基于Web3的龙虾养成游戏，玩家通过连接钱包，使用代币喂养龙虾，等级越高获得的分红越多！

## ✨ 功能特性

- 🔗 **Web3钱包连接** - 支持MetaMask和WalletConnect
- 🪙 **代币支付** - 检查钱包代币余额，支付喂养费用
- 🦞 **龙虾养成** - 喂养获得经验，升级提高分红
- 💰 **每日分红** - 根据等级获取分红收益
- 🏆 **排行榜** - 与全球玩家竞争

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- MetaMask钱包插件（或支持的钱包）

### 安装步骤

1. **克隆项目**

```bash
cd lobster-game
```

2. **安装前端依赖**

```bash
npm install
```

3. **安装后端依赖**

```bash
cd backend
npm install
cd ..
```

4. **配置项目**

编辑 `src/utils/config.js` 文件，配置你的代币信息：

```javascript
export const GameConfig = {
  tokenAddress: '0xYOUR_TOKEN_ADDRESS', // 你的代币合约地址
  tokenDecimals: 18,
  tokenSymbol: 'LBC', // 你的代币符号
  feedCost: 1,
  dividendRate: 10,
  gameContractAddress: '0xYOUR_GAME_WALLET_ADDRESS' // 游戏运营钱包地址
}
```

编辑 `src/utils/wagmiConfig.js`，设置WalletConnect项目ID：

```javascript
projectId: 'YOUR_WALLETCONNECT_PROJECT_ID'
```

5. **启动后端服务器**

```bash
# 在一个终端中
cd backend
npm start
```

后端将在 http://localhost:5000 运行

6. **启动前端开发服务器**

```bash
# 在另一个终端中
npm run dev
```

前端将在 http://localhost:3000 运行

## 🎮 游戏玩法

1. **连接钱包** - 访问首页，点击"连接钱包"
2. **喂养龙虾** - 进入游戏页面，输入代币数量喂养
3. **升级分红** - 龙虾升级后，每日分红增加
4. **提取收益** - 点击提取分红按钮
5. **排行榜竞争** - 查看全球玩家排名

## 📁 项目结构

```
lobster-game/
├── public/
│   └── lobster.svg          # 龙虾图标
├── src/
│   ├── components/
│   │   └── Navbar.jsx       # 导航栏
│   ├── context/
│   │   ├── GameContext.jsx       # 游戏状态管理
│   │   └── Web3ModalContext.jsx   # Web3钱包状态
│   ├── pages/
│   │   ├── Home.jsx         # 首页/登录页
│   │   ├── Game.jsx         # 游戏主页
│   │   ├── Leaderboard.jsx  # 排行榜
│   │   └── Profile.jsx      # 个人资料
│   ├── utils/
│   │   ├── config.js        # 游戏配置
│   │   └── wagmiConfig.js   # Web3配置
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── backend/
│   ├── server.js            # Express后端服务器
│   └── package.json
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🔧 技术栈

- **前端**: React + Vite
- **样式**: Tailwind CSS
- **Web3**: wagmi + ethers.js
- **动画**: Framer Motion
- **后端**: Express.js + SQLite
- **区块链**: EVM兼容链 (BSC, Ethereum, Polygon)

## 📝 配置说明

### 智能合约交互

游戏需要与你的代币合约交互。需要确保代币合约实现ERC20标准。

```javascript
// 需要的ERC20函数
- balanceOf(address) -> uint256
- transfer(address to, uint256 amount) -> bool
- decimals() -> uint8
```

### 网络配置

支持的网络：
- BSC (Chain ID: 56)
- Ethereum (Chain ID: 1)
- Polygon (Chain ID: 137)

## ⚠️ 注意事项

1. **测试网建议先在测试网测试** (BSC Testnet, Sepolia等)
2. **确保钱包中有足够的代币** 用于喂养
3. **确保钱包中有少量BNB/ETH** 用于支付Gas费用
4. **WalletConnect项目ID** 需要在 https://cloud.walletconnect.com 注册获取

## 📄 许可证

MIT License
