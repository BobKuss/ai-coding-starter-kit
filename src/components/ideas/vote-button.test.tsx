import { render, screen, fireEvent } from '@testing-library/react'
import { VoteButton } from './vote-button'

describe('VoteButton', () => {
  it('zeigt die Stimmenzahl an', () => {
    render(<VoteButton voteCount={5} hasVoted={false} onVote={() => {}} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('rendert inaktiven Zustand korrekt', () => {
    render(<VoteButton voteCount={0} hasVoted={false} onVote={() => {}} />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    expect(btn.className).not.toContain('from-violet-600')
  })

  it('rendert aktiven Zustand korrekt (hat gevotet)', () => {
    render(<VoteButton voteCount={3} hasVoted={true} onVote={() => {}} />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(btn.className).toContain('from-violet-600')
  })

  it('ruft onVote beim Klick auf', () => {
    const onVote = vi.fn()
    render(<VoteButton voteCount={1} hasVoted={false} onVote={onVote} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onVote).toHaveBeenCalledTimes(1)
  })

  it('ruft onVote NICHT auf wenn disabled', () => {
    const onVote = vi.fn()
    render(<VoteButton voteCount={1} hasVoted={false} onVote={onVote} disabled />)
    fireEvent.click(screen.getByRole('button'))
    expect(onVote).not.toHaveBeenCalled()
  })

  it('zeigt 0 korrekt an', () => {
    render(<VoteButton voteCount={0} hasVoted={false} onVote={() => {}} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
