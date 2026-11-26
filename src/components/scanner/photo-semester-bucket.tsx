import { useRef, useState, type DragEvent } from 'react';
import { FolderOpen, GripVertical, Trash2, Upload, X } from 'lucide-react';

import type { SemesterBucket } from './scan-buckets';

export const SCAN_IMAGE_DRAG_TYPE = 'application/x-bu-scan-image';
interface BucketProps {
  bucket: SemesterBucket; position: number; buckets: SemesterBucket[]; isProcessing: boolean;
  onTitle: (title: string) => void; onChoose: () => void; onFiles: (files: File[]) => void;
  onRemove: () => void; onRemoveImage: (index: number) => void;
  onMove: (from: string, index: number, preview: string, target: string) => void;
  onNotice: (message: string) => void;
}

/** One upload group: native file drops and image moves share the same controlled bucket actions. */
export function PhotoSemesterBucket({ bucket, position, buckets, isProcessing, onTitle, onChoose, onFiles, onRemove, onRemoveImage, onMove, onNotice }: BucketProps) {
  const [isOver, setIsOver] = useState(false);
  const [dragged, setDragged] = useState<number | null>(null);
  const dragDepth = useRef(0);
  const accepts = (event: DragEvent) => event.dataTransfer.types.includes('Files') || event.dataTransfer.types.includes(SCAN_IMAGE_DRAG_TYPE);
  const drop = (event: DragEvent) => {
    event.preventDefault(); event.stopPropagation(); dragDepth.current = 0; setIsOver(false);
    if (isProcessing) return;
    const payload = event.dataTransfer.getData(SCAN_IMAGE_DRAG_TYPE);
    if (!payload) { onFiles(Array.from(event.dataTransfer.files)); return; }
    try {
      const value: unknown = JSON.parse(payload);
      if (!value || typeof value !== 'object' || !('from' in value) || !('index' in value) || !('preview' in value)
        || typeof value.from !== 'string' || typeof value.index !== 'number' || typeof value.preview !== 'string') {
        onNotice('Move a selected image using its drag handle or Move to menu.'); return;
      }
      onMove(value.from, value.index, value.preview, bucket.id);
    } catch { onNotice('This image move could not be read. Use Move to instead.'); }
  };
  return <section className={`photo-semester-group${isOver ? ' is-drop-target' : ''}`} aria-label={`Images for ${bucket.title}`}
    onDragEnter={event => { if (!accepts(event)) return; event.preventDefault(); event.stopPropagation(); if (!isProcessing) { dragDepth.current++; setIsOver(true); } }}
    onDragOver={event => { if (!accepts(event)) return; event.preventDefault(); event.stopPropagation(); event.dataTransfer.dropEffect = isProcessing ? 'none' : event.dataTransfer.types.includes(SCAN_IMAGE_DRAG_TYPE) ? 'move' : 'copy'; }}
    onDragLeave={event => { event.stopPropagation(); if (--dragDepth.current <= 0) { dragDepth.current = 0; setIsOver(false); } }} onDrop={drop}>
    <div className="photo-semester-heading"><label className="photo-semester-name"><FolderOpen size={20} aria-hidden="true" /><span className="photo-sr-only">Semester {position + 1} title</span><input value={bucket.title} onChange={event => onTitle(event.target.value)} maxLength={500} disabled={isProcessing} /></label>
      {buckets.length > 1 && <button type="button" className="photo-icon photo-danger" aria-label={`Remove semester ${bucket.title}`} title="Remove semester" disabled={isProcessing} onClick={onRemove}><Trash2 size={18} aria-hidden="true" /></button>}</div>
    <p className="photo-helper">{bucket.files.length} image{bucket.files.length === 1 ? '' : 's'}</p>
    <div className="photo-image-list">{bucket.files.map((file, index) => <div className={`photo-image-row${dragged === index ? ' is-dragging' : ''}`} key={bucket.previews[index]}>
      <button type="button" className="photo-icon photo-drag-handle" draggable={!isProcessing} disabled={isProcessing} aria-label={`Drag image ${index + 1} in ${bucket.title}; Move to is also available`} title="Drag to another semester"
        onDragStart={event => { event.dataTransfer.setData(SCAN_IMAGE_DRAG_TYPE, JSON.stringify({ from: bucket.id, index, preview: bucket.previews[index] })); event.dataTransfer.effectAllowed = 'move'; setDragged(index); }} onDragEnd={() => setDragged(null)}><GripVertical size={18} aria-hidden="true" /></button>
      <img src={bucket.previews[index]} width="56" height="48" loading="lazy" decoding="async" draggable={false} alt={`Image ${index + 1} for ${bucket.title}`} />
      <div className="photo-image-label"><strong>Image {index + 1}</strong><span title={file.name}>{file.name}</span></div>
      {buckets.length > 1 && <label className="photo-move"><span className="photo-sr-only">Move image {index + 1} from {bucket.title} to semester</span><select value="" disabled={isProcessing} onChange={event => onMove(bucket.id, index, bucket.previews[index], event.target.value)}><option value="" disabled>Move to…</option>{buckets.filter(target => target.id !== bucket.id).map(target => <option key={target.id} value={target.id}>{target.title}</option>)}</select></label>}
      <button type="button" className="photo-icon photo-danger" disabled={isProcessing} onClick={() => onRemoveImage(index)} aria-label={`Remove image ${index + 1} from ${bucket.title}: ${file.name}`} title="Remove image"><X size={19} aria-hidden="true" /></button>
    </div>)}</div>
    <button type="button" className="photo-drop-button" disabled={isProcessing} onClick={onChoose}><Upload size={20} aria-hidden="true" /><span>{isOver ? `Drop images into ${bucket.title}` : bucket.files.length ? 'Drop more images here or choose images' : 'Drop images here or choose images'}</span></button>
  </section>;
}
