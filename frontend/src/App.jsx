// Dishcovery v5 - 2026-04-12 11:47
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { Toaster } from 'react-hot-toast'
import { auth } from './firebase'

import Navbar      from './components/Navbar'
import Landing     from './pages/Landing'
import Login       from './pages/Login'
import Signup      from './pages/Signup'
import Home        from './pages/Home'
import MealDetails from './pages/MealDetails'
import Favorites   from './pages/Favorites'
import Profile     from './pages/Profile'
import Nearby      from './pages/Nearby'
import Chatbot     from './pages/Chatbot'

function PrivateRoute({ user, loading, children }) {
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#D85A30', borderTopColor: 'transparent' }} />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: '12px', fontSize: '14px' },
        success: { iconTheme: { primary: '#D85A30', secondary: '#fff' } }
      }} />

      {user && <Navbar user={user} />}

      <Routes>
        <Route path="/"       element={user ? <Navigate to="/home" replace /> : <Landing />} />
        <Route path="/login"  element={user ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/home" replace /> : <Signup />} />

        <Route path="/home"      element={<PrivateRoute user={user} loading={loading}><Home user={user} /></PrivateRoute>} />
        <Route path="/meal/:id"  element={<PrivateRoute user={user} loading={loading}><MealDetails user={user} /></PrivateRoute>} />
        <Route path="/favorites" element={<PrivateRoute user={user} loading={loading}><Favorites user={user} /></PrivateRoute>} />
        <Route path="/profile"   element={<PrivateRoute user={user} loading={loading}><Profile user={user} /></PrivateRoute>} />
        <Route path="/nearby"    element={<PrivateRoute user={user} loading={loading}><Nearby user={user} /></PrivateRoute>} />
        <Route path="/chatbot"   element={<PrivateRoute user={user} loading={loading}><Chatbot user={user} /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
