export const SIMULATION_DEFAULT_UNITS = 21;
export const SIMULATION_MAX_UNITS = 200;
export const SIMULATION_DEFAULT_GRADE = 1.5;

/** Weighted hypothetical average; null means no units to project. */
export function projectGWA(currentPoints: number, currentUnits: number, futureUnits: number, futureGrade: number): number | null {
  if (![currentPoints, currentUnits, futureUnits, futureGrade].every(Number.isFinite)) return null;
  if (currentPoints < 0 || currentUnits < 0 || futureUnits < 0 || futureGrade < 1 || futureGrade > 3) return null;
  const totalUnits = currentUnits + futureUnits;
  return totalUnits > 0 ? (currentPoints + futureGrade * futureUnits) / totalUnits : null;
}
