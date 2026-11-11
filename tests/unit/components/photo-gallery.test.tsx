import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'
import type { AlbumView, PhotoView } from '@/lib/content/photo-view'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

import { PhotoGallery } from '@/components/photos/photo-gallery'

const photo = (id: string, albumId: string | null, tags: string[] = []): PhotoView => ({
  id,
  url: `https://cdn.test/${id}.jpg`,
  width: 1600,
  height: 1000,
  blurDataUrl: null,
  title: `Photo ${id}`,
  description: '',
  alt: `Alt ${id}`,
  place: null,
  takenAt: '2023-07-25T20:21:15.000Z',
  exif: { make: 'SONY', model: 'ILCE-7M2', aperture: 'f/1.8', exposureTime: '1/250', iso: 100 },
  tags,
  albumId,
  featured: false,
})

const photos = [photo('a', 'x', ['street']), photo('b', 'x'), photo('c', 'y', ['street'])]
const albums: AlbumView[] = [
  { id: 'x', slug: 'x', title: 'Portrait', count: 2 },
  { id: 'y', slug: 'y', title: 'Street', count: 1 },
]

function renderGallery() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <PhotoGallery photos={photos} albums={albums} tags={['street']} />
    </NextIntlClientProvider>,
  )
}

const openButtons = () => screen.getAllByRole('button', { name: /^Open photo:/ })

describe('PhotoGallery', () => {
  it('shows every photo, then filters by album and by tag', async () => {
    const user = userEvent.setup()
    renderGallery()
    expect(openButtons()).toHaveLength(3)

    await user.click(screen.getByRole('button', { name: /Portrait/ }))
    expect(openButtons()).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'All photos' }))
    await user.click(screen.getByRole('button', { name: 'street' }))
    expect(openButtons()).toHaveLength(2)
  })

  it('opens the lightbox with details, navigates with the keyboard and closes with Escape', async () => {
    const user = userEvent.setup()
    renderGallery()

    await user.click(openButtons()[0]!)
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('1 of 3')
    expect(dialog).toHaveTextContent('SONY ILCE-7M2')
    expect(dialog).toHaveTextContent('f/1.8 · 1/250 s · ISO 100')

    await user.keyboard('{ArrowRight}')
    expect(dialog).toHaveTextContent('2 of 3')
    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(dialog).toHaveTextContent('3 of 3') // wraps around

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('has the lightbox buttons labelled for assistive tech', async () => {
    const user = userEvent.setup()
    renderGallery()
    await user.click(openButtons()[1]!)
    await screen.findByRole('dialog')
    for (const name of ['Previous photo', 'Next photo', 'Close']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('renders an empty state without photos', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <PhotoGallery photos={[]} albums={[]} tags={[]} />
      </NextIntlClientProvider>,
    )
    expect(screen.getByText('No photos yet.')).toBeInTheDocument()
  })
})
