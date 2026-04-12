import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

// Every word that definitively means NON-VEG
const NONVEG_KEYWORDS = [
  'chicken','beef','lamb','pork','fish','prawn','shrimp','crab','lobster',
  'salmon','tuna','mutton','turkey','duck','bacon','sausage','venison',
  'anchovy','sardine','chorizo','pepperoni','meatball','steak','ribs',
  'mince','minced','meat','ham','veal','brisket','pulled pork','oxtail',
  'biryani','butter chicken','chicken tikka','tandoori','keema','kheema',
  'rogan josh','nihari','haleem','seekh','kebab','korma','boti','murgh',
  'kung pao','general tso','orange chicken','katsudon','teriyaki','yakitori',
  'shawarma','doner','gyro','jerk chicken','rendang','ayam','nasi goreng',
  'carbonara','bolognese','pancetta','prosciutto','lardon',
  'pad thai','massaman','satay','tom kha','pho','bulgogi','galbi',
  'seafood','shellfish','octopus','squid','calamari','clam','mussel','oyster',
]

// Every word that definitively means VEG (only used when NO nonveg keyword found)
const VEG_KEYWORDS = [
  'vegetarian','vegan','paneer','tofu','tempeh','dal','dhal','lentil',
  'chana','aloo','gobi','palak','saag','rajma','chole','bhatura',
  'idli','dosa','uttapam','dhokla','khichdi','poha','upma','samosa',
  'falafel','hummus','shakshuka','caprese','bruschetta','margherita',
  'ratatouille','gazpacho','minestrone','ribollita',
  'mushroom risotto','pasta primavera','mac and cheese','grilled cheese',
  'avocado','spinach pie','spanakopita','moussaka vegetarian',
  'bean','chickpea','pumpkin soup','tomato soup','french onion soup',
  'cheese pizza','veggie burger','garden salad','caesar salad',
]

// Strict category → veg/nonveg (only when strCategory is available from search/lookup)
const CAT_NONVEG = ['chicken','beef','seafood','goat','turkey','duck','fish','pork','lamb']
const CAT_VEG    = ['vegetarian','vegan','dessert','pasta','miscellaneous','starter','breakfast','side']

function detectVeg(meal) {
  // Spoonacular gives explicit booleans — always trust these
  if (meal.vegan === true)      return 'veg'
  if (meal.vegetarian === true) return 'veg'

  // Check MealDB category (only from search/lookup, not filter.php)
  const cat = (meal.strCategory || '').toLowerCase().trim()
  if (cat) {
    if (CAT_NONVEG.some(k => cat.startsWith(k))) return 'nonveg'
    if (CAT_VEG.some(k => cat.startsWith(k)))    return 'veg'
  }

  // Check ingredients (available from lookup — most reliable)
  const ingredients = Array.from({length:20},(_,i)=>(meal[`strIngredient${i+1}`]||'').toLowerCase()).join(' ')
  if (ingredients.trim().length > 10) {
    if (NONVEG_KEYWORDS.some(k => ingredients.includes(k))) return 'nonveg'
    return 'veg'
  }

  // Final: check meal NAME for keywords
  const name = (meal.strMeal || '').toLowerCase()
  if (NONVEG_KEYWORDS.some(k => name.includes(k))) return 'nonveg'
  if (VEG_KEYWORDS.some(k => name.includes(k)))    return 'veg'

  return 'veg' // default to veg when we have no evidence of meat
}

const TAG = {
  veg:    { label: '● Veg',     bg: 'rgba(22,163,74,0.92)',  text: 'white' },
  nonveg: { label: '● Non-Veg', bg: 'rgba(220,38,38,0.92)',  text: 'white' },
}

export default function MealCard({ meal, isFavorite, onToggleFav }) {
  const navigate = useNavigate()
  const vegStatus = detectVeg(meal)
  const tag = vegStatus ? TAG[vegStatus] : null

  const imgSrc = meal._source === 'spoon' ? meal.strMealThumb : meal.strMealThumb

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
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}
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
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)' }} />

        {/* Veg/Non-veg tag — only shown when confident */}
        {tag && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: tag.bg, color: tag.text,
            padding: '3px 9px', borderRadius: 99,
            fontSize: 11, fontWeight: 700,
            backdropFilter: 'blur(4px)',
            letterSpacing: '0.02em',
          }}>
            {tag.label}
          </div>
        )}

        {/* Fav button */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={e => { e.stopPropagation(); onToggleFav(meal) }}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 32, height: 32, borderRadius: '50%',
            background: isFavorite ? '#D85A30' : 'rgba(255,255,255,0.92)',
            color: isFavorite ? 'white' : '#9ca3af',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)',
            transition: 'all .2s',
          }}
        >
          <motion.div animate={isFavorite ? { scale: [1,1.4,1] } : {}} transition={{ duration: 0.3 }}>
            {isFavorite ? <FaHeart size={13} /> : <FaRegHeart size={13} />}
          </motion.div>
        </motion.button>
      </div>

      <div style={{ padding: '12px 14px' }}>
        <h3 style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a', marginBottom: 4, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          className="group-hover:text-brand-600 transition-colors">
          {meal.strMeal}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
          {meal.strArea && <span style={{ fontSize: 11, color: '#a8a29e' }}>{meal.strArea}</span>}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {meal.calories > 0 && (
              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: '#f0fdf4', color: '#16a34a', fontWeight: 600 }}>
                🔥 {meal.calories} kcal
              </span>
            )}
            {meal.strCategory && (
              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: '#FFF3EE', color: '#D85A30', fontWeight: 600 }}>
                {meal.strCategory}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
