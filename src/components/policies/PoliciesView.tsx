import React from 'react';
import { HandbookView } from '../handbook/HandbookView';

/**
 * @deprecated PoliciesView is consolidated into HandbookView.
 * Retained as compatibility wrapper to avoid broken callers.
 */
export const PoliciesView: React.FC = () => {
  return <HandbookView />;
};
