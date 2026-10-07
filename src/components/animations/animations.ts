// Bicol University GWA Calculator — Animation Registry & Random Picker

export type AnimationCategory = 'compute' | 'scan' | 'success' | 'import' | 'empty';

export interface AnimationEntry {
  id: string;
  name: string;
  src: string; // URL or path to lottie json/dotlottie
  category: AnimationCategory;
}

// Built-in SVG/Lottie fallback animations and LottieFiles references
export const ANIMATION_REGISTRY: Record<AnimationCategory, AnimationEntry[]> = {
  compute: [
    {
      id: 'calc-crunch',
      name: 'Calculator Computing',
      src: 'https://assets2.lottiefiles.com/packages/lf20_m6cuL6.json',
      category: 'compute',
    },
    {
      id: 'student-study',
      name: 'Student Focusing',
      src: 'https://assets9.lottiefiles.com/packages/lf20_1a8aoonq.json',
      category: 'compute',
    },
    {
      id: 'book-flipping',
      name: 'Book Pages Flipping',
      src: 'https://assets4.lottiefiles.com/packages/lf20_w51pcehl.json',
      category: 'compute',
    },
    {
      id: 'math-analytics',
      name: 'Academic Data Math',
      src: 'https://assets5.lottiefiles.com/packages/lf20_cbrbre30.json',
      category: 'compute',
    },
  ],
  scan: [
    {
      id: 'scan-doc',
      name: 'Document Scanner',
      src: 'https://assets10.lottiefiles.com/packages/lf20_6sxyjyjj.json',
      category: 'scan',
    },
    {
      id: 'scan-search',
      name: 'Text Search Radar',
      src: 'https://assets3.lottiefiles.com/packages/lf20_x62chJ.json',
      category: 'scan',
    },
  ],
  success: [
    {
      id: 'success-badge',
      name: 'Academic Shield Achievement',
      src: 'https://assets1.lottiefiles.com/packages/lf20_jbrw3hcz.json',
      category: 'success',
    },
    {
      id: 'confetti-pop',
      name: 'Celebration Confetti',
      src: 'https://assets6.lottiefiles.com/packages/lf20_rovf9gzu.json',
      category: 'success',
    },
  ],
  import: [
    {
      id: 'upload-file',
      name: 'Cloud Import',
      src: 'https://assets8.lottiefiles.com/packages/lf20_q5pk6p1k.json',
      category: 'import',
    },
  ],
  empty: [
    {
      id: 'empty-books',
      name: 'Waiting for Courses',
      src: 'https://assets3.lottiefiles.com/packages/lf20_kuhijlvx.json',
      category: 'empty',
    },
  ],
};

// Memory to prevent immediate repetition of the same animation
const lastAnimationIndex: Partial<Record<AnimationCategory, number>> = {};

/**
 * Returns a randomized animation from the category, guaranteeing it does not repeat
 * the immediately previous animation if the category has 2+ choices.
 */
export function getRandomAnimation(category: AnimationCategory): AnimationEntry {
  const pool = ANIMATION_REGISTRY[category];
  if (!pool || pool.length === 0) {
    throw new Error(`No animations registered for category: ${category}`);
  }
  if (pool.length === 1) return pool[0];

  const lastIdx = lastAnimationIndex[category] ?? -1;
  let newIdx: number;

  do {
    newIdx = Math.floor(Math.random() * pool.length);
  } while (newIdx === lastIdx);

  lastAnimationIndex[category] = newIdx;
  return pool[newIdx];
}
