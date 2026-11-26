import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, Images, Import, Plus, ShieldCheck } from 'lucide-react';

import { useSemesterStore } from '../../store';
import { ScanFailure, type ScanImageResult } from '../../types/scan';
import { mergeScanCandidates, replaceRetriedCandidates, reviewedSubjects, scanImportError } from '../../core/scan-results';
import { buildCalculationReport } from '../../core/calculation-report';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';
import { RecordDialogHeader } from '../modals/record-dialog-header';
import { ScanSession } from './scan-service';
import { SCAN_LIMITS } from './image-preparation';
import { ScanReviewRows } from './scan-review-rows';
import { PhotoSemesterBucket, SCAN_IMAGE_DRAG_TYPE } from './photo-semester-bucket';
import { addBucketFiles, moveBucketImage, removeBucketImage, retainUnchangedResults, type BucketChange, type SemesterBucket } from './scan-buckets';

interface PhotoScanModalProps { isOpen: boolean; onClose: () => void; onSuccess: (count: number, title: string) => void }
type Confirmation = { kind: 'discard' } | { kind: 'remove'; id: string };
const emptyBucket = (): SemesterBucket => ({ id: crypto.randomUUID(), title: 'Year 1 - 1st Semester', files: [], previews: [] });
const unfinishedImage = (result: ScanImageResult) => ['partial', 'failed', 'timed-out', 'canceled'].includes(result.status);

export function loadImageSafe(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    let done = false;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    img.onload = () => {
      if (!done) {
        done = true;
        cleanup();
        resolve(img);
      }
    };

    img.onerror = () => {
      if (!done) {
        done = true;
        cleanup();
        reject(new Error(`Failed to decode image file: ${file.name}`));
      }
    };

    setTimeout(() => {
      if (!done) {
        done = true;
        cleanup();
        reject(new Error(`Image loading timed out: ${file.name}`));
      }
    }, 15000);

    img.src = objectUrl;
  });
}

/** Local-only import session with protected dismissal and semester-scoped review. */
export function PhotoScanModal({ isOpen, onClose, onSuccess }: PhotoScanModalProps) {
  const addSemester = useSemesterStore(state => state.addSemester);
  const [buckets, setBuckets] = useState<SemesterBucket[]>(() => [emptyBucket()]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [reviewMode, setReviewMode] = useState(false);
  const [imageResults, setImageResults] = useState<ScanImageResult[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [openBucketId, setOpenBucketId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedBucket = useRef<string | null>(null);
  const sessionRef = useRef<ScanSession | null>(null);
  const requestId = useRef(0);
  const committing = useRef(false);
  const previewsRef = useRef<string[]>([]);
  const returnFocus = useRef<{ element: HTMLElement; label: string } | null>(null);
  const shouldRestoreFocus = useRef(false);
  const reviewSummary = useRef<HTMLHeadingElement>(null);
  const focusBlocked = useRef(false);
  previewsRef.current = buckets.flatMap(bucket => bucket.previews);
  const hasWork = buckets.some(bucket => bucket.files.length || bucket.extractedSubjects?.length || bucket.title !== 'Year 1 - 1st Semester') || buckets.length > 1;
  const imageCount = buckets.reduce((sum, bucket) => sum + bucket.files.length, 0);
  const courseCount = buckets.reduce((sum, bucket) => sum + (bucket.extractedSubjects?.length ?? 0), 0);
  const blockedCount = buckets.reduce((sum, bucket) => sum + (bucket.extractedSubjects ?? []).filter(row => scanImportError([row])).length, 0);
  const dialogRef = useAccessibleDialog(isOpen, () => requestClose());

  useEffect(() => {
    if (!isOpen) return;
    committing.current = false;
    const requestTracker = requestId;
    const session = new ScanSession(); sessionRef.current = session;
    void session.warm().catch(() => { if (!session.isStopped) setError('Local OCR could not initialize. Retry scanning; no image was uploaded.'); });
    return () => { requestTracker.current++; sessionRef.current?.stop(); previewsRef.current.forEach(url => URL.revokeObjectURL(url)); };
  }, [isOpen]);
  useLayoutEffect(() => {
    if (confirmation) { dialogRef.current?.querySelector<HTMLElement>('[data-keep-working]')?.focus(); return; }
    if (!shouldRestoreFocus.current) return;
    shouldRestoreFocus.current = false;
    const previous = returnFocus.current;
    const replacement = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button') ?? [])
      .find(button => button.getClientRects().length && (button.getAttribute('aria-label') ?? button.textContent?.trim()) === previous?.label);
    (previous?.element.isConnected ? previous.element : replacement ?? dialogRef.current)?.focus({ preventScroll: true });
  }, [confirmation, dialogRef]);
  useLayoutEffect(() => {
    if (!focusBlocked.current || !openBucketId) return;
    const row = document.getElementById(`photo-review-${openBucketId}`)?.querySelector<HTMLElement>('[data-import-blocked="true"]');
    if (!row) return;
    (row.querySelector<HTMLElement>('[aria-invalid="true"]') ?? row).focus({ preventScroll: true });
    row.scrollIntoView({ block: 'nearest' }); focusBlocked.current = false;
  }, [openBucketId, error]);

  const ask = (next: Confirmation) => {
    const element = document.activeElement;
    returnFocus.current = element instanceof HTMLElement ? { element, label: element.getAttribute('aria-label') ?? element.textContent?.trim() ?? '' } : null;
    setConfirmation(next);
  };
  const keepWorking = () => {
    shouldRestoreFocus.current = true;
    setConfirmation(null);
  };
  function requestClose() {
    if (confirmation) { keepWorking(); return; }
    if (hasWork) ask({ kind: 'discard' }); else discardAndClose();
  }
  function discardAndClose() {
    requestId.current++; sessionRef.current?.stop(); sessionRef.current = null;
    previewsRef.current.forEach(url => URL.revokeObjectURL(url)); previewsRef.current = [];
    setBuckets([emptyBucket()]); setImageResults([]); setIsProcessing(false); setReviewMode(false);
    setError(''); setNotice(''); setConfirmation(null); setOpenBucketId(null); setProgress(0); setStatusMessage(''); onClose();
  }
  const applyChange = (change: BucketChange) => {
    change.removedPreviews.forEach(url => URL.revokeObjectURL(url));
    setBuckets(change.buckets); setImageResults(previous => retainUnchangedResults(previous, change.affected));
    setError(''); setNotice(change.message);
  };
  const addFiles = (id: string, files: File[]) => {
    if (isProcessing) return;
    applyChange(addBucketFiles(buckets, id, files, file => URL.createObjectURL(file)));
  };
  const moveImage = (from: string, index: number, preview: string, to: string) => {
    if (!isProcessing) applyChange(moveBucketImage(buckets, from, to, index, preview));
  };
  const removeBucket = (id: string) => {
    const bucket = buckets.find(item => item.id === id);
    if (!bucket || buckets.length <= 1 || isProcessing) return;
    bucket.previews.forEach(url => URL.revokeObjectURL(url));
    setBuckets(previous => previous.filter(item => item.id !== id));
    setImageResults(previous => retainUnchangedResults(previous, [id])); setConfirmation(null); setNotice('Semester removed.');
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('.photo-semester-name input')?.focus());
  };
  const chooseFiles = (id: string) => { selectedBucket.current = id; fileInputRef.current?.click(); };
  const addBucket = () => {
    const number = buckets.length + 1;
    const bucket = { ...emptyBucket(), title: `Year ${Math.ceil(number / 2)} - ${number % 2 ? '1st' : '2nd'} Semester` };
    setBuckets(previous => [...previous, bucket]);
    requestAnimationFrame(() => document.getElementById(`photo-upload-${bucket.id}`)?.querySelector<HTMLElement>('input')?.focus());
  };
  const revealCorrections = () => {
    const bucket = buckets.find(item => item.extractedSubjects?.some(row => scanImportError([row])));
    if (!bucket) return;
    focusBlocked.current = true; setOpenBucketId(bucket.id);
    setError(`${bucket.title}: ${scanImportError(bucket.extractedSubjects ?? [])}`);
  };
  const processAll = async (retryIds?: string[]) => {
    if (isProcessing) return;
    const jobs = buckets.flatMap(bucket => bucket.files.map((file, index) => ({ file, sourceId: `${bucket.id}:${index}`, force: !!retryIds })))
      .filter(job => !retryIds || retryIds.includes(job.sourceId));
    if (!jobs.length) { setError('Add at least one image to a semester first.'); return; }
    const currentRequest = ++requestId.current;
    setIsProcessing(true); setError(''); setNotice(''); setProgress(0);
    const session = sessionRef.current && !sessionRef.current.isStopped ? sessionRef.current : new ScanSession(); sessionRef.current = session;
    setImageResults(previous => [...(retryIds ? previous.filter(result => !retryIds.includes(result.sourceId)) : []), ...jobs.map(job => ({ sourceId: job.sourceId, name: job.file.name, status: 'queued' as const, candidates: [], issues: [], expectedRows: null, milliseconds: 0 }))]);
    setStatusMessage('Preparing local OCR. Images stay on this device.');
    const completed = new Set<string>();
    try {
      const results = await session.run(jobs, result => {
        if (currentRequest !== requestId.current) return;
        setImageResults(previous => previous.map(item => item.sourceId === result.sourceId ? result : item));
        if (!['running', 'queued'].includes(result.status)) completed.add(result.sourceId);
        setProgress(Math.round(completed.size / (jobs.length + 1) * 100));
        setStatusMessage(`${completed.size} of ${jobs.length} images processed${result.phase ? ` · ${result.phase}` : ''}`);
      });
      if (currentRequest !== requestId.current) return;
      setBuckets(previous => previous.map(bucket => {
        const belongs = (result: ScanImageResult) => result.sourceId.startsWith(`${bucket.id}:`);
        const incoming = results.filter(belongs);
        const extractedSubjects = retryIds
          ? replaceRetriedCandidates(bucket.extractedSubjects ?? [], imageResults.filter(belongs), incoming, retryIds)
          : mergeScanCandidates(incoming.flatMap(result => result.candidates));
        return { ...bucket, extractedSubjects };
      }));
      if (!retryIds) setOpenBucketId(null);
      setProgress(100); setReviewMode(true);
      const unfinished = results.filter(unfinishedImage).length;
      setStatusMessage(unfinished ? `Scan finished · ${unfinished} image(s) need review or retry` : 'Scan finished · open a semester to review courses');
      if (unfinished) setNotice('Completed results are preserved. Retry unfinished images below.');
      requestAnimationFrame(() => { if (reviewSummary.current?.getClientRects().length) reviewSummary.current.focus(); });
    } catch (failure) {
      if (currentRequest === requestId.current) setError(failure instanceof ScanFailure ? failure.message : 'Scanning could not complete. Your images are still selected; try again.');
    } finally { if (currentRequest === requestId.current) setIsProcessing(false); }
  };
  const commit = () => {
    if (committing.current || isProcessing) return;
    const eligible = buckets.filter(bucket => bucket.extractedSubjects?.length);
    if (!eligible.length) { setError('No courses to import. Open a semester to add a missing course or edit your images.'); return; }
    if (blockedCount) { revealCorrections(); return; }
    const terms = eligible.map(bucket => ({ id: bucket.id, title: bucket.title.trim() || 'Scanned Semester', underload: false, computed: false, subjects: reviewedSubjects(bucket.extractedSubjects ?? []) }));
    const invalid = buildCalculationReport(terms).errors[0];
    if (invalid) { setError(invalid); return; }
    committing.current = true;
    terms.forEach(addSemester);
    const count = terms.reduce((sum, term) => sum + term.subjects.length, 0);
    const title = terms.length === 1 ? terms[0].title : `${terms.length} semesters`;
    discardAndClose(); onSuccess(count, title);
  };
  if (!isOpen) return null;
  return <div className="modal-overlay v2-record-overlay" id="photo-scan-modal"
    onMouseDown={event => { if (event.target === event.currentTarget) event.preventDefault(); }}
    onDragOver={event => { if (event.dataTransfer.types.includes('Files') || event.dataTransfer.types.includes(SCAN_IMAGE_DRAG_TYPE)) event.preventDefault(); }}
    onDrop={event => { event.preventDefault(); setNotice('Drop images onto a semester. Your selected images are unchanged.'); }}>
    <div className="modal-content v2-record-dialog photo-workbench" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="photo-modal-title">
      <RecordDialogHeader id="photo-modal-title" title={confirmation ? confirmation.kind === 'discard' ? 'Discard this import?' : 'Remove this semester?' : reviewMode ? 'Review scanned courses' : 'Import grade images'} icon={Images} onClose={requestClose} eyebrow={reviewMode ? 'REVIEW BEFORE IMPORTING' : 'IMPORT GRADES'} />
      <div className="modal-body">
        {confirmation && <section className="photo-exit-prompt" aria-label="Confirm temporary data removal"><p>{confirmation.kind === 'discard' ? 'Discard selected images and review edits? Nothing has been imported into your academic record.' : 'Remove this semester and its selected images? Other semesters will stay.'}</p><p className="photo-helper">Keep working returns you to the same images and edits.</p></section>}
        <div hidden={!!confirmation}>
          <p className="photo-intro">{reviewMode ? 'Open a semester and compare its courses with your images.' : 'Add grade screenshots to the semester they belong to.'}</p>
          <p className="photo-helper photo-batch-count">{reviewMode ? `${buckets.filter(bucket => bucket.files.length).length} semesters · ${courseCount} courses · ${blockedCount} need corrections` : `${imageCount}/${SCAN_LIMITS.images} images · 10 MiB each · 100 MiB total`}</p>
          <input type="file" ref={fileInputRef} accept="image/png,image/jpeg,image/webp" multiple hidden onChange={event => { if (selectedBucket.current) addFiles(selectedBucket.current, Array.from(event.target.files ?? [])); event.target.value = ''; selectedBucket.current = null; }} />
          <fieldset className="photo-stage" disabled={isProcessing}>
            {!reviewMode ? <><div className="photo-bucket-list">{buckets.map((bucket, index) => <div id={`photo-upload-${bucket.id}`} key={bucket.id}><PhotoSemesterBucket bucket={bucket} position={index} buckets={buckets} isProcessing={isProcessing}
              onTitle={title => setBuckets(previous => previous.map(item => item.id === bucket.id ? { ...item, title } : item))} onChoose={() => chooseFiles(bucket.id)} onFiles={files => addFiles(bucket.id, files)} onMove={moveImage} onNotice={setNotice}
              onRemoveImage={at => applyChange(removeBucketImage(buckets, bucket.id, at))} onRemove={() => bucket.files.length ? ask({ kind: 'remove', id: bucket.id }) : removeBucket(bucket.id)} /></div>)}</div><button type="button" className="btn btn-secondary photo-add-semester" onClick={addBucket}><Plus size={18} aria-hidden="true" /> Add semester</button></>
              : <><h3 className="photo-review-summary" tabIndex={-1} ref={reviewSummary}>Review extracted courses ({courseCount})</h3>{blockedCount > 0 && <button type="button" className="btn btn-secondary photo-review-corrections" onClick={revealCorrections}>Review {blockedCount} correction{blockedCount === 1 ? '' : 's'}</button>}
                <div className="photo-review-groups">{buckets.filter(bucket => bucket.files.length).map(bucket => {
                  const corrections = (bucket.extractedSubjects ?? []).filter(row => scanImportError([row])).length;
                  const open = openBucketId === bucket.id;
                  return <section className="photo-review-semester" key={bucket.id}><button type="button" className="photo-review-toggle" aria-expanded={open} aria-controls={`photo-review-${bucket.id}`} onClick={() => setOpenBucketId(open ? null : bucket.id)}><span><strong>{bucket.title}</strong><small>{bucket.extractedSubjects?.length ?? 0} courses · {bucket.files.length} images{corrections ? ` · ${corrections} need corrections` : ''}</small></span><ChevronDown size={20} aria-hidden="true" /></button>
                    {open && <div id={`photo-review-${bucket.id}`} className="photo-review-content"><details className="photo-source-images"><summary>View source images ({bucket.previews.length})</summary>{bucket.previews.map((preview, index) => <figure key={preview}><figcaption>Image {index + 1}</figcaption><img src={preview} loading="lazy" decoding="async" alt={`Source image ${index + 1} for ${bucket.title}`} /></figure>)}</details>
                      <ScanReviewRows semesterTitle={bucket.title} rows={bucket.extractedSubjects ?? []} onChange={rows => { setError(''); setBuckets(previous => previous.map(item => item.id === bucket.id ? { ...item, extractedSubjects: rows } : item)); }} /></div>}
                  </section>;
                })}</div></>}
          </fieldset>
          {!isProcessing && imageResults.length > 0 && <div className="photo-scan-outcomes">{imageResults.some(unfinishedImage) && <section aria-label="Images needing review or retry">{imageResults.filter(unfinishedImage).map(result => <div className="photo-image-outcome" key={result.sourceId}><p><strong>{result.name}</strong><span>{result.status} · {result.candidates.length} detected courses</span></p><button type="button" className="btn btn-secondary" onClick={() => void processAll([result.sourceId])} aria-label={`Retry ${result.name}`}>Retry image</button></div>)}</section>}
            <details><summary>Scanned images ({imageResults.length})</summary>{imageResults.map(result => <p className="photo-helper" key={result.sourceId}>{result.name}: {result.status} · {result.candidates.length} courses{result.expectedRows !== null ? ` / ${result.expectedRows} visible rows` : ' · compare source coverage'}</p>)}</details></div>}
          <p className="photo-privacy"><ShieldCheck size={17} aria-hidden="true" /><span>Images stay on this device. OCR engine data may download; images are never uploaded.</span></p>
        </div>
      </div>
      {isProcessing && !confirmation && <section className="photo-progress" aria-label="Scan progress" aria-busy="true"><p role="status">{statusMessage}</p><progress max="100" value={progress || undefined} aria-label="Image extraction progress" /></section>}
      <div className="modal-footer photo-workbench-footer">
        {confirmation ? <><button type="button" className="btn btn-secondary" data-keep-working onClick={keepWorking}>Keep working</button><button type="button" className="btn btn-danger" onClick={() => confirmation.kind === 'discard' ? discardAndClose() : removeBucket(confirmation.id)}>{confirmation.kind === 'discard' ? 'Discard and close' : 'Remove semester'}</button></>
          : <><div className="photo-feedback" aria-live="polite">{error ? <p role="alert">{error}</p> : notice ? <p>{notice}</p> : reviewMode ? <p>{statusMessage}</p> : null}</div>
            {isProcessing ? <button type="button" className="btn btn-secondary" onClick={() => sessionRef.current?.stop()}>Stop scan</button> : reviewMode ? <><button type="button" className="btn btn-secondary" onClick={() => { setReviewMode(false); setError(''); setNotice(''); }}><ArrowLeft size={18} aria-hidden="true" /> Edit images</button><button type="button" className="btn btn-gold" onClick={commit}><Import size={18} aria-hidden="true" /> Import courses ({courseCount})</button></> : <><button type="button" className="btn btn-secondary" onClick={requestClose}>Cancel</button><button type="button" className="btn btn-primary" onClick={() => void processAll()}>Scan images ({imageCount})</button></>}
          </>}
      </div>
    </div>
  </div>;
}
