import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import convert from 'heic-convert'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataSourceId = '40231dfe-b52f-8036-affe-000bfecff7d0'
const outputDataPath = path.join(root, 'src/pages/yard-sale-data.json')
const imageDirectory = path.join(root, 'public/yard-sale')
const token = process.env.NOTION_TOKEN

if (!token) throw new Error('Missing NOTION_TOKEN environment variable')

const headers = {
  Authorization: `Bearer ${token}`,
  'Notion-Version': '2025-09-03',
  'Content-Type': 'application/json',
}

async function queryAllRows() {
  const rows = []
  let cursor

  do {
    const response = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
    })
    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`Notion query failed (${response.status}): ${detail}`)
    }
    const result = await response.json()
    rows.push(...result.results)
    cursor = result.has_more ? result.next_cursor : undefined
  } while (cursor)

  return rows
}

function propertyText(property) {
  if (!property) return ''
  if (property.type === 'title' || property.type === 'rich_text') {
    return (property[property.type] ?? []).map((part) => part.plain_text ?? part.text?.content ?? '').join('')
  }
  if (property.type === 'number') return property.number == null ? '' : String(property.number)
  if (property.type === 'url') return property.url ?? ''
  if (property.type === 'select' || property.type === 'status') return property[property.type]?.name ?? ''
  if (property.type === 'unique_id') {
    const value = property.unique_id
    return value ? `${value.prefix ?? ''}${value.number}` : ''
  }
  return ''
}

function getItemId(properties) {
  const entry = Object.entries(properties).find(([name, property]) =>
    property.type === 'unique_id' || property.type === 'auto_increment_id' || name.toLowerCase() === 'id',
  )
  if (!entry) throw new Error('Could not find the database ID property')
  const property = entry[1]
  if (property.type === 'unique_id') return Number(property.unique_id.number)
  if (property.type === 'auto_increment_id') return Number(property.auto_increment_id?.number ?? property.number?.number)
  return Number(propertyText(property) || property.number?.number)
}

function imageUrl(file) {
  if (file.type === 'file') return file.file?.url
  if (file.type === 'external') return file.external?.url
  return undefined
}

function extensionFor(contentType, sourceUrl) {
  const extensionByType = {
    'image/avif': 'avif',
    'image/gif': 'gif',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  const mime = contentType?.split(';')[0]?.trim().toLowerCase()
  if (extensionByType[mime]) return extensionByType[mime]
  const ext = path.extname(new URL(sourceUrl).pathname).slice(1).toLowerCase()
  return ['avif', 'gif', 'heic', 'heif', 'jpg', 'jpeg', 'png', 'webp'].includes(ext) ? (ext === 'jpeg' ? 'jpg' : ext) : 'png'
}

function isHeic(contentType, sourceUrl) {
  const mime = contentType?.split(';')[0]?.trim().toLowerCase()
  const extension = path.extname(new URL(sourceUrl).pathname).toLowerCase()
  return mime === 'image/heic' || mime === 'image/heif' || extension === '.heic' || extension === '.heif'
}

const rows = await queryAllRows()
const items = []
const generatedImages = new Set()

await mkdir(imageDirectory, { recursive: true })

for (const row of rows) {
  const properties = row.properties ?? {}
  const id = getItemId(properties)
  if (!Number.isFinite(id)) throw new Error(`Invalid database ID on page ${row.id}`)
  const name = propertyText(properties.Name_CN)
  const photos = properties.Photos?.files ?? []
  const images = []

  for (let index = 0; index < photos.length; index += 1) {
    const sourceUrl = imageUrl(photos[index])
    if (!sourceUrl) continue
    const response = await fetch(sourceUrl)
    if (!response.ok) throw new Error(`Image download failed (${response.status}) for item #${id}`)
    const contentType = response.headers.get('content-type')
    const sourceBuffer = Buffer.from(await response.arrayBuffer())
    const heic = isHeic(contentType, sourceUrl)
    const extension = heic ? 'jpg' : extensionFor(contentType, sourceUrl)
    const filename = `item-${String(id).padStart(2, '0')}-${index + 1}.${extension}`
    const destination = path.join(imageDirectory, filename)
    const output = heic
      ? await convert({ buffer: sourceBuffer, format: 'JPEG', quality: 0.9 })
      : sourceBuffer
    await writeFile(destination, Buffer.from(output))
    generatedImages.add(filename)
    images.push({ src: `/yard-sale/${filename}`, alt: `${name} ${index + 1}` })
  }

  items.push({
    id,
    name,
    price: propertyText(properties.Price),
    status: propertyText(properties.Status) || 'Available',
    subtext: propertyText(properties.subtext),
    notes: propertyText(properties['.notes']),
    ...(propertyText(properties['Reference link']) ? { referenceUrl: propertyText(properties['Reference link']) } : {}),
    notionUrl: row.url,
    images,
  })
}

const previousFiles = await readdir(imageDirectory)
for (const filename of previousFiles) {
  if (/^item-\d+-\d+\.(avif|gif|heic|heif|jpe?g|png|webp)$/i.test(filename) && !generatedImages.has(filename)) {
    await rm(path.join(imageDirectory, filename))
  }
}

const data = { refreshedAt: new Date().toISOString(), items }
await writeFile(outputDataPath, `${JSON.stringify(data, null, 2)}\n`)
console.log(`Synced ${items.length} yard-sale records and ${generatedImages.size} photos from Notion.`)
