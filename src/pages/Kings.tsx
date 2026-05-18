import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = 'pk.eyJ1IjoieXVuamllbGkiLCJhIjoiY2lxdmV5MG5rMDAxNmZta3FlNGhyMmpicSJ9.CTEQgAyZGROcpJouZuzJyA'

interface Hero {
  id: number
  name: string
  href: string
  bg: string
  avatar: string
  fictious: string
  note: string
  time: string
  location: string
  lat: number
  lng: number
  gender: string
  description: string
  reference: string
}

const ERA_ORDER = ['上古','商周','春秋战国','希腊罗马','楚汉相争','汉','三国','南北朝','隋唐','元','幕府时代','虚空']
const BBOX_ALL: [[number,number],[number,number]] = [[-0.38, 23.11], [140.33, 51.53]]

const CATEGORY_CLASS: Record<string, string> = {
  '历史人物': 'history',
  '神话传说': 'legend',
  '艺术作品': 'art',
  '游戏虚构': 'original',
}

export default function Kings() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [heroes, setHeroes] = useState<Hero[]>([])
  const [modal, setModal] = useState<Hero | null>(null)
  const [activeEra, setActiveEra] = useState<string | null>(null)
  const [timelineOpen, setTimelineOpen] = useState(true)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = '/kings/heroes.js'
    script.onload = () => {
      setHeroes((window as unknown as Record<string, Hero[]>).heroes ?? [])
    }
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/yunjieli/cj8v6a1b2f0f62rnz9yh0373m',
      maxZoom: 10,
    })
    mapRef.current.fitBounds(BBOX_ALL, { padding: { top: 100, left: 30, right: 30, bottom: 60 } })
    return () => { mapRef.current?.remove(); mapRef.current = null }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || heroes.length === 0) return

    const onLoad = () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      const byLngLat = new Map<string, Hero[]>()
      heroes.forEach(hero => {
        const key = `${Math.round(hero.lng * 1e6) / 1e6},${Math.round(hero.lat * 1e6) / 1e6}`
        if (!byLngLat.has(key)) byLngLat.set(key, [])
        byLngLat.get(key)!.push(hero)
      })

      for (const [key, group] of byLngLat.entries()) {
        const [lng, lat] = key.split(',').map(Number)
        const el = document.createElement('div')
        el.className = 'avatar-container'

        group.forEach(hero => {
          const avatar = document.createElement('div')
          avatar.className = `avatar avatar-s border-${CATEGORY_CLASS[hero.fictious] || 'history'} h${hero.id}`
          avatar.style.backgroundImage = `url(https://game.gtimg.cn/images/yxzj/img201606/heroimg/${hero.id}/${hero.id}.jpg)`
          avatar.title = hero.name
          avatar.addEventListener('click', () => setModal(hero))
          el.appendChild(avatar)
        })

        const marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map)
        markersRef.current.push(marker)
      }

      map.on('zoom', () => {
        const z = map.getZoom()
        document.querySelectorAll('.avatar').forEach(el => {
          el.classList.toggle('avatar-s', z < 5)
        })
      })
    }

    if (map.loaded()) onLoad()
    else map.on('load', onLoad)
  }, [heroes])

  useEffect(() => {
    const map = mapRef.current
    if (!map || heroes.length === 0) return

    const active = document.querySelectorAll<HTMLElement>('.avatar')
    if (!activeEra) {
      active.forEach(el => { el.style.display = '' })
      map.fitBounds(BBOX_ALL, { padding: { top: 100, left: 30, right: 30, bottom: 60 } })
    } else {
      const live = heroes.filter(h => h.time === activeEra)
      const ids = new Set(live.map(h => h.id))
      document.querySelectorAll<HTMLElement>('.avatar').forEach(el => {
        const id = Array.from(el.classList).find(c => c.startsWith('h'))?.slice(1)
        el.style.display = id && ids.has(Number(id)) ? '' : 'none'
      })
      if (live.length > 0) {
        const lngs = live.map(h => h.lng), lats = live.map(h => h.lat)
        map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: { top: 100, left: 30, right: 30, bottom: 60 } })
      }
    }
  }, [activeEra, heroes])

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      <style>{`
        html,body,#root { height:100%; margin:0; padding:0; }
        .avatar-container { display:flex; flex-wrap:wrap; gap:2px; }
        .avatar { width:32px; height:32px; border-radius:50%; background-size:cover; cursor:pointer; border:2px solid #ccc; transition:transform .2s; }
        .avatar:hover { transform:scale(1.2); z-index:10; }
        .avatar-s { width:20px; height:20px; }
        .border-history { border-color:#e74c3c; }
        .border-legend  { border-color:#9b59b6; }
        .border-art     { border-color:#3498db; }
        .border-original{ border-color:#2ecc71; }
        .overlay { position:absolute; z-index:10; background:rgba(0,0,0,.7); color:#fff; border-radius:4px; }
        .timeline { top:10px; left:10px; padding:8px 12px; min-width:100px; }
        .time-header { font-size:11px; color:#aaa; margin-bottom:6px; text-transform:uppercase; }
        .time { padding:4px 8px; cursor:pointer; font-size:13px; border-radius:3px; }
        .time:hover { background:rgba(255,255,255,.15); }
        .time.active { background:rgba(255,255,255,.25); font-weight:bold; }
        .legend { bottom:30px; left:10px; padding:8px 12px; font-size:12px; display:flex; flex-direction:column; gap:6px; }
        .bucket { display:flex; align-items:center; gap:6px; }
        .circle { width:12px; height:12px; border-radius:50%; }
        .color-history { background:#e74c3c; }
        .color-legend  { background:#9b59b6; }
        .color-art     { background:#3498db; }
        .color-original{ background:#2ecc71; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:100; display:flex; align-items:center; justify-content:center; }
        .modal-box { background:rgba(0,0,0,.8); color:#fff; padding:24px; border-radius:8px; max-width:360px; width:90%; }
        .modal-box h2 { margin:0 0 8px; font-size:22px; }
        .modal-box p { margin:6px 0; font-size:14px; color:#ccc; }
        .modal-box a { color:#aef; }
      `}</style>

      <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

        <div className="overlay timeline">
          <div className="time-header">按时代</div>
          {timelineOpen && ERA_ORDER.map(era => (
            <div
              key={era}
              className={`time ${activeEra === era ? 'active' : ''}`}
              onClick={() => setActiveEra(activeEra === era ? null : era)}
            >{era}</div>
          ))}
          <div
            style={{ cursor:'pointer', fontSize:12, color:'#aaa', marginTop:4, textAlign:'center' }}
            onClick={() => setTimelineOpen(o => !o)}
          >{timelineOpen ? '▲' : '▶'}</div>
        </div>

        <div className="overlay legend">
          {[['color-history','历史人物'],['color-legend','神话传说'],['color-art','文艺作品'],['color-original','游戏虚构']].map(([cls,label])=>(
            <div key={cls} className="bucket">
              <div className={`circle ${cls}`} />
              {label}
            </div>
          ))}
        </div>

        {modal && (
          <div className="modal-overlay" onClick={() => setModal(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h2>{modal.name}</h2>
              <p>{modal.description}</p>
              <p><span style={{color:'#888'}}>时代：</span>{modal.time}</p>
              <p><span style={{color:'#888'}}>地点：</span>{modal.location}</p>
              <p><a href={modal.href} target="_blank" rel="noreferrer">Learn more →</a></p>
              <button onClick={() => setModal(null)} style={{marginTop:12, cursor:'pointer', background:'#333', color:'#fff', border:'none', padding:'6px 16px', borderRadius:4}}>Close</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
