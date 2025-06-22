"use client"

import Link from "next/link"
import Image from "next/image"
import { MouseEvent } from "react"

interface UserLinkProps {
  urlId: string;
  name: string;
  image?: string | null;
}

export default function UserLink({ urlId, name, image }: UserLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation()
  }

  const imageSrc = image || "/dog-wink.png";

  return (
    <Link
      href={`/${urlId}`}
      className="hover:text-pink-500 transition-colors flex items-center gap-1.5 justify-end"
      onClick={handleClick}
    >
      <span>by {name}</span>
      <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
        <Image
          src={imageSrc}
          alt={`${name} 로고`}
          fill
          className="object-cover"
        />
      </div>
    </Link>
  )
} 