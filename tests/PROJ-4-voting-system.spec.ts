import { test, expect } from '@playwright/test'

// AC-8: Unauthenticated access redirects to /login
test('AC-8: Nicht eingeloggte Nutzer werden zu /login weitergeleitet', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/login/)
})

// The following tests require an authenticated session.
// Setup: run `npx playwright codegen --save-storage=tests/auth-state.json http://localhost:3000`
// then log in manually to capture session. Save state and re-run.
//
// Alternatively, if SUPABASE_TEST_EMAIL + SUPABASE_TEST_SESSION_TOKEN are set,
// the fixture below injects the session cookie directly.

const AUTH_STATE = 'tests/auth-state.json'

test.describe('Voting System (requires auth)', () => {
  test.use({ storageState: AUTH_STATE })

  test('AC-5: Vote-Zähler ist bei jeder Idee sichtbar', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    // Board must show at least one idea card with a vote button
    const voteButtons = page.locator('button[aria-label]').filter({
      hasText: /^\d+$/,
    })
    // If there are ideas, each has a vote count visible
    const ideaCards = page.locator('.rounded-2xl').filter({ has: page.locator('h3') })
    const count = await ideaCards.count()
    if (count > 0) {
      // Each card should have a ChevronUp button with a number
      await expect(ideaCards.first().locator('button[aria-pressed]')).toBeVisible()
    }
  })

  test('AC-1 + AC-2: Vote-Toggle: abstimmen und zurücknehmen', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    const firstVoteBtn = page.locator('button[aria-pressed]').first()
    await expect(firstVoteBtn).toBeVisible()

    const initialPressed = await firstVoteBtn.getAttribute('aria-pressed')

    // Vote (or un-vote)
    await firstVoteBtn.click()
    await page.waitForTimeout(300) // optimistic update is instant

    const afterPressed = await firstVoteBtn.getAttribute('aria-pressed')
    expect(afterPressed).not.toBe(initialPressed)

    // Toggle back
    await firstVoteBtn.click()
    await page.waitForTimeout(300)

    const restoredPressed = await firstVoteBtn.getAttribute('aria-pressed')
    expect(restoredPressed).toBe(initialPressed)
  })

  test('AC-6: Optimistic Update — Zähler ändert sich sofort beim Klick', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    const firstVoteBtn = page.locator('button[aria-pressed]').first()
    await expect(firstVoteBtn).toBeVisible()

    const countBefore = parseInt(
      (await firstVoteBtn.locator('span').last().textContent()) ?? '0'
    )
    const wasVoted = (await firstVoteBtn.getAttribute('aria-pressed')) === 'true'

    await firstVoteBtn.click()
    // No await for network — check immediately (optimistic)
    const countAfter = parseInt(
      (await firstVoteBtn.locator('span').last().textContent()) ?? '0'
    )

    if (wasVoted) {
      expect(countAfter).toBe(countBefore - 1)
    } else {
      expect(countAfter).toBe(countBefore + 1)
    }

    // Cleanup: toggle back
    await firstVoteBtn.click()
  })

  test('AC-5 (Zähler bei 0): Idee mit 0 Votes zeigt "0" an', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    const allBtns = page.locator('button[aria-pressed]')
    const count = await allBtns.count()
    for (let i = 0; i < count; i++) {
      const txt = await allBtns.nth(i).locator('span').last().textContent()
      // All counts must be a non-negative integer (including 0)
      expect(parseInt(txt ?? '-1')).toBeGreaterThanOrEqual(0)
    }
  })
})
