import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import { auth, db } from '../firebase'
import { FiHome, FiHeart, FiLogOut, FiMenu, FiX, FiChevronDown } from 'react-icons/fi'
import toast from 'react-hot-toast'

function getInitials(user) {
  const name = user?.displayName || user?.email || ''
  return name.slice(0, 2).toUpperCase() || 'DC'
}

function getAvatarColor(user) {
  const colors = [
    ['#D85A30', '#fff3ee'],
    ['#7c3aed', '#f3f0ff'],
    ['#0891b2', '#ecfeff'],
    ['#059669', '#ecfdf5'],
    ['#d97706', '#fffbeb'],
  ]
  const seed = (user?.email || 'x').charCodeAt(0) % colors.length
  return colors[seed]
}

export default function Navbar({ user }) {
  const [favCount, setFavCount]   = useState(0)
  const [mobileOpen, setMobile]   = useState(false)
  const [profileOpen, setProfile] = useState(false)
  const profileRef = useRef(null)
  const navigate   = useNavigate()
  const location   = useLocation()

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'favorites'), where('uid', '==', user.uid))
    const unsub = onSnapshot(q, (snap) => setFavCount(snap.size))
    return unsub
  }, [user])

  useEffect(() => {
    const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfile(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    toast.success('Signed out')
    navigate('/login')
    setMobile(false)
    setProfile(false)
  }

  const isActive = (path) => location.pathname === path
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'You'
  const initials = getInitials(user)
  const [bg, fg] = getAvatarColor(user)

  const Avatar = ({ size = 32, fontSize = 12 }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize, flexShrink: 0, border: `2px solid ${fg}22`,
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {initials}
    </div>
  )

  return (
    <>
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

          <Link to="/home" className="flex items-center gap-2">
            <motion.span whileHover={{ rotate: [-5, 5, -3, 0] }} transition={{ duration: 0.4 }}>
              <span className="text-2xl">🍽</span>
            </motion.span>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>
              Dish<span style={{ color: '#D85A30' }}>covery</span>
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-1.5">
            <Link to="/home"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/home') ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={isActive('/home') ? { background: '#D85A30' } : {}}>
              <FiHome size={15} /> Home
            </Link>

            <Link to="/favorites"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all relative ${
                isActive('/favorites') ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={isActive('/favorites') ? { background: '#D85A30' } : {}}>
              <FiHeart size={15} /> Favorites
              <AnimatePresence>
                {favCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-4 h-4 text-xs flex items-center justify-center rounded-full font-bold"
                    style={{ background: isActive('/favorites') ? 'white' : '#D85A30', color: isActive('/favorites') ? '#D85A30' : 'white', fontSize: 10 }}>
                    {favCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Profile */}
            <div ref={profileRef} className="relative ml-1">
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => setProfile(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-all border border-gray-200">
                <Avatar size={28} fontSize={11} />
                <span className="hidden md:block text-xs font-semibold text-gray-700 max-w-[90px] truncate">{displayName}</span>
                <FiChevronDown size={13} className={`text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: [0.22,1,0.36,1] }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="px-4 py-3.5 border-b border-gray-50">
                      <div className="flex items-center gap-3">
                        <Avatar size={40} fontSize={14} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2.5 flex items-center gap-2 text-sm text-gray-600">
                      <FiHeart size={13} style={{ color: '#D85A30' }} />
                      <span>{favCount} saved meal{favCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ borderTop: '1px solid #f9fafb' }} />
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <FiLogOut size={13} /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button className="sm:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            onClick={() => setMobile(!mobileOpen)}>
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-lg sm:hidden">
            <div className="px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl mb-1">
                <Avatar size={36} fontSize={13} />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{displayName}</p>
                  <p className="text-xs text-gray-400">{favCount} saved meals</p>
                </div>
              </div>
              <Link to="/home" onClick={() => setMobile(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${isActive('/home') ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                style={isActive('/home') ? { background: '#D85A30' } : {}}>
                <FiHome size={15} /> Home
              </Link>
              <Link to="/favorites" onClick={() => setMobile(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${isActive('/favorites') ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                style={isActive('/favorites') ? { background: '#D85A30' } : {}}>
                <FiHeart size={15} /> Favorites {favCount > 0 && `(${favCount})`}
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
                <FiLogOut size={15} /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
