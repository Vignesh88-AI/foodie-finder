import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import { FiArrowRight, FiStar, FiHeart, FiSearch, FiZap, FiGlobe } from 'react-icons/fi'

// ── High quality food images (Unsplash) ─────────────────────────────────────
const HERO_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1400&q=90',
    dish: 'Chicken Biryani', tag: '🇮🇳 Indian'
  },
  {
    img: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=1400&q=90',
    dish: 'Spaghetti Carbonara', tag: '🇮🇹 Italian'
  },
  {
    img: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=1400&q=90',
    dish: 'Butter Chicken', tag: '🇮🇳 Indian'
  },
  {
    img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=1400&q=90',
    dish: 'Sushi Platter', tag: '🇯🇵 Japanese'
  },
]

const GRID_PHOTOS = [
  { img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=85', label: 'Biryani' },
  { img: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&q=85', label: 'Ramen' },
  { img: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=600&q=85', label: 'Tacos' },
  { img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=85', label: 'Salad' },
  { img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=85', label: 'Pizza' },
  { img: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=85', label: 'Pancakes' },
]

const CUISINES = [
  { flag: '🇮🇳', name: 'Indian',   n: '30+', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80' },
  { flag: '🇮🇹', name: 'Italian',  n: '25+', img: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=500&q=80' },
  { flag: '🇯🇵', name: 'Japanese', n: '20+', img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=500&q=80' },
  { flag: '🇲🇽', name: 'Mexican',  n: '18+', img: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=500&q=80' },
  { flag: '🇨🇳', name: 'Chinese',  n: '22+', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&q=80' },
  { flag: '🇹🇭', name: 'Thai',     n: '15+', img: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&q=80' },
]

const FEATURES = [
  { icon: <FiSearch size={20}/>, title: 'Smart search',     desc: 'Search anything — biryani, tacos, ramen. Powered by 2 APIs.',    bg: '#FFF3EE', color: '#D85A30' },
  { icon: <FiGlobe  size={20}/>, title: '25+ cuisines',     desc: 'Indian, Italian, Chinese, Mexican, Japanese and more.',           bg: '#EEF2FF', color: '#4f46e5' },
  { icon: <FiHeart  size={20}/>, title: 'Personal cookbook',desc: 'Save favourites — synced across all your devices instantly.',     bg: '#FFF0F3', color: '#e11d48' },
  { icon: <FiZap    size={20}/>, title: 'Veg & Non-Veg',    desc: 'Every dish tagged at a glance. Filter by diet type instantly.',   bg: '#F0FDF4', color: '#16a34a' },
]

const MARQUEE = [
  'Chicken Biryani','Butter Chicken','Pad Thai','Sushi','Beef Tacos',
  'Dal Makhani','Carbonara','Ramen','Gulab Jamun','Shawarma',
  'Palak Paneer','Tiramisu','Kung Pao','Croissants','Jerk Chicken',
]

const SERIF = "'Playfair Display', Georgia, serif"
const SANS  = "'DM Sans', system-ui, sans-serif"
const CREAM = '#FDF8F0'
const DARK  = '#1C1917'
const ORANGE= '#D85A30'

function Reveal({ children, delay = 0, className = '', y = 32 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

export default function Landing() {
  const [slide, setSlide] = useState(0)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY  = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const heroOp = useTransform(scrollYProgress, [0, 0.85], [1, 0])

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const cur = HERO_SLIDES[slide]

  return (
    <div style={{ fontFamily: SANS, background: CREAM, color: DARK, overflowX: 'hidden' }}>

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(253,248,240,0.88)', backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(28,25,23,0.08)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.span animate={{ rotate: [0,-12,12,-6,0] }} transition={{ duration: 1.5, delay: 1 }}>
              <span style={{ fontSize: 24 }}>🍽</span>
            </motion.span>
            <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: DARK }}>
              Dish<span style={{ color: ORANGE }}>covery</span>
            </span>
          </div>

          {/* Nav links */}
          <nav style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 500, color: '#78716c' }} className="hidden sm:flex">
            {['#cuisines','#features','#about'].map((h, i) => (
              <a key={h} href={h}
                style={{ textDecoration: 'none', color: '#78716c', transition: 'color .2s' }}
                onMouseEnter={e => e.target.style.color = DARK}
                onMouseLeave={e => e.target.style.color = '#78716c'}>
                {['Cuisines','Features','About'][i]}
              </a>
            ))}
          </nav>

          {/* Auth buttons */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to="/login" style={{
              fontSize: 14, fontWeight: 500, color: '#57534e',
              textDecoration: 'none', padding: '8px 16px', borderRadius: 12, transition: 'background .2s'
            }}
              onMouseEnter={e => e.target.style.background='rgba(0,0,0,0.05)'}
              onMouseLeave={e => e.target.style.background='transparent'}>
              Sign in
            </Link>
            <Link to="/signup" style={{
              fontSize: 14, fontWeight: 700, color: 'white',
              textDecoration: 'none', padding: '9px 20px', borderRadius: 14,
              background: ORANGE, transition: 'all .2s', boxShadow: '0 4px 14px rgba(216,90,48,0.3)'
            }}>
              Get started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section ref={heroRef} style={{ minHeight: '100vh', paddingTop: 64, position: 'relative', overflow: 'hidden' }}>

        {/* Slideshow background */}
        <motion.div style={{ y: heroY, position: 'absolute', inset: 0, zIndex: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div key={slide}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1 }}
              style={{ position: 'absolute', inset: 0 }}>
              <img src={cur.img} alt={cur.dish} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(253,248,240,0.97) 0%, rgba(253,248,240,0.88) 45%, rgba(253,248,240,0.22) 100%)' }} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div style={{ opacity: heroOp, position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '80px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="hero-grid">
          {/* Left */}
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
                padding: '6px 14px', borderRadius: 99, marginBottom: 24,
                background: 'rgba(216,90,48,0.1)', color: ORANGE, border: '1px solid rgba(216,90,48,0.2)'
              }}>
                <FiStar size={11} /> Award-Winning Recipes
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.22,1,0.36,1] }}
              style={{ fontFamily: SERIF, fontSize: 'clamp(44px,5.5vw,72px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 20, color: DARK }}>
              Experience<br />
              <span style={{ color: ORANGE }}>Culinary Art</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ fontSize: 17, lineHeight: 1.75, color: '#78716c', maxWidth: 420, marginBottom: 36 }}>
              Discover the finest flavours crafted from every corner of the world.
              Indian biryani, Italian pasta, Japanese sushi — find, save, and cook meals you'll love.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 40 }}>
              <Link to="/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontWeight: 700, fontSize: 15, padding: '13px 28px', borderRadius: 16,
                background: ORANGE, color: 'white', textDecoration: 'none',
                boxShadow: '0 8px 28px rgba(216,90,48,0.35)', transition: 'all .2s'
              }}>
                Start Exploring <FiArrowRight size={16} />
              </Link>
              <Link to="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontWeight: 700, fontSize: 15, padding: '13px 28px', borderRadius: 16,
                background: 'white', color: DARK, textDecoration: 'none',
                border: '2px solid rgba(28,25,23,0.1)', transition: 'all .2s'
              }}>
                Sign In
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
              style={{ display: 'flex', gap: 32, paddingTop: 24, borderTop: '1px solid rgba(28,25,23,0.08)' }}>
              {[['300+','Recipes'],['25+','Cuisines'],['100%','Free']].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: ORANGE }}>{v}</div>
                  <div style={{ fontSize: 12, color: '#a8a29e', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — La Maison style photo grid */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.8, ease: [0.22,1,0.36,1] }}
            className="hidden lg:grid"
            style={{ gridTemplateColumns: '1fr 1fr', gap: 12, position: 'relative' }}>
            {GRID_PHOTOS.slice(0, 4).map((p, i) => (
              <motion.div key={i} whileHover={{ scale: 1.03, y: -4 }}
                style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3', border: '3px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                <img src={p.img} alt={p.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </motion.div>
            ))}
            {/* Floating badge */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity }}
              style={{
                position: 'absolute', bottom: -16, left: -16,
                background: ORANGE, color: 'white', borderRadius: 16, padding: '12px 18px',
                boxShadow: '0 8px 28px rgba(216,90,48,0.4)', border: '3px solid white'
              }}>
              <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700 }}>15+</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', opacity: 0.85 }}>YEARS OF FLAVOUR</div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Slide dots */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 2 }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              style={{
                width: i === slide ? 28 : 8, height: 8, borderRadius: 4,
                background: i === slide ? ORANGE : 'rgba(0,0,0,0.2)',
                border: 'none', cursor: 'pointer', transition: 'all .3s', padding: 0,
              }} />
          ))}
        </div>
      </section>

      {/* ── DARK MARQUEE ─────────────────────────────────────────── */}
      <div style={{ background: DARK, padding: '14px 0', overflow: 'hidden' }}>
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex', gap: 32, width: 'max-content' }}>
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} style={{ fontSize: 13, fontWeight: 500, color: '#a8a29e', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: ORANGE, fontSize: 8 }}>✦</span> {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── MENU PREVIEW (La Maison style) ───────────────────────── */}
      <section style={{ padding: '96px 24px', background: CREAM }} id="menu">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal className="text-center" style={{ marginBottom: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 60, height: 1, background: 'rgba(216,90,48,0.3)' }} />
              <span style={{ fontSize: 20, color: ORANGE }}>📖</span>
              <div style={{ width: 60, height: 1, background: 'rgba(216,90,48,0.3)' }} />
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(32px,4vw,48px)', fontWeight: 800, color: DARK, marginBottom: 12 }}>
              Our Menu
            </h2>
            <p style={{ color: '#a8a29e', fontSize: 16 }}>Seasonal ingredients, timeless techniques, unforgettable flavours</p>
          </Reveal>

          {/* Menu items — La Maison style */}
          {[
            { title: 'Starters', items: [
              { name: 'Samosa Chaat', desc: 'Crispy pastry, spiced potato, tamarind, yoghurt', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=120&q=80' },
              { name: 'Bruschetta', desc: 'Tomato, basil, extra virgin olive oil, toasted bread', img: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=120&q=80' },
            ]},
            { title: 'Mains', items: [
              { name: 'Butter Chicken', desc: 'Creamy tomato sauce, aromatic spices, basmati rice', img: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=120&q=80' },
              { name: 'Spaghetti Carbonara', desc: 'Pancetta, Pecorino Romano, egg yolk, black pepper', img: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=120&q=80' },
            ]},
          ].map((section) => (
            <Reveal key={section.title}>
              <h3 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: ORANGE, textAlign: 'center', marginBottom: 20, letterSpacing: '0.04em' }}>
                {section.title}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 40 }}>
                {section.items.map((item) => (
                  <motion.div key={item.name} whileHover={{ y: -3 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'white', borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <img src={item.img} alt={item.name} style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 4 }}>{item.name}</div>
                      <div style={{ fontSize: 13, color: '#a8a29e', lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          ))}

          <Reveal className="text-center">
            <Link to="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 14,
              border: `2px solid ${DARK}`, color: DARK, textDecoration: 'none', transition: 'all .2s'
            }}>
              View Full Menu → <FiArrowRight size={14} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── CUISINES ─────────────────────────────────────────────── */}
      <section id="cuisines" style={{ padding: '96px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal className="text-center" style={{ marginBottom: 48 }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '5px 14px', borderRadius: 99, background: 'rgba(216,90,48,0.1)', color: ORANGE, marginBottom: 16 }}>
              World Cuisines
            </span>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 800, color: DARK, marginBottom: 12 }}>
              From Every Corner of the World
            </h2>
            <p style={{ color: '#a8a29e', fontSize: 16 }}>Including your favourite Indian dishes 🇮🇳</p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {CUISINES.map((c, i) => (
              <Reveal key={c.name} delay={i * 0.07}>
                <motion.div whileHover={{ y: -6, scale: 1.02 }}
                  style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '16/10', position: 'relative', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '3px solid white' }}>
                  <img src={c.img} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.06) 55%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 24 }}>{c.flag}</span>
                      <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: 'white' }}>{c.name}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(216,90,48,0.85)', color: 'white' }}>
                      {c.n} dishes
                    </span>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR STORY (La Maison style) ──────────────────────────── */}
      <section id="features" style={{ padding: '96px 24px', background: CREAM }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="story-grid">
          {/* Left — photo + quote card */}
          <Reveal>
            <div style={{ position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=90"
                alt="Chef"
                style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', borderRadius: 24, boxShadow: '0 16px 48px rgba(0,0,0,0.14)' }}
              />
              {/* Quote card overlay */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }}
                style={{
                  position: 'absolute', bottom: 24, right: -24,
                  background: 'white', borderRadius: 18, padding: '20px 24px',
                  maxWidth: 260, boxShadow: '0 12px 40px rgba(0,0,0,0.14)', border: '2px solid rgba(0,0,0,0.04)'
                }}>
                <div style={{ color: ORANGE, fontSize: 28, fontFamily: SERIF, lineHeight: 1, marginBottom: 8 }}>"</div>
                <p style={{ fontSize: 13, color: '#57534e', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 12 }}>
                  Cooking is about passion, creativity, and bringing people together through flavour.
                </p>
                <div style={{ fontSize: 12, fontWeight: 700, color: DARK }}>— Dishcovery Team</div>
              </motion.div>
            </div>
          </Reveal>

          {/* Right — text */}
          <div>
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 40, height: 1, background: ORANGE }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: ORANGE }}>Our Story</span>
              </div>
              <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 800, color: DARK, marginBottom: 20, lineHeight: 1.2 }}>
                Dishcovery — Your Global Kitchen
              </h2>
              <p style={{ fontSize: 15, color: '#78716c', lineHeight: 1.85, marginBottom: 16 }}>
                We believe great food should be accessible to everyone. Dishcovery brings you thousands of recipes
                from 25+ world cuisines — all free, ad-free, and beautifully organised.
              </p>
              <p style={{ fontSize: 15, color: '#78716c', lineHeight: 1.85, marginBottom: 36 }}>
                Whether you're craving Indian biryani or Japanese ramen, we have it.
                Every dish is tagged Veg or Non-Veg so you always know what you're cooking.
              </p>
            </Reveal>

            {/* Stats row */}
            <Reveal delay={0.1}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[['300+','Recipes'],['25+','Cuisines'],['50K+','Foodies']].map(([v,l]) => (
                  <div key={l} style={{ textAlign: 'center', padding: '16px 12px', borderRadius: 16, border: `1px solid rgba(216,90,48,0.15)`, background: 'white' }}>
                    <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: ORANGE }}>{v}</div>
                    <div style={{ fontSize: 12, color: '#a8a29e', marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────── */}
      <section id="about" style={{ padding: '96px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal className="text-center" style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 800, color: DARK, marginBottom: 12 }}>
              Everything you need to find great food
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.09}>
                <motion.div whileHover={{ y: -6 }}
                  style={{ background: 'white', borderRadius: 20, padding: '28px 24px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', height: '100%', transition: 'box-shadow .2s' }}
                  onHoverStart={e => e.target.style.boxShadow='0 16px 40px rgba(0,0,0,0.1)'}
                  onHoverEnd={e => e.target.style.boxShadow='0 2px 12px rgba(0,0,0,0.04)'}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    {f.icon}
                  </div>
                  <h4 style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: DARK, marginBottom: 10 }}>{f.title}</h4>
                  <p style={{ fontSize: 14, color: '#78716c', lineHeight: 1.7 }}>{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', background: DARK, position: 'relative', overflow: 'hidden' }}>
        <motion.div animate={{ scale: [1,1.15,1], opacity: [0.1,0.18,0.1] }} transition={{ duration: 10, repeat: Infinity }}
          style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, background: ORANGE, borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <Reveal className="text-center" style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🍽</div>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, color: 'white', marginBottom: 16 }}>
            Ready to Start Cooking?
          </h2>
          <p style={{ fontSize: 17, color: '#a8a29e', marginBottom: 40, lineHeight: 1.7 }}>
            Join Dishcovery — completely free, forever. Search any dish, save favourites, discover new cuisines.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontWeight: 700, fontSize: 15, padding: '14px 32px', borderRadius: 16,
              background: ORANGE, color: 'white', textDecoration: 'none',
              boxShadow: '0 8px 28px rgba(216,90,48,0.4)'
            }}>
              Create Free Account <FiArrowRight size={16} />
            </Link>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontWeight: 700, fontSize: 15, padding: '14px 32px', borderRadius: 16,
              background: 'rgba(255,255,255,0.08)', color: 'white', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.12)'
            }}>
              Sign In
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{ background: '#111', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🍽</span>
            <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: 'white' }}>
              Dish<span style={{ color: ORANGE }}>covery</span>
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#57534e' }}>Powered by MealDB + Spoonacular · Built with React + Firebase</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['/login','/signup'].map((p, i) => (
              <Link key={p} to={p} style={{ fontSize: 13, color: '#57534e', textDecoration: 'none' }}>
                {['Sign in','Sign up'][i]}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .story-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
