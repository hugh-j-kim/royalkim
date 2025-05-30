"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Editor } from "@tinymce/tinymce-react"

interface Post {
  id: string
  title: string
  content: string
  createdAt?: string | Date
  updatedAt?: string | Date
  viewCount?: number
  description?: string | null
}

interface PostEditorProps {
  post: Post
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(post.title)
  const [description, setDescription] = useState(post.description || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const editorRef = useRef<any>(null)

  // 날짜 포맷 함수
  function formatDate(date: string | Date | undefined) {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  // div+iframe 구조를 iframe만 남기도록 변환
  function stripYoutubeDiv(content: string) {
    return content.replace(
      /<div[^>]*style="[^"]*padding-bottom:56.25%;[^"]*"[^>]*>\s*<iframe([^>]*)><\/iframe>\s*<\/div>/g,
      '<iframe$1></iframe>'
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      let content = editorRef.current?.getContent() || ""
      // 이미 iframe이 있으면 변환하지 않고, 유튜브 URL만 변환
      if (!/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/.test(content)) {
        content = content
          .replace(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|shorts\/)?([\w-]{11})[\S]*/g, (_: string, _www: string, _domain: string, _path: string, videoId: string) => {
            return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" allowfullscreen style="aspect-ratio: 16/9; width: 100%; max-width: 800px; margin: 2rem auto;"></iframe>`;
          })
      }
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          content: stripYoutubeDiv(content),
        }),
      })
      if (!response.ok) {
        throw new Error("Failed to update post")
      }
      router.push(`/posts/${post.id}`)
    } catch (error) {
      console.error("Error updating post:", error)
      alert("글 수정에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* 포스트 정보 표시 */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-500">
        <div>조회수: <span className="font-semibold">{post.viewCount ?? '-'}</span></div>
        <div>생성일: <span className="font-semibold">{formatDate(post.createdAt)}</span></div>
        <div>최근 수정일: <span className="font-semibold">{formatDate(post.updatedAt)}</span></div>
      </div>
      <div className="space-y-4 sm:space-y-6 w-full">
        <div className="w-full">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            요약 (검색엔진/공유용)
          </label>
          <input
            id="description"
            name="description"
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 mb-2"
            placeholder="이 글을 한두 문장으로 요약해 주세요 (검색엔진, SNS 공유에 사용됩니다)"
            maxLength={150}
          />
        </div>
        <div className="w-full">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            내용
          </label>
          <div className="w-full min-h-[60vh] border border-gray-300 rounded-md overflow-hidden">
            <Editor
              apiKey={process.env.NEXT_PUBLIC_ROYALKIM_TINYMCE_APIKEY}
              onInit={(_evt: any, editor: any) => (editorRef.current = editor)}
              value={stripYoutubeDiv(post.content)}
              onEditorChange={(content) => editorRef.current = content}
              init={{
                height: "60vh",
                menubar: true,
                language: "ko",
                plugins: [
                  "advlist", "autolink", "lists", "link", "image", "media", "charmap", "preview", "anchor",
                  "searchreplace", "visualblocks", "code", "fullscreen",
                  "insertdatetime", "table", "code", "help", "wordcount"
                ],
                toolbar:
                  "undo redo | formatselect | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | youtube | code | removeformat | help",
                content_style:
                  `body { font-family:Helvetica,Arial,sans-serif; font-size:16px; }
                  img { max-width:100%; height:auto; }
                  /* 유튜브 16:9 비율 강제 */
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
                images_upload_handler: (blobInfo: any) => {
                  return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject("이미지 업로드 실패");
                    reader.readAsDataURL(blobInfo.blob());
                  });
                },
              }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push(`/posts/${post.id}`)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "수정 중..." : "수정하기"}
          </button>
        </div>
      </div>
    </form>
  )
}