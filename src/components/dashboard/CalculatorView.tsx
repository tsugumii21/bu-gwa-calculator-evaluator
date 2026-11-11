import React, { useCallback, useRef, useState } from 'react';
import { useAppStore, useSemesterStore } from '../../store';
import { buildCalculationReport, selectCalculationTerms, type CalculationMode } from '../../core/calculation-report';
import { ActionToolbar } from '../toolbar/ActionToolbar';
import { BulkPasteModal } from '../modals/BulkPasteModal';
import { RecordReviewDialog } from '../modals/record-review-dialog';
import { CorScanModal } from '../scanner/CorScanModal';
import { PhotoScanModal } from '../scanner/PhotoScanModal';
import { ImportSuccessModal } from '../modals/ImportSuccessModal';
import { ScrollToTopBtn } from '../common/ScrollToTopBtn';
import { MascotReference } from '../illustrations/mascot-reference';
import { CalculationDialog, HonorEvidence, UNOFFICIAL_NOTICE } from './calculation-result';
import { CalculatorRecords } from './calculator-records';
import { ScopedSummary } from './scoped-summary';
import { ComputationDialog } from '../animations/computation-dialog';
import { chooseResultMoment, type ResultMomentPool } from '../illustrations/result-moments';

const COMPUTATION_VIEWING_DURATION_MS = 2_700;

export const CalculatorView: React.FC = () => {
  const semesters = useSemesterStore((s) => s.semesters);
  const addSemester = useSemesterStore((s) => s.addSemester);
  const computeAllSemesters = useSemesterStore((s) => s.computeAllSemesters);
  const computeSemester = useSemesterStore(s => s.computeSemester);
  const degreeRequirements = useAppStore(s => s.degreeRequirements);
  const [mode, setMode] = useState<CalculationMode>('gwa');
  const [selectedId, setSelectedId] = useState('');
  const activeId = semesters.some(term => term.id === selectedId) ? selectedId : semesters[0]?.id ?? '';
  const terms = selectCalculationTerms(semesters, mode, activeId);
  const report = buildCalculationReport(terms, mode === 'latin' ? degreeRequirements : undefined);
  const stats = report.stats;
  const [computedSignature, setComputedSignature] = useState('');
  const isCurrent = computedSignature === `${mode}:${report.signature}`;
  const [isResultOpen, setIsResultOpen] = useState(false);
  const closeResult = useCallback(() => setIsResultOpen(false), []);
  const scope = mode === 'gwa' ? terms[0]?.title ?? 'Select a semester' : `${terms.length} semester${terms.length === 1 ? '' : 's'} in this record`;

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [resultMoment, setResultMoment] = useState(-1);
  const pendingComputation = useRef('');

  const handleComputeAll = () => {
    if (pendingComputation.current) return;
    if (report.errors.length || stats.gradedUnits === 0) {
      setAlertMessage(report.errors[0] ?? 'Enter at least one valid numeric grade with positive units before computing.');
      return;
    }
    setAlertMessage(null);
    pendingComputation.current = `${mode}:${report.signature}`;
    setIsComputing(true);
  };

  const finishComputation = () => {
    if (!pendingComputation.current) return;
    const expectedSignature = pendingComputation.current;
    pendingComputation.current = '';
    setIsComputing(false);
    if (expectedSignature !== `${mode}:${report.signature}`) {
      setAlertMessage('Your entries changed. Compute again for the updated record.');
      return;
    }
    if (mode === 'gwa') computeSemester(activeId);
    else computeAllSemesters();
    setComputedSignature(`${mode}:${report.signature}`);
    const pool: ResultMomentPool = mode === 'gwa'
      ? report.termHonor?.level === 'president' ? 'president' : report.termHonor?.level === 'dean' ? 'dean' : 'support'
      : report.latin.stage === 'estimate' ? 'latin' : 'support';
    setResultMoment(previous => chooseResultMoment(pool, previous));
    setIsResultOpen(true);
  };


  // Modals state
  const [isBulkPasteOpen, setIsBulkPasteOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isCorScanOpen, setIsCorScanOpen] = useState(false);
  const [isPhotoScanOpen, setIsPhotoScanOpen] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    isOpen: boolean;
    count: number;
    title: string;
    source: 'pdf' | 'screenshot';
  }>({
    isOpen: false,
    count: 0,
    title: '',
    source: 'pdf',
  });

  const handleAddSemester = () => {
    const semNumber = semesters.length + 1;
    const year = Math.ceil(semNumber / 2);
    const term = semNumber % 2 === 1 ? '1st Semester' : '2nd Semester';

    const id = crypto.randomUUID();
    addSemester({
      id,
      title: `Year ${year} - ${term}`,
      underload: false,
      computed: false,
      subjects: [
        { code: '', name: '', grade: '', units: 3 },
        { code: '', name: '', grade: '', units: 3 },
        { code: '', name: '', grade: '', units: 3 },
      ],
    });
    setSelectedId(id);
  };

  return (
    <div className="rd-welcome rd-calculator v2-calculator">
      <div className="v2-calculator-intro">
      <div className="rd-calculator-heading"><h1>Hey, Bueño Student.<br />Here’s where you stand.</h1></div>
      <MascotReference scene="calculator" className="v2-calculator-sky" />
      <div className="v2-mode-switch" role="group" aria-label="What to compute">
        {(['gwa', 'latin'] as const).map(value => <button type="button" key={value} aria-pressed={mode === value} onClick={() => { setMode(value); setAlertMessage(null); }}>{value === 'gwa' ? 'GWA' : 'Latin Honors'}</button>)}
      </div>
      <ActionToolbar group="imports" onAddSemester={handleAddSemester} onOpenScanCor={() => setIsCorScanOpen(true)} onOpenScanPhoto={() => setIsPhotoScanOpen(true)} onOpenBulkPaste={() => setIsBulkPasteOpen(true)} onOpenAchievements={() => setIsAchievementsOpen(true)} />
      </div>
      <p>{mode === 'gwa' ? 'One semester at a time. Your other saved terms stay safe.' : 'Your full record, together. Add every semester you need, including midyear terms.'}</p>
      <ScopedSummary report={report} mode={mode} scope={scope} isCurrent={isCurrent} terms={terms} />
      {isCurrent && mode === 'latin' && <details className="result-evidence"><summary>Graduation requirements to verify</summary><HonorEvidence report={report} /></details>}
      <p className="v2-unofficial">{UNOFFICIAL_NOTICE}</p>
      {isCurrent && <button type="button" onClick={() => setIsResultOpen(true)}>View result details</button>}
      {mode === 'latin' && <button type="button" id="btn-achievements" onClick={() => setIsAchievementsOpen(true)}>Review record</button>}
      {/* ── PRINT ONLY OFFICIAL ACADEMIC TRANSCRIPT HEADER ── */}
      <div className="print-transcript-header">
        <h2>BICOL UNIVERSITY</h2>
        <h3>Unofficial Academic Planning Summary</h3>
        <div className="print-disclaimer">
          <i className="fa-solid fa-triangle-exclamation"></i> <strong>Disclaimer:</strong> This is an <strong>unofficial</strong> evaluation tool created to assist Bicol University students with GWA calculations and academic planning. This document is <strong>not</strong> an official transcript, certifiable record, or university-issued document.
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '10px', padding: '6px 0', borderTop: '1px solid #ccc' }}>
          <span><strong>{mode === 'gwa' ? 'Semester GWA' : 'Cumulative GWA'}:</strong> <span>{isCurrent ? stats.cumulativeGWA.toFixed(4) : 'Not computed'}</span> · {scope}</span>
          <span><strong>Graded Units:</strong> <span>{isCurrent ? stats.gradedUnits.toFixed(1) : '—'}</span></span>
          <span><strong>Date Generated:</strong> <span>{new Date().toLocaleDateString()}</span></span>
        </div>
      </div>

      {/* DASHBOARD SUMMARY CARDS */}

      {alertMessage && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid var(--color-danger)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: 'var(--space-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>{alertMessage}</span>
        </div>
      )}

      {/* TOOLBAR */}
      <CalculatorRecords semesters={semesters} selectedId={activeId} mode={mode} onSelect={setSelectedId} onAdd={handleAddSemester} onCompute={handleComputeAll} />


      {/* SEMESTERS CONTAINER */}
      {isComputing && <ComputationDialog scope={scope} onFinish={finishComputation} minimumDurationMs={COMPUTATION_VIEWING_DURATION_MS} />}
      <CalculationDialog report={report} mode={mode} scope={scope} isCurrent={isCurrent} isOpen={isResultOpen} onClose={closeResult} moment={Math.max(0, resultMoment)} />

      {/* MODALS */}
      <BulkPasteModal
        isOpen={isBulkPasteOpen}
        onClose={() => setIsBulkPasteOpen(false)}
      />


      <RecordReviewDialog
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />

      <CorScanModal
        isOpen={isCorScanOpen}
        onClose={() => setIsCorScanOpen(false)}
        onSuccess={(count, title) => setSuccessInfo({ isOpen: true, count, title, source: 'pdf' })}
      />

      <PhotoScanModal
        isOpen={isPhotoScanOpen}
        onClose={() => setIsPhotoScanOpen(false)}
        onSuccess={(count, title) => setSuccessInfo({ isOpen: true, count, title, source: 'screenshot' })}
      />

      <ImportSuccessModal
        isOpen={successInfo.isOpen}
        onClose={() => {
          setSelectedId(semesters[semesters.length - 1]?.id ?? '');
          setSuccessInfo({ isOpen: false, count: 0, title: '', source: 'pdf' });
          requestAnimationFrame(() => document.querySelector<HTMLElement>('.v2-course-records')?.focus());
        }}
        count={successInfo.count}
        semesterTitle={successInfo.title}
        source={successInfo.source}
      />


      {/* Floating Scroll to Top Button */}
      <ScrollToTopBtn />
    </div>
  );

};
