"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Editor } from '@tinymce/tinymce-react'

export default function NewPostPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // 로그인하지 않은 사용자는 메인 페이지로 리다이렉트
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (status !== "authenticated" || !session?.user?.email) {
      alert("로그인이 필요합니다.")
      router.push("/auth/signin")
      return
    }

    setIsSubmitting(true)
    try {
      // YouTube URL을 iframe으로 변환
      const processedContent = content
        .replace(/youtube\.com\/shorts\/([^"&?\/\s]+)/g, 'youtube.com/embed/$1')
        .replace(/youtu\.be\/([^"&?\/\s]+)/g, 'youtube.com/embed/$1')
        .replace(/<video[^>]*>.*?<\/video>/g, (match) => {
          const srcMatch = match.match(/src="([^"]+)"/);
          if (srcMatch && srcMatch[1]) {
            const videoId = srcMatch[1].split('/').pop()?.split('?')[0];
            if (videoId) {
              return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="aspect-ratio: 16/9; width: 100%; max-width: 800px; margin: 2rem auto;"></iframe>`;
            }
          }
          return match;
        });

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content: processedContent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "포스트 작성에 실패했습니다.")
      }

      router.push("/")
    } catch (error) {
      console.error("Error creating post:", error)
      alert(error instanceof Error ? error.message : "포스트 작성 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // div+iframe 구조를 iframe만 남기도록 변환
  function stripYoutubeDiv(content: string) {
    return content.replace(
      /<div[^>]*style="[^"]*padding-bottom:56.25%;[^"]*"[^>]*>\s*<iframe([^>]*)><\/iframe>\s*<\/div>/g,
      '<iframe$1></iframe>'
    );
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-6">
      <div className="max-w-[1100px] mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-pink-500 mb-4 sm:mb-8">새 글 작성</h1>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              내용
            </label>
            <div className="w-full min-h-[70vh] border border-gray-300 rounded-md overflow-hidden">
              <div className="w-full h-[70vh] relative">
                <Editor
                  apiKey="ctj7vwd103i0za3euzbfwqx8lx1hlmp2z8w0wlc7puz1pho2"
                  value={stripYoutubeDiv(content)}
                  onEditorChange={(content) => setContent(content)}
                  init={{
                    height: '70vh',
                    menubar: true,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                      'bold italic forecolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | image media | help',
                    content_style: `
                      body { font-family:Helvetica,Arial,sans-serif; font-size:16px; }
                      img { max-width:100%; height:auto; }
                      .mce-content-body iframe {
                        aspect-ratio: 16/9;
                        width: 100% !important;
                        max-width: 560px;
                        display: block;
                        margin-left: auto;
                        margin-right: auto;
                        border-radius: 12px;
                      }
                    `,
                    media_live_embeds: true,
                    media_alt_source: false,
                    media_poster: false,
                    media_dimensions: false,
                    extended_valid_elements: 'iframe[src|frameborder|style|scrolling|class|width|height|name|align|allow|allowfullscreen|allowtransparency|sandbox|srcdoc|loading|referrerpolicy|title|importance|onload|onerror]',
                    custom_elements: 'iframe',
                    valid_children: '+body[style]',
                    valid_elements: '*[*]',
                    images_upload_handler: async (blobInfo) => {
                      // 이미지 업로드 핸들러 구현
                      return new Promise((resolve, reject) => {
                        const reader = new FileReader()
                        reader.onload = () => {
                          resolve(reader.result as string)
                        }
                        reader.onerror = () => {
                          reject('이미지 업로드에 실패했습니다.')
                        }
                        reader.readAsDataURL(blobInfo.blob())
                      })
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "작성 중..." : "작성하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 