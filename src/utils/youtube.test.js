import { normalizeYouTubeEmbedUrl, normalizeYouTubeIframesInHtml } from "./youtube";

describe("YouTube embed normalization", () => {
  it("converts a watch URL to an embeddable URL", () => {
    expect(
      normalizeYouTubeEmbedUrl("https://www.youtube.com/watch?v=AbCdEfGhI12")
    ).toBe("https://www.youtube.com/embed/AbCdEfGhI12");
  });

  it.each([
    "https://youtu.be/AbCdEfGhI12",
    "https://www.youtube.com/shorts/AbCdEfGhI12",
    "https://www.youtube.com/live/AbCdEfGhI12",
    "https://www.youtube.com/embed/AbCdEfGhI12",
  ])("supports another common YouTube URL form: %s", (url) => {
    expect(normalizeYouTubeEmbedUrl(url)).toBe(
      "https://www.youtube.com/embed/AbCdEfGhI12"
    );
  });

  it("leaves non-YouTube iframe URLs unchanged", () => {
    expect(normalizeYouTubeEmbedUrl("https://example.com/video/123")).toBe(
      "https://example.com/video/123"
    );
  });

  it("repairs YouTube iframe URLs in previously saved HTML", () => {
    const html =
      '<p>Lesson video</p><iframe src="https://www.youtube.com/watch?v=AbCdEfGhI12"></iframe>';

    expect(normalizeYouTubeIframesInHtml(html)).toContain(
      'src="https://www.youtube.com/embed/AbCdEfGhI12"'
    );
  });
});
