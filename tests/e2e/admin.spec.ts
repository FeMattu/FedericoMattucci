import { expect, test, type Page } from '@playwright/test'

const SESSION = { name: 'authjs.session-token', value: 'e2e-admin-token', domain: 'localhost', path: '/' }

async function signIn(page: Page) {
  await page.context().addCookies([SESSION])
}

test.describe('admin: access', () => {
  test('anonymous visitors are sent to the login page', async ({ page }) => {
    await page.goto('/admin/experience')
    await expect(page).toHaveURL(/\/login\?from=%2Fadmin%2Fexperience$/)
    await expect(page.getByRole('button', { name: 'Continue with GitHub' })).toBeVisible()
    await expect(page.locator('[data-slot="sidebar"]')).toHaveCount(0)
  })

  test('a signed-in admin sees the dashboard with the sidebar, and can sign out', async ({ page }) => {
    // Signing out deletes the session, so this test has its own (the shared one must survive).
    await page.context().addCookies([{ ...SESSION, value: 'e2e-signout-token' }])
    await page.goto('/admin')
    await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible()
    await expect(page.locator('[data-slot="sidebar"]').first()).toBeVisible()
    for (const name of ['Site texts', 'Experience', 'Education', 'Skills', 'Projects', 'Photos', 'Languages', 'Messages']) {
      await expect(page.getByRole('link', { name, exact: true }).first()).toBeVisible()
    }
    await expect(page.getByText('e2e-admin@example.com')).toBeVisible()

    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/login/)
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)
  })

  test('the public site shows the Admin entry and an Edit mode bar only to the admin', async ({ page }) => {
    await page.goto('/it')
    await expect(page.getByRole('link', { name: 'Admin' })).toHaveCount(0)
    await expect(page.getByRole('region', { name: 'Modalità modifica' })).toHaveCount(0)

    await signIn(page)
    await page.goto('/admin')
    // The "an admin signed in here" hint is written in an effect after hydration: wait for it.
    await page.waitForFunction(() => localStorage.getItem('site-admin-hint') === '1')
    await page.goto('/it')
    await expect(page.getByRole('region', { name: 'Modalità modifica' }).getByRole('link', { name: 'Modifica questa pagina' })).toHaveAttribute('href', '/admin/site-texts')
    await expect(page.getByRole('banner').getByRole('link', { name: 'Admin' })).toBeVisible()

    await page.goto('/it/experience/hastega-full-stack-developer')
    await expect(page.getByRole('link', { name: 'Modifica questa pagina' })).toHaveAttribute('href', '/admin/experience')
  })
})

test.describe('admin: edit content', () => {
  test.beforeEach(async ({ page }) => signIn(page))

  test('create an experience, see it on the site, reorder it, hide it, delete it', async ({ page }) => {
    // Create
    await page.goto('/admin/experience')
    await page.getByRole('link', { name: 'New experience' }).click()
    await page.getByLabel(/^Organization/).fill('E2E Corp')
    await page.getByLabel(/^Role/).fill('Tester E2E')
    await page.getByLabel(/^Summary/).fill('Riassunto del test end to end')
    await page.getByLabel(/^Start date/).fill('2026-03-01')
    await page.getByRole('button', { name: 'Create experience' }).click()
    await expect(page).toHaveURL(/\/admin\/experience$/)
    await expect(page.getByRole('link', { name: 'Tester E2E' })).toBeVisible()

    // The static public page is refreshed by the save
    await page.goto('/it')
    await expect(page.getByText('E2E Corp').first()).toBeVisible()

    // Reorder with the keyboard: move the new item (last) to the top
    await page.goto('/admin/experience')
    const titles = page.locator('ul > li a[href^="/admin/experience/"]')
    const before = await titles.allTextContents()
    expect(before.at(-1)).toBe('Tester E2E')

    await page.getByRole('button', { name: /Reorder Tester E2E/ }).focus()
    await page.keyboard.press('Space')
    await page.waitForTimeout(300) // dnd-kit attaches its keydown listener one tick after pickup
    for (let i = 0; i < before.length - 1; i += 1) {
      await page.keyboard.press('ArrowUp')
      await page.waitForTimeout(150) // dnd-kit handles one keyboard move per animation frame
    }
    await page.keyboard.press('Space')
    await expect(page.getByText('Order saved').first()).toBeVisible()

    await page.reload()
    const after = await page.locator('ul > li a[href^="/admin/experience/"]').allTextContents()
    expect(after[0]).toBe('Tester E2E')
    expect(after.slice(1)).toEqual(before.slice(0, -1))

    // Hide it: it disappears from the public page
    await page.getByRole('switch', { name: 'Published: Tester E2E' }).click()
    await expect(page.getByText('Unpublished').first()).toBeVisible()
    // Static pages are refreshed by the save; the very first visit may still get the cached copy
    // (stale-while-revalidate), so reload until the fresh one arrives.
    await page.goto('/it')
    await expect
      .poll(async () => {
        await page.reload()
        return page.getByText('E2E Corp').count()
      }, { timeout: 20_000 })
      .toBe(0)

    // Delete, with confirmation
    await page.goto('/admin/experience')
    await page.getByRole('button', { name: 'Delete Tester E2E' }).click()
    await expect(page.getByRole('dialog')).toContainText('permanently deleted')
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('link', { name: 'Tester E2E' })).toBeVisible()

    await page.getByRole('button', { name: 'Delete Tester E2E' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click()
    await expect(page.getByRole('link', { name: 'Tester E2E' })).toHaveCount(0)
  })

  test('required fields are validated and the default language is enforced', async ({ page }) => {
    await page.goto('/admin/experience/new')
    await page.getByRole('button', { name: 'Create experience' }).click()
    await expect(page.getByText('This field is required.').first()).toBeVisible()
    await expect(page.getByText('The default language is required.').first()).toBeVisible()
    await expect(page).toHaveURL(/\/admin\/experience\/new$/)
  })

  test('edit a site text in two languages and see both on the public site', async ({ page }) => {
    await page.goto('/admin/site-texts')
    const block = page.locator('section', { hasText: 'Hero: role' })
    await block.getByLabel(/Hero: role/).fill('Ingegnere del software (E2E)')
    await block.getByRole('tab', { name: /English/ }).click()
    await block.getByLabel(/Hero: role/).fill('Software engineer (E2E)')
    await block.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Hero: role saved')).toBeVisible()

    await page.goto('/it')
    await expect(page.getByText('Ingegnere del software (E2E)')).toBeVisible()
    await page.goto('/en')
    await expect(page.getByText('Software engineer (E2E)')).toBeVisible()
  })

  test('the languages page lists the languages and what is still untranslated', async ({ page }) => {
    await page.goto('/admin/languages')
    await expect(page.getByRole('row', { name: /Italiano.*Default/ })).toBeVisible()
    await expect(page.getByRole('row', { name: /English/ })).toBeVisible()
    await expect(page.getByRole('row', { name: /English/ })).toContainText(/to translate|Complete/)
    await expect(page.getByRole('switch', { name: 'Italiano enabled' })).toBeDisabled()
  })

  test('submitting the contact form puts the message in the admin inbox', async ({ browser }) => {
    const visitor = await browser.newContext()
    const page = await visitor.newPage()
    await page.goto('/it')
    await page.getByLabel('Nome', { exact: true }).fill('Visitatore E2E')
    await page.getByLabel('Email', { exact: true }).fill('visitatore@example.com')
    await page.getByLabel('Messaggio', { exact: true }).fill('Ciao, questo è un messaggio di prova del test end to end.')
    await page.getByRole('button', { name: 'Invia messaggio' }).click()
    await expect(page.getByText('Messaggio inviato. Grazie!')).toBeVisible()
    await visitor.close()

    const admin = await browser.newContext()
    await admin.addCookies([SESSION])
    const adminPage = await admin.newPage()
    await adminPage.goto('/admin/messages')
    await expect(adminPage.getByText('Visitatore E2E')).toBeVisible()
    await expect(adminPage.getByText('questo è un messaggio di prova')).toBeVisible()
    await adminPage.getByRole('button', { name: 'Mark as read' }).first().click()
    await expect(adminPage.getByText('All read.')).toBeVisible()
    await admin.close()
  })
})
