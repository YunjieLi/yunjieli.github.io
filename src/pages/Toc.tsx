import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const featured = [
  {
    bg: '/toc/img/jumbotron-nyc.png',
    title: 'Restaurants Noise of NYC',
    blogHref: 'https://blog.mapbox.com/exploring-nyc-open-data-with-3d-hexbins-5af2b7d8bc46',
    blogLabel: 'Mapbox Blog',
    sub: 'Visualizing NYC 311 Data in 3D',
    href: 'https://www.mapbox.com/bites/00304/',
  },
  {
    bg: '/toc/img/jumbotron-boston.png',
    title: 'Historical Boston',
    blogHref: 'https://blog.mapbox.com/mapping-historic-boston-in-the-mapbox-studio-dataset-editor-838c49209bd1',
    blogLabel: 'Mapbox Blog',
    sub: 'Mapping, Urban History',
    href: 'https://www.mapbox.com/bites/00287/',
  },
  {
    bg: '/toc/img/jumbotron-lush.png',
    title: 'Mono <> Colors',
    blogHref: 'https://blog.mapbox.com/mobile-runtime-styling-get-active-553b0c9aaa16',
    blogLabel: 'Mapbox Blog',
    sub: 'Map Design – Greenifying this world',
    href: 'https://www.mapbox.com/bites/00299/compare.html',
  },
  {
    bg: '/toc/img/jumbotron-heroes.png',
    title: 'Glorious Kings',
    blogHref: null,
    blogLabel: null,
    sub: '#自嗨 王者荣耀·英雄地图。',
    href: '/kings',
    internal: true,
  },
  {
    bg: '/toc/img/jumbotron-swordsmen.png',
    title: 'Smiling Swordsmen',
    blogHref: null,
    blogLabel: null,
    sub: '#自嗨 在地图上重读《笑傲江湖》。',
    href: '/swordsmen',
    internal: true,
  },
]

const morePages = [
  { href: '/studio', label: 'Upstream.land Studio' },
  { href: '/chinese-names', label: 'Chinese Name Guide' },
  { href: '/deck-tests', label: '黄金大劫案' },
  { href: '/lily', label: '子豪+筠洁' },
  { href: '/press-here', label: 'Press Here in HTML' },
  { href: '/quip-insights', label: 'Quip Analytics' },
  { href: '/tuner', label: 'Online Tuner' },
  { href: '/vanilla-english', label: 'Vanilla English' },
]

export default function Toc() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-6 pt-12 pb-16 flex-1">
        <div className="mb-10 flex items-end gap-4">
          <img src="/toc/img/icon_full.png" alt="logo" className="h-14 w-14" />
          <div>
            <h1 className="text-3xl font-bold leading-tight">顺流而上</h1>
            <p className="mt-1 text-sm text-muted-foreground">用设计，用代码，用地图装故事。用故事装X。</p>
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3.5">Featured</p>

        <div className="flex flex-col gap-2.5">
          {featured.map(item => (
            <div
              key={item.title}
              className="relative rounded-md overflow-hidden bg-cover bg-center text-white"
              style={{ backgroundImage: `url(${item.bg})` }}
            >
              <div className="absolute inset-0 bg-black/65" />
              <div className="relative z-10 px-6 py-4">
                <h2 className="text-xl font-semibold mb-1 leading-snug">{item.title}</h2>
                <p className="text-[13px] mb-2.5 opacity-80">
                  {item.blogHref && (
                    <><a href={item.blogHref} target="_blank" rel="noreferrer" className="underline underline-offset-2">{item.blogLabel}</a> · </>
                  )}
                  {item.sub}
                </p>
                {item.internal ? (
                  <Link to={item.href} className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'bg-white/20 hover:bg-white/30 text-white border-0')}>
                    Check it out
                  </Link>
                ) : (
                  <a href={item.href} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'bg-white/20 hover:bg-white/30 text-white border-0')}>
                    Check it out
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3.5">More pages</p>
          <ul className="grid gap-2">
            {morePages.map(p => (
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
      </div>

      <footer className="w-full bg-muted text-muted-foreground text-center py-5 text-sm">
        萧远珊，2016
      </footer>
    </div>
  )
}
