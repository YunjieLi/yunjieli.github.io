import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { Link } from 'react-router-dom'

function makeRadialLine(i: number, angles: number[]) {
  return d3
    .radialLine<number>()
    .curve(d3.curveLinearClosed)
    .angle(a => a)
    .radius(a => {
      const t = d3.now() / 1000
      return 200 + Math.cos(a * 8 - i * 2 * Math.PI / 3 + t) *
        Math.pow((1 + Math.cos(a - t)) / 2, 3) * 32
    })(angles) as string
}

export default function Home() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    const width = +svg.attr('width')
    const height = +svg.attr('height')
    const angles = d3.range(0, 2 * Math.PI, Math.PI / 200)
    const colors = ['#EDBA29', '#CA6C2F', '#fff']

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)
      .attr('fill', 'none')
      .attr('stroke-width', 10)
      .attr('stroke-linejoin', 'round')

    const paths = colors.map((color, i) =>
      g.append('path').attr('stroke', color).style('mix-blend-mode', 'darken')
        .attr('d', makeRadialLine(i, angles))
    )

    const timer = d3.timer(() => {
      paths.forEach((p, i) => p.attr('d', makeRadialLine(i, angles)))
    })

    return () => {
      timer.stop()
      svg.selectAll('*').remove()
    }
  }, [])

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Link
        to="/toc"
        style={{ position: 'fixed', top: 16, right: 20, fontSize: 24, textDecoration: 'none', cursor: 'pointer', zIndex: 10 }}
      >
        📖
      </Link>
      <svg ref={svgRef} width="500" height="500" />
    </div>
  )
}
