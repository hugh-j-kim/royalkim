"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Editor } from '@tinymce/tinymce-react'
import { useContext } from "react"
import { LanguageContext } from "@/components/Providers"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { initializeApp } from "firebase/app"
import CategorySelect from "@/components/CategorySelect"

const I18N: Record<string, { [key: string]: string }> = {
  ko: {
    newPost: "새 글 작성",
    title: "제목",
    summary: "요약 (검색엔진/공유용)",
    summaryPlaceholder: "이 글을 한두 문장으로 요약해 주세요 (검색엔진, SNS 공유에 사용됩니다)",
    content: "내용",
    loginRequired: "로그인이 필요합니다.",
    error: "포스트 작성 중 오류가 발생했습니다.",
    loading: "로딩 중...",
    publish: "게시"
  },
  en: {
    newPost: "New Post",
    title: "Title",
    summary: "Summary (for search engines/sharing)",
    summaryPlaceholder: "Please summarize this post in one or two sentences (used for search engines and social media sharing)",
    content: "Content",
    loginRequired: "Login required.",
    error: "An error occurred while creating the post.",
    loading: "Loading...",
    publish: "Publish"
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyApThOThn_cT2heKV_W3JJ4o71-c4yWofw",
  authDomain: "royalkim.firebaseapp.com",
  projectId: "royalkim",
  storageBucket: "royalkim.firebasestorage.app",
  messagingSenderId: "1052940584501",
  appId: "1:1052940584501:web:96da5ff02c3ad14785537c",
  measurementId: "G-1929TKXLQP"
}

const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

export default function NewPostPage() {
  const { lang } = useContext(LanguageContext)
  const router = useRouter()
  const { data: session, status } = useSession()
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [categoryId, setCategoryId] = useState<string>("")
  const [published, setPublished] = useState(false)

  // 로그인하지 않은 사용자는 메인 페이지로 리다이렉트
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (status !== "authenticated" || !session?.user?.email) {
      alert(I18N[lang].loginRequired)
      router.push("/auth/signin")
      return
    }

    setIsSubmitting(true)
    try {
      // 이미 iframe이 있으면 변환하지 않고, 유튜브 URL만 변환
      let processedContent = content
      if (!/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/.test(content)) {
        processedContent = content
          .replace(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|shorts\/)?([\w-]{11})[\S]*/g, (_: string, __, ___, ____, videoId: string) => {
            return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" allowfullscreen style="aspect-ratio: 16/9; width: 100%; max-width: 800px; margin: 2rem auto;"></iframe>`;
          })
          }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          content: processedContent,
          published,
          categoryId: categoryId || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || I18N[lang].error)
      }

      const post = await response.json()
      router.push(`/posts/${post.id}`)
    } catch (error) {
      console.error("Error creating post:", error)
      alert(error instanceof Error ? error.message : I18N[lang].error)
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
        <div className="text-2xl text-pink-500">{I18N[lang].loading}</div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-6">
      <div className="max-w-[1100px] mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-pink-500 mb-4 sm:mb-8">{I18N[lang].newPost}</h1>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              {I18N[lang].title}
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              {I18N[lang].summary}
            </label>
            <input
              id="description"
              name="description"
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 mb-4"
              placeholder={I18N[lang].summaryPlaceholder}
              maxLength={150}
            />
          </div>
          <CategorySelect value={categoryId} onChange={setCategoryId} />
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              {I18N[lang].content}
            </label>
            <div className="w-full min-h-[55vh] border border-gray-300 rounded-md overflow-hidden">
              <div className="w-full h-[55vh] relative">
                <Editor
                  apiKey="ctj7vwd103i0za3euzbfwqx8lx1hlmp2z8w0wlc7puz1pho2"
                  value={stripYoutubeDiv(content)}
                  onEditorChange={(content) => setContent(content)}
                  init={{
                    height: '55vh',
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
                    images_upload_handler: async (blobInfo: any) => {
                      const file = blobInfo.blob();
                      const storageRef = ref(storage, `image/${Date.now()}_${file.name}`);
                      try {
                        await uploadBytes(storageRef, file);
                        const url = await getDownloadURL(storageRef);
                        return url;
                      } catch (err) {
                        throw new Error("업로드 실패: " + (err as Error).message);
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
              {I18N[lang].publish}
            </label>
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