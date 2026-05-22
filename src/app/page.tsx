'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { LogoutButton } from '@/components/auth/logout-button'
import { SubmitIdeaDialog, type SubmittedIdea } from '@/components/ideas/submit-idea-dialog'
import { VoteButton } from '@/components/ideas/vote-button'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { filterAndSortIdeas, type SortBy, type FilterStatus, type IdeaStatus } from '@/lib/ideas-board'

type Idea = SubmittedIdea & { user_has_voted: boolean }

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
}

const STATUS_CONFIG: Record<IdeaStatus, { label: string; dot: string; text: string; bg: string }> = {
  open:        { label: 'Offen',     dot: 'bg-zinc-400',   text: 'text-zinc-300',  bg: 'bg-zinc-400/10 border-zinc-700' },
  planned:     { label: 'Geplant',   dot: 'bg-blue-400',   text: 'text-blue-300',  bg: 'bg-blue-400/10 border-blue-700/40' },
  in_progress: { label: 'In Arbeit', dot: 'bg-amber-400',  text: 'text-amber-300', bg: 'bg-amber-400/10 border-amber-600/40' },
  done:        { label: 'Erledigt',  dot: 'bg-green-400',  text: 'text-green-300', bg: 'bg-green-400/10 border-green-700/40' },
  rejected:    { label: 'Abgelehnt', dot: 'bg-red-400',    text: 'text-red-300',   bg: 'bg-red-400/10 border-red-700/40' },
}

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all',         label: 'Alle' },
  { value: 'open',        label: 'Offen' },
  { value: 'planned',     label: 'Geplant' },
  { value: 'in_progress', label: 'In Arbeit' },
  { value: 'done',        label: 'Erledigt' },
  { value: 'rejected',    label: 'Abgelehnt' },
]

function StatusBadge({ status }: { status: string | null }) {
  const s = (status ?? 'open') as IdeaStatus
  const cfg = STATUS_CONFIG[s] ?? STATUS_CONFIG.open
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border',
        cfg.bg,
        cfg.text
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

interface IdeaCardProps {
  idea: Idea
  onVote: (ideaId: string) => void
  voting: boolean
}

function IdeaCard({ idea, onVote, voting }: IdeaCardProps) {
  const voteCount = idea.votes?.[0]?.count ?? 0
  const author = idea.profiles?.full_name ?? idea.profiles?.email ?? 'Unbekannt'

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-5 hover:border-zinc-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex items-start gap-4">
      <VoteButton
        voteCount={voteCount}
        hasVoted={idea.user_has_voted}
        onVote={() => onVote(idea.id)}
        disabled={voting}
      />
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h3 className="text-zinc-50 font-semibold text-base leading-snug">
            {idea.title}
          </h3>
          <StatusBadge status={idea.status} />
        </div>
        {idea.description && (
          <p className="text-zinc-400 text-sm mt-1.5 line-clamp-2 leading-relaxed">
            {idea.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
          <span>{author}</span>
          <span>·</span>
          <span>{formatDate(idea.created_at)}</span>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [votingIds, setVotingIds] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortBy>('votes')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  useEffect(() => {
    fetch('/api/ideas')
      .then((r) => r.json())
      .then((data) => setIdeas(Array.isArray(data) ? data : []))
      .catch(() => setIdeas([]))
      .finally(() => setLoading(false))
  }, [])

  const displayedIdeas = useMemo(
    () => filterAndSortIdeas(ideas, filterStatus, sortBy),
    [ideas, filterStatus, sortBy]
  )

  function handleIdeaSubmitted(raw: SubmittedIdea) {
    const idea: Idea = { ...raw, user_has_voted: false }
    setIdeas((prev) => [idea, ...prev])
  }

  async function handleVote(ideaId: string) {
    if (votingIds.has(ideaId)) return

    const prev = ideas.find((i) => i.id === ideaId)
    if (!prev) return

    const wasVoted = prev.user_has_voted
    const delta = wasVoted ? -1 : 1
    setIdeas((list) =>
      list.map((idea) =>
        idea.id === ideaId
          ? {
              ...idea,
              user_has_voted: !wasVoted,
              votes: [{ count: Math.max(0, (idea.votes?.[0]?.count ?? 0) + delta) }],
            }
          : idea
      )
    )
    setVotingIds((s) => new Set(s).add(ideaId))

    try {
      const res = await fetch(`/api/votes/${ideaId}`, { method: 'POST' })
      if (!res.ok) throw new Error('Server error')
      const { count } = await res.json()
      setIdeas((list) =>
        list.map((idea) =>
          idea.id === ideaId ? { ...idea, votes: [{ count }] } : idea
        )
      )
    } catch {
      setIdeas((list) =>
        list.map((idea) =>
          idea.id === ideaId
            ? {
                ...idea,
                user_has_voted: wasVoted,
                votes: [{ count: prev.votes?.[0]?.count ?? 0 }],
              }
            : idea
        )
      )
      toast.error('Abstimmung fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setVotingIds((s) => {
        const next = new Set(s)
        next.delete(ideaId)
        return next
      })
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Nav */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-zinc-50">City Concierge Voting</span>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-50">Ideen Board</h1>
            <p className="text-zinc-400 text-sm mt-1">
              {ideas.length} {ideas.length === 1 ? 'Idee' : 'Ideen'} eingereicht
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:opacity-90 text-white rounded-xl font-semibold px-4 py-2 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Neue Idee
          </Button>
        </div>

        {/* Controls: filter chips + sort */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Status filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap flex-1">
            {FILTER_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={cn(
                  'text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150',
                  filterStatus === opt.value
                    ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_12px_rgba(124,58,237,0.25)]'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-40 bg-zinc-900 border-zinc-700 rounded-xl text-zinc-300 text-xs h-8 focus:ring-violet-500/30 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 rounded-xl text-zinc-300 text-xs">
              <SelectItem value="votes" className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                Meiste Votes
              </SelectItem>
              <SelectItem value="newest" className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                Neueste zuerst
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ideas list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 animate-pulse flex gap-4"
              >
                <div className="w-12 h-14 bg-zinc-800 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedIdeas.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            {filterStatus === 'all' ? (
              <>
                <p className="font-medium">Noch keine Ideen</p>
                <p className="text-sm mt-1">Sei der Erste und reiche eine Idee ein!</p>
                <Button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="mt-4 bg-gradient-to-r from-violet-600 to-indigo-500 hover:opacity-90 text-white rounded-xl font-semibold px-5 py-2 transition-opacity"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Erste Idee einreichen
                </Button>
              </>
            ) : (
              <>
                <p className="font-medium">Keine Ideen gefunden</p>
                <p className="text-sm mt-1">
                  Keine Ideen mit Status „{FILTER_OPTIONS.find((o) => o.value === filterStatus)?.label}" vorhanden.
                </p>
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className="mt-3 text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2"
                >
                  Filter zurücksetzen
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onVote={handleVote}
                voting={votingIds.has(idea.id)}
              />
            ))}
          </div>
        )}
      </main>

      <SubmitIdeaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleIdeaSubmitted}
      />
    </div>
  )
}
