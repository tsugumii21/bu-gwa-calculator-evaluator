import { HandbookOverview } from './handbook-overview';
import { MascotReference } from '../illustrations/mascot-reference';
import { useRef, useState } from 'react';
import { useAppStore } from '../../store';
import { HandbookReference } from './handbook-reference';
import { HandbookGuide, HandbookAbout } from './handbook-about';

const SECTIONS = { policies: 'Academic Policies & Midyear', guide: 'How to use', overview: 'Overview & disclaimer', about: 'About & developer' } as const;
type Section = keyof typeof SECTIONS;

/** Indexed handbook reader with current workflows and independent project credits. */
export function HandbookView() {
  const activeTab = useAppStore(state => state.activeTab);
  const [section, setSection] = useState<Section>(activeTab === 'about' ? 'about' : activeTab === 'guide' ? 'guide' : 'policies');
  const panel = useRef<HTMLDivElement>(null);
  const selectSection = (next: Section) => {
    setSection(next);
    panel.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  return <div className="v2-handbook tab-pane active" id="tab-handbook">
    <header className="hb-heading hb-heading-with-scene">
      <span className="hb-eyebrow">A LITTLE GUIDANCE FOR THE WAY AHEAD</span>
      <h1>Your record.<br/>A little more understood.</h1>
      <MascotReference scene={`handbook-${section}`} className="handbook-scene" />
      <p>Find a reference, learn the tools, or meet the project behind them.</p>
    </header>
    <nav className="hb-navigation" aria-label="Handbook navigation">{Object.entries(SECTIONS).map(([key, label]) => <button key={key} type="button" aria-pressed={section === key} aria-controls="hb-reading-panel" onClick={() => selectSection(key as Section)}>{label}</button>)}</nav>
    <div ref={panel} id="hb-reading-panel" tabIndex={-1} role="region" aria-label={SECTIONS[section]}>
      {section === 'policies' && <HandbookReference/>}
      {section === 'guide' && <HandbookGuide/>}
      {section === 'overview' && <HandbookOverview/>}
      {section === 'about' && <HandbookAbout/>}
    </div>
  </div>;
}
