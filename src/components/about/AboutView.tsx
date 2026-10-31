import React from 'react';
import { HandbookView } from '../handbook/HandbookView';

/**
 * @deprecated AboutView is consolidated into HandbookView.
 * Retained as compatibility wrapper to avoid broken callers.
 */
export const AboutView: React.FC = () => {
  return <HandbookView />;
};
