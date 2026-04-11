import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import MealCard from '../components/MealCard'
import toast from 'react-hot-toast'
import { FiSearch, FiX, FiSliders, FiChevronDown } from 'react-icons/fi'

const MEALDB = 'https://www.themealdb.com/api/json/v1/1'
const API    = import.meta.env.VITE_API_URL

// Veg category names from MealDB
const VEG_CATEGORIES = ['Vegetarian', 'Vegan', 'Dessert', 'Pasta', 'Miscellaneous', 'Starter', 'Breakfast', 'Side', 'Goat']

const isVeg = (meal) => {
  const cat = meal.strCategory || ''
  return VEG_CATEGORIES.some(v => cat.toLowerCase().includes(v.toLowerCase()))
}

const CUISINES = [
  { label: 'All',        type: 'popular', value: null },
  { label: '🇮🇳 Indian',   type: 'area',    value: 'Indian' },
  { label: '🇮🇹 Italian',  type: 'area',    value: 'Italian' },
  { label: '🇨🇳 Chinese',  type: 'area',    value: 'Chinese' },
  { label: '🇲🇽 Mexican',  type: 'area',    value: 'Mexican' },
  { label: '🇯🇵 Japanese', type: 'area',    value: 'Japanese' },
  { label: '🇹🇭 Thai',     type: 'area',    value: 'Thai' },
  { label: '🇬🇧 British',  type: 'area',    value: 'British' },
  { label: '🇫🇷 French',   type: 'area',    value: 'French' },
  { label: '🇺🇸 American', type: 'area',    value: 'American' },
  { label: '🇬🇷 Greek',    type: 'area',    value: 'Greek' },
  { label: '🇪🇸 Spanish',  type: 'area',    value: 'Spanish' },
]

const DIETS = [
  { label: 'All',           value: null },
  { label: '🥗 Vegetarian',  value: 'Vegetarian' },
  { label: '🌱 Vegan',       value: 'Vegan' },
  { label: '🍗 Chicken',     value: 'Chicken' },
  { label: '🥩 Beef',        value: 'Beef' },
  { label: '🐟 Seafood',     value: 'Seafood' },
  { label: '🍮 Dessert',     value: 'Dessert' },
  { label: '🐑 Lamb',        value: 'Lamb' },
  { label: '🐷 Pork',        value: 'Pork' },
  { label: '🍝 Pasta',       value: 'Pasta' },
  { label: '🌾 Miscellaneous',value: 'Miscellaneous' },
]

const PAGE_SIZE = 20

export default function Home({ user }) {
  const [meals, setMeals]             = useState([])
  const [allMeals, setAllMeals]       = useState([])  // full list for load more
  const [favorites, setFavorites]     = useState({})
  const [search, setSearch]           = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cuisine, setCuisine]         = useState(CUISINES[0])
  const [diet, setDiet]               = useState(DIETS[0])
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage]               = useState(1)
  const [hasMore, setHasMore]         = useState(false)
  const [source, setSource]           = useState('mealdb') // 'mealdb' or 'spoon'

  // Live favorites
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'favorites'), where('uid', '==', user.uid))
    const unsub = onSnapshot(q, (snap) => {
      const map = {}
      snap.forEach((d) => { map[d.data().idMeal] = d.id })
      setFavorites(map)
    })
    return unsub
  }, [user])

  useEffect(() => { loadPopular() }, [])

  // ── Load popular — mix of Indian + others ──────────────────────
  const loadPopular = async () => {
    setLoading(true)
    setActiveQuery('')
    setSource('mealdb')
    try {
      const areas = ['Indian', 'Italian', 'Chinese', 'Mexican', 'Japanese', 'Thai', 'British', 'French', 'American', 'Greek']
      const results = await Promise.all(areas.map(a => fetch(`${MEALDB}/filter.php?a=${a}`).then(r => r.json())))
      const combined = results.flatMap((r, i) => (r.meals || []).slice(0, 6))
        .sort(() => Math.random() - 0.5)
      setAllMeals(combined)
      setMeals(combined.slice(0, PAGE_SIZE))
      setHasMore(combined.length > PAGE_SIZE)
      setPage(1)
    } catch {
      toast.error('Could not load meals.')
    } finally {
      setLoading(false)
    }
  }

  // ── Search — uses Spoonacular if available, else MealDB ────────
  const handleSearch = async (e) => {
    e.preventDefault()
    const q = search.trim()
    if (!q) return
    setLoading(true)
    setActiveQuery(q)
    setCuisine(CUISINES[0])
    setDiet(DIETS[0])

    try {
      // Try backend Spoonacular search first
      const spoonRes = await fetch(`${API}/api/spoon/search?q=${encodeURIComponent(q)}&number=40`)
      if (spoonRes.ok) {
        const spoonData = await spoonRes.json()
        if (spoonData.results && spoonData.results.length > 0) {
          // Map Spoonacular format to MealDB-like format
          const mapped = spoonData.results.map(r => ({
            idMeal:       String(r.id),
            strMeal:      r.title,
            strMealThumb: r.image,
            strCategory:  r.dishTypes?.[0] || 'Unknown',
            strArea:      r.cuisines?.[0]  || '',
            vegetarian:   r.vegetarian,
            vegan:        r.vegan,
            _source:      'spoon',
          }))
          setAllMeals(mapped)
          setMeals(mapped.slice(0, PAGE_SIZE))
          setHasMore(mapped.length > PAGE_SIZE)
          setPage(1)
          setSource('spoon')
          setLoading(false)
          return
        }
      }
    } catch { /* fallthrough to MealDB */ }

    // Fallback to MealDB search
    try {
      const res  = await fetch(`${MEALDB}/search.php?s=${encodeURIComponent(q)}`)
      const data = await res.json()
      const found = data.meals || []
      setAllMeals(found)
      setMeals(found.slice(0, PAGE_SIZE))
      setHasMore(found.length > PAGE_SIZE)
      setPage(1)
      setSource('mealdb')
      if (!found.length) toast(`No results for "${q}" — try simpler terms like "chicken" or "rice"`, { icon: '🔍', duration: 4000 })
    } catch {
      toast.error('Search failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => { setSearch(''); setCuisine(CUISINES[0]); setDiet(DIETS[0]); loadPopular() }

  // ── Cuisine filter ─────────────────────────────────────────────
  const handleCuisine = async (c) => {
    setCuisine(c); setSearch(''); setActiveQuery(''); setDiet(DIETS[0])
    if (c.type === 'popular') { loadPopular(); return }
    setLoading(true); setSource('mealdb')
    try {
      const res  = await fetch(`${MEALDB}/filter.php?a=${encodeURIComponent(c.value)}`)
      const data = await res.json()
      const found = data.meals || []
      setAllMeals(found)
      setMeals(found.slice(0, PAGE_SIZE))
      setHasMore(found.length > PAGE_SIZE)
      setPage(1)
    } catch { toast.error('Could not load cuisine.') }
    finally { setLoading(false) }
  }

  // ── Diet filter ────────────────────────────────────────────────
  const handleDiet = async (d) => {
    setDiet(d); setSearch(''); setActiveQuery(''); setCuisine(CUISINES[0])
    if (!d.value) { loadPopular(); return }
    setLoading(true); setSource('mealdb')
    try {
      const res  = await fetch(`${MEALDB}/filter.php?c=${encodeURIComponent(d.value)}`)
      const data = await res.json()
      const found = data.meals || []
      setAllMeals(found)
      setMeals(found.slice(0, PAGE_SIZE))
      setHasMore(found.length > PAGE_SIZE)
      setPage(1)
    } catch { toast.error('Could not filter meals.') }
    finally { setLoading(false) }
  }

  // ── Load more ──────────────────────────────────────────────────
  const loadMore = async () => {
    const nextPage = page + 1
    setLoadingMore(true)

    if (source === 'mealdb') {
      // Load more from already-fetched allMeals
      const nextSlice = allMeals.slice(0, nextPage * PAGE_SIZE)
      setMeals(nextSlice)
      setHasMore(nextSlice.length < allMeals.length)
      setPage(nextPage)
      setLoadingMore(false)
    } else {
      // Load more from Spoonacular with offset
      try {
        const offset = page * PAGE_SIZE
        const res  = await fetch(`${API}/api/spoon/search?q=${encodeURIComponent(activeQuery)}&number=${PAGE_SIZE}&offset=${offset}`)
        const data = await res.json()
        const mapped = (data.results || []).map(r => ({
          idMeal: String(r.id), strMeal: r.title, strMealThumb: r.image,
          strCategory: r.dishTypes?.[0] || '', strArea: r.cuisines?.[0] || '',
          vegetarian: r.vegetarian, vegan: r.vegan, _source: 'spoon',
        }))
        setMeals(prev => [...prev, ...mapped])
        setHasMore(mapped.length === PAGE_SIZE)
        setPage(nextPage)
      } catch { toast.error('Could not load more.') }
      finally { setLoadingMore(false) }
    }
  }

  // ── Fav toggle ─────────────────────────────────────────────────
  const toggleFav = async (meal) => {
    if (favorites[meal.idMeal]) {
      await deleteDoc(doc(db, 'favorites', favorites[meal.idMeal]))
      toast('Removed from favorites', { icon: '💔' })
    } else {
      await addDoc(collection(db, 'favorites'), {
        idMeal: meal.idMeal, strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb, uid: user.uid, addedAt: new Date()
      })
      toast.success('Saved to favorites!')
    }
  }

  const resultLabel = activeQuery
    ? `Results for "${activeQuery}" — ${meals.length} shown`
    : cuisine.value ? `${cuisine.label} cuisine`
    : diet.value    ? `${diet.label} meals`
    : `Popular meals — ${meals.length} shown`

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero search */}
      <div className="bg-gradient-to-br from-brand-700 via-brand-500 to-brand-400 pt-10 pb-8 px-4">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
            Find your next favourite meal
          </h1>
          <p className="text-orange-100 text-sm mb-6">
            Search anything — biryani, pasta, ramen, tacos. Powered by MealDB + Spoonacular
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. butter chicken, ramen, tiramisu…"
                className="input pl-11 pr-10 h-12 text-base rounded-2xl"
              />
              {search && (
                <button type="button" onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FiX size={18} />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary h-12 px-6 rounded-2xl text-base whitespace-nowrap">
              Search
            </button>
          </form>
        </motion.div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="overflow-x-auto">
            <div className="flex gap-2 py-2.5 w-max min-w-full">
              {CUISINES.map((c) => (
                <motion.button key={c.label} whileTap={{ scale: 0.95 }}
                  onClick={() => handleCuisine(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    cuisine.label === c.label ? 'bg-brand-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {c.label}
                </motion.button>
              ))}
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`ml-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  diet.value ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                <FiSliders size={14} />
                {diet.value ? diet.label : 'Diet'}
                <FiChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                <div className="flex gap-2 pb-2.5 overflow-x-auto w-max min-w-full">
                  {DIETS.map((d) => (
                    <motion.button key={d.label} whileTap={{ scale: 0.95 }}
                      onClick={() => { handleDiet(d); setShowFilters(false) }}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        diet.label === d.label ? 'bg-violet-500 text-white' : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                      }`}>
                      {d.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 font-medium">{resultLabel}</p>
          {(activeQuery || cuisine.value || diet.value) && (
            <button onClick={handleClear} className="text-sm text-brand-500 hover:text-brand-600 font-medium">
              Clear filters
            </button>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && meals.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <div className="text-5xl mb-4">🍽</div>
            <p className="text-gray-700 text-lg font-semibold mb-2">No meals found</p>
            <p className="text-gray-400 text-sm mb-2">MealDB has limited Indian dishes.</p>
            <p className="text-gray-400 text-sm mb-6">Try: <strong>chicken</strong>, <strong>butter masala</strong>, <strong>biryani</strong>, <strong>korma</strong></p>
            <button onClick={handleClear} className="btn-primary">Back to popular</button>
          </motion.div>
        )}

        {!loading && meals.length > 0 && (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeQuery + cuisine.label + diet.label}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {meals.map((meal, i) => (
                  <motion.div key={meal.idMeal + i}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}>
                    <MealCard
                      meal={meal}
                      isFavorite={!!favorites[meal.idMeal]}
                      onToggleFav={toggleFav}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Load more button */}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-sm border-2 border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white transition-all disabled:opacity-50"
                >
                  {loadingMore
                    ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Loading...</>
                    : <><FiChevronDown size={16} /> Load more meals</>
                  }
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
