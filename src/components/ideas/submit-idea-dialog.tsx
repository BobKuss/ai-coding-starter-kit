'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const schema = z.object({
  title: z
    .string()
    .min(1, 'Titel ist erforderlich')
    .max(120, 'Titel darf maximal 120 Zeichen lang sein'),
  description: z
    .string()
    .max(1000, 'Beschreibung darf maximal 1000 Zeichen lang sein')
    .optional(),
})

type FormValues = z.infer<typeof schema>

export type SubmittedIdea = {
  id: string
  title: string
  description: string | null
  status: string | null
  created_at: string | null
  updated_at: string | null
  author_id: string | null
  profiles: { full_name: string | null; email: string } | null
  votes: { count: number }[]
}

interface SubmitIdeaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (idea: SubmittedIdea) => void
}

export function SubmitIdeaDialog({ open, onOpenChange, onSuccess }: SubmitIdeaDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '' },
  })

  const titleValue = form.watch('title') ?? ''
  const descriptionValue = form.watch('description') ?? ''

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error ?? 'Einreichung fehlgeschlagen. Bitte versuche es erneut.')
        return
      }

      const idea: SubmittedIdea = await res.json()
      toast.success('Idee eingereicht!')
      onSuccess(idea)
      onOpenChange(false)
      form.reset()
    } catch {
      toast.error('Einreichung fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!loading) onOpenChange(o) }}>
      <DialogContent className="bg-zinc-900 border border-zinc-800 rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-50 text-lg font-semibold">
            Neue Idee einreichen
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-zinc-300">Titel</FormLabel>
                    <span className={`text-xs ${titleValue.length > 110 ? 'text-amber-400' : 'text-zinc-500'}`}>
                      {titleValue.length}/120
                    </span>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Kurze, prägnante Beschreibung deiner Idee"
                      disabled={loading}
                      maxLength={120}
                      className="bg-zinc-900 border-zinc-700 rounded-lg focus-visible:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/20 text-zinc-50 placeholder:text-zinc-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-zinc-300">
                      Beschreibung <span className="text-zinc-500 font-normal">(optional)</span>
                    </FormLabel>
                    <span className={`text-xs ${descriptionValue.length > 900 ? 'text-amber-400' : 'text-zinc-500'}`}>
                      {descriptionValue.length}/1000
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Mehr Details zur Idee, Kontext, Motivation…"
                      disabled={loading}
                      maxLength={1000}
                      rows={4}
                      className="bg-zinc-900 border-zinc-700 rounded-lg focus-visible:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/20 text-zinc-50 placeholder:text-zinc-500 resize-none"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-500 hover:opacity-90 text-white rounded-xl font-semibold transition-opacity disabled:opacity-50"
              >
                {loading ? 'Wird eingereicht…' : 'Einreichen'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
