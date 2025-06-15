"use client"

import { useState, useRef, useContext, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Editor } from "@tinymce/tinymce-react"
import { LanguageContext } from "@/components/Providers"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { initializeApp } from "firebase/app"
import CategorySelect from "@/components/CategorySelect"

interface Post {
  id: string
  title: string
  content: string
  createdAt?: string | Date
  updatedAt?: string | Date
  viewCount?: number
  description?: string | null
  categoryId?: string | null
  published: boolean
}

interface PostEditorProps {
  post: Post
  onSubmit?: (data: any) => Promise<void>
  isSubmitting?: boolean
}

const I18N: Record<string, { [key: string]: string }> = {
  ko: {
    editTitle: "글 수정하기",
    title: "제목",
    summary: "요약 (검색엔진/공유용)",
    summaryPlaceholder: "이 글을 한두 문장으로 요약해 주세요 (검색엔진, SNS 공유에 사용됩니다)",
    content: "내용",
    viewCount: "조회수",
    createdAt: "생성일",
    updatedAt: "최근 수정일",
    cancel: "취소",
    edit: "수정하기",
    editing: "수정 중...",
    editError: "글 수정에 실패했습니다.",
    category: "카테고리",
    selectCategory: "카테고리 선택",
    noCategory: "카테고리 없음",
    publish: "게시",
  },
  en: {
    editTitle: "Edit Post",
    title: "Title",
    summary: "Summary (for search engines/sharing)",
    summaryPlaceholder: "Summarize this post in one or two sentences (used for search engines and social sharing)",
    content: "Content",
    viewCount: "Views",
    createdAt: "Created",
    updatedAt: "Last Updated",
    cancel: "Cancel",
    edit: "Edit",
    editing: "Editing...",
    editError: "Failed to edit post.",
    category: "Category",
    selectCategory: "Select Category",
    noCategory: "No Category",
    publish: "Publish",
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

export function PostEditor({ post, onSubmit, isSubmitting: externalIsSubmitting }: PostEditorProps) {
  const router = useRouter()
  const { lang } = useContext(LanguageContext)
  const [title, setTitle] = useState(post.title)
  const [description, setDescription] = useState(post.description || "")
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(post.categoryId || "")
  const editorRef = useRef<any>(null)
  const [editorContent, setEditorContent] = useState(post.content)
  const [published, setPublished] = useState(post.published)

  const isSubmitting = externalIsSubmitting ?? internalIsSubmitting

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          // const data = await response.json()
          // setCategories(data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const formatDate = (date?: string | Date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const stripYoutubeDiv = (content: string) => {
    return content.replace(/<div class="youtube-embed">([\s\S]*?)<\/div>/g, '$1')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      let content = editorContent
      // 이미 iframe이 있으면 변환하지 않고, 유튜브 URL만 변환
      if (!/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/.test(content)) {
        content = content
          .replace(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|shorts\/)?([\w-]{11})[\S]*/g, (_: string, _www: string, _domain: string, _path: string, videoId: string) => {
            return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" allowfullscreen style="aspect-ratio: 16/9; width: 100%; max-width: 800px; margin: 2rem auto;"></iframe>`;
          })
      }
      await onSubmit({
        title,
        description,
        content: stripYoutubeDiv(content),
        categoryId: selectedCategoryId || null,
        published,
      })
    } else {
      setInternalIsSubmitting(true)
      try {
        let content = editorContent
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
            categoryId: selectedCategoryId || null,
            published,
          }),
        })
        if (!response.ok) {
          throw new Error("Failed to update post")
        }
        router.push(`/posts/${post.id}`)
      } catch (error) {
        console.error("Error updating post:", error)
        alert(I18N[lang].editError)
      } finally {
        setInternalIsSubmitting(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
        {I18N[lang].editTitle}
      </h1>
      {/* 포스트 정보 표시 */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-500">
        <div>{I18N[lang].viewCount}: <span className="font-semibold">{post.viewCount ?? '-'}</span></div>
        <div>{I18N[lang].createdAt}: <span className="font-semibold">{formatDate(post.createdAt)}</span></div>
        <div>{I18N[lang].updatedAt}: <span className="font-semibold">{formatDate(post.updatedAt)}</span></div>
      </div>
      <div className="space-y-4 sm:space-y-6 w-full">
        <div className="w-full">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            {I18N[lang].title}
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
            {I18N[lang].summary}
          </label>
          <input
            id="description"
            name="description"
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 mb-2"
            placeholder={I18N[lang].summaryPlaceholder}
            maxLength={150}
          />
        </div>
        <CategorySelect value={selectedCategoryId} onChange={setSelectedCategoryId} />
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="published" className="block text-sm font-medium text-gray-700">
            {I18N[lang].publish}
          </label>
        </div>
        <div className="w-full">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            {I18N[lang].content}
          </label>
          <div className="w-full min-h-[50vh] border border-gray-300 rounded-md overflow-hidden">
            <Editor
              apiKey={process.env.NEXT_PUBLIC_ROYALKIM_TINYMCE_APIKEY}
              onInit={(_evt: any, editor: any) => (editorRef.current = editor)}
              value={stripYoutubeDiv(editorContent)}
              onEditorChange={(content) => setEditorContent(content)}
              init={{
                height: "50vh",
                menubar: true,
                language: lang,
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
                images_upload_handler: ((blobInfo: any, success: any, failure: any, _progress?: any) => {
                  const file = blobInfo.blob();
                  const storageRef = ref(storage, `image/${Date.now()}_${file.name}`);
                  uploadBytes(storageRef, file)
                    .then(() => getDownloadURL(storageRef))
                    .then((url) => success(url))
                    .catch((err) => failure("업로드 실패: " + err.message));
                }) as any,
              }}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            {I18N[lang].cancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-pink-600 border border-transparent rounded-md shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
          >
            {isSubmitting ? I18N[lang].editing : I18N[lang].edit}
          </button>
        </div>
      </div>
    </form>
  )
}