'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";

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

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    blogTitle: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // 현재 사용자 정보로 폼 초기화
    setFormData({
      name: session.user.name || '',
      email: session.user.email || '',
      blogTitle: session.user.blogTitle || ''
    });

    // 현재 사용자 이미지 설정
    if (session.user.image) {
      setImagePreview(session.user.image);
    }
  }, [session, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setImageError("");

    try {
      let imageUrl = null;
      
      // 이미지 업로드 처리
      if (selectedImage) {
        setIsUploading(true);
        try {
          imageUrl = await uploadImage(selectedImage);
        } catch (uploadError) {
          setImageError("이미지 업로드에 실패했습니다.");
          setIsLoading(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl
        }),
      });

      if (response.ok) {
        toast({
          title: "성공",
          description: "프로필이 성공적으로 업데이트되었습니다. 세션을 새로고침합니다.",
        });
        
        // 세션을 완전히 새로고침하기 위해 로그아웃 후 다시 로그인 페이지로 이동
        setTimeout(() => {
          signOut({ 
            callbackUrl: '/auth/signin?message=profile_updated',
            redirect: true 
          });
        }, 1000);
      } else {
        const error = await response.json();
        toast({
          title: "오류",
          description: error.message || "프로필 업데이트에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "프로필 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "오류",
        description: "새 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "오류",
        description: "새 비밀번호는 최소 6자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: "성공",
          description: "비밀번호가 성공적으로 변경되었습니다.",
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordSection(false);
      } else {
        const error = await response.json();
        toast({
          title: "오류",
          description: error.message || "비밀번호 변경에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "비밀번호 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-6 sm:space-y-8">
        {/* 프로필 정보 수정 */}
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">프로필 수정</h1>
            <p className="text-sm sm:text-base text-gray-600">사용자 정보를 수정하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full text-base"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full text-base"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="blogTitle" className="block text-sm font-medium text-gray-700 mb-2">
                블로그 제목
              </label>
              <Input
                id="blogTitle"
                name="blogTitle"
                type="text"
                value={formData.blogTitle}
                onChange={handleInputChange}
                className="w-full text-base"
                placeholder="블로그 제목을 입력하세요"
              />
            </div>

            {/* 프로필 이미지 업로드 섹션 */}
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                프로필 이미지
              </label>
              <div className="space-y-3">
                {/* 이미지 미리보기 */}
                {imagePreview && (
                  <div className="flex justify-center">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="프로필 미리보기"
                        className="w-24 h-24 rounded-full object-cover border-2 border-pink-300 shadow-md"
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
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 파일 선택 버튼 */}
                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors text-sm"
                  >
                    {imagePreview ? '이미지 변경' : '이미지 선택'}
                  </Button>
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

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <Button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-base py-2 sm:py-2"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isUploading}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-base py-2 sm:py-2"
              >
                {isLoading || isUploading ? (isUploading ? '이미지 업로드 중...' : '저장 중...') : '저장'}
              </Button>
            </div>
          </form>
        </div>

        {/* 비밀번호 변경 */}
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">비밀번호 변경</h2>
            <p className="text-sm sm:text-base text-gray-600">계정 보안을 위해 비밀번호를 변경하세요</p>
          </div>

          {!showPasswordSection ? (
            <Button
              onClick={() => setShowPasswordSection(true)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-base py-2 sm:py-2"
            >
              비밀번호 변경하기
            </Button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  현재 비밀번호
                </label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full text-base"
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호
                </label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full text-base"
                  placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호 확인
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full text-base"
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-base py-2 sm:py-2"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-base py-2 sm:py-2"
                >
                  {isLoading ? '변경 중...' : '비밀번호 변경'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 