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
  const [localCode, setLocalCode] = React.useState(subject.code || '');
  const [localName, setLocalName] = React.useState(subject.name || '');

  React.useEffect(() => {
    setLocalCode(subject.code || '');
  }, [subject.code]);

  React.useEffect(() => {
    setLocalName(subject.name || '');
  }, [subject.name]);

  const rowIdentifier = subject.code ? subject.code : `Row ${index + 1}`;

  return (
    <tr>
      <td style={{ width: '22%' }}>
        <input
          type="text"
          className="form-control-sm"
          value={localCode}
          placeholder="e.g. CS 111 (Optional)"
          onChange={(e) => setLocalCode(e.target.value)}
          onBlur={() => {
            if (localCode !== subject.code) onUpdate('code', localCode);
          }}
          autoComplete="off"
          aria-label={`Course Code for ${rowIdentifier}`}
        />
      </td>
      <td style={{ width: '43%' }}>
        <input
          type="text"
          className="form-control-sm"
          value={localName}
          placeholder="e.g. Computer Programming"
          onChange={(e) => setLocalName(e.target.value)}
          onBlur={() => {
            if (localName !== subject.name) onUpdate('name', localName);
          }}
          aria-label={`Course Description for ${rowIdentifier}`}
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
          aria-label={`Grade Rating for ${rowIdentifier}`}
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
          onChange={(e) => onUpdate('units', Math.max(0, parseFloat(e.target.value) || 0))}
          aria-label={`Credit Units for ${rowIdentifier}`}
        />
      </td>
      <td style={{ width: '8%', textAlign: 'center' }}>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          style={{ minWidth: 36, minHeight: 36, margin: 'auto' }}
          onClick={onRemove}
          title="Remove Subject"
          aria-label={`Remove subject ${rowIdentifier}`}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </td>
    </tr>
  );
};
