export type IdeaStatus = 'open' | 'planned' | 'in_progress' | 'done' | 'rejected'
export type SortBy = 'votes' | 'newest'
export type FilterStatus = 'all' | IdeaStatus

export interface IdeaLike {
  id: string
  status: string | null
  created_at: string | null
  votes?: { count: number }[]
}

export function filterAndSortIdeas<T extends IdeaLike>(
  ideas: T[],
  filterStatus: FilterStatus,
  sortBy: SortBy
): T[] {
  const filtered =
    filterStatus === 'all' ? ideas : ideas.filter((i) => i.status === filterStatus)

  return [...filtered].sort((a, b) => {
    if (sortBy === 'votes') {
      return (b.votes?.[0]?.count ?? 0) - (a.votes?.[0]?.count ?? 0)
    }
    return (
      new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    )
  })
}
