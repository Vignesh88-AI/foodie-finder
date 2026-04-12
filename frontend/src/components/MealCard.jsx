import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

// ── Veg detection ──────────────────────────────────────────────────────────
// MealDB strCategory values that are definitively vegetarian
const STRICT_VEG = [
  'vegetarian', 'vegan', 'dessert', 'pasta', 'breakfast',
  'miscellaneous', 'starter', 'side'
]
// MealDB strCategory values that are definitively non-veg
const STRICT_NONVEG = [
  'chicken', 'beef', 'seafood', 'lamb', 'pork', 'goat',
  'turkey', 'duck', 'fish'
]

function getVegStatus(meal) {
  // Spoonacular provides explicit boolean flags — trust them completely
  if (meal.vegan === true)      return 'vegan'
  if (meal.vegetarian === true) return 'veg'
  // If spoonacular but not flagged, check dishTypes
  if (meal._source === 'spoon') return 'nonveg'

  // MealDB — use strCategory
  const cat = (meal.strCategory || '').toLowerCase().trim()

  if (STRICT_NONVEG.some(v => cat === v || cat.startsWith(v))) return 'nonveg'
  if (STRICT_VEG.some(v => cat === v || cat.startsWith(v)))    return 'veg'

  // Also check ingredient names for obvious meat keywords
  const ingredients = Array.from({ length: 20 }, (_, i) => meal[`strIngredient${i + 1}`] || '').join(' ').toLowerCase()
  const meatWords = ['chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'prawn', 'shrimp', 'turkey', 'bacon', 'mutton', 'crab', 'lobster', 'duck', 'venison', 'anchovy', 'sardine', 'chorizo', 'pepperoni']
  if (meatWords.some(m => ingredients.includes(m))) return 'nonveg'

  return 'veg' // default to veg when uncertain rather than wrongly marking veg food as nonveg
}

const VEG_CONFIG = {
  veg:    { label: 'Veg',     dot: '#16a34a', bg: 'rgba(22,163,74,0.15)',  text: '#15803d', border: 'rgba(22,163,74,0.25)' },
  vegan:  { label: 'Vegan',   dot: '#15803d', bg: 'rgba(21,128,61,0.15)',  text: '#14532d', border: 'rgba(21,128,61,0.25)' },
  nonveg: { label: 'Non-Veg', dot: '#dc2626', bg: 'rgba(220,38,38,0.15)',  text: '#b91c1c', border: 'rgba(220,38,38,0.25)' },
}

export default function MealCard({ meal, isFavorite, onToggleFav }) {
  const navigate = useNavigate()
  const status   = getVegStatus(meal)
  const cfg      = VEG_CONFIG[status]

  // Use full-resolution image (remove /preview suffix for better quality)
  const imgSrc = meal._source === 'spoon'
    ? meal.strMealThumb
    : meal.strMealThumb  // MealDB full res — no /preview

  const handleClick = () => {
    navigate(meal._source === 'spoon' ? `/meal/spoon-${meal.idMeal}` : `/meal/${meal.idMeal}`)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6, transition: { duration: 0.2, ease: [0.22,1,0.36,1] } }}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer group"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}
      onClick={handleClick}
    >
      <div className="relative overflow-hidden" style={{ height: 200 }}>
        <img
          src={imgSrc}
          alt={meal.strMeal}
          loading="lazy"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop' }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          style={{ transitionDuration: '500ms', transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }} />

        {/* Veg/Non-veg badge — top left */}
        <div
          className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
          {cfg.label}
        </div>

        {/* Fav button — top right */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); onToggleFav(meal) }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            background: isFavorite ? '#D85A30' : 'rgba(255,255,255,0.92)',
            color: isFavorite ? 'white' : '#9ca3af',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(8px)',
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <motion.div animate={isFavorite ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
            {isFavorite ? <FaHeart size={13} /> : <FaRegHeart size={13} />}
          </motion.div>
        </motion.button>
      </div>

      {/* Card body */}
      <div className="p-3.5">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors mb-1">
          {meal.strMeal}
        </h3>
        <div className="flex items-center justify-between">
          {meal.strArea && (
            <span className="text-xs text-gray-400">{meal.strArea}</span>
          )}
          {meal.strCategory && (
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: '#FFF3EE', color: '#D85A30', fontSize: 11 }}>
              {meal.strCategory}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
