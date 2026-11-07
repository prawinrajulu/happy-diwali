# 🪔 3D Diwali Celebration & Wishes Experience

A premium, visually stunning, fully interactive **3D Diwali Celebration & Wishes Website** crafted with modern web technologies (React 19, Three.js WebGL, Tailwind CSS v4, Lucide Icons, and Web Audio API).

Designed to evoke a rich, cinematic festival atmosphere celebrating Deepavali — the victory of light over darkness and good over evil.

---

## ✨ Features

### 1. Opening Intro Experience ("The Awakening")
- Deep midnight atmosphere with floating golden embers.
- Solitary central 3D traditional brass diya with realistic flickering flame physics and dynamic point lighting.
- Cinematic typography:
  - *"THE FESTIVAL OF LIGHTS"*
  - *"A little light can make the world beautiful."*
- Glowing `"✨ Experience Diwali"` button with smooth cinematic camera glide into the grand palace courtyard.

### 2. Main 3D Indian Palace Courtyard (Three.js WebGL)
- **Royal Architecture**: Carved palace pillars, ornate Rajput/Mughal arches with backlighting, and royal domes with spires.
- **Reflective Marble Floor**: Polished dark courtyard floor with specular reflections of diya flames and sky fireworks.
- **Sacred Glowing Rangoli**: Concentric circular mandala pattern on a raised dais with pulsing luminous rings.
- **Realistic 3D Hanging Lanterns (Akash Kandils)**: Swaying gracefully in the night breeze with warm internal lights and golden tassels.
- **Multiple Glowing Diyas**: Arranged symmetrically along the Rangoli perimeter and courtyard pedestals.
- **Floating Golden Embers**: Hundreds of firefly particles rising upward into the starlit sky.
- **Camera Views**: Switch between Courtyard View, Sky Fireworks View, and Cinematic 360 Orbit.

### 3. Spectacular Interactive Fireworks Engine
- Custom physics-based fireworks canvas engine supporting 6 distinct firework styles:
  1. **Golden Chrysanthemum**: Cascading golden sparks drooping gracefully with gravity.
  2. **Multi-Layered Bursts**: Simultaneous core white-hot flash with outer colored rings.
  3. **Weeping Willow Gold**: Long-decay glowing willow tails.
  4. **Crackling Strobe**: Strobe flashes and secondary pop-crack mini-bursts.
  5. **Jeweled Spheres**: Peonies in ruby, emerald, sapphire, amethyst, and gold.
  6. **Planetary Rings**: Expanding circular rings of festive sparkles.
- **Interactive Sky Clicks**: Click or tap anywhere in the sky to launch a custom firework rocket right to that coordinate!
- **Grand Finale / "Celebrate Again"**: Triggers an 18+ rocket synchronized volley lighting up the entire horizon with celebratory confetti.

### 4. Zero-Dependency Procedural Web Audio Engine
- **Rocket Launches**: Realistic aerodynamic whoosh and ascent whistles.
- **Explosions**: Deep reverberant sub-bass impact and crisp acoustic body.
- **Crackles**: Sizzling golden ember pops.
- **Temple Bell Chimes**: Harmonic golden bell tones when lighting or clicking 3D diyas.
- **Festive Ambient Music**: Procedural festive raga drone and sitar plucks synthesized with Web Audio oscillators (no broken external audio URLs).
- **Mute / Unmute Toggle**: With real-time animated audio wave bars.

### 5. Personalized Wishes & Native Sharing
- 3D Gold Typography with metallic shimmer animation:
  - *"🪔 HAPPY DIWALI 🪔"*
  - *"May the festival of lights fill your life with endless happiness, prosperity, love, and success."*
  - Poetic festive blessing.
- **Personalize Wish**: Enter any recipient or sender's name to generate personalized links (e.g. `?name=Priya`).
- **Share the Diwali Happiness**: Native Web Share API integration (WhatsApp, Twitter, Messages) with instant clipboard fallback and toast feedback.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build locally
npm run preview
```

---

## 🌐 Deploy to Vercel

This repository includes `vercel.json` and standard Vite configuration, ready for zero-config deployment:

1. Push this repository to GitHub/GitLab.
2. In your [Vercel Dashboard](https://vercel.com), click **Add New Project** and select this repository.
3. Keep the default build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**!
