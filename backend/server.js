require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const app    = express()
const PORT   = process.env.PORT   || 5000
const MEALDB = process.env.MEALDB_BASE_URL || 'https://www.themealdb.com/api/json/v1/1'
const SPOON  = process.env.SPOONACULAR_API_KEY || ''
const SPOON_URL = 'https://api.spoonacular.com'

app.use(cors())
app.use(express.json())

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    spoonacular: !!SPOON,
  })
})

// ── Spoonacular: complex search ────────────────────────────────────────────
app.get('/api/spoon/search', async (req, res) => {
  if (!SPOON) return res.status(503).json({ error: 'Spoonacular not configured' })
  try {
    const { q, offset = 0, number = 20, cuisine, diet } = req.query
    const params = new URLSearchParams({
      query: q || '',
      number,
      offset,
      addRecipeInformation: true,
      addRecipeNutrition: false,
      apiKey: SPOON,
    })
    if (cuisine) params.append('cuisine', cuisine)
    if (diet)    params.append('diet', diet)

    const response = await fetch(`${SPOON_URL}/recipes/complexSearch?${params}`)
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Spoonacular search failed' })
  }
})

// ── Spoonacular: cuisine browse (for filter by cuisine) ───────────────────
app.get('/api/spoon/cuisine', async (req, res) => {
  if (!SPOON) return res.status(503).json({ error: 'Spoonacular not configured' })
  try {
    const { cuisine, offset = 0, number = 20, diet } = req.query
    const params = new URLSearchParams({
      query: '',
      number,
      offset,
      addRecipeInformation: true,
      apiKey: SPOON,
      cuisine: cuisine || '',
    })
    if (diet) params.append('diet', diet)

    const response = await fetch(`${SPOON_URL}/recipes/complexSearch?${params}`)
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Spoonacular cuisine failed' })
  }
})

// ── Spoonacular: recipe details ────────────────────────────────────────────
app.get('/api/spoon/recipe/:id', async (req, res) => {
  if (!SPOON) return res.status(503).json({ error: 'Spoonacular not configured' })
  try {
    const response = await fetch(
      `${SPOON_URL}/recipes/${req.params.id}/information?apiKey=${SPOON}&includeNutrition=true`
    )
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Spoonacular recipe failed' })
  }
})

// ── MealDB: search ─────────────────────────────────────────────────────────
app.get('/api/search', async (req, res) => {
  try {
    const response = await fetch(`${MEALDB}/search.php?s=${encodeURIComponent(req.query.q || '')}`)
    res.json(await response.json())
  } catch { res.status(500).json({ error: 'Search failed' }) }
})

app.get('/api/meal/:id', async (req, res) => {
  try {
    const response = await fetch(`${MEALDB}/lookup.php?i=${req.params.id}`)
    res.json(await response.json())
  } catch { res.status(500).json({ error: 'Failed' }) }
})

app.get('/api/popular', async (req, res) => {
  try {
    const areas = ['Indian','Italian','Chinese','Mexican','Japanese','Thai','British','French','American','Greek']
    const results = await Promise.all(areas.map(a => fetch(`${MEALDB}/filter.php?a=${a}`).then(r => r.json()).catch(() => ({ meals:[] }))))
    const combined = results.flatMap((r,i) => (r.meals||[]).map(m => ({ ...m, strArea: areas[i] }))).sort(() => Math.random() - 0.5)
    res.json({ meals: combined })
  } catch { res.status(500).json({ error: 'Failed' }) }
})

app.get('/api/filter', async (req, res) => {
  try {
    const { c, a } = req.query
    const url = c ? `${MEALDB}/filter.php?c=${encodeURIComponent(c)}` : `${MEALDB}/filter.php?a=${encodeURIComponent(a||'')}`
    res.json(await fetch(url).then(r => r.json()))
  } catch { res.status(500).json({ error: 'Failed' }) }
})


// ── Groq AI chat (Issue #1 — key stays server-side) ──────────────────────
app.post('/api/chat', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY || ''
  if (!GROQ_KEY) return res.status(503).json({ error: 'Groq not configured. Add GROQ_API_KEY to Render env vars.' })
  try {
    const { messages, systemPrompt } = req.body
    // Build full message array with system prompt prepended
    const fullMessages = [
      { role: 'system', content: systemPrompt || 'You are Chef Dish, a helpful cooking assistant.' },
      ...messages
    ]
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: fullMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })
    const data = await response.json()
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'Groq error' })
    res.json({ reply: data.choices?.[0]?.message?.content || '' })
  } catch (err) {
    res.status(500).json({ error: 'Chat failed' })
  }
})


// ── AI suggestion for no-results fallback (#20) ───────────────────────────
app.post('/api/suggest', async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY || ''
  if (!GROQ_KEY) return res.status(503).json({ error: 'Groq not configured' })
  try {
    const { query } = req.body
    const prompt = `The user searched for "${query}" in a recipe app but got no results. Give a SHORT helpful response (max 4 sentences) with: a brief description of what this dish is, key ingredients (3-4 max), and suggest they try Chef Dish chatbot for the full recipe. Keep it warm and friendly. No markdown.`
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({ model: 'llama3-8b-8192', messages: [{ role: 'user', content: prompt }], max_tokens: 150 })
    })
    const d = await r.json()
    res.json({ suggestion: d.choices?.[0]?.message?.content || '' })
  } catch { res.status(500).json({ error: 'Suggestion failed' }) }
})


// ── Calorie Calculator (USDA FoodData Central — 100% free, no signup) ─────
// Uses the public demo key. For production get a free key at fdc.nal.usda.gov/api-guide
const USDA_KEY = process.env.USDA_API_KEY || 'DEMO_KEY'

app.post('/api/nutrition', async (req, res) => {
  try {
    const { ingredients } = req.body
    if (!ingredients?.length) return res.status(400).json({ error: 'No ingredients' })

    // Look up each ingredient in USDA database and sum nutrients
    const results = await Promise.allSettled(
      ingredients.slice(0, 15).map(async (ing) => {
        // Clean ingredient name (remove quantities like "2 cups", "1 tbsp")
        const name = ing.replace(/^[\d./\s]+(cup|tbsp|tsp|oz|g|kg|lb|ml|l|clove|bunch|pinch|handful|slice|piece|can|large|medium|small|whole|fresh|dried|chopped|minced|diced|grated|cooked|raw|to taste)s?\s*/gi, '').trim()
        if (!name || name.length < 2) return null

        const searchRes = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(name)}&pageSize=1&dataType=SR%20Legacy,Foundation&api_key=${USDA_KEY}`,
          { signal: AbortSignal.timeout(4000) }
        )
        if (!searchRes.ok) return null
        const data = await searchRes.json()
        const food = data.foods?.[0]
        if (!food) return null

        const getNutrient = (id) => food.foodNutrients?.find(n => n.nutrientId === id)?.value || 0

        return {
          name: food.description,
          original: ing,
          calories: Math.round(getNutrient(1008)),  // Energy kcal
          protein:  Math.round(getNutrient(1003) * 10) / 10,  // Protein
          carbs:    Math.round(getNutrient(1005) * 10) / 10,  // Carbohydrate
          fat:      Math.round(getNutrient(1004) * 10) / 10,  // Total fat
          fiber:    Math.round(getNutrient(1079) * 10) / 10,  // Fiber
          sodium:   Math.round(getNutrient(1093)),             // Sodium mg
        }
      })
    )

    const breakdown = results
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => r.value)

    if (!breakdown.length) {
      // Return 200 so frontend .then() fires (not .catch()) and can show the error state
      return res.json({ totals: null, breakdown: [], error: 'No nutrition data found' })
    }

    const totals = breakdown.reduce((acc, f) => ({
      calories: acc.calories + f.calories,
      protein:  acc.protein  + f.protein,
      carbs:    acc.carbs    + f.carbs,
      fat:      acc.fat      + f.fat,
      fiber:    acc.fiber    + f.fiber,
      sodium:   acc.sodium   + f.sodium,
    }), { calories:0, protein:0, carbs:0, fat:0, fiber:0, sodium:0 })

    const servings = req.body.servings || 4
    const perServing = {
      calories: Math.round(totals.calories / servings),
      protein:  Math.round(totals.protein  / servings * 10) / 10,
      carbs:    Math.round(totals.carbs    / servings * 10) / 10,
      fat:      Math.round(totals.fat      / servings * 10) / 10,
      fiber:    Math.round(totals.fiber    / servings * 10) / 10,
    }

    res.json({ totals, perServing, breakdown, servings, source: 'USDA FoodData Central' })
  } catch (err) {
    console.error('Nutrition error:', err)
    res.status(500).json({ error: 'Nutrition lookup failed' })
  }
})

app.listen(PORT, () => console.log(`🍽  Dishcovery backend on port ${PORT} | Spoonacular: ${!!SPOON}`))
