/**
 * Declarative description of every editable resource. The list pages, the
 * edit form, the zod schemas and the server actions are all driven by this,
 * so adding a field = adding one line here (plus a migration).
 * Pure data: safe to import from client and server code.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'date'
  | 'number'
  | 'boolean'
  | 'tags'
  | 'localized' // { it: "...", en: "..." } single line
  | 'localizedArea' // same, multi-line
  | 'localizedList' // { it: ["..."], en: ["..."] }, one item per line
  | 'image' // S3 key
  | 'select'

export type FieldDef = {
  name: string
  label: string
  type: FieldType
  required?: boolean
  help?: string
  /** `select`: key into the options the page loads (e.g. "categories", "albums"). */
  optionsKey?: string
  min?: number
  max?: number
}

export const RESOURCE_KEYS = [
  'experience',
  'education',
  'certifications',
  'skill-categories',
  'skills',
  'projects',
  'social-links',
  'albums',
  'photos',
] as const

export type ResourceKey = (typeof RESOURCE_KEYS)[number]

export type ResourceDef = {
  key: ResourceKey
  singular: string
  plural: string
  /** Field shown as the row title; for localized fields the default locale is used. */
  titleField: string
  subtitleField?: string
  /** Rows are ordered by `position` and can be reordered by drag and drop. */
  ordered: boolean
  hasStatus: boolean
  hasFeatured?: boolean
  /** Slug is generated from this field when creating. */
  slugFrom?: string
  /** Rows cannot be created from the form (photos come from uploads). */
  createFromUpload?: boolean
  fields: FieldDef[]
}

const L = (name: string, label: string, extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  type: 'localized',
  ...extra,
})

export const RESOURCES: Record<ResourceKey, ResourceDef> = {
  experience: {
    key: 'experience',
    singular: 'Experience',
    plural: 'Experience',
    titleField: 'role',
    subtitleField: 'organization',
    ordered: true,
    hasStatus: true,
    hasFeatured: true,
    fields: [
      { name: 'organization', label: 'Organization', type: 'text', required: true },
      L('role', 'Role', { required: true }),
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'startDate', label: 'Start date', type: 'date', required: true },
      { name: 'endDate', label: 'End date', type: 'date', help: 'Leave empty for a current role.' },
      L('summary', 'Summary', { type: 'localizedArea', required: true }),
      { name: 'description', label: 'Description', type: 'localizedArea' },
      { name: 'highlights', label: 'Responsibilities', type: 'localizedList', help: 'One per line.' },
      { name: 'tags', label: 'Technologies', type: 'tags' },
      { name: 'url', label: 'Link', type: 'url' },
    ],
    slugFrom: 'organization',
  },
  education: {
    key: 'education',
    singular: 'Education',
    plural: 'Education',
    titleField: 'title',
    subtitleField: 'institution',
    ordered: true,
    hasStatus: true,
    slugFrom: 'institution',
    fields: [
      { name: 'institution', label: 'Institution', type: 'text', required: true },
      L('title', 'Title', { required: true }),
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'startDate', label: 'Start date', type: 'date', required: true },
      { name: 'endDate', label: 'End date', type: 'date' },
      L('summary', 'Summary', { type: 'localizedArea' }),
      { name: 'description', label: 'Description', type: 'localizedArea' },
      { name: 'highlights', label: 'Highlights', type: 'localizedList', help: 'One per line.' },
      { name: 'url', label: 'Link', type: 'url' },
    ],
  },
  certifications: {
    key: 'certifications',
    singular: 'Certification',
    plural: 'Certifications',
    titleField: 'name',
    subtitleField: 'issuer',
    ordered: true,
    hasStatus: true,
    slugFrom: 'issuer',
    fields: [
      L('name', 'Name', { required: true }),
      { name: 'issuer', label: 'Issuer', type: 'text' },
      { name: 'issuedAt', label: 'Issued', type: 'date' },
      { name: 'url', label: 'Link', type: 'url' },
    ],
  },
  'skill-categories': {
    key: 'skill-categories',
    singular: 'Skill category',
    plural: 'Skill categories',
    titleField: 'name',
    ordered: true,
    hasStatus: true,
    fields: [L('name', 'Name', { required: true })],
  },
  skills: {
    key: 'skills',
    singular: 'Skill',
    plural: 'Skills',
    titleField: 'name',
    ordered: true,
    hasStatus: true,
    slugFrom: 'name',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'categoryId', label: 'Category', type: 'select', optionsKey: 'categories', required: true },
      { name: 'level', label: 'Level (1-5)', type: 'number', min: 1, max: 5, help: 'Leave empty to show no level.' },
      { name: 'years', label: 'Years of experience', type: 'number', min: 0, max: 60 },
      { name: 'description', label: 'Context of use', type: 'localizedArea' },
    ],
  },
  projects: {
    key: 'projects',
    singular: 'Project',
    plural: 'Projects',
    titleField: 'title',
    ordered: true,
    hasStatus: true,
    hasFeatured: true,
    slugFrom: 'title',
    fields: [
      L('title', 'Title', { required: true }),
      L('summary', 'Summary', { type: 'localizedArea' }),
      { name: 'description', label: 'Description', type: 'localizedArea' },
      { name: 'coverKey', label: 'Cover image', type: 'image' },
      { name: 'tags', label: 'Technologies', type: 'tags' },
      { name: 'liveUrl', label: 'Live site', type: 'url' },
      { name: 'repoUrl', label: 'Repository', type: 'url' },
      { name: 'startDate', label: 'Date', type: 'date' },
    ],
  },
  'social-links': {
    key: 'social-links',
    singular: 'Social link',
    plural: 'Social links',
    titleField: 'label',
    subtitleField: 'url',
    ordered: true,
    hasStatus: true,
    fields: [
      { name: 'kind', label: 'Kind', type: 'text', required: true, help: 'github, linkedin, instagram, email, phone…' },
      { name: 'label', label: 'Label', type: 'text' },
      { name: 'url', label: 'URL', type: 'url', required: true, help: 'https://…, mailto:… or tel:…' },
    ],
  },
  albums: {
    key: 'albums',
    singular: 'Album',
    plural: 'Albums',
    titleField: 'title',
    ordered: true,
    hasStatus: true,
    slugFrom: 'title',
    fields: [L('title', 'Title', { required: true }), { name: 'description', label: 'Description', type: 'localizedArea' }],
  },
  photos: {
    key: 'photos',
    singular: 'Photo',
    plural: 'Photos',
    titleField: 'title',
    ordered: true,
    hasStatus: true,
    hasFeatured: true,
    createFromUpload: true,
    fields: [
      L('title', 'Title'),
      { name: 'description', label: 'Description', type: 'localizedArea' },
      L('alt', 'Alt text', { help: 'Describes the photo for screen readers. Falls back to the title.' }),
      { name: 'place', label: 'Place', type: 'text' },
      { name: 'takenAt', label: 'Taken on', type: 'date' },
      { name: 'albumId', label: 'Album', type: 'select', optionsKey: 'albums' },
      { name: 'tags', label: 'Tags', type: 'tags' },
    ],
  },
}

export function isResourceKey(value: string): value is ResourceKey {
  return (RESOURCE_KEYS as readonly string[]).includes(value)
}

/** Localized fields of a resource (translation tracking). */
export function localizedFields(def: ResourceDef): FieldDef[] {
  return def.fields.filter((f) => f.type === 'localized' || f.type === 'localizedArea' || f.type === 'localizedList')
}
