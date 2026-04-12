import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { FiArrowRight, FiSearch, FiHeart, FiStar, FiZap, FiMapPin } from 'react-icons/fi'

// Real meals shown as preview cards
const PREVIEW_MEALS = [
  { name: 'Chicken Biryani',     area: 'Indian',   veg: false, img: 'https://www.themealdb.com/images/media/meals/obgssl1511423078.jpg' },
  { name: 'Baingan Bharta',      area: 'Indian',   veg: true,  img: 'https://www.themealdb.com/images/media/meals/ussyxp1487323534.jpg' },
  { name: 'Spaghetti Carbonara', area: 'Italian',  veg: false, img: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg' },
  { name: 'Pad Thai',            area: 'Thai',     veg: false, img: 'https://www.themealdb.com/images/media/meals/uuuspp1511297945.jpg' },
  { name: 'Sushi',               area: 'Japanese', veg: false, img: 'https://www.themealdb.com/images/media/meals/g046bb1663960946.jpg' },
  { name: 'Dal Makhani',         area: 'Indian',   veg: true,  img: 'https://www.themealdb.com/images/media/meals/wuxrtu1483564410.jpg' },
  { name: 'Beef Tacos',          area: 'Mexican',  veg: false, img: 'https://www.themealdb.com/images/media/meals/ypxvwv1505333929.jpg' },
  { name: 'Kung Pao Chicken',    area: 'Chinese',  veg: false, img: 'https://www.themealdb.com/images/media/meals/1529446352.jpg' },
]

const CUISINES = [
  { flag: '🇮🇳', name: 'Indian',   img: 'https://www.themealdb.com/images/media/meals/obgssl1511423078.jpg' },
  { flag: '🇮🇹', name: 'Italian',  img: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg' },
  { flag: '🇯🇵', name: 'Japanese', img: 'https://www.themealdb.com/images/media/meals/g046bb1663960946.jpg' },
  { flag: '🇲🇽', name: 'Mexican',  img: 'https://www.themealdb.com/images/media/meals/ypxvwv1505333929.jpg' },
  { flag: '🇨🇳', name: 'Chinese',  img: 'https://www.themealdb.com/images/media/meals/1529446352.jpg' },
  { flag: '🇹🇭', name: 'Thai',     img: 'https://www.themealdb.com/images/media/meals/uuuspp1511297945.jpg' },
]

const HOW = [
  { icon: <FiSearch size={22}/>, n: '01', title: 'Search any dish',        desc: 'Type biryani, ramen, pasta — get instant results from 300+ global recipes.' },
  { icon: <FiZap    size={22}/>, n: '02', title: 'Filter & explore',        desc: '25+ cuisines. Veg & Non-Veg tags on every single dish.' },
  { icon: <FiHeart  size={22}/>, n: '03', title: 'Save your favourites',    desc: 'Heart any recipe. Your personal cookbook syncs to the cloud.' },
]

const MARQUEE = [
  '🇮🇳 Chicken Biryani','🇮🇹 Carbonara','🇯🇵 Sushi','🇲🇽 Tacos',
  '🇨🇳 Kung Pao','🇹🇭 Pad Thai','🇮🇳 Dal Makhani','🇫🇷 Croissants',
  '🇬🇧 Fish & Chips','🇺🇸 BBQ Ribs','🇬🇷 Moussaka','🇪🇸 Paella',
]

const SERIF  = "'Playfair Display', Georgia, serif"
const SANS   = "'DM Sans', system-ui, sans-serif"
const ORANGE = '#D85A30'
const DARK   = '#1a1208'
const CREAM  = '#FDF8F0'

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

function VegTag({ veg }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
      background: veg ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
      color: veg ? '#15803d' : '#b91c1c',
      border: `1px solid ${veg ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'}`,
      backdropFilter: 'blur(6px)',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: veg ? '#16a34a' : '#dc2626', display: 'inline-block' }} />
      {veg ? 'Veg' : 'Non-Veg'}
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [searchVal, setSearchVal] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    // Redirect to signup — user needs to be logged in to search
    navigate('/signup')
  }

  return (
    <div style={{ fontFamily: SANS, background: CREAM, color: DARK, overflowX: 'hidden' }}>

      {/* ── STICKY NAV ──────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(253,248,240,0.92)', backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(26,18,8,0.07)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.span animate={{ rotate: [0,-10,10,-5,0] }} transition={{ duration: 1.4, delay: 1 }}>
              <span style={{ fontSize: 26 }}>🍽</span>
            </motion.span>
            <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 800, color: DARK }}>
              Dish<span style={{ color: ORANGE }}>covery</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link to="/login" style={{ fontSize: 14, fontWeight: 600, color: '#78716c', textDecoration: 'none', padding: '8px 18px', borderRadius: 12 }}>
              Sign in
            </Link>
            <Link to="/signup" style={{
              fontSize: 14, fontWeight: 700, color: 'white', textDecoration: 'none',
              padding: '9px 20px', borderRadius: 14, background: ORANGE,
              boxShadow: '0 4px 14px rgba(216,90,48,0.32)',
            }}>
              Get started free
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO — dark dramatic like Food Finder ───────────────── */}
      <section style={{
        paddingTop: 64, minHeight: '100vh', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #1a0f00 0%, #2d1500 40%, #1a0800 100%)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Animated food icons floating in background */}
        {['🍛','🍕','🍜','🌮','🍣','🥘','🍝','🧆','🥗','🍱'].map((emoji, i) => (
          <motion.div key={i}
            animate={{
              y: [0, -20, 0],
              rotate: [0, i % 2 === 0 ? 10 : -10, 0],
              opacity: [0.12, 0.22, 0.12],
            }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.35 }}
            style={{
              position: 'absolute', fontSize: 'clamp(32px,4vw,56px)',
              left: `${8 + (i * 9.2) % 88}%`,
              top: `${10 + (i * 13) % 70}%`,
              pointerEvents: 'none', userSelect: 'none',
              filter: 'blur(0.5px)',
            }}
          >
            {emoji}
          </motion.div>
        ))}

        {/* Hero content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px 40px', position: 'relative', zIndex: 1 }}>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em',
              padding: '5px 14px', borderRadius: 99, marginBottom: 28,
              background: 'rgba(216,90,48,0.18)', color: '#FF9A70',
              border: '1px solid rgba(216,90,48,0.3)',
            }}>
              <FiStar size={11} /> 300+ recipes · 25+ cuisines · 100% free
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22,1,0.36,1] }}
            style={{
              fontFamily: SERIF, fontWeight: 800, color: 'white', textAlign: 'center',
              fontSize: 'clamp(40px,7vw,80px)', lineHeight: 1.08, marginBottom: 20,
            }}
          >
            Yummy<br />
            <span style={{ color: ORANGE }}>Fresh Food</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ fontSize: 17, color: 'rgba(255,255,255,0.62)', lineHeight: 1.7, maxWidth: 480, textAlign: 'center', marginBottom: 44 }}>
            Search thousands of recipes from Indian biryani to Italian pasta.
            Every dish tagged Veg or Non-Veg. Save your favourites forever.
          </motion.p>

          {/* Search bar — inspired by Food Finder's dual search */}
          <motion.form
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSearch}
            style={{
              display: 'flex', gap: 0, width: '100%', maxWidth: 620,
              background: 'rgba(255,255,255,0.06)', borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 18px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
              <FiSearch size={18} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
              <input
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search for a recipe…"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: 'white', fontSize: 15, padding: '16px 12px',
                  fontFamily: SANS,
                }}
              />
            </div>
            <button type="submit" style={{
              background: ORANGE, border: 'none', cursor: 'pointer',
              padding: '0 28px', color: 'white', fontWeight: 700, fontSize: 15,
              fontFamily: SANS, transition: 'background .2s', whiteSpace: 'nowrap',
            }}>
              Search
            </button>
          </motion.form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            Sign in to search · Free forever · No ads
          </motion.p>
        </div>

        {/* Bottom wave into next section */}
        <div style={{ position: 'relative', height: 60, overflow: 'hidden' }}>
          <svg viewBox="0 0 1440 60" style={{ position: 'absolute', bottom: 0, width: '100%' }} preserveAspectRatio="none">
            <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 L0,60 Z" fill={CREAM} />
          </svg>
        </div>
      </section>

      {/* ── SCROLLING MARQUEE ───────────────────────────────────── */}
      <div style={{ background: ORANGE, padding: '11px 0', overflow: 'hidden' }}>
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex', gap: 40, width: 'max-content' }}>
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} style={{ fontSize: 13, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 12, letterSpacing: '0.02em' }}>
              <span style={{ opacity: 0.6, fontSize: 8 }}>✦</span> {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── MEAL CARD PREVIEW ───────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: CREAM }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: ORANGE, marginBottom: 10 }}>What's inside</p>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: DARK }}>
              Discover thousands of real recipes
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
            {PREVIEW_MEALS.map((meal, i) => (
              <motion.div key={meal.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.55, ease: [0.22,1,0.36,1] }}
                whileHover={{ y: -6 }}
                style={{ background: 'white', borderRadius: 20, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}
                onClick={() => navigate('/signup')}
              >
                <div style={{ position: 'relative', height: 170 }}>
                  <img src={meal.img} alt={meal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => e.target.src='https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg'} />
                  <div style={{ position: 'absolute', top: 10, left: 10 }}>
                    <VegTag veg={meal.veg} />
                  </div>
                  <div style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiHeart size={13} color="#9ca3af" />
                  </div>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 50%)' }} />
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: DARK, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meal.name}</div>
                  <div style={{ fontSize: 11, color: '#a8a29e' }}>{meal.area} cuisine</div>
                </div>
              </motion.div>
            ))}
          </div>

          <Reveal style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 14,
              background: ORANGE, color: 'white', textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(216,90,48,0.3)',
            }}>
              See all recipes <FiArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: ORANGE, marginBottom: 10 }}>Simple as 1-2-3</p>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px,4vw,42px)', fontWeight: 800, color: DARK }}>
              How Dishcovery works
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
            {HOW.map((h, i) => (
              <Reveal key={h.n} delay={i * 0.12}>
                <motion.div whileHover={{ y: -5 }}
                  style={{ background: CREAM, borderRadius: 24, padding: '32px 28px', border: '1px solid rgba(26,18,8,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(216,90,48,0.1)', color: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {h.icon}
                    </div>
                    <span style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 800, color: 'rgba(216,90,48,0.13)' }}>{h.n}</span>
                  </div>
                  <h3 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: DARK, marginBottom: 10 }}>{h.title}</h3>
                  <p style={{ fontSize: 14, color: '#78716c', lineHeight: 1.75 }}>{h.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CUISINE GRID ─────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: CREAM }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px,4vw,42px)', fontWeight: 800, color: DARK, marginBottom: 8 }}>
              Explore by cuisine
            </h2>
            <p style={{ fontSize: 15, color: '#a8a29e' }}>Including all your favourite Indian dishes 🇮🇳</p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
            {CUISINES.map((c, i) => (
              <Reveal key={c.name} delay={i * 0.07}>
                <motion.div whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => navigate('/signup')}
                  style={{ borderRadius: 18, overflow: 'hidden', aspectRatio: '16/10', position: 'relative', cursor: 'pointer', boxShadow: '0 4px 18px rgba(0,0,0,0.09)' }}>
                  <img src={c.img} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.04) 55%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 24 }}>{c.flag}</span>
                    <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: 'white' }}>{c.name}</span>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding: '90px 24px', background: 'linear-gradient(135deg, #1a0f00 0%, #2d1800 100%)', position: 'relative', overflow: 'hidden' }}>
        <motion.div animate={{ scale:[1,1.2,1], opacity:[0.08,0.16,0.08] }} transition={{ duration:10, repeat:Infinity }}
          style={{ position:'absolute', top:-80, right:-80, width:400, height:400, background:ORANGE, borderRadius:'50%', filter:'blur(80px)', pointerEvents:'none' }} />
        <Reveal style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🍽</div>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: 'white', marginBottom: 14 }}>
            Ready to find your<br />next favourite meal?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 36, lineHeight: 1.7 }}>
            Free forever. No ads. Just great food from every cuisine.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontWeight: 700, fontSize: 15, padding: '14px 32px', borderRadius: 14,
              background: ORANGE, color: 'white', textDecoration: 'none',
              boxShadow: '0 8px 28px rgba(216,90,48,0.4)',
            }}>
              Create free account <FiArrowRight size={16} />
            </Link>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontWeight: 700, fontSize: 15, padding: '14px 24px', borderRadius: 14,
              background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)',
              textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)',
            }}>
              Sign in
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{ background: '#0f0800', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🍽</span>
            <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 800, color: 'white' }}>
              Dish<span style={{ color: ORANGE }}>covery</span>
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#57534e' }}>Powered by MealDB · Built with React + Firebase</p>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/login"  style={{ fontSize: 13, color: '#57534e', textDecoration: 'none' }}>Sign in</Link>
            <Link to="/signup" style={{ fontSize: 13, color: '#57534e', textDecoration: 'none' }}>Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
