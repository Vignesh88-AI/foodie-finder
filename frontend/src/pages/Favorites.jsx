import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import MealCard from '../components/MealCard'
import SkeletonCard from '../components/SkeletonCard' // Code-2 fix: use shared component
import toast from 'react-hot-toast'
import { FiArrowLeft, FiSearch, FiX } from 'react-icons/fi'

export default function Favorites({ user }) {
  const [favorites, setFavorites] = useState([])
  const [favMap, setFavMap]       = useState({})
  const [loading, setLoading]     = useState(true)
  const [searchQuery, setSearchQuery] = useState('') // UX-5: filter state
  const navigate = useNavigate()
  const pendingDeletes = useRef({}) // UX-1: undo map { docId: timeoutId }

  useEffect(() => {
    if (!user) return
    const q = query(collection(db,'favorites'), where('uid','==',user.uid))
    const unsub = onSnapshot(q, (snap) => {
      const items = [], map = {}
      snap.forEach(d => { items.push({ ...d.data(), _docId: d.id }); map[d.data().idMeal] = d.id })
      items.sort((a,b) => b.addedAt?.toMillis?.() - a.addedAt?.toMillis?.())
      setFavorites(items); setFavMap(map); setLoading(false)
    })
    return unsub
  }, [user])

  // UX-1: Undo-able remove
  const removeFav = async (meal) => {
    const docId = favMap[meal.idMeal]
    if (!docId) return

    // Optimistically hide by marking as pending
    pendingDeletes.current[docId] = true

    const toastId = toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">Removed from favourites</span>
          <button
            onClick={() => {
              clearTimeout(pendingDeletes.current[docId + '_timer'])
              delete pendingDeletes.current[docId]
              delete pendingDeletes.current[docId + '_timer']
              toast.dismiss(t.id)
              toast('Kept in favourites', { icon: '❤️', duration: 2000 })
            }}
            className="text-xs font-bold px-2 py-1 rounded-lg"
            style={{ background: '#D85A30', color: 'white' }}>
            Undo
          </button>
        </div>
      ),
      { duration: 5000, icon: '💔' }
    )

    const timer = setTimeout(async () => {
      if (pendingDeletes.current[docId]) {
        await deleteDoc(doc(db, 'favorites', docId))
        delete pendingDeletes.current[docId]
        delete pendingDeletes.current[docId + '_timer']
      }
    }, 5000)

    pendingDeletes.current[docId + '_timer'] = timer
    toast.dismiss(toastId) // dismiss first then show custom
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">Removed from favourites</span>
          <button
            onClick={() => {
              clearTimeout(timer)
              delete pendingDeletes.current[docId]
              delete pendingDeletes.current[docId + '_timer']
              toast.dismiss(t.id)
              toast('Kept!', { icon: '❤️', duration: 2000 })
            }}
            className="text-xs font-bold px-2 py-1 rounded-lg"
            style={{ background: '#D85A30', color: 'white' }}>
            Undo
          </button>
        </div>
      ),
      { duration: 5000, icon: '💔', id: 'undo-' + docId }
    )
  }

  const toggleFav = (meal) => removeFav(meal)

  // UX-5: Filter favourites in real-time
  const filteredFavs = favorites.filter(m => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return m.strMeal?.toLowerCase().includes(q) ||
           m.strArea?.toLowerCase().includes(q) ||
           m.strCategory?.toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-6xl mx-auto px-4 pt-8">

        {/* Code-3 fix: redesigned header */}
        <div className="mb-8">
          <button onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
            <FiArrowLeft size={16}/> Back to home
          </button>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span>❤️</span> Saved meals
              </h1>
              <p className="text-gray-500 mt-1">
                {!loading && (favorites.length === 0
                  ? 'Nothing saved yet'
                  : `${favorites.length} meal${favorites.length!==1?'s':''} in your collection`)}
              </p>
            </div>
            {favorites.length > 0 && (
              <div className="text-sm text-gray-400 bg-gray-50 px-4 py-2 rounded-xl">
                Sort: <span className="font-semibold text-gray-700">Recently added</span>
              </div>
            )}
          </div>

          {/* UX-5: Search/filter bar */}
          {favorites.length > 0 && (
            <div className="relative mt-4 max-w-sm">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search your saved meals…"
                className="input pl-10 pr-10 py-2.5 text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FiX size={14}/>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Skeleton loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({length:8}).map((_,i) => <SkeletonCard key={i}/>)}
          </div>
        )}

        {/* Empty state */}
        {!loading && favorites.length === 0 && (
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
            className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-5">🤍</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No saved meals yet</h2>
            <p className="text-gray-400 max-w-xs mb-6">Start exploring and tap the heart on any meal to save it here.</p>
            <button onClick={() => navigate('/home')} className="btn-primary">Browse meals</button>
          </motion.div>
        )}

        {/* No search results */}
        {!loading && favorites.length > 0 && filteredFavs.length === 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-600 font-medium">No meals match "{searchQuery}"</p>
            <button onClick={() => setSearchQuery('')} className="text-brand-500 text-sm mt-2 hover:underline">Clear search</button>
          </motion.div>
        )}

        {/* Grid */}
        {!loading && filteredFavs.length > 0 && (
          <AnimatePresence>
            <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFavs.map((meal,i) => (
                <motion.div key={meal.idMeal}
                  initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
                  exit={{ opacity:0,scale:0.9 }} transition={{ delay:i*0.04 }}>
                  <MealCard meal={meal} isFavorite={true} onToggleFav={toggleFav}/>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
