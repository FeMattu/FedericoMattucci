'use client'

import { useEffect, useState } from 'react'
import Image from "next/image";

type Props = {
  src: string
  alt?: string
  className?: string
}

export default function S3Image({ src, alt = '', className = '' }: Props) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchUrl = async () => {
      const res = await fetch(`/api/images?key=${encodeURIComponent(src)}`)
      const data = await res.json()
      setUrl(data.url)
    }

    fetchUrl()
  }, [src])

  if (!url) return <div className="bg-gray-200 animate-pulse h-64 w-full rounded-xl" />

  return (
    <Image
      src={url}
      alt={alt}
      width={1000}
      height={250}
      className={className}
      loading="lazy"
    />
  )
}

