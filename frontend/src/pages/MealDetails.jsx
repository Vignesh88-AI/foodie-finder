import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  collection, query, where, getDocs,
  addDoc, deleteDoc, doc
} from 'firebase/firestore'
import { db } from '../firebase'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiYoutube, FiExternalLink } from 'react-icons/fi'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

const API = import.meta.env.VITE_API_URL

export default function MealDetails({ user }) {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [meal, setMeal]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [favDocId, setFavDocId] = useState(null)  // firestore doc id if saved
  const [saving, setSaving]     = useState(false)

  // Fetch meal from backend
  useEffect(() => {
    const fetchMeal = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${API}/api/meal/${id}`)
        const data = await res.json()
        setMeal(data.meals?.[0] || null)
      } catch {
        toast.error('Could not load meal details.')
      } finally {
        setLoading(false)
      }
    }
    fetchMeal()
  }, [id])

  // Check if already in favorites
  useEffect(() => {
    if (!user || !id) return
    const checkFav = async () => {
      const q    = query(
        collection(db, 'favorites'),
        where('uid', '==', user.uid),
        where('idMeal', '==', id)
      )
      const snap = await getDocs(q)
      if (!snap.empty) setFavDocId(snap.docs[0].id)
    }
    checkFav()
  }, [user, id])

  const toggleFav = async () => {
    if (!meal) return
    setSaving(true)
    try {
      if (favDocId) {
        await deleteDoc(doc(db, 'favorites', favDocId))
        setFavDocId(null)
        toast('Removed from favorites', { icon: '💔' })
      } else {
        const docRef = await addDoc(collection(db, 'favorites'), {
          idMeal:       meal.idMeal,
          strMeal:      meal.strMeal,
          strMealThumb: meal.strMealThumb,
          uid:          user.uid,
          addedAt:      new Date()
        })
        setFavDocId(docRef.id)
        toast.success('Saved to favorites!')
      }
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setSaving(false)
    }
  }

  // Build ingredients list
  const getIngredients = (m) => {
    const list = []
    for (let i = 1; i <= 20; i++) {
      const ing = m[`strIngredient${i}`]?.trim()
      const mea = m[`strMeasure${i}`]?.trim()
      if (ing) list.push({ ingredient: ing, measure: mea || '' })
    }
    return list
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!meal) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500 text-lg">Meal not found.</p>
      <button onClick={() => navigate(-1)} className="btn-primary">Go back</button>
    </div>
  )

  const ingredients = getIngredients(meal)

  return (
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* Back button */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <FiArrowLeft size={18} />
          Back to search
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Hero image + title */}
          <div className="card overflow-hidden mb-6">
            <div className="relative">
              <img
                src={meal.strMealThumb}
                alt={meal.strMeal}
                className="w-full h-64 sm:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex gap-2 mb-2 flex-wrap">
                  {meal.strCategory && (
                    <span className="bg-brand-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      {meal.strCategory}
                    </span>
                  )}
                  {meal.strArea && (
                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                      {meal.strArea} cuisine
                    </span>
                  )}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  {meal.strMeal}
                </h1>
              </div>
            </div>

            {/* Action bar */}
            <div className="p-4 flex items-center gap-3 border-t border-gray-100">
              <button
                onClick={toggleFav}
                disabled={saving}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  favDocId
                    ? 'bg-brand-50 text-brand-600 border border-brand-200 hover:bg-brand-100'
                    : 'bg-brand-500 text-white hover:bg-brand-600'
                }`}
              >
                {favDocId ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
                {favDocId ? 'Saved to favorites' : 'Save to favorites'}
              </button>

              {meal.strYoutube && (
                <a
                  href={meal.strYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <FiYoutube size={16} className="text-red-500" />
                  Watch video
                </a>
              )}

              {meal.strSource && (
                <a
                  href={meal.strSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <FiExternalLink size={16} />
                  Source
                </a>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">

            {/* Ingredients */}
            <div className="sm:col-span-1">
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 text-lg mb-4">
                  Ingredients
                  <span className="ml-2 text-sm font-normal text-gray-400">({ingredients.length})</span>
                </h2>
                <ul className="space-y-2.5">
                  {ingredients.map(({ ingredient, measure }, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-gray-800 font-medium">{ingredient}</span>
                      <span className="text-gray-400 text-right shrink-0">{measure}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Instructions */}
            <div className="sm:col-span-2">
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 text-lg mb-4">Instructions</h2>
                <div className="space-y-4">
                  {meal.strInstructions
                    ? meal.strInstructions
                        .split(/\r?\n/)
                        .filter(Boolean)
                        .map((para, i) => (
                          <p key={i} className="text-gray-600 text-sm leading-relaxed">
                            {para}
                          </p>
                        ))
                    : <p className="text-gray-400 text-sm">No instructions available.</p>
                  }
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  )
}
