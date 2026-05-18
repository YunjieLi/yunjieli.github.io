import { useState } from 'react'

const COLORS = ['#E74C3C', '#3498DB', '#2ECC71']

export default function PressHere() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div style={{ display:'flex', height:'100vh', gap:0 }}>
      {COLORS.map((color, i) => (
        <div
          key={color}
          onClick={() => setActive(active === i ? null : i)}
          style={{
            flex: active === i ? 3 : 1,
            background: color,
            cursor: 'pointer',
            transition: 'flex 0.4s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      ))}
    </div>
  )
}
