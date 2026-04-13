import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import MealCard from '../components/MealCard'
import SkeletonCard from '../components/SkeletonCard'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiExternalLink, FiYoutube, FiShare2, FiPrinter } from 'react-icons/fi'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

const API    = import.meta.env.VITE_API_URL
const getYtId = url => url?.split('v=')?.[1]?.split('&')?.[0]

export default function MealDetails({ user }) {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [meal, setMeal]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [favDocId, setFavDocId]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const [checked, setChecked]     = useState({})
  const [similarMeals, setSimilar]   = useState([])
  const [favMap, setFavMap]         = useState({})
  const [nutrition, setNutrition]   = useState(null)
  const [nutLoading, setNutLoading] = useState(false)
  const [nutError, setNutError]     = useState(false)
  const [servings, setServings]     = useState(4)
  const [showBreakdown, setShowBreakdown] = useState(false)

  useEffect(() => {
    const fetchMeal = async () => {
      setLoading(true); setChecked({}); setNutrition(null); setNutError(false); setServings(4); setShowBreakdown(false)
      try {
        let data
        if (id.startsWith('spoon-')) {
          const spoonId = id.replace('spoon-','')
          const res = await fetch(`${API}/api/spoon/recipe/${spoonId}`)
          const r = await res.json()
          data = {
            idMeal: String(r.id), strMeal: r.title, strMealThumb: r.image,
            strCategory: r.dishTypes?.[0]||'', strArea: r.cuisines?.[0]||'',
            strInstructions: r.instructions?.replace(/<[^>]*>/g,'')||'',
            strYoutube: null, strSource: r.sourceUrl,
            calories: 0, totalTime: r.readyInMinutes||0,
            vegetarian: r.vegetarian, vegan: r.vegan,
            _spoon: true,
            _ingredients: r.extendedIngredients?.map(i=>({ingredient:i.name,measure:i.original}))||[],
          }
        } else {
          const res  = await fetch(`${API}/api/meal/${id}`)
          const json = await res.json()
          data = json.meals?.[0]||null
        }
        setMeal(data)
        if(data?.strMeal) document.title = `${data.strMeal} — Dishcovery`
        // Fetch nutrition from USDA (free, no key needed with DEMO_KEY)
        if (data) {
          setNutLoading(true)
          const ingList = data._ingredients
            ? data._ingredients.map(i => i.measure ? `${i.measure} ${i.ingredient}` : i.ingredient)
            : Array.from({length:20},(_,idx)=>{
                const ing=data[`strIngredient${idx+1}`]?.trim()
                const mea=data[`strMeasure${idx+1}`]?.trim()
                return ing ? (mea?`${mea} ${ing}`:ing) : null
              }).filter(Boolean)

          fetch(`${API}/api/nutrition`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ ingredients: ingList, servings: 4 })
          })
          .then(r => r.json())
          .then(d => { if(d.totals) setNutrition(d); else setNutError(true) })
          .catch(() => setNutError(true))
          .finally(() => setNutLoading(false))
        }

        // Fetch similar meals
        if (data?.strCategory) {
          fetch(`${API}/api/filter?c=${encodeURIComponent(data.strCategory)}`)
            .then(r=>r.json()).then(d=>{
              const others=(d.meals||[]).filter(m=>m.idMeal!==id).sort(()=>Math.random()-0.5).slice(0,4)
              setSimilar(others)
            }).catch(()=>{})
        }
      } catch { toast.error('Could not load meal details.') }
      finally { setLoading(false) }
    }
    fetchMeal()
    return () => { document.title = 'Dishcovery — Find meals you love' }
  }, [id])

  useEffect(() => {
    if(!user||!id) return
    getDocs(query(collection(db,'favorites'),where('uid','==',user.uid),where('idMeal','==',id)))
      .then(snap => { if(!snap.empty) setFavDocId(snap.docs[0].id) })
    // Also get all favs for similar meals heart
    getDocs(query(collection(db,'favorites'),where('uid','==',user.uid)))
      .then(snap => { const map={}; snap.forEach(d=>{map[d.data().idMeal]=d.id}); setFavMap(map) })
  }, [user, id])

  const toggleFav = async () => {
    if(!meal) return; setSaving(true)
    try {
      if(favDocId) {
        await deleteDoc(doc(db,'favorites',favDocId)); setFavDocId(null)
        toast('Removed from favourites',{icon:'💔'})
      } else {
        const ref = await addDoc(collection(db,'favorites'),{
          idMeal:meal.idMeal, strMeal:meal.strMeal, strMealThumb:meal.strMealThumb,
          strCategory:meal.strCategory||'', strArea:meal.strArea||'', // #25
          uid:user.uid, addedAt:new Date()
        })
        setFavDocId(ref.id); toast.success('Saved to favourites!')
      }
    } catch { toast.error('Something went wrong.') }
    finally { setSaving(false) }
  }

  const toggleSimilarFav = async meal => {
    if(favMap[meal.idMeal]) {
      await deleteDoc(doc(db,'favorites',favMap[meal.idMeal]))
      setFavMap(p=>({...p,[meal.idMeal]:undefined}))
      toast('Removed',{icon:'💔'})
    } else {
      const ref=await addDoc(collection(db,'favorites'),{
        idMeal:meal.idMeal,strMeal:meal.strMeal,strMealThumb:meal.strMealThumb,
        strCategory:'',strArea:'',uid:user.uid,addedAt:new Date()
      })
      setFavMap(p=>({...p,[meal.idMeal]:ref.id})); toast.success('Saved!')
    }
  }

  const getIngredients = m => {
    if(m._ingredients) return m._ingredients
    const list=[]
    for(let i=1;i<=20;i++) {
      const ing=m[`strIngredient${i}`]?.trim()
      const mea=m[`strMeasure${i}`]?.trim()
      if(ing) list.push({ingredient:ing,measure:mea||''})
    }
    return list
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="h-5 w-28 bg-gray-200 rounded animate-pulse mb-6"/>
        <div className="rounded-2xl overflow-hidden animate-pulse shadow-sm mb-6">
          <div className="h-72 bg-gray-200"/>
          <div className="p-6 space-y-3 bg-white"><div className="h-7 bg-gray-200 rounded w-2/3"/><div className="h-4 bg-gray-100 rounded w-1/3"/></div>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 animate-pulse"><div className="h-5 bg-gray-200 rounded mb-4 w-1/2"/>{Array.from({length:6}).map((_,i)=><div key={i} className="h-4 bg-gray-100 rounded mb-2"/>)}</div>
          <div className="sm:col-span-2 bg-white rounded-2xl p-6 animate-pulse"><div className="h-5 bg-gray-200 rounded mb-4 w-1/3"/>{Array.from({length:5}).map((_,i)=><div key={i} className="h-4 bg-gray-100 rounded mb-3"/>)}</div>
        </div>
      </div>
    </div>
  )

  if (!meal) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-5xl">🍽</div>
      <p className="text-gray-600 text-lg font-semibold">Meal not found</p>
      <button onClick={()=>navigate(-1)} className="btn-primary">Go back</button>
    </div>
  )

  const ingredients = getIngredients(meal)
  const ytId = getYtId(meal.strYoutube)
  const checkedCount = Object.values(checked).filter(Boolean).length
  const steps = (meal.strInstructions||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button onClick={()=>navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6">
          <FiArrowLeft size={16}/> Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity:0,y:24 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.45,ease:[0.22,1,0.36,1] }}>

          {/* Hero */}
          <div className="card overflow-hidden mb-6">
            <div className="relative">
              <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-64 sm:h-80 object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent"/>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex gap-2 mb-2 flex-wrap">
                  {meal.strCategory&&<span className="bg-brand-500 text-white text-xs font-semibold px-3 py-1 rounded-full">{meal.strCategory}</span>}
                  {meal.strArea&&<span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">{meal.strArea}</span>}
                  {meal.vegetarian&&<span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Vegetarian</span>}
                  {meal.totalTime>0&&<span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">⏱ {meal.totalTime} min</span>}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">{meal.strMeal}</h1>
              </div>
            </div>
            <div className="p-4 flex items-center gap-3 flex-wrap border-t border-gray-100">
              <button onClick={toggleFav} disabled={saving}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${favDocId?'bg-brand-50 text-brand-600 border border-brand-200':'bg-brand-500 text-white hover:bg-brand-600'}`}>
                {favDocId?<FaHeart size={14}/>:<FaRegHeart size={14}/>}
                {favDocId?'Saved':'Save to favourites'}
              </button>
              {meal.strSource&&<a href={meal.strSource} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm border border-gray-200 text-gray-700 hover:bg-gray-50">
                <FiExternalLink size={15}/> Source
              </a>}
              {/* UX-4: Share button */}
              <button onClick={async()=>{
                const url = window.location.href
                const title = meal.strMeal
                if(navigator.share){
                  try { await navigator.share({title, url}) } catch {}
                } else {
                  await navigator.clipboard.writeText(url)
                  toast.success('Link copied to clipboard!')
                }
              }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm border border-gray-200 text-gray-700 hover:bg-gray-50">
                <FiShare2 size={15}/> Share
              </button>
              {/* UX-9: Print button */}
              <button onClick={()=>window.print()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 print:hidden">
                <FiPrinter size={15}/> Print
              </button>
            </div>
          </div>


          {/* ── 🔥 Calorie & Nutrition Card (USDA FoodData Central) ── */}
          {(nutLoading || nutrition || nutError) && (
            <div className="card p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                  🔥 Nutrition Facts
                  <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">per serving</span>
                </h2>
                {nutrition && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Servings:</span>
                    <div className="flex items-center gap-1">
                      <button onClick={()=>setServings(s=>Math.max(1,s-1))}
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition-colors text-base">
                        −
                      </button>
                      <span className="text-sm font-bold text-gray-800 w-5 text-center">{servings}</span>
                      <button onClick={()=>setServings(s=>s+1)}
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition-colors text-base">
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Skeleton while loading */}
              {nutLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
                  {['Calories','Protein','Carbs','Fat'].map(l => (
                    <div key={l} className="rounded-xl bg-gray-50 p-4 text-center">
                      <div className="h-8 bg-gray-200 rounded mb-2 mx-3"/>
                      <div className="h-3 bg-gray-100 rounded mx-5"/>
                      <div className="h-3 bg-gray-100 rounded mx-3 mt-1"/>
                    </div>
                  ))}
                </div>
              )}

              {/* Error state */}
              {nutError && !nutLoading && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-xl mt-0.5">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Nutrition data unavailable</p>
                    <p className="text-xs text-amber-600 mt-0.5">USDA couldn't match these ingredients. This is normal for some dishes.</p>
                  </div>
                </div>
              )}

              {/* Nutrition data */}
              {nutrition && !nutLoading && (() => {
                const t = nutrition.totals
                const ps = {
                  calories: Math.round(t.calories / servings),
                  protein:  +(t.protein  / servings).toFixed(1),
                  carbs:    +(t.carbs    / servings).toFixed(1),
                  fat:      +(t.fat      / servings).toFixed(1),
                  fiber:    +(t.fiber    / servings).toFixed(1),
                }
                const macros = [
                  { label:'Calories', value:ps.calories, unit:'kcal', color:'#D85A30', bg:'#FFF3EE', pct: Math.min(100, ps.calories/25) },
                  { label:'Protein',  value:ps.protein,  unit:'g',    color:'#2563eb', bg:'#EFF6FF', pct: Math.min(100, ps.protein*2) },
                  { label:'Carbs',    value:ps.carbs,    unit:'g',    color:'#d97706', bg:'#FFFBEB', pct: Math.min(100, ps.carbs/1.5) },
                  { label:'Fat',      value:ps.fat,      unit:'g',    color:'#7c3aed', bg:'#F5F3FF', pct: Math.min(100, ps.fat*2.5) },
                ]
                return (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {macros.map(m => (
                        <div key={m.label} className="rounded-xl p-4 text-center" style={{ background:m.bg }}>
                          <p className="text-2xl font-bold leading-none" style={{ color:m.color }}>{m.value}</p>
                          <p className="text-xs text-gray-500 mt-1">{m.unit}</p>
                          <p className="text-xs text-gray-400">{m.label}</p>
                          <div className="mt-2 h-1 bg-black/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width:`${m.pct}%`, background:m.color }}/>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Secondary stats */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 px-1 mb-3">
                      <span>🌾 Fiber <strong className="text-gray-700">{ps.fiber}g</strong></span>
                      <span>🧂 Sodium <strong className="text-gray-700">{Math.round(t.sodium/servings)}mg</strong></span>
                      <span className="text-gray-300">|</span>
                      <span>Total recipe: <strong className="text-gray-700">{t.calories} kcal</strong></span>
                    </div>

                    {/* Per-ingredient breakdown */}
                    {nutrition.breakdown?.length > 0 && (
                      <>
                        <button onClick={()=>setShowBreakdown(!showBreakdown)}
                          className="text-xs font-semibold flex items-center gap-1 mb-2"
                          style={{ color:'#D85A30' }}>
                          {showBreakdown ? '▲ Hide' : '▼ Show'} ingredient breakdown
                        </button>
                        {showBreakdown && (
                          <div className="rounded-xl overflow-hidden border border-gray-100">
                            <div className="grid grid-cols-5 px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-400">
                              <span className="col-span-2">Ingredient</span>
                              <span className="text-center">Cal</span>
                              <span className="text-center">Prot.</span>
                              <span className="text-center">Carbs</span>
                            </div>
                            {nutrition.breakdown.map((item,i) => (
                              <div key={i} className="grid grid-cols-5 px-3 py-2 border-t border-gray-50 text-xs hover:bg-gray-50">
                                <span className="col-span-2 text-gray-700 font-medium capitalize truncate" title={item.name}>{item.name}</span>
                                <span className="text-center font-bold" style={{ color:'#D85A30' }}>{item.calories}</span>
                                <span className="text-center text-gray-500">{item.protein}g</span>
                                <span className="text-center text-gray-500">{item.carbs}g</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    <p className="text-xs text-gray-300 mt-3">Powered by USDA FoodData Central · Free · Estimates per 100g</p>
                  </>
                )
              })()}
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-6 mb-6">
            {/* Ingredients — #24 Fix C: ingredient images + checkboxes */}
            <div className="sm:col-span-1">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 text-lg">
                    Ingredients <span className="text-sm font-normal text-gray-400">({ingredients.length})</span>
                  </h2>
                  {checkedCount>0&&<span className="text-xs font-semibold text-brand-500">{checkedCount}/{ingredients.length}</span>}
                </div>
                <ul className="space-y-1">
                  {ingredients.map(({ingredient,measure},i)=>(
                    <li key={i} onClick={()=>setChecked(p=>({...p,[i]:!p[i]}))}
                      className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 cursor-pointer group rounded-lg px-1 hover:bg-gray-50 transition-colors select-none">
                      {/* #24 Fix C — ingredient thumbnail from MealDB */}
                      <img
                        src={`https://www.themealdb.com/images/ingredients/${encodeURIComponent(ingredient)}-Small.png`}
                        alt={ingredient} onError={e=>{e.target.style.display='none'}}
                        className="w-9 h-9 object-contain rounded-lg bg-gray-50 p-1 flex-shrink-0"
                        style={{ opacity:checked[i]?0.3:1 }}/>
                      {/* #24 Fix D — clickable ingredient name */}
                      <a href={`https://www.themealdb.com/ingredient/${encodeURIComponent(ingredient)}`}
                        target="_blank" rel="noopener noreferrer"
                        onClick={e=>e.stopPropagation()}
                        className={`flex-1 text-sm font-medium hover:text-brand-500 transition-colors hover:underline ${checked[i]?'line-through text-gray-300':'text-gray-800'}`}>
                        {ingredient}
                      </a>
                      <span className={`text-xs shrink-0 ${checked[i]?'text-gray-200':'text-gray-400'}`}>{measure}</span>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked[i]?'bg-brand-500 border-brand-500':'border-gray-300 group-hover:border-brand-400'}`}>
                        {checked[i]&&<span className="text-white text-xs font-bold">✓</span>}
                      </div>
                    </li>
                  ))}
                </ul>
                {checkedCount===ingredients.length&&ingredients.length>0&&(
                  <div className="mt-4 p-3 bg-green-50 rounded-xl text-center">
                    <div className="text-xl mb-1">✅</div>
                    <p className="text-xs font-semibold text-green-700">All ingredients ready!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions — #24 Fix B: numbered steps */}
            <div className="sm:col-span-2 space-y-6">
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 text-lg mb-5">Instructions</h2>
                {steps.length>0
                  ? <div className="space-y-1">
                      {steps.map((step,i)=>(
                        <div key={i} className="flex gap-4 pb-4 border-b border-gray-50 last:border-0">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                            style={{ background:'#D85A30' }}>{i+1}</div>
                          <p className="text-gray-600 text-sm leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  : <p className="text-gray-400 text-sm">No instructions available.</p>
                }
              </div>

              {/* YouTube embed — #9 */}
              {ytId&&(
                <div className="card overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
                    <FiYoutube size={16} className="text-red-500"/>
                    <span className="font-semibold text-gray-800 text-sm">Watch how to make it</span>
                  </div>
                  <div style={{ position:'relative',paddingBottom:'56.25%',height:0 }}>
                    <iframe src={`https://www.youtube.com/embed/${ytId}`} title={meal.strMeal}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none' }}/>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* #24 Fix E — Similar meals */}
          {similarMeals.length>0&&(
            <div className="mt-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">You might also like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {similarMeals.map(m=>(
                  <MealCard key={m.idMeal} meal={m} isFavorite={!!favMap[m.idMeal]} onToggleFav={toggleSimilarFav}/>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
