import { describe, it, expect } from 'vitest'
import { filterAndSortIdeas, type IdeaLike } from './ideas-board'

function makeIdea(overrides: Partial<IdeaLike> & { id: string }): IdeaLike {
  return {
    status: 'open',
    created_at: '2026-01-01T00:00:00Z',
    votes: [{ count: 0 }],
    ...overrides,
  }
}

const BASE_IDEAS: IdeaLike[] = [
  makeIdea({ id: 'a', status: 'open',        created_at: '2026-01-03T00:00:00Z', votes: [{ count: 5 }] }),
  makeIdea({ id: 'b', status: 'planned',     created_at: '2026-01-02T00:00:00Z', votes: [{ count: 10 }] }),
  makeIdea({ id: 'c', status: 'in_progress', created_at: '2026-01-05T00:00:00Z', votes: [{ count: 1 }] }),
  makeIdea({ id: 'd', status: 'done',        created_at: '2026-01-04T00:00:00Z', votes: [{ count: 3 }] }),
  makeIdea({ id: 'e', status: 'rejected',    created_at: '2026-01-01T00:00:00Z', votes: [{ count: 7 }] }),
]

describe('filterAndSortIdeas', () => {
  describe('filtering', () => {
    it('returns all ideas when filterStatus is "all"', () => {
      const result = filterAndSortIdeas(BASE_IDEAS, 'all', 'votes')
      expect(result).toHaveLength(5)
    })

    it('filters to only open ideas', () => {
      const result = filterAndSortIdeas(BASE_IDEAS, 'open', 'votes')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('a')
    })

    it('filters to only planned ideas', () => {
      const result = filterAndSortIdeas(BASE_IDEAS, 'planned', 'votes')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('b')
    })

    it('filters to only in_progress ideas', () => {
      const result = filterAndSortIdeas(BASE_IDEAS, 'in_progress', 'votes')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('c')
    })

    it('filters to only done ideas', () => {
      const result = filterAndSortIdeas(BASE_IDEAS, 'done', 'votes')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('d')
    })

    it('filters to only rejected ideas', () => {
      const result = filterAndSortIdeas(BASE_IDEAS, 'rejected', 'votes')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('e')
    })

    it('returns empty array when no ideas match the filter', () => {
      const result = filterAndSortIdeas(BASE_IDEAS, 'done', 'votes')
      const onlyDone = result.filter((i) => i.status === 'done')
      expect(onlyDone).toHaveLength(result.length)
    })

    it('returns empty array on empty input', () => {
      expect(filterAndSortIdeas([], 'all', 'votes')).toEqual([])
      expect(filterAndSortIdeas([], 'open', 'votes')).toEqual([])
    })
  })

  describe('sorting by votes', () => {
    it('sorts by votes descending by default', () => {
      const result = filterAndSortIdeas(BASE_IDEAS, 'all', 'votes')
      const counts = result.map((i) => i.votes?.[0]?.count ?? 0)
      expect(counts).toEqual([10, 7, 5, 3, 1])
    })

    it('places highest-vote idea first', () => {
      const result = filterAndSortIdeas(BASE_IDEAS, 'all', 'votes')
      expect(result[0].id).toBe('b')
    })

    it('handles missing votes array gracefully (treats as 0)', () => {
      const ideas: IdeaLike[] = [
        makeIdea({ id: 'x', votes: undefined }),
        makeIdea({ id: 'y', votes: [{ count: 5 }] }),
      ]
      const result = filterAndSortIdeas(ideas, 'all', 'votes')
      expect(result[0].id).toBe('y')
      expect(result[1].id).toBe('x')
    })

    it('does not mutate the original array', () => {
      const original = [...BASE_IDEAS]
      filterAndSortIdeas(BASE_IDEAS, 'all', 'votes')
      expect(BASE_IDEAS).toEqual(original)
    })
  })

  describe('sorting by newest', () => {
    it('sorts by created_at descending', () => {
      const result = filterAndSortIdeas(BASE_IDEAS, 'all', 'newest')
      const ids = result.map((i) => i.id)
      expect(ids).toEqual(['c', 'd', 'a', 'b', 'e'])
    })

    it('places newest idea first', () => {
      const result = filterAndSortIdeas(BASE_IDEAS, 'all', 'newest')
      expect(result[0].id).toBe('c') // 2026-01-05
    })

    it('handles null created_at gracefully (treated as epoch 0)', () => {
      const ideas: IdeaLike[] = [
        makeIdea({ id: 'null-date', created_at: null }),
        makeIdea({ id: 'has-date', created_at: '2026-01-01T00:00:00Z' }),
      ]
      const result = filterAndSortIdeas(ideas, 'all', 'newest')
      expect(result[0].id).toBe('has-date')
    })
  })

  describe('combined filter + sort', () => {
    it('filters then sorts: open ideas by newest', () => {
      const ideas: IdeaLike[] = [
        makeIdea({ id: 'o1', status: 'open', created_at: '2026-01-01T00:00:00Z', votes: [{ count: 3 }] }),
        makeIdea({ id: 'o2', status: 'open', created_at: '2026-01-03T00:00:00Z', votes: [{ count: 1 }] }),
        makeIdea({ id: 'p1', status: 'planned', created_at: '2026-01-05T00:00:00Z', votes: [{ count: 10 }] }),
      ]
      const result = filterAndSortIdeas(ideas, 'open', 'newest')
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('o2')
      expect(result[1].id).toBe('o1')
    })

    it('filters then sorts: open ideas by votes', () => {
      const ideas: IdeaLike[] = [
        makeIdea({ id: 'o1', status: 'open', votes: [{ count: 3 }] }),
        makeIdea({ id: 'o2', status: 'open', votes: [{ count: 8 }] }),
        makeIdea({ id: 'p1', status: 'planned', votes: [{ count: 10 }] }),
      ]
      const result = filterAndSortIdeas(ideas, 'open', 'votes')
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('o2')
    })
  })
})
