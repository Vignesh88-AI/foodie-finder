import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { motion } from 'framer-motion'
import { auth } from '../firebase'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

const googleProvider = new GoogleAuthProvider()

export default function Signup() {
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPass]       = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]         = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirmPass) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      toast.success(`Welcome, ${name}!`)
      navigate('/home') // BUG-2 fix
    } catch (err) { setError(friendlyError(err.code)) }
    finally { setLoading(false) }
  }

  // Feature #1 — Google Sign-In
  const handleGoogle = async () => {
    setGoogleLoading(true); setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      toast.success('Account created!')
      navigate('/home')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setError('Google sign-in failed. Try again.')
    }
    finally { setGoogleLoading(false) }
  }

  const friendlyError = (code) => {
    switch (code) {
      case 'auth/email-already-in-use': return 'An account with this email already exists.'
      case 'auth/invalid-email':        return 'Please enter a valid email address.'
      case 'auth/weak-password':        return 'Password should be at least 6 characters.'
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
          <p className="text-gray-500 mt-1">Create an account to get started</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Create account</h2>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
          )}

          {/* Google Sign-In */}
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
            {googleLoading ? 'Creating account…' : 'Continue with Google'}
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"/></div>
            <div className="relative flex justify-center"><span className="px-3 bg-white text-xs text-gray-400">or create with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label:'Full name', type:'text', val:name, set:setName, ph:'Your name', icon:FiUser, show:null },
              { label:'Email', type:'email', val:email, set:setEmail, ph:'you@email.com', icon:FiMail, show:null },
            ].map(({ label, type, val, set, ph, icon:Icon }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                  <input type={type} required value={val} onChange={e=>set(e.target.value)} placeholder={ph} className="input pl-10"/>
                </div>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input type={showPass?'text':'password'} required value={password} onChange={e=>setPass(e.target.value)}
                  placeholder="Min. 6 characters" className="input pl-10 pr-10"/>
                <button type="button" onClick={()=>setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input type={showConfirm?'text':'password'} required value={confirmPass} onChange={e=>setConfirmPass(e.target.value)}
                  placeholder="Repeat your password" className="input pl-10 pr-10"/>
                <button type="button" onClick={()=>setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-medium hover:text-brand-600">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
