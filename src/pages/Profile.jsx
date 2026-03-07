import { useState } from 'react'
import { useWeb3Modal } from '../context/Web3ModalContext'
import { useGame } from '../context/GameContext'
import { motion } from 'framer-motion'

const API_URL = ''

export default function Profile() {
  const { address, chain, disconnectWallet } = useWeb3Modal()
  const { lobster, fetchPlayer } = useGame()
  const [activeTab, setActiveTab] = useState('stats')
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  const formatAddress = (addr) => `${addr?.slice(0, 6)}...${addr?.slice(-4)}`

  const transactions = [
    { id: 1, type: 'feed', amount: 10, exp: 100, time: '2024-01-15 14:30' },
    { id: 2, type: 'dividend', amount: 50, time: '2024-01-14 12:00' },
    { id: 3, type: 'feed', amount: 5, exp: 50, time: '2024-01-13 09:15' },
  ]

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-3xl">🦞</div>
              <div>
                <h2 className="text-2xl text-white font-bold">{lobster?.lobsterName || '未命名龙虾'}</h2>
                <p className="text-gray-400 font-mono">{formatAddress(address)}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-yellow-400 text-3xl font-bold">Lv.{lobster?.level || 1}</div>
              <div className="text-gray-400">等级</div>
            </div>
          </div>
        </motion.div>

        <div className="flex space-x-4 mb-6">
          {[
            { id: 'stats', label: '📊 数据统计' },
            { id: 'history', label: '📜 历史记录' },
            { id: 'settings', label: '⚙️ 设置' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 glass-card p-4 text-center transition-all ${activeTab === tab.id ? 'bg-red-500/20 border-red-500' : ''}`}>
              <span className="text-lg">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'stats' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-6 text-center">
              <div className="text-3xl text-yellow-400 font-bold mb-2">{lobster?.totalExperience || 0}</div>
              <div className="text-gray-400">总经验</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl text-red-400 font-bold mb-2">{lobster?.level || 1}</div>
              <div className="text-gray-400">等级</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl text-green-400 font-bold mb-2">{lobster?.dailyDividend || 0}</div>
              <div className="text-gray-400">今日分红</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl text-blue-400 font-bold mb-2">{lobster?.totalEarned || 0}</div>
              <div className="text-gray-400">累计收益</div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'feed' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                    {tx.type === 'feed' ? '🦞' : '💰'}
                  </div>
                  <div>
                    <div className="text-white font-bold">{tx.type === 'feed' ? '喂养' : '分红提取'}</div>
                    <div className="text-gray-400 text-sm">{tx.time}</div>
                  </div>
                </div>
                <div className={`font-bold ${tx.type === 'feed' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {tx.type === 'feed' ? `-${tx.amount} LBC` : `+${tx.amount} LBC`}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="glass-card p-6">
              <h3 className="text-xl text-white font-bold mb-4">修改龙虾名称</h3>
              {editingName ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="输入新名字（2-12字）"
                    maxLength={12}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={async () => {
                        if (!newName.trim() || newName.length < 2 || newName.length > 12) {
                          alert('名字长度需2-12个字符')
                          return
                        }
                        setSaving(true)
                        try {
                          const res = await fetch(`${API_URL}/api/player`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ address, lobsterName: newName.trim() })
                          })
                          const data = await res.json()
                          if (data.success) {
                            await fetchPlayer(address)
                            setEditingName(false)
                            setNewName('')
                          } else {
                            alert(data.message || '修改失败')
                          }
                        } catch (e) {
                          alert('网络错误')
                        }
                        setSaving(false)
                      }}
                      disabled={saving}
                      className="flex-1 bg-green-500/80 hover:bg-green-500 text-white py-3 rounded-lg disabled:opacity-50"
                    >
                      {saving ? '保存中...' : '保存'}
                    </button>
                    <button
                      onClick={() => { setEditingName(false); setNewName('') }}
                      className="flex-1 bg-gray-500/80 hover:bg-gray-500 text-white py-3 rounded-lg"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingName(true); setNewName(lobster?.lobsterName || '') }}
                  className="w-full bg-blue-500/80 hover:bg-blue-500 text-white py-3 rounded-lg"
                >
                  修改名称
                </button>
              )}
            </div>
            <div className="glass-card p-6">
              <h3 className="text-xl text-white font-bold mb-4">账户操作</h3>
              <button onClick={disconnectWallet} className="w-full bg-red-500/80 hover:bg-red-500 text-white py-3 rounded-lg">
                断开钱包连接
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
