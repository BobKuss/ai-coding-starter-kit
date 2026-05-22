'use client'

import { ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoteButtonProps {
  voteCount: number
  hasVoted: boolean
  onVote: () => void
  disabled?: boolean
}

export function VoteButton({ voteCount, hasVoted, onVote, disabled }: VoteButtonProps) {
  return (
    <button
      type="button"
      onClick={onVote}
      disabled={disabled}
      aria-label={hasVoted ? 'Stimme zurücknehmen' : 'Für diese Idee abstimmen'}
      aria-pressed={disabled ? undefined : hasVoted ? 'true' : 'false'}
      className={cn(
        'flex flex-col items-center justify-center shrink-0 rounded-xl w-12 h-14 gap-0.5 text-sm font-semibold transition-all duration-150',
        hasVoted
          ? 'bg-gradient-to-b from-violet-600 to-indigo-500 text-white shadow-[0_0_16px_rgba(124,58,237,0.3)]'
          : 'border border-zinc-700 text-zinc-400 hover:border-violet-500/50 hover:text-violet-400 hover:-translate-y-0.5',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
      )}
    >
      <ChevronUp className="w-4 h-4" />
      <span className="text-xs leading-none">{voteCount}</span>
    </button>
  )
}
