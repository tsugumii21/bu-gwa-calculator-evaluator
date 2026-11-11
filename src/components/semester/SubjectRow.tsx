import React from 'react';
import type { Subject } from '../../types';
import { isValidBUGrade } from '../../core/constants';

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
  const [localGrade, setLocalGrade] = React.useState(
    subject.grade !== undefined && subject.grade !== null ? String(subject.grade) : '',
  );

  React.useEffect(() => {
    setLocalCode(subject.code || '');
  }, [subject.code]);

  React.useEffect(() => {
    setLocalName(subject.name || '');
  }, [subject.name]);

  React.useEffect(() => {
    setLocalGrade(
      subject.grade !== undefined && subject.grade !== null ? String(subject.grade) : '',
    );
  }, [subject.grade]);

  const rowIdentifier = subject.code ? subject.code : `Row ${index + 1}`;
  const isInvalidGrade = localGrade.trim() !== '' && !isValidBUGrade(localGrade);

  const commitGrade = () => {
    if (localGrade !== subject.grade) {
      onUpdate('grade', localGrade);
    }
  };

  return (
    <tr>
      <td data-label="Course code" style={{ width: '22%' }}>
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
          enterKeyHint="next"
          aria-label={`Course Code for ${rowIdentifier}`}
        />
      </td>
      <td data-label="Description" style={{ width: '46%' }}>
        <input
          type="text"
          className="form-control-sm"
          value={localName}
          placeholder="e.g. Computer Programming"
          onChange={(e) => setLocalName(e.target.value)}
          onBlur={() => {
            if (localName !== subject.name) onUpdate('name', localName);
          }}
          enterKeyHint="next"
          aria-label={`Course Description for ${rowIdentifier}`}
        />
      </td>
      <td data-label="Grade" style={{ width: '14%' }}>
        <div className="grade-input-wrapper" style={{ position: 'relative' }}>
          <input
            type="text"
            className={`form-control-sm ${isInvalidGrade ? 'input-error-border' : ''}`}
            value={localGrade}
            placeholder="Pending"
            inputMode="decimal"
            enterKeyHint="next"
            onChange={(e) => setLocalGrade(e.target.value)}
            onBlur={commitGrade}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitGrade();
              }
            }}
            autoComplete="off"
            aria-label={`Grade Rating for ${rowIdentifier}`}
            aria-invalid={isInvalidGrade}
            title={
              isInvalidGrade
                ? 'Invalid BU Grade rating. Official BU grades are discrete tenths: 1.0, 1.1 ... 3.0, 4.0, 5.0, INC, DRP.'
                : undefined
            }
          />
          {isInvalidGrade && (
            <span
              className="grade-invalid-hint"
              title="Official BU grades are discrete tenths (1.0-3.0), 4.0, 5.0, INC, DRP"
              style={{
                display: 'block',
                fontSize: '0.65rem',
                color: 'var(--color-danger, #ef4444)',
                marginTop: '2px',
                lineHeight: 1.1,
              }}
            >
              Non-BU rating
            </span>
          )}
        </div>
      </td>
      <td data-label="Units" style={{ width: '12%' }}>
        <input
          type="number"
          className="form-control-sm"
          value={subject.units !== undefined && subject.units !== null ? subject.units : ''}
          min="0"
          max="12"
          step="0.5"
          inputMode="decimal"
          enterKeyHint="next"
          placeholder="e.g. 3"
          onChange={(e) => onUpdate('units', Math.max(0, parseFloat(e.target.value) || 0))}
          aria-label={`Credit Units for ${rowIdentifier}`}
        />
      </td>
      <td data-label="Remove course" style={{ width: '6%', textAlign: 'center' }}>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          style={{ minWidth: 48, minHeight: 48, margin: 'auto' }}
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
