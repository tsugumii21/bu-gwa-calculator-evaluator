import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, FolderOpen, GraduationCap, Images, Import, Plus, ShieldCheck, Upload, Trash2 } from 'lucide-react';
import { useSemesterStore } from '../../store';
import type { ScanCandidate, ScanImageResult } from '../../types/scan';
import { mergeScanCandidates, reviewedSubjects, scanImportError } from '../../core/scan-results';
import { ScanSession } from './scan-service';
import { SCAN_LIMITS, validateSelection } from './image-preparation';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';
import { ScanReviewRows } from './scan-review-rows';
import { buildCalculationReport } from '../../core/calculation-report';
import { RecordDialogHeader } from '../modals/record-dialog-header';

interface PhotoScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number, title: string) => void;
}

interface SemesterBucket {
  id: string;
  title: string;
  files: File[];
  previews: string[];
  extractedSubjects?: ScanCandidate[];
}

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

export const PhotoScanModal: React.FC<PhotoScanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addSemester } = useSemesterStore();

  const [buckets, setBuckets] = useState<SemesterBucket[]>([
    {
      id: crypto.randomUUID(),
      title: 'Year 1 - 1st Semester',
      files: [],
      previews: [],
    },
  ]);
  const [activeBucketId, setActiveBucketId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [reviewMode, setReviewMode] = useState(false);
  const [imageResults, setImageResults] = useState<ScanImageResult[]>([]);
  const sessionRef = useRef<ScanSession | null>(null);
  const committing = useRef(false);
  const previewsRef = useRef<string[]>([]);
  previewsRef.current = buckets.flatMap(bucket => bucket.previews);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);
  const [error, setError] = useState('');
  const dialogRef = useAccessibleDialog(isOpen, () => handleCloseModal());

  useEffect(() => {
    if (!isOpen) return;
    committing.current = false;
    const session = new ScanSession();
    sessionRef.current = session;
    void session.warm().catch(() => {
      if (!session.isStopped) setError('Local OCR could not initialize. Retry scanning; no image was uploaded.');
    });
    return () => { sessionRef.current?.stop(); previewsRef.current.forEach(preview => URL.revokeObjectURL(preview)); };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddBucket = () => {
    const nextNum = buckets.length + 1;
    const year = Math.ceil(nextNum / 2);
    const term = nextNum % 2 === 1 ? '1st Semester' : '2nd Semester';
    setBuckets((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: `Year ${year} - ${term}`,
        files: [],
        previews: [],
      },
    ]);
  };

  const handleRemoveBucket = (bucketId: string) => {
    if (buckets.length <= 1) return;
    setImageResults(previous => previous.filter(result => !result.sourceId.startsWith(`${bucketId}:`)));
    const target = buckets.find((b) => b.id === bucketId);
    target?.previews.forEach((p) => URL.revokeObjectURL(p));
    setBuckets((prev) => prev.filter((b) => b.id !== bucketId));
  };

  const handleUpdateBucketTitle = (bucketId: string, title: string) => {
    setBuckets((prev) =>
      prev.map((b) => (b.id === bucketId ? { ...b, title } : b))
    );
  };

  const triggerAddPhotos = (bucketId: string) => {
    setActiveBucketId(bucketId);
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || !activeBucketId) return;
    const selection = validateSelection(buckets.flatMap(bucket => bucket.files), Array.from(files));
    const selected = selection.accepted;
    setError(selection.rejected.join(' '));
    if (selected.length === 0) return;

    setBuckets((prev) =>
      prev.map((b) => {
        if (b.id !== activeBucketId) return b;
        const combinedFiles = [...b.files, ...selected];
        b.previews.forEach(url => URL.revokeObjectURL(url));
        const newPreviews = combinedFiles.map((f) => URL.createObjectURL(f));
        return {
          ...b,
          files: combinedFiles,
          previews: newPreviews,
        };
      })
    );
    setActiveBucketId(null);
  };

  const handleRemoveImage = (bucketId: string, index: number) => {
    setImageResults(previous => previous.filter(result => !result.sourceId.startsWith(`${bucketId}:`)));
    setBuckets((prev) =>
      prev.map((b) => {
        if (b.id !== bucketId) return b;
        const targetUrl = b.previews[index];
        if (targetUrl) URL.revokeObjectURL(targetUrl);
        const nextFiles = b.files.filter((_, i) => i !== index);
        const nextPreviews = b.previews.filter((_, i) => i !== index);
        return {
          ...b,
          files: nextFiles,
          previews: nextPreviews,
          extractedSubjects: undefined,
        };
      })
    );
  };

  const cleanupAllPreviews = () => {
    buckets.forEach((b) => b.previews.forEach((p) => URL.revokeObjectURL(p)));
  };

  const handleProcessAll = async (retryIds?: string[]) => {
    const activeBuckets = buckets.filter(bucket => bucket.files.length > 0);
    if (!activeBuckets.length || isProcessing) return;
    setIsProcessing(true);
    setError('');
    setProgress(0);
    const currentRequest = ++requestId.current;
    const allJobs = activeBuckets.flatMap(bucket => bucket.files.map((file, index) => ({
      file, sourceId: `${bucket.id}:${index}`, force: !!retryIds,
    })));
    const jobs = retryIds ? allJobs.filter(job => retryIds.includes(job.sourceId)) : allJobs;
    const session = sessionRef.current && !sessionRef.current.isStopped ? sessionRef.current : new ScanSession();
    sessionRef.current = session;
    const retained = retryIds ? imageResults.filter(result => !retryIds.includes(result.sourceId)) : [];
    setImageResults([...retained, ...jobs.map(job => ({ sourceId: job.sourceId, name: job.file.name,
      status: 'queued' as const, candidates: [], issues: [], expectedRows: null, milliseconds: 0 }))]);
    setStatusMessage('Reading grade tables locally. No images are uploaded.');
    const completed = new Set<string>();
    const results = await session.run(jobs, result => {
      if (currentRequest !== requestId.current) return;
      setImageResults(previous => previous.map(item => item.sourceId === result.sourceId ? result : item));
      if (!['running', 'queued'].includes(result.status)) completed.add(result.sourceId);
      setProgress(Math.round(completed.size / (jobs.length + 1) * 100));
      setStatusMessage(`${completed.size} of ${jobs.length} images processed${result.phase ? ` · ${result.phase}` : ''}`);
    });
    if (currentRequest !== requestId.current) return;
    setBuckets(previous => previous.map(bucket => ({ ...bucket, extractedSubjects: mergeScanCandidates([
      ...(retryIds ? (bucket.extractedSubjects ?? []).filter(row => !row.sourceIds.some(id => retryIds.includes(id))) : []),
      ...results.filter(result => result.sourceId.startsWith(`${bucket.id}:`)).flatMap(result => result.candidates),
    ]) })));
    setProgress(100);
    setStatusMessage('Finished · results ready to review');
    setIsProcessing(false);
    setReviewMode(true);
    const failed = results.filter(result => ['failed', 'timed-out', 'canceled'].includes(result.status));
    if (failed.length) {
      setStatusMessage(`Finished · ${failed.length} need retry`);
      setError(`${failed.length} image(s) unfinished. Completed results are preserved; retry unfinished files.`);
    }
  };

  const handleCommit = () => {
    if (committing.current) return;
    const eligibleBuckets = buckets.filter(
      (b) => b.extractedSubjects && b.extractedSubjects.length > 0
    );

    if (eligibleBuckets.length === 0) {
      setError('No courses to import. Add a course or scan another image.');
      return;
    }
    const blockedBucket = eligibleBuckets.find(bucket => scanImportError(bucket.extractedSubjects || []));
    if (blockedBucket) {
      setError(`${blockedBucket.title}: ${scanImportError(blockedBucket.extractedSubjects || [])}`);
      const blockedRow = dialogRef.current?.querySelector<HTMLElement>('[data-import-blocked="true"]');
      blockedRow?.focus({ preventScroll: true });
      blockedRow?.scrollIntoView({ block: 'center', behavior: 'instant' });
      return;
    }
    const invalid = buildCalculationReport(eligibleBuckets.map(bucket => ({ id: bucket.id, title: bucket.title, subjects: reviewedSubjects(bucket.extractedSubjects || []), computed: false, underload: false }))).errors[0];
    if (invalid) { setError(invalid); return; }

    let totalImportedCourses = 0;
    committing.current = true;

    eligibleBuckets.forEach((bucket) => {
      addSemester({
        id: bucket.id,
        title: bucket.title || 'Scanned Semester',
        underload: false,
        computed: false,
        subjects: reviewedSubjects(bucket.extractedSubjects || []),
      });
      totalImportedCourses += bucket.extractedSubjects?.length || 0;
    });

    setImageResults([]);

    cleanupAllPreviews();
    setBuckets([
      {
        id: crypto.randomUUID(),
        title: 'Year 1 - 1st Semester',
        files: [],
        previews: [],
      },
    ]);
    setReviewMode(false);
    onClose();

    const summaryTitle =
      eligibleBuckets.length === 1
        ? eligibleBuckets[0].title
        : `${eligibleBuckets.length} Semesters`;

    onSuccess(totalImportedCourses, summaryTitle);
  };

  const handleCloseModal = () => {
    requestId.current++;
    sessionRef.current?.stop();
    sessionRef.current = null;
    setImageResults([]);
    setIsProcessing(false);
    setError('');
    cleanupAllPreviews();
    setBuckets([
      {
        id: crypto.randomUUID(),
        title: 'Year 1 - 1st Semester',
        files: [],
        previews: [],
      },
    ]);
    setReviewMode(false);
    onClose();
  };

  const totalUploadedImages = buckets.reduce((sum, b) => sum + b.files.length, 0);
  const activeBucketsCount = buckets.filter((b) => b.files.length > 0).length;
  const totalExtractedCourses = buckets.reduce(
    (sum, b) => sum + (b.extractedSubjects?.length || 0),
    0
  );
  const blockedCourses = buckets.reduce((count, bucket) => count + (bucket.extractedSubjects ?? []).filter(row => scanImportError([row])).length, 0);

  return (
    <div
      className="modal-overlay v2-record-overlay"
      id="photo-scan-modal"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) handleCloseModal();
      }}
    >
      <div className="modal-content v2-record-dialog">
        <RecordDialogHeader id="photo-modal-title" title={reviewMode ? 'Review scanned courses' : 'Import grade images'} icon={Images} onClose={handleCloseModal} eyebrow={reviewMode ? 'REVIEW BEFORE IMPORTING' : 'IMPORT GRADES'} />

        <div className="modal-body">
          <p className="v2-dialog-note">{reviewMode ? 'Check courses against your images before importing.' : 'Add screenshots by semester.'}</p>
          {imageResults.length > 0 && <section className="scan-image-outcomes" aria-label="Image scan results" aria-live="polite">
            {imageResults.map(result => <div key={result.sourceId}>
              <strong>{result.name}: {result.status}</strong>
              <span>{result.candidates.length} courses{result.expectedRows !== null ? ` / ${result.expectedRows} visible rows` : ' · coverage needs review'}{result.milliseconds > 0 ? ` · ${(result.milliseconds / 1000).toFixed(1)}s` : ''}</span>
              {!isProcessing && ['partial', 'failed', 'timed-out', 'canceled'].includes(result.status) && <button type="button" className="btn btn-secondary" aria-label={`Retry ${result.name}`} onClick={() => void handleProcessAll([result.sourceId])}>Retry image</button>}
            </div>)}
          </section>}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              handleFilesSelected(e.target.files);
              e.target.value = '';
            }}
          />

          {!reviewMode ? (
            <>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '14px',
                  lineHeight: 1.45,
                }}
              >
                {SCAN_LIMITS.images} images maximum · 10 MiB each
              </p>

              {/* SEMESTER BUCKETS CONTAINER */}
              <div className="bucket-list">
                {buckets.map((bucket, bIdx) => (
                  <div key={bucket.id} className="semester-bucket-card">
                    <div className="bucket-header">
                      <div className="bucket-title-group">
                        <div className="bucket-icon-badge">
                          <FolderOpen size={20} aria-hidden="true" />
                        </div>
                        <input
                          type="text"
                          className="bucket-title-input"
                          value={bucket.title}
                          onChange={(e) => handleUpdateBucketTitle(bucket.id, e.target.value)}
                          placeholder={`Semester ${bIdx + 1}`}
                          disabled={isProcessing}
                          title="Click to rename semester"
                          aria-label={`New semester title ${bIdx + 1}`}
                        />
                      </div>
                      {buckets.length > 1 && (
                        <button
                          type="button"
                          className="bucket-remove-btn"
                          onClick={() => handleRemoveBucket(bucket.id)}
                          disabled={isProcessing}
                          title="Remove this semester bucket"
                          aria-label={`Remove semester ${bucket.title}`}
                        >
                          <Trash2 size={18} aria-hidden="true" /> Remove semester
                        </button>
                      )}
                    </div>

                    {bucket.files.length === 0 ? (
                      <div
                        className="bucket-empty-dropzone"
                        role="button" tabIndex={0} aria-label={`Add images for ${bucket.title}`}
                        onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); triggerAddPhotos(bucket.id); } }}
                        onClick={() => triggerAddPhotos(bucket.id)}
                        title="Add screenshots for this semester"
                      >
                        <div className="bucket-dropzone-icon">
                          <Upload size={22} aria-hidden="true" />
                        </div>
                        <div className="bucket-dropzone-content">
                          <span className="dropzone-title">Choose screenshots</span>
                          <span className="dropzone-subtitle">PNG, JPG, or WebP · local OCR</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bucket-thumbnails-grid">
                        {bucket.previews.map((preview, imgIdx) => (
                          <div key={imgIdx} className="bucket-thumb-item">
                            <img
                              src={preview}
                              alt={`Screenshot ${imgIdx + 1}`}
                              className="bucket-thumb-img" loading="lazy" decoding="async"
                            />
                            <span className="scan-image-name" title={bucket.files[imgIdx]?.name}>{bucket.files[imgIdx]?.name}</span>
                            {!isProcessing && (
                              <button
                                type="button"
                                className="bucket-thumb-del-btn"
                                onClick={() => handleRemoveImage(bucket.id, imgIdx)}
                                title="Remove image"
                                aria-label={`Delete image ${imgIdx + 1}: ${bucket.files[imgIdx]?.name}`}
                              >
                                <Trash2 size={18} aria-hidden="true" /> Delete image
                              </button>
                            )}
                          </div>
                        ))}

                        {totalUploadedImages < SCAN_LIMITS.images && !isProcessing && (
                          <div
                            className="bucket-add-thumb-btn"
                            role="button" tabIndex={0} aria-label={`Add more images for ${bucket.title}`}
                            onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); triggerAddPhotos(bucket.id); } }}
                            onClick={() => triggerAddPhotos(bucket.id)}
                            title="Add screenshots for this semester"
                          >
                            <Plus size={18} aria-hidden="true" />
                            <span>Add images ({totalUploadedImages}/{SCAN_LIMITS.images})</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!isProcessing && (
                <button
                  type="button"
                  className="btn-add-bucket"
                  onClick={handleAddBucket}
                  style={{ marginTop: '10px' }}
                >
                  <Plus size={18} aria-hidden="true" />
                  <span>Add another semester</span>
                </button>
              )}


            </>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>
                  Review Extracted Courses ({totalExtractedCourses})
                </h4>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {buckets.filter((b) => (b.extractedSubjects?.length || 0) > 0).length} Term(s) Scanned
                </span>
              </div>

              <div className="review-buckets-container">
                {buckets
                  .filter((b) => b.files.length > 0)
                  .map((b) => (
                    <div key={b.id} className="review-bucket-card">
                      <div className="review-bucket-header">
                        <span className="review-bucket-title">
                          <GraduationCap size={18} aria-hidden="true" />
                          {b.title}
                        </span>
                        <span className="review-bucket-count">
                          {b.extractedSubjects?.length || 0} Courses
                        </span>
                      </div>

                      <div className="v2-scan-review">
                        <details className="v2-source-preview"><summary>View source images ({b.previews.length})</summary>{b.previews.map((preview, index) => <img key={preview} src={preview} loading="lazy" decoding="async" alt={`Source image ${index + 1} for ${b.title}`} />)}</details>
                        <ScanReviewRows rows={b.extractedSubjects || []} onChange={subjects => { setError(''); setBuckets(previous => previous.map(bucket => bucket.id === b.id ? { ...bucket, extractedSubjects: subjects } : bucket)); }} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="ocr-privacy-badge">
            <ShieldCheck size={18} aria-hidden="true" />
            <span>Scans stay on this device. OCR engine data may download; images are never uploaded.</span>
          </div>
        </div>

        {(isProcessing || reviewMode) && <section className="scan-processing-panel" aria-label="Scan progress" aria-busy={isProcessing}>
          <div className="scan-processing-status"><span className={isProcessing ? 'scan-activity is-active' : 'scan-activity'} aria-hidden="true" /><span role="status">{statusMessage}</span></div>
          <progress max="100" value={progress || undefined} aria-label="Image extraction progress" />
        </section>}
        <div className="modal-footer photo-modal-footer">
          <div className="scan-import-feedback" aria-live="polite">
            {error ? <p role="alert">{error}</p> : reviewMode && <p>{blockedCourses ? `${blockedCourses} course${blockedCourses === 1 ? '' : 's'} need corrections. Review highlighted rows.` : totalExtractedCourses ? `${totalExtractedCourses} courses ready to import.` : 'No courses to import.'}</p>}
          </div>
          {!reviewMode ? (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCloseModal}
                style={{ padding: '8px 16px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => void handleProcessAll()}
                title={`${activeBucketsCount} semesters with selected images`}
                disabled={isProcessing || totalUploadedImages === 0}
                style={{ padding: '8px 18px', fontWeight: 700 }}
              >
                Scan images ({totalUploadedImages})
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-secondary btn-sm"
                disabled={isProcessing} onClick={() => { setReviewMode(false); setError(''); }}
                style={{ padding: '8px 16px', fontWeight: 600 }}
              >
                <ArrowLeft size={18} aria-hidden="true" /> Edit images
              </button>
              <button
                className="btn btn-gold btn-sm"
                onClick={handleCommit}
                disabled={isProcessing || totalExtractedCourses === 0}
                style={{ padding: '8px 18px', fontWeight: 700 }}
              >
                <Import size={18} aria-hidden="true" /> Import courses ({totalExtractedCourses})
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
