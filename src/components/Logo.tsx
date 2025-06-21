import React from "react"
import Link from "next/link"
import Image from "next/image"

interface LogoProps {
  blogTitle?: string | null
  urlId?: string | null
}

export default function Logo({ blogTitle, urlId }: LogoProps) {
  const displayTitle = blogTitle || "RoyalKim";
  const href = urlId ? `/${urlId}` : '/';

  return (
    <Link href={href} className="flex items-center gap-2 text-xl md:text-2xl font-bold text-pink-600 hover:text-pink-700 transition-colors whitespace-nowrap">
      <div className="relative w-8 h-8 rounded-full overflow-hidden">
        <Image
          src="/dog-wink.png"
          alt={`${displayTitle} Logo`}
          fill
          className="object-cover"
          priority
        />
      </div>
      {displayTitle}
    </Link>
  )
} 