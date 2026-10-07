import React, { useState, useRef } from 'react';
import { useSemesterStore } from '../../store';
import type { Subject } from '../../types';
import {
  preprocessGradeScreenshot,
  scanScreenshotCanvas,
  mergeMultiScreenshotResults,
} from './ocr-engine';

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
  extractedSubjects?: Subject[];
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

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const selected = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (selected.length === 0) return;

    setBuckets((prev) =>
      prev.map((b) => {
        if (b.id !== activeBucketId) return b;
        const combinedFiles = [...b.files, ...selected].slice(0, 3);
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
        };
      })
    );
  };

  const cleanupAllPreviews = () => {
    buckets.forEach((b) => b.previews.forEach((p) => URL.revokeObjectURL(p)));
  };

  const handleProcessAll = async () => {
    const activeBuckets = buckets.filter((b) => b.files.length > 0);
    if (activeBuckets.length === 0) {
      alert('Please upload at least one screenshot before running OCR.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const updatedBuckets = [...buckets];

    try {
      for (let bIdx = 0; bIdx < activeBuckets.length; bIdx++) {
        const bucket = activeBuckets[bIdx];
        const bucketIndexInAll = updatedBuckets.findIndex((b) => b.id === bucket.id);
        const allBucketResults: Subject[][] = [];

        for (let fIdx = 0; fIdx < bucket.files.length; fIdx++) {
          const file = bucket.files[fIdx];
          setStatusMessage(
            `Scanning ${bucket.title} — Image ${fIdx + 1} of ${bucket.files.length}...`
          );

          const img = new Image();
          const objectUrl = URL.createObjectURL(file);
          img.src = objectUrl;
          await new Promise((res) => (img.onload = res));

          const preprocessedCanvas = preprocessGradeScreenshot(img);

          const subjects = await scanScreenshotCanvas(preprocessedCanvas, (percent) => {
            const bucketFraction = (fIdx + percent / 100) / bucket.files.length;
            const overallPercent = Math.round(
              ((bIdx + bucketFraction) / activeBuckets.length) * 100
            );
            setProgress(overallPercent);
          });

          allBucketResults.push(subjects);
          URL.revokeObjectURL(objectUrl);
        }

        setStatusMessage(`Deduplicating rows for ${bucket.title}...`);
        const mergedSubjects = mergeMultiScreenshotResults(allBucketResults);
        if (bucketIndexInAll !== -1) {
          updatedBuckets[bucketIndexInAll] = {
            ...updatedBuckets[bucketIndexInAll],
            extractedSubjects: mergedSubjects,
          };
        }
      }

      setBuckets(updatedBuckets);
      setReviewMode(true);
      setStatusMessage('OCR complete! Review extracted courses.');
    } catch (err) {
      console.error(err);
      alert('Error during OCR processing. Please check image clarity and orientation.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommit = () => {
    const eligibleBuckets = buckets.filter(
      (b) => b.extractedSubjects && b.extractedSubjects.length > 0
    );

    if (eligibleBuckets.length === 0) {
      alert('No extracted courses found to import.');
      return;
    }

    let totalImportedCourses = 0;

    eligibleBuckets.forEach((bucket) => {
      addSemester({
        id: bucket.id,
        title: bucket.title || 'Scanned Semester',
        underload: false,
        computed: false,
        subjects: bucket.extractedSubjects || [],
      });
      totalImportedCourses += bucket.extractedSubjects?.length || 0;
    });

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
    if (isProcessing) return;
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

  return (
    <div
      className="modal-overlay"
      id="photo-scan-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) handleCloseModal();
      }}
    >
      <div className="modal-content animate__animated animate__zoomIn animate__faster">
        <div className="modal-header">
          <h3 id="photo-modal-title">
            <i className="fa-solid fa-camera" style={{ color: '#2563eb' }}></i> Scan Screenshots / Photos by Semester
          </h3>
          <button
            className="modal-close-btn"
            onClick={handleCloseModal}
            disabled={isProcessing}
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body">
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
                Group your screenshots by semester. Each semester bucket can hold 1 to 3 screenshots (stitched automatically for long grade slips).
              </p>

              {/* SEMESTER BUCKETS CONTAINER */}
              <div className="bucket-list">
                {buckets.map((bucket, bIdx) => (
                  <div key={bucket.id} className="semester-bucket-card">
                    <div className="bucket-header">
                      <div className="bucket-title-row">
                        <i className="fa-solid fa-folder-open text-primary" style={{ fontSize: '0.95rem' }}></i>
                        <input
                          type="text"
                          className="bucket-title-input"
                          value={bucket.title}
                          onChange={(e) => handleUpdateBucketTitle(bucket.id, e.target.value)}
                          placeholder={`Semester ${bIdx + 1}`}
                          disabled={isProcessing}
                          title="Click to rename semester"
                        />
                      </div>
                      {buckets.length > 1 && (
                        <button
                          type="button"
                          className="bucket-remove-btn"
                          onClick={() => handleRemoveBucket(bucket.id)}
                          disabled={isProcessing}
                          title="Remove this semester bucket"
                          aria-label="Remove semester bucket"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      )}
                    </div>

                    <div className="bucket-thumbnails-grid">
                      {bucket.previews.map((preview, imgIdx) => (
                        <div key={imgIdx} className="bucket-thumb-item">
                          <img
                            src={preview}
                            alt={`Screenshot ${imgIdx + 1}`}
                            className="bucket-thumb-img"
                          />
                          {!isProcessing && (
                            <button
                              type="button"
                              className="bucket-thumb-del-btn"
                              onClick={() => handleRemoveImage(bucket.id, imgIdx)}
                              title="Remove image"
                              aria-label="Remove image"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          )}
                        </div>
                      ))}

                      {bucket.files.length < 3 && !isProcessing && (
                        <div
                          className="bucket-add-thumb-btn"
                          onClick={() => triggerAddPhotos(bucket.id)}
                          title="Add up to 3 screenshots for this semester"
                        >
                          <i className="fa-solid fa-plus text-primary"></i>
                          <span>Add Photo ({bucket.files.length}/3)</span>
                        </div>
                      )}
                    </div>
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
                  <i className="fa-solid fa-folder-plus text-primary"></i>
                  <span>Add Another Semester for New Images</span>
                </button>
              )}

              {isProcessing && (
                <div style={{ textAlign: 'center', padding: '18px 0' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2.2rem', color: 'var(--bu-blue)' }}></i>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {statusMessage}
                  </div>
                  <div className="bucket-progress-track">
                    <div className="bucket-progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                    {progress}% Completed
                  </span>
                </div>
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
                  .filter((b) => (b.extractedSubjects?.length || 0) > 0)
                  .map((b) => (
                    <div key={b.id} className="review-bucket-card">
                      <div className="review-bucket-header">
                        <span className="review-bucket-title">
                          <i className="fa-solid fa-graduation-cap text-gold" style={{ marginRight: '6px' }}></i>
                          {b.title}
                        </span>
                        <span className="review-bucket-count">
                          {b.extractedSubjects?.length || 0} Courses
                        </span>
                      </div>

                      <div className="scanned-subjects-list" style={{ maxHeight: '180px' }}>
                        {b.extractedSubjects?.map((sub, i) => (
                          <div key={i} className="scanned-subject-card">
                            <div className="scanned-sub-top">
                              <span className="scanned-code">{sub.code || 'COURSE'}</span>
                              <span className="scanned-grade-badge">Grade: {sub.grade || '—'}</span>
                            </div>
                            <div className="scanned-sub-bottom">
                              <span className="scanned-name">{sub.name || 'Extracted Course'}</span>
                              <span className="scanned-units-tag">{sub.units ? `${sub.units} Units` : '3.0 Units'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '16px',
              fontSize: '0.76rem',
              color: 'var(--text-secondary)',
            }}
          >
            <i className="fa-solid fa-shield-halved" style={{ color: 'var(--color-success)' }}></i>
            <span>All OCR is processed client-side with Canvas & Tesseract. Zero data leaves your device.</span>
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {!reviewMode ? (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCloseModal}
                disabled={isProcessing}
                style={{ padding: '8px 16px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleProcessAll}
                disabled={isProcessing || totalUploadedImages === 0}
                style={{ padding: '8px 18px', fontWeight: 700 }}
              >
                <i className="fa-solid fa-microchip"></i> Run OCR ({totalUploadedImages} Images • {activeBucketsCount} Terms)
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setReviewMode(false)}
                style={{ padding: '8px 16px', fontWeight: 600 }}
              >
                <i className="fa-solid fa-arrow-left"></i> Edit Images
              </button>
              <button
                className="btn btn-gold btn-sm"
                onClick={handleCommit}
                style={{ padding: '8px 18px', fontWeight: 700 }}
              >
                <i className="fa-solid fa-file-import"></i> Import All ({buckets.filter((b) => (b.extractedSubjects?.length || 0) > 0).length} Semesters)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
