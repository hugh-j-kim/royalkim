## 1. 온라인 도구로 확인

### Google Search Console
1. https://search.google.com/search-console 접속
2. 도메인 등록 (royalkim.vercel.app)
3. 확인할 수 있는 정보:
   - 검색 노출 수
   - 클릭 수
   - 평균 CTR
   - 평균 순위
   - 색인 생성 상태

### Google PageSpeed Insights
1. https://pagespeed.web.dev/ 접속
2. URL 입력: https://royalkim.vercel.app
3. 확인할 수 있는 정보:
   - 성능 점수
   - 접근성
   - 모범 사례
   - SEO 점수

### 네이버 서치어드바이저
1. https://searchadvisor.naver.com/ 접속
2. 사이트 등록
3. 확인할 수 있는 정보:
   - 색인 생성 상태
   - 검색 노출 현황
   - 모바일 최적화

### 기타 도구들
- **GTmetrix**: https://gtmetrix.com/
- **Pingdom**: https://tools.pingdom.com/
- **Screaming Frog SEO Spider**: https://www.screamingfrog.co.uk/seo-spider/

## 2. 수동으로 확인하는 방법

### 메타 태그 확인
브라우저에서 F12 → Elements 탭에서 확인:
```html
<title>페이지 제목</title>
<meta name="description" content="페이지 설명">
<meta property="og:title" content="Open Graph 제목">
<meta property="og:description" content="Open Graph 설명">
<meta property="og:image" content="이미지 URL">
```

### 사이트맵 확인
- https://royalkim.vercel.app/sitemap.xml 접속
- XML 형식으로 올바르게 생성되었는지 확인

### robots.txt 확인
- https://royalkim.vercel.app/robots.txt 접속
- 검색 엔진 크롤링 허용 여부 확인

## 3. 검색 엔진에서 직접 확인

### Google에서 검색
```
site:royalkim.vercel.app
```

### 네이버에서 검색
```
site:royalkim.vercel.app
```

## 4. 추가 개선 사항

### robots.txt 생성
```txt
User-agent: *
Allow: /

Sitemap: https://royalkim.vercel.app/sitemap.xml
```

### 구조화된 데이터 (JSON-LD) 추가
포스트 페이지에 Article 스키마 추가

### 이미지 최적화
- alt 태그 추가
- WebP 형식 사용
- 적절한 크기로 리사이징

### 내부 링크 최적화
- 관련 포스트 링크
- 카테고리 페이지 링크
- 사용자 블로그 페이지 링크

## 5. 모니터링 지표

### 정기적으로 확인할 항목
- [ ] Google Search Console 색인 생성 상태
- [ ] 네이버 서치어드바이저 색인 생성 상태
- [ ] 페이지 로딩 속도
- [ ] 모바일 최적화 점수
- [ ] 검색 노출 수 및 클릭 수
- [ ] 평균 순위 변화

### 개선 목표
- [ ] 페이지 로딩 속도 3초 이내
- [ ] 모바일 최적화 점수 90점 이상
- [ ] SEO 점수 90점 이상
- [ ] 검색 결과에서 상위 10위권 진입
EOF