import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiRefreshCw, FiZap } from 'react-icons/fi'
import FoodAvatar from '../components/FoodAvatar'

// Groq API — free tier: 30 req/min, 14,400 req/day
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const GROQ_MODEL = 'llama3-8b-8192' // free, fast

const SYSTEM_PROMPT = `You are Chef Dish, a friendly and expert AI cooking assistant for Dishcovery — a recipe discovery app.

You help users with:
- Detailed recipes with step-by-step instructions and ingredients
- Indian cuisine expertise (biryani, curries, street food, regional dishes)  
- Cooking tips, techniques, and common mistake fixes
- Ingredient substitutions when users don't have something
- What to cook with ingredients they have on hand
- Cuisine explanations and food culture
- Calorie estimates and nutritional rough info
- Fixing cooking problems (too spicy/salty/burnt/thick/thin etc)

Response style:
- Friendly, warm and encouraging
- Use emojis sparingly but effectively
- For recipes: always list ingredients first, then numbered steps
- Keep answers focused and practical
- For Indian dishes especially, be very detailed and authentic
- If someone asks about calories, give a rough estimate per serving

Always stay focused on food and cooking topics. If asked about something unrelated, politely redirect to food.`

const SUGGESTIONS = [
  '🍛 How do I make chole bhature?',
  '🥗 Easy vegetarian dinner tonight',
  '🌶️ My food is too spicy, how to fix?',
  '🥘 I have chicken, onion, tomato — what can I cook?',
  '🍝 Quick pasta recipe under 20 minutes',
  '🎂 Easy dessert for beginners',
]

// Fallback rule-based for when Groq key not set
function fallbackResponse(input) {
  const msg = input.toLowerCase()
  if (msg.includes('chole') || msg.includes('bhature')) return "🍛 **Chole Bhature** — A classic Punjabi dish!\n\n**For Chole:**\nIngredients: 2 cups chickpeas (soaked overnight), 2 onions, 3 tomatoes, 2 tsp chole masala, 1 tsp cumin, ginger-garlic paste, oil, salt\n\nSteps:\n1. Pressure cook chickpeas with tea bag (for colour) — 6-7 whistles\n2. Fry onions until dark golden. Add ginger-garlic paste.\n3. Add tomatoes + chole masala + spices. Cook 10 mins.\n4. Add chickpeas + 1 cup water. Simmer 20 mins.\n\n**For Bhature:**\nIngredients: 2 cups maida, ½ cup curd, ½ tsp baking soda, oil to fry\n\nSteps:\n1. Mix maida + curd + baking soda + pinch of salt. Knead soft dough.\n2. Rest 2 hours.\n3. Roll into thick circles, deep fry in hot oil until puffed.\n4. Serve immediately! 🎉"
  if (msg.includes('spic')) return "🌶️ To reduce spice: add coconut milk, cream, or yoghurt. Add more tomatoes or a potato chunk (absorbs spice). A pinch of sugar also helps balance. Never add plain water — it spreads the heat!"
  if (msg.includes('biryani')) return "🍛 Chicken Biryani recipe:\n\n**Ingredients:** 500g chicken, 2 cups basmati rice, 2 onions, 1 cup yoghurt, 4 tbsp biryani masala, 4 tbsp ghee, saffron in warm milk, mint leaves\n\n**Steps:**\n1. Marinate chicken in yoghurt + biryani masala for 1 hour\n2. Fry onions until golden brown\n3. Cook chicken until done\n4. Par-boil rice to 70% done\n5. Layer: rice → chicken → fried onions → mint. Repeat\n6. Pour saffron milk on top. Seal and cook on dum (low heat) 25 mins\n7. Serve with raita! 🎉"
  if (msg.includes('chicken') && (msg.includes('have') || msg.includes('got'))) return "🍗 With chicken you can make:\n• **Butter Chicken** — creamy tomato curry\n• **Chicken Biryani** — aromatic rice dish\n• **Chicken Fried Rice** — quick 20-min meal\n• **Kadai Chicken** — dry restaurant-style curry\n• **Simple Chicken Curry** — onion-tomato base with garam masala\n\nWhich one would you like a recipe for?"
  return `I can help you with recipes, cooking tips, and food questions! Try asking:\n• "How to make butter chicken"\n• "What can I cook with eggs and rice"\n• "My curry is too salty, help"\n• "Tell me about Indian street food"\n\nNote: Add your Groq API key in environment variables for full AI-powered responses!`
}

export default function Chatbot({ user }) {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hey ${user?.displayName?.split(' ')[0] || 'there'}! 👋 I'm **Chef Dish**, your AI cooking assistant.\n\nAsk me anything — recipes, cooking tips, calories, or what to make with ingredients you have. I know Indian, Italian, Chinese, Thai and all world cuisines! 🍽️${!GROQ_KEY ? '\n\n*(Add VITE_GROQ_API_KEY to .env for full AI responses)*' : ''}`
  }])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return
    setInput('')
    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setLoading(true)

    // Use Groq if key available, else fallback
    if (GROQ_KEY) {
      try {
        const res = await fetch(GROQ_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_KEY}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...newMessages.map(m => ({ role: m.role, content: m.content })),
            ],
            max_tokens: 1024,
            temperature: 0.7,
          }),
        })
        const data = await res.json()
        const reply = data.choices?.[0]?.message?.content || "I had trouble responding. Please try again!"
        setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      } catch {
        setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please try again! 🙏" }])
      }
    } else {
      // Fallback with delay for natural feel
      await new Promise(r => setTimeout(r, 700 + Math.random() * 500))
      const reply = fallbackResponse(userText)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  const clearChat = () => setMessages([{
    role: 'assistant',
    content: `Fresh start! 👨‍🍳 Ask me anything about cooking, recipes, or food. I'm here to help!`
  }])

  const renderText = (text) => text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p style="margin-top:8px">')
    .replace(/\n/g, '<br/>')

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 64px)', background:'#f9fafb' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, #065f46 0%, #059669 100%)', padding:'16px 24px', flexShrink:0 }}>
        <div style={{ maxWidth:720, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:48, height:48, borderRadius:16, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>👨‍🍳</div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontWeight:700, color:'white', fontSize:16 }}>Chef Dish</span>
                {GROQ_KEY && (
                  <span style={{ background:'rgba(255,255,255,0.2)', color:'white', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99, display:'flex', alignItems:'center', gap:4 }}>
                    <FiZap size={9} /> AI Powered
                  </span>
                )}
              </div>
              <div style={{ color:'rgba(255,255,255,0.65)', fontSize:12 }}>
                {GROQ_KEY ? 'Powered by Groq AI · Llama 3' : 'Smart cooking assistant'}
              </div>
            </div>
          </div>
          <button onClick={clearChat}
            style={{ background:'rgba(255,255,255,0.12)', border:'none', color:'rgba(255,255,255,0.8)', borderRadius:12, padding:'6px 14px', cursor:'pointer', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
            <FiRefreshCw size={13} /> New chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'24px 16px' }}>
        <div style={{ maxWidth:720, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 }}>

          {/* Suggestion chips */}
          {messages.length === 1 && (
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
              <p style={{ fontSize:12, fontWeight:600, color:'#9ca3af', textAlign:'center', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.06em' }}>Try asking</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:8 }}>
                {SUGGESTIONS.map((s, i) => (
                  <motion.button key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:0.35 + i*0.05 }}
                    whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                    onClick={() => sendMessage(s.replace(/^[^\s]+\s/, ''))}
                    style={{ textAlign:'left', padding:'10px 14px', background:'white', border:'1px solid #e5e7eb', borderRadius:14, fontSize:13, color:'#374151', cursor:'pointer' }}>
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity:0, y:10, scale:0.98 }} animate={{ opacity:1, y:0, scale:1 }}
                transition={{ duration:0.3 }}
                style={{ display:'flex', gap:10, flexDirection:msg.role==='user' ? 'row-reverse' : 'row' }}>
                <div style={{ flexShrink:0, marginTop:4 }}>
                  {msg.role === 'assistant'
                    ? <div style={{ width:32, height:32, borderRadius:12, background:'#d1fae5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>👨‍🍳</div>
                    : <FoodAvatar user={user} size={32} />
                  }
                </div>
                <div style={{
                  maxWidth:'78%', padding:'12px 16px', borderRadius:20, fontSize:14, lineHeight:1.65,
                  background: msg.role==='user' ? '#D85A30' : 'white',
                  color: msg.role==='user' ? 'white' : '#1f2937',
                  borderTopRightRadius: msg.role==='user' ? 4 : 20,
                  borderTopLeftRadius: msg.role==='user' ? 20 : 4,
                  boxShadow: msg.role==='assistant' ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
                  border: msg.role==='assistant' ? '1px solid #f3f4f6' : 'none',
                }}>
                  <div dangerouslySetInnerHTML={{ __html:`<p>${renderText(msg.content)}</p>` }} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              style={{ display:'flex', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:12, background:'#d1fae5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>👨‍🍳</div>
              <div style={{ background:'white', border:'1px solid #f3f4f6', borderRadius:'20px 20px 20px 4px', padding:'12px 16px', boxShadow:'0 1px 8px rgba(0,0,0,0.06)', display:'flex', alignItems:'center', gap:6 }}>
                {[0,1,2].map(i => (
                  <motion.div key={i} animate={{ scale:[1,1.5,1], opacity:[0.4,1,0.4] }}
                    transition={{ duration:0.8, repeat:Infinity, delay:i*0.15 }}
                    style={{ width:8, height:8, borderRadius:'50%', background:'#9ca3af' }} />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ background:'white', borderTop:'1px solid #f3f4f6', padding:'12px 16px', flexShrink:0 }}>
        <div style={{ maxWidth:720, margin:'0 auto', display:'flex', gap:10, alignItems:'flex-end' }}>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Ask Chef Dish anything about cooking…"
            rows={1} style={{
              flex:1, border:'1.5px solid #e5e7eb', borderRadius:16, padding:'12px 16px',
              fontSize:14, outline:'none', resize:'none', minHeight:48, maxHeight:120,
              lineHeight:1.5, fontFamily:'inherit', background:'#fafafa',
            }}
            onFocus={e => e.target.style.borderColor='#059669'}
            onBlur={e => e.target.style.borderColor='#e5e7eb'} />
          <motion.button whileTap={{ scale:0.88 }} onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width:48, height:48, borderRadius:14, border:'none', cursor:'pointer',
              background: input.trim() ? '#059669' : '#e5e7eb',
              color:'white', display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all .15s', flexShrink:0,
              boxShadow: input.trim() ? '0 4px 12px rgba(5,150,105,0.3)' : 'none',
            }}>
            <FiSend size={18} />
          </motion.button>
        </div>
        <p style={{ textAlign:'center', fontSize:11, color:'#9ca3af', marginTop:6 }}>
          {GROQ_KEY ? 'Powered by Groq AI (Llama 3) · Free · Fast' : 'Add VITE_GROQ_API_KEY to .env for full AI · Enter to send'}
        </p>
      </div>
    </div>
  )
}
