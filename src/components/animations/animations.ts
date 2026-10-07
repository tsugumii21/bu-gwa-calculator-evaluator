import studentAnim from '../../assets/animations/student.json';
import onlineTestAnim from '../../assets/animations/online-test.json';
import onlineResultAnim from '../../assets/animations/online-result.json';
import girlPhoneAnim from '../../assets/animations/girl-phone.json';
import mathCrunchAnim from '../../assets/animations/math-crunch.json';

export type AnimationCategory = 'compute' | 'scan' | 'success' | 'import' | 'empty';

export interface AnimationEntry {
  id: string;
  name: string;
  src?: string;
  data: object;
  category: AnimationCategory;
}

// 5 New Local Lottie Animations (100% offline, zero network requests)
export const ANIMATION_REGISTRY: Record<AnimationCategory, AnimationEntry[]> = {
  compute: [
    {
      id: 'math-crunch',
      name: 'Calculating Academic Metrics',
      data: mathCrunchAnim,
      category: 'compute',
    },
    {
      id: 'student-focus',
      name: 'Student Focusing',
      data: studentAnim,
      category: 'compute',
    },
    {
      id: 'online-test',
      name: 'Evaluating Academic Records',
      data: onlineTestAnim,
      category: 'compute',
    },
    {
      id: 'online-result',
      name: 'Computing Honor Standing',
      data: onlineResultAnim,
      category: 'compute',
    },
    {
      id: 'girl-phone',
      name: 'Analyzing University Course Records',
      data: girlPhoneAnim,
      category: 'compute',
    },
  ],
  scan: [
    {
      id: 'online-test',
      name: 'Scanning Academic Document',
      data: onlineTestAnim,
      category: 'scan',
    },
    {
      id: 'girl-phone',
      name: 'Processing Grade Screenshot',
      data: girlPhoneAnim,
      category: 'scan',
    },
  ],
  success: [
    {
      id: 'online-result',
      name: 'Computation Complete',
      data: onlineResultAnim,
      category: 'success',
    },
    {
      id: 'student-focus',
      name: 'Academic Standing Verified',
      data: studentAnim,
      category: 'success',
    },
  ],
  import: [
    {
      id: 'math-crunch',
      name: 'Batch Ingesting Semesters',
      data: mathCrunchAnim,
      category: 'import',
    },
    {
      id: 'girl-phone',
      name: 'Importing Course Data',
      data: girlPhoneAnim,
      category: 'import',
    },
  ],
  empty: [
    {
      id: 'student-focus',
      name: 'Awaiting Course Input',
      data: studentAnim,
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
