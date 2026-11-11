import { revalidatePath } from 'next/cache'

/**
 * Refreshes every statically generated public page after a content change.
 *
 * The app has two root layouts (public `(site)/[locale]` and `(admin)`), so a
 * single `revalidatePath('/', 'layout')` is not enough: the cached `/it`, `/en`
 * pages hang off the `[locale]` layout, and are invalidated through it.
 */
export function revalidateSite() {
  revalidatePath('/', 'layout')
  revalidatePath('/[locale]', 'layout')
}
