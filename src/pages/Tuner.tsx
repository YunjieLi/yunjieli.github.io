import { useEffect, useRef } from 'react'

export default function Tuner() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const loaded: HTMLElement[] = []

    const addStyle = (href: string) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      document.head.appendChild(link)
      loaded.push(link)
    }

    const addScript = (src: string): Promise<void> =>
      new Promise(resolve => {
        const s = document.createElement('script')
        s.src = src
        s.onload = () => resolve()
        document.body.appendChild(s)
        loaded.push(s)
      })

    const init = async () => {
      addStyle('/tuner/style.css')
      await addScript('/tuner/aubio.js')
      await addScript('/tuner/notes.js')
      await addScript('/tuner/frequency-bars.js')
      await addScript('/tuner/tuner.js')
      await addScript('/tuner/app.js')
    }

    init()
    return () => loaded.forEach(el => el.parentNode?.removeChild(el))
  }, [])

  return (
    <>
      <style>{`html,body,#root{height:100%;margin:0;padding:0;}`}</style>
      <div ref={containerRef}>
        <div id="app">
          <div id="tuner">
            <div id="note-name"></div>
            <canvas id="frequency-bars"></canvas>
            <div id="cents-meter">
              <div id="cents-meter-bar"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
