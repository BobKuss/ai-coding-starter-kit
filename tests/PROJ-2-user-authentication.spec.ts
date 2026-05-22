import { test, expect } from '@playwright/test'

// shadcn CardTitle renders as <div>, not <h1>, so use text selector
const goto = (page: import('@playwright/test').Page, path: string) =>
  page.goto(path, { waitUntil: 'domcontentloaded' })

// AC-1: Login-Seite rendert korrekt und zeigt alle UI-Elemente
test('AC-1: Login-Seite zeigt Formular mit E-Mail-Feld und Submit-Button', async ({ page }) => {
  await goto(page, '/login')
  await expect(page.getByText('City Concierge Voting')).toBeVisible()
  await expect(page.getByLabel('E-Mail-Adresse')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Magic Link senden' })).toBeVisible()
  await expect(page.getByText('Nur für eingeladene Team-Mitglieder')).toBeVisible()
})

// AC-1: Button deaktiviert während des Requests (Loading-State)
test('AC-1 (Loading State): Button ist deaktiviert und zeigt "Wird gesendet…" nach Absenden', async ({ page }) => {
  await goto(page, '/login')
  await page.getByLabel('E-Mail-Adresse').fill('test@example.com')

  const button = page.getByRole('button', { name: /Magic Link senden|Wird gesendet/ })
  await button.click()

  await expect(page.getByRole('button', { name: 'Wird gesendet…' })).toBeDisabled()
})

// AC-3: Expired/invalid link error param in URL shows message
// EXPECTED STATUS: FAIL — login page does not read ?error= param and show a message
test('AC-3: Abgelaufener Link zeigt Fehlermeldung auf Login-Seite', async ({ page }) => {
  await goto(page, '/login?error=link-ungueltig')
  await expect(
    page.getByText(/abgelaufen|ungültig|neuen anforder/i)
  ).toBeVisible()
})

// AC-5: Nicht-eingeloggte User werden zu /login weitergeleitet
// EXPECTED STATUS: FAIL — middleware.ts is missing, route is unprotected
test('AC-5: Unauthentifizierter Zugriff auf / leitet zu /login weiter', async ({ page }) => {
  await goto(page, '/')
  await expect(page).toHaveURL('/login')
})

// AC-5: Eingeloggter User auf /login wird zu / weitergeleitet
test('AC-5: Eingeloggter User auf /login wird zu / umgeleitet (requires real auth)', async () => {
  test.skip(true, 'Requires real auth flow — manual test only')
})

// AC-6: Logout-Schaltfläche existiert irgendwo in der App
// EXPECTED STATUS: FAIL — no logout button exists, page.tsx is still boilerplate
test('AC-6: Logout-Button ist in der App sichtbar nach dem Einloggen', async ({ page }) => {
  await goto(page, '/')
  await expect(page.getByRole('button', { name: /ausloggen|logout/i })).toBeVisible()
})
