/** The final index is the completion page, not another dhikr. */
export function nextManualAdhkarPage(index: number, total: number) {
  return Math.min(index + 1, total);
}

export function nextAdhkarPage(index: number, total: number, count: number, repetitions: number) {
  return count >= repetitions ? nextManualAdhkarPage(index, total) : index;
}