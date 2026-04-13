import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiRefreshCw, FiClock } from 'react-icons/fi'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import FoodAvatar from '../components/FoodAvatar'

const API = import.meta.env.VITE_API_URL

// Build dynamic system prompt with user's favourites (#30)
const buildSystemPrompt = (favs, userName) => `You are Chef Dish, a warm, witty, and expert AI cooking assistant for Dishcovery.

Your personality:
- You're like a friendly head chef who loves teaching people to cook
- You have opinions! Suggest confidently with enthusiasm
- Use cooking metaphors naturally ("Let's get our mise en place sorted!")
- Occasionally use food emojis 🍛🔥🧄 but don't overdo it
- Be encouraging — never make the user feel bad about not knowing something
- Address the user as ${userName || 'Chef'} occasionally to feel personal

${favs.length > 0
  ? `The user's saved favourite meals are: ${favs.join(', ')}. When they mention favourites, list them numbered and ask which to cook.`
  : "The user hasn't saved any favourite meals yet. Encourage them to explore!"}

You help with: detailed recipes with steps, Indian cuisine expertise, cooking tips, ingredient substitutions, what to cook with available ingredients, fixing cooking mistakes (too spicy/salty/burnt), calorie estimates, cuisine explanations, meal planning.

Always stay focused on food and cooking. If asked something unrelated, redirect warmly: "Ha, I wish I could help with that — but I'm strictly a kitchen guy! 🍳 Now, what are we cooking?"`

// Resolve "1", "2", "3" replies to actual favourite meal names (#30 Fix C)
const resolveNumberedReply = (text, favs) => {
  const num = parseInt(text.trim())
  if (!isNaN(num) && num >= 1 && num <= favs.length) {
    return `Tell me how to make ${favs[num - 1]}`
  }
  return text
}

const SUGGESTIONS = [
  '🍛 How do I make chole bhature?',
  '🥗 Easy vegetarian dinner tonight',
  '🌶️ My food is too spicy, how to fix?',
  '🥘 I have chicken, onion and tomato — what can I cook?',
  '🍝 Quick pasta recipe under 20 minutes',
  '❤️ Help me cook my favourite meal',
]

// Simple markdown renderer — safe, no dangerouslySetInnerHTML (#2)
function SafeMarkdown({ content }) {
  const lines = content.split('\n')
  return (
    <div style={{ fontSize: 14, lineHeight: 1.65, color: 'inherit' }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 8 }} />
        // Bold **text**
        const parts = line.split(/\*\*(.*?)\*\*/g)
        const rendered = parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)
        // Numbered list
        if (/^\d+\./.test(line.trim())) {
          return <div key={i} style={{ display:'flex', gap:8, marginBottom:4 }}>
            <span style={{ fontWeight:700, minWidth:20, color:'#D85A30' }}>{line.match(/^\d+/)[0]}.</span>
            <span>{parts.map((p,j) => j%2===1 ? <strong key={j}>{p}</strong> : p)}</span>
          </div>
        }
        // Bullet
        if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
          const txt = line.trim().replace(/^[•\-\*]\s*/,'')
          const tparts = txt.split(/\*\*(.*?)\*\*/g)
          return <div key={i} style={{ display:'flex', gap:8, marginBottom:3 }}>
            <span style={{ color:'#D85A30', fontWeight:700, marginTop:1 }}>•</span>
            <span>{tparts.map((p,j) => j%2===1 ? <strong key={j}>{p}</strong> : p)}</span>
          </div>
        }
        return <p key={i} style={{ marginBottom:6 }}>{rendered}</p>
      })}
    </div>
  )
}

export default function Chatbot({ user }) {
  const userName = user?.displayName?.split(' ')[0] || 'Chef'
  useEffect(() => { document.title = 'Chef Dish — Dishcovery'; return () => { document.title = 'Dishcovery — Find meals you love' } }, [])
  const [userFavs, setUserFavs] = useState([])
  const [messages, setMessages] = useState([])
  const [sessions, setSessions] = useState([])
  const [showSessions, setShowSessions] = useState(false)
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [groqAvailable, setGroqAvailable] = useState(null)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const welcomeMsg = {
    role: 'assistant',
    content: `Hey ${userName}! 👋 I'm **Chef Dish**, your AI cooking assistant.\n\nAsk me anything — recipes, cooking tips, or what to make with ingredients you have. I know Indian, Italian, Chinese, Thai and all world cuisines!`
  }

  // Load favourites from Firestore (#30)
  useEffect(() => {
    if (!user) return
    getDocs(query(collection(db,'favorites'), where('uid','==',user.uid)))
      .then(snap => setUserFavs(snap.docs.map(d => d.data().strMeal)))
  }, [user])

  // groqAvailable is set after first successful API call — don't pre-assume

  // Load saved chat history (#31)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chefDishHistory')
      const savedSessions = localStorage.getItem('chefDishSessions')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.length > 1) { setMessages(parsed); return }
      }
      if (savedSessions) setSessions(JSON.parse(savedSessions))
    } catch {}
    setMessages([welcomeMsg])
  }, [])

  // Save history on every message update (#31)
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('chefDishHistory', JSON.stringify(messages.slice(-50)))
    }
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  // Save sessions list (#31)
  const saveSession = (msgs) => {
    try {
      const existing = JSON.parse(localStorage.getItem('chefDishSessions')||'[]')
      const lastUserMsg = [...msgs].reverse().find(m=>m.role==='user')
      const newSession = {
        id: Date.now(),
        preview: lastUserMsg?.content?.slice(0,55)+'…' || 'Chat session',
        date: new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short'}),
        messages: msgs
      }
      const updated = [newSession,...existing].slice(0,5)
      localStorage.setItem('chefDishSessions', JSON.stringify(updated))
      setSessions(updated)
    } catch {}
  }

  const clearChat = () => {
    if (messages.length > 1) saveSession(messages)
    localStorage.removeItem('chefDishHistory')
    setMessages([welcomeMsg])
    setShowSessions(false)
  }

  const restoreSession = (session) => {
    setMessages(session.messages)
    localStorage.setItem('chefDishHistory', JSON.stringify(session.messages))
    setShowSessions(false)
  }

  const sendMessage = async (text) => {
    let userText = (text || input).trim()
    if (!userText || loading) return
    // Resolve numbered reply to favourite meal name
    userText = resolveNumberedReply(userText, userFavs)
    setInput('')

    const newMessages = [...messages, { role:'user', content: text||userText }]
    setMessages(newMessages)
    setLoading(true)

    // Build conversation for API — system prompt sent separately
    const conversationMessages = newMessages.map(m => ({ role:m.role, content:m.content }))
    const systemPrompt = buildSystemPrompt(userFavs, userName)

    try {
      // Call backend which holds the Groq key securely (#1 fix)
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ messages: conversationMessages, systemPrompt }) // send both
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setMessages(prev => [...prev, { role:'assistant', content: data.reply }])
      setGroqAvailable(true)
    } catch (err) {
      console.error('Chat error:', err)
      // Fallback to rule-based
      const reply = fallback(userText, userFavs)
      setMessages(prev => [...prev, { role:'assistant', content: reply }])
      setGroqAvailable(false)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 64px)', background:'#f9fafb' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#7c3d12 0%,#c2410c 50%,#D85A30 100%)', padding:'14px 24px', flexShrink:0 }}>
        <div style={{ maxWidth:720, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:44,height:44,borderRadius:14,background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>👨‍🍳</div>
            <div>
              <div>
                <span style={{ fontWeight:700,color:'white',fontSize:16 }}>Chef Dish 👨‍🍳</span>
                <div style={{ color:'rgba(255,255,255,0.65)',fontSize:12 }}>
                  Your personal cooking assistant{userFavs.length>0?` · Knows your ${userFavs.length} saved meals`:''}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display:'flex',gap:8 }}>
            {sessions.length>0 && (
              <button onClick={()=>setShowSessions(!showSessions)}
                style={{ background:'rgba(255,255,255,0.12)',border:'none',color:'rgba(255,255,255,0.8)',borderRadius:10,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:5 }}>
                <FiClock size={12}/> History
              </button>
            )}
            <button onClick={clearChat}
              style={{ background:'rgba(255,255,255,0.12)',border:'none',color:'rgba(255,255,255,0.8)',borderRadius:10,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:5 }}>
              <FiRefreshCw size={12}/> New chat
            </button>
          </div>
        </div>

        {/* Session history dropdown (#31) */}
        <AnimatePresence>
          {showSessions && (
            <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }}
              style={{ maxWidth:720,margin:'10px auto 0',background:'rgba(0,0,0,0.3)',borderRadius:14,overflow:'hidden' }}>
              {sessions.map(s => (
                <button key={s.id} onClick={()=>restoreSession(s)}
                  style={{ width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 16px',background:'transparent',border:'none',cursor:'pointer',color:'white',fontSize:13,textAlign:'left',borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ opacity:0.85,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{s.preview}</span>
                  <span style={{ opacity:0.5,fontSize:11,flexShrink:0,marginLeft:8 }}>{s.date}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div style={{ flex:1,overflowY:'auto',padding:'20px 16px' }}>
        <div style={{ maxWidth:720,margin:'0 auto',display:'flex',flexDirection:'column',gap:14 }}>

          {/* Suggestion chips */}
          {messages.length <= 1 && (
            <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3 }}>
              <p style={{ fontSize:11,fontWeight:600,color:'#9ca3af',textAlign:'center',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.06em' }}>Try asking</p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:8 }}>
                {SUGGESTIONS.map((s,i) => (
                  <motion.button key={i} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
                    transition={{ delay:0.35+i*0.05 }} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                    onClick={() => sendMessage(s.replace(/^[^\s]+\s/,''))}
                    style={{ textAlign:'left',padding:'10px 14px',background:'white',border:'1px solid #e5e7eb',borderRadius:14,fontSize:13,color:'#374151',cursor:'pointer' }}>
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg,i) => (
              <motion.div key={i}
                initial={{ opacity:0,y:10,scale:0.98 }} animate={{ opacity:1,y:0,scale:1 }}
                transition={{ duration:0.3 }}
                style={{ display:'flex',gap:10,flexDirection:msg.role==='user'?'row-reverse':'row' }}>
                <div style={{ flexShrink:0,marginTop:4 }}>
                  {msg.role==='assistant'
                    ? <div style={{ width:32,height:32,borderRadius:12,background:'#d1fae5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>👨‍🍳</div>
                    : <FoodAvatar user={user} size={32} />}
                </div>
                <div style={{
                  maxWidth:'78%',padding:'12px 16px',borderRadius:20,
                  background:msg.role==='user'?'#D85A30':'white',
                  color:msg.role==='user'?'white':'#1f2937',
                  borderTopRightRadius:msg.role==='user'?4:20,
                  borderTopLeftRadius:msg.role==='user'?20:4,
                  boxShadow:msg.role==='assistant'?'0 1px 8px rgba(0,0,0,0.06)':'none',
                  border:msg.role==='assistant'?'1px solid #f3f4f6':'none',
                }}>
                  {/* Safe markdown rendering — no dangerouslySetInnerHTML (#2) */}
                  <SafeMarkdown content={msg.content} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
              style={{ display:'flex',gap:10 }}>
              <div style={{ width:32,height:32,borderRadius:12,background:'#d1fae5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0 }}>👨‍🍳</div>
              <div style={{ background:'white',border:'1px solid #f3f4f6',borderRadius:'20px 20px 20px 4px',padding:'12px 16px',display:'flex',alignItems:'center',gap:6 }}>
                {[0,1,2].map(i=>(
                  <motion.div key={i} animate={{ scale:[1,1.5,1],opacity:[0.4,1,0.4] }}
                    transition={{ duration:0.8,repeat:Infinity,delay:i*0.15 }}
                    style={{ width:8,height:8,borderRadius:'50%',background:'#9ca3af' }}/>
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef}/>
        </div>
      </div>

      {/* Input */}
      <div style={{ background:'white',borderTop:'1px solid #f3f4f6',padding:'12px 16px',flexShrink:0 }}>
        <div style={{ maxWidth:720,margin:'0 auto',display:'flex',gap:10,alignItems:'flex-end' }}>
          <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()} }}
            placeholder="Ask Chef Dish anything about cooking…"
            rows={1} style={{ flex:1,border:'1.5px solid #e5e7eb',borderRadius:16,padding:'12px 16px',fontSize:14,outline:'none',resize:'none',minHeight:48,maxHeight:120,lineHeight:1.5,fontFamily:'inherit',background:'#fafafa' }}
            onFocus={e=>e.target.style.borderColor='#D85A30'}
            onBlur={e=>e.target.style.borderColor='#e5e7eb'}
            onInput={e=>{ e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,120)+'px' }}/>
          <motion.button whileTap={{ scale:0.88 }} onClick={()=>sendMessage()} disabled={!input.trim()||loading}
            style={{ width:48,height:48,borderRadius:14,border:'none',cursor:'pointer',background:input.trim()?'#D85A30':'#e5e7eb',color:'white',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s',flexShrink:0,boxShadow:input.trim()?'0 4px 12px rgba(216,90,48,0.3)':'none' }}>
            <FiSend size={18}/>
          </motion.button>
        </div>
        <p style={{ textAlign:'center',fontSize:11,color:'#9ca3af',marginTop:6 }}>
          Enter to send · Shift+Enter for new line · Add GROQ_API_KEY to Render for full AI
        </p>
      </div>
    </div>
  )
}

// Fallback when Groq unavailable
function fallback(msg, favs) {
  const m = msg.toLowerCase()
  if (/^(hi|hello|hey)\b/.test(m)) return "Hey there! 👋 Ask me for a recipe, cooking help, or what to make with ingredients you have!"
  if (m.includes('favourite') || m.includes('favorite') || m.includes('saved')) {
    if (favs.length===0) return "You haven't saved any favourite meals yet! Go to the Home page, explore some dishes, and tap ❤️ to save them. Then I can help you cook them! 🍽️"
    if (favs.length===1) return `Your saved meal is **${favs[0]}**! Want me to walk you through how to make it?`
    return `You have ${favs.length} saved meals:\n${favs.map((f,i)=>`${i+1}. ${f}`).join('\n')}\n\nWhich one shall we cook today? Just reply with the number!`
  }
  if (m.includes('biryani')) return "🍛 **Chicken Biryani:**\n\n**Ingredients:** 500g chicken, 2 cups basmati rice, 2 onions (sliced), 1 cup yoghurt, 4 tbsp biryani masala, 4 tbsp ghee, saffron in warm milk, mint leaves\n\n**Steps:**\n1. Marinate chicken in yoghurt + biryani masala for 1 hour\n2. Fry onions until deep golden brown\n3. Cook chicken until done\n4. Par-boil rice to 70% done, drain\n5. Layer: rice → chicken → fried onions → mint\n6. Pour saffron milk on top, seal with foil\n7. Cook on dum (low heat) 25 mins\n8. Serve with raita! 🎉"
  if (m.includes('chole') || m.includes('bhature') || m.includes('chana')) return "🍛 **Chole Bhature:**\n\n**For Chole:**\n1. Soak 2 cups chickpeas overnight, pressure cook 6-7 whistles\n2. Fry onions golden, add ginger-garlic paste\n3. Add tomatoes + chole masala + cumin. Cook 10 mins\n4. Add chickpeas + water. Simmer 20 mins\n\n**For Bhature:**\n1. Mix 2 cups maida + ½ cup curd + ½ tsp baking soda + salt. Knead soft dough\n2. Rest 2 hours\n3. Roll thick circles, deep fry in hot oil until puffed\n4. Serve immediately! 🎉"
  if (m.includes('spic')) return "🌶️ Food too spicy? Add coconut milk, cream or yoghurt. A potato chunk absorbs spice. A pinch of sugar helps balance. Never add plain water!"
  if (m.includes('salt')) return "🧂 Too salty? Add a potato chunk and simmer — it absorbs salt. Or add cream/coconut milk to mellow it out."
  if (m.includes('burnt')) return "🔥 Transfer immediately to a clean pot without scraping the bottom. Add liquid and continue — usually salvageable!"
  if (m.includes('chicken') && (m.includes('have')||m.includes('got'))) return "🍗 With chicken you can make:\n1. Butter Chicken — creamy tomato curry\n2. Chicken Biryani — aromatic rice dish\n3. Chicken Fried Rice — 20-min weeknight meal\n4. Kadai Chicken — dry restaurant-style\n\nWhich one? Reply with the number!"
  if (m.includes('paneer')) return "🧀 **Quick Paneer Butter Masala:**\n1. Fry 250g paneer cubes until golden\n2. Blend onion+tomato+cashew paste, cook 8 mins\n3. Add butter + cream + kasuri methi\n4. Add paneer, simmer 5 mins\n5. Serve with naan or roti! 🫓"
  return `I'm Chef Dish! Here's what I can help with:\n\n• **Recipes** — "How to make butter chicken"\n• **Cooking fixes** — "My food is too salty"\n• **Ingredient ideas** — "I have eggs and rice"\n• **Favourites** — "Help me cook my favourite meal"\n\n*(Add GROQ_API_KEY to Render for full AI responses)*`
}
