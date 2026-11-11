/** Moves the item at `from` to `to`, returning a new array (dnd-kit arrayMove semantics). */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items]
  if (from < 0 || from >= next.length || to < 0 || to >= next.length) return next
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item as T)
  return next
}

/** Dense positions (0..n-1) for an ordered list of ids. */
export function positionsFromOrder(ids: readonly string[]): { id: string; position: number }[] {
  return ids.map((id, position) => ({ id, position }))
}

/** Reorders `items` (with ids) to follow `orderedIds`; unknown ids are appended in original order. */
export function sortByIds<T extends { id: string }>(items: readonly T[], orderedIds: readonly string[]): T[] {
  const rank = new Map(orderedIds.map((id, i) => [id, i]))
  return [...items].sort((a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity))
}
