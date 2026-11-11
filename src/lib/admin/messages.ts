/** Human-readable texts for action results (admin UI is English only). */

export function errorMessage(code: string): string {
  switch (code) {
    case 'unauthorized':
      return 'Your session has expired. Please sign in again.'
    case 'notFound':
      return 'That item no longer exists.'
    case 'validation':
      return 'Some fields are not valid. Check the highlighted fields.'
    case 'conflict':
      return 'An item with the same unique value already exists.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

/** Field-level validation codes produced by the zod schemas. */
export function fieldErrorText(code: string): string {
  switch (code) {
    case 'required':
      return 'This field is required.'
    case 'requiredDefaultLocale':
      return 'The default language is required.'
    case 'invalidUrl':
      return 'Enter a full link starting with https://, mailto: or tel:.'
    case 'invalidDate':
      return 'Enter a valid date.'
    case 'invalidNumber':
      return 'Enter a whole number within the allowed range.'
    case 'invalidKey':
      return 'Invalid storage key.'
    default:
      return 'Invalid value.'
  }
}
