import { useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import IntelligencePage from './components/IntelligencePage'
import LoadingScreen from './components/LoadingScreen'
import HeroTitle from './components/HeroTitle'
import NavPill from './components/NavPill'

export default function App() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    document.body.style.overflow = done ? '' : 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [done])

  return (
    <>
      <HomePage loaded={done} />
      <IntelligencePage />
      <LoadingScreen onComplete={() => setDone(true)} />
      {/* Hero headline is a single App-level node — it runs its own
          loading-phase animation, then fades with scroll alongside the
          rest of HomePage's opening scene. Rendered last so it layers
          above the LoadingScreen backdrop during the sunrise. */}
      <HeroTitle loaded={done} />
      {/* Compact pill navbar — App-level so it stays fixed across HomePage
          and IntelligencePage, escaping HomePage's .sticky overflow:hidden
          and #root's overflow-x: clip. */}
      <NavPill loaded={done} />
    </>
  )
}
