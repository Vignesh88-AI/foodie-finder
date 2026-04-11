require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const app     = express()
const PORT    = process.env.PORT    || 5000
const MEALDB  = process.env.MEALDB_BASE_URL    || 'https://www.themealdb.com/api/json/v1/1'
const SPOON   = process.env.SPOONACULAR_API_KEY || ''
const SPOON_URL = 'https://api.spoonacular.com'

app.use(cors())
app.use(express.json())

// ── MealDB routes ──────────────────────────────────────────────────────────

app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query
    const response = await fetch(`${MEALDB}/search.php?s=${encodeURIComponent(q || '')}`)
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Search failed' })
  }
})

app.get('/api/meal/:id', async (req, res) => {
  try {
    const response = await fetch(`${MEALDB}/lookup.php?i=${req.params.id}`)
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meal' })
  }
})

app.get('/api/popular', async (req, res) => {
  try {
    const [indian, chicken, seafood] = await Promise.all([
      fetch(`${MEALDB}/filter.php?a=Indian`).then(r => r.json()),
      fetch(`${MEALDB}/filter.php?c=Chicken`).then(r => r.json()),
      fetch(`${MEALDB}/filter.php?c=Seafood`).then(r => r.json()),
    ])
    const combined = [
      ...(indian.meals  || []).slice(0, 6),
      ...(chicken.meals || []).slice(0, 6),
      ...(seafood.meals || []).slice(0, 6),
    ].sort(() => Math.random() - 0.5)
    res.json({ meals: combined })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch popular meals' })
  }
})

app.get('/api/filter', async (req, res) => {
  try {
    const { c, a } = req.query
    let url = c ? `${MEALDB}/filter.php?c=${encodeURIComponent(c)}`
                : `${MEALDB}/filter.php?a=${encodeURIComponent(a || '')}`
    const response = await fetch(url)
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to filter meals' })
  }
})

// ── Spoonacular routes ─────────────────────────────────────────────────────

// Search with Spoonacular — handles Indian food like chole bhature, biryani, etc.
app.get('/api/spoon/search', async (req, res) => {
  if (!SPOON) return res.status(503).json({ error: 'Spoonacular not configured' })
  try {
    const { q, offset = 0, number = 20, diet, cuisine } = req.query
    const params = new URLSearchParams({
      query:        q || '',
      number:       number,
      offset:       offset,
      addRecipeInformation: true,
      fillIngredients: false,
      apiKey:       SPOON,
      ...(diet    && { diet }),
      ...(cuisine && { cuisine }),
    })
    const response = await fetch(`${SPOON_URL}/recipes/complexSearch?${params}`)
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Spoonacular search failed' })
  }
})

// Get more meals by category from Spoonacular
app.get('/api/spoon/category', async (req, res) => {
  if (!SPOON) return res.status(503).json({ error: 'Spoonacular not configured' })
  try {
    const { cuisine, diet, type, offset = 0, number = 20 } = req.query
    const params = new URLSearchParams({
      number, offset, addRecipeInformation: true, apiKey: SPOON,
      ...(cuisine && { cuisine }),
      ...(diet    && { diet }),
      ...(type    && { type }),
    })
    const response = await fetch(`${SPOON_URL}/recipes/complexSearch?${params}`)
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Spoonacular category failed' })
  }
})

// Get recipe detail from Spoonacular
app.get('/api/spoon/recipe/:id', async (req, res) => {
  if (!SPOON) return res.status(503).json({ error: 'Spoonacular not configured' })
  try {
    const response = await fetch(`${SPOON_URL}/recipes/${req.params.id}/information?apiKey=${SPOON}&includeNutrition=false`)
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Spoonacular recipe failed' })
  }
})

app.listen(PORT, () => {
  console.log(`🍽  Dishcovery backend running on port ${PORT}`)
})
