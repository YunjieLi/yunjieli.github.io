import { Link } from 'react-router-dom'

const featured = [
  {
    bg: 'bg-nyc',
    title: 'Restaurants Noise of NYC',
    blogHref: 'https://blog.mapbox.com/exploring-nyc-open-data-with-3d-hexbins-5af2b7d8bc46',
    blogLabel: 'Mapbox Blog',
    sub: 'Visualizing NYC 311 Data in 3D',
    href: 'https://www.mapbox.com/bites/00304/',
  },
  {
    bg: 'bg-boston',
    title: 'Historical Boston',
    blogHref: 'https://blog.mapbox.com/mapping-historic-boston-in-the-mapbox-studio-dataset-editor-838c49209bd1',
    blogLabel: 'Mapbox Blog',
    sub: 'Mapping, Urban History',
    href: 'https://www.mapbox.com/bites/00287/',
  },
  {
    bg: 'bg-lush',
    title: 'Mono <> Colors',
    blogHref: 'https://blog.mapbox.com/mobile-runtime-styling-get-active-553b0c9aaa16',
    blogLabel: 'Mapbox Blog',
    sub: 'Map Design – Greenifying this world',
    href: 'https://www.mapbox.com/bites/00299/compare.html',
  },
  {
    bg: 'bg-heroes',
    title: 'Glorious Kings',
    blogHref: null,
    blogLabel: null,
    sub: '#自嗨 王者荣耀·英雄地图。',
    href: '/kings',
    internal: true,
  },
  {
    bg: 'bg-swordsmen',
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
    <>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
      <style>{`
        body { margin: 0; }
        .container { padding-top: 48px; padding-bottom: 60px; }
        .page-header img { height:54px; width:54px; }
        .page-header img, .page-header h1 { display: inline-block; vertical-align: bottom; }
        .page-header h1 { margin-left: 1rem; }
        .page-header p { margin-top: 1em; color:#666; }
        #footer { width:100%; background-color:#D1D9E0; color:#666; text-align:center; padding:20px; }
        .btn-primary { background-color:#333; border-color:rgba(0,0,0,.3); }
        .btn-primary:hover { background-color:#223; }
        .section-label { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#999; margin:0 0 14px 0; }
        .jumbotron { background-size:cover; background-image:linear-gradient(rgba(0,0,0,.65),rgba(0,0,0,.65)); color:white; border-radius:4px; margin-bottom:10px; padding:18px 24px; }
        .jumbotron h1 { font-size:22px; margin:0 0 6px 0; line-height:1.2; }
        .jumbotron p { font-size:13px; margin-bottom:10px; }
        .jumbotron a { color:white; opacity:.75; }
        .jumbotron .btn { padding:5px 14px; font-size:13px; }
        .bg-nyc     { background-image:url(/toc/img/jumbotron-nyc.png); }
        .bg-boston  { background-image:url(/toc/img/jumbotron-boston.png); }
        .bg-lush    { background-image:url(/toc/img/jumbotron-lush.png); }
        .bg-heroes  { background-image:url(/toc/img/jumbotron-heroes.png); }
        .bg-swordsmen { background-image:url(/toc/img/jumbotron-swordsmen.png); }
        .more-pages { margin-top:56px; margin-bottom:40px; }
        .more-pages-list { list-style:none; padding:0; margin:0; display:grid; gap:8px; }
        .more-pages-list li a { display:block; padding:12px 16px; border:1px solid #e0e0e0; border-radius:6px; color:#333; text-decoration:none; font-size:15px; transition:background 0.15s; }
        .more-pages-list li a:hover { background:#f5f5f5; }
      `}</style>

      <div className="container">
        <div className="page-header">
          <img src="/toc/img/icon_full.png" alt="logo" />
          <h1>顺流而上</h1>
          <p>用设计，用代码，用地图装故事。用故事装X。</p>
        </div>

        <p className="section-label">Featured</p>

        {featured.map(item => (
          <div key={item.title} className={`jumbotron ${item.bg}`}>
            <h1>{item.title}</h1>
            <p>
              {item.blogHref && (
                <><a href={item.blogHref} target="_blank" rel="noreferrer">{item.blogLabel}</a> · </>
              )}
              {item.sub}
            </p>
            <p>
              {item.internal ? (
                <Link className="btn btn-primary" to={item.href}>Check it out</Link>
              ) : (
                <a className="btn btn-primary" href={item.href} target="_blank" rel="noreferrer">Check it out</a>
              )}
            </p>
          </div>
        ))}

        <div className="more-pages">
          <p className="section-label">More pages</p>
          <ul className="more-pages-list">
            {morePages.map(p => (
              <li key={p.href}>
                <Link to={p.href}>{p.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div id="footer">萧远珊，2016</div>
    </>
  )
}
