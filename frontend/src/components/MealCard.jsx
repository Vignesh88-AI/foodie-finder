import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

// Categories considered vegetarian
const VEG_CATS = ['vegetarian', 'vegan', 'dessert', 'pasta', 'miscellaneous', 'starter', 'breakfast', 'side', 'goat']

function getVegStatus(meal) {
  // Spoonacular gives us explicit fields
  if (meal.vegan)      return 'vegan'
  if (meal.vegetarian) return 'veg'
  const cat = (meal.strCategory || '').toLowerCase()
  if (VEG_CATS.some(v => cat.includes(v))) return 'veg'
  return 'nonveg'
}

const VEG_CONFIG = {
  veg:    { label: 'Veg',    dot: '#22c55e', bg: 'rgba(34,197,94,0.12)',   text: '#16a34a', border: 'rgba(34,197,94,0.3)' },
  vegan:  { label: 'Vegan',  dot: '#16a34a', bg: 'rgba(22,163,74,0.12)',   text: '#15803d', border: 'rgba(22,163,74,0.3)' },
  nonveg: { label: 'Non-Veg',dot: '#ef4444', bg: 'rgba(239,68,68,0.12)',   text: '#dc2626', border: 'rgba(239,68,68,0.3)' },
}

export default function MealCard({ meal, isFavorite, onToggleFav }) {
  const navigate = useNavigate()
  const status   = getVegStatus(meal)
  const cfg      = VEG_CONFIG[status]

  const handleClick = () => {
    if (meal._source === 'spoon') {
      navigate(`/meal/spoon-${meal.idMeal}`)
    } else {
      navigate(`/meal/${meal.idMeal}`)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5, transition: { duration: 0.18 } }}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-100 shadow-sm hover:shadow-lg transition-shadow group"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden">
        <img
          src={meal.strMealThumb?.includes('spoonacular')
            ? meal.strMealThumb
            : `${meal.strMealThumb}/preview`}
          alt={meal.strMeal}
          loading="lazy"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image' }}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-400"
          style={{ transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
        />

        {/* Veg / Non-veg tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, backdropFilter: 'blur(6px)' }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: cfg.dot }} />
          {cfg.label}
        </div>

        {/* Fav button */}
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={(e) => { e.stopPropagation(); onToggleFav(meal) }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
            isFavorite ? 'bg-brand-500 text-white' : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-brand-500'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <motion.div animate={isFavorite ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 0.3 }}>
            {isFavorite ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
          </motion.div>
        </motion.button>

        {/* Category pill */}
        {meal.strCategory && (
          <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-2.5 py-1 rounded-full border border-white/50">
            {meal.strCategory}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
          {meal.strMeal}
        </h3>
        {meal.strArea && (
          <p className="text-xs text-gray-400 mt-1">{meal.strArea} cuisine</p>
        )}
      </div>
    </motion.div>
  )
}
