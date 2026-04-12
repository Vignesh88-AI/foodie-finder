import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import MealCard from '../components/MealCard'
import SkeletonCard from '../components/SkeletonCard'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiExternalLink, FiYoutube } from 'react-icons/fi'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

const API    = import.meta.env.VITE_API_URL
const MEALDB = 'https://www.themealdb.com/api/json/v1/1'
const getYtId = url => url?.split('v=')?.[1]?.split('&')?.[0]

export default function MealDetails({ user }) {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [meal, setMeal]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [favDocId, setFavDocId]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const [checked, setChecked]     = useState({})
  const [similarMeals, setSimilar] = useState([])
  const [favMap, setFavMap]       = useState({})

  useEffect(() => {
    const fetchMeal = async () => {
      setLoading(true); setChecked({})
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
            </div>
          </div>

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
