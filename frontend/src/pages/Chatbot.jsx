import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiRefreshCw } from 'react-icons/fi'
import FoodAvatar from '../components/FoodAvatar'

// ── Knowledge base — zero API cost ─────────────────────────────────────────
const RECIPES = {
  'butter chicken': {
    name: 'Butter Chicken (Murgh Makhani)',
    time: '45 mins', serves: 4, difficulty: 'Medium',
    ingredients: ['500g chicken thighs', '1 cup yoghurt', '2 tbsp butter', '1 onion', '3 tomatoes', '2 tsp garam masala', '1 tsp cumin', '1 tsp turmeric', '200ml cream', 'Salt to taste'],
    steps: ['Marinate chicken in yoghurt + spices for 1 hour.','Grill or pan-fry chicken until charred. Set aside.','Melt butter, fry onion until golden. Add tomatoes, cook 10 mins.','Blend the sauce smooth. Return to pan.','Add chicken, simmer 15 mins. Stir in cream.','Serve with naan or rice. 🍛']
  },
  'biryani': {
    name: 'Chicken Biryani',
    time: '1 hour', serves: 4, difficulty: 'Medium',
    ingredients: ['500g chicken', '2 cups basmati rice', '2 onions', '1 cup yoghurt', '4 tbsp biryani masala', '4 tbsp ghee', 'Saffron in warm milk', 'Fresh mint & coriander'],
    steps: ['Soak rice 30 mins. Cook 70% done, drain.','Marinate chicken in yoghurt + biryani masala 1 hour.','Fry onions till golden brown. Cook chicken until done.','Layer: rice → chicken → fried onions → mint. Repeat.','Pour saffron milk on top. Cover tightly.','Cook on low heat (dum) for 25 mins. Serve hot! 🎉']
  },
  'dal makhani': {
    name: 'Dal Makhani',
    time: '8+ hours (overnight soak)', serves: 4, difficulty: 'Easy',
    ingredients: ['1 cup black lentils (urad dal)', '¼ cup kidney beans', '2 tbsp butter', '1 onion', '2 tomatoes', '1 tsp cumin', '1 tsp garam masala', '100ml cream'],
    steps: ['Soak dal and beans overnight. Pressure cook 45 mins.','Melt butter, fry cumin. Add onion till golden.','Add tomatoes + spices. Cook 10 mins.','Add cooked dal. Mash some beans for thickness.','Simmer 30 mins on very low heat. Stir in cream.','Finish with a butter swirl on top. ❤️']
  },
  'pasta': {
    name: 'Aglio e Olio Pasta',
    time: '20 mins', serves: 2, difficulty: 'Easy',
    ingredients: ['200g spaghetti', '6 garlic cloves', '4 tbsp olive oil', '1 tsp chilli flakes', 'Fresh parsley', 'Parmesan cheese', 'Salt'],
    steps: ['Cook pasta in salted water until al dente.','Thinly slice garlic. Heat olive oil on low.','Gently fry garlic until golden (not brown!).','Add chilli flakes. Add pasta + splash of pasta water.','Toss everything together. Add parsley.','Serve with lots of parmesan. Buonissimo! 🍝']
  },
  'carbonara': {
    name: 'Spaghetti Carbonara',
    time: '25 mins', serves: 2, difficulty: 'Medium',
    ingredients: ['200g spaghetti', '100g pancetta or bacon', '2 egg yolks + 1 whole egg', '50g Pecorino Romano', '2 cloves garlic', 'Black pepper', 'Salt'],
    steps: ['Cook pasta in salted water.','Fry pancetta until crispy. Set aside.','Mix eggs + cheese + black pepper in a bowl.','Reserve a cup of pasta water before draining.','Add hot pasta to pancetta pan (heat off!).','Add egg mix + pasta water. Toss quickly. Never scramble! 🥚']
  },
  'paneer': {
    name: 'Palak Paneer',
    time: '35 mins', serves: 3, difficulty: 'Easy',
    ingredients: ['250g paneer', '300g spinach', '1 onion', '2 tomatoes', '1 tbsp ginger-garlic paste', '1 tsp cumin', '1 tsp garam masala', '2 tbsp cream', '2 tbsp oil'],
    steps: ['Blanch spinach in boiling water 2 mins. Blend smooth.','Fry paneer cubes until golden. Set aside.','Heat oil, add cumin. Fry onion till golden.','Add ginger-garlic paste + tomatoes. Cook 8 mins.','Add spinach purée + spices. Simmer 5 mins.','Add paneer + cream. Serve with roti. 🌿']
  },
  'fried rice': {
    name: 'Egg Fried Rice',
    time: '15 mins', serves: 2, difficulty: 'Easy',
    ingredients: ['2 cups cooked rice (day-old is best)', '2 eggs', '3 tbsp soy sauce', '2 cloves garlic', '2 spring onions', '1 tbsp sesame oil', 'Mixed vegetables (optional)', '2 tbsp oil'],
    steps: ['Heat oil in a wok until very hot.','Scramble eggs, push to side. Add garlic.','Add rice. Break up any clumps. Stir-fry 3 mins.','Add soy sauce + vegetables. Toss well.','Add sesame oil at the end for aroma.','Top with spring onions. Done in 15 mins! 🥡']
  },
  'ramen': {
    name: 'Quick Chicken Ramen',
    time: '30 mins', serves: 2, difficulty: 'Easy',
    ingredients: ['2 packs ramen noodles', '2 chicken thighs', '4 cups chicken broth', '3 tbsp soy sauce', '1 tbsp sesame oil', 'Soft-boiled eggs', 'Spring onions', 'Nori (optional)'],
    steps: ['Simmer chicken in broth 20 mins. Shred.','Season broth: soy sauce + sesame oil + salt.','Boil noodles as per pack. Drain.','Soft-boil eggs: 6.5 mins, then ice bath.','Assemble: noodles → broth → chicken → egg.','Top with spring onions and nori. Itadakimasu! 🍜']
  },
}

const TIPS = {
  spicy: "🌶️ To reduce spice: add dairy (cream, yoghurt, coconut milk), sugar, or more vegetables. Never add water — it spreads capsaicin!",
  burnt: "🔥 Burnt food: transfer immediately to a clean pot, don't scrape the bottom. Add liquid and continue cooking — usually salvageable!",
  salty: "🧂 Too salty? Add potato chunks and simmer (they absorb salt), or add cream/coconut milk to mellow it out.",
  thick: "🥣 Sauce too thick? Add pasta water, stock, or plain water gradually. Pasta water is magic — starch helps bind sauces.",
  thin: "💧 Sauce too thin? Make a cornstarch slurry (1 tbsp cornstarch + 2 tbsp cold water) and stir in while simmering.",
  sticky: "🍚 Rice sticking? Let it rest covered 10 mins after cooking. Use a fork to fluff — never a spoon.",
  egg: "🥚 Perfect soft-boiled egg: boiling water → egg in → 6.5 mins → ice bath immediately. Timer is everything!",
  garlic: "🧄 Garlic burnt? Start over — burnt garlic is bitter and ruins a dish. Use medium-low heat, it takes just 2 mins.",
  onion: "🧅 Caramelised onions take 40-60 mins on low heat — not 5 as most recipes say. Patience is key!",
  substitute: "🔄 No butter? Use olive oil (1:1). No buttermilk? Milk + 1 tbsp lemon juice. No eggs? Flaxseed meal (1 tbsp + 3 tbsp water per egg).",
}

const CUISINE_INFO = {
  indian: "🇮🇳 Indian cuisine uses a base of onion-tomato-ginger-garlic, tempered with whole spices. Key spices: cumin, coriander, turmeric, garam masala, cardamom.",
  italian: "🇮🇹 Italian cooking is about quality ingredients, not many spices. Key rules: salted pasta water, al dente pasta, fresh herbs at the end.",
  chinese: "🇨🇳 Chinese cooking is fast and hot. Wok hei (breath of the wok) comes from very high heat. Soy sauce, ginger, garlic are the holy trinity.",
  japanese: "🇯🇵 Japanese cuisine values umami — the 5th taste. Key: dashi broth, soy sauce, mirin, sake. Simplicity and freshness are central.",
  thai: "🇹🇭 Thai food balances sweet, sour, salty, spicy in every dish. Fish sauce + lime + chilli + coconut milk are foundations.",
  french: "🇫🇷 French cooking has 5 mother sauces: Béchamel, Velouté, Espagnole, Hollandaise, Tomato. Butter, cream, wine are essential.",
  mexican: "🇲🇽 Mexican cuisine uses chillies, corn, beans and avocado. Mole sauce alone can have 30+ ingredients and take days to make!",
}

// ── Smart response generator ─────────────────────────────────────────────────
function generateResponse(input) {
  const msg = input.toLowerCase().trim()

  // Greeting
  if (/^(hi|hello|hey|hola|namaste|sup|yo)\b/.test(msg)) {
    return "Hey there! 👋 I'm Chef Dish, your cooking guide. Ask me for a recipe, cooking tips, or what to make with ingredients you have!"
  }

  // Recipe requests
  for (const [key, recipe] of Object.entries(RECIPES)) {
    if (msg.includes(key)) {
      return `Here's how to make **${recipe.name}** 🍽️\n\n⏱ ${recipe.time} · 👥 Serves ${recipe.serves} · 📊 ${recipe.difficulty}\n\n**Ingredients:**\n${recipe.ingredients.map(i => `• ${i}`).join('\n')}\n\n**Steps:**\n${recipe.steps.map((s, i) => `${i+1}. ${s}`).join('\n')}`
    }
  }

  // Cooking problem fixes
  if (msg.includes('spic') || msg.includes('hot') || msg.includes('chilli')) return TIPS.spicy
  if (msg.includes('burnt') || msg.includes('burned')) return TIPS.burnt
  if (msg.includes('salt') || msg.includes('salty')) return TIPS.salty
  if (msg.includes('thick') || msg.includes('lumpy')) return TIPS.thick
  if (msg.includes('thin') || msg.includes('watery')) return TIPS.thin
  if (msg.includes('sticky') || msg.includes('rice stuck')) return TIPS.sticky
  if (msg.includes('egg') && (msg.includes('boil') || msg.includes('soft') || msg.includes('hard'))) return TIPS.egg
  if (msg.includes('garlic') && msg.includes('burn')) return TIPS.garlic
  if (msg.includes('onion') && msg.includes('caramel')) return TIPS.onion
  if (msg.includes('substitut') || msg.includes('instead') || msg.includes("don't have") || msg.includes('no butter') || msg.includes('no egg')) return TIPS.substitute

  // Cuisine info
  if (msg.includes('indian') && (msg.includes('cuisine') || msg.includes('cook') || msg.includes('what is') || msg.includes('about'))) return CUISINE_INFO.indian
  if (msg.includes('italian') && (msg.includes('cuisine') || msg.includes('cook') || msg.includes('about'))) return CUISINE_INFO.italian
  if (msg.includes('chinese') && (msg.includes('cuisine') || msg.includes('cook') || msg.includes('about'))) return CUISINE_INFO.chinese
  if (msg.includes('japanese') && (msg.includes('cuisine') || msg.includes('cook') || msg.includes('about'))) return CUISINE_INFO.japanese
  if (msg.includes('thai') && (msg.includes('cuisine') || msg.includes('cook') || msg.includes('about'))) return CUISINE_INFO.thai
  if (msg.includes('french') && (msg.includes('cuisine') || msg.includes('cook') || msg.includes('about'))) return CUISINE_INFO.french
  if (msg.includes('mexican') && (msg.includes('cuisine') || msg.includes('cook') || msg.includes('about'))) return CUISINE_INFO.mexican

  // Ingredient-based suggestions
  if (msg.includes('chicken') && (msg.includes('have') || msg.includes('got') || msg.includes('only'))) {
    return "🍗 With chicken you can make:\n• **Butter Chicken** — rich creamy curry\n• **Chicken Biryani** — aromatic rice dish\n• **Chicken Fried Rice** — quick 20-min meal\n• **Chicken Ramen** — comforting noodle soup\n\nWhich one would you like a recipe for?"
  }
  if (msg.includes('egg') && (msg.includes('have') || msg.includes('got') || msg.includes('only'))) {
    return "🥚 With eggs you can make:\n• **Egg Fried Rice** — add leftover rice!\n• **Omelette** — 3 eggs, 5 mins, perfect breakfast\n• **Shakshuka** — eggs poached in tomato sauce\n• **Scrambled Eggs** — Gordon Ramsay style on low heat\n\nWant a specific recipe?"
  }
  if (msg.includes('pasta') && (msg.includes('have') || msg.includes('got') || msg.includes('only'))) {
    return "🍝 With just pasta you can make:\n• **Aglio e Olio** — garlic + olive oil + chilli (only 5 ingredients!)\n• **Carbonara** — eggs + cheese + bacon\n• **Pasta al Pomodoro** — simple tomato sauce\n• **Cacio e Pepe** — cheese + black pepper (Roman classic)\n\nWhich one?"
  }
  if (msg.includes('rice') && (msg.includes('have') || msg.includes('got') || msg.includes('only'))) {
    return "🍚 With rice you can make:\n• **Egg Fried Rice** — add egg + soy sauce\n• **Dal Khichdi** — rice + lentils, very comforting\n• **Congee** — rice porridge with toppings\n• **Rice Pudding** — sweet dessert!\n\nDay-old rice works best for fried rice!"
  }

  // Veg/non-veg suggestions
  if (msg.includes('veg') && !msg.includes('non') && (msg.includes('recipe') || msg.includes('cook') || msg.includes('dinner') || msg.includes('make'))) {
    return "🥗 Great vegetarian options:\n• **Dal Makhani** — creamy black lentils\n• **Palak Paneer** — spinach + cottage cheese\n• **Aglio e Olio Pasta** — Italian garlic pasta\n• **Chana Masala** — spiced chickpeas\n• **Vegetable Biryani** — aromatic rice dish\n\nWant a recipe for any of these?"
  }
  if ((msg.includes('non veg') || msg.includes('nonveg') || msg.includes('chicken') || msg.includes('meat')) && (msg.includes('recipe') || msg.includes('cook') || msg.includes('dinner'))) {
    return "🍗 Non-veg options to try:\n• **Butter Chicken** — all-time favourite\n• **Chicken Biryani** — festive rice dish\n• **Ramen** — Japanese chicken noodle soup\n• **Carbonara** — Italian with bacon\n• **Chicken Fried Rice** — quick weeknight meal\n\nWhich one do you want?"
  }

  // Quick/easy meal requests
  if (msg.includes('quick') || msg.includes('fast') || msg.includes('10 min') || msg.includes('15 min') || msg.includes('easy')) {
    return "⚡ Quick meals under 20 minutes:\n• **Egg Fried Rice** — 15 mins, use day-old rice\n• **Aglio e Olio Pasta** — 20 mins, just 5 ingredients\n• **Omelette** — 5 mins, infinite variations\n• **Instant Ramen upgraded** — add egg + veggies + soy sauce\n\n**Fastest tip:** Always have eggs, garlic, and pasta — you can make dinner in 15 mins any day! 🧄"
  }

  // Breakfast
  if (msg.includes('breakfast')) {
    return "🌅 Breakfast ideas:\n• **Masala Omelette** — eggs + onion + tomato + green chilli\n• **Poha** — flattened rice, light and quick\n• **Upma** — semolina, filling and easy\n• **Pancakes** — 3 ingredients: egg, banana, oats\n• **Avocado Toast** — smash + lemon + chilli flakes\n\nWhat do you feel like?"
  }

  // Dessert
  if (msg.includes('dessert') || msg.includes('sweet') || msg.includes('cake') || msg.includes('pudding')) {
    return "🍰 Easy desserts:\n• **Mug Cake** — 2 mins in microwave! Flour + egg + cocoa + sugar\n• **Rice Pudding** — leftover rice + milk + sugar + cardamom\n• **Banana Ice Cream** — blend frozen bananas. That's it!\n• **Gulab Jamun** — milk powder + ghee + sugar syrup\n• **Tiramisu** — no bake, coffee + cream + biscuits\n\nWant a recipe?"
  }

  // Thanks
  if (msg.includes('thank') || msg.includes('thanks') || msg.includes('ty') || msg.includes('great')) {
    return "You're welcome! 😊 Happy cooking! If you need more recipes or tips, just ask. You've got this, chef! 👨‍🍳✨"
  }

  // Help
  if (msg.includes('help') || msg.includes('what can you') || msg.includes('what do you')) {
    return `I'm Chef Dish! 👨‍🍳 Here's what I can help with:\n\n🍳 **Recipes** — Ask "how to make butter chicken" or "ramen recipe"\n🧑‍🍳 **Cooking tips** — "how to fix too salty food"\n🌍 **Cuisines** — "tell me about Indian cuisine"\n🥘 **Ingredient ideas** — "I have chicken, what can I make?"\n⚡ **Quick meals** — "easy 15-minute dinner"\n\nJust ask away!`
  }

  // Default
  const suggestions = ['butter chicken', 'biryani', 'pasta', 'dal makhani', 'fried rice', 'ramen']
  const random = suggestions[Math.floor(Math.random() * suggestions.length)]
  return `Hmm, I'm not sure about that one! 🤔 But I can help you with:\n\n• Recipes (try "how to make ${random}")\n• Cooking fixes ("food is too spicy, help!")\n• Ingredient ideas ("I have eggs, what to cook?")\n• Cuisine info ("tell me about Italian cooking")\n\nWhat would you like to know?`
}

const SUGGESTIONS = [
  '🍛 How to make butter chicken?',
  '🥗 Easy vegetarian dinner ideas',
  '🍝 Quick pasta recipe',
  '🌶️ Food is too spicy, how to fix?',
  '🥚 I have eggs, what can I cook?',
  '🍚 Rice stuck to the pan, help!',
]

export default function Chatbot({ user }) {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hey ${user?.displayName?.split(' ')[0] || 'there'}! 👋 I'm **Chef Dish**, your personal cooking guide.\n\nAsk me for recipes, cooking tips, or what to make with ingredients you have. I'm here to help! 🍽️`
  }])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userText }])
    setLoading(true)
    // Simulate thinking delay for natural feel
    setTimeout(() => {
      const reply = generateResponse(userText)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      setLoading(false)
      inputRef.current?.focus()
    }, 600 + Math.random() * 500)
  }

  const clearChat = () => setMessages([{
    role: 'assistant',
    content: `Hey ${user?.displayName?.split(' ')[0] || 'there'}! 👋 Fresh start! Ask me anything about cooking. 🍳`
  }])

  const renderText = (text) => text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p style="margin-top:8px">')
    .replace(/\n/g, '<br/>')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)', padding: '16px 24px', flexShrink: 0 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👨‍🍳</div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: 16 }}>Chef Dish</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>Your personal cooking guide · Always free</div>
            </div>
          </div>
          <button onClick={clearChat}
            style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'rgba(255,255,255,0.8)', borderRadius: 12, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiRefreshCw size={13} /> New chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Suggestion chips — only shown at start */}
          {messages.length === 1 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try asking</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                {SUGGESTIONS.map((s, i) => (
                  <motion.button key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => sendMessage(s.replace(/^[^\s]+\s/, ''))}
                    style={{ textAlign: 'left', padding: '10px 14px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, fontSize: 13, color: '#374151', cursor: 'pointer', transition: 'all .15s' }}>
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Message bubbles */}
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ flexShrink: 0, marginTop: 4 }}>
                  {msg.role === 'assistant'
                    ? <div style={{ width: 32, height: 32, borderRadius: 12, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👨‍🍳</div>
                    : <FoodAvatar user={user} size={32} />
                  }
                </div>
                <div style={{
                  maxWidth: '78%', padding: '12px 16px', borderRadius: 20, fontSize: 14, lineHeight: 1.65,
                  background: msg.role === 'user' ? '#D85A30' : 'white',
                  color: msg.role === 'user' ? 'white' : '#1f2937',
                  borderTopRightRadius: msg.role === 'user' ? 4 : 20,
                  borderTopLeftRadius: msg.role === 'user' ? 20 : 4,
                  boxShadow: msg.role === 'assistant' ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
                  border: msg.role === 'assistant' ? '1px solid #f3f4f6' : 'none',
                }}>
                  <div dangerouslySetInnerHTML={{ __html: `<p>${renderText(msg.content)}</p>` }} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 12, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👨‍🍳</div>
              <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: '20px 20px 20px 4px', padding: '12px 16px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {[0,1,2].map(i => (
                  <motion.div key={i} animate={{ scale: [1,1.5,1], opacity: [0.4,1,0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#9ca3af' }} />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div style={{ background: 'white', borderTop: '1px solid #f3f4f6', padding: '12px 16px', flexShrink: 0 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Ask Chef Dish anything about cooking…"
            rows={1} style={{
              flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 16, padding: '12px 16px',
              fontSize: 14, outline: 'none', resize: 'none', minHeight: 48, maxHeight: 120,
              lineHeight: 1.5, fontFamily: 'inherit', background: '#fafafa',
              transition: 'border-color .15s',
            }}
            onFocus={e => e.target.style.borderColor = '#059669'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 48, height: 48, borderRadius: 14, border: 'none', cursor: 'pointer',
              background: input.trim() ? '#059669' : '#e5e7eb',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s', flexShrink: 0,
              boxShadow: input.trim() ? '0 4px 12px rgba(5,150,105,0.3)' : 'none',
            }}>
            <FiSend size={18} />
          </motion.button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
          Enter to send · Shift+Enter for new line · Free forever, no AI credits used
        </p>
      </div>
    </div>
  )
}
