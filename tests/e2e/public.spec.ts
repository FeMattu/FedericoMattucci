import { expect, test } from '@playwright/test'

/**
 * Public site: layout, language switch, theme switch, detail pages and 404.
 * Runs on desktop and on a phone viewport (see playwright.config.ts).
 */
test.describe('public site', () => {
  test('home has a top navigation, real content and no sidebar', async ({ page, isMobile }) => {
    await page.goto('/it')
    await expect(page.getByRole('heading', { level: 1, name: 'Federico Mattucci' })).toBeVisible()
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.locator('aside, [data-sidebar]')).toHaveCount(0)

    await expect(page.getByRole('heading', { level: 2, name: 'Esperienze' })).toBeVisible()
    await expect(page.getByText('JEVIS Junior Enterprise').first()).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Competenze' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Contatti' })).toBeVisible()

    const desktopNav = page.getByRole('banner').getByRole('navigation', { name: 'Navigazione principale' })
    if (isMobile) {
      await expect(page.getByRole('button', { name: 'Apri il menu' })).toBeVisible()
      await expect(desktopNav).toBeHidden()
    } else {
      await expect(desktopNav.getByRole('link', { name: 'Formazione' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Apri il menu' })).toBeHidden()
    }
  })

  test('the mobile menu opens from the top bar and navigates', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only')
    await page.goto('/it')
    await page.getByRole('button', { name: 'Apri il menu' }).click()
    const menu = page.getByRole('dialog')
    await expect(menu).toBeVisible()
    await menu.getByRole('link', { name: 'Formazione' }).click()
    await expect(menu).toBeHidden()
    await expect(page).toHaveURL(/#education$/)
    await expect(page.locator('aside, [data-sidebar]')).toHaveCount(0)
  })

  test('switching language changes the URL and the text, and keeps the page', async ({ page }) => {
    await page.goto('/it')
    await page.getByRole('button', { name: 'Lingua' }).click()
    await page.getByRole('menuitemradio', { name: 'English' }).click()

    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('heading', { level: 2, name: 'Experience' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Education' })).toBeVisible()
  })

  test('hreflang alternates and the root redirect', async ({ page, request }) => {
    const root = await request.get('/', { maxRedirects: 0 })
    expect(root.status()).toBe(307)
    expect(root.headers().location).toMatch(/\/(it|en)$/)

    await page.goto('/en')
    await expect(page.locator('link[rel="alternate"][hreflang="it"]')).toHaveAttribute('href', /\/it$/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en$/)
  })

  test('theme: dark mode applies, persists after reload and follows the toggle', async ({ page }) => {
    await page.goto('/it')
    await page.getByRole('button', { name: 'Tema' }).click()
    await page.getByRole('menuitemradio', { name: 'Scuro' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.getByRole('button', { name: 'Tema' }).click()
    await page.getByRole('menuitemradio', { name: 'Chiaro' }).click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('an experience card opens its detail page, with a way back', async ({ page }) => {
    await page.goto('/en')
    await page.getByRole('link', { name: /Full-Stack Developer/ }).first().click()
    await expect(page).toHaveURL(/\/en\/experience\/hastega-full-stack-developer$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Full-Stack Developer' })).toBeVisible()
    await expect(page.getByText('Angular').first()).toBeVisible()

    await page.getByRole('link', { name: 'Experience' }).first().click()
    await expect(page).toHaveURL(/\/en#experience$/)
  })

  test('unknown pages answer with a real 404 in the right language', async ({ page }) => {
    const response = await page.goto('/it/questa-pagina-non-esiste')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Pagina non trovata' })).toBeVisible()
    await expect(page.getByRole('banner')).toBeVisible()
  })

  test('the contact form shows validation errors and keeps what was typed', async ({ page }) => {
    await page.goto('/it')
    await page.getByLabel('Nome', { exact: true }).fill('Ada')
    await page.getByLabel('Email', { exact: true }).fill('not-an-email')
    await page.getByLabel('Messaggio', { exact: true }).fill('short')
    await page.getByRole('button', { name: 'Invia messaggio' }).click()

    await expect(page.getByText("Inserisci un'email valida")).toBeVisible()
    await expect(page.getByText('Il messaggio deve contenere almeno 10 caratteri')).toBeVisible()
    await expect(page.getByLabel('Nome', { exact: true })).toHaveValue('Ada')
  })
})
