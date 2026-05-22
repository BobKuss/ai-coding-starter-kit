'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const origin = window.location.origin

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        shouldCreateUser: false,
      },
    })

    setLoading(false)

    if (error) {
      setError('Etwas ist schiefgelaufen. Bitte versuche es erneut.')
      return
    }

    setSuccess(true)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">City Concierge Voting</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Internes Board für Produktideen
          </p>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-2 py-4">
              <p className="font-medium">Schau in dein Postfach!</p>
              <p className="text-sm text-muted-foreground">
                Wir haben dir einen Login-Link an <strong>{email}</strong> geschickt.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="du@cityconcierge.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Wird gesendet…' : 'Magic Link senden'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Nur für eingeladene Team-Mitglieder
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
