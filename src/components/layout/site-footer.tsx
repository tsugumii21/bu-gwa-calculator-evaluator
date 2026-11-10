/** Project identity and credits shared by Welcome and the workspace. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="site-footer-brand"><span aria-hidden="true">✳</span> BU GWA Calculator</p>
          <p>Unofficial academic planning tool for Bueño students.</p>
        </div>
        <div>
          <p className="site-footer-values">Scholarship · Leadership · Service · Character</p>
          <nav aria-label="Project credits">
            <a href="https://github.com/tsugumii21" target="_blank" rel="noopener noreferrer">Built by Allen Del Valle</a>
            <a href="https://github.com/tsugumii21/bu-gwa-calculator-evaluator" target="_blank" rel="noopener noreferrer">GitHub repository</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
