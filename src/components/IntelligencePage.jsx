import SectionOrchestration from './sections/SectionOrchestration'
import SectionTriage from './sections/SectionTriage'
import SectionModular from './sections/SectionModular'
import { SectionTransition, SectionMinisterQuote } from './sections/SectionTransitionQuote'
import SectionScaling from './sections/SectionScaling'
import SectionCTA from './sections/SectionCTA'
import Footer from './sections/Footer'

export default function IntelligencePage() {
  return (
    <div className="intelligence-page">
      <SectionOrchestration />
      <SectionTriage />
      <SectionModular />
      <SectionTransition />
      <SectionMinisterQuote />
      <SectionScaling />
      <SectionCTA />
      <Footer />
    </div>
  )
}
