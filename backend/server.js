require('dotenv').config()
const express   = require('express')
const cors      = require('cors')
const rateLimit = require('express-rate-limit')

const app    = express()
const PORT   = process.env.PORT   || 5000
const MEALDB = process.env.MEALDB_BASE_URL || 'https://www.themealdb.com/api/json/v1/1'
const SPOON  = process.env.SPOONACULAR_API_KEY || ''
const SPOON_URL = 'https://api.spoonacular.com'

// BUG-5: CORS locked to frontend origin only
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:4173',
]
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return cb(null, true)
    if (allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true)
    return cb(new Error('Not allowed by CORS'))
  }
}))
app.use(express.json())

// BUG-6: Rate limiting
const generalLimit = rateLimit({ windowMs: 60*1000, max: 100, standardHeaders: true, legacyHeaders: false })
const aiLimit      = rateLimit({ windowMs: 60*1000, max: 20,  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many AI requests. Please wait a minute.' }
})
const searchLimit  = rateLimit({ windowMs: 60*1000, max: 60,  standardHeaders: true, legacyHeaders: false })

app.use('/api/', generalLimit)
app.use('/api/chat',      aiLimit)
app.use('/api/suggest',   aiLimit)
app.use('/api/nutrition', aiLimit)
app.use('/api/spoon',     searchLimit)

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', spoonacular: !!SPOON, version: 'v6' })
})

// ── Spoonacular: complex search ────────────────────────────────────────────
app.get('/api/spoon/search', async (req, res) => {
  if (!SPOON) return res.status(503).json({ error: 'Spoonacular not configured' })
  try {
    const { q, offset = 0, number = 20, cuisine, diet } = req.query
    const params = new URLSearchParams({ query: q||'', number, offset, addRecipeInformation: true, addRecipeNutrition: false, apiKey: SPOON })
    if (cuisine) params.append('cuisine', cuisine)
    if (diet)    params.append('diet', diet)
    const response = await fetch(`${SPOON_URL}/recipes/complexSearch?${params}`)
    const data = await response.json()
    if (data.status === 'failure' && data.code === 402) return res.status(402).json({ error: 'quota_exceeded' })
    res.json(data)
  } catch { res.status(500).json({ error: 'Spoonacular search failed' }) }
})

// ── Spoonacular: cuisine browse ────────────────────────────────────────────
app.get('/api/spoon/cuisine', async (req, res) => {
  if (!SPOON) return res.status(503).json({ error: 'Spoonacular not configured' })
  try {
    const { cuisine, offset = 0, number = 20, diet } = req.query
    const params = new URLSearchParams({ query: '', number, offset, addRecipeInformation: true, apiKey: SPOON, cuisine: cuisine||'' })
    if (diet) params.append('diet', diet)
    const response = await fetch(`${SPOON_URL}/recipes/complexSearch?${params}`)
    const data = await response.json()
    if (data.status === 'failure' && data.code === 402) return res.status(402).json({ error: 'quota_exceeded' })
    res.json(data)
  } catch { res.status(500).json({ error: 'Spoonacular cuisine failed' }) }
})

// ── Spoonacular: recipe details ────────────────────────────────────────────
app.get('/api/spoon/recipe/:id', async (req, res) => {
  if (!SPOON) return res.status(503).json({ error: 'Spoonacular not configured' })
  try {
    const response = await fetch(`${SPOON_URL}/recipes/${req.params.id}/information?apiKey=${SPOON}&includeNutrition=true`)
    res.json(await response.json())
  } catch { res.status(500).json({ error: 'Spoonacular recipe failed' }) }
})

// ── MealDB routes ──────────────────────────────────────────────────────────
app.get('/api/search', async (req, res) => {
  try { res.json(await fetch(`${MEALDB}/search.php?s=${encodeURIComponent(req.query.q||'')}`).then(r=>r.json())) }
  catch { res.status(500).json({ error: 'Search failed' }) }
})

app.get('/api/meal/random', async (req, res) => { // BUG-1: add random route so frontend doesn't call MealDB directly
  try { res.json(await fetch(`${MEALDB}/random.php`).then(r=>r.json())) }
  catch { res.status(500).json({ error: 'Failed' }) }
})

app.get('/api/meal/:id', async (req, res) => {
  try { res.json(await fetch(`${MEALDB}/lookup.php?i=${req.params.id}`).then(r=>r.json())) }
  catch { res.status(500).json({ error: 'Failed' }) }
})

app.get('/api/popular', async (req, res) => {
  try {
    const areas = ['Indian','Italian','Chinese','Mexican','Japanese','Thai','British','French','American','Greek']
    const results = await Promise.all(areas.map(a => fetch(`${MEALDB}/filter.php?a=${a}`).then(r=>r.json()).catch(()=>({meals:[]}))))
    const combined = results.flatMap((r,i) => (r.meals||[]).map(m=>({...m,strArea:areas[i]}))).sort(()=>Math.random()-0.5)
    res.json({ meals: combined })
  } catch { res.status(500).json({ error: 'Failed' }) }
})

app.get('/api/filter', async (req, res) => {
  try {
    const { c, a } = req.query
    const url = c ? `${MEALDB}/filter.php?c=${encodeURIComponent(c)}` : `${MEALDB}/filter.php?a=${encodeURIComponent(a||'')}`
    res.json(await fetch(url).then(r=>r.json()))
  } catch { res.status(500).json({ error: 'Failed' }) }
})

// ── Groq AI chat ───────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY || ''
  if (!GROQ_KEY) return res.status(503).json({ error: 'Groq not configured. Add GROQ_API_KEY to Render env vars.' })
  try {
    const { messages, systemPrompt } = req.body
    const fullMessages = [
      { role:'system', content: systemPrompt || 'You are Chef Dish, a helpful cooking assistant.' },
      ...messages
    ]
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${GROQ_KEY}` },
      body: JSON.stringify({ model:'llama3-8b-8192', messages:fullMessages, max_tokens:1024, temperature:0.7 }),
    })
    const data = await response.json()
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'Groq error' })
    res.json({ reply: data.choices?.[0]?.message?.content || '' })
  } catch { res.status(500).json({ error: 'Chat failed' }) }
})

// ── AI no-results suggestion ───────────────────────────────────────────────
app.post('/api/suggest', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY || ''
  if (!GROQ_KEY) return res.status(503).json({ error: 'Groq not configured' })
  try {
    const { query } = req.body
    const prompt = `The user searched for "${query}" in a recipe app but got no results. Give a SHORT helpful response (max 4 sentences) with: a brief description of what this dish is, key ingredients (3-4 max), and suggest they try Chef Dish chatbot for the full recipe. Keep it warm and friendly. No markdown.`
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${GROQ_KEY}`},
      body: JSON.stringify({ model:'llama3-8b-8192', messages:[{role:'user',content:prompt}], max_tokens:150 })
    })
    const d = await r.json()
    res.json({ suggestion: d.choices?.[0]?.message?.content || '' })
  } catch { res.status(500).json({ error: 'Suggestion failed' }) }
})

// ── Calorie Calculator (USDA FoodData Central — free) ─────────────────────
const USDA_KEY = process.env.USDA_API_KEY || 'DEMO_KEY'

// Unit → approximate grams conversion table
const UNIT_GRAMS = {
  cup:1,cups:1, tablespoon:15,tablespoons:15,tbsp:15, teaspoon:5,teaspoons:5,tsp:5,
  oz:28,ounce:28,ounces:28, lb:454,pound:454,pounds:454, g:1,gram:1,grams:1,
  kg:1000, ml:1,l:1000, clove:5,cloves:5, slice:30,slices:30, piece:50,pieces:50,
  pinch:0.5, handful:30, can:400,
}
const CUP_GRAMS = { flour:120, sugar:200, rice:185, butter:227, milk:240, oats:90,
  oil:218, water:240, chicken:140, onion:160, tomato:180, yoghurt:245, cheese:113 }

function estimateGrams(quantityStr, unit, ingredientName) {
  const qty = parseFloat(quantityStr) || 1
  const u = unit?.toLowerCase().replace(/s$/, '') || ''
  if (u === 'cup' || u === 'cups') {
    const ingKey = ingredientName.toLowerCase().split(' ').find(w => CUP_GRAMS[w])
    return qty * (CUP_GRAMS[ingKey] || 130) // default 130g/cup
  }
  const gramsPerUnit = UNIT_GRAMS[u] || UNIT_GRAMS[u+'s'] || 50
  return qty * gramsPerUnit
}

function parseIngredient(ingStr) {
  // e.g. "2 cups flour", "1 tbsp butter", "3 cloves garlic"
  const match = ingStr.match(/^([\d./½¼¾]+)\s*([a-zA-Z]*)\s*(.+)?$/)
  if (!match) return { name: ingStr, grams: 100 }
  const [, qty, unit, rest] = match
  const name = (rest || unit || ingStr).trim()
  const grams = estimateGrams(qty, unit, name)
  return { name, grams: Math.max(5, Math.min(grams, 2000)) }
}

app.post('/api/nutrition', async (req, res) => {
  try {
    const { ingredients } = req.body
    if (!ingredients?.length) return res.status(400).json({ error: 'No ingredients' })

    const results = await Promise.allSettled(
      ingredients.slice(0, 15).map(async (ing) => {
        const { name, grams } = parseIngredient(ing)
        const cleanName = name.replace(/^[\d./½¼¾\s]+/, '').replace(/,.*/, '').trim()
        if (!cleanName || cleanName.length < 2) return null

        const searchRes = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(cleanName)}&pageSize=1&dataType=SR%20Legacy,Foundation&api_key=${USDA_KEY}`,
          { signal: AbortSignal.timeout(4000) }
        )
        if (!searchRes.ok) return null
        const data = await searchRes.json()
        const food = data.foods?.[0]
        if (!food) return null

        const getNutrient = (id) => food.foodNutrients?.find(n => n.nutrientId === id)?.value || 0
        const factor = grams / 100 // USDA values are per 100g — BUG-7 fix

        return {
          name: cleanName,
          original: ing,
          grams: Math.round(grams),
          calories: Math.round(getNutrient(1008) * factor),
          protein:  Math.round(getNutrient(1003) * factor * 10) / 10,
          carbs:    Math.round(getNutrient(1005) * factor * 10) / 10,
          fat:      Math.round(getNutrient(1004) * factor * 10) / 10,
          fiber:    Math.round(getNutrient(1079) * factor * 10) / 10,
          sodium:   Math.round(getNutrient(1093) * factor),
        }
      })
    )

    const breakdown = results.filter(r => r.status==='fulfilled' && r.value).map(r => r.value)
    if (!breakdown.length) return res.status(404).json({ error: 'Could not find nutrition data' })

    const totals = breakdown.reduce((acc, f) => ({
      calories: acc.calories + f.calories, protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs, fat: acc.fat + f.fat,
      fiber: acc.fiber + f.fiber, sodium: acc.sodium + f.sodium,
    }), { calories:0, protein:0, carbs:0, fat:0, fiber:0, sodium:0 })

    const servings = req.body.servings || 4
    res.json({
      totals,
      perServing: {
        calories: Math.round(totals.calories/servings),
        protein:  Math.round(totals.protein/servings*10)/10,
        carbs:    Math.round(totals.carbs/servings*10)/10,
        fat:      Math.round(totals.fat/servings*10)/10,
        fiber:    Math.round(totals.fiber/servings*10)/10,
      },
      breakdown, servings, source: 'USDA FoodData Central'
    })
  } catch (err) {
    console.error('Nutrition error:', err)
    res.status(500).json({ error: 'Nutrition lookup failed' })
  }
})

app.listen(PORT, () => console.log(`🍽  Dishcovery v6 on port ${PORT} | Spoonacular: ${!!SPOON}`))
