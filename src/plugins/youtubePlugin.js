export default function youtubePlugin(editor) {
  editor.toolbar.addButton({
    name: 'youtube',
    tooltip: 'YouTube 동영상 삽입',
    className: 'toastui-editor-toolbar-icons youtube',
    text: '🎬',
    command: 'youtube',
    event: 'youtube',
  });
  editor.eventManager.addEventType('youtube');
  editor.eventManager.listen('youtube', () => {
    const url = prompt('YouTube URL을 입력하세요:');
    if (url) {
      const match = url.match(/(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([^"&?\/\=\s]{11})/);
      if (match && match[1]) {
        const videoId = match[1];
        const iframe = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        editor.insertHTML(iframe);
      } else {
        alert('올바른 YouTube URL이 아닙니다.');
      }
    }
  });
} 