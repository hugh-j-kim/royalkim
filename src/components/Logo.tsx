import React from "react"
import Link from "next/link"
import Image from "next/image"

interface LogoProps {
  blogTitle?: string | null
  urlId?: string | null
  userImage?: string | null
}

export default function Logo({ blogTitle, urlId, userImage }: LogoProps) {
  const displayTitle = blogTitle || "RoyalKim";
  const href = urlId ? `/${urlId}` : '/';
  const imageSrc = userImage || "/dog-wink.png";

  return (
    <Link href={href} className="flex items-center gap-2 text-xl md:text-2xl font-bold text-pink-600 hover:text-pink-700 transition-colors whitespace-nowrap group">
      <div 
        className="relative w-8 h-8 rounded-full overflow-hidden hover:animate-pulse transition-all duration-500 group-hover:scale-105 group-hover:rotate-1"
        style={{
          animation: 'walking 2s ease-in-out infinite'
        }}
      >
        <Image
          src={imageSrc}
          alt={`${displayTitle} Logo`}
          fill
          className="object-cover"
          priority
        />
      </div>
      <span 
        className="group-hover:translate-x-0.5 transition-transform duration-500"
        style={{
          animation: 'walking-text 2s ease-in-out infinite 0.1s'
        }}
      >
        {displayTitle}
      </span>
      
      <style jsx>{`
        @keyframes walking {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          25% { transform: translateX(3px) rotate(1deg); }
          50% { transform: translateX(0px) rotate(0deg); }
          75% { transform: translateX(-3px) rotate(-1deg); }
        }
        
        @keyframes walking-text {
          0%, 100% { transform: translateX(0px); }
          25% { transform: translateX(1.5px); }
          50% { transform: translateX(0px); }
          75% { transform: translateX(-1.5px); }
        }
      `}</style>
    </Link>
  )
} 