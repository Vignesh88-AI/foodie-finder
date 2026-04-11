import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import { auth, db } from '../firebase'
import { FiHome, FiHeart, FiLogOut, FiMenu, FiX, FiUser, FiChevronDown } from 'react-icons/fi'
import toast from 'react-hot-toast'

// Generate a consistent emoji avatar from email/name
function getAvatar(user) {
  const emojis = ['😋', '🧑‍🍳', '👩‍🍳', '🍴', '🥘', '🧆', '🥗', '🍜', '🍛', '🥙']
  const seed   = (user?.email || 'x').charCodeAt(0) % emojis.length
  return emojis[seed]
}

export default function Navbar({ user }) {
  const [favCount, setFavCount]     = useState(0)
  const [mobileOpen, setMobile]     = useState(false)
  const [profileOpen, setProfile]   = useState(false)
  const profileRef = useRef(null)
  const navigate   = useNavigate()
  const location   = useLocation()

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'favorites'), where('uid', '==', user.uid))
    const unsub = onSnapshot(q, (snap) => setFavCount(snap.size))
    return unsub
  }, [user])

  // Close profile dropdown on outside click
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
  const avatar = getAvatar(user)

  return (
    <>
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <motion.span whileHover={{ rotate: [-5, 5, -3, 0] }} transition={{ duration: 0.4 }}>
              <span className="text-2xl">🍽</span>
            </motion.span>
            <span className="font-display text-xl font-bold text-gray-900">
              Dish<span className="text-brand-500">covery</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-2">
            <Link to="/home"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/home') ? 'bg-brand-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <FiHome size={16} /> Home
            </Link>

            <Link to="/favorites"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
                isActive('/favorites') ? 'bg-brand-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <FiHeart size={16} /> Favorites
              <AnimatePresence>
                {favCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className={`absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center rounded-full font-bold ${
                      isActive('/favorites') ? 'bg-white text-brand-500' : 'bg-brand-500 text-white'
                    }`}>
                    {favCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Profile dropdown */}
            <div ref={profileRef} className="relative ml-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setProfile(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all border border-gray-200"
              >
                <span className="text-xl leading-none">{avatar}</span>
                <span className="hidden md:block max-w-[100px] truncate text-xs font-semibold text-gray-700">{displayName}</span>
                <FiChevronDown size={14} className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    {/* Profile header */}
                    <div className="px-4 py-3 border-b border-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{avatar}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Favorites count */}
                    <div className="px-4 py-2.5 flex items-center gap-2 text-sm text-gray-600">
                      <FiHeart size={14} className="text-brand-500" />
                      <span>{favCount} saved meals</span>
                    </div>

                    <div className="border-t border-gray-50" />

                    {/* Sign out */}
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <FiLogOut size={14} />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile menu button */}
          <button className="sm:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            onClick={() => setMobile(!mobileOpen)}>
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-lg sm:hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-2">
              {/* Profile row */}
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl mb-1">
                <span className="text-3xl">{avatar}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{displayName}</p>
                  <p className="text-xs text-gray-400">{favCount} saved meals</p>
                </div>
              </div>

              <Link to="/home" onClick={() => setMobile(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/home') ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <FiHome size={16} /> Home
              </Link>
              <Link to="/favorites" onClick={() => setMobile(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/favorites') ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <FiHeart size={16} /> Favorites {favCount > 0 && `(${favCount})`}
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
                <FiLogOut size={16} /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
