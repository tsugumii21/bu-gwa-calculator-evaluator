import { describe, expect, it } from 'vitest';

import { addBucketFiles, moveBucketImage, removeBucketImage, retainUnchangedResults, type SemesterBucket } from '../scan-buckets';
import type { ScanImageResult } from '../../../types/scan';

const file = (name = 'sample.png') => new File(['synthetic'], name, { type: 'image/png' });
const buckets = (): SemesterBucket[] => [
  { id: 'a', title: 'First', files: [file()], previews: ['blob:a'], extractedSubjects: [] },
  { id: 'b', title: 'Second', files: [], previews: [], extractedSubjects: [] },
  { id: 'c', title: 'Other', files: [], previews: [], extractedSubjects: [] },
];

describe('Temporary semester image grouping', () => {
  it('moves an image and preview together without changing total files or unrelated semesters', () => {
    const original = buckets();
    const changed = moveBucketImage(original, 'a', 'b', 0, 'blob:a');
    expect({ files: changed.buckets.map(bucket => bucket.files.length), preview: changed.buckets[1].previews,
      affected: changed.affected, released: changed.removedPreviews, untouched: changed.buckets[2] === original[2], original: original[0].files.length })
      .toEqual({ files: [0, 1, 0], preview: ['blob:a'], affected: ['a', 'b'], released: [], untouched: true, original: 1 });
  });
  it.each([['a', 0, 'blob:a'], ['missing', 0, 'blob:a'], ['b', 2, 'blob:a'], ['b', 0, 'blob:stale']])('ignores a same-target, missing or stale move to %s', (target, index, preview) => {
    const original = buckets();
    expect(moveBucketImage(original, 'a', target, index, preview).buckets).toBe(original);
  });
  it('keeps existing previews when adding files and invalidates only the changed semester', () => {
    const changed = addBucketFiles(buckets(), 'a', [file('new.png')], () => 'blob:new');
    expect({ previews: changed.buckets[0].previews, observations: changed.buckets[0].extractedSubjects, affected: changed.affected })
      .toEqual({ previews: ['blob:a', 'blob:new'], observations: undefined, affected: ['a'] });
  });
  it('retains selected files when an incoming file is rejected', () => {
    const original = buckets();
    const changed = addBucketFiles(original, 'b', [new File(['text'], 'bad.txt', { type: 'text/plain' })], () => 'never');
    expect({ same: changed.buckets === original, message: changed.message }).toEqual({ same: true, message: 'bad.txt: use PNG, JPG, or WebP.' });
  });
  it('enforces the global image limit across semesters', () => {
    const original = buckets();
    original[0].files = Array.from({ length: 20 }, () => file());
    expect(addBucketFiles(original, 'b', [file()], () => 'never').message).toContain('maximum batch size');
  });
  it('releases only the removed preview and invalidates indexed source results', () => {
    const changed = removeBucketImage(buckets(), 'a', 0);
    const results = ['a:0', 'a:1', 'b:0'].map(sourceId => ({ sourceId } as ScanImageResult));
    expect({ previews: changed.removedPreviews, retained: retainUnchangedResults(results, changed.affected).map(result => result.sourceId) })
      .toEqual({ previews: ['blob:a'], retained: ['b:0'] });
  });
});
