import React from 'react';
import type { Subject } from '../../types';

interface SubjectRowProps {
  subject: Subject;
  index: number;
  onUpdate: (field: keyof Subject, value: string | number) => void;
  onRemove: () => void;
}

export const SubjectRow: React.FC<SubjectRowProps> = ({
  subject,
  index,
  onUpdate,
  onRemove,
}) => {
  return (
    <tr>
      <td style={{ width: '22%' }}>
        <input
          type="text"
          className="form-control-sm"
          value={subject.code}
          placeholder="e.g. CS 111 (Optional)"
          onChange={(e) => onUpdate('code', e.target.value)}
          autoComplete="off"
          aria-label="Course Code (Optional)"
        />
      </td>
      <td style={{ width: '43%' }}>
        <input
          type="text"
          className="form-control-sm"
          value={subject.name}
          placeholder="e.g. Computer Programming"
          onChange={(e) => onUpdate('name', e.target.value)}
          aria-label="Course Description"
        />
      </td>
      <td style={{ width: '17%' }}>
        <input
          type="text"
          className="form-control-sm"
          value={subject.grade !== undefined && subject.grade !== null ? subject.grade : ''}
          placeholder="e.g. 1.5"
          inputMode="decimal"
          onChange={(e) => onUpdate('grade', e.target.value)}
          autoComplete="off"
          aria-label="Grade Rating"
        />
      </td>
      <td style={{ width: '10%' }}>
        <input
          type="number"
          className="form-control-sm"
          value={subject.units !== undefined && subject.units !== null ? subject.units : ''}
          min="0"
          max="12"
          step="0.5"
          inputMode="decimal"
          placeholder="e.g. 3"
          onChange={(e) => onUpdate('units', parseFloat(e.target.value) || 0)}
          aria-label="Credit Units"
        />
      </td>
      <td style={{ width: '8%', textAlign: 'center' }}>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={onRemove}
          title="Remove Subject"
          aria-label={`Remove subject ${subject.code || index + 1}`}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </td>
    </tr>
  );
};
