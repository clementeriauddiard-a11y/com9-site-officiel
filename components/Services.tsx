'use client'

import { motion } from 'framer-motion'

const services = [
  {
    num: '01', title: 'Écran', tag: 'LCD / OLED',
    desc: 'Remplacement dalle LCD ou OLED toutes marques. Qualité OEM certifiée — couleurs exactes, tactile parfait, luminosité originale.',
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-6 h-6"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>),
  },
  {
    num: '02', title: 'Batterie', tag: 'Haute capacité',
    desc: 'Remplacement batterie certifiée haute capacité. Jusqu\'à 100 % de santé retrouvée. Autonomie maximale, zéro compromis.',
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-6 h-6"><rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 11v2"/><path d="M6 12h4M10 10v4"/></svg>),
  },
  {
    num: '03', title: 'Vitre arrière', tag: 'Structure',
    desc: 'Remplacement vitre arrière brisée. Rendu identique à l\'original, protection optimale de la carte mère et des composants internes.',
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-6 h-6"><rect x="5" y="2" width="14" height="20" rx="3"/><circle cx="12" cy="18" r="1"/><rect x="9" y="3.5" width="6" height="1" rx="0.5"/></svg>),
  },
  {
    num: '04', title: 'Diagnostic', tag: 'Analyse /100',
    desc: 'Contrôle complet sur 100 points. Score officiel Com\'9 remis à l\'issue. Détection précise de toute défaillance matérielle ou logicielle.',
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-6 h-6"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v3l2 2"/></svg>),
  },
  {
    num: '05', title: 'Reconditionnement', tag: 'Remise à neuf',
    desc: 'Restauration complète : nettoyage interne, remplacement composants usés, validation qualité multi-points. Garanti comme neuf.',
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-6 h-6"><path d="M4 4v5h5"/><path d="M20 20v-5h-5"/><path d="M4 9A16 16 0 0116 4M20 15a16 16 0 01-12 5"/></svg>),
  },
  {
    num: '06', title: 'Optimisation', tag: 'Logiciel',
    desc: 'Boost performance logicielle. Nettoyage système, mise à jour ciblée, élimination des ralentissements. Réactivité restaurée.',
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-6 h-6"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>),
  },
]

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
}

export default function Services() {
  return (
    <section id="services" className="relative overflow-hidden" style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}>
      {/* Top connector line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px"
        style={{ height: '72px', background: 'linear-gradient(to bottom, rgba(0,209,255,0.45), transparent)' }} />

      <div className="max-w-6xl mx-auto px-5 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="section-label mb-5">— Services —</p>
          <h2 className="font-black font-space text-cold-white mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.025em' }}>
            Expertise <span className="gradient-text">Chirurgicale</span>
          </h2>
          <p className="font-space max-w-xs mx-auto text-sm leading-relaxed"
            style={{ color: 'rgba(234,251,255,0.62)', fontSize: 'clamp(0.82rem, 2vw, 0.875rem)' }}>
            Chaque intervention est une opération de précision.<br className="hidden sm:block" /> Protocoles avancés, composants premium.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
        >
          {services.map((s) => (
            <motion.div
              key={s.title}
              variants={cardVariants}
              className="glass-card rounded-2xl p-6 md:p-7 group cursor-default relative overflow-hidden"
            >
              {/* Corner glow on hover */}
              <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'radial-gradient(circle at top right, rgba(0,209,255,0.07), transparent)' }} />

              {/* Header row */}
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[10px] tracking-[0.25em]" style={{ color: 'rgba(0,209,255,0.22)' }}>{s.num}</span>
                <span className="font-mono text-[8.5px] tracking-[0.14em] uppercase px-2 py-0.5 rounded"
                  style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', color: 'rgba(234,251,255,0.18)' }}>
                  {s.tag}
                </span>
              </div>

              {/* Icon */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-350"
                style={{
                  background: 'rgba(0,209,255,0.04)',
                  border: '1px solid rgba(0,209,255,0.1)',
                  color: 'rgba(0,209,255,0.45)',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#00d1ff'; e.currentTarget.style.background = 'rgba(0,209,255,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,209,255,0.45)'; e.currentTarget.style.background = 'rgba(0,209,255,0.04)' }}
              >
                {s.icon}
              </div>

              <h3 className="text-cold-white font-bold font-space text-sm mb-2.5 tracking-wide">{s.title}</h3>
              <p className="font-space text-[12.5px] leading-relaxed" style={{ color: 'rgba(234,251,255,0.62)' }}>{s.desc}</p>

              {/* Hover underline */}
              <div className="mt-5 h-px w-0 group-hover:w-full transition-all duration-500"
                style={{ background: 'linear-gradient(to right, rgba(0,209,255,0.45), rgba(0,102,255,0.18), transparent)' }} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
