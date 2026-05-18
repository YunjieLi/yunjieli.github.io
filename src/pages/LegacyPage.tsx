interface LegacyPageProps {
  src: string
  title?: string
}

export default function LegacyPage({ src, title = 'Page' }: LegacyPageProps) {
  return (
    <iframe
      src={src}
      title={title}
      style={{ width: '100%', height: '100vh', border: 'none', display: 'block' }}
    />
  )
}
