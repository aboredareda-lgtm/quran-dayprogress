/** The final index is the completion page, not another dhikr. */
export function nextAdhkarPage(index: number, total: number, count: number, repetitions: number) {
  return count >= repetitions ? Math.min(index + 1, total) : index;
}