import React, { useState, useRef } from 'react';
import { useSemesterStore } from '../../store';
import type { Semester, Subject } from '../../types';
import { parsePdfCOR } from './pdf-parser';
import {
  preprocessGradeScreenshot,
  scanScreenshotCanvas,
  mergeMultiScreenshotResults,
} from './ocr-engine';
import { LottieLoader } from '../animations/LottieLoader';
import { getRandomAnimation } from '../animations/animations';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'pdf' | 'screenshot';
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'screenshot',
}) => {
  const { addSemester } = useSemesterStore();
  const [tab, setTab] = useState<'pdf' | 'screenshot'>(defaultTab);

  // Screenshot State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [extractedSubjects, setExtractedSubjects] = useState<Subject[]>([]);
  const [semesterTitle, setSemesterTitle] = useState('Scanned Semester');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Screenshot Upload (max 3)
  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const combined = [...imageFiles, ...selected].slice(0, 3); // Max 3 screenshots

    setImageFiles(combined);

    // Generate previews
    const previews = combined.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    const nextFiles = imageFiles.filter((_, i) => i !== index);
    const nextPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(nextFiles);
    setImagePreviews(nextPreviews);
  };

  // Run Screenshot OCR
  const handleProcessScreenshots = async () => {
    if (imageFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setStatusMessage('Preprocessing screenshot images via Canvas...');

    try {
      const allResults: Subject[][] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        setStatusMessage(`Processing screenshot ${i + 1} of ${imageFiles.length}...`);

        // Load into HTMLImageElement
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        await new Promise((res) => (img.onload = res));

        // Preprocess through Canvas
        const preprocessedCanvas = preprocessGradeScreenshot(img);

        // Run OCR worker
        const subjects = await scanScreenshotCanvas(preprocessedCanvas, (percent) => {
          const overall = Math.round(((i + percent / 100) / imageFiles.length) * 100);
          setProgress(overall);
        });

        allResults.push(subjects);
        URL.revokeObjectURL(objectUrl);
      }

      setStatusMessage('Deduplicating overlapping course rows...');
      const merged = mergeMultiScreenshotResults(allResults);
      setExtractedSubjects(merged);
      setStatusMessage(`Found ${merged.length} courses!`);
    } catch (err) {
      console.error(err);
      alert('Error scanning screenshots. Please verify the images are clear.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Run PDF Parse
  const handleProcessPdf = async (file: File) => {
    setIsProcessing(true);
    setProgress(30);
    setStatusMessage('Reading Certificate of Registration (COR) PDF...');

    try {
      const result = await parsePdfCOR(file);
      setProgress(100);
      setSemesterTitle(result.semesterTitle || 'Scanned COR');
      setExtractedSubjects(result.subjects);
      setStatusMessage(`Extracted ${result.subjects.length} courses from COR!`);
    } catch (err) {
      console.error(err);
      alert('Error parsing PDF. Please ensure this is an official BU COR PDF file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportToSemester = () => {
    if (extractedSubjects.length === 0) return;

    const newSem: Semester = {
      id: crypto.randomUUID(),
      title: semesterTitle,
      subjects: extractedSubjects,
      underload: false,
      computed: false,
    };

    addSemester(newSem);
    onClose();
  };

  const scanAnimation = getRandomAnimation('scan');

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-scanner"
      onClick={onClose}
    >
      <div
        className="modal-content animate__animated animate__zoomIn animate__faster"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h3 id="modal-title-scanner">
            <i className="fa-solid fa-camera text-primary"></i> Import Schedule &amp; Grades
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Subtab Switcher */}
          <div className="subtab-bar" style={{ marginBottom: 16 }}>
            <button
              type="button"
              className={`subtab-btn ${tab === 'screenshot' ? 'active' : ''}`}
              onClick={() => {
                setTab('screenshot');
                setExtractedSubjects([]);
              }}
            >
              <i className="fa-solid fa-image"></i> Scan Screenshots (Max 3)
            </button>
            <button
              type="button"
              className={`subtab-btn ${tab === 'pdf' ? 'active' : ''}`}
              onClick={() => {
                setTab('pdf');
                setExtractedSubjects([]);
              }}
            >
              <i className="fa-solid fa-file-pdf"></i> Scan COR (PDF)
            </button>
          </div>

          {/* ── TAB 1: SCREENSHOT OCR ── */}
          {tab === 'screenshot' && (
            <div>
              {extractedSubjects.length === 0 && !isProcessing && (
                <>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 24,
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: 'var(--card-header-bg)',
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '2rem', color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}></i>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0' }}>
                      Click or drag &amp; drop grade sheet screenshots
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Upload 1 to 3 screenshots. Overlapping rows are merged automatically.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageSelect(e.target.files)}
                    />
                  </div>

                  {/* Thumbnail Preview Grid */}
                  {imagePreviews.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        Selected Screenshots ({imagePreviews.length} / 3):
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        {imagePreviews.map((src, i) => (
                          <div
                            key={i}
                            style={{
                              position: 'relative',
                              borderRadius: 8,
                              overflow: 'hidden',
                              border: '1px solid var(--border-color)',
                              aspectRatio: '9/16',
                              background: '#000',
                            }}
                          >
                            <img src={src} alt={`Screenshot ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              style={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                background: 'rgba(0,0,0,0.7)',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '50%',
                                width: 24,
                                height: 24,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                              }}
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                            <span
                              style={{
                                position: 'absolute',
                                bottom: 4,
                                left: 4,
                                background: 'rgba(0,0,0,0.7)',
                                color: '#fff',
                                padding: '1px 6px',
                                borderRadius: 4,
                                fontSize: '0.68rem',
                                fontFamily: 'monospace',
                              }}
                            >
                              SS {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleProcessScreenshots}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 12, justifyContent: 'center', padding: '10px' }}
                      >
                        <i className="fa-solid fa-wand-magic-sparkles"></i> Run OCR Scanner ({imagePreviews.length} image{imagePreviews.length > 1 ? 's' : ''})
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── TAB 2: PDF COR SCANNER ── */}
          {tab === 'pdf' && (
            <div>
              {extractedSubjects.length === 0 && !isProcessing && (
                <label
                  style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 32,
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'var(--card-header-bg)',
                    display: 'block',
                  }}
                >
                  <i className="fa-solid fa-file-pdf" style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: 10, display: 'block' }}></i>
                  <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0' }}>
                    Click to select Bicol University Certificate of Registration (PDF)
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                    100% processed in-browser. No files are uploaded to external servers.
                  </p>
                  <input
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleProcessPdf(file);
                    }}
                  />
                </label>
              )}
            </div>
          )}

          {/* ── PROCESSING SPINNER / LOTTIE ── */}
          {isProcessing && (
            <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <LottieLoader data={scanAnimation.data} src={scanAnimation.src} className="w-32 h-32" />

              <span style={{ marginTop: 10, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-spinner fa-spin text-gold"></i>
                {statusMessage}
              </span>
              <div style={{ width: 240, background: 'var(--card-header-bg)', height: 8, borderRadius: 10, overflow: 'hidden', marginTop: 12 }}>
                <div
                  style={{
                    background: 'var(--bu-gold)',
                    height: '100%',
                    borderRadius: 10,
                    transition: 'width 0.2s ease',
                    width: `${progress}%`,
                  }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)', marginTop: 4 }}>{progress}%</span>
            </div>
          )}

          {/* ── EXTRACTED RESULTS REVIEW TABLE ── */}
          {extractedSubjects.length > 0 && !isProcessing && (
            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Semester Title for Imported Courses
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={semesterTitle}
                  onChange={(e) => setSemesterTitle(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--card-header-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  <span>Extracted {extractedSubjects.length} Courses:</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                    Verify or edit grades below
                  </span>
                </div>

                <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 4 }}>
                  {extractedSubjects.map((sub, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        fontSize: '0.82rem',
                      }}
                    >
                      <input
                        type="text"
                        value={sub.code}
                        onChange={(e) => {
                          const next = [...extractedSubjects];
                          next[i].code = e.target.value;
                          setExtractedSubjects(next);
                        }}
                        style={{ width: 70, fontWeight: 700, textTransform: 'uppercase', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', padding: '2px 4px', fontSize: '0.82rem', color: 'var(--text-primary)' }}
                      />
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => {
                          const next = [...extractedSubjects];
                          next[i].name = e.target.value;
                          setExtractedSubjects(next);
                        }}
                        style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', padding: '2px 4px', fontSize: '0.82rem', color: 'var(--text-primary)' }}
                      />
                      <input
                        type="text"
                        value={sub.grade}
                        onChange={(e) => {
                          const next = [...extractedSubjects];
                          next[i].grade = e.target.value;
                          setExtractedSubjects(next);
                        }}
                        style={{ width: 44, textAlign: 'center', fontWeight: 700, color: 'var(--bu-gold)', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', padding: '2px 4px', fontSize: '0.82rem' }}
                        placeholder="1.25"
                      />
                      <input
                        type="number"
                        value={sub.units}
                        onChange={(e) => {
                          const next = [...extractedSubjects];
                          next[i].units = parseFloat(e.target.value) || 0;
                          setExtractedSubjects(next);
                        }}
                        style={{ width: 36, textAlign: 'center', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', padding: '2px 4px', fontSize: '0.82rem', color: 'var(--text-primary)' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setExtractedSubjects(extractedSubjects.filter((_, idx) => idx !== i));
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => {
                    setExtractedSubjects([]);
                    setImageFiles([]);
                    setImagePreviews([]);
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Scan Again
                </button>
                <button
                  type="button"
                  onClick={handleImportToSemester}
                  className="btn btn-primary btn-sm"
                >
                  <i className="fa-solid fa-check"></i> Import All into New Semester
                </button>
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-color)', fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="fa-solid fa-shield-halved text-gold"></i>
            <span>All parsing occurs client-side in your browser. Zero student data is sent to external servers.</span>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
