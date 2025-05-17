import React from "react"
import Link from "next/link"
import Image from "next/image"

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-pink-600 hover:text-pink-700 transition-colors">
      <div className="relative w-8 h-8 rounded-full overflow-hidden">
        <Image
          src="/dog-wink.png"
          alt="Royal Kim's Blog Logo"
          fill
          className="object-cover"
          priority
        />
      </div>
      Royal Kim's Blog
    </Link>
  )
} 