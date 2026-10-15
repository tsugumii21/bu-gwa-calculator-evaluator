import studentAnimUrl from '../../assets/animations/student.json?url';
import onlineTestAnimUrl from '../../assets/animations/online-test.json?url';
import girlPhoneAnimUrl from '../../assets/animations/girl-phone.json?url';
import mathCrunchAnimUrl from '../../assets/animations/math-crunch.json?url';
import deskStudyAnimUrl from '../../assets/animations/desk-study.json?url';

export type AnimationCategory = 'compute' | 'scan' | 'success' | 'import' | 'empty';

export interface AnimationEntry {
  id: string;
  name: string;
  src?: string;
  data?: object;
  category: AnimationCategory;
}

// 5 Local Lottie Animations loaded on demand via static URLs (zero main-bundle bloat)
export const ANIMATION_REGISTRY: Record<AnimationCategory, AnimationEntry[]> = {
  compute: [
    {
      id: 'math-crunch',
      name: 'Calculating Academic Metrics',
      src: mathCrunchAnimUrl,
      category: 'compute',
    },
    {
      id: 'student-focus',
      name: 'Student Focusing',
      src: studentAnimUrl,
      category: 'compute',
    },
    {
      id: 'online-test',
      name: 'Evaluating Academic Records',
      src: onlineTestAnimUrl,
      category: 'compute',
    },
    {
      id: 'girl-phone',
      name: 'Analyzing University Course Records',
      src: girlPhoneAnimUrl,
      category: 'compute',
    },
    {
      id: 'desk-study',
      name: 'Evaluating Academic Trajectory',
      src: deskStudyAnimUrl,
      category: 'compute',
    },
  ],
  scan: [
    {
      id: 'online-test',
      name: 'Scanning Academic Document',
      src: onlineTestAnimUrl,
      category: 'scan',
    },
    {
      id: 'girl-phone',
      name: 'Processing Grade Screenshot',
      src: girlPhoneAnimUrl,
      category: 'scan',
    },
  ],
  success: [
    {
      id: 'student-focus',
      name: 'Academic Standing Verified',
      src: studentAnimUrl,
      category: 'success',
    },
  ],
  import: [
    {
      id: 'math-crunch',
      name: 'Batch Ingesting Semesters',
      src: mathCrunchAnimUrl,
      category: 'import',
    },
    {
      id: 'girl-phone',
      name: 'Importing Course Data',
      src: girlPhoneAnimUrl,
      category: 'import',
    },
  ],
  empty: [
    {
      id: 'student-focus',
      name: 'Awaiting Course Input',
      src: studentAnimUrl,
      category: 'empty',
    },
  ],
};

// Memory / session-backed Shuffle Bag to guarantee uniform random distribution
// and strictly prevent consecutive repeats or unbalanced repetitions.
const sessionKeyPrefix = 'bu_lottie_bag_';

function getStoredBag(category: AnimationCategory): number[] | null {
  try {
    const raw = sessionStorage.getItem(`${sessionKeyPrefix}${category}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'number')) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
  return null;
}

function saveStoredBag(category: AnimationCategory, bag: number[], lastIdx: number): void {
  try {
    sessionStorage.setItem(`${sessionKeyPrefix}${category}`, JSON.stringify(bag));
    sessionStorage.setItem(`${sessionKeyPrefix}${category}_last`, String(lastIdx));
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

function getStoredLastIdx(category: AnimationCategory): number {
  try {
    const raw = sessionStorage.getItem(`${sessionKeyPrefix}${category}_last`);
    if (raw !== null) {
      const num = parseInt(raw, 10);
      if (!isNaN(num)) return num;
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
  return -1;
}

// In-memory fallback
const memoryBags: Partial<Record<AnimationCategory, number[]>> = {};
const memoryLastIdx: Partial<Record<AnimationCategory, number>> = {};

/**
 * Fisher-Yates array shuffle for uniform randomness
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Returns a randomized animation from the category using a Shuffle Bag (Deck) algorithm.
 * Guarantees that:
 * 1. Every animation in the pool of 5 is played before any repeats.
 * 2. An animation NEVER plays twice in a row across bag boundary reshuffles.
 * 3. Distribution across all 5 JSON animations is 100% fair and randomized.
 */
export function getRandomAnimation(category: AnimationCategory): AnimationEntry {
  const pool = ANIMATION_REGISTRY[category];
  if (!pool || pool.length === 0) {
    throw new Error(`No animations registered for category: ${category}`);
  }
  if (pool.length === 1) return pool[0];

  let bag = getStoredBag(category) ?? memoryBags[category] ?? [];
  let lastIdx = getStoredLastIdx(category);
  if (lastIdx === -1) {
    lastIdx = memoryLastIdx[category] ?? -1;
  }

  // Filter bag to make sure all stored indices are valid for current pool
  bag = bag.filter((idx) => idx >= 0 && idx < pool.length);

  // If bag is empty, generate a fresh shuffled deck of all indices [0..pool.length - 1]
  if (bag.length === 0) {
    const freshIndices = Array.from({ length: pool.length }, (_, i) => i);
    bag = shuffleArray(freshIndices);

    // Guard against back-to-back repetition across deck refills
    if (pool.length > 1 && bag[0] === lastIdx) {
      // Swap first item with the last item so it doesn't repeat the previous animation
      const swapTarget = bag.length - 1;
      [bag[0], bag[swapTarget]] = [bag[swapTarget], bag[0]];
    }
  }

  // Pop next index from deck
  const chosenIdx = bag.shift()!;
  lastIdx = chosenIdx;

  // Persist state
  memoryBags[category] = bag;
  memoryLastIdx[category] = lastIdx;
  saveStoredBag(category, bag, lastIdx);

  return pool[chosenIdx];
}
