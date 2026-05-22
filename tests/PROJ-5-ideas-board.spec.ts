import { test, expect } from '@playwright/test'

// ─── AC-1: Unauthenticated redirect ───────────────────────────────────────────

test('AC-1: Nicht eingeloggter Nutzer wird von / zu /login weitergeleitet', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/login/)
})

// ─── Authenticated tests ───────────────────────────────────────────────────────
// Requires tests/auth-state.json — generate with:
//   npx playwright codegen --save-storage=tests/auth-state.json http://localhost:3000/login

const AUTH_STATE = 'tests/auth-state.json'

test.describe('Ideas Board (requires auth)', () => {
  test.use({ storageState: AUTH_STATE })

  // AC-2: Ideas list loads
  test('AC-2: Ideen-Liste wird geladen und angezeigt', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    // Page header must be visible
    await expect(page.getByRole('heading', { name: 'Ideen Board' })).toBeVisible()

    // Idea count subtitle is rendered
    await expect(page.locator('text=/Idee(n)? eingereicht/')).toBeVisible()
  })

  // AC-3: Default sort is by votes (descending)
  test('AC-3: Standard-Sortierung ist "Meiste Votes"', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    // Sort dropdown should display "Meiste Votes" by default
    await expect(page.getByRole('combobox')).toContainText('Meiste Votes')
  })

  // AC-4: Sorting changes to "Neueste zuerst"
  test('AC-4: Sortierung kann auf "Neueste zuerst" geändert werden', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    const sortSelect = page.getByRole('combobox')
    await sortSelect.click()
    await page.getByRole('option', { name: 'Neueste zuerst' }).click()

    await expect(sortSelect).toContainText('Neueste zuerst')
  })

  // AC-5: Status filter chips are present and clickable
  test('AC-5: Status-Filter-Chips sind vorhanden und klickbar', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    // All filter labels must be visible
    for (const label of ['Alle', 'Offen', 'Geplant', 'In Arbeit', 'Erledigt', 'Abgelehnt']) {
      await expect(page.getByRole('button', { name: label })).toBeVisible()
    }

    // Clicking a filter chip should activate it
    await page.getByRole('button', { name: 'Geplant' }).click()

    // The "Geplant" chip should now appear active (violet bg)
    const geplantChip = page.getByRole('button', { name: 'Geplant' })
    await expect(geplantChip).toHaveClass(/bg-violet-600/)
  })

  // AC-5: Filter shows only matching ideas
  test('AC-5: Filter zeigt nur Ideen mit passendem Status', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    const ideaCards = page.locator('.rounded-2xl').filter({ has: page.locator('h3') })
    const totalCount = await ideaCards.count()

    if (totalCount === 0) {
      test.skip()
      return
    }

    // Click "Offen" filter
    await page.getByRole('button', { name: 'Offen' }).click()
    await page.waitForTimeout(100)

    // Every visible status badge should say "Offen"
    const visibleCards = page.locator('.rounded-2xl').filter({ has: page.locator('h3') })
    const afterCount = await visibleCards.count()

    // Either 0 cards (none with status open) or all cards show "Offen" badge
    if (afterCount > 0) {
      const badges = visibleCards.locator('span').filter({ hasText: 'Offen' })
      const badgeCount = await badges.count()
      expect(badgeCount).toBeGreaterThanOrEqual(afterCount)
    }
  })

  // AC-6: Empty state for filtered view with no results
  test('AC-5/AC-6: Filter ohne Treffer zeigt leeren Zustand mit Reset-Link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    // Try all status filters and check if any returns empty
    const filters = ['Geplant', 'In Arbeit', 'Erledigt', 'Abgelehnt']
    for (const filter of filters) {
      await page.getByRole('button', { name: filter }).click()
      await page.waitForTimeout(100)

      const cards = page.locator('.rounded-2xl').filter({ has: page.locator('h3') })
      const count = await cards.count()

      if (count === 0) {
        // Should show empty state with a reset link
        await expect(page.getByText('Keine Ideen gefunden')).toBeVisible()
        await expect(page.getByText('Filter zurücksetzen')).toBeVisible()

        // Reset link should work
        await page.getByText('Filter zurücksetzen').click()
        await expect(page.getByRole('button', { name: 'Alle' })).toHaveClass(/bg-violet-600/)
        break
      }
    }
  })

  // AC-7: Skeleton cards visible during loading
  test('AC-7: Skeleton-Karten erscheinen beim Laden', async ({ page }) => {
    // Intercept the API to delay response
    await page.route('/api/ideas', async (route) => {
      await new Promise((r) => setTimeout(r, 600))
      await route.continue()
    })

    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Skeleton: animate-pulse divs should be visible before data loads
    const skeletons = page.locator('.animate-pulse')
    await expect(skeletons.first()).toBeVisible()
  })

  // AC-8: Idea card shows all required fields
  test('AC-8: Ideen-Karte zeigt alle Pflichtfelder', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    const cards = page.locator('.rounded-2xl').filter({ has: page.locator('h3') })
    const count = await cards.count()

    if (count === 0) {
      test.skip()
      return
    }

    const first = cards.first()

    // Title (h3)
    await expect(first.locator('h3')).toBeVisible()

    // Status badge (span with a dot + label)
    const badge = first.locator('span.rounded-full').first()
    await expect(badge).toBeVisible()

    // Vote button with aria-pressed
    await expect(first.locator('button[aria-pressed]')).toBeVisible()

    // Author + date metadata row
    const meta = first.locator('.text-zinc-500')
    await expect(meta).toBeVisible()
  })

  // AC-9: CTA button "+ Neue Idee" is prominently visible
  test('AC-9: CTA-Button "Neue Idee" ist sichtbar', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.getByRole('button', { name: /Neue Idee/ })).toBeVisible()
  })

  // AC-9: Clicking the CTA opens the submit dialog
  test('AC-9: Klick auf "Neue Idee" öffnet den Submit-Dialog', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: /Neue Idee/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Neue Idee einreichen')).toBeVisible()
  })

  // Responsive: filter chips and sort visible on mobile
  test('Responsive (375px): Filter-Chips und Sort-Dropdown sind auf Mobile sichtbar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/', { waitUntil: 'networkidle' })

    await expect(page.getByRole('button', { name: 'Alle' })).toBeVisible()
    await expect(page.getByRole('combobox')).toBeVisible()
    await expect(page.getByRole('button', { name: /Neue Idee/ })).toBeVisible()
  })

  // Security: API requires authentication
  test('Security: /api/ideas ohne Auth gibt 401 zurück', async ({ page }) => {
    // Make a direct fetch to the API without any cookies (blank context)
    const response = await page.request.fetch('/api/ideas', {
      headers: { cookie: '' },
    })
    // Without a valid session, the API must reject
    expect([401, 307]).toContain(response.status())
  })
})
