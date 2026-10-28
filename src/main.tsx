import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { loveConfig } from './config'
import { scenery, type SceneryImage } from './data/scenery'

type Chapter = { id: string; number: string; title: string }
const chapters: Chapter[] = [
  { id: 'prologue', number: 'I', title: 'Пролог' },
  { id: 'castle', number: 'II', title: 'Моё сердце и мой замок' },
  { id: 'letter', number: 'III', title: 'Письмо для тебя' },
  { id: 'garden', number: 'IV', title: 'Сад тысячи роз' },
  { id: 'world', number: 'V', title: 'Наш маленький мир' },
  { id: 'cat', number: 'VI', title: 'Маленький хранитель' },
  { id: 'treasure', number: 'VII', title: 'Тайное сокровище' },
  { id: 'moon', number: 'VIII', title: 'Под одной луной' },
  { id: 'epilogue', number: 'IX', title: 'Эпилог' },
]
const roseNotes = [
  'Ты делаешь мой мир светлее.', 'Твоя улыбка — одно из моих любимых чудес.',
  'Я рад, что однажды наши пути пересеклись.', 'Даже маленькое сообщение от тебя может сделать мой день лучше.',
  'Ты дорога мне гораздо больше, чем могут выразить слова.', 'Если бы нежность была магией, в тебе её было бы бесконечно много.',
  'Ты — прекрасная часть моей жизни.', 'Я надеюсь, что впереди нас ждёт ещё много тёплых воспоминаний.',
]
const catNotes = [
  'Мяу. Королева прекрасна. Это не обсуждается.', 'Ваш рыцарь снова думает о вас. Он уже третий раз забыл, зачем пришёл.',
  'Королевское объявление: вашей улыбке присвоен титул национального сокровища!', 'Я охраняю королевство. А ваше сердечко, кажется, уже охраняет один влюблённый рыцарь.',
  'Мяу. Я бы подарил вам тысячу рыбок. Но рыцарь сказал, что у нас ограниченный бюджет.', 'Срочные новости: вы опять невероятно милая!',
  'Я проверил все замки. Самое уютное место — рядом с любимым человеком.', 'Ваш рыцарь храбрый, честный и совершенно беззащитный перед вашей улыбкой.',
  'Мяу! Приказываю вам сегодня хотя бы немного улыбнуться.', 'Я хотел сказать что-нибудь мудрое, но увидел рыбку. Простите.',
]

function Ornament({ className = '' }: { className?: string }) { return <span className={`ornament ${className}`} aria-hidden="true">✦</span> }
function CastleArt() { return <div className="castle-art" aria-label="Иллюстрация замка"><div className="moon-disc" /><div className="castle-tower tower-a"><i /><b /></div><div className="castle-tower tower-b"><i /><b /></div><div className="castle-wall"><span /><span /><span /><span /><em /></div><div className="hill" /><div className="rose-vine" /></div> }
function KnightArt() { return <div className="knight-art" aria-hidden="true"><div className="knight-head" /><div className="knight-body" /><div className="knight-cape" /><div className="knight-sword" /><div className="knight-rose">❦</div></div> }
function MoonArt() { return <div className="moon-art" aria-hidden="true"><div className="big-moon" /><div className="star-field">✦　·　✧　·　✦<br />　·　✦　·　✧</div><div className="distant-hills left" /><div className="distant-hills right" /><div className="gold-path" /></div> }
function ScenicImage({ image, className = '', loading = 'lazy' }: { image: SceneryImage; className?: string; loading?: 'eager' | 'lazy' }) {
  const [failed, setFailed] = useState(false)
  return <figure className={`scenic-image ${className} ${failed ? 'image-fallback' : ''}`}>
    {!failed && <img src={image.src} alt={image.alt} loading={loading} onError={() => setFailed(true)} />}
    <figcaption><a href={image.source} target="_blank" rel="noreferrer">{image.credit}</a> · {image.license}</figcaption>
  </figure>
}

type YouTubePlayer = {
  playVideo: () => void
  pauseVideo: () => void
  mute: () => void
  unMute: () => void
  destroy: () => void
}

type YouTubeApi = {
  Player: new (
    element: HTMLDivElement,
    options: {
      videoId: string
      playerVars: Record<string, number | string>
      events: {
        onReady: () => void
        onStateChange: (event: { data: number }) => void
        onError: () => void
      }
    },
  ) => YouTubePlayer
}

declare global {
  interface Window {
    YT?: YouTubeApi
    onYouTubeIframeAPIReady?: () => void
  }
}

let youTubeApiPromise: Promise<YouTubeApi> | null = null

function loadYouTubeApi(): Promise<YouTubeApi> {
  const existingApi = window.YT
  if (existingApi?.Player) return Promise.resolve(existingApi)
  if (youTubeApiPromise) return youTubeApiPromise

  youTubeApiPromise = new Promise((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.()
      if (window.YT?.Player) resolve(window.YT)
      else reject(new Error('The YouTube player API did not initialize.'))
    }

    const script = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]')
    if (script) {
      script.addEventListener('error', () => reject(new Error('The YouTube player API could not be loaded.')), { once: true })
      return
    }

    const newScript = document.createElement('script')
    newScript.src = 'https://www.youtube.com/iframe_api'
    newScript.async = true
    newScript.onerror = () => reject(new Error('The YouTube player API could not be loaded.'))
    document.head.appendChild(newScript)
  })

  return youTubeApiPromise
}

function MusicPlayer() {
  const playerContainer = useRef<HTMLDivElement>(null)
  const player = useRef<YouTubePlayer | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    let instance: YouTubePlayer | undefined

    loadYouTubeApi().then(api => {
      if (cancelled || !playerContainer.current) return
      instance = new api.Player(playerContainer.current, {
        videoId: loveConfig.music.videoId,
        playerVars: {
          controls: 0,
          loop: 1,
          playlist: loveConfig.music.videoId,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: () => { if (!cancelled) setReady(true) },
          onStateChange: ({ data }) => { if (!cancelled) setPlaying(data === 1) },
          onError: () => {
            if (!cancelled) {
              setFailed(true)
              setPlaying(false)
              setReady(false)
            }
          },
        },
      })
      player.current = instance
    }).catch((error: unknown) => {
      if (cancelled) return
      console.error('Unable to initialize the YouTube music player.', error)
      setFailed(true)
    })

    return () => {
      cancelled = true
      instance?.destroy()
      player.current = null
    }
  }, [])

  const togglePlayback = () => {
    if (!ready || !player.current) return
    if (playing) player.current.pauseVideo()
    else player.current.playVideo()
  }

  const toggleMute = () => {
    if (!ready || !player.current) return
    if (muted) player.current.unMute()
    else player.current.mute()
    setMuted(!muted)
  }

  return <div className={`music-player ${failed ? 'music-failed' : ''}`}>
    <div className="music-player-video" ref={playerContainer} aria-hidden="true" />
    <span className={`music-note ${playing ? 'is-playing' : ''}`} aria-hidden="true">♫</span>
    <div><b>{loveConfig.music.title}</b><small aria-live="polite">{failed ? 'Музыка недоступна' : playing ? 'Сейчас играет' : ready ? 'Нажми ▶, чтобы включить' : 'Загрузка плеера…'}</small></div>
    <button type="button" disabled={!ready || failed} onClick={togglePlayback} aria-label={playing ? 'Поставить музыку на паузу' : 'Включить музыку'}>{playing ? 'Ⅱ' : '▶'}</button>
    <button type="button" disabled={!ready || failed} onClick={toggleMute} aria-label={muted ? 'Включить звук' : 'Выключить звук'}>{muted ? '♧' : '◌'}</button>
    {failed && <a className="music-source" href={`https://www.youtube.com/watch?v=${loveConfig.music.videoId}`} target="_blank" rel="noreferrer">Открыть на YouTube</a>}
  </div>
}
function SectionTitle({ kicker, title, subtitle }: { kicker: string; title: string; subtitle?: string }) { return <header className="section-heading"><span className="kicker"><Ornament /> {kicker}</span><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</header> }
function ChapterNav({ active }: { active: string }) { return <nav className="chapter-nav" aria-label="Навигация по главам">{chapters.map(c => <a className={active === c.id ? 'active' : ''} href={`#${c.id}`} key={c.id} title={c.title}><span>{c.number}</span><b>{c.title}</b></a>)}</nav> }

function App() {
  const [opened, setOpened] = useState(false)
  const [active, setActive] = useState('prologue')
  const [rose, setRose] = useState<number | null>(null)
  const [cat, setCat] = useState(0)
  const [windowNote, setWindowNote] = useState(false)
  const [letterOpen, setLetterOpen] = useState(true)
  const [treasureStage, setTreasureStage] = useState<'idle' | 'question' | 'open'>('idle')
  const [mapNote, setMapNote] = useState<string | null>(null)
  const displayName = loveConfig.girlfriendNameRu

  useEffect(() => {
    const updateActiveChapter = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('.chapter'))
      const current = sections.reduce((closest, section) =>
        Math.abs(section.getBoundingClientRect().top - 140) < Math.abs(closest.getBoundingClientRect().top - 140) ? section : closest,
      sections[0])
      if (current) setActive(current.id)
    }
    window.addEventListener('scroll', updateActiveChapter, { passive: true })
    updateActiveChapter()
    return () => window.removeEventListener('scroll', updateActiveChapter)
  }, [])

  if (!opened) return <><main className="cover-screen"><div className="cover-book"><div className="cover-inner"><div className="cover-emblem">❦</div><p className="cover-overline">Для {displayName === 'Регина' ? 'Регины' : displayName} — единственной героини моей сказки</p><h1>Наша<br /><i>маленькая</i><br />сказка</h1><p className="cover-subtitle">{displayName}, сегодня я хочу подарить тебе одну маленькую сказку…</p><button className="gold-button cover-button" onClick={() => setOpened(true)}>Открыть нашу сказку <span>→</span></button><div className="cover-mark">✧ 2026 ✧</div></div></div><div className="cover-shadow" /></main><MusicPlayer /></>

  return <div className="story-shell">
    <MusicPlayer /><header className="topbar"><a className="brand" href="#prologue"><span>❦</span> {loveConfig.websiteTitle}</a><div className="topbar-right"><span className="page-count">{chapters.findIndex(c => c.id === active) + 1} / {chapters.length}</span></div></header>
    <ChapterNav active={active} />
    <main>
      <section id="prologue" className="chapter prologue"><div className="hero-scene"><ScenicImage image={scenery.castle} className="hero-scenery" loading="eager" /><div className="hero-mist" /><div className="fireflies" aria-hidden="true">✦　·　✧　·　✦　·　✧　·</div></div><div className="chapter-inner opening-grid"><div className="hero-copy"><p className="eyebrow">Глава первая · {chapters[0].number}</p><h2>Однажды начинается<br /><em>самая прекрасная сказка…</em></h2><div className="rule"><span>❦</span></div><p className="lead">Для тебя, {displayName}.</p><p>Если бы я мог подарить тебе целый мир, я бы начал с этой маленькой сказки. В ней нет волшебства сильнее твоей улыбки, сокровища дороже твоего сердца и желания прекраснее того, чтобы однажды оказаться рядом с тобой.</p><a className="text-link" href="#castle">Открыть следующую страницу <span>↗</span></a></div><div className="prologue-illustration"><div className="hero-emblem">❦</div><KnightArt /><span className="illustration-caption">Замок, где живёт моё сердце</span></div></div></section>
      <section id="castle" className="chapter castle-page"><div className="chapter-inner"><SectionTitle kicker="Глава вторая · II" title="Замок, в котором живёт моё сердце" /><div className="castle-layout"><div className="castle-frame"><CastleArt /><button className="window-hotspot" onClick={() => setWindowNote(!windowNote)} aria-label="Открыть записку в окне">{windowNote ? <span className="window-note">Здесь всегда найдётся<br />место для тебя.</span> : '·'}</button><span className="tiny-knight">♞</span></div><div className="text-column"><p>Если бы мне принадлежало целое королевство, я всё равно не считал бы его самым большим сокровищем.</p><p className="highlight">Потому что настоящее сокровище для меня — это ты, моя любимая.</p><p className="margin-note">Нажми на свет в окне<br /><span>там спрятана тайна</span></p></div></div></div></section>
      <section id="letter" className="chapter letter-page"><div className="chapter-inner narrow"><SectionTitle kicker="Глава третья · III" title="Письмо, которое я написал сердцем" /><div className={`letter-paper ${letterOpen ? '' : 'letter-closed'}`}><div className="wax-seal">❦</div>{letterOpen ? <div className="letter-content"><p>{loveConfig.girlfriendNickname} {displayName},</p><p>Иногда мне хочется обладать настоящей магией.</p><p>Не для того, чтобы превращать камни в золото, побеждать драконов или становиться самым могущественным королём.</p><p>Я бы хотел обладать всего одним волшебством — тем, которое позволило бы мне однажды оказаться рядом с тобой и обнять тебя, не думая о расстоянии.</p><p>Пусть между нами страны, города и тысячи километров. Я всё равно нахожу что-то удивительное в мысли, что ты есть в этом мире.</p><p>Мне нравится представлять, как однажды мы сможем сидеть рядом, разговаривать обо всём на свете, смеяться над какой-нибудь глупостью и создавать собственные маленькие воспоминания.</p><p>Я не обещаю быть идеальным рыцарем. Возможно, я иногда буду теряться в собственных мыслях, говорить что-нибудь нелепое или совершенно не понимать, как победить очередного дракона, который поселился в моей голове.</p><p>Но я хочу учиться быть человеком, рядом с которым тебе спокойно, тепло и хорошо.</p><p>Мне хочется поддерживать тебя, слушать тебя, радоваться твоим успехам и напоминать тебе, насколько ты дорога мне.</p><p>Ты не обязана всегда улыбаться или быть сильной. Ты можешь быть собой — настоящей, уставшей, счастливой, задумчивой, какой угодно.</p><p>Для меня любовь — это не сказка, в которой никогда не бывает трудностей. Это желание беречь что-то прекрасное даже тогда, когда жизнь становится непростой.</p><p>И если бы мне разрешили загадать одно желание под тысячей падающих звёзд, я бы попросил однажды посмотреть тебе в глаза, улыбнуться и наконец сказать всё это лично.</p><p>А пока пусть это письмо будет маленьким мостиком между нами. И пусть, когда ты будешь читать его, ты хотя бы на мгновение почувствуешь тепло, с которым я его создавал.</p><p>Я очень дорожу тобой, моя любимая. И если у этой истории есть продолжение, мне хотелось бы писать его вместе с тобой.</p><p className="signature">♥</p></div> : <button className="reopen" onClick={() => setLetterOpen(true)}>Открыть письмо снова</button>}</div><button className="quiet-button" onClick={() => setLetterOpen(!letterOpen)}>{letterOpen ? 'Свернуть письмо' : 'Перечитать письмо'} <span>↗</span></button></div></section>
      <section id="garden" className="chapter garden-page"><div className="chapter-inner"><SectionTitle kicker="Глава четвёртая · IV" title="Сад тысячи роз" subtitle="Каждая роза хранит одно маленькое признание." /><div className="garden-layout"><ScenicImage image={scenery.roses} className="garden-scenery" /><div className="rose-garden">{roseNotes.map((_, i) => <button className={`rose rose-${i + 1} ${rose === i ? 'selected' : ''}`} key={i} onClick={() => setRose(i)} aria-label={`Роза ${i + 1}`}><span>❧</span></button>)}<div className="garden-arch">⌒</div></div><div className={`rose-note ${rose === null ? 'empty' : ''}`}><span className="note-pin">✦</span>{rose === null ? <><b>Тихий уголок сада</b><p>Выбери розу — в каждой спрятано признание.</p></> : <><b>Роза № {rose + 1}</b><p>{roseNotes[rose]}</p><small>— записано на лепестке</small></>}</div></div></div></section>
      <section id="world" className="chapter world-page"><div className="chapter-inner"><SectionTitle kicker="Глава пятая · V" title="Наш маленький мир" /><div className="world-layout"><div className="map-art"><div className="map-compass">N<br />✦</div><div className="map-castle map-left">♜<small>здесь</small></div><div className="map-castle map-right">♜<small>там</small></div><div className="star-route">✦　·　✧　·　✦　·　✧　·　✦</div>{['наша нежность', 'наши разговоры', 'наши мечты'].map((x, i) => <button className={`map-pin pin-${i}`} key={x} onClick={() => setMapNote(x)}>✦</button>)}</div><div className="world-copy"><p className="dropcap">И</p><p>Иногда мир кажется огромным.</p><p>Но мне нравится думать, что даже в таком большом мире у нас есть что-то маленькое и своё — наши разговоры, наши улыбки, наши мечты и моменты, которые хочется сохранить в памяти.</p>{mapNote && <div className="map-note">В нашем маленьком мире есть место для <b>{mapNote}</b>.</div>}</div></div></div></section>
      <section id="cat" className="chapter cat-page"><div className="chapter-inner cat-layout"><div><SectionTitle kicker="Глава шестая · VI" title="Королевский хранитель нежности" /><p className="cat-intro">Он немного строгий, очень пушистый и знает о тебе всё самое важное.</p><button className="cat-button" onClick={() => setCat((cat + 1) % catNotes.length)} aria-label="Поговорить с котом"><div className="cat-drawing"><span className="crown">♛</span><span className="cat-face">ฅ^•ﻌ•^ฅ</span><span className="cape">◆</span></div><span className="bell">●</span></button><p className="tap-hint">нажми на хранителя</p></div><div className="speech-bubble"><span className="bubble-mark">“</span>{catNotes[cat]}<span className="bubble-tail" /></div></div></section>
      <section id="treasure" className="chapter treasure-page"><div className="chapter-inner treasure-inner"><SectionTitle kicker="Глава седьмая · VII" title="Сокровище, спрятанное драконом" /><div className="treasure-scene"><div className={`dragon ${treasureStage === 'question' ? 'dragon-alert' : ''}`}>🐉<span>охраняю!</span></div><button className={`chest ${treasureStage === 'open' ? 'opened' : ''}`} onClick={() => setTreasureStage(treasureStage === 'idle' ? 'question' : treasureStage === 'question' ? 'open' : 'idle')} aria-label="Открыть сундук">▰<i>✦</i></button><div className="treasure-dialog">{treasureStage === 'idle' && <><p>Осторожно! Здесь хранится одно очень важное сокровище.</p><button className="gold-button" onClick={() => setTreasureStage('question')}>Подойти ближе</button></>}{treasureStage === 'question' && <><p><b>Стойте!</b> Кто заслуживает самых нежных слов в этом королевстве?</p><div className="answer-row">{['Принцесса', 'Ты', 'Моя любимая'].map(a => <button key={a} onClick={() => setTreasureStage('open')}>{a}</button>)}</div></>}{treasureStage === 'open' && <div className="treasure-letter"><p>{loveConfig.girlfriendNickname} {displayName},</p><p>Среди всех сокровищ этого королевства есть одно, которое невозможно купить, спрятать в сундуке или защитить драконом.</p><p>Это возможность знать тебя, дорожить тобой и надеяться, что впереди у нас ещё много прекрасных моментов.</p><p>Именно поэтому я создал для тебя эту маленькую сказку — чтобы сказать: ты очень дорога мне. ♥</p><button className="text-link" onClick={() => setTreasureStage('idle')}>Сыграть снова ↗</button></div>}</div></div></div></section>
      <section id="moon" className="chapter moon-page"><div className="chapter-inner moon-layout"><ScenicImage image={scenery.nightCastle} className="moon-scenery" /><div className="moon-copy"><SectionTitle kicker="Глава восьмая · VIII" title="Под одной луной" /><p>Где бы мы ни находились, мне нравится думать, что мы можем смотреть на одно и то же небо.</p><p>Я не могу заставить расстояние исчезнуть одним заклинанием. Но я могу беречь то хорошее, что есть между нами, ценить наши разговоры и надеяться, что однажды мы сможем создать воспоминания, которые не придётся хранить только на экране.</p><p className="moon-final">До тех пор пусть эта маленькая сказка напоминает тебе:<br /><em>где-то есть человек, которому ты очень дорога.</em></p></div></div></section>
      <section id="epilogue" className="chapter epilogue"><div className="chapter-inner epilogue-inner"><p className="eyebrow">Последняя страница · IX</p><h2>И на этом сказка<br /><em>не заканчивается...</em></h2><div className="epilogue-rule">❦</div><div className="final-letter"><p>{displayName},</p><p>У каждой книги есть последняя страница. Но мне хочется верить, что у нашей истории их будет ещё очень много.</p><p>Я не знаю, какими будут все главы впереди. Зато я знаю, что мне хочется встречать их с открытым сердцем, искренностью, заботой и маленькими радостями, которые делают жизнь прекраснее.</p><p>Спасибо тебе за то, что ты есть в моей жизни. Я надеюсь, что эта маленькая сказка подарила тебе хотя бы одну улыбку.</p><p className="love-line">{displayName}, пусть наша сказка продолжится новыми прекрасными главами… ❤️</p></div><button className="restart" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Прочитать сказку ещё раз ↟</button><div className="final-rose">❦</div></div></section>
    </main>
    <footer><span>❦</span> создано с любовью для {displayName} <span>❦</span></footer>
  </div>
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('The application root element was not found.')
createRoot(rootElement).render(<StrictMode><App /></StrictMode>)
