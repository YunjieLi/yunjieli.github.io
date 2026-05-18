const flashcards = [
  'a-thousand-paper-cuts', 'move-mountains', 'sausage-making', 'take-this-offline',
  'its-a-stretch', 'vanilla-js', 'end-of-the-day', 'cross-to-bear', 'true-north',
  'in-the-weeds', 'wild-west', 'uphill-battle', 'my-beef', 'my-jam',
  'boil-the-ocean', 'wiggle-room', 'can-of-worms', 'fight-gravity',
]

export default function VanillaEnglish() {
  return (
    <div className="min-h-screen bg-[#222] text-white flex flex-col">
      <div className="text-center px-4 pt-8 pb-6">
        <h4 className="text-lg font-semibold">🍦 Vanilla English</h4>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">
          English idioms and slangs that make no sense! (They do.)
          <br />
          For more, visit{' '}
          <a className="text-gray-300 underline" href="https://www.instagram.com/yunreader/" target="_blank" rel="noreferrer">
            @yunreader
          </a>, or add a phrase yourself to{' '}
          <a className="text-gray-300 underline" href="https://a-phrasebook.firebaseapp.com/" target="_blank" rel="noreferrer">
            this phrasebook
          </a>!
        </p>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 mt-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcards.map(id => (
            <div key={id} className="transition-transform duration-400 ease-out hover:scale-[1.03]">
              <img src={`/vanilla-english/flashcards/${id}.JPG`} alt={id} className="w-full" />
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center py-5 text-[13px] text-gray-500">
        <a className="text-gray-400" href="mailto:moiyunjie@gmail.com">@Yunjie Li</a>, 2020
      </footer>
    </div>
  )
}
