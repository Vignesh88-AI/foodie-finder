import { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { FiArrowRight, FiSearch, FiHeart, FiStar, FiZap, FiCheck } from 'react-icons/fi'

// ── Unique, verified MealDB image per dish ──────────────────────────────────
const PREVIEW_MEALS = [
  { name: 'Chicken Biryani',     area: 'Indian',   veg: false, img: 'https://www.themealdb.com/images/media/meals/obgssl1511423078.jpg' },
  { name: 'Dal Makhani',         area: 'Indian',   veg: true,  img: 'https://www.themealdb.com/images/media/meals/wuxrtu1483564410.jpg' },
  { name: 'Spaghetti Carbonara', area: 'Italian',  veg: false, img: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg' },
  { name: 'Sushi',               area: 'Japanese', veg: false, img: 'https://www.themealdb.com/images/media/meals/g046bb1663960946.jpg' },
  { name: 'Beef Tacos',          area: 'Mexican',  veg: false, img: 'https://www.themealdb.com/images/media/meals/ypxvwv1505333929.jpg' },
  { name: 'Kung Pao Chicken',    area: 'Chinese',  veg: false, img: 'https://www.themealdb.com/images/media/meals/1529446352.jpg' },
  { name: 'Pad Thai',            area: 'Thai',     veg: false, img: 'https://www.themealdb.com/images/media/meals/uuuspp1511297945.jpg' },
  { name: 'Baingan Bharta',      area: 'Indian',   veg: true,  img: 'https://www.themealdb.com/images/media/meals/ussyxp1487323534.jpg' },
]

// ── UNIQUE image per cuisine — each is a different MealDB dish ──────────────
const CUISINES = [
  { flag: '🇮🇳', name: 'Indian',   img: 'https://www.themealdb.com/images/media/meals/wuxrtu1483564410.jpg',   bg: '#FF6B35' },
  { flag: '🇮🇹', name: 'Italian',  img: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg',   bg: '#2E8B57' },
  { flag: '🇯🇵', name: 'Japanese', img: 'https://www.themealdb.com/images/media/meals/g046bb1663960946.jpg',   bg: '#DC143C' },
  { flag: '🇲🇽', name: 'Mexican',  img: 'https://www.themealdb.com/images/media/meals/ypxvwv1505333929.jpg',   bg: '#DAA520' },
  { flag: '🇨🇳', name: 'Chinese',  img: 'https://www.themealdb.com/images/media/meals/1529446352.jpg',          bg: '#8B0000' },
  { flag: '🇹🇭', name: 'Thai',     img: 'https://www.themealdb.com/images/media/meals/uuuspp1511297945.jpg',   bg: '#4169E1' },
  { flag: '🇬🇧', name: 'British',  img: 'https://www.themealdb.com/images/media/meals/sywwoj1511461902.jpg',   bg: '#1C1C6E' },
  { flag: '🇫🇷', name: 'French',   img: 'https://www.themealdb.com/images/media/meals/ssrysq1511558465.jpg',   bg: '#00356B' },
]

const FEATURES = [
  { icon: '🔍', title: 'Search any dish',    desc: 'Biryani, pasta, ramen — instant results from 300+ global recipes.' },
  { icon: '🌍', title: 'Filter by cuisine',  desc: 'Indian, Italian, Chinese, Japanese and 20+ more world cuisines.' },
  { icon: '🥗', title: 'Veg & Non-Veg tags', desc: 'Every meal tagged so you always know what you\'re cooking.' },
  { icon: '❤️', title: 'Save favourites',    desc: 'Heart any recipe. Your cookbook syncs across all devices.' },
  { icon: '📍', title: 'Find nearby places', desc: 'Discover restaurants, cafés and bakeries near your location.' },
  { icon: '👨‍🍳', title: 'AI cooking guide',  desc: 'Ask Chef Dish for recipes, tips or help when you\'re stuck.' },
]

const MARQUEE = [
  '🇮🇳 Chicken Biryani', '🇮🇹 Spaghetti Carbonara', '🇯🇵 Sushi',
  '🇲🇽 Beef Tacos', '🇨🇳 Kung Pao Chicken', '🇹🇭 Pad Thai',
  '🇮🇳 Dal Makhani', '🇫🇷 Croissants', '🇬🇧 Fish & Chips',
  '🇺🇸 BBQ Ribs', '🇬🇷 Moussaka', '🇪🇸 Paella', '🇮🇳 Palak Paneer',
]

// ── Color system ─────────────────────────────────────────────────────────────
const C = {
  primary:  '#E85D2C',   // warm orange-red
  dark:     '#1A0F00',   // deep warm black
  cream:    '#FDF7F0',   // warm cream
  accent:   '#FF8C42',   // bright orange accent
  muted:    '#78716c',
  light:    '#FFF3EE',
}
const SERIF = "'Playfair Display', Georgia, serif"
const SANS  = "'DM Sans', system-ui, sans-serif"

// ── Animation helpers ─────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 30, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

function StaggerReveal({ children, staggerDelay = 0.09 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref}
      variants={{ show: { transition: { staggerChildren: staggerDelay } } }}
      initial="hidden" animate={inView ? 'show' : 'hidden'}>
      {children}
    </motion.div>
  )
}

const itemVariant = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22,1,0.36,1] } }
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate  = useNavigate()
  const heroRef   = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY  = useTransform(scrollYProgress, [0,1], ['0%','20%'])
  const heroOp = useTransform(scrollYProgress, [0,0.8], [1, 0])

  return (
    <div style={{ fontFamily: SANS, background: C.cream, color: C.dark, overflowX: 'hidden' }}>

      {/* ── STICKY NAV ──────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(253,247,240,0.92)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(26,15,0,0.07)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.span animate={{ rotate: [0,-10,10,-5,0] }} transition={{ duration: 1.5, delay: 1.2 }}>
              <span style={{ fontSize: 26 }}>🍽</span>
            </motion.span>
            <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 800, color: C.dark }}>
              Dish<span style={{ color: C.primary }}>covery</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link to="/login" style={{ fontSize: 14, fontWeight: 500, color: C.muted, textDecoration: 'none', padding: '8px 18px', borderRadius: 12 }}>
              Sign in
            </Link>
            <Link to="/signup" style={{
              fontSize: 14, fontWeight: 700, color: 'white', textDecoration: 'none',
              padding: '10px 22px', borderRadius: 14, background: C.primary,
              boxShadow: '0 4px 16px rgba(232,93,44,0.35)',
            }}>
              Get started free
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section ref={heroRef} style={{
        minHeight: '100vh', paddingTop: 64, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(155deg, ${C.dark} 0%, #2d1200 55%, #1a0a00 100%)`,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Animated floating food emojis */}
        {['🍛','🍕','🍜','🌮','🍣','🥘','🍝','🧆','🥗','🍱','🍔','🥙'].map((emoji, i) => (
          <motion.div key={i}
            animate={{ y: [0, -18, 0], rotate: [0, i%2===0 ? 8 : -8, 0], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 3.5 + i*0.4, repeat: Infinity, delay: i*0.3 }}
            style={{
              position: 'absolute', fontSize: 'clamp(28px,3.5vw,52px)',
              left: `${7 + (i*8.1)%86}%`, top: `${12 + (i*11)%68}%`,
              pointerEvents: 'none', userSelect: 'none', filter: 'blur(0.5px)',
            }}>
            {emoji}
          </motion.div>
        ))}

        {/* Hero content */}
        <motion.div style={{ y: heroY, opacity: heroOp, flex: 1 }}>
          <div style={{ maxWidth: 780, margin: '0 auto', padding: '72px 24px 48px', textAlign: 'center', position: 'relative', zIndex: 1 }}>

            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em',
                padding: '6px 16px', borderRadius: 99, marginBottom: 28,
                background: 'rgba(232,93,44,0.18)', color: C.accent,
                border: '1px solid rgba(232,93,44,0.3)',
              }}>
                <FiStar size={11} /> 300+ recipes · 25+ cuisines · completely free
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.22, duration:0.75, ease:[0.22,1,0.36,1] }}
              style={{
                fontFamily: SERIF, fontWeight: 800, color: 'white', textAlign: 'center',
                fontSize: 'clamp(42px,7vw,82px)', lineHeight: 1.07, marginBottom: 22,
              }}>
              Discover meals<br />
              <motion.span
                initial={{ backgroundSize:'0% 100%' }}
                animate={{ backgroundSize:'100% 100%' }}
                transition={{ delay:1, duration:0.8, ease:[0.22,1,0.36,1] }}
                style={{
                  background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text', backgroundRepeat: 'no-repeat',
                }}>
                from every cuisine
              </motion.span>
            </motion.h1>

            <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
              style={{ fontSize: 18, color: 'rgba(255,255,255,0.58)', lineHeight: 1.75, maxWidth: 480, margin: '0 auto 44px' }}>
              Search Indian biryani, Italian pasta, Japanese ramen and thousands more.
              Every dish tagged Veg or Non-Veg. Save favourites forever.
            </motion.p>

            {/* Search bar */}
            <motion.form
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45 }}
              onSubmit={e => { e.preventDefault(); navigate('/signup') }}
              style={{
                display: 'flex', maxWidth: 580, margin: '0 auto 20px',
                background: 'rgba(255,255,255,0.07)', borderRadius: 18,
                border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden',
                backdropFilter: 'blur(12px)',
              }}>
              <div style={{ flex:1, display:'flex', alignItems:'center', padding:'0 18px' }}>
                <FiSearch size={18} color="rgba(255,255,255,0.38)" style={{ flexShrink:0 }} />
                <input
                  placeholder="Search a dish… e.g. butter chicken"
                  readOnly onClick={() => navigate('/signup')}
                  style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:15, padding:'16px 12px', fontFamily:SANS, cursor:'pointer' }}
                />
              </div>
              <button type="submit" style={{ background: C.primary, border:'none', cursor:'pointer', padding:'0 28px', color:'white', fontWeight:700, fontSize:15, fontFamily:SANS, whiteSpace:'nowrap' }}>
                Search
              </button>
            </motion.form>

            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
              style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>
              Free forever · No credit card · No ads
            </motion.p>
          </div>

          {/* Preview meal cards in hero — scroll carousel */}
          <motion.div
            initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.55, duration:0.7, ease:[0.22,1,0.36,1] }}
            style={{ padding:'0 24px 60px', position:'relative', zIndex:1 }}>
            <div style={{
              display: 'flex', gap: 16, maxWidth: 1100, margin: '0 auto',
              overflowX: 'auto', paddingBottom: 8,
              scrollbarWidth: 'none', msOverflowStyle: 'none',
            }}>
              {PREVIEW_MEALS.map((meal, i) => (
                <motion.div key={meal.name}
                  initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: 0.6 + i*0.07 }}
                  whileHover={{ y:-6, scale:1.03 }}
                  onClick={() => navigate('/signup')}
                  style={{
                    flexShrink: 0, width: 160, borderRadius: 18, overflow:'hidden',
                    cursor:'pointer', border:'2px solid rgba(255,255,255,0.12)',
                    boxShadow:'0 8px 32px rgba(0,0,0,0.35)',
                    background: 'rgba(255,255,255,0.06)', backdropFilter:'blur(4px)',
                  }}>
                  <div style={{ position:'relative', height:120 }}>
                    <img src={meal.img} alt={meal.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                      onError={e => e.target.src = 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg'} />
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
                    <div style={{
                      position:'absolute', top:8, left:8,
                      background: meal.veg ? 'rgba(22,163,74,0.9)' : 'rgba(220,38,38,0.9)',
                      color:'white', padding:'2px 7px', borderRadius:99, fontSize:10, fontWeight:700,
                    }}>
                      {meal.veg ? '● Veg' : '● Non-Veg'}
                    </div>
                  </div>
                  <div style={{ padding:'10px 12px' }}>
                    <div style={{ fontWeight:700, fontSize:12, color:'white', lineHeight:1.3, marginBottom:2,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {meal.name}
                    </div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>{meal.area}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Wave */}
        <div style={{ position:'relative', height:60, overflow:'hidden', flexShrink:0 }}>
          <svg viewBox="0 0 1440 60" style={{ position:'absolute', bottom:0, width:'100%' }} preserveAspectRatio="none">
            <path d="M0,60 C480,0 960,60 1440,20 L1440,60 L0,60 Z" fill={C.cream} />
          </svg>
        </div>
      </section>

      {/* ── ORANGE MARQUEE ──────────────────────────────────── */}
      <div style={{ background: C.primary, padding:'11px 0', overflow:'hidden' }}>
        <motion.div animate={{ x:['0%','-50%'] }} transition={{ duration:32, repeat:Infinity, ease:'linear' }}
          style={{ display:'flex', gap:40, width:'max-content' }}>
          {[...MARQUEE,...MARQUEE].map((item,i) => (
            <span key={i} style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.9)', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ opacity:0.5, fontSize:7 }}>✦</span> {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section style={{ padding:'96px 24px', background: C.cream }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal style={{ textAlign:'center', marginBottom:56 }}>
            <span style={{ display:'inline-block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', padding:'5px 14px', borderRadius:99, background:C.light, color:C.primary, marginBottom:14 }}>
              How it works
            </span>
            <h2 style={{ fontFamily:SERIF, fontSize:'clamp(28px,4vw,46px)', fontWeight:800, color:C.dark }}>
              Three steps to your next great meal
            </h2>
          </Reveal>
          <StaggerReveal staggerDelay={0.12}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:20 }}>
              {[
                { icon:'🔍', n:'01', title:'Search any dish',      desc:'Type biryani, ramen, pasta — instant results from 300+ global recipes across 25+ cuisines.' },
                { icon:'🥗', n:'02', title:'Filter & discover',     desc:'Filter by cuisine or diet type. Veg and Non-Veg tags on every dish so you always know.' },
                { icon:'❤️', n:'03', title:'Save & cook',          desc:'Heart any recipe to save it forever. Your cookbook syncs across all devices, always free.' },
              ].map((h,i) => (
                <motion.div key={h.n} variants={itemVariant}
                  whileHover={{ y:-6, boxShadow:'0 20px 48px rgba(0,0,0,0.1)' }}
                  style={{ background:'white', borderRadius:24, padding:'32px 28px', border:'1px solid rgba(0,0,0,0.06)', transition:'box-shadow .2s' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
                    <div style={{ width:52, height:52, borderRadius:16, background:C.light, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{h.icon}</div>
                    <span style={{ fontFamily:SERIF, fontSize:40, fontWeight:800, color:'rgba(232,93,44,0.12)' }}>{h.n}</span>
                  </div>
                  <h3 style={{ fontFamily:SERIF, fontSize:20, fontWeight:700, color:C.dark, marginBottom:10 }}>{h.title}</h3>
                  <p style={{ fontSize:14, color:C.muted, lineHeight:1.75 }}>{h.desc}</p>
                </motion.div>
              ))}
            </div>
          </StaggerReveal>
        </div>
      </section>

      {/* ── CUISINE GRID ────────────────────────────────────── */}
      <section style={{ padding:'96px 24px', background:'white' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal style={{ textAlign:'center', marginBottom:48 }}>
            <h2 style={{ fontFamily:SERIF, fontSize:'clamp(28px,4vw,46px)', fontWeight:800, color:C.dark, marginBottom:10 }}>
              Explore by cuisine
            </h2>
            <p style={{ fontSize:16, color:C.muted }}>Including all your favourite Indian dishes 🇮🇳</p>
          </Reveal>
          <StaggerReveal staggerDelay={0.07}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:16 }}>
              {CUISINES.map((c) => (
                <motion.div key={c.name} variants={itemVariant}
                  whileHover={{ y:-7, scale:1.02 }}
                  onClick={() => navigate('/signup')}
                  style={{ borderRadius:20, overflow:'hidden', aspectRatio:'16/10', position:'relative', cursor:'pointer', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', background: c.bg }}>
                  <img
                    src={c.img} alt={c.name}
                    style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                    onError={e => { e.target.style.opacity='0' }}
                  />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.04) 55%)' }} />
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'14px 16px', display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:26 }}>{c.flag}</span>
                    <span style={{ fontFamily:SERIF, fontSize:18, fontWeight:700, color:'white' }}>{c.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </StaggerReveal>
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────────── */}
      <section style={{ padding:'96px 24px', background:C.cream }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal style={{ textAlign:'center', marginBottom:52 }}>
            <span style={{ display:'inline-block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', padding:'5px 14px', borderRadius:99, background:C.light, color:C.primary, marginBottom:14 }}>
              Everything included
            </span>
            <h2 style={{ fontFamily:SERIF, fontSize:'clamp(28px,4vw,46px)', fontWeight:800, color:C.dark }}>
              All this, completely free
            </h2>
          </Reveal>
          <StaggerReveal staggerDelay={0.08}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:16 }}>
              {FEATURES.map((f) => (
                <motion.div key={f.title} variants={itemVariant}
                  whileHover={{ y:-5 }}
                  style={{ background:'white', borderRadius:20, padding:'24px 24px', border:'1px solid rgba(0,0,0,0.06)', display:'flex', gap:16, alignItems:'flex-start' }}>
                  <div style={{ width:44, height:44, borderRadius:14, background:C.light, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{f.icon}</div>
                  <div>
                    <h4 style={{ fontWeight:700, fontSize:15, color:C.dark, marginBottom:6 }}>{f.title}</h4>
                    <p style={{ fontSize:13, color:C.muted, lineHeight:1.65 }}>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </StaggerReveal>
        </div>
      </section>

      {/* ── DARK CTA ─────────────────────────────────────────── */}
      <section style={{ padding:'96px 24px', background:C.dark, position:'relative', overflow:'hidden' }}>
        <motion.div animate={{ scale:[1,1.2,1], opacity:[0.08,0.16,0.08] }} transition={{ duration:10, repeat:Infinity }}
          style={{ position:'absolute', top:-100, right:-100, width:500, height:500, background:C.primary, borderRadius:'50%', filter:'blur(90px)', pointerEvents:'none' }} />
        <motion.div animate={{ scale:[1,1.1,1], opacity:[0.06,0.12,0.06] }} transition={{ duration:13, repeat:Infinity, delay:4 }}
          style={{ position:'absolute', bottom:-80, left:-80, width:400, height:400, background:C.accent, borderRadius:'50%', filter:'blur(90px)', pointerEvents:'none' }} />

        <Reveal style={{ maxWidth:600, margin:'0 auto', textAlign:'center', position:'relative' }}>
          <div style={{ fontSize:52, marginBottom:16 }}>🍽</div>
          <h2 style={{ fontFamily:SERIF, fontSize:'clamp(30px,4vw,52px)', fontWeight:800, color:'white', marginBottom:14 }}>
            Ready to find your next favourite meal?
          </h2>
          <p style={{ fontSize:17, color:'rgba(255,255,255,0.48)', marginBottom:40, lineHeight:1.7 }}>
            Free forever. No ads. No credit card. Just great food.
          </p>

          {/* Checklist */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'10px 24px', justifyContent:'center', marginBottom:40 }}>
            {['300+ recipes','25+ cuisines','Veg & Non-Veg tags','Nearby places','AI Chef guide'].map(item => (
              <div key={item} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'rgba(255,255,255,0.65)' }}>
                <FiCheck size={14} color={C.accent} /> {item}
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/signup" style={{
              display:'inline-flex', alignItems:'center', gap:8,
              fontWeight:700, fontSize:16, padding:'14px 36px', borderRadius:16,
              background:C.primary, color:'white', textDecoration:'none',
              boxShadow:'0 8px 32px rgba(232,93,44,0.4)',
            }}>
              Create free account <FiArrowRight size={17} />
            </Link>
            <Link to="/login" style={{
              display:'inline-flex', alignItems:'center', gap:8,
              fontWeight:700, fontSize:16, padding:'14px 28px', borderRadius:16,
              background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.8)',
              textDecoration:'none', border:'1px solid rgba(255,255,255,0.12)',
            }}>
              Sign in
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ background:'#0f0800', borderTop:'1px solid rgba(255,255,255,0.05)', padding:'28px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:20 }}>🍽</span>
            <span style={{ fontFamily:SERIF, fontSize:18, fontWeight:800, color:'white' }}>
              Dish<span style={{ color:C.primary }}>covery</span>
            </span>
          </div>
          <p style={{ fontSize:13, color:'#57534e' }}>Powered by MealDB · Built with React + Firebase</p>
          <div style={{ display:'flex', gap:20 }}>
            <Link to="/login"  style={{ fontSize:13, color:'#57534e', textDecoration:'none' }}>Sign in</Link>
            <Link to="/signup" style={{ fontSize:13, color:'#57534e', textDecoration:'none' }}>Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
