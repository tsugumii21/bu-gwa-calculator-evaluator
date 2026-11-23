import { useAppStore } from '../../store';
import { MascotReference } from '../illustrations/mascot-reference';

const SOURCE_URL = 'https://github.com/tsugumii21/bu-gwa-calculator-evaluator';

function returnToTop() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
}

function openHandbook() {
  useAppStore.setState({ activeTab: 'handbook', isWelcomeDismissed: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/** Project identity and credits shared by Welcome and the workspace. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-main">
          <div className="site-footer-identity">
            <p className="site-footer-brand"><span aria-hidden="true">✳</span> BU GWA Calculator</p>
            <p className="site-footer-description">Unofficial academic planning tool for Bueño students.</p>
            <nav aria-label="Footer navigation">
              <button type="button" onClick={openHandbook}>Handbook</button>
              <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">View source <span aria-hidden="true">↗</span></a>
              <button type="button" onClick={returnToTop}>Back to top <span aria-hidden="true">↑</span></button>
            </nav>
          </div>
          <MascotReference scene="footer" className="site-footer-mascot" />
        </div>
        <div className="site-footer-meta">
          <a href="https://github.com/tsugumii21" target="_blank" rel="noopener noreferrer">Built by Allen Del Valle</a>
          <p className="site-footer-values">Scholarship · Leadership · Service · Character</p>
        </div>
      </div>
    </footer>
  );
}
