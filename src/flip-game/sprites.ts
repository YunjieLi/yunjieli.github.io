export type Sprite = { id: string; cx: number; cy: number; cw: number; ch: number }

export type Level = {
  id: number
  title: string
  emoji: string
  sheet: string    // filename without .jpg, e.g. '1-1'
  sheetW: number
  sheetH: number
  cols: number     // grid columns (rows = sprites.length * 2 / cols)
  backColor: string
  sprites: Sprite[]
}

export const LEVELS: Level[] = [
  {
    id: 1, title: 'Summer', emoji: '🌊', sheet: '1-1',
    sheetW: 1017, sheetH: 549, cols: 4, backColor: '#FF6B9D',
    sprites: [
      { id: 'lemon',     cx: 100, cy: 101, cw:  90, ch: 158 },
      { id: 'icecream',  cx: 604, cy: 112, cw:  72, ch: 168 },
      { id: 'girl',      cx: 932, cy: 105, cw: 168, ch: 154 },
      { id: 'sun',       cx:  88, cy: 284, cw: 150, ch: 164 },
      { id: 'octopus',   cx: 761, cy: 289, cw: 202, ch: 158 },
      { id: 'pineapple', cx: 428, cy: 458, cw: 100, ch: 140 },
    ],
  },
  {
    id: 2, title: 'Space', emoji: '🚀', sheet: '1-2',
    sheetW: 1044, sheetH: 673, cols: 4, backColor: '#4158D0',
    sprites: [
      { id: 'astronaut', cx: 608, cy:  78, cw:  82, ch: 107 },
      { id: 'earth',     cx:  97, cy: 254, cw: 112, ch: 118 },
      { id: 'rocket',    cx: 264, cy: 597, cw: 108, ch: 118 },
      { id: 'saturn',    cx: 581, cy: 418, cw: 132, ch: 112 },
      { id: 'orangep',   cx: 722, cy: 418, cw: 118, ch: 115 },
      { id: 'bluep',     cx: 873, cy: 418, cw: 122, ch: 112 },
    ],
  },
  {
    id: 3, title: 'Food', emoji: '🍕', sheet: '2-1',
    sheetW: 1028, sheetH: 699, cols: 4, backColor: '#FF6B35',
    sprites: [
      { id: 'fries',    cx:  97, cy:  94, cw: 118, ch: 132 },
      { id: 'pizza',    cx: 546, cy:  92, cw: 148, ch: 128 },
      { id: 'taco',     cx: 756, cy:  93, cw: 152, ch: 125 },
      { id: 'pancakes', cx: 400, cy: 254, cw: 185, ch: 130 },
      { id: 'sushi',    cx: 779, cy: 253, cw: 168, ch: 132 },
      { id: 'onigiri',  cx:  72, cy: 427, cw: 178, ch: 116 },
      { id: 'ramen',    cx: 252, cy: 427, cw: 130, ch: 132 },
      { id: 'burger',   cx: 269, cy: 598, cw: 166, ch: 154 },
    ],
  },
  {
    id: 4, title: 'Garden', emoji: '🌻', sheet: '2-2',
    sheetW: 1041, sheetH: 566, cols: 4, backColor: '#3a9c3e',
    sprites: [
      { id: 'bee',      cx: 273, cy:  88, cw: 112, ch: 112 },
      { id: 'flower',   cx: 455, cy:  88, cw:  95, ch: 122 },
      { id: 'trowel',   cx: 628, cy:  87, cw:  60, ch: 122 },
      { id: 'globe',    cx: 279, cy: 263, cw: 112, ch: 120 },
      { id: 'plant',    cx: 965, cy: 263, cw: 104, ch: 130 },
      { id: 'leaf',     cx:  81, cy: 420, cw:  62, ch: 120 },
      { id: 'flowers2', cx: 779, cy: 420, cw: 105, ch: 120 },
      { id: 'mushroom', cx: 961, cy: 420, cw:  96, ch: 126 },
    ],
  },
  {
    id: 5, title: 'Birthday', emoji: '🎂', sheet: '2-3',
    sheetW: 1003, sheetH: 726, cols: 4, backColor: '#C850C0',
    sprites: [
      { id: 'koala',    cx: 196, cy: 100, cw: 112, ch: 120 },
      { id: 'gift',     cx: 392, cy:  99, cw: 120, ch: 120 },
      { id: 'cake',     cx: 580, cy:  99, cw: 145, ch: 118 },
      { id: 'girl',     cx: 415, cy: 277, cw: 118, ch: 142 },
      { id: 'balloons', cx: 570, cy: 451, cw: 108, ch: 136 },
      { id: 'lion',     cx: 907, cy: 452, cw: 100, ch: 112 },
      { id: 'sloth',    cx:  90, cy: 608, cw: 112, ch: 116 },
      { id: 'frog',     cx: 195, cy: 608, cw: 112, ch: 116 },
    ],
  },
  {
    id: 6, title: 'Monsters', emoji: '👾', sheet: '3-1',
    sheetW: 1044, sheetH: 696, cols: 4, backColor: '#7B1FA2',
    sprites: [
      { id: 'blue',     cx:  93, cy:  89, cw: 138, ch: 128 },
      { id: 'purple',   cx: 378, cy:  87, cw: 130, ch: 132 },
      { id: 'orange',   cx: 554, cy:  87, cw: 135, ch: 125 },
      { id: 'pink3',    cx: 920, cy:  88, cw: 145, ch: 130 },
      { id: 'pinktear', cx: 552, cy: 256, cw: 110, ch: 152 },
      { id: 'furry',    cx: 918, cy: 257, cw: 143, ch: 143 },
      { id: 'purple2',  cx:  84, cy: 426, cw: 145, ch: 120 },
      { id: 'green',    cx: 944, cy: 426, cw: 130, ch: 135 },
    ],
  },
  {
    id: 7, title: 'Yoga', emoji: '🧘', sheet: '3-2',
    sheetW: 1027, sheetH: 722, cols: 4, backColor: '#5C6BC0',
    sprites: [
      { id: 'warrior1', cx: 393, cy:  94, cw: 103, ch: 130 },
      { id: 'cobra',    cx: 529, cy:  94, cw: 145, ch:  88 },
      { id: 'squat',    cx: 668, cy:  93, cw:  92, ch: 132 },
      { id: 'sitting',  cx: 831, cy:  93, cw:  90, ch: 116 },
      { id: 'bridge',   cx:  87, cy: 266, cw: 130, ch: 130 },
      { id: 'curled',   cx: 950, cy: 266, cw: 115, ch: 120 },
      { id: 'warrior2', cx: 239, cy: 436, cw: 120, ch: 140 },
      { id: 'tree',     cx: 543, cy: 436, cw:  65, ch: 145 },
    ],
  },
  {
    id: 8, title: 'Hearts', emoji: '💕', sheet: '3-3',
    sheetW: 1024, sheetH: 852, cols: 4, backColor: '#E91E8C',
    sprites: [
      { id: 'pink',      cx: 105, cy:  88, cw: 145, ch: 145 },
      { id: 'bluechk',   cx: 275, cy:  88, cw: 140, ch: 145 },
      { id: 'yellow',    cx: 275, cy: 257, cw: 140, ch: 145 },
      { id: 'beige',     cx: 778, cy:  88, cw: 140, ch: 145 },
      { id: 'rainbow',   cx: 943, cy:  88, cw: 145, ch: 145 },
      { id: 'multiwave', cx: 948, cy: 257, cw: 135, ch: 135 },
      { id: 'green',     cx: 107, cy: 596, cw: 140, ch: 150 },
      { id: 'bluewave',  cx: 107, cy: 766, cw: 145, ch: 145 },
    ],
  },
  {
    id: 9, title: 'Animals', emoji: '🦁', sheet: '4-1',
    sheetW: 1044, sheetH: 1227, cols: 4, backColor: '#E65100',
    sprites: [
      { id: 'croc',    cx: 100, cy:  91, cw: 155, ch:  85 },
      { id: 'flamingo',cx: 437, cy:  91, cw:  90, ch: 147 },
      { id: 'sheep',   cx: 592, cy:  91, cw: 165, ch: 130 },
      { id: 'cow',     cx: 934, cy:  91, cw: 145, ch: 115 },
      { id: 'pig',     cx: 100, cy: 255, cw: 145, ch: 115 },
      { id: 'deer',    cx: 104, cy: 422, cw: 120, ch: 147 },
      { id: 'tiger',   cx: 447, cy: 569, cw: 145, ch: 110 },
      { id: 'fox',     cx: 115, cy: 737, cw: 140, ch: 130 },
    ],
  },
]
