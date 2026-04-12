import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase'
import FoodAvatar, { getAllAvatarSVGs, getAvatarIndex } from '../components/FoodAvatar'
import toast from 'react-hot-toast'
import { FiEdit2, FiSave, FiX, FiHeart, FiLock, FiUser, FiMail, FiChevronRight, FiArrowLeft } from 'react-icons/fi'

const AVATAR_NAMES = ['Ramen','Pizza','Sushi','Burger','Biryani','Taco','Donut','Avocado','Ice Cream','Pineapple']

export default function Profile({ user }) {
  const navigate  = useNavigate()
  const [favCount, setFavCount]           = useState(0)
  const [displayName, setDisplayName]     = useState(user?.displayName||'')
  const [editingName, setEditingName]     = useState(false)
  const [savingName, setSavingName]       = useState(false)
  const [showAvatarPicker, setShowAvatar] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(getAvatarIndex(user))
  const [activeTab, setActiveTab]         = useState('profile')
  const [currentPass, setCurrentPass]     = useState('')
  const [newPass, setNewPass]             = useState('')
  const [confirmPass, setConfirmPass]     = useState('')
  const [savingPass, setSavingPass]       = useState(false)
  const allAvatars = getAllAvatarSVGs(64)

  useEffect(() => {
    if(!user) return
    const q = query(collection(db,'favorites'),where('uid','==',user.uid))
    const unsub = onSnapshot(q, snap => setFavCount(snap.size))
    return unsub
  }, [user])

  const saveName = async () => {
    if(!displayName.trim()) return; setSavingName(true)
    try { await updateProfile(auth.currentUser,{displayName:displayName.trim()}); toast.success('Name updated!'); setEditingName(false) }
    catch { toast.error('Could not update name.') }
    finally { setSavingName(false) }
  }

  const savePassword = async () => {
    if(newPass!==confirmPass){toast.error('Passwords do not match.');return}
    if(newPass.length<6){toast.error('Min. 6 characters.');return}
    setSavingPass(true)
    try {
      const cred=EmailAuthProvider.credential(user.email,currentPass)
      await reauthenticateWithCredential(auth.currentUser,cred)
      await updatePassword(auth.currentUser,newPass)
      toast.success('Password updated!'); setCurrentPass('');setNewPass('');setConfirmPass('')
    } catch(err) { if(err.code==='auth/wrong-password') toast.error('Wrong current password.'); else toast.error('Could not update password.') }
    finally { setSavingPass(false) }
  }

  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN',{month:'long',year:'numeric'})
    : 'Recently'

  // #28 — Achievement badges
  const badges = [
    { emoji:'🌍', label:'Explorer',    desc:'Joined Dishcovery',  earned:true },
    { emoji:'❤️', label:'Food Lover',  desc:'Save 5+ meals',     earned:favCount>=5 },
    { emoji:'🍳', label:'Chef',        desc:'Save 20+ meals',    earned:favCount>=20 },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-xl mx-auto px-4 pt-6">
        <button onClick={()=>navigate('/home')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
          <FiArrowLeft size={16}/> Back to home
        </button>

        {/* Profile card */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
          className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-5">
          {/* #27 Fix C — taller cover */}
          <div style={{ height:120, background:'linear-gradient(135deg,#993C1D 0%,#D85A30 60%,#FF8A50 100%)' }}/>

          <div className="px-6 pb-6">
            <div style={{ marginTop:-44, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white" style={{ width:80,height:80 }}>
                  <FoodAvatar user={user} size={80} selectedIndex={selectedAvatar}/>
                </div>
                <button onClick={()=>setShowAvatar(true)}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full text-white flex items-center justify-center shadow-md"
                  style={{ background:'#D85A30' }}>
                  <FiEdit2 size={11}/>
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="mt-3">
              {editingName
                ? <div className="flex items-center gap-2">
                    <input value={displayName} onChange={e=>setDisplayName(e.target.value)}
                      className="input flex-1 text-base font-bold py-1.5" onKeyDown={e=>e.key==='Enter'&&saveName()} autoFocus/>
                    <button onClick={saveName} disabled={savingName} className="p-2 rounded-xl text-white" style={{ background:'#D85A30' }}><FiSave size={15}/></button>
                    <button onClick={()=>{setEditingName(false);setDisplayName(user?.displayName||'')}} className="p-2 rounded-xl bg-gray-100 text-gray-600"><FiX size={15}/></button>
                  </div>
                : <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-900">{user?.displayName||'Foodie'}</h1>
                    <button onClick={()=>setEditingName(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50"><FiEdit2 size={13}/></button>
                  </div>
              }
              {/* #27 Fix D */}
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><span>🗓</span> Member since {memberSince}</p>
            </div>

            {/* #27 Fix A — stat pills */}
            <div className="flex gap-3 mt-4">
              <div className="flex items-center gap-2 rounded-xl px-4 py-2" style={{ background:'#FFF3EE',border:'1px solid #FFE0D0' }}>
                <span className="text-lg">❤️</span>
                <div>
                  <p className="text-lg font-bold text-gray-900 leading-none">{favCount}</p>
                  <p className="text-xs text-gray-400">Saved</p>
                </div>
              </div>
              {badges.filter(b=>b.earned).slice(-1).map(b=>(
                <div key={b.label} className="flex items-center gap-2 rounded-xl px-4 py-2" style={{ background:'#eff6ff',border:'1px solid #dbeafe' }}>
                  <span className="text-lg">{b.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-none">{b.label}</p>
                    <p className="text-xs text-gray-400">Badge</p>
                  </div>
                </div>
              ))}
            </div>

            {/* #28 — Badges row */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {badges.map(b=>(
                <div key={b.label} title={b.desc}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all"
                  style={b.earned?{background:'#FFF3EE',border:'1px solid #FFD4C2',color:'#1a1a1a'}:{background:'#f9fafb',border:'1px solid #f3f4f6',color:'#d1d5db'}}>
                  {b.emoji} {b.label} {!b.earned&&<span>🔒</span>}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Avatar picker */}
        <AnimatePresence>
          {showAvatarPicker&&(
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)' }}>
              <motion.div initial={{ scale:0.9,opacity:0 }} animate={{ scale:1,opacity:1 }}
                exit={{ scale:0.9,opacity:0 }} transition={{ duration:0.22 }}
                className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-900 text-lg">Choose your avatar</h3>
                  <button onClick={()=>setShowAvatar(false)} className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100"><FiX size={18}/></button>
                </div>
                <div className="grid grid-cols-5 gap-3 mb-5">
                  {allAvatars.map((svg,i)=>(
                    <motion.button key={i} whileTap={{ scale:0.88 }} onClick={()=>setSelectedAvatar(i)} className="flex flex-col items-center gap-1">
                      <div className={`rounded-xl overflow-hidden border-2 transition-all ${selectedAvatar===i?'scale-110 shadow-lg':'border-transparent hover:border-gray-200'}`}
                        style={{ width:48,height:48,borderColor:selectedAvatar===i?'#D85A30':undefined }}
                        dangerouslySetInnerHTML={{ __html:svg }}/>
                      <span className="text-gray-400" style={{ fontSize:9 }}>{AVATAR_NAMES[i]}</span>
                    </motion.button>
                  ))}
                </div>
                <button onClick={()=>{toast.success(`${AVATAR_NAMES[selectedAvatar]} selected!`);setShowAvatar(false)}} className="btn-primary w-full">Save avatar</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-5">
          {[['profile',FiUser,'Profile'],['security',FiLock,'Security']].map(([t,Icon,label])=>(
            <button key={t} onClick={()=>setActiveTab(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab===t?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>
              <Icon size={14}/> {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab==='profile'&&(
            <motion.div key="profile" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-10 }}>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-4">
                <div className="px-5 py-3.5 border-b border-gray-50"><h3 className="font-semibold text-gray-800 text-sm">Account info</h3></div>
                {[{icon:FiUser,label:'Display name',value:user?.displayName||'Not set'},{icon:FiMail,label:'Email',value:user?.email},{icon:FiHeart,label:'Saved meals',value:`${favCount} meal${favCount!==1?'s':''}`}].map(({icon:Icon,label,value})=>(
                  <div key={label} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'#FFF3EE',color:'#D85A30' }}><Icon size={15}/></div>
                    <div className="flex-1 min-w-0"><p className="text-xs text-gray-400 mb-0.5">{label}</p><p className="text-sm font-medium text-gray-800 truncate">{value}</p></div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-gray-50"><h3 className="font-semibold text-gray-800 text-sm">Quick links</h3></div>
                {[{label:'My saved meals',icon:FiHeart,action:()=>navigate('/favorites'),color:'#D85A30',bg:'#FFF3EE'},{label:'Browse recipes',icon:FiUser,action:()=>navigate('/home'),color:'#2563eb',bg:'#eff6ff'}].map(({label,icon:Icon,action,color,bg})=>(
                  <button key={label} onClick={action} className="w-full flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors text-left">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:bg,color }}><Icon size={15}/></div>
                    <span className="flex-1 text-sm font-medium text-gray-800">{label}</span>
                    <FiChevronRight size={15} className="text-gray-300"/>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {activeTab==='security'&&(
            <motion.div key="security" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-10 }}>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4 text-sm">Change password</h3>
                <div className="space-y-3">
                  {[{label:'Current password',val:currentPass,set:setCurrentPass,ph:'••••••••'},{label:'New password',val:newPass,set:setNewPass,ph:'Min. 6 characters'},{label:'Confirm new password',val:confirmPass,set:setConfirmPass,ph:'Repeat password'}].map(({label,val,set,ph})=>(
                    <div key={label}>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
                      <input type="password" value={val} onChange={e=>set(e.target.value)} placeholder={ph} className="input"/>
                    </div>
                  ))}
                  <button onClick={savePassword} disabled={savingPass} className="btn-primary w-full mt-1">
                    {savingPass?'Updating…':'Update password'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
