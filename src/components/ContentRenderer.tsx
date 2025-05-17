"use client"

import React from "react"
import parse from "html-react-parser"

interface ContentRendererProps {
  content: string
}

export function ContentRenderer({ content }: ContentRendererProps) {
  // 중첩 iframe 구조를 정상적인 유튜브 embed로 복구 (HTML escape 포함)
  const fixedContent = content
    // 일반 중첩 iframe
    .replace(
      /<iframe[^>]*src="(<iframe[^>]*src=['\"]([^'\"]+)['\"][^>]*>.*?<\/iframe>)"[^>]*><\/iframe>/g,
      (_: string, __: string, innerSrc: string) => {
        const youtubeIdMatch = innerSrc.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
        if (youtubeIdMatch && youtubeIdMatch[1]) {
          const videoId = youtubeIdMatch[1];
          return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="max-width:100%;border-radius:8px;"></iframe>`;
        }
        return `<a href="${innerSrc}" target="_blank" rel="noopener noreferrer">${innerSrc}</a>`;
      }
    )
    // HTML escape된 중첩 iframe
    .replace(
      /<iframe[^>]*src="&lt;iframe[^>]*src=['\"]([^'\"]+)['\"][^>]*&gt;.*?&lt;\/iframe&gt;"[^>]*><\/iframe>/g,
      (_: string, innerSrc: string) => {
        const youtubeIdMatch = innerSrc.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
        if (youtubeIdMatch && youtubeIdMatch[1]) {
          const videoId = youtubeIdMatch[1];
          return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="max-width:100%;border-radius:8px;"></iframe>`;
        }
        return `<a href="${innerSrc}" target="_blank" rel="noopener noreferrer">${innerSrc}</a>`;
      }
    );

  if (!fixedContent) return null;

  try {
    return <>{parse(fixedContent)}</>;
  } catch (e) {
    return <div style={{ color: "red" }}>파싱 에러 발생</div>;
  }
} 