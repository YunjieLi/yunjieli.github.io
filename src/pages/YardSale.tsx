import { useState } from 'react'
import './YardSale.css'
import yardSaleData from './yard-sale-data.json'

type YardSaleItem = {
  id: number
  name: string
  price: string
  status: string
  subtext: string
  notes: string
  referenceUrl?: string
  notionUrl: string
  images: { src: string; alt: string }[]
}

const items: YardSaleItem[] = yardSaleData.items
const refreshedOn = new Date(yardSaleData.refreshedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Los_Angeles' })

function referenceLabel(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    return hostname.startsWith('amazon.') ? 'amazon' : hostname
  } catch {
    return 'link'
  }
}

function statusColors(status: string) {
  if (status === 'Available') return { background: '#e6f3e9', color: '#285b38' }
  if (status === 'On hold') return { background: '#fff0d4', color: '#795214' }
  if (status === 'Sold') return { background: '#ecebe7', color: '#5c5a53' }
  return { background: '#ecebe7', color: '#5c5a53' }
}

function ItemCard({ item }: { item: YardSaleItem }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const cover = item.images[selectedImage]
  const details = [item.subtext, item.notes].filter(Boolean).join(' · ')

  return (
    <article className="yard-sale-card" style={{ background: '#fffefa', border: '1px solid #e6e1d6', borderRadius: 12, overflow: 'hidden' }}>
      {cover && (
        <div style={{ position: 'relative' }}>
          <img src={cover.src} alt={cover.alt} style={{ display: 'block', width: '100%', height: 'auto' }} />
          <span aria-label={item.status} style={{ ...statusColors(item.status), position: 'absolute', right: 10, bottom: 10, padding: '5px 9px', borderRadius: 999, fontSize: 12, fontWeight: 600, lineHeight: 1.2, boxShadow: '0 1px 5px #0002' }}>{item.status}</span>
        </div>
      )}
      {item.images.length > 1 && (
        <div aria-label={'More photos of ' + item.name} style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '9px 12px 0', WebkitOverflowScrolling: 'touch' }}>
          {item.images.map((image, index) => (
            <button key={image.src} type="button" aria-label={'Show photo ' + (index + 1) + ' of ' + item.name} aria-pressed={selectedImage === index} onClick={() => setSelectedImage(index)} style={{ flex: '0 0 58px', width: 58, height: 48, padding: 0, border: selectedImage === index ? '2px solid #4f765a' : '1px solid #e6e1d6', borderRadius: 6, overflow: 'hidden', background: 'transparent', cursor: 'pointer' }}>
              <img src={image.src} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
      <div style={{ padding: '12px 15px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
          <h2 style={{ fontSize: 23, fontWeight: 500, margin: 0 }}>#{item.id} {item.name}</h2>
          {item.price && <span style={{ color: '#55765c', fontSize: 23, fontWeight: 700, whiteSpace: 'nowrap' }}>{item.price}</span>}
        </div>
        {(details || item.referenceUrl) && (
          <p style={{ color: '#737165', fontSize: 13, margin: '7px 0 0' }}>
            {details}
            {details && item.referenceUrl && ' · '}
            {item.referenceUrl && <a href={item.referenceUrl} target="_blank" rel="noreferrer" style={{ color: '#4f765a', textUnderlineOffset: 3 }}>{referenceLabel(item.referenceUrl)} ↗</a>}
          </p>
        )}
      </div>
    </article>
  )
}

export default function YardSale() {
  return (
    <main style={{ minHeight: '100vh', background: '#f7f4ee', color: '#25251f', padding: 'clamp(14px, 4vw, 24px) clamp(12px, 4vw, 20px)', fontFamily: 'var(--font-sans), sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <header style={{ margin: '0 0 18px' }}><h1 style={{ fontWeight: 500, fontSize: 'clamp(25px, 4vw, 34px)', letterSpacing: '-.035em', margin: 0 }}>Yard sale 📍95014</h1></header>
        <section className="yard-sale-grid" aria-label="Items for sale">
          {items.filter(item => item.status.trim().toLowerCase() !== 'unavailable').map(item => <ItemCard key={item.notionUrl} item={item} />)}
        </section>
        <footer style={{ color: '#898578', fontSize: 11, marginTop: 18 }}>Last refreshed {refreshedOn}</footer>
      </div>
    </main>
  )
}
