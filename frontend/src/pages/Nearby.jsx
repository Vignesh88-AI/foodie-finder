import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMapPin, FiSearch, FiNavigation, FiClock, FiExternalLink, FiRefreshCw } from 'react-icons/fi'
import toast from 'react-hot-toast'

const PLACE_TYPES = [
  { label: '🍽 Restaurants', tag: 'restaurant', amenity: 'restaurant' },
  { label: '☕ Cafés',       tag: 'cafe',        amenity: 'cafe' },
  { label: '🎂 Bakeries',   tag: 'bakery',      amenity: 'bakery' },
  { label: '🍕 Fast Food',  tag: 'fast_food',   amenity: 'fast_food' },
  { label: '🍦 Ice Cream',  tag: 'ice_cream',   amenity: 'ice_cream' },
]

const EMOJI = { restaurant:'🍽', cafe:'☕', bakery:'🎂', fast_food:'🍕', ice_cream:'🍦' }
const BG = ['#fef3c7','#dbeafe','#fce7f3','#d1fae5','#ede9fe','#ffedd5','#f0fdf4']

async function fetchNearbyPlaces(lat, lng, radiusM, amenity) {
  const q = `[out:json][timeout:25];(node["amenity"="${amenity}"](around:${radiusM},${lat},${lng});way["amenity"="${amenity}"](around:${radiusM},${lat},${lng}););out center 30;`
  const res = await fetch('https://overpass-api.de/api/interpreter', { method:'POST', body:'data='+encodeURIComponent(q) })
  const data = await res.json()
  return data.elements || []
}

function getDistance(lat1,lon1,lat2,lon2) {
  const R=6371000, dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)))
}
function fmtDist(m) { return m>=1000?`${(m/1000).toFixed(1)}km`:`${m}m` }

function LeafletMap({ location, places, activeAmenity }) {
  const mapRef  = useRef(null)
  const mapInst = useRef(null)

  useEffect(() => {
    if (!mapRef.current || !location) return

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id='leaflet-css'; link.rel='stylesheet'
      link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    const init = () => {
      if (mapInst.current) { mapInst.current.remove(); mapInst.current=null }
      const L = window.L
      const map = L.map(mapRef.current).setView([location.lat,location.lng],15)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map)

      L.marker([location.lat,location.lng],{ icon:L.divIcon({
        html:`<div style="width:16px;height:16px;background:#D85A30;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
        iconSize:[16,16],iconAnchor:[8,8],className:''
      })}).addTo(map).bindPopup('📍 You are here')

      places.slice(0,20).forEach((p,i) => {
        const lat=p.lat||p.center?.lat, lng=p.lon||p.center?.lon
        if (!lat||!lng) return
        L.marker([lat,lng],{ icon:L.divIcon({
          html:`<div style="width:28px;height:28px;background:#1a1a1a;color:white;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.25)">${i+1}</div>`,
          iconSize:[28,28],iconAnchor:[14,14],className:''
        })}).addTo(map).bindPopup(`<strong>${p.tags?.name||'Place'}</strong>`)
      })
      mapInst.current=map
    }

    if (window.L) { init() }
    else {
      const s=document.createElement('script'); s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload=init
      document.head.appendChild(s)
    }
    return () => { if (mapInst.current){mapInst.current.remove();mapInst.current=null} }
  }, [location, places])

  return <div ref={mapRef} style={{width:'100%',height:'100%'}} />
}

export default function Nearby() {
  const [location, setLocation]     = useState(null)
  const [places, setPlaces]         = useState([])
  const [loading, setLoading]       = useState(false)
  const [locLoading, setLocLoading] = useState(false)
  // FIX #32: use simple single placeType, not selectedTypes
  const [placeType, setPlaceType]   = useState(PLACE_TYPES[0])
  const [radius, setRadius]         = useState(1500)
  const [denied, setDenied]         = useState(false)
  const [cityName, setCityName]     = useState('')

  // Auto-request location on mount
  useEffect(() => { requestLocation() }, [])

  const requestLocation = () => {
    setLocLoading(true); setDenied(false)
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); setLocLoading(false); return }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLocation(loc); setLocLoading(false)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`)
          const data = await res.json()
          setCityName(data.address?.city || data.address?.town || data.address?.suburb || '')
        } catch {}
      },
      err => {
        setLocLoading(false)
        if (err.code===1) { setDenied(true); toast.error('Location access denied') }
        else toast.error('Could not get location')
      },
      { timeout:10000, enableHighAccuracy:true }
    )
  }

  const searchNearby = async () => {
    if (!location) { toast.error('Allow location first'); return }
    setLoading(true); setPlaces([])
    try {
      const results = await fetchNearbyPlaces(location.lat, location.lng, radius, placeType.amenity)
      const sorted = results
        .filter(p => p.tags?.name)
        .map(p => ({ ...p, _dist: getDistance(location.lat, location.lng, p.lat||p.center?.lat, p.lon||p.center?.lon) }))
        .sort((a,b) => a._dist - b._dist)
        .slice(0, 20)
      setPlaces(sorted)
      if (!sorted.length) toast('No named places found. Try increasing the radius.', { icon:'🔍' })
      else toast.success(`Found ${sorted.length} places!`)
    } catch { toast.error('Search failed. Try again.') }
    finally { setLoading(false) }
  }

  const openDirections = place => {
    const lat=place.lat||place.center?.lat, lng=place.lon||place.center?.lon
    window.open(`https://www.openstreetmap.org/directions?from=${location.lat},${location.lng}&to=${lat},${lng}`,'_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1a4080 0%,#2563eb 100%)' }} className="pt-10 pb-8 px-4">
        <motion.div initial={{ opacity:0,y:-16 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.5 }}
          className="max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-3">📍</div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Nearby Food Places</h1>
          <p className="text-blue-100 text-sm">Restaurants, cafés & bakeries near you — free, no signup needed</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Controls */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex flex-wrap gap-4 items-end">

            {/* Location */}
            <div className="flex-1 min-w-[200px]">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Your location</p>
              <button onClick={requestLocation} disabled={locLoading}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-all"
                style={{ borderColor:location?'#D85A30':'#e5e7eb', background:location?'rgba(216,90,48,0.05)':'white', color:location?'#D85A30':'#6b7280' }}>
                {locLoading ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/> Getting location…</>
                  : location ? `📍 ${cityName||`${location.lat.toFixed(3)},${location.lng.toFixed(3)}`}`
                  : <><FiMapPin size={15}/> Click to use my location</>}
              </button>
              {denied && <p className="text-xs text-red-500 mt-1.5">⚠️ Blocked — allow location in browser settings then <button onClick={requestLocation} className="underline font-semibold">retry</button></p>}
            </div>

            {/* Place type */}
            <div className="flex-1 min-w-[220px]">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Place type</p>
              <div className="flex flex-wrap gap-2">
                {PLACE_TYPES.map(pt => (
                  <button key={pt.tag} onClick={() => setPlaceType(pt)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{ background:placeType.tag===pt.tag?'#D85A30':'#f3f4f6', color:placeType.tag===pt.tag?'white':'#6b7280' }}>
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Radius */}
            <div className="min-w-[160px]">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Radius: {radius>=1000?`${(radius/1000).toFixed(1)}km`:`${radius}m`}
              </p>
              <input type="range" min={500} max={8000} step={500} value={radius}
                onChange={e => setRadius(Number(e.target.value))} className="w-full" />
            </div>

            <button onClick={searchNearby} disabled={loading||!location}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-40"
              style={{ background:'#D85A30', boxShadow:'0 4px 14px rgba(216,90,48,0.28)' }}>
              <FiSearch size={15}/>
              {loading?'Searching…':'Find places'}
            </button>
          </div>
        </motion.div>

        {/* Map */}
        <AnimatePresence>
          {location && (
            <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6"
              style={{ height:320 }}>
              <LeafletMap location={location} places={places} activeAmenity={placeType.amenity}/>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor:'#D85A30',borderTopColor:'transparent' }}/>
            <p className="text-sm text-gray-500">Searching for {placeType.label} nearby…</p>
          </div>
        )}

        {/* Results */}
        {!loading && places.length > 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
            <p className="text-sm text-gray-500 font-medium mb-4">{places.length} {placeType.label} found within {fmtDist(radius)}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {places.map((place,i) => {
                const name = place.tags?.name||'Unnamed'
                const cuisine = place.tags?.cuisine?.replace(/_/g,' ')||''
                const hours = place.tags?.opening_hours||''
                const website = place.tags?.website||place.tags?.['contact:website']||''
                return (
                  <motion.div key={place.id}
                    initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.05 }}
                    whileHover={{ y:-4 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="h-28 flex items-center justify-center relative"
                      style={{ background:BG[i%BG.length] }}>
                      <span className="text-5xl">{EMOJI[placeType.amenity]||'🍽'}</span>
                      <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shadow">{i+1}</div>
                      {place._dist && <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold bg-white/90 text-gray-700">{fmtDist(place._dist)}</div>}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight">{name}</h3>
                      {cuisine && <p className="text-xs font-medium mb-1 capitalize" style={{ color:'#D85A30' }}>{cuisine}</p>}
                      {hours && <div className="flex items-start gap-1 text-xs text-gray-500 mb-3"><FiClock size={11} className="mt-0.5 flex-shrink-0"/><span className="line-clamp-1">{hours}</span></div>}
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => openDirections(place)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl transition-colors"
                          style={{ background:'#eff6ff', color:'#2563eb' }}>
                          <FiNavigation size={12}/> Directions
                        </button>
                        {website && (
                          <a href={website.startsWith('http')?website:`https://${website}`} target="_blank" rel="noreferrer"
                            className="flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold"
                            style={{ background:'#f3f4f6', color:'#6b7280' }}>
                            <FiExternalLink size={12}/>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Empty/initial state */}
        {!loading && !location && (
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="text-center py-20">
            <motion.div animate={{ y:[0,-10,0] }} transition={{ duration:2,repeat:Infinity }} className="text-6xl mb-4">📍</motion.div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Searching for your location…</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Allow location access in your browser to find restaurants and cafés near you.</p>
            <button onClick={requestLocation} disabled={locLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm"
              style={{ background:'#D85A30', boxShadow:'0 4px 14px rgba(216,90,48,0.3)' }}>
              <FiMapPin size={16}/>
              {locLoading?'Getting location…':'Allow location access'}
            </button>
            <p className="text-xs text-gray-400 mt-3">Powered by OpenStreetMap · Free · No API key needed</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
