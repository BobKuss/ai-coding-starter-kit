import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const ideaSchema = z.object({
  title: z
    .string()
    .min(1, 'Titel ist erforderlich')
    .max(120, 'Titel darf maximal 120 Zeichen lang sein'),
  description: z
    .string()
    .max(1000, 'Beschreibung darf maximal 1000 Zeichen lang sein')
    .optional()
    .nullable(),
})

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültiges JSON' }, { status: 400 })
  }

  const parsed = ideaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { title, description } = parsed.data

  const { data, error } = await supabase
    .from('ideas')
    .insert({
      title,
      description: description ?? null,
      author_id: user.id,
    })
    .select(`
      id,
      title,
      description,
      status,
      created_at,
      updated_at,
      author_id,
      profiles!ideas_author_id_fkey (
        full_name,
        email
      )
    `)
    .single()

  if (error) {
    console.error('Idea insert error:', error)
    return NextResponse.json(
      { error: 'Einreichung fehlgeschlagen. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }

  return NextResponse.json(data, { status: 201 })
}

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('ideas')
    .select(`
      id,
      title,
      description,
      status,
      created_at,
      updated_at,
      author_id,
      profiles!ideas_author_id_fkey (
        full_name,
        email
      ),
      votes (count)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Ideas fetch error:', error)
    return NextResponse.json(
      { error: 'Ideen konnten nicht geladen werden.' },
      { status: 500 }
    )
  }

  const { data: userVotes } = await supabase
    .from('votes')
    .select('idea_id')
    .eq('user_id', user.id)

  const votedIds = new Set(userVotes?.map((v) => v.idea_id) ?? [])

  return NextResponse.json(
    (data ?? []).map((idea) => ({ ...idea, user_has_voted: votedIds.has(idea.id) }))
  )
}
