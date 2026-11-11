import { describe, expect, it } from 'vitest'
import { DEFAULT_PHOTO_SIZE, toAlbumViews, toPhotoView } from '@/lib/content/photo-view'

const row = {
  id: 'p1',
  key: 'portfolio/a.jpg',
  albumId: 'a1',
  title: { it: 'Titolo', en: 'Title' },
  description: null,
  alt: null,
  place: 'Lucca',
  takenAt: new Date(Date.UTC(2023, 6, 25, 20, 21, 15)),
  width: 4000,
  height: 3000,
  blurDataUrl: 'data:image/jpeg;base64,AAAA',
  exif: { make: 'SONY' },
  tags: ['street'],
  featured: true,
}

describe('toPhotoView', () => {
  it('localizes text and keeps the signed URL', () => {
    const view = toPhotoView(row, 'https://cdn/x?sig', 'en', 'Photograph')
    expect(view).toMatchObject({
      url: 'https://cdn/x?sig',
      title: 'Title',
      width: 4000,
      takenAt: '2023-07-25T20:21:15.000Z',
      exif: { make: 'SONY' },
    })
  })

  it('builds the alt text from alt, then title, then the fallback', () => {
    expect(toPhotoView({ ...row, alt: { en: 'A dog' } }, 'u', 'en', 'Photograph').alt).toBe('A dog')
    expect(toPhotoView(row, 'u', 'en', 'Photograph').alt).toBe('Title')
    expect(toPhotoView({ ...row, title: null }, 'u', 'en', 'Photograph').alt).toBe('Photograph')
  })

  it('uses a default aspect ratio when the sidecar had no size', () => {
    const view = toPhotoView({ ...row, width: null, height: null, exif: null, takenAt: null }, 'u', 'it', 'Foto')
    expect([view.width, view.height]).toEqual([DEFAULT_PHOTO_SIZE.width, DEFAULT_PHOTO_SIZE.height])
    expect(view.exif).toEqual({})
    expect(view.takenAt).toBeNull()
  })
})

describe('toAlbumViews', () => {
  it('counts photos and hides empty albums', () => {
    const albums = [
      { id: 'a1', slug: 'portrait', title: { en: 'Portrait' } },
      { id: 'a2', slug: 'empty', title: { en: 'Empty' } },
    ]
    expect(toAlbumViews(albums, [{ albumId: 'a1' }, { albumId: 'a1' }, { albumId: null }], 'en')).toEqual([
      { id: 'a1', slug: 'portrait', title: 'Portrait', count: 2 },
    ])
  })
})
