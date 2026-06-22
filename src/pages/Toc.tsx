import { Link } from 'react-router-dom'

const maps = [
  { href: '/kings',      label: 'Glorious Kings',     sub: '王者荣耀·英雄地图' },
  { href: '/swordsmen',  label: 'Smiling Swordsmen',  sub: '在地图上重读《笑傲江湖》' },
  { href: '/spanish-missions', label: 'Spanish Missions', sub: 'California mission chain on Mapbox Outdoors' },
  { href: '/deck-tests', label: '黄金大劫案',           sub: 'Deck.gl arc map' },
  { href: '/liancheng',  label: '连城诀',               sub: 'Deck.gl arc map' },
]

const games = [
  { href: '/flip-game',    label: 'Flip Game' },
  { href: '/wack-a-virus', label: 'Whack-a-Virus' },
  { href: '/press-here',   label: 'Press Here' },
]

const otherPages: { href: string; label: string; sub?: string }[] = [
  { href: '/dunhuang',       label: 'Dunhuang',            sub: 'Interactive mural coloring' },
  { href: '/studio',         label: 'Upstream.land Studio' },
  { href: '/chinese-names',  label: 'Chinese Name Guide' },
  { href: '/lily',           label: '子豪+筠洁' },
  { href: '/quip-insights',  label: 'Quip Analytics' },
  { href: '/tuner',          label: 'Online Tuner' },
  { href: '/vanilla-english',label: 'Vanilla English' },
  { href: '/turbines',       label: 'Turbines' },
]

export default function Toc() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-6 pt-12 pb-16 flex-1">
        <div className="mb-10 flex items-end gap-4">
          <img src="/src/pages/toc/img/icon_full.png" alt="logo" className="h-14 w-14" />
          <div>
            <h1 className="text-3xl font-bold leading-tight">顺流而上</h1>
            <p className="mt-1 text-sm text-muted-foreground">用设计，用代码，用地图装故事。用故事装X。</p>
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3.5">Featured</p>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Dunhuang */}
          <Link
            to="/dunhuang"
            className="relative rounded-md overflow-hidden no-underline text-white flex flex-col justify-end min-h-[160px] hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #60433c 0%, #ac5548 35%, #226b87 70%, #e7d6bb 100%)' }}
          >
            <div className="absolute inset-0 bg-black/25" />
            <div className="relative z-10 px-5 py-4">
              <div className="text-2xl mb-1">🏺</div>
              <h2 className="text-lg font-semibold leading-snug mb-0.5">Dunhuang</h2>
              <p className="text-[12px] opacity-80">Color & animate mural rings</p>
            </div>
          </Link>

          {/* Press Here */}
          <Link
            to="/press-here"
            className="relative rounded-md overflow-hidden no-underline text-white flex flex-col justify-end min-h-[160px] hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 25%, #6bcb77 50%, #4d96ff 75%, #c77dff 100%)' }}
          >
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 px-5 py-4">
              <div className="text-2xl mb-1">📖</div>
              <h2 className="text-lg font-semibold leading-snug mb-0.5">Press Here</h2>
              <p className="text-[12px] opacity-80">Interactive children's book</p>
            </div>
          </Link>

          {/* Flip Game */}
          <Link
            to="/flip-game"
            className="relative rounded-md overflow-hidden no-underline text-white flex flex-col justify-end min-h-[160px] hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%)' }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 px-5 py-4">
              <div className="text-2xl mb-1">🐞</div>
              <h2 className="text-lg font-semibold leading-snug mb-0.5">Flip Game</h2>
              <p className="text-[12px] opacity-80">Memory card matching</p>
            </div>
          </Link>

          {/* Whack-a-Virus */}
          <Link
            to="/wack-a-virus"
            className="relative rounded-md overflow-hidden no-underline text-white flex flex-col justify-end min-h-[160px] hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #1b4332 0%, #40916c 40%, #95d5b2 70%, #d8f3dc 100%)' }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 px-5 py-4">
              <div className="text-2xl mb-1">🦠</div>
              <h2 className="text-lg font-semibold leading-snug mb-0.5">Whack-a-Virus</h2>
              <p className="text-[12px] opacity-80">Whack viruses, feed the good guys</p>
            </div>
          </Link>
        </div>

        {/* Maps section */}
        <div className="mt-14 mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3.5">Maps</p>
          <ul className="grid gap-2">
            {maps.map(p => (
              <li key={p.href}>
                <Link
                  to={p.href}
                  className="flex items-baseline justify-between px-4 py-3 rounded-md border border-border text-foreground text-[15px] no-underline hover:bg-muted transition-colors"
                >
                  <span>{p.label}</span>
                  <span className="text-xs text-muted-foreground ml-3 shrink-0">{p.sub}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Games section */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3.5">Games</p>
          <ul className="grid gap-2">
            {games.map(p => (
              <li key={p.href}>
                <Link
                  to={p.href}
                  className="block px-4 py-3 rounded-md border border-border text-foreground text-[15px] no-underline hover:bg-muted transition-colors"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Other pages */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3.5">More</p>
          <ul className="grid gap-2">
            {otherPages.map(p => (
              <li key={p.href}>
                <Link
                  to={p.href}
                  className="flex items-baseline justify-between px-4 py-3 rounded-md border border-border text-foreground text-[15px] no-underline hover:bg-muted transition-colors"
                >
                  <span>{p.label}</span>
                  {p.sub ? (
                    <span className="text-xs text-muted-foreground ml-3 shrink-0">{p.sub}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="w-full bg-muted text-muted-foreground text-center py-5 text-sm">
        萧远珊，2016
      </footer>
    </div>
  )
}
