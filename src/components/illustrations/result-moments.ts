export type ResultMomentPool = 'president' | 'dean' | 'support' | 'latin';

/** Native website mascot poses and original encouragement, selected once per calculation. */
export const RESULT_MOMENTS = [
  ['pl-high-five', 'You turned steady effort into an exceptional term. Be proud of the work, and carry that discipline forward.'],
  ['pl-trophy', 'Behind this result are days you chose to keep going. Let that quiet determination lead your next chapter.'],
  ['pl-star', 'Your curiosity and commitment brought you here. Keep asking, keep learning, and keep reaching further.'],
  ['pl-flag', 'Take a breath and celebrate how far you have come. The habits you built are worth carrying with you.'],
  ['pl-jump', 'This moment belongs to every small effort you made along the way. Give yourself credit for showing up.'],
  ['dl-medal', 'Your progress is earned, one difficult lesson at a time. Keep trusting the work you put into growing.'],
  ['dl-grade-sheet', 'Consistency has brought you forward. Let this term remind you what patience and practice can build.'],
  ['dl-shared-star', 'You have made room for growth through hard work. Celebrate this step, then reach for the next one.'],
  ['dl-milestone', 'Every lesson you stayed with helped shape this result. Keep that courage when the next challenge comes.'],
  ['dl-fist-bump', 'Be proud of your progress and generous with yourself. There is still so much ahead for you to discover.'],
  ['support-study', 'A title is one milestone, not the measure of your potential. Choose your next step and keep moving.'],
  ['support-encourage', 'A difficult term does not close your story. Ask for support, take a breath, and begin again with what you know now.'],
  ['support-plan', 'You do not need to solve the whole journey today. One clear plan and one steady step can move you forward.'],
  ['support-progress', 'Progress is built through practice, questions, and second attempts. Every honest effort gives you something to build on.'],
  ['support-sunrise', 'There is room ahead for a new beginning. Bring what you have learned, and give your next chapter a chance.'],
] as const;

export const SUPPORT_MOMENT_INDEX = 10;

const RESULT_POOLS: Record<ResultMomentPool, readonly number[]> = {
  president: [0, 1, 2, 3, 4], dean: [5, 6, 7, 8, 9], support: [10, 11, 12, 13, 14],
  latin: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
};

/** Avoid immediate repeats; supportive results never borrow an award pose. */
export function chooseResultMoment(category: ResultMomentPool, previous: number) {
  const pool = RESULT_POOLS[category].filter(index => index !== previous);
  return pool[Math.floor(Math.random() * pool.length)];
}
