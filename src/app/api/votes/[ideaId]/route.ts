import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ ideaId: string }> }
) {
  const { ideaId } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  }

  const { data: existing } = await supabase
    .from('votes')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('idea_id', ideaId)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Abstimmung fehlgeschlagen.' }, { status: 500 })
    }

    const { count } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', ideaId)

    return NextResponse.json({ voted: false, count: count ?? 0 })
  }

  const { error } = await supabase
    .from('votes')
    .insert({ idea_id: ideaId, user_id: user.id })

  if (error) {
    return NextResponse.json({ error: 'Abstimmung fehlgeschlagen.' }, { status: 500 })
  }

  const { count } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('idea_id', ideaId)

  return NextResponse.json({ voted: true, count: count ?? 0 })
}
