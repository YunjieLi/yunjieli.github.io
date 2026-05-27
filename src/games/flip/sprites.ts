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

function range(prefix: string, count: number): Sprite[] {
  return Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, '0')
    const file = `${prefix}-${n}`
    return { id: file, file }
  })
}

export const LEVELS: Level[] = [
  { id: 1, title: 'Summer',   emoji: '🌊', stars: 1, backColor: '#F4845F', sprites: range('⭐️-summer',          6),  setSize: 4  },
  { id: 2, title: 'Space',    emoji: '🚀', stars: 1, backColor: '#4158D0', sprites: range('⭐️-space',           6),  setSize: 4  },
  { id: 3, title: 'Food',     emoji: '🍜', stars: 2, backColor: '#E07B39', sprites: range('⭐️⭐️-food',          8),  setSize: 6  },
  { id: 4, title: 'Nature',   emoji: '🌿', stars: 2, backColor: '#3D8B37', sprites: range('⭐️⭐️-nature',        8),  setSize: 6  },
  { id: 5, title: 'Party',    emoji: '🎉', stars: 2, backColor: '#B044A0', sprites: range('⭐️⭐️-party',         8),  setSize: 6  },
  { id: 6, title: 'Hearts',   emoji: '💕', stars: 3, backColor: '#D62E6C', sprites: range('⭐️⭐️⭐️-heart',      10), setSize: 8  },
  { id: 7, title: 'Yoga',     emoji: '🧘', stars: 3, backColor: '#5C6BC0', sprites: range('⭐️⭐️⭐️-yoga',        8), setSize: 8  },
  { id: 8, title: 'Monsters', emoji: '👾', stars: 3, backColor: '#7B1FA2', sprites: range('⭐️⭐️⭐️-monster',    12), setSize: 8  },
  { id: 9, title: 'Zoo',      emoji: '🦁', stars: 4, backColor: '#BF5F00', sprites: range('⭐️⭐️⭐️⭐️-zoo',     16), setSize: 10 },
]
