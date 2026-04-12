require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const app    = express()
const PORT   = process.env.PORT   || 5000
const MEALDB = process.env.MEALDB_BASE_URL || 'https://www.themealdb.com/api/json/v1/1'
const SPOON  = process.env.SPOONACULAR_API_KEY || ''
const SPOON_URL = 'https://api.spoonacular.com'

// Edamam demo keys (fallback when Spoonacular not configured)
const EDAMAM_ID  = process.env.EDAMAM_APP_ID  || 'f77c7e0e'
const EDAMAM_KEY = process.env.EDAMAM_APP_KEY || '43e8d41a5b2ed56c8d6d782c1d900e3e'
const EDAMAM_URL = 'https://api.edamam.com/api/recipes/v2'

app.use(cors())
app.use(express.json())

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    spoonacular: !!SPOON,
    edamam: !!(EDAMAM_ID && EDAMAM_KEY),
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

// ── Edamam: search (fallback when Spoonacular not set) ────────────────────
app.get('/api/edamam/search', async (req, res) => {
  try {
    const { q, from = 0, to = 20 } = req.query
    const params = new URLSearchParams({
      type: 'public', q: q || '',
      app_id: EDAMAM_ID, app_key: EDAMAM_KEY,
      from, to,
    })
    const response = await fetch(`${EDAMAM_URL}?${params}`)
    const data = await response.json()
    if (!response.ok) return res.status(response.status).json({ error: data.message || 'Edamam error' })
    const results = (data.hits || []).map(hit => ({
      idMeal: hit.recipe.uri.split('_')[1],
      strMeal: hit.recipe.label,
      strMealThumb: hit.recipe.images?.REGULAR?.url || hit.recipe.images?.SMALL?.url || hit.recipe.image,
      strArea: hit.recipe.cuisineType?.[0] || '',
      strCategory: hit.recipe.dishType?.[0] || '',
      calories: Math.round(hit.recipe.calories / (hit.recipe.yield || 1)),
      vegetarian: hit.recipe.healthLabels?.includes('Vegetarian') || false,
      vegan: hit.recipe.healthLabels?.includes('Vegan') || false,
      sourceUrl: hit.recipe.url,
      _source: 'edamam',
    }))
    res.json({ results, count: data.count || 0, from: data.from || 0, to: data.to || 0, nextPage: data._links?.next?.href || null })
  } catch (err) {
    res.status(500).json({ error: 'Edamam search failed' })
  }
})

// ── Edamam: cuisine browse ─────────────────────────────────────────────────
app.get('/api/edamam/cuisine', async (req, res) => {
  try {
    const { cuisineType, from = 0, to = 20 } = req.query
    const params = new URLSearchParams({
      type: 'public', q: cuisineType || 'food',
      app_id: EDAMAM_ID, app_key: EDAMAM_KEY,
      from, to, cuisineType: cuisineType || '',
    })
    const response = await fetch(`${EDAMAM_URL}?${params}`)
    const data = await response.json()
    const results = (data.hits || []).map(hit => ({
      idMeal: hit.recipe.uri.split('_')[1],
      strMeal: hit.recipe.label,
      strMealThumb: hit.recipe.images?.REGULAR?.url || hit.recipe.images?.SMALL?.url || hit.recipe.image,
      strArea: hit.recipe.cuisineType?.[0] || cuisineType,
      strCategory: hit.recipe.dishType?.[0] || '',
      calories: Math.round(hit.recipe.calories / (hit.recipe.yield || 1)),
      vegetarian: hit.recipe.healthLabels?.includes('Vegetarian') || false,
      vegan: hit.recipe.healthLabels?.includes('Vegan') || false,
      _source: 'edamam',
    }))
    res.json({ results, count: data.count || 0, nextPage: data._links?.next?.href || null })
  } catch (err) {
    res.status(500).json({ error: 'Edamam cuisine failed' })
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

app.listen(PORT, () => console.log(`🍽  Dishcovery backend on port ${PORT} | Spoonacular: ${!!SPOON}`))
