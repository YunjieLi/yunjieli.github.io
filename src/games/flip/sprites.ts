// a card face is either a photo tile or a glyph drawn as text
export type Sprite =
  | { kind: 'image'; id: string; file: string }
  | { kind: 'text'; id: string; text: string }

export type Level = {
  id: number
  title: string
  emoji: string
  stars: number
  backColor: string
  sprites: Sprite[]
  setSize: number   // how many pairs to pick per play
}

// every jpg in this folder, discovered at build time — no numbering assumptions
const files = Object.keys(import.meta.glob('./*.jpg'))
  .map(path => path.replace('./', '').replace(/\.jpg$/, ''))
  .sort()

function spritesFor(prefix: string): Sprite[] {
  return files
    .filter(name => name.startsWith(`${prefix}-`))
    .map(file => ({ kind: 'image' as const, id: file, file }))
}

// The three text levels are drawn as glyphs rather than photos: crisp at any card
// size, and one place to edit each set. Their colors are not fixed here — every
// deal paints the faces from a shuffled rainbow (see INKS in index.tsx).
const glyph = (text: string): Sprite => ({ kind: 'text', id: `glyph-${text}`, text })

// Letters is a reversal-and-rotation drill — b/d, p/q, N/И, 5/2, 6/9, 3/E.
// The И is Cyrillic I, a mirrored N.
const LETTER_SPRITES: Sprite[] = [...'a59632ESNИPjqpdb'].map(glyph)

// 汉字 pool — deliberately larger than a board, so every game deals a fresh hand.
// Add characters to the string to grow it.
const HAN_POOL = '日月一二三四五六七八九十风雨妈爸山水大小中上下左右'
const HANZI_SPRITES: Sprite[] = [...HAN_POOL].map(glyph)

// sight words — same deal: add to the list to grow it. Every word carries the same
// type size on the board, so keep them short; anything longer shrinks the whole set.
const WORD_POOL = [
  'cat', 'car', 'bed', 'hat', 'hot', 'dog', 'bad', 'stop', 'shop', 'cup',
  'sit', 'dad', 'mom', 'sun', 'boy', 'girl', 'baby', 'done', 'no', 'yes',
  'too', 'two', 'who', 'why', 'home', 'love', 'you', 'me',
  'he', 'she', 'I', 'mad', 'sad', 'pig', 'rat', 'run', 'shy', 'that',
  'this', 'we', 'how',
]
const WORD_SPRITES: Sprite[] = WORD_POOL.map(glyph)

export const LEVELS: Level[] = [
  { id: 1,  title: 'Summer',  emoji: '🌊', stars: 1, backColor: '#49D4B4', sprites: spritesFor('⭐️-summer'),            setSize: 4  },
  { id: 2,  title: 'Space',   emoji: '🚀', stars: 1, backColor: '#FFB575', sprites: spritesFor('⭐️-space'),             setSize: 4  },
  { id: 3,  title: 'Nature',  emoji: '🌿', stars: 2, backColor: '#49D4B4', sprites: spritesFor('⭐️⭐️-nature'),          setSize: 6  },
  { id: 4,  title: 'Party',   emoji: '🎉', stars: 2, backColor: '#F06AA6', sprites: spritesFor('⭐️⭐️-party'),           setSize: 6  },
  { id: 5,  title: 'Flags',   emoji: '🌏', stars: 3, backColor: '#F06AA6', sprites: spritesFor('⭐️⭐️⭐️-flags'),        setSize: 8  },
  { id: 6,  title: 'Food',    emoji: '🍜', stars: 3, backColor: '#FFB575', sprites: spritesFor('⭐️⭐️⭐️-food'),         setSize: 8  },
  { id: 7,  title: 'Hearts',  emoji: '💕', stars: 4, backColor: '#FF918F', sprites: spritesFor('⭐️⭐️⭐️⭐️-heart'),     setSize: 10 },
  { id: 8,  title: 'Yoga',    emoji: '🧘', stars: 4, backColor: '#A5A0D6', sprites: spritesFor('⭐️⭐️⭐️⭐️-yoga'),      setSize: 10 },
  { id: 9,  title: 'Zoo',     emoji: '🦁', stars: 5, backColor: '#FF918F', sprites: spritesFor('⭐️⭐️⭐️⭐️⭐️-zoo'),     setSize: 12 },
  { id: 10, title: 'Letters', emoji: '🔤', stars: 5, backColor: '#A5A0D6', sprites: LETTER_SPRITES, setSize: 12 },
  { id: 11, title: '汉字',    emoji: '🀄', stars: 5, backColor: '#49D4B4', sprites: HANZI_SPRITES,  setSize: 12 },
  { id: 12, title: 'Words',   emoji: '📖', stars: 5, backColor: '#FFB575', sprites: WORD_SPRITES,   setSize: 12 },
]
