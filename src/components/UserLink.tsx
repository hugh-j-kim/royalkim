"use client"

import Link from "next/link"
import { MouseEvent } from "react"

interface UserLinkProps {
  urlId: string;
  name: string;
}

export default function UserLink({ urlId, name }: UserLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation()
  }

  return (
    <Link
      href={`/${urlId}`}
      className="hover:text-pink-500 transition-colors"
      onClick={handleClick}
    >
      by {name}
    </Link>
  )
} 