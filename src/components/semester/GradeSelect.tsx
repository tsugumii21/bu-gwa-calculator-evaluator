import React from 'react';
import { VALID_GRADES } from '../../core/constants';

interface GradeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const GradeSelect: React.FC<GradeSelectProps> = ({
  value,
  onChange,
  className = '',
  disabled = false,
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-label="Grade Rating"
      className={`form-control-sm ${className}`}
    >
      <option value="">Grade</option>
      {VALID_GRADES.map((g) => (
        <option key={g.value} value={g.value}>
          {g.label}
        </option>
      ))}
    </select>
  );
};
