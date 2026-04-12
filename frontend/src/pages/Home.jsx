import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import MealCard from '../components/MealCard'
import toast from 'react-hot-toast'
import { FiSearch, FiX, FiChevronDown, FiGlobe, FiSliders } from 'react-icons/fi'

const MEALDB   = 'https://www.themealdb.com/api/json/v1/1'
const API      = import.meta.env.VITE_API_URL
const PAGE_SIZE = 20

const CUISINES = [
  { label: 'All cuisines', value: null },
  { label: '🇮🇳 Indian',    value: 'Indian' },
  { label: '🇮🇹 Italian',   value: 'Italian' },
  { label: '🇨🇳 Chinese',   value: 'Chinese' },
  { label: '🇲🇽 Mexican',   value: 'Mexican' },
  { label: '🇯🇵 Japanese',  value: 'Japanese' },
  { label: '🇹🇭 Thai',      value: 'Thai' },
  { label: '🇬🇧 British',   value: 'British' },
  { label: '🇫🇷 French',    value: 'French' },
  { label: '🇺🇸 American',  value: 'American' },
  { label: '🇬🇷 Greek',     value: 'Greek' },
  { label: '🇪🇸 Spanish',   value: 'Spanish' },
  { label: '🇵🇱 Polish',    value: 'Polish' },
]

const DIETS = [
  { label: 'All types',     value: null },
  { label: '🥗 Vegetarian', value: 'Vegetarian' },
  { label: '🌱 Vegan',      value: 'Vegan' },
  { label: '🍗 Chicken',    value: 'Chicken' },
  { label: '🥩 Beef',       value: 'Beef' },
  { label: '🐟 Seafood',    value: 'Seafood' },
  { label: '🍮 Dessert',    value: 'Dessert' },
  { label: '🐑 Lamb',       value: 'Lamb' },
  { label: '🐷 Pork',       value: 'Pork' },
  { label: '🍝 Pasta',      value: 'Pasta' },
]

function Dropdown({ label, icon: Icon, options, selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = options.find(o => o.value === selected)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all bg-white"
        style={{
          borderColor: selected ? '#D85A30' : '#e5e7eb',
          color: selected ? '#D85A30' : '#374151',
          boxShadow: selected ? '0 0 0 2px rgba(216,90,48,0.12)' : 'none',
        }}>
        <Icon size={15} />
        <span>{current?.label || label}</span>
        <FiChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 z-50 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
            style={{ minWidth: 180 }}
          >
            {options.map(opt => (
              <button key={opt.label} onClick={() => { onSelect(opt.value); setOpen(false) }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50"
                style={{ color: opt.value === selected ? '#D85A30' : '#374151', fontWeight: opt.value === selected ? 700 : 400 }}>
                {opt.label}
                {opt.value === selected && <span className="ml-auto text-xs">✓</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Home({ user }) {
  const [meals, setMeals]         = useState([])
  const [allMeals, setAllMeals]   = useState([])
  const [favorites, setFavorites] = useState({})
  const [search, setSearch]       = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [loading, setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cuisine, setCuisine]     = useState(null)
  const [diet, setDiet]           = useState(null)
  const [page, setPage]           = useState(1)
  const [hasMore, setHasMore]     = useState(false)
  const [source, setSource]       = useState('mealdb')

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'favorites'), where('uid', '==', user.uid))
    const unsub = onSnapshot(q, snap => {
      const map = {}
      snap.forEach(d => { map[d.data().idMeal] = d.id })
      setFavorites(map)
    })
    return unsub
  }, [user])

  useEffect(() => { loadPopular() }, [])

  const loadPopular = async () => {
    setLoading(true)
    setActiveQuery('')
    setCuisine(null)
    setDiet(null)
    setSource('mealdb')
    try {
      const areas = ['Indian','Italian','Chinese','Mexican','Japanese','Thai','British','French','American','Greek']
      const results = await Promise.all(areas.map(a => fetch(`${MEALDB}/filter.php?a=${a}`).then(r => r.json())))
      const combined = results.flatMap((r, i) =>
        (r.meals || []).slice(0, 5).map(m => ({ ...m, strArea: areas[i] }))
      ).sort(() => Math.random() - 0.5)
      setAllMeals(combined)
      setMeals(combined.slice(0, PAGE_SIZE))
      setHasMore(combined.length > PAGE_SIZE)
      setPage(1)
    } catch { toast.error('Could not load meals.') }
    finally { setLoading(false) }
  }

  const handleSearch = async (e) => {
    e?.preventDefault()
    const q = search.trim()
    if (!q) return
    setLoading(true)
    setActiveQuery(q)
    setCuisine(null)
    setDiet(null)
    try {
      // Try Spoonacular first
      const spoonRes = await fetch(`${API}/api/spoon/search?q=${encodeURIComponent(q)}&number=40`)
      if (spoonRes.ok) {
        const spoonData = await spoonRes.json()
        if (spoonData.results?.length > 0) {
          const mapped = spoonData.results.map(r => ({
            idMeal: String(r.id), strMeal: r.title,
            strMealThumb: r.image,
            strCategory: r.dishTypes?.[0] || '',
            strArea: r.cuisines?.[0] || '',
            vegetarian: r.vegetarian, vegan: r.vegan,
            _source: 'spoon',
          }))
          setAllMeals(mapped); setMeals(mapped.slice(0, PAGE_SIZE))
          setHasMore(mapped.length > PAGE_SIZE); setPage(1); setSource('spoon')
          setLoading(false); return
        }
      }
    } catch {}

    // MealDB fallback
    try {
      const res = await fetch(`${MEALDB}/search.php?s=${encodeURIComponent(q)}`)
      const data = await res.json()
      const found = data.meals || []
      setAllMeals(found); setMeals(found.slice(0, PAGE_SIZE))
      setHasMore(found.length > PAGE_SIZE); setPage(1); setSource('mealdb')
      if (!found.length) toast(`No results for "${q}"`, { icon: '🔍', duration: 4000 })
    } catch { toast.error('Search failed.') }
    finally { setLoading(false) }
  }

  const handleCuisine = async (val) => {
    setCuisine(val); setSearch(''); setActiveQuery(''); setDiet(null)
    if (!val) { loadPopular(); return }
    setLoading(true); setSource('mealdb')
    try {
      const res = await fetch(`${MEALDB}/filter.php?a=${encodeURIComponent(val)}`)
      const data = await res.json()
      const found = (data.meals || []).map(m => ({ ...m, strArea: val }))
      setAllMeals(found); setMeals(found.slice(0, PAGE_SIZE))
      setHasMore(found.length > PAGE_SIZE); setPage(1)
    } catch { toast.error('Could not load cuisine.') }
    finally { setLoading(false) }
  }

  const handleDiet = async (val) => {
    setDiet(val); setSearch(''); setActiveQuery(''); setCuisine(null)
    if (!val) { loadPopular(); return }
    setLoading(true); setSource('mealdb')
    try {
      const res = await fetch(`${MEALDB}/filter.php?c=${encodeURIComponent(val)}`)
      const data = await res.json()
      const found = data.meals || []
      setAllMeals(found); setMeals(found.slice(0, PAGE_SIZE))
      setHasMore(found.length > PAGE_SIZE); setPage(1)
    } catch { toast.error('Could not filter meals.') }
    finally { setLoading(false) }
  }

  const loadMore = async () => {
    const nextPage = page + 1
    setLoadingMore(true)
    if (source === 'mealdb') {
      const nextSlice = allMeals.slice(0, nextPage * PAGE_SIZE)
      setMeals(nextSlice)
      setHasMore(nextSlice.length < allMeals.length)
      setPage(nextPage)
      setLoadingMore(false)
    } else {
      try {
        const offset = page * PAGE_SIZE
        const res = await fetch(`${API}/api/spoon/search?q=${encodeURIComponent(activeQuery)}&number=${PAGE_SIZE}&offset=${offset}`)
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

  const toggleFav = async (meal) => {
    if (favorites[meal.idMeal]) {
      await deleteDoc(doc(db, 'favorites', favorites[meal.idMeal]))
      toast('Removed from favourites', { icon: '💔' })
    } else {
      await addDoc(collection(db, 'favorites'), {
        idMeal: meal.idMeal, strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb, uid: user.uid, addedAt: new Date()
      })
      toast.success('Saved to favourites!')
    }
  }

  const clearAll = () => { setSearch(''); loadPopular() }

  const resultLabel = activeQuery
    ? `Results for "${activeQuery}" — ${meals.length} shown`
    : cuisine ? `${CUISINES.find(c=>c.value===cuisine)?.label} — ${meals.length} dishes`
    : diet    ? `${DIETS.find(d=>d.value===diet)?.label} — ${meals.length} dishes`
    : `Popular meals — ${meals.length} shown`

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Search hero */}
      <div style={{ background: 'linear-gradient(135deg, #993C1D 0%, #D85A30 100%)' }} className="pt-10 pb-8 px-4">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
            Find your next favourite meal
          </h1>
          <p className="text-orange-100 text-sm mb-6">
            Search anything — biryani, pasta, ramen, tacos. Powered by MealDB + Spoonacular
          </p>
          <form onSubmit={handleSearch} className="flex gap-0 bg-white rounded-2xl overflow-hidden shadow-lg">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="e.g. butter chicken, ramen, tiramisu…"
                className="w-full pl-11 pr-4 py-4 text-base outline-none bg-transparent text-gray-800 placeholder:text-gray-400" />
              {search && (
                <button type="button" onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FiX size={16} />
                </button>
              )}
            </div>
            <button type="submit"
              className="px-7 font-bold text-base text-white transition-all"
              style={{ background: '#D85A30' }}>
              Search
            </button>
          </form>
        </motion.div>
      </div>

      {/* Filter bar — dropdowns */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Dropdown
            label="Cuisine"
            icon={FiGlobe}
            options={CUISINES}
            selected={cuisine}
            onSelect={handleCuisine}
          />
          <Dropdown
            label="Diet / Type"
            icon={FiSliders}
            options={DIETS}
            selected={diet}
            onSelect={handleDiet}
          />
          {(cuisine || diet || activeQuery) && (
            <button onClick={clearAll}
              className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1">
              <FiX size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 font-medium">{resultLabel}</p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#D85A30', borderTopColor: 'transparent' }} />
          </div>
        )}

        {!loading && meals.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <div className="text-5xl mb-4">🍽</div>
            <p className="text-gray-700 text-lg font-semibold mb-2">No meals found</p>
            <p className="text-gray-400 text-sm mb-6">Try different search terms like "chicken", "biryani" or "pasta"</p>
            <button onClick={clearAll} className="btn-primary">Back to popular</button>
          </motion.div>
        )}

        {!loading && meals.length > 0 && (
          <>
            <AnimatePresence mode="wait">
              <motion.div key={activeQuery + cuisine + diet}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {meals.map((meal, i) => (
                  <motion.div key={meal.idMeal + i}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}>
                    <MealCard meal={meal} isFavorite={!!favorites[meal.idMeal]} onToggleFav={toggleFav} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <motion.button whileTap={{ scale: 0.97 }} onClick={loadMore} disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-sm border-2 transition-all disabled:opacity-50"
                  style={{ borderColor: '#D85A30', color: '#D85A30' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#D85A30'; e.currentTarget.style.color='white' }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#D85A30' }}>
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
