import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

// ── Veg detection ──────────────────────────────────────────────────────────
// MealDB filter.php only returns idMeal, strMeal, strMealThumb — no category.
// So we detect from meal NAME + strCategory (when available from search/lookup).

const NONVEG_NAMES = [
  'chicken','beef','lamb','pork','fish','prawn','shrimp','crab','lobster',
  'salmon','tuna','mutton','turkey','duck','bacon','sausage','venison',
  'anchovy','sardine','chorizo','pepperoni','meatball','steak','ribs',
  'biryani','butter chicken','chicken tikka','tandoori','keema','kheema',
  'rogan josh','nihari','haleem','seekh','kebab','korma','boti',
  'kung pao','general tso','orange chicken','sweet sour chicken',
  'pad thai','green curry','massaman','satay','katsudon','teriyaki',
  'shawarma','doner','gyro','jerk chicken','oxtail','rendang',
  'carbonara','bolognese','lasagna','pancetta','prosciutto',
]

const VEG_NAMES = [
  'vegetarian','vegan','paneer','tofu','dal','dhal','chana','aloo','gobi',
  'palak','saag','rajma','chole','bhatura','idli','dosa','samosa',
  'falafel','hummus','bruschetta','caprese','margherita','primavera',
  'mushroom','spinach','pumpkin','tomato soup','minestrone','gazpacho',
  'potato','sweet potato','lentil','bean','chickpea','avocado',
  'cheese pizza','veggie','garden','pasta primavera','macaroni cheese',
  'mac and cheese','grilled cheese','french onion','ratatouille',
]

const STRICT_VEG_CATS = [
  'vegetarian','vegan','dessert','pasta','miscellaneous','starter','breakfast','side'
]
const STRICT_NONVEG_CATS = [
  'chicken','beef','seafood','lamb','pork','goat','turkey','duck','fish'
]

function getVegStatus(meal) {
  // 1. Spoonacular explicit flags — most reliable
  if (meal.vegan === true)      return 'vegan'
  if (meal.vegetarian === true) return 'veg'
  if (meal._source === 'spoon') return 'nonveg' // spoonacular non-flagged = nonveg

  // 2. MealDB category (only available from search/lookup, not filter)
  const cat = (meal.strCategory || '').toLowerCase().trim()
  if (cat && STRICT_NONVEG_CATS.some(v => cat === v || cat.startsWith(v))) return 'nonveg'
  if (cat && STRICT_VEG_CATS.some(v => cat === v || cat.startsWith(v)))    return 'veg'

  // 3. Check ingredients list (available from lookup, not filter)
  const allIngredients = Array.from({ length: 20 }, (_, i) =>
    (meal[`strIngredient${i + 1}`] || '').toLowerCase()
  ).join(' ')
  if (allIngredients.length > 5) { // has ingredient data
    const meatInIngredients = ['chicken','beef','pork','lamb','fish','salmon','tuna',
      'prawn','shrimp','turkey','bacon','mutton','crab','lobster','duck','venison',
      'anchovy','sardine','chorizo','pepperoni','mince','meatball']
    if (meatInIngredients.some(m => allIngredients.includes(m))) return 'nonveg'
    return 'veg' // has ingredients but no meat = veg
  }

  // 4. Detect from meal NAME — most common fallback for filter.php results
  const name = (meal.strMeal || '').toLowerCase()
  if (NONVEG_NAMES.some(w => name.includes(w))) return 'nonveg'
  if (VEG_NAMES.some(w => name.includes(w)))    return 'veg'

  // 5. Last resort — hide tag rather than guess wrong
  return 'unknown'
}

const VEG_CONFIG = {
  veg:     { label: 'Veg',     dot: '#16a34a', bg: 'rgba(22,163,74,0.15)',  text: '#15803d', border: 'rgba(22,163,74,0.25)' },
  vegan:   { label: 'Vegan',   dot: '#15803d', bg: 'rgba(21,128,61,0.15)',  text: '#14532d', border: 'rgba(21,128,61,0.25)' },
  nonveg:  { label: 'Non-Veg', dot: '#dc2626', bg: 'rgba(220,38,38,0.15)',  text: '#b91c1c', border: 'rgba(220,38,38,0.25)' },
  unknown: null, // don't show tag
}

export default function MealCard({ meal, isFavorite, onToggleFav }) {
  const navigate = useNavigate()
  const status   = getVegStatus(meal)
  const cfg      = VEG_CONFIG[status]

  const imgSrc = meal._source === 'spoon'
    ? meal.strMealThumb
    : meal.strMealThumb  // full res MealDB

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
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}
      onClick={handleClick}
    >
      <div className="relative overflow-hidden" style={{ height: 200 }}>
        <img
          src={imgSrc}
          alt={meal.strMeal}
          loading="lazy"
          onError={e => { e.target.src = 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg' }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          style={{ transitionDuration: '500ms', transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
        />

        {/* Gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 55%)' }} />

        {/* Veg/Non-veg badge — only show when we're confident */}
        {cfg && (
          <div
            className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{
              background: cfg.bg, color: cfg.text,
              border: `1px solid ${cfg.border}`,
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              fontSize: 11,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
            {cfg.label}
          </div>
        )}

        {/* Fav button */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={e => { e.stopPropagation(); onToggleFav(meal) }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            background: isFavorite ? '#D85A30' : 'rgba(255,255,255,0.92)',
            color: isFavorite ? 'white' : '#9ca3af',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(8px)',
          }}
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
          {meal.strArea && <span className="text-xs text-gray-400">{meal.strArea}</span>}
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
