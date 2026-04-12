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

// MealDB area search keywords — searching by keyword gives MORE results than filter.php
const CUISINES = [
  { label: 'All cuisines', value: null, searchTerms: null },
  { label: '🇮🇳 Indian',    value: 'Indian',    searchTerms: ['indian','chicken tikka','biryani','curry','dal','paneer','korma','tandoori','masala','saag','chana','rajma','aloo','gobi','keema','rogan','haleem','nihari','pulao'] },
  { label: '🇮🇹 Italian',   value: 'Italian',   searchTerms: ['italian','pasta','pizza','risotto','carbonara','bolognese','lasagna','tiramisu','bruschetta','penne','fettuccine','spaghetti','ravioli','gnocchi'] },
  { label: '🇨🇳 Chinese',   value: 'Chinese',   searchTerms: ['chinese','kung pao','fried rice','dim sum','dumplings','wonton','noodle','chow mein','sweet sour','szechuan','peking','mapo','spring roll'] },
  { label: '🇲🇽 Mexican',   value: 'Mexican',   searchTerms: ['mexican','taco','burrito','quesadilla','enchilada','guacamole','salsa','fajita','tamale','chili','nachos'] },
  { label: '🇯🇵 Japanese',  value: 'Japanese',  searchTerms: ['japanese','sushi','ramen','tempura','miso','teriyaki','sashimi','udon','katsu','gyoza','takoyaki','yakitori','onigiri'] },
  { label: '🇹🇭 Thai',      value: 'Thai',      searchTerms: ['thai','pad thai','green curry','massaman','satay','tom kha','tom yum','sticky rice','basil chicken'] },
  { label: '🇬🇧 British',   value: 'British',   searchTerms: ['british','fish chips','pie','roast','pudding','scones','pasty','bangers','trifle','crumble'] },
  { label: '🇫🇷 French',    value: 'French',    searchTerms: ['french','croissant','baguette','quiche','ratatouille','crepe','bouillabaisse','coq au vin','souffle','eclairs'] },
  { label: '🇺🇸 American',  value: 'American',  searchTerms: ['american','burger','bbq','ribs','mac cheese','hot dog','pancake','brownie','cheesecake','clam chowder'] },
  { label: '🇬🇷 Greek',     value: 'Greek',     searchTerms: ['greek','moussaka','spanakopita','souvlaki','gyro','tzatziki','feta','baklava','dolmades'] },
  { label: '🇪🇸 Spanish',   value: 'Spanish',   searchTerms: ['spanish','paella','gazpacho','tortilla','churros','tapas','chorizo','sangria'] },
  { label: '🇵🇱 Polish',    value: 'Polish',    searchTerms: ['polish','pierogi','bigos','kielbasa','zurek','golabki'] },
]

const DIETS = [
  { label: 'All types',     value: null },
  { label: '🥗 Vegetarian', value: 'Vegetarian' },
  { label: '🌱 Vegan',      value: 'Vegan' },
  { label: '🍗 Chicken',    value: 'Chicken' },
  { label: '🥩 Beef',       value: 'Beef' },
  { label: '🐟 Seafood',    value: 'Seafood' },
  { label: '🍮 Dessert',    value: 'Dessert' },
  { label: '🍝 Pasta',      value: 'Pasta' },
]

function Dropdown({ label, icon: Icon, options, selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = options.find(o => o.value === selected)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border bg-white transition-all"
        style={{ borderColor: selected ? '#D85A30' : '#e5e7eb', color: selected ? '#D85A30' : '#374151', boxShadow: selected ? '0 0 0 2px rgba(216,90,48,0.12)' : 'none' }}>
        <Icon size={15} />
        <span className="max-w-[130px] truncate">{current?.label || label}</span>
        <FiChevronDown size={14} className={`transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:6, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:6, scale:0.97 }} transition={{ duration:0.14 }}
            className="absolute top-full mt-2 left-0 z-50 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-y-auto"
            style={{ minWidth: 180, maxHeight: 320 }}>
            {options.map(opt => (
              <button key={opt.label} onClick={() => { onSelect(opt.value); setOpen(false) }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors"
                style={{ color: opt.value === selected ? '#D85A30' : '#374151', fontWeight: opt.value === selected ? 700 : 400 }}>
                {opt.label}
                {opt.value === selected && <span className="ml-auto">✓</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Fetch ALL meals for a cuisine by searching multiple keywords through MealDB search.php
async function fetchAllCuisineMeals(cuisineObj) {
  if (!cuisineObj || !cuisineObj.searchTerms) return []
  
  // First try filter.php for the area
  const areaRes = await fetch(`${MEALDB}/filter.php?a=${encodeURIComponent(cuisineObj.value)}`)
  const areaData = await areaRes.json()
  let meals = (areaData.meals || []).map(m => ({ ...m, strArea: cuisineObj.value }))
  
  // Then search each keyword to get MORE results
  const searchPromises = cuisineObj.searchTerms.slice(0, 8).map(term =>
    fetch(`${MEALDB}/search.php?s=${encodeURIComponent(term)}`).then(r => r.json()).catch(() => ({ meals: [] }))
  )
  const searchResults = await Promise.all(searchPromises)
  
  // Merge all, deduplicate by idMeal
  const seen = new Set(meals.map(m => m.idMeal))
  for (const result of searchResults) {
    for (const meal of (result.meals || [])) {
      if (!seen.has(meal.idMeal)) {
        seen.add(meal.idMeal)
        meals.push({ ...meal, strArea: meal.strArea || cuisineObj.value })
      }
    }
  }
  
  return meals.sort((a, b) => (a.strMeal || '').localeCompare(b.strMeal || ''))
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
  const [totalCount, setTotalCount] = useState(0)

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
    setActiveQuery(''); setCuisine(null); setDiet(null)
    try {
      const areas = ['Indian','Italian','Chinese','Mexican','Japanese','Thai','British','French','American','Greek','Spanish']
      const results = await Promise.all(areas.map(a => fetch(`${MEALDB}/filter.php?a=${a}`).then(r => r.json()).catch(() => ({ meals: [] }))))
      const combined = results.flatMap((r, i) =>
        (r.meals || []).map(m => ({ ...m, strArea: areas[i] }))
      ).sort(() => Math.random() - 0.5)
      setAllMeals(combined)
      setMeals(combined.slice(0, PAGE_SIZE))
      setHasMore(combined.length > PAGE_SIZE)
      setTotalCount(combined.length)
      setPage(1)
    } catch { toast.error('Could not load meals.') }
    finally { setLoading(false) }
  }

  const handleSearch = async e => {
    e?.preventDefault()
    const q = search.trim()
    if (!q) return
    setLoading(true); setActiveQuery(q); setCuisine(null); setDiet(null)

    // 1. Try Spoonacular (if configured)
    try {
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
          setHasMore(mapped.length > PAGE_SIZE); setTotalCount(mapped.length); setPage(1)
          setLoading(false); return
        }
      }
    } catch {}

    // 2. MealDB search — try multiple variations for broader results
    try {
      // Search with original query + split words for better coverage
      const queries = [q, ...q.split(' ').filter(w => w.length > 3)]
      const allResults = await Promise.all(
        queries.slice(0, 3).map(term =>
          fetch(`${MEALDB}/search.php?s=${encodeURIComponent(term)}`).then(r => r.json()).catch(() => ({ meals: [] }))
        )
      )
      const seen = new Set()
      const found = []
      for (const res of allResults) {
        for (const meal of (res.meals || [])) {
          if (!seen.has(meal.idMeal)) { seen.add(meal.idMeal); found.push(meal) }
        }
      }

      setAllMeals(found); setMeals(found.slice(0, PAGE_SIZE))
      setHasMore(found.length > PAGE_SIZE); setTotalCount(found.length); setPage(1)
      if (!found.length) toast(`No results for "${q}" — try simpler terms like "chicken" or "pasta"`, { icon: '🔍', duration: 5000 })
    } catch { toast.error('Search failed.') }
    finally { setLoading(false) }
  }

  const handleCuisine = async val => {
    setCuisine(val); setSearch(''); setActiveQuery(''); setDiet(null)
    if (!val) { loadPopular(); return }
    setLoading(true)
    try {
      const cuisineObj = CUISINES.find(c => c.value === val)
      const found = await fetchAllCuisineMeals(cuisineObj)
      setAllMeals(found); setMeals(found.slice(0, PAGE_SIZE))
      setHasMore(found.length > PAGE_SIZE); setTotalCount(found.length); setPage(1)
    } catch { toast.error('Could not load cuisine.') }
    finally { setLoading(false) }
  }

  const handleDiet = async val => {
    setDiet(val); setSearch(''); setActiveQuery(''); setCuisine(null)
    if (!val) { loadPopular(); return }
    setLoading(true)
    try {
      const res = await fetch(`${MEALDB}/filter.php?c=${encodeURIComponent(val)}`)
      const data = await res.json()
      const found = data.meals || []
      setAllMeals(found); setMeals(found.slice(0, PAGE_SIZE))
      setHasMore(found.length > PAGE_SIZE); setTotalCount(found.length); setPage(1)
    } catch { toast.error('Could not filter meals.') }
    finally { setLoading(false) }
  }

  const loadMore = () => {
    const nextPage = page + 1
    const nextSlice = allMeals.slice(0, nextPage * PAGE_SIZE)
    setMeals(nextSlice)
    setHasMore(nextSlice.length < allMeals.length)
    setPage(nextPage)
  }

  const toggleFav = async meal => {
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
    ? `Results for "${activeQuery}" — ${meals.length} of ${totalCount} shown`
    : cuisine ? `${CUISINES.find(c=>c.value===cuisine)?.label} — ${meals.length} of ${totalCount} dishes`
    : diet    ? `${DIETS.find(d=>d.value===diet)?.label} — ${meals.length} of ${totalCount} dishes`
    : `Popular meals — ${meals.length} of ${totalCount} shown`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search hero */}
      <div style={{ background: 'linear-gradient(135deg, #993C1D 0%, #D85A30 100%)' }} className="pt-10 pb-8 px-4">
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
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
                placeholder="e.g. butter chicken, ramen, chole bhature…"
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

      {/* Sticky filter bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Dropdown label="Cuisine" icon={FiGlobe} options={CUISINES} selected={cuisine} onSelect={handleCuisine} />
          <Dropdown label="Diet / Type" icon={FiSliders} options={DIETS} selected={diet} onSelect={handleDiet} />
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
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor:'#D85A30', borderTopColor:'transparent' }} />
          </div>
        )}

        {!loading && meals.length === 0 && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center py-24">
            <div className="text-5xl mb-4">🍽</div>
            <p className="text-gray-700 text-lg font-semibold mb-2">No meals found</p>
            <p className="text-gray-400 text-sm mb-2">MealDB has limited Indian dishes by name.</p>
            <p className="text-gray-400 text-sm mb-6">Try: "chicken", "biryani", "curry", or filter by 🇮🇳 Indian cuisine</p>
            <button onClick={clearAll} className="btn-primary">Back to popular</button>
          </motion.div>
        )}

        {!loading && meals.length > 0 && (
          <>
            <AnimatePresence mode="wait">
              <motion.div key={activeQuery + cuisine + diet}
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                transition={{ duration:0.2 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {meals.map((meal, i) => (
                  <motion.div key={meal.idMeal + i}
                    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}>
                    <MealCard meal={meal} isFavorite={!!favorites[meal.idMeal]} onToggleFav={toggleFav} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <motion.button whileTap={{ scale:0.97 }} onClick={loadMore} disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-sm border-2 transition-all disabled:opacity-50"
                  style={{ borderColor:'#D85A30', color:'#D85A30' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#D85A30'; e.currentTarget.style.color='white' }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#D85A30' }}>
                  {loadingMore
                    ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Loading...</>
                    : <><FiChevronDown size={16} /> Load more ({allMeals.length - meals.length} remaining)</>
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
