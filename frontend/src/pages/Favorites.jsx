import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, query, where, onSnapshot,
  addDoc, deleteDoc, doc
} from 'firebase/firestore'
import { db } from '../firebase'
import MealCard from '../components/MealCard'
import toast from 'react-hot-toast'
import { FiArrowLeft } from 'react-icons/fi'

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white animate-pulse shadow-sm border border-gray-100">
      <div className="h-48 bg-gray-200" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  )
}

export default function Favorites({ user }) {
  const [favorites, setFavorites] = useState([])
  const [favMap, setFavMap]       = useState({})  // { idMeal: docId }
  const [loading, setLoading]     = useState(true)
  const navigate                  = useNavigate()

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'favorites'), where('uid', '==', user.uid))
    const unsub = onSnapshot(q, (snap) => {
      const items = []
      const map   = {}
      snap.forEach((d) => {
        items.push({ ...d.data(), _docId: d.id })
        map[d.data().idMeal] = d.id
      })
      // Sort newest first
      items.sort((a, b) => b.addedAt?.toMillis?.() - a.addedAt?.toMillis?.())
      setFavorites(items)
      setFavMap(map)
      setLoading(false)
    })
    return unsub
  }, [user])

  const removeFav = async (meal) => {
    const docId = favMap[meal.idMeal]
    if (!docId) return
    await deleteDoc(doc(db, 'favorites', docId))
    toast('Removed from favorites', { icon: '💔' })
  }

  // Not used on this page (all are already fav) but MealCard requires it
  const toggleFav = (meal) => removeFav(meal)



  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-6xl mx-auto px-4 pt-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <FiArrowLeft size={16} />
            Back to home
          </button>
          <h1 className="font-display text-3xl font-bold text-gray-900">Your saved meals</h1>
          <p className="text-gray-500 mt-1">
            {favorites.length === 0
              ? 'Nothing saved yet'
              : `${favorites.length} meal${favorites.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>

        {/* Skeleton loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({length:8}).map((_,i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {favorites.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="text-6xl mb-5">🤍</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No saved meals yet</h2>
            <p className="text-gray-400 max-w-xs mb-6">
              Start exploring and tap the heart on any meal to save it here.
            </p>
            <button onClick={() => navigate('/home')} className="btn-primary">
              Browse meals
            </button>
          </motion.div>
        )}

        {/* Grid */}
        {favorites.length > 0 && (
          <AnimatePresence>
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {favorites.map((meal, i) => (
                <motion.div
                  key={meal.idMeal}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <MealCard
                    meal={meal}
                    isFavorite={true}
                    onToggleFav={toggleFav}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </div>
  )
}
