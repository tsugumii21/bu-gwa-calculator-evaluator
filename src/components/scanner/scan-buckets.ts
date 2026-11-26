import type { ScanCandidate, ScanImageResult } from '../../types/scan';
import { validateSelection } from './image-preparation';

/** Temporary images and observations belonging to one import semester. */
export interface SemesterBucket {
  id: string;
  title: string;
  files: File[];
  previews: string[];
  extractedSubjects?: ScanCandidate[];
}

/** Records affected index-based sources without performing browser cleanup. */
export interface BucketChange {
  buckets: SemesterBucket[];
  affected: string[];
  removedPreviews: string[];
  message: string;
}

const unchanged = (buckets: SemesterBucket[], message = ''): BucketChange => ({ buckets, affected: [], removedPreviews: [], message });

/** Adds accepted files using the same limits as the file picker, preserving existing previews. */
export function addBucketFiles(buckets: SemesterBucket[], id: string, files: File[], preview: (file: File) => string): BucketChange {
  if (!buckets.some(bucket => bucket.id === id)) return unchanged(buckets, 'Choose an existing semester.');
  const selection = validateSelection(buckets.flatMap(bucket => bucket.files), files);
  if (!selection.accepted.length) return unchanged(buckets, selection.rejected.join(' ') || 'Choose PNG, JPG or WebP images.');
  const previews = selection.accepted.map(preview);
  return { buckets: buckets.map(bucket => bucket.id !== id ? bucket : { ...bucket,
    files: [...bucket.files, ...selection.accepted], previews: [...bucket.previews, ...previews], extractedSubjects: undefined }),
  affected: [id], removedPreviews: [], message: `${selection.accepted.length} image(s) added. ${selection.rejected.join(' ')}`.trim() };
}

/** Moves one selected image without copying it or revoking its preview; stale drag payloads do nothing. */
export function moveBucketImage(buckets: SemesterBucket[], from: string, to: string, index: number, preview: string): BucketChange {
  const source = buckets.find(bucket => bucket.id === from);
  const target = buckets.find(bucket => bucket.id === to);
  if (from === to || !source || !target || !Number.isInteger(index) || index < 0 || source.previews[index] !== preview || !source.files[index]) return unchanged(buckets);
  return { buckets: buckets.map(bucket => {
    if (bucket.id === from) return { ...bucket, files: bucket.files.filter((_, at) => at !== index), previews: bucket.previews.filter((_, at) => at !== index), extractedSubjects: undefined };
    if (bucket.id === to) return { ...bucket, files: [...bucket.files, source.files[index]], previews: [...bucket.previews, preview], extractedSubjects: undefined };
    return bucket;
  }), affected: [from, to], removedPreviews: [], message: `Image moved to ${target.title}. Rescan affected semesters before importing.` };
}

/** Removes one image and invalidates all indexed observations in its semester. */
export function removeBucketImage(buckets: SemesterBucket[], id: string, index: number): BucketChange {
  const source = buckets.find(bucket => bucket.id === id);
  if (!source?.files[index]) return unchanged(buckets);
  return { buckets: buckets.map(bucket => bucket.id !== id ? bucket : { ...bucket,
    files: bucket.files.filter((_, at) => at !== index), previews: bucket.previews.filter((_, at) => at !== index), extractedSubjects: undefined }),
  affected: [id], removedPreviews: [source.previews[index]], message: 'Image removed.' };
}

/** Prevents shifted indices from attaching old OCR observations to a different image. */
export function retainUnchangedResults(results: ScanImageResult[], affected: string[]) {
  return results.filter(result => !affected.some(id => result.sourceId.startsWith(`${id}:`)));
}
