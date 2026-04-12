// Cartoon food avatar SVGs — 10 unique characters
// Each is a self-contained SVG face made from food items

const AVATARS = [
  // 0 — Ramen bowl face
  (size) => `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" fill="#FFF3E0" stroke="#FF8F00" stroke-width="2"/>
    <ellipse cx="40" cy="48" rx="22" ry="14" fill="#FF8F00"/>
    <ellipse cx="40" cy="44" rx="22" ry="10" fill="#FFCC02"/>
    <path d="M20 44 Q30 38 40 44 Q50 38 60 44" stroke="#FF8F00" stroke-width="2" fill="none"/>
    <circle cx="30" cy="33" r="5" fill="white"/>
    <circle cx="50" cy="33" r="5" fill="white"/>
    <circle cx="31" cy="33" r="3" fill="#333"/>
    <circle cx="51" cy="33" r="3" fill="#333"/>
    <circle cx="32" cy="32" r="1" fill="white"/>
    <circle cx="52" cy="32" r="1" fill="white"/>
    <path d="M33 42 Q40 46 47 42" stroke="#FF8F00" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M35 18 Q40 12 45 18" stroke="#FF8F00" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M40 12 L40 8" stroke="#FF8F00" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  // 1 — Pizza slice face
  (size) => `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" fill="#FFF8E1" stroke="#F57F17" stroke-width="2"/>
    <path d="M40 12 L15 62 L65 62 Z" fill="#FFA000"/>
    <path d="M40 12 L15 62 L65 62 Z" fill="#FFCA28" opacity="0.6"/>
    <circle cx="32" cy="45" r="4" fill="#E53935"/>
    <circle cx="48" cy="42" r="3" fill="#E53935"/>
    <circle cx="40" cy="55" r="3.5" fill="#E53935"/>
    <circle cx="27" cy="33" r="4" fill="white"/>
    <circle cx="47" cy="30" r="4" fill="white"/>
    <circle cx="28" cy="33" r="2.5" fill="#333"/>
    <circle cx="48" cy="30" r="2.5" fill="#333"/>
    <circle cx="29" cy="32" r="1" fill="white"/>
    <circle cx="49" cy="29" r="1" fill="white"/>
    <path d="M33 60 Q37 64 43 60" stroke="#F57F17" stroke-width="2" stroke-linecap="round" fill="none"/>
    <ellipse cx="27" cy="27" rx="2" ry="1" fill="#F57F17" transform="rotate(-20 27 27)"/>
    <ellipse cx="47" cy="25" rx="2" ry="1" fill="#F57F17" transform="rotate(15 47 25)"/>
  </svg>`,

  // 2 — Sushi face
  (size) => `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" fill="#E8F5E9" stroke="#2E7D32" stroke-width="2"/>
    <rect x="18" y="28" width="44" height="28" rx="8" fill="white"/>
    <rect x="18" y="28" width="44" height="12" rx="4" fill="#1B5E20"/>
    <rect x="22" y="32" width="36" height="5" rx="2" fill="#F44336"/>
    <circle cx="29" cy="50" r="4" fill="white"/>
    <circle cx="51" cy="50" r="4" fill="white"/>
    <circle cx="29.5" cy="50" r="2.5" fill="#1A237E"/>
    <circle cx="51.5" cy="50" r="2.5" fill="#1A237E"/>
    <circle cx="30" cy="49" r="1" fill="white"/>
    <circle cx="52" cy="49" r="1" fill="white"/>
    <path d="M34 57 Q40 61 46 57" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M25 24 Q30 18 35 24" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M45 22 Q50 16 55 22" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" fill="none"/>
  </svg>`,

  // 3 — Burger face
  (size) => `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" fill="#FFF3E0" stroke="#E65100" stroke-width="2"/>
    <ellipse cx="40" cy="28" rx="24" ry="12" fill="#8D6E63"/>
    <rect x="16" y="37" width="48" height="8" fill="#FF8F00"/>
    <rect x="16" y="37" width="48" height="4" fill="#43A047"/>
    <rect x="16" y="45" width="48" height="8" fill="#F57F17"/>
    <ellipse cx="40" cy="53" rx="24" ry="8" fill="#8D6E63"/>
    <circle cx="30" cy="30" r="4" fill="white"/>
    <circle cx="50" cy="30" r="4" fill="white"/>
    <circle cx="30.5" cy="30" r="2.5" fill="#4E342E"/>
    <circle cx="50.5" cy="30" r="2.5" fill="#4E342E"/>
    <circle cx="31" cy="29" r="1" fill="white"/>
    <circle cx="51" cy="29" r="1" fill="white"/>
    <path d="M34 56 Q40 60 46 56" stroke="#E65100" stroke-width="2" stroke-linecap="round" fill="none"/>
    <circle cx="27" cy="22" r="3" fill="#F57F17" opacity="0.7"/>
    <circle cx="40" cy="20" r="3" fill="#F57F17" opacity="0.7"/>
    <circle cx="53" cy="22" r="3" fill="#F57F17" opacity="0.7"/>
  </svg>`,

  // 4 — Biryani pot face
  (size) => `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" fill="#FFF8E1" stroke="#F9A825" stroke-width="2"/>
    <ellipse cx="40" cy="52" rx="24" ry="16" fill="#F57F17"/>
    <ellipse cx="40" cy="38" rx="24" ry="12" fill="#FF8F00"/>
    <ellipse cx="40" cy="36" rx="22" ry="8" fill="#FFCA28"/>
    <rect x="16" y="36" width="48" height="4" rx="1" fill="#795548"/>
    <circle cx="30" cy="30" r="5" fill="white"/>
    <circle cx="50" cy="30" r="5" fill="white"/>
    <circle cx="31" cy="30" r="3" fill="#3E2723"/>
    <circle cx="51" cy="30" r="3" fill="#3E2723"/>
    <circle cx="32" cy="29" r="1" fill="white"/>
    <circle cx="52" cy="29" r="1" fill="white"/>
    <path d="M34 58 Q40 63 46 58" stroke="#F57F17" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M33 16 Q37 10 40 14 Q43 10 47 16" stroke="#F9A825" stroke-width="2" stroke-linecap="round" fill="none"/>
    <circle cx="40" cy="14" r="2" fill="#F9A825"/>
  </svg>`,

  // 5 — Taco face
  (size) => `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" fill="#FFF9C4" stroke="#F9A825" stroke-width="2"/>
    <path d="M15 50 Q40 20 65 50 Z" fill="#FDD835"/>
    <path d="M15 50 Q40 25 65 50" stroke="#F57F17" stroke-width="2" fill="none"/>
    <ellipse cx="40" cy="50" rx="25" ry="6" fill="#4CAF50"/>
    <circle cx="32" cy="40" r="3.5" fill="#E53935"/>
    <circle cx="48" cy="38" r="3" fill="#E53935"/>
    <circle cx="40" cy="45" r="3" fill="#FF8A65"/>
    <circle cx="29" cy="30" r="4.5" fill="white"/>
    <circle cx="51" cy="28" r="4.5" fill="white"/>
    <circle cx="29.5" cy="30" r="3" fill="#333"/>
    <circle cx="51.5" cy="28" r="3" fill="#333"/>
    <circle cx="30" cy="29" r="1" fill="white"/>
    <circle cx="52" cy="27" r="1" fill="white"/>
    <path d="M34 53 Q40 58 46 53" stroke="#F57F17" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M30 22 Q35 16 40 20" stroke="#F9A825" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M40 20 Q45 14 50 18" stroke="#F9A825" stroke-width="2" stroke-linecap="round" fill="none"/>
  </svg>`,

  // 6 — Donut face
  (size) => `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" fill="#FCE4EC" stroke="#E91E63" stroke-width="2"/>
    <circle cx="40" cy="44" r="22" fill="#F06292"/>
    <circle cx="40" cy="44" r="10" fill="#FCE4EC"/>
    <circle cx="40" cy="44" r="22" fill="none" stroke="#AD1457" stroke-width="0.5"/>
    <circle cx="28" cy="38" r="2.5" fill="#FF80AB"/>
    <circle cx="36" cy="32" r="2" fill="#FF4081"/>
    <circle cx="44" cy="30" r="2.5" fill="#FF80AB"/>
    <circle cx="52" cy="35" r="2" fill="#FF4081"/>
    <circle cx="28" cy="28" r="5" fill="white"/>
    <circle cx="52" cy="26" r="5" fill="white"/>
    <circle cx="28.5" cy="28" r="3" fill="#880E4F"/>
    <circle cx="52.5" cy="26" r="3" fill="#880E4F"/>
    <circle cx="29" cy="27" r="1" fill="white"/>
    <circle cx="53" cy="25" r="1" fill="white"/>
    <path d="M34 57 Q40 62 46 57" stroke="#E91E63" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M35 20 Q40 14 45 20" stroke="#E91E63" stroke-width="2" stroke-linecap="round" fill="none"/>
  </svg>`,

  // 7 — Avocado face
  (size) => `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" fill="#F1F8E9" stroke="#33691E" stroke-width="2"/>
    <ellipse cx="40" cy="42" rx="20" ry="26" fill="#558B2F"/>
    <ellipse cx="40" cy="42" rx="16" ry="20" fill="#8BC34A"/>
    <ellipse cx="40" cy="48" rx="10" ry="12" fill="#F9A825"/>
    <circle cx="40" cy="48" r="6" fill="#6D4C41"/>
    <circle cx="30" cy="34" r="5" fill="white"/>
    <circle cx="50" cy="34" r="5" fill="white"/>
    <circle cx="30.5" cy="34" r="3" fill="#1B5E20"/>
    <circle cx="50.5" cy="34" r="3" fill="#1B5E20"/>
    <circle cx="31" cy="33" r="1" fill="white"/>
    <circle cx="51" cy="33" r="1" fill="white"/>
    <path d="M34 62 Q40 67 46 62" stroke="#33691E" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M40 16 L40 10" stroke="#33691E" stroke-width="3" stroke-linecap="round"/>
    <path d="M36 12 Q40 8 44 12" stroke="#33691E" stroke-width="2" stroke-linecap="round" fill="none"/>
  </svg>`,

  // 8 — Ice cream face
  (size) => `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" fill="#E3F2FD" stroke="#1565C0" stroke-width="2"/>
    <rect x="33" y="48" width="14" height="20" rx="2" fill="#FFE082"/>
    <path d="M26 50 Q27 35 40 30 Q53 35 54 50 Z" fill="#FF80AB"/>
    <circle cx="34" cy="36" r="5" fill="#FF4081"/>
    <circle cx="46" cy="34" r="5" fill="#FF4081"/>
    <circle cx="40" cy="42" r="5" fill="#FF80AB"/>
    <circle cx="31" cy="36" r="4.5" fill="white"/>
    <circle cx="51" cy="34" r="4.5" fill="white"/>
    <circle cx="31.5" cy="36" r="3" fill="#1A237E"/>
    <circle cx="51.5" cy="34" r="3" fill="#1A237E"/>
    <circle cx="32" cy="35" r="1" fill="white"/>
    <circle cx="52" cy="33" r="1" fill="white"/>
    <path d="M35 48 Q40 52 45 48" stroke="#1565C0" stroke-width="2" stroke-linecap="round" fill="none"/>
    <circle cx="35" cy="24" r="3" fill="#FF80AB"/>
    <circle cx="40" cy="20" r="3.5" fill="#FF4081"/>
    <circle cx="45" cy="23" r="3" fill="#FF80AB"/>
  </svg>`,

  // 9 — Pineapple face
  (size) => `<svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" fill="#FFFDE7" stroke="#F9A825" stroke-width="2"/>
    <ellipse cx="40" cy="46" rx="20" ry="26" fill="#FDD835"/>
    <path d="M24 38 Q28 32 32 38 Q36 32 40 38 Q44 32 48 38 Q52 32 56 38" stroke="#F57F17" stroke-width="1.5" fill="none"/>
    <path d="M24 44 Q28 38 32 44 Q36 38 40 44 Q44 38 48 44 Q52 38 56 44" stroke="#F57F17" stroke-width="1.5" fill="none"/>
    <path d="M24 50 Q28 44 32 50 Q36 44 40 50 Q44 44 48 50 Q52 44 56 50" stroke="#F57F17" stroke-width="1.5" fill="none"/>
    <path d="M35 20 Q37 12 40 8 Q43 12 45 20" fill="#4CAF50"/>
    <path d="M38 18 Q36 10 40 6 Q44 10 42 18" fill="#388E3C"/>
    <circle cx="30" cy="34" r="4.5" fill="white"/>
    <circle cx="50" cy="34" r="4.5" fill="white"/>
    <circle cx="30.5" cy="34" r="3" fill="#4E342E"/>
    <circle cx="50.5" cy="34" r="3" fill="#4E342E"/>
    <circle cx="31" cy="33" r="1" fill="white"/>
    <circle cx="51" cy="33" r="1" fill="white"/>
    <path d="M34 58 Q40 64 46 58" stroke="#F9A825" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  </svg>`,
]

// Get avatar index based on user email for consistency
export function getAvatarIndex(user) {
  const email = user?.email || 'x'
  let hash = 0
  for (let c of email) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return Math.abs(hash) % AVATARS.length
}

export function getAvatarSVG(user, size = 80) {
  const idx = getAvatarIndex(user)
  return AVATARS[idx](size)
}

export function getAllAvatarSVGs(size = 80) {
  return AVATARS.map(fn => fn(size))
}

// React component
export default function FoodAvatar({ user, size = 40, selectedIndex = null }) {
  const idx = selectedIndex !== null ? selectedIndex : getAvatarIndex(user)
  const svg = AVATARS[idx](size)
  return (
    <div
      style={{ width: size, height: size, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', display: 'inline-flex' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
