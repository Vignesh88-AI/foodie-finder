import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiRefreshCw } from 'react-icons/fi'
import FoodAvatar from '../components/FoodAvatar'

const SUGGESTIONS = [
  '🍛 How do I make butter chicken?',
  '🥗 Give me a quick veg recipe for dinner',
  '🍝 What goes well with spaghetti?',
  '🌶️ How to make food less spicy?',
  '🥘 I have chicken, onion and tomato — what can I cook?',
  '🍰 Easy dessert recipe for beginners',
]

const SYSTEM_PROMPT = `You are Dishcovery's friendly AI Chef assistant. Your name is Chef Dish.
You help users with:
- Recipe suggestions and step-by-step cooking instructions
- Ingredient substitutions and cooking tips
- What to cook with ingredients they have
- Fixing cooking mistakes
- Understanding cuisine types and food cultures

Keep responses friendly, concise and practical. Use emojis occasionally.
When giving recipes, use a clear numbered step format.
If asked about something unrelated to food/cooking, politely redirect to food topics.`

export default function Chatbot({ user }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey ${user?.displayName?.split(' ')[0] || 'there'}! 👋 I'm **Chef Dish**, your AI cooking assistant.\n\nAsk me anything — recipes, cooking tips, what to make with ingredients you have, or how to fix a dish that went wrong. I'm here to help! 🍽️`,
    }
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return
    setInput('')

    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await response.json()
      const reply = data.content?.[0]?.text || 'Sorry, I had trouble responding. Please try again!'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your internet and try again! 🙏"
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Hey ${user?.displayName?.split(' ')[0] || 'there'}! 👋 I'm **Chef Dish**. Ask me anything about cooking! 🍽️`
    }])
  }

  // Simple markdown-like rendering
  const renderText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)' }} className="px-4 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
              👨‍🍳
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">Chef Dish</h1>
              <p className="text-green-100 text-xs">AI cooking assistant · Always here to help</p>
            </div>
          </div>
          <button onClick={clearChat}
            className="flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">
            <FiRefreshCw size={13} /> New chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 1 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <p className="text-xs font-semibold text-gray-400 text-center mb-3 uppercase tracking-wide">Try asking</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => sendMessage(s.replace(/^[^\s]+\s/, ''))}
                    className="text-left px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm text-gray-700 hover:border-green-300 hover:bg-green-50 transition-all shadow-sm">
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.22,1,0.36,1] }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                  {msg.role === 'assistant'
                    ? <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center text-lg">👨‍🍳</div>
                    : <FoodAvatar user={user} size={32} />
                  }
                </div>

                {/* Bubble */}
                <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'text-white rounded-tr-sm'
                    : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-sm'
                }`}
                  style={msg.role === 'user' ? { background: '#D85A30' } : {}}>
                  <div dangerouslySetInnerHTML={{ __html: `<p>${renderText(msg.content)}</p>` }} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center text-lg flex-shrink-0">👨‍🍳</div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                {[0,1,2].map(i => (
                  <motion.div key={i}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full bg-gray-400" />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Ask Chef Dish anything about cooking…"
                rows={1}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none resize-none transition-all leading-relaxed"
                style={{ minHeight: 48, maxHeight: 120, overflowY: 'auto',
                  boxShadow: 'none',
                  ':focus': { borderColor: '#059669' }
                }}
                onFocus={e => e.target.style.borderColor = '#059669'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold transition-all disabled:opacity-40"
              style={{ background: '#059669', boxShadow: '0 4px 12px rgba(5,150,105,0.35)' }}>
              <FiSend size={18} />
            </motion.button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Powered by Claude AI · Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
