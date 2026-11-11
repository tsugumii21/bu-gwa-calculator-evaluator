import type { ReactNode } from 'react';

const PRIVACY_SOURCE_URL = 'https://github.com/tsugumii21/bu-gwa-calculator-evaluator/blob/main/README.md#privacy-and-academic-disclaimer';

/** Displays a data-handling note and links to the source files behind it. */
export function DataPrivacyNote({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p className="data-privacy-note" id={id}>
      {children}{' '}
      <a href={PRIVACY_SOURCE_URL} target="_blank" rel="noopener noreferrer">View source</a>
    </p>
  );
}
