import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { auth } from '../firebase'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi'

const googleProvider = new GoogleAuthProvider()

export default function Login() {
  const [email, setEmail]         = useState('')
  const [password, setPass]       = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]         = useState('')
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Welcome back!')
      navigate('/home') // BUG-2 fix: go directly to /home
    } catch (err) { setError(friendlyError(err.code)) }
    finally { setLoading(false) }
  }

  // Feature #1 — Google Sign-In
  const handleGoogle = async () => {
    setGoogleLoading(true); setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      toast.success('Welcome!')
      navigate('/home')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setError('Google sign-in failed. Try again.')
    }
    finally { setGoogleLoading(false) }
  }

  // BUG-3 — Forgot password
  const handleResetPassword = async (e) => {
    e.preventDefault(); setResetLoading(true)
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      setResetSent(true)
      toast.success('Reset email sent! Check your inbox.')
    } catch (err) {
      if (err.code === 'auth/user-not-found') toast.error('No account found with this email.')
      else toast.error('Could not send reset email. Try again.')
    }
    finally { setResetLoading(false) }
  }

  const friendlyError = (code) => {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'Invalid email or password.'
      case 'auth/too-many-requests':  return 'Too many attempts. Please try again later.'
      default: return 'Something went wrong. Please try again.'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
        className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍽</div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Dishcovery</h1>
          <p className="text-gray-500 mt-1">Your meal discovery journey starts here</p>
        </div>

        <AnimatePresence mode="wait">
          {showReset ? (
            // Forgot password form
            <motion.div key="reset" initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:-40 }} className="card p-8">
              <button onClick={() => { setShowReset(false); setResetSent(false); setResetEmail('') }}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
                <FiArrowLeft size={14}/> Back to sign in
              </button>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset password</h2>
              {resetSent ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">📬</div>
                  <p className="font-semibold text-gray-800 mb-1">Check your email</p>
                  <p className="text-sm text-gray-500">We sent a reset link to <strong>{resetEmail}</strong></p>
                  <button onClick={() => { setShowReset(false); setResetSent(false) }}
                    className="btn-primary mt-6 w-full">Back to sign in</button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-5">Enter your email and we'll send you a link to reset your password.</p>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                      <div className="relative">
                        <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                        <input type="email" required value={resetEmail} onChange={e=>setResetEmail(e.target.value)}
                          placeholder="you@email.com" className="input pl-10"/>
                      </div>
                    </div>
                    <button type="submit" disabled={resetLoading} className="btn-primary w-full">
                      {resetLoading ? 'Sending…' : 'Send reset link'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          ) : (
            // Main login form
            <motion.div key="login" initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:40 }} className="card p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Welcome back</h2>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
              )}

              {/* Google Sign-In — Feature #1 */}
              <button onClick={handleGoogle} disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all font-medium text-sm text-gray-700 mb-4 shadow-sm">
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"/>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                )}
                {googleLoading ? 'Signing in…' : 'Continue with Google'}
              </button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"/></div>
                <div className="relative flex justify-center"><span className="px-3 bg-white text-xs text-gray-400">or sign in with email</span></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                    <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                      placeholder="you@email.com" className="input pl-10"/>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <button type="button" onClick={() => setShowReset(true)}
                      className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                    <input type={showPass?'text':'password'} required value={password} onChange={e=>setPass(e.target.value)}
                      placeholder="••••••••" className="input pl-10 pr-10"/>
                    <button type="button" onClick={()=>setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <FiEye size={16}/> : <FiEye size={16}/>}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account?{' '}
                <Link to="/signup" className="text-brand-500 font-medium hover:text-brand-600">Sign up</Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
