import { useState } from 'react'
import './YardSale.css'

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

const items: YardSaleItem[] = [
  {
    "id": 1,
    "name": "茶几",
    "price": "$20",
    "status": "Available",
    "subtext": "24x48 inch",
    "notes": "",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f8012ae6ffd5f13c839d1",
    "images": [
      {
        "src": "/yard-sale/item-01-1.jpg",
        "alt": "茶几 1"
      }
    ]
  },
  {
    "id": 2,
    "name": "屏风",
    "price": "$5",
    "status": "Available",
    "subtext": "微瑕",
    "notes": "",
    "referenceUrl": "https://www.amazon.com/dp/B00A7YV51C?ref_=ppx_hzsearch_conn_dt_b_fed_asin_title_2",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f80f39d26da6898e123d5",
    "images": [
      {
        "src": "/yard-sale/item-02-1.jpg",
        "alt": "屏风 1"
      },
      {
        "src": "/yard-sale/item-02-2.jpg",
        "alt": "屏风 2"
      },
      {
        "src": "/yard-sale/item-02-3.jpg",
        "alt": "屏风 3"
      }
    ]
  },
  {
    "id": 3,
    "name": "宜家床头板",
    "price": "$30",
    "status": "Available",
    "subtext": "Nordli - Queen",
    "notes": "",
    "referenceUrl": "https://www.ikea.com/us/en/p/nordli-headboard-white-90372760/#content",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f803abbe0f9bc9cdaaa72",
    "images": [
      {
        "src": "/yard-sale/item-03-1.jpg",
        "alt": "宜家床头板 1"
      }
    ]
  },
  {
    "id": 4,
    "name": "吉他",
    "price": "$150",
    "status": "Available",
    "subtext": "Yamaha FG700S",
    "notes": "",
    "referenceUrl": "https://reverb.com/p/yamaha-fg700s-acoustic-folk-guitar",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f807eb671d371b26bc2e1",
    "images": [
      {
        "src": "/yard-sale/item-04-1.jpg",
        "alt": "吉他 1"
      },
      {
        "src": "/yard-sale/item-04-2.jpg",
        "alt": "吉他 2"
      }
    ]
  },
  {
    "id": 5,
    "name": "楔形枕",
    "price": "$10",
    "status": "Available",
    "subtext": "",
    "notes": "",
    "referenceUrl": "https://www.ebay.com/itm/224821727628",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f8075b900ea402fef0aba",
    "images": [
      {
        "src": "/yard-sale/item-05-1.jpg",
        "alt": "楔形枕 1"
      },
      {
        "src": "/yard-sale/item-05-2.jpg",
        "alt": "楔形枕 2"
      }
    ]
  },
  {
    "id": 6,
    "name": "长条枕",
    "price": "",
    "status": "Available",
    "subtext": "bed rail pillow",
    "notes": "",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f806cb90bdd750474fe86",
    "images": [
      {
        "src": "/yard-sale/item-06-1.jpg",
        "alt": "长条枕 bed rail pillow 1"
      }
    ]
  },
  {
    "id": 7,
    "name": "按摩靠垫",
    "price": "",
    "status": "Available",
    "subtext": "",
    "notes": "",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f80ad8518d0a879befbb9",
    "images": [
      {
        "src": "/yard-sale/item-07-1.jpg",
        "alt": "按摩靠垫 1"
      }
    ]
  },
  {
    "id": 8,
    "name": "通风扇x2",
    "price": "$10 each",
    "status": "Available",
    "subtext": "",
    "notes": "",
    "referenceUrl": "https://www.amazon.com/gp/aw/d/B004TAYQXE?psc=1&ref=ppx_pop_mob_b_asin_title&th=1",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f80ac90f8c4492bfbb90d",
    "images": [
      {
        "src": "/yard-sale/item-08-1.jpg",
        "alt": "通风扇x2 1"
      },
      {
        "src": "/yard-sale/item-08-2.jpg",
        "alt": "通风扇x2 2"
      }
    ]
  },
  {
    "id": 9,
    "name": "气垫床",
    "price": "$15",
    "status": "Available",
    "subtext": "",
    "notes": "",
    "referenceUrl": "https://www.amazon.com/gp/aw/d/B01J1KVR42?psc=1&ref=ppx_pop_mob_b_asin_title",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f800a959df829ef481f2f",
    "images": [
      {
        "src": "/yard-sale/item-09-1.jpg",
        "alt": "气垫床 1"
      },
      {
        "src": "/yard-sale/item-09-2.jpg",
        "alt": "气垫床 2"
      }
    ]
  },
  {
    "id": 10,
    "name": "游戏耳机",
    "price": "$40",
    "status": "Available",
    "subtext": "Sennheiser G4ME Zero",
    "notes": "",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f8069ac99ff033776520e",
    "images": [
      {
        "src": "/yard-sale/item-10-1.jpg",
        "alt": "游戏耳机 1"
      }
    ]
  },
  {
    "id": 11,
    "name": "健身轮",
    "price": "$5",
    "status": "Available",
    "subtext": "",
    "notes": "",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f80b1bb47c8ca23c15ff3",
    "images": [
      {
        "src": "/yard-sale/item-11-1.png",
        "alt": "健身轮 1"
      }
    ]
  },
  {
    "id": 12,
    "name": "书架x2",
    "price": "",
    "status": "Available",
    "subtext": "需要钉墙上",
    "notes": "",
    "referenceUrl": "https://www.walmart.com/ip/Costway-5-Tier-Ladder-Shelf-Bamboo-Bookshelf-Wall-Leaning-Storage-Display-Plant-Stand/920054457",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f80b7b66cc15c70f998c3",
    "images": [
      {
        "src": "/yard-sale/item-12-1.jpg",
        "alt": "书架x2 1"
      }
    ]
  },
  {
    "id": 13,
    "name": "电视 1",
    "price": "$300",
    "status": "Available",
    "subtext": "",
    "notes": "",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f8028a6f8c8c1a4f670d0",
    "images": []
  },
  {
    "id": 14,
    "name": "电视 2",
    "price": "$30",
    "status": "Available",
    "subtext": "",
    "notes": "",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f80f799c7e632a1698231",
    "images": []
  },
  {
    "id": 15,
    "name": "显示器 1",
    "price": "$30",
    "status": "Available",
    "subtext": "",
    "notes": "",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f804182e5f5e6a4e0be8e",
    "images": []
  },
  {
    "id": 16,
    "name": "显示器 2",
    "price": "$30",
    "status": "Available",
    "subtext": "",
    "notes": "",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f806f96fff5b82587a8d7",
    "images": []
  },
  {
    "id": 17,
    "name": "显示器 3",
    "price": "$30",
    "status": "Available",
    "subtext": "",
    "notes": "",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f80c0bdf7f838017d2b7d",
    "images": []
  },
  {
    "id": 18,
    "name": "显示器 4",
    "price": "$30",
    "status": "Available",
    "subtext": "",
    "notes": "",
    "notionUrl": "https://app.notion.com/p/40231dfeb52f809188a5e8688212042d",
    "images": []
  }
]

const refreshedOn = 'October 23, 2026'

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
          <h2 style={{ fontSize: 23, fontWeight: 500, margin: 0 }}>{item.id} {item.name}</h2>
          {item.price && <span style={{ fontSize: 23, fontWeight: 500, whiteSpace: 'nowrap' }}>{item.price}</span>}
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
        <header style={{ margin: '0 0 18px' }}><h1 style={{ fontWeight: 500, fontSize: 'clamp(25px, 4vw, 34px)', letterSpacing: '-.035em', margin: 0 }}>Yard sale 95014</h1></header>
        <section className="yard-sale-grid" aria-label="Items for sale">
          {items.filter(item => item.status === 'Available').map(item => <ItemCard key={item.notionUrl} item={item} />)}
        </section>
        <footer style={{ color: '#898578', fontSize: 11, marginTop: 18 }}>Last refreshed {refreshedOn}</footer>
      </div>
    </main>
  )
}
