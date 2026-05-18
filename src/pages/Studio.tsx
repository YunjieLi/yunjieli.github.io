import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Studio() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#f5f7fb] flex justify-center px-[18px] py-10 pb-16"
      style={{
        background: 'radial-gradient(circle at 18% 14%,rgba(225,100,126,0.12),transparent 32%), radial-gradient(circle at 82% 20%,rgba(29,31,62,0.08),transparent 35%), #0b0c10',
      }}
    >
      <div className="w-full max-w-[980px] grid gap-8">

        <section className="border border-white/[0.08] rounded-[18px] p-6 md:p-8 bg-white/[0.03]">
          <img className="h-20 w-20 rounded-lg mb-5" src="/upstream_land_logo.svg" alt="Upstream.land logo" />
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3">Upstream.land</h1>
          <p className="text-[#b1b8c7] text-lg leading-relaxed mb-6">
            Hi there, I'm Yunjie, an independent designer based in San Francisco Bay Area.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🏠', title: 'Interior Design', desc: 'Spatial concepts, materials, lighting, and bespoke details that feel intentional.' },
              { icon: '🌎', title: 'Web Design', desc: 'Responsive, conversion-focused sites with clear hierarchy and calm typography.' },
              { icon: '🎁', title: 'Brand Design', desc: 'Identity systems, type, and visual language that scale from packaging to digital.' },
            ].map(({ icon, title, desc }) => (
              <div key={title}>
                <div className="text-2xl mb-1">{icon}</div>
                <h3 className="text-lg font-semibold mb-1">{title}</h3>
                <p className="text-[14px] text-[#b1b8c7]/80">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-white/[0.08] rounded-[18px] p-6 md:p-8 bg-white/[0.03] grid gap-3">
          <h2 className="text-2xl font-semibold">Ready to talk?</h2>
          <p className="text-[#b1b8c7] text-lg leading-relaxed">
            Tell me about your timeline, scope, and goals. I respond within one business day.
          </p>
          <div className="mt-2">
            <a href="mailto:myemail@gmail.com" className={cn(buttonVariants(), 'bg-[#DE55A6] hover:bg-[#6448B9] text-white transition-colors duration-[3200ms] border-0')}>
              Contact me
            </a>
          </div>
        </section>

        <footer className="text-[#b1b8c7] text-center text-[13px]">Upstream.land © 2024</footer>
      </div>

      <Link to="/toc" className="fixed top-4 right-5 text-xl no-underline">📖</Link>
    </div>
  )
}
