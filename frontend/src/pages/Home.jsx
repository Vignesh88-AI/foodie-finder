import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import MealCard from '../components/MealCard'
import SkeletonCard from '../components/SkeletonCard'
import toast from 'react-hot-toast'
import { FiSearch, FiX, FiChevronDown, FiGlobe, FiSliders, FiClock, FiArrowRight } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const API      = import.meta.env.VITE_API_URL
const MEALDB   = 'https://www.themealdb.com/api/json/v1/1'
const PAGE_SIZE = 20

// #19 — All 37 MealDB countries
const CUISINES = [
  { label: 'All cuisines',    value: null,              spoonacular: null,             edamam: null },
  { label: '🇮🇳 Indian',      value: 'Indian',          spoonacular: 'Indian',         edamam: 'indian' },
  { label: '🇮🇹 Italian',     value: 'Italian',         spoonacular: 'Italian',        edamam: 'italian' },
  { label: '🇨🇳 Chinese',     value: 'Chinese',         spoonacular: 'Chinese',        edamam: 'chinese' },
  { label: '🇲🇽 Mexican',     value: 'Mexican',         spoonacular: 'Mexican',        edamam: 'mexican' },
  { label: '🇯🇵 Japanese',    value: 'Japanese',        spoonacular: 'Japanese',       edamam: 'japanese' },
  { label: '🇹🇭 Thai',        value: 'Thai',            spoonacular: 'Thai',           edamam: 'south east asian' },
  { label: '🇬🇧 British',     value: 'British',         spoonacular: 'British',        edamam: 'british' },
  { label: '🇫🇷 French',      value: 'French',          spoonacular: 'French',         edamam: 'french' },
  { label: '🇺🇸 American',    value: 'American',        spoonacular: 'American',       edamam: 'american' },
  { label: '🇬🇷 Greek',       value: 'Greek',           spoonacular: 'Greek',          edamam: 'mediterranean' },
  { label: '🇪🇸 Spanish',     value: 'Spanish',         spoonacular: 'Spanish',        edamam: 'mediterranean' },
  { label: '🇵🇱 Polish',      value: 'Polish',          spoonacular: null,             edamam: null },
  { label: '🇨🇦 Canadian',    value: 'Canadian',        spoonacular: null,             edamam: null },
  { label: '🇯🇲 Jamaican',    value: 'Jamaican',        spoonacular: null,             edamam: null },
  { label: '🇪🇬 Egyptian',    value: 'Egyptian',        spoonacular: 'Middle Eastern', edamam: 'middle eastern' },
  { label: '🇲🇦 Moroccan',    value: 'Moroccan',        spoonacular: 'Middle Eastern', edamam: 'middle eastern' },
  { label: '🇵🇭 Filipino',    value: 'Filipino',        spoonacular: null,             edamam: 'south east asian' },
  { label: '🇹🇷 Turkish',     value: 'Turkish',         spoonacular: 'Middle Eastern', edamam: 'middle eastern' },
  { label: '🇷🇺 Russian',     value: 'Russian',         spoonacular: null,             edamam: null },
  { label: '🇺🇦 Ukrainian',   value: 'Ukrainian',       spoonacular: null,             edamam: null },
  { label: '🇻🇳 Vietnamese',  value: 'Vietnamese',      spoonacular: 'Vietnamese',     edamam: 'south east asian' },
  { label: '🇮🇪 Irish',       value: 'Irish',           spoonacular: null,             edamam: null },
  { label: '🇳🇱 Dutch',       value: 'Dutch',           spoonacular: null,             edamam: null },
  { label: '🇭🇷 Croatian',    value: 'Croatian',        spoonacular: null,             edamam: null },
  { label: '🇵🇹 Portuguese',  value: 'Portuguese',      spoonacular: null,             edamam: null },
  { label: '🇦🇷 Argentinian', value: 'Argentinian',     spoonacular: null,             edamam: null },
  { label: '🇲🇾 Malaysian',   value: 'Malaysian',       spoonacular: null,             edamam: 'south east asian' },
  { label: '🇰🇷 Korean',      value: 'Korean',          spoonacular: 'Korean',         edamam: 'south east asian' },
  { label: '🇸🇦 Saudi',       value: 'Saudi',           spoonacular: 'Middle Eastern', edamam: 'middle eastern' },
  { label: '🇲🇴 Macanese',    value: 'Macanese',        spoonacular: null,             edamam: null },
  { label: '🌍 Kenyan',       value: 'Kenyan',          spoonacular: null,             edamam: null },
  { label: '🇹🇳 Tunisian',    value: 'Tunisian',        spoonacular: null,             edamam: null },
  { label: '🇸🇾 Syrian',      value: 'Syrian',          spoonacular: 'Middle Eastern', edamam: 'middle eastern' },
  { label: '🇧🇦 Bosnian',     value: 'Bosnian',         spoonacular: null,             edamam: null },
  { label: '🇭🇰 Hong Kong',   value: 'Hong_Kong',       spoonacular: null,             edamam: null },
  { label: '🇩🇿 Algerian',    value: 'Algerian',        spoonacular: null,             edamam: null },
]

const DIETS = [
  { label: 'All types',     value: null,           spoon: null },
  { label: '🥗 Vegetarian', value: 'Vegetarian',   spoon: 'vegetarian' },
  { label: '🌱 Vegan',      value: 'Vegan',        spoon: 'vegan' },
  { label: '🍗 Chicken',    value: 'Chicken',      spoon: null },
  { label: '🥩 Beef',       value: 'Beef',         spoon: null },
  { label: '🐟 Seafood',    value: 'Seafood',      spoon: null },
  { label: '🍮 Dessert',    value: 'Dessert',      spoon: null },
  { label: '🍝 Pasta',      value: 'Pasta',        spoon: null },
]

// API helpers
function spoonToMeal(r) {
  return { idMeal:String(r.id), strMeal:r.title, strMealThumb:r.image||'',
    strArea:r.cuisines?.[0]||'', strCategory:r.dishTypes?.[0]||'',
    calories:0, vegetarian:r.vegetarian||false, vegan:r.vegan||false, _source:'spoon' }
}
async function spoonSearch(q, offset=0, cuisine=null, diet=null) {
  let url = `${API}/api/spoon/search?q=${encodeURIComponent(q)}&number=${PAGE_SIZE}&offset=${offset}`
  if (cuisine) url+=`&cuisine=${encodeURIComponent(cuisine)}`
  if (diet) url+=`&diet=${encodeURIComponent(diet)}`
  const res = await fetch(url); if(!res.ok) throw new Error('Spoon failed')
  const data = await res.json(); if(data.error) throw new Error(data.error)
  return { meals:(data.results||[]).map(spoonToMeal), total:data.totalResults||0, hasMore:offset+PAGE_SIZE<(data.totalResults||0), nextOffset:offset+PAGE_SIZE }
}
async function spoonCuisine(cuisine, offset=0) {
  const res = await fetch(`${API}/api/spoon/cuisine?cuisine=${encodeURIComponent(cuisine)}&number=${PAGE_SIZE}&offset=${offset}`)
  if(!res.ok) throw new Error('Spoon cuisine failed')
  const data = await res.json(); if(data.error) throw new Error(data.error)
  return { meals:(data.results||[]).map(spoonToMeal), total:data.totalResults||0, hasMore:offset+PAGE_SIZE<(data.totalResults||0), nextOffset:offset+PAGE_SIZE }
}
async function edamamSearch(q, from=0) {
  const res = await fetch(`${API}/api/edamam/search?q=${encodeURIComponent(q)}&from=${from}&to=${from+PAGE_SIZE}`)
  if(!res.ok) throw new Error('Edamam failed')
  const data = await res.json()
  return { meals:data.results||[], total:data.count||0, hasMore:(data.to||0)<(data.count||0), nextOffset:data.to||0 }
}
async function edamamCuisine(cuisineType, from=0) {
  const res = await fetch(`${API}/api/edamam/cuisine?cuisineType=${encodeURIComponent(cuisineType)}&from=${from}&to=${from+PAGE_SIZE}`)
  if(!res.ok) throw new Error('Edamam cuisine failed')
  const data = await res.json()
  return { meals:data.results||[], total:data.count||0, hasMore:!!data.nextPage, nextOffset:from+PAGE_SIZE }
}

// #12 — Search history helpers
const getSearchHistory = () => { try { return JSON.parse(localStorage.getItem('dishcovery_search_history')||'[]') } catch { return [] } }
const saveSearchHistory = (q) => {
  const h = getSearchHistory()
  const updated = [q, ...h.filter(x=>x!==q)].slice(0,5)
  localStorage.setItem('dishcovery_search_history', JSON.stringify(updated))
}

// #23 — Dropdown with search filter
function Dropdown({ label, icon: Icon, options, selected, onSelect }) {
  const [open, setOpen]     = useState(false)
  const [filter, setFilter] = useState('')
  const ref = useRef(null)
  const current = options.find(o => o.value === selected)
  const filtered = filter ? options.filter(o => o.label.toLowerCase().includes(filter.toLowerCase())) : options

  useEffect(() => {
    const h = e => { if(ref.current&&!ref.current.contains(e.target)) { setOpen(false); setFilter('') } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all"
        style={{ borderColor:selected?'#D85A30':'#e5e7eb', background:selected?'#FFF3EE':'white', color:selected?'#D85A30':'#374151', fontWeight:selected?700:500, boxShadow:selected?'0 0 0 2px rgba(216,90,48,0.12)':'none' }}>
        <Icon size={15}/>
        <span className="max-w-[140px] truncate">{current?.label||label}</span>
        <FiChevronDown size={14} className={`transition-transform flex-shrink-0 ${open?'rotate-180':''}`}/>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0,y:6,scale:0.97 }} animate={{ opacity:1,y:0,scale:1 }}
            exit={{ opacity:0,y:6,scale:0.97 }} transition={{ duration:0.14 }}
            className="absolute top-full mt-2 left-0 z-50 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
            style={{ minWidth:190, maxHeight:320 }}>
            {/* #23 — Search filter inside dropdown */}
            <div className="p-2 border-b border-gray-100">
              <input autoFocus value={filter} onChange={e=>setFilter(e.target.value)}
                placeholder="Search…" onClick={e=>e.stopPropagation()}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 outline-none"
                style={{ ':focus':{borderColor:'#D85A30'} }}
                onFocus={e=>e.target.style.borderColor='#D85A30'}
                onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
            </div>
            <div style={{ overflowY:'auto', maxHeight:250 }}>
              {filtered.map(opt => (
                <button key={opt.label} onClick={() => { onSelect(opt.value); setOpen(false); setFilter('') }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors"
                  style={{ color:opt.value===selected?'#D85A30':'#374151', fontWeight:opt.value===selected?700:400 }}>
                  {opt.label}{opt.value===selected&&<span className="ml-auto">✓</span>}
                </button>
              ))}
              {filtered.length===0&&<p className="px-4 py-3 text-sm text-gray-400 text-center">No results</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// #11 — Meal of the Day banner
function MealOfDay({ navigate }) {
  const [meal, setMeal] = useState(null)
  useEffect(() => {
    const today = new Date().toDateString()
    try {
      const cached = JSON.parse(localStorage.getItem('dishcovery_meal_of_day')||'{}')
      if (cached.date===today && cached.meal) { setMeal(cached.meal); return }
    } catch {}
    fetch(`${MEALDB}/random.php`).then(r=>r.json()).then(data=>{
      const m = data.meals?.[0]
      if (m) {
        setMeal(m)
        localStorage.setItem('dishcovery_meal_of_day', JSON.stringify({date:today,meal:m}))
      }
    }).catch(()=>{})
  }, [])

  if (!meal) return null
  return (
    <motion.div initial={{ opacity:0,y:-10 }} animate={{ opacity:1,y:0 }}
      onClick={() => navigate(`/meal/${meal.idMeal}`)}
      className="mx-4 mb-6 cursor-pointer group"
      style={{ maxWidth:1144, marginLeft:'auto', marginRight:'auto' }}>
      <div className="rounded-2xl overflow-hidden relative" style={{ height:140, boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}>
        <img src={meal.strMealThumb} alt={meal.strMeal}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(90deg,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.2) 60%,transparent 100%)' }}/>
        <div style={{ position:'absolute',left:0,top:0,bottom:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'20px 24px' }}>
          <span style={{ fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'rgba(255,200,100,0.9)',marginBottom:6 }}>✨ Meal of the Day</span>
          <h3 style={{ fontWeight:700,fontSize:'clamp(16px,2.5vw,22px)',color:'white',marginBottom:4,lineHeight:1.2 }}>{meal.strMeal}</h3>
          <span style={{ fontSize:12,color:'rgba(255,255,255,0.7)' }}>{meal.strArea} · {meal.strCategory}</span>
        </div>
        <div style={{ position:'absolute',right:20,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.15)',backdropFilter:'blur(8px)',borderRadius:12,padding:'8px 14px',display:'flex',alignItems:'center',gap:6,color:'white',fontSize:13,fontWeight:600,border:'1px solid rgba(255,255,255,0.2)' }}>
          View recipe <FiArrowRight size={14}/>
        </div>
      </div>
    </motion.div>
  )
}

export default function Home({ user }) {
  const navigate = useNavigate()
  const [meals, setMeals]           = useState([])
  const [favorites, setFavorites]   = useState({})
  const [search, setSearch]         = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [searchHistory, setSearchHistory] = useState(getSearchHistory())
  const [activeQuery, setActiveQuery] = useState('')
  const [loading, setLoading]       = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [aiLoading, setAiLoading]   = useState(false)
  const [cuisine, setCuisine]       = useState(null)
  const [diet, setDiet]             = useState(null)
  const [hasMore, setHasMore]       = useState(false)
  const [nextOffset, setNextOffset] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [apiSource, setApiSource]   = useState('')
  const [mode, setMode]             = useState('popular')
  const searchRef = useRef(null)

  useEffect(() => {
    if(!user) return
    const q = query(collection(db,'favorites'), where('uid','==',user.uid))
    const unsub = onSnapshot(q, snap => {
      const map = {}
      snap.forEach(d => { map[d.data().idMeal]=d.id })
      setFavorites(map)
    })
    return unsub
  }, [user])

  useEffect(() => { loadPopular() }, [])

  // Close history dropdown on outside click
  useEffect(() => {
    const h = e => { if(searchRef.current&&!searchRef.current.contains(e.target)) setShowHistory(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const loadPopular = async () => {
    setLoading(true); setMode('popular'); setActiveQuery(''); setCuisine(null); setDiet(null)
    // #5 — Session cache
    try {
      const cached = sessionStorage.getItem('dishcovery_popular')
      if (cached) {
        const { meals:cm, ts } = JSON.parse(cached)
        if (Date.now()-ts < 10*60*1000 && cm.length>0) {
          setMeals(cm.slice(0,PAGE_SIZE)); setHasMore(cm.length>PAGE_SIZE)
          setNextOffset(PAGE_SIZE); setTotalCount(cm.length); setApiSource('mealdb')
          setLoading(false); return
        }
      }
    } catch {}
    // Try Spoonacular
    try {
      const res = await spoonSearch('',0)
      if (res.meals.length>0) {
        setMeals(res.meals); setHasMore(res.hasMore); setNextOffset(res.nextOffset)
        setTotalCount(res.total); setApiSource('spoon'); setLoading(false); return
      }
    } catch {}
    // MealDB fallback
    try {
      const areas = ['Indian','Italian','Chinese','Mexican','Japanese','Thai','British','French','American','Greek']
      const results = await Promise.all(areas.map(a=>fetch(`${MEALDB}/filter.php?a=${a}`).then(r=>r.json()).catch(()=>({meals:[]}))))
      const combined = results.flatMap((r,i)=>(r.meals||[]).map(m=>({...m,strArea:areas[i]}))).sort(()=>Math.random()-0.5)
      setMeals(combined.slice(0,PAGE_SIZE)); setHasMore(combined.length>PAGE_SIZE)
      setNextOffset(PAGE_SIZE); setTotalCount(combined.length); setApiSource('mealdb')
      try { sessionStorage.setItem('dishcovery_popular',JSON.stringify({meals:combined,ts:Date.now()})) } catch {}
    } catch { toast.error('Could not load meals.') }
    finally { setLoading(false) }
  }

  const handleSearch = async e => {
    e?.preventDefault()
    const q = search.trim(); if(!q) return
    setLoading(true); setMode('search'); setActiveQuery(q); setCuisine(null); setDiet(null)
    setShowHistory(false); setAiSuggestion('')
    saveSearchHistory(q); setSearchHistory(getSearchHistory())

    // 1. Spoonacular
    try { const res=await spoonSearch(q,0); if(res.meals.length>0){setMeals(res.meals);setHasMore(res.hasMore);setNextOffset(res.nextOffset);setTotalCount(res.total);setApiSource('spoon');setLoading(false);return} } catch {}
    // 2. Edamam
    try { const res=await edamamSearch(q,0); if(res.meals.length>0){setMeals(res.meals);setHasMore(res.hasMore);setNextOffset(res.nextOffset);setTotalCount(res.total);setApiSource('edamam');setLoading(false);return} } catch {}
    // 3. MealDB
    try {
      const r=await fetch(`${MEALDB}/search.php?s=${encodeURIComponent(q)}`).then(r=>r.json())
      const found=r.meals||[]
      setMeals(found); setHasMore(false); setTotalCount(found.length); setApiSource('mealdb')
      // #20 — AI suggestion when no results
      if (!found.length) {
        setAiLoading(true)
        try {
          const aiRes = await fetch(`${API}/api/suggest`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q})})
          if(aiRes.ok){const d=await aiRes.json();if(d.suggestion)setAiSuggestion(d.suggestion)}
        } catch {}
        setAiLoading(false)
      }
    } catch { toast.error('Search failed.') }
    finally { setLoading(false) }
  }

  const handleCuisine = async val => {
    setCuisine(val); setSearch(''); setActiveQuery(''); setDiet(null)
    if(!val){loadPopular();return}
    setLoading(true); setMode('cuisine')
    const c=CUISINES.find(x=>x.value===val)
    try { if(c?.spoonacular){const res=await spoonCuisine(c.spoonacular,0);if(res.meals.length>0){setMeals(res.meals);setHasMore(res.hasMore);setNextOffset(res.nextOffset);setTotalCount(res.total);setApiSource('spoon');setLoading(false);return}} } catch {}
    try { if(c?.edamam){const res=await edamamCuisine(c.edamam,0);if(res.meals.length>0){setMeals(res.meals);setHasMore(res.hasMore);setNextOffset(res.nextOffset);setTotalCount(res.total);setApiSource('edamam');setLoading(false);return}} } catch {}
    try {
      const r=await fetch(`${API}/api/filter?a=${encodeURIComponent(val)}`).then(r=>r.json())
      const found=(r.meals||[]).map(m=>({...m,strArea:val}))
      setMeals(found.slice(0,PAGE_SIZE)); setHasMore(found.length>PAGE_SIZE); setNextOffset(PAGE_SIZE); setTotalCount(found.length); setApiSource('mealdb')
    } catch { toast.error('Could not load cuisine.') }
    finally { setLoading(false) }
  }

  const handleDiet = async val => {
    setDiet(val); setSearch(''); setActiveQuery(''); setCuisine(null)
    if(!val){loadPopular();return}
    setLoading(true); setMode('diet')
    const d=DIETS.find(x=>x.value===val)
    try { if(d?.spoon){const res=await spoonSearch('',0,null,d.spoon);if(res.meals.length>0){setMeals(res.meals);setHasMore(res.hasMore);setNextOffset(res.nextOffset);setTotalCount(res.total);setApiSource('spoon');setLoading(false);return}} } catch {}
    try {
      const r=await fetch(`${API}/api/filter?c=${encodeURIComponent(val)}`).then(r=>r.json())
      const found=r.meals||[]
      setMeals(found.slice(0,PAGE_SIZE)); setHasMore(found.length>PAGE_SIZE); setNextOffset(PAGE_SIZE); setTotalCount(found.length); setApiSource('mealdb')
    } catch { toast.error('Could not filter.') }
    finally { setLoading(false) }
  }

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      if (apiSource==='spoon') {
        let res
        if(mode==='search') res=await spoonSearch(activeQuery,nextOffset)
        else if(mode==='cuisine'){const c=CUISINES.find(x=>x.value===cuisine);res=await spoonCuisine(c?.spoonacular||'',nextOffset)}
        else res=await spoonSearch('',nextOffset)
        setMeals(prev=>[...prev,...res.meals]); setHasMore(res.hasMore); setNextOffset(res.nextOffset)
      } else if (apiSource==='edamam') {
        let res
        if(mode==='search') res=await edamamSearch(activeQuery,nextOffset)
        else if(mode==='cuisine'){const c=CUISINES.find(x=>x.value===cuisine);res=await edamamCuisine(c?.edamam||'',nextOffset)}
        else res=await edamamSearch('popular',nextOffset)
        setMeals(prev=>[...prev,...res.meals]); setHasMore(res.hasMore); setNextOffset(res.nextOffset)
      } else if (apiSource === 'mealdb') {
        setHasMore(false) // MealDB filter results can't paginate
      } else {
        setHasMore(false)
      }
    } catch { toast.error('Could not load more.') }
    finally { setLoadingMore(false) }
  }

  const toggleFav = async meal => {
    if(favorites[meal.idMeal]) {
      await deleteDoc(doc(db,'favorites',favorites[meal.idMeal]))
      toast('Removed from favourites',{icon:'💔'})
    } else {
      await addDoc(collection(db,'favorites'),{
        idMeal:meal.idMeal, strMeal:meal.strMeal, strMealThumb:meal.strMealThumb,
        strCategory:meal.strCategory||'', strArea:meal.strArea||'', // #25 — save category+area
        uid:user.uid, addedAt:new Date()
      })
      toast.success('Saved to favourites!')
    }
  }

  const runSearch = (q) => {
    setSearch(q)
    setShowHistory(false)
    // Directly trigger search logic without fake event
    setTimeout(() => {
      if (!q.trim()) return
      setLoading(true); setMode('search'); setActiveQuery(q); setCuisine(null); setDiet(null)
      setAiSuggestion('')
      saveSearchHistory(q); setSearchHistory(getSearchHistory())
      Promise.resolve()
        .then(async () => {
          try { const res=await spoonSearch(q,0); if(res.meals.length>0){setMeals(res.meals);setHasMore(res.hasMore);setNextOffset(res.nextOffset);setTotalCount(res.total);setApiSource('spoon');return} } catch {}
          try { const res=await edamamSearch(q,0); if(res.meals.length>0){setMeals(res.meals);setHasMore(res.hasMore);setNextOffset(res.nextOffset);setTotalCount(res.total);setApiSource('edamam');return} } catch {}
          try {
            const r=await fetch(`${MEALDB}/search.php?s=${encodeURIComponent(q)}`).then(r=>r.json())
            const found=r.meals||[]; setMeals(found); setHasMore(false); setTotalCount(found.length); setApiSource('mealdb')
          } catch {}
        })
        .finally(() => setLoading(false))
    }, 10)
  }
  const clearAll = () => { setSearch(''); loadPopular() }
  const cuisineLabel = CUISINES.find(c=>c.value===cuisine)?.label||''
  const dietLabel = DIETS.find(d=>d.value===diet)?.label||''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#993C1D 0%,#D85A30 100%)' }} className="pt-16 pb-14 px-4">
        <motion.div initial={{ opacity:0,y:-16 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.5 }}
          className="max-w-2xl mx-auto text-center">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
            Find your next favourite meal
          </h1>
          <p className="text-orange-100 text-sm mb-6">
            Search anything — chole bhature, biryani, pasta, tacos. Powered by Spoonacular + Edamam
          </p>
          {/* #12 — Search with history */}
          <div ref={searchRef} className="relative">
            <form onSubmit={handleSearch} className="flex gap-0 bg-white rounded-2xl overflow-hidden shadow-lg w-full">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                <input type="text" value={search} onChange={e=>{setSearch(e.target.value);setShowHistory(true)}}
                  onFocus={()=>setShowHistory(true)}
                  placeholder="e.g. chole bhature, chicken biryani, ramen…"
                  className="w-full pl-11 pr-4 py-4 text-base outline-none bg-transparent text-gray-800 placeholder:text-gray-400"/>
                {search&&<button type="button" onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><FiX size={16}/></button>}
              </div>
              <button type="submit" className="px-7 font-bold text-base text-white flex-shrink-0" style={{ background:'#D85A30' }}>Search</button>
            </form>
            {/* Search history dropdown */}
            <AnimatePresence>
              {showHistory && searchHistory.length>0 && !search && (
                <motion.div initial={{ opacity:0,y:4 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:4 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-2 border-b border-gray-50 flex items-center gap-2">
                    <FiClock size={12} className="text-gray-400"/><span className="text-xs font-semibold text-gray-400">Recent searches</span>
                  </div>
                  {searchHistory.map((q,i)=>(
                    <button key={i} onClick={()=>runSearch(q)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                      <FiSearch size={13} className="text-gray-400 flex-shrink-0"/>{q}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Sticky filter bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Dropdown label="Cuisine" icon={FiGlobe} options={CUISINES} selected={cuisine} onSelect={handleCuisine}/>
          <Dropdown label="Diet / Type" icon={FiSliders} options={DIETS} selected={diet} onSelect={handleDiet}/>
          {(cuisine||diet||activeQuery)&&(
            <button onClick={clearAll} className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1">
              <FiX size={14}/> Clear all
            </button>
          )}
        </div>
      </div>

      {/* #11 — Meal of the Day */}
      {!activeQuery && !cuisine && !diet && (
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <MealOfDay navigate={navigate}/>
        </div>
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* #22 Bug D — Better result label */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {activeQuery ? `Results for "${activeQuery}"` : cuisine ? `${cuisineLabel}` : diet ? dietLabel : 'Popular meals'}
          </h2>
          {meals.length>0 && <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{meals.length}{totalCount>meals.length?` of ${totalCount.toLocaleString()}`:''} shown</span>}
        </div>

        {/* #7 — Skeleton loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({length:8}).map((_,i)=><SkeletonCard key={i}/>)}
          </div>
        )}

        {/* #20 — AI suggestion for no results */}
        {!loading && meals.length===0 && (
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-700 text-lg font-semibold mb-2">No meals found</p>
            {(aiSuggestion||aiLoading) ? (
              <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
                className="max-w-lg mx-auto mt-6 p-5 bg-white rounded-2xl shadow-sm border border-orange-100 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">👨‍🍳</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Chef Dish knows this dish!</p>
                    <p className="text-xs text-gray-400">AI-powered suggestion</p>
                  </div>
                </div>
                {aiLoading
                  ? <div className="space-y-2"><div className="h-3 bg-gray-100 rounded animate-pulse w-full"/><div className="h-3 bg-gray-100 rounded animate-pulse w-4/5"/></div>
                  : <p className="text-sm text-gray-600 leading-relaxed mb-3">{aiSuggestion}</p>}
                <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(activeQuery)}+recipe`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:underline">
                  ▶ Watch {activeQuery} recipe on YouTube
                </a>
              </motion.div>
            ) : (
              <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Try simpler words like "chicken" or "curry". The backend may be starting up (wait 30 sec).</p>
            )}
            <button onClick={clearAll} className="btn-primary mt-4">Back to popular</button>
          </motion.div>
        )}

        {!loading && meals.length>0 && (
          <>
            <AnimatePresence mode="wait">
              <motion.div key={activeQuery+cuisine+diet} initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {meals.map((meal,i)=>(
                  <motion.div key={meal.idMeal+i} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
                    whileHover={{ y:-4, transition:{ duration:0.2 } }}
                    transition={{ delay:Math.min(i*0.03,0.4) }}>
                    <MealCard meal={meal} isFavorite={!!favorites[meal.idMeal]} onToggleFav={toggleFav}/>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
            {hasMore && (
              <div className="flex justify-center mt-10">
                <motion.button whileTap={{ scale:0.97 }} onClick={loadMore} disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-sm border-2 transition-all"
                  style={{ borderColor:'#D85A30',color:'#D85A30' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='#D85A30';e.currentTarget.style.color='white'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#D85A30'}}>
                  {loadingMore?<><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/>Loading…</>:<><FiChevronDown size={16}/>Load more recipes</>}
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
