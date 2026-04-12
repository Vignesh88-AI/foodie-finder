import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMapPin, FiSearch, FiStar, FiClock, FiNavigation, FiFilter } from 'react-icons/fi'
import toast from 'react-hot-toast'

const PLACE_TYPES = [
  { label: '🍽 Restaurants', value: 'restaurant' },
  { label: '☕ Cafés',        value: 'cafe' },
  { label: '🎂 Bakeries',    value: 'bakery' },
  { label: '🍕 Fast Food',   value: 'meal_takeaway' },
  { label: '🍦 Desserts',    value: 'dessert' },
]

// Since Google Maps API requires a key we can't hardcode,
// we'll build the UI and use the key from env var
const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || ''

export default function Nearby({ user }) {
  const [location, setLocation]     = useState(null)
  const [places, setPlaces]         = useState([])
  const [loading, setLoading]       = useState(false)
  const [locLoading, setLocLoading] = useState(false)
  const [placeType, setPlaceType]   = useState('restaurant')
  const [radius, setRadius]         = useState(2000) // metres
  const [locationName, setLocationName] = useState('')
  const [permissionDenied, setPermDenied] = useState(false)
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])

  const getLocation = () => {
    setLocLoading(true)
    setPermDenied(false)
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser')
      setLocLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLocation(loc)
        setLocLoading(false)
        toast.success('Location found!')
        reverseGeocode(loc)
      },
      (err) => {
        setLocLoading(false)
        if (err.code === 1) {
          setPermDenied(true)
          toast.error('Location access denied. Please allow location in your browser settings.')
        } else {
          toast.error('Could not get location. Please try again.')
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const reverseGeocode = async (loc) => {
    if (!GMAPS_KEY) return
    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${loc.lat},${loc.lng}&key=${GMAPS_KEY}`)
      const data = await res.json()
      if (data.results?.[0]) {
        const city = data.results[0].address_components.find(c => c.types.includes('locality'))?.long_name || ''
        setLocationName(city)
      }
    } catch {}
  }

  const searchNearby = async () => {
    if (!location) { toast.error('Please allow location access first'); return }
    if (!GMAPS_KEY) {
      // Show demo data when no API key
      showDemoPlaces()
      return
    }
    setLoading(true)
    setPlaces([])
    try {
      // Use Places API via backend proxy (avoids CORS)
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=${placeType}&key=${GMAPS_KEY}`
      )
      const data = await res.json()
      if (data.results) {
        setPlaces(data.results.slice(0, 20))
        initMap(data.results.slice(0, 20))
      } else {
        toast.error('No places found nearby')
      }
    } catch {
      showDemoPlaces()
    } finally {
      setLoading(false)
    }
  }

  const showDemoPlaces = () => {
    // Show UI demo when no API key configured
    setPlaces([
      { place_id: '1', name: 'Add your Google Maps API key', vicinity: 'See setup instructions below', rating: 0, opening_hours: { open_now: false }, _demo: true },
    ])
    setLoading(false)
    toast('Add VITE_GOOGLE_MAPS_KEY to your .env to enable real results', { icon: 'ℹ️', duration: 6000 })
  }

  const initMap = (results) => {
    if (!mapRef.current || !window.google) return
    const map = new window.google.maps.Map(mapRef.current, {
      center: location, zoom: 14,
      styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
    })
    mapInstance.current = map

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    // User location marker
    new window.google.maps.Marker({
      position: location, map,
      icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#D85A30', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 },
      title: 'You are here'
    })

    // Place markers
    results.forEach((place, i) => {
      if (!place.geometry) return
      const marker = new window.google.maps.Marker({
        position: place.geometry.location, map,
        label: { text: String(i + 1), color: 'white', fontWeight: 'bold', fontSize: '12px' },
        icon: { path: window.google.maps.SymbolPath.MAP_PIN, scale: 14, fillColor: '#1a1a1a', fillOpacity: 0.9, strokeColor: 'white', strokeWeight: 1 },
        title: place.name,
      })
      markersRef.current.push(marker)
    })
  }

  useEffect(() => {
    if (location && places.length > 0 && window.google) initMap(places)
  }, [places])

  const openInMaps = (place) => {
    if (place.geometry?.location) {
      const lat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat
      const lng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${place.place_id}`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a4080 0%, #2563eb 100%)' }} className="pt-10 pb-8 px-4">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-3">📍</div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Nearby Food Places</h1>
          <p className="text-blue-100 text-sm">Find restaurants, cafés and bakeries near you</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Location + Search controls */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">

          <div className="flex flex-wrap gap-4 items-end">
            {/* Location button */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Your location</label>
              <button onClick={getLocation} disabled={locLoading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed transition-all text-sm font-medium"
                style={{
                  borderColor: location ? '#D85A30' : '#e5e7eb',
                  background: location ? 'rgba(216,90,48,0.05)' : 'white',
                  color: location ? '#D85A30' : '#6b7280',
                }}>
                <FiMapPin size={16} />
                {locLoading ? 'Getting location…'
                  : location ? `📍 ${locationName || `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`}`
                  : 'Click to use my location'}
              </button>
              {permissionDenied && (
                <p className="text-xs text-red-500 mt-1.5">
                  ⚠️ Location blocked. Go to browser settings → Site settings → Allow location for this site.
                </p>
              )}
            </div>

            {/* Place type */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Place type</label>
              <div className="flex flex-wrap gap-2">
                {PLACE_TYPES.map(pt => (
                  <button key={pt.value} onClick={() => setPlaceType(pt.value)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: placeType === pt.value ? '#D85A30' : '#f3f4f6',
                      color: placeType === pt.value ? 'white' : '#6b7280',
                    }}>
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Radius */}
            <div className="min-w-[160px]">
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Radius: {radius >= 1000 ? `${radius/1000}km` : `${radius}m`}
              </label>
              <input type="range" min={500} max={10000} step={500} value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="w-full" />
            </div>

            {/* Search button */}
            <button onClick={searchNearby} disabled={loading || !location}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
              style={{ background: '#D85A30', boxShadow: '0 4px 14px rgba(216,90,48,0.3)' }}>
              <FiSearch size={16} />
              {loading ? 'Searching…' : 'Find places'}
            </button>
          </div>
        </motion.div>

        {/* No API key notice */}
        {!GMAPS_KEY && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
            <strong>🗺️ Setup required:</strong> Add <code className="bg-amber-100 px-1 rounded">VITE_GOOGLE_MAPS_KEY=your_key</code> to your{' '}
            <code className="bg-amber-100 px-1 rounded">frontend/.env</code> and{' '}
            <a href="https://console.cloud.google.com/apis/library/places-backend.googleapis.com" target="_blank" rel="noreferrer" className="underline font-semibold">
              enable Places API
            </a>{' '}
            in Google Cloud Console to see real nearby places.
          </motion.div>
        )}

        {/* Map */}
        {location && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6"
            style={{ height: 340 }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }}>
              {!GMAPS_KEY && (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">🗺️</div>
                    <p className="text-sm font-medium">Map will appear here</p>
                    <p className="text-xs text-gray-400 mt-1">Add Google Maps API key to enable</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#D85A30', borderTopColor: 'transparent' }} />
              <p className="text-sm text-gray-500">Searching nearby places…</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && places.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm text-gray-500 font-medium mb-4">
              {places[0]?._demo ? 'Setup required' : `${places.length} places found near you`}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {places.map((place, i) => (
                <motion.div key={place.place_id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer"
                  onClick={() => !place._demo && openInMaps(place)}>

                  {/* Photo */}
                  <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                    {place.photos?.[0] && GMAPS_KEY ? (
                      <img
                        src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GMAPS_KEY}`}
                        alt={place.name} className="w-full h-full object-cover"
                        onError={e => { e.target.style.display='none' }}
                      />
                    ) : (
                      <div className="text-5xl">
                        {placeType === 'cafe' ? '☕' : placeType === 'bakery' ? '🎂' : placeType === 'meal_takeaway' ? '🍕' : '🍽'}
                      </div>
                    )}
                    {/* Number badge */}
                    {!place._demo && (
                      <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </div>
                    )}
                    {place.opening_hours?.open_now !== undefined && (
                      <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold ${place.opening_hours.open_now ? 'bg-green-500 text-white' : 'bg-red-100 text-red-700'}`}>
                        {place.opening_hours.open_now ? 'Open' : 'Closed'}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight">{place.name}</h3>
                    <p className="text-xs text-gray-500 mb-2 flex items-start gap-1">
                      <FiMapPin size={11} className="flex-shrink-0 mt-0.5" />
                      {place.vicinity}
                    </p>
                    <div className="flex items-center justify-between">
                      {place.rating > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <FiStar size={12} style={{ color: '#f59e0b' }} />
                          <span className="font-semibold">{place.rating}</span>
                          {place.user_ratings_total && <span className="text-gray-400">({place.user_ratings_total})</span>}
                        </div>
                      )}
                      {!place._demo && (
                        <button onClick={(e) => { e.stopPropagation(); openInMaps(place) }}
                          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-colors"
                          style={{ color: '#2563eb', background: '#eff6ff' }}>
                          <FiNavigation size={11} /> Directions
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !location && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4">📍</motion.div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Find food near you</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Allow location access to discover restaurants, cafés and bakeries nearby.
            </p>
            <button onClick={getLocation} disabled={locLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: '#D85A30', boxShadow: '0 4px 14px rgba(216,90,48,0.3)' }}>
              <FiMapPin size={16} />
              {locLoading ? 'Getting location…' : 'Allow location access'}
            </button>
          </motion.div>
        )}
      </div>

      {/* Load Google Maps script */}
      {GMAPS_KEY && !window.google && (
        <script async
          src={`https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=places`}
          onLoad={() => { if (location) searchNearby() }}
        />
      )}
    </div>
  )
}
