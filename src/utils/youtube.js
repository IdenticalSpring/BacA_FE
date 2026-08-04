const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const getYouTubeVideoId = (value) => {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value.trim(), "https://happyclass.local");
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const pathSegments = url.pathname.split("/").filter(Boolean);
    let videoId = null;

    if (hostname === "youtu.be") {
      videoId = pathSegments[0];
    } else if (YOUTUBE_HOSTS.has(hostname)) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else if (["embed", "shorts", "live", "v"].includes(pathSegments[0])) {
        videoId = pathSegments[1];
      }
    }

    return videoId && YOUTUBE_ID_PATTERN.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
};

export const normalizeYouTubeEmbedUrl = (value) => {
  if (typeof value !== "string") return value;

  const videoId = getYouTubeVideoId(value);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : value.trim();
};

export const normalizeYouTubeIframesInHtml = (html) => {
  if (typeof html !== "string" || !html || typeof document === "undefined") return html;

  const template = document.createElement("template");
  template.innerHTML = html;

  template.content.querySelectorAll("iframe[src]").forEach((iframe) => {
    const normalizedSrc = normalizeYouTubeEmbedUrl(iframe.getAttribute("src"));
    if (normalizedSrc) iframe.setAttribute("src", normalizedSrc);
  });

  return template.innerHTML;
};

export default normalizeYouTubeEmbedUrl;
