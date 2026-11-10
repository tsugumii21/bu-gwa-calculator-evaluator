import { useAppStore } from '../../store';
import { ThemePreference } from './theme-preference';
import { SiteFooter } from './site-footer';
import { WelcomeGradeScene } from '../illustrations/welcome-grade-scene';

/** Welcome-only illustration; no sample grades enter the user's record. */
function WelcomeArtwork() {
  return <div className="v2-art" aria-hidden="true">
    <WelcomeGradeScene />
  </div>;
}

/** Welcome entry links directly to the relevant Handbook sections. */
export function WelcomeV2() {
  const dismissWelcome = useAppStore(s => s.dismissWelcome);
  const openHandbook = (section: 'guide' | 'about') => {
    useAppStore.setState({ activeTab: section, isWelcomeDismissed: true });
  };
  return <div className="rd-welcome v2-welcome">
    <header className="v2-header"><span className="v2-brand"><span aria-hidden="true">✳</span><span className="v2-brand-copy">BU GWA <span className="v2-brand-descriptor">Calculator</span></span></span><button type="button" className="v2-about-link" onClick={() => openHandbook('about')}>About</button><ThemePreference /></header>
    <main>
      <section className="v2-hero" aria-labelledby="v2-title"><div className="v2-introduction">
        <h1 id="v2-title">Small<br/>steps.<br/>Clearer<br/><span>semesters.<svg className="v2-heading-underline" viewBox="0 0 120 20" aria-hidden="true" focusable="false"><path d="M5 15Q61 2 114 5" /></svg></span></h1>
        <p>Bring your grades, see the bigger picture,<br className="v2-desktop-break"/> and plan what’s next.</p>
        <div className="v2-actions"><button className="v2-primary" onClick={dismissWelcome}>Let’s get started <span aria-hidden="true">→</span></button><button type="button" className="v2-guide-button" onClick={() => openHandbook('guide')}>How it works</button></div>
      </div><WelcomeArtwork /></section>
      <section className="v2-steps" aria-labelledby="v2-steps-title"><h2 id="v2-steps-title">Your record, at your pace</h2><ol>
        <li><span>01</span><div><i className="fa-regular fa-file-lines" aria-hidden="true"/><h3>Add your courses</h3><p>List your subjects and enter their grades and units.</p></div></li>
        <li><span>02</span><div><i className="fa-solid fa-chart-column" aria-hidden="true"/><h3>Review your record</h3><p>Check your entries. Missing grades stay pending.</p></div></li>
        <li><span>03</span><div><i className="fa-solid fa-bullseye" aria-hidden="true"/><h3>Calculate &amp; plan</h3><p>See your GWA and explore what comes next.</p></div></li>
      </ol></section>
    </main>
    <SiteFooter />
  </div>;
}
