"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { initializeApp } from "firebase/app"

// Firebase 설정
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

// urlId 유효성 검사 함수
function isValidUrlId(value: string) {
  return /^[a-z0-9]+$/.test(value)
}

// 이미지 파일 유효성 검사 함수
function isValidImageFile(file: File) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: '지원되는 이미지 형식: JPG, PNG, GIF, WebP' }
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: '파일 크기는 5MB 이하여야 합니다' }
  }
  
  return { isValid: true, error: '' }
}

export default function SignUp() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [urlId, setUrlId] = useState("")
  const [urlIdError, setUrlIdError] = useState("")
  const [isUrlIdChecking, setIsUrlIdChecking] = useState(false)
  const [isUrlIdAvailable, setIsUrlIdAvailable] = useState<boolean|null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // urlId 중복 체크
  const checkUrlId = async () => {
    setIsUrlIdChecking(true)
    setUrlIdError("")
    setIsUrlIdAvailable(null)
    if (!isValidUrlId(urlId)) {
      setUrlIdError("영문 소문자와 숫자만 입력하세요.")
      setIsUrlIdChecking(false)
      return
    }
    try {
      const res = await fetch(`/api/auth/check-urlid?urlId=${urlId}`)
      const data = await res.json()
      if (data.available) {
        setIsUrlIdAvailable(true)
      } else {
        setUrlIdError("이미 사용 중인 url id입니다.")
        setIsUrlIdAvailable(false)
      }
    } catch {
      setUrlIdError("중복 확인 중 오류가 발생했습니다.")
      setIsUrlIdAvailable(false)
    } finally {
      setIsUrlIdChecking(false)
    }
  }

  // 이미지 선택 처리
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = isValidImageFile(file)
    if (!validation.isValid) {
      setImageError(validation.error)
      setSelectedImage(null)
      setImagePreview(null)
      return
    }

    setImageError("")
    setSelectedImage(file)
    
    // 미리보기 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // 이미지 업로드
  const uploadImage = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `logos/${Date.now()}_${file.name}`)
    await uploadBytes(storageRef, file)
    return await getDownloadURL(storageRef)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    setUrlIdError("")
    setImageError("")
    
    if (!isValidUrlId(urlId)) {
      setUrlIdError("영문 소문자와 숫자만 입력하세요.")
      setIsLoading(false)
      return
    }
    if (isUrlIdAvailable === false) {
      setUrlIdError("이미 사용 중인 url id입니다.")
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const blogName = formData.get("blogName") as string

    try {
      let imageUrl = null
      
      // 이미지 업로드 처리
      if (selectedImage) {
        setIsUploading(true)
        try {
          imageUrl = await uploadImage(selectedImage)
        } catch (uploadError) {
          setImageError("이미지 업로드에 실패했습니다.")
          setIsLoading(false)
          setIsUploading(false)
          return
        } finally {
          setIsUploading(false)
        }
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          blogName,
          urlId,
          image: imageUrl,
        }),
      })
      if (res.ok) {
        router.push("/auth/signin?registered=true")
      } else {
        const data = await res.json()
        setError(data.error || "회원가입 중 오류가 발생했습니다.")
      }
    } catch (error) {
        setError("회원가입 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            또는{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-pink-600 hover:text-pink-500"
            >
              로그인
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="이름"
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="이메일"
              />
            </div>
            <div>
              <label htmlFor="blogName" className="sr-only">
                블로그명
              </label>
              <input
                id="blogName"
                name="blogName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="블로그명"
              />
            </div>
            <div>
              <label htmlFor="urlId" className="sr-only">
                URL ID
              </label>
              <div className="flex gap-2 mt-2">
                <input
                  id="urlId"
                  name="urlId"
                  type="text"
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-z0-9]+"
                  value={urlId}
                  onChange={e => {
                    setUrlId(e.target.value)
                    setIsUrlIdAvailable(null)
                    setUrlIdError("")
                  }}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                  placeholder="URL ID 영문 소문자/숫자 (예: royalkim)"
                />
                <button
                  type="button"
                  onClick={checkUrlId}
                  disabled={isUrlIdChecking || !urlId}
                  className="px-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs whitespace-nowrap"
                >
                  {isUrlIdChecking ? "확인 중..." : "중복확인"}
                </button>
              </div>
              {urlIdError && <div className="text-xs text-red-500 mt-1">{urlIdError}</div>}
              {isUrlIdAvailable && <div className="text-xs text-green-600 mt-1">사용 가능한 url id입니다.</div>}
            </div>
            
            {/* 로고 이미지 업로드 섹션 */}
            <div className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로필 이미지 (선택사항)
              </label>
              <div className="space-y-3">
                {/* 이미지 미리보기 */}
                {imagePreview && (
                  <div className="flex justify-center">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="프로필 미리보기"
                        className="w-20 h-20 rounded-full object-cover border-2 border-pink-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null)
                          setImagePreview(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 파일 선택 버튼 */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors text-sm"
                  >
                    {imagePreview ? '이미지 변경' : '이미지 선택'}
                  </button>
                </div>
                
                {/* 숨겨진 파일 입력 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                {/* 파일 제한 정보 */}
                <div className="text-xs text-gray-500 text-center">
                  <p>지원 형식: JPG, PNG, GIF, WebP</p>
                  <p>최대 파일 크기: 5MB</p>
                </div>
                
                {/* 에러 메시지 */}
                {imageError && (
                  <div className="text-xs text-red-500 text-center">{imageError}</div>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || isUploading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || isUploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isUploading ? "이미지 업로드 중..." : "회원가입 중..."}
                </span>
              ) : (
                "회원가입"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 