const flashcards = [
  'a-thousand-paper-cuts', 'move-mountains', 'sausage-making', 'take-this-offline',
  'its-a-stretch', 'vanilla-js', 'end-of-the-day', 'cross-to-bear', 'true-north',
  'in-the-weeds', 'wild-west', 'uphill-battle', 'my-beef', 'my-jam',
  'boil-the-ocean', 'wiggle-room', 'can-of-worms', 'fight-gravity',
]

export default function VanillaEnglish() {
  return (
    <>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" />
      <style>{`
        body { margin:0; background:#222; color:#fff; }
        .flashcard { transition: all 400ms ease-out; }
        .flashcard:hover { transform: scale(1.03); }
        footer { text-align:center; padding:20px; color:#999; font-size:13px; }
        footer a { color:#aaa; }
      `}</style>

      <div className="container-fluid bg-dark text-light text-center">
        <section className="container pt-4 pb-2">
          <h4 className="mt-2">🍦 Vanilla English</h4>
          <p className="text-muted mt-3">
            English idioms and slangs that make no sense! (They do.){' '}
            <br />
            For more, visit{' '}
            <a className="text-light" href="https://www.instagram.com/yunreader/" target="_blank" rel="noreferrer">
              @yunreader
            </a>, or add a phrase yourself to{' '}
            <a className="text-light" href="https://a-phrasebook.firebaseapp.com/" target="_blank" rel="noreferrer">
              this phrasebook
            </a>!
          </p>
        </section>
      </div>

      <div className="content">
        <section className="container mt-4">
          <div className="row justify-content-center">
            {flashcards.map(id => (
              <div key={id} className="flashcard col-12 col-md-6 col-lg-4">
                <img src={`/vanilla-english/flashcards/${id}.JPG`} alt={id} style={{ width:'100%' }} />
              </div>
            ))}
          </div>
        </section>
        <footer>
          <a href="mailto:moiyunjie@gmail.com">@Yunjie Li</a>, 2020
        </footer>
      </div>
    </>
  )
}
