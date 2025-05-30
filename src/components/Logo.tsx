import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"

export default function Logo() {
  const { data: session } = useSession()
  const [blogTitle, setBlogTitle] = useState<string>("Royal Kim's Blog")

  useEffect(() => {
    const fetchBlog = async () => {
      if (session?.user) {
        try {
          const res = await fetch("/api/blog")
          if (res.ok) {
            const data = await res.json()
            setBlogTitle(data.blog.title)
          }
        } catch (e) {
          // ignore
        }
      } else {
        setBlogTitle("Royal Kim's Blog")
      }
    }
    fetchBlog()
  }, [session])

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
      {blogTitle}
    </Link>
  )
} 