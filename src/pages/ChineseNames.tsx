export default function ChineseNames() {
  return (
    <>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/chinese-names/style.css" />
      <style>{`body{margin:0}`}</style>

      <div className="content">
        <section className="hero">
          <h1 className="display-4 mb-4">A #WIP Guide to Chinese Names</h1>
          <p>
            Do you know <span className="pinyin">Zhang</span> is actually pronounced as "John"?{' '}
            <br />
            Here's a quick guide of how to read Mandarin names in{' '}
            <a href="https://en.wikipedia.org/wiki/Pinyin" target="_blank" rel="noreferrer">pinyin</a>.{' '}
            Yes, just names, not learning the language (yet)
          </p>
        </section>

        <section className="block general">
          <div className="col-main">
            <h2>General Rules 一般规则</h2>
            <div className="rule-card">
              <p className="bigger">It's an artificial phonetics system designed with <em>minimum redundancy</em></p>
              <ul>
                <li>There's a <strong>1-to-1 mapping</strong> of each sound and spelling. Aka if they're spelled differently, they sound different</li>
                <li>There are no silent letters</li>
              </ul>
            </div>
            <div className="rule-card">
              <p className="bigger">A name / last name usually breaks into 1-2 syllables of consonant + vowel.</p>
              <ul>
                <li>Consonant is optional. When used in English, tones (accents) are dropped.</li>
                <li>Here's <a href="https://chinese.yabla.com/chinese-pinyin-chart.php" target="_blank" rel="noreferrer">an exhaustive list</a> of all consonant/vowel pairs in Mandarin</li>
              </ul>
            </div>
            <div className="rule-card">
              <p className="bigger">It's the effort that counts!</p>
              <ul>
                <li>You may want to get the obvious ones right, like <span className="pinyin">Li</span> is not "Lie"</li>
                <li>Don't sweat too much about a sound that's foreign to English. Actually, <span className="pinyin">j,q,x</span> don't even exist in Cantonese.</li>
              </ul>
            </div>
          </div>
          <div className="col-side">
            <div className="side-card"><span className="pinyin">sh·ang h·ai</span></div>
          </div>
        </section>

        <section className="block vowels">
          <div className="col-main grid">
            <h2>Vowels 韵母</h2>
            <h3>Basic Vowels 单韵母</h3>
            <div className="set basic-vowels">
              {[['a','mama'],['o','what(?)'],['e','British her'],['i','amigo'],['u','Lucy'],['ü','German ü, French u']].map(([l,h])=>(
                <div key={l} className="letter-card"><div className="letter">{l}</div><div className="helper">{h}</div></div>
              ))}
            </div>
            <h3>Compound Vowels 复韵母</h3>
            <div className="set">
              {[['ai','said'],['ou','hope'],['ei','hey'],['ie','yet'],['ui','way'],['üe','ü + yet']].map(([l,h])=>(
                <div key={l} className="letter-card"><div className="letter">{l}</div><div className="helper">{h}</div></div>
              ))}
            </div>
            <div className="set">
              {[['ao','caught'],['er','her'],['iu','huge']].map(([l,h])=>(
                <div key={l} className="letter-card"><div className="letter">{l}</div><div className="helper">{h}</div></div>
              ))}
            </div>
            <div className="set">
              {[['an','man'],['en','agent'],['in','pin'],['un','u + en']].map(([l,h])=>(
                <div key={l} className="letter-card"><div className="letter">{l}</div><div className="helper">{h}</div></div>
              ))}
            </div>
            <div className="set">
              {[['ang','want'],['ong','own'],['eng','British turn'],['ing','pin but harder?']].map(([l,h])=>(
                <div key={l} className="letter-card"><div className="letter">{l}</div><div className="helper">{h}</div></div>
              ))}
            </div>
            <h3>Special Notes</h3>
            <div className="rule-card">
              <p className="bigger">In the digital age, <span className="pinyin">ü</span> is almost always written as u.</p>
              <ul>
                <li>When after <span className="pinyin">j,q,x</span> or in <span className="pinyin">ue</span>, u is actually pronounced <span className="pinyin">ü</span></li>
                <li>When paired with <span className="pinyin">l,n</span>, <span className="pinyin">Lü</span> is sometimes spelled <span className="pinyin">Lyu</span>, <span className="pinyin">Luu</span>, or <span className="pinyin">Lv</span>.</li>
              </ul>
            </div>
            <div className="rule-card">
              <p className="bigger">It's not always obvious where a syllable begins/ends</p>
              <ul><li>E.g. <span className="pinyin">Xi'an</span> vs. <span className="pinyin">Xian</span> — that's why you see the <span className="pinyin">'</span>.</li></ul>
            </div>
          </div>
          <div className="col-side"><div className="side-card" /></div>
        </section>

        <section className="block consonants">
          <div className="col-main">
            <h2>Consonants 声母</h2>
            <h3>No brainers</h3>
            <div className="set easy-consonants">
              {['b','p','m','f'].map(l=><div key={l} className="letter-card"><div className="letter">{l}</div></div>)}
            </div>
            <div className="set easy-consonants">
              {['d','t','n','l'].map(l=><div key={l} className="letter-card"><div className="letter">{l}</div></div>)}
            </div>
            <div className="set easy-consonants">
              {['g','k','h'].map(l=><div key={l} className="letter-card"><div className="letter">{l}</div></div>)}
            </div>
            <h3>A lil tricky</h3>
            <div className="set">
              {[['z','kids'],['c','bits'],['s','say'],['r','beige']].map(([l,h])=>(
                <div key={l} className="letter-card"><div className="letter">{l}</div><div className="helper">{h}</div></div>
              ))}
            </div>
            <div className="set">
              {[['zh','jar'],['ch','chat'],['sh','show']].map(([l,h])=>(
                <div key={l} className="letter-card"><div className="letter">{l}</div><div className="helper">{h}</div></div>
              ))}
            </div>
            <h3>The real challenge</h3>
            <div className="set">
              {[['j','jeee p?'],['q','cheese?'],['x','sheep?']].map(([l,h])=>(
                <div key={l} className="letter-card"><div className="letter">{l}</div><div className="helper">{h}</div></div>
              ))}
            </div>
            <h3>Semivowels</h3>
            <div className="set">
              <div className="letter-card"><div className="letter">y</div><div className="helper">i → yi, ü → yu</div></div>
              <div className="letter-card"><div className="letter">w</div><div className="helper">u → wu</div></div>
            </div>
            <h3>Special Notes</h3>
            <div className="rule-card">
              <p className="bigger">In <span className="pinyin">zi,ci,si,ri,zhi,chi,shi</span>, the <span className="pinyin">i</span> is only a <strong>placeholder</strong></p>
              <ul><li>The full syllable sounds exactly as if there are no vowels, but longer.</li></ul>
            </div>
            <div className="rule-card">
              <p className="bigger">You can't begin a syllable with <span className="pinyin">i, u, ü</span>. Use <span className="pinyin">yi, wu, yu</span> instead.</p>
              <ul><li>This doesn't change how they sound.</li></ul>
            </div>
          </div>
          <div className="col-side"><div className="side-card" /></div>
        </section>

        <section className="block notes">
          <div><strong>Notes</strong></div>
          <ul>
            <li>整体认读音节</li>
            <li>Other phonetic systems for Chinese</li>
          </ul>
        </section>

        <footer><a href="mailto:moiyunjie@gmail.com">@Yunjie Li</a>, 2020</footer>
      </div>
    </>
  )
}
