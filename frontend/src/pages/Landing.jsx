import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import { FiSearch, FiHeart, FiGlobe, FiArrowRight, FiStar, FiClock, FiMapPin, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

// ── data ────────────────────────────────────────────────────────────────────
const HERO_MEALS = [
  { name: 'Chicken Biryani',     area: 'Indian',   img: 'https://www.themealdb.com/images/media/meals/obgssl1511423078.jpg' },
  { name: 'Butter Chicken',      area: 'Indian',   img: 'https://www.themealdb.com/images/media/meals/1548772327.jpg' },
  { name: 'Spaghetti Carbonara', area: 'Italian',  img: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg' },
  { name: 'Pad Thai',            area: 'Thai',     img: 'https://www.themealdb.com/images/media/meals/uuuspp1511297945.jpg' },
]

const CUISINES_PREVIEW = [
  { flag: '🇮🇳', name: 'Indian',   count: '50+ dishes', color: 'from-orange-400 to-red-500',   img: 'https://www.themealdb.com/images/media/meals/obgssl1511423078.jpg' },
  { flag: '🇮🇹', name: 'Italian',  count: '40+ dishes', color: 'from-green-400 to-emerald-600', img: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg' },
  { flag: '🇯🇵', name: 'Japanese', count: '35+ dishes', color: 'from-pink-400 to-rose-600',     img: 'https://www.themealdb.com/images/media/meals/g046bb1663960946.jpg' },
  { flag: '🇲🇽', name: 'Mexican',  count: '30+ dishes', color: 'from-yellow-400 to-orange-500', img: 'https://www.themealdb.com/images/media/meals/ypxvwv1505333929.jpg' },
  { flag: '🇨🇳', name: 'Chinese',  count: '45+ dishes', color: 'from-red-400 to-rose-600',      img: 'https://www.themealdb.com/images/media/meals/1529446352.jpg' },
  { flag: '🇹🇭', name: 'Thai',     count: '30+ dishes', color: 'from-purple-400 to-violet-600', img: 'https://www.themealdb.com/images/media/meals/uuuspp1511297945.jpg' },
]

const FEATURES = [
  { icon: '🔍', title: 'Smart Search',      desc: 'Search any dish — biryani, tacos, ramen. Powered by Spoonacular + MealDB.' },
  { icon: '🌍', title: '25+ Cuisines',      desc: 'Indian, Italian, Chinese, Mexican, Japanese and more world cuisines.' },
  { icon: '💚', title: 'Veg & Non-Veg',     desc: 'Every meal tagged Veg or Non-Veg at a glance. Filter instantly.' },
  { icon: '❤️', title: 'Personal Cookbook', desc: 'Save favourites to your cloud collection — accessible anywhere.' },
]

const MARQUEE_ITEMS = [
  'Chicken Biryani', 'Butter Masala', 'Pad Thai', 'Sushi', 'Tacos',
  'Carbonara', 'Kung Pao', 'Dal Makhani', 'Croissants', 'Shawarma',
  'Palak Paneer', 'Ramen', 'Tiramisu', 'Gulab Jamun', 'Jerk Chicken',
]

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >{children}</motion.div>
  )
}

// ── component ────────────────────────────────────────────────────────────────
export default function Landing() {
  const [heroIdx, setHeroIdx] = useState(0)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY  = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOp = useTransform(scrollYProgress, [0, 0.9], [1, 0])

  // auto-rotate hero
  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_MEALS.length), 4000)
    return () => clearInterval(t)
  }, [])

  const meal = HERO_MEALS[heroIdx]

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#FDF8F3', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: 'rgba(253,248,243,0.88)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.span animate={{ rotate: [0, -10, 10, -5, 0] }} transition={{ duration: 1.4, delay: 1 }}>
              <span className="text-2xl">🍽</span>
            </motion.span>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
              Dish<span style={{ color: '#D85A30' }}>covery</span>
            </span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium" style={{ color: '#555' }}>
            <a href="#cuisines" className="hover:text-gray-900 transition-colors">Cuisines</a>
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#about"    className="hover:text-gray-900 transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login"
              className="text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              style={{ color: '#555' }}
            >Sign in</Link>
            <Link to="/signup"
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-95 text-white"
              style={{ background: '#D85A30' }}
            >Get started</Link>
          </div>
        </div>
      </motion.header>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16 overflow-hidden">

        {/* Background image — parallax */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div key={heroIdx}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <img src={meal.img} alt={meal.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(253,248,243,0.97) 0%, rgba(253,248,243,0.90) 40%, rgba(253,248,243,0.3) 100%)' }} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div style={{ opacity: heroOp }} className="relative z-10 w-full max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center py-24">

          {/* Left text */}
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6 border"
                style={{ background: '#FFF3EE', color: '#D85A30', borderColor: '#FFDDD0' }}>
                <FiStar size={12} /> Free · No Ads · Just Food
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(42px,6vw,72px)', lineHeight: 1.1, color: '#1a1a1a', fontWeight: 800, marginBottom: 24 }}
            >
              Experience<br />
              <span style={{ color: '#D85A30' }}>Culinary Art</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-lg leading-relaxed mb-8 max-w-md" style={{ color: '#666' }}>
              Discover the finest recipes crafted from every corner of the world.
              From Indian biryani to Italian pasta — find, save, and cook meals you'll love.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3 mb-10">
              <Link to="/signup"
                className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-2xl text-white transition-all shadow-lg active:scale-95"
                style={{ background: '#D85A30', boxShadow: '0 8px 24px rgba(216,90,48,0.35)' }}>
                Start Exploring <FiArrowRight size={18} />
              </Link>
              <Link to="/login"
                className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-2xl transition-all border active:scale-95"
                style={{ background: 'white', borderColor: '#e5e7eb', color: '#444' }}>
                Sign In
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex gap-8 flex-wrap" style={{ borderTop: '1px solid #eee', paddingTop: 24 }}>
              {[['300+', 'Recipes'], ['25+', 'Cuisines'], ['100%', 'Free']].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28, fontWeight: 700, color: '#D85A30' }}>{v}</div>
                  <div style={{ fontSize: 13, color: '#888' }}>{l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — photo grid like La Maison */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:grid grid-cols-2 gap-3 relative"
          >
            {HERO_MEALS.map((m, i) => (
              <motion.div key={m.name}
                whileHover={{ scale: 1.03, y: -4 }}
                className={`rounded-2xl overflow-hidden shadow-xl border-2 border-white ${i === heroIdx ? 'ring-2' : ''}`}
                style={{ aspectRatio: '4/3', ringColor: '#D85A30' }}
              >
                <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
                  <p className="text-white text-xs font-semibold truncate px-1">{m.name}</p>
                </div>
              </motion.div>
            ))}

            {/* floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
              className="absolute -bottom-4 -left-4 rounded-2xl px-4 py-3 shadow-xl border-2 border-white"
              style={{ background: '#D85A30', color: 'white' }}
            >
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>15+</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>YEARS OF FLAVOUR</div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Hero nav dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_MEALS.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)}
              className="rounded-full transition-all"
              style={{ width: i === heroIdx ? 24 : 8, height: 8, background: i === heroIdx ? '#D85A30' : '#ccc' }}
            />
          ))}
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────── */}
      <div style={{ background: '#1a1a1a', padding: '12px 0', overflow: 'hidden' }}>
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="flex gap-8 w-max">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="text-sm font-medium whitespace-nowrap flex items-center gap-3" style={{ color: '#aaa' }}>
              <span style={{ color: '#D85A30', fontSize: 10 }}>✦</span>
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── CUISINES SECTION ─────────────────────────────────────── */}
      <section id="cuisines" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4"
              style={{ background: '#FFF3EE', color: '#D85A30' }}>
              World Cuisines
            </span>
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(32px,4vw,48px)', fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>
              From Every Corner of the World
            </h2>
            <p style={{ color: '#888', fontSize: 16 }}>Explore 25+ cuisines — including your favourite Indian dishes 🇮🇳</p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {CUISINES_PREVIEW.map((c, i) => (
              <Reveal key={c.name} delay={i * 0.08}>
                <motion.div whileHover={{ y: -6, scale: 1.02 }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer shadow-md border-2 border-white"
                  style={{ aspectRatio: '16/10' }}
                >
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{c.flag}</span>
                      <span className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display',serif" }}>{c.name}</span>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ background: 'rgba(216,90,48,0.8)' }}>{c.count}</span>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>

          <Reveal className="text-center mt-10">
            <Link to="/signup"
              className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-2xl text-white transition-all active:scale-95"
              style={{ background: '#D85A30' }}>
              Browse All Cuisines <FiArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURES / OUR STORY ─────────────────────────────────── */}
      <section id="features" style={{ background: '#1a1a1a', padding: '96px 24px' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — photo collage */}
            <Reveal>
              <div className="grid grid-cols-2 gap-3 relative">
                {HERO_MEALS.slice(0, 4).map((m, i) => (
                  <motion.div key={m.name} whileHover={{ scale: 1.04 }}
                    className="rounded-2xl overflow-hidden border-2 border-white/10"
                    style={{ aspectRatio: '4/3' }}>
                    <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                  </motion.div>
                ))}
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -bottom-4 -right-4 rounded-2xl px-4 py-3 border-2 shadow-xl"
                  style={{ background: '#D85A30', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>50K+</div>
                  <div style={{ fontSize: 11, opacity: 0.85 }}>HAPPY FOODIES</div>
                </motion.div>
              </div>
            </Reveal>

            {/* Right — about + features */}
            <div>
              <Reveal>
                <div className="flex items-center gap-3 mb-6">
                  <div style={{ width: 40, height: 1, background: '#D85A30' }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D85A30' }}>Our Story</span>
                </div>
                <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 800, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
                  Dishcovery — Your Global Kitchen
                </h2>
                <p style={{ color: '#aaa', lineHeight: 1.8, marginBottom: 32 }}>
                  We believe great food should be accessible to everyone. Dishcovery brings you thousands of recipes
                  from 25+ world cuisines — all free, ad-free, and beautifully organised. Whether you're craving
                  Indian biryani or Japanese ramen, we've got you covered.
                </p>
              </Reveal>

              <div className="grid grid-cols-2 gap-4">
                {FEATURES.map((f, i) => (
                  <Reveal key={f.title} delay={i * 0.1}>
                    <motion.div whileHover={{ y: -4 }}
                      className="p-4 rounded-2xl border"
                      style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                      <div className="text-2xl mb-2">{f.icon}</div>
                      <h4 className="font-semibold text-sm mb-1" style={{ color: 'white' }}>{f.title}</h4>
                      <p style={{ color: '#888', fontSize: 12, lineHeight: 1.6 }}>{f.desc}</p>
                    </motion.div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section id="about" style={{ background: '#FDF8F3', padding: '96px 24px' }}>
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="inline-block text-5xl mb-4">🍽</div>
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, color: '#1a1a1a', marginBottom: 16 }}>
              Ready to Start Cooking?
            </h2>
            <p style={{ color: '#888', fontSize: 18, marginBottom: 40, lineHeight: 1.7 }}>
              Join thousands of food lovers on Dishcovery — completely free, forever.
              Search any dish, save your favourites, discover new cuisines.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/signup"
                className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-2xl text-white transition-all active:scale-95 shadow-xl"
                style={{ background: '#D85A30', fontSize: 16, boxShadow: '0 12px 32px rgba(216,90,48,0.35)' }}>
                Create Free Account <FiArrowRight size={18} />
              </Link>
              <Link to="/login"
                className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-2xl transition-all border-2 active:scale-95"
                style={{ borderColor: '#e5e7eb', color: '#444', fontSize: 16 }}>
                Sign In
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{ background: '#111', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽</span>
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: 'white', fontSize: 18 }}>
              Dish<span style={{ color: '#D85A30' }}>covery</span>
            </span>
          </div>
          <p style={{ color: '#555', fontSize: 13 }}>Powered by MealDB + Spoonacular · Built with React + Firebase</p>
          <div className="flex gap-4">
            <Link to="/login" style={{ color: '#555', fontSize: 13 }} className="hover:text-gray-400 transition-colors">Sign in</Link>
            <Link to="/signup" style={{ color: '#555', fontSize: 13 }} className="hover:text-gray-400 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
