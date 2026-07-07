export type Sprite = { id: string; file: string }

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
    .map(file => ({ id: file, file }))
}

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
  { id: 10, title: 'Letters', emoji: '🔤', stars: 5, backColor: '#A5A0D6', sprites: spritesFor('⭐️⭐️⭐️⭐️⭐️-letters'), setSize: 12 },
]
