'use client'

import { useEffect, useState } from 'react'

type Props = {
  keyS3: string
  alt?: string
  className?: string
}

export default function S3Image({ keyS3, alt = '', className = '' }: Props) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchUrl = async () => {
      const res = await fetch(`/api/images?key=${encodeURIComponent(keyS3)}`)
      const data = await res.json()
      setUrl(data.url)
    }

    fetchUrl()
  }, [keyS3])

  if (!url) return <div className="bg-gray-200 animate-pulse h-64 w-full rounded-xl" />

  return (
    <img
      src={url}
      alt={alt}
      className={className + ' object-cover w-full h-full rounded-xl shadow'}
      loading="lazy"
    />
  )
}

