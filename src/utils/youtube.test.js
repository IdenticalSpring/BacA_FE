import { normalizeYouTubeEmbedUrl, normalizeYouTubeIframesInHtml } from "./youtube";

describe("YouTube embed normalization", () => {
  it("converts the customer test URL to an embeddable URL", () => {
    expect(
      normalizeYouTubeEmbedUrl("https://www.youtube.com/watch?v=YTo1y9HCWIU")
    ).toBe("https://www.youtube.com/embed/YTo1y9HCWIU");
  });

  it.each([
    "https://youtu.be/YTo1y9HCWIU",
    "https://www.youtube.com/shorts/YTo1y9HCWIU",
    "https://www.youtube.com/live/YTo1y9HCWIU",
    "https://www.youtube.com/embed/YTo1y9HCWIU",
  ])("supports another common YouTube URL form: %s", (url) => {
    expect(normalizeYouTubeEmbedUrl(url)).toBe(
      "https://www.youtube.com/embed/YTo1y9HCWIU"
    );
  });

  it("leaves non-YouTube iframe URLs unchanged", () => {
    expect(normalizeYouTubeEmbedUrl("https://example.com/video/123")).toBe(
      "https://example.com/video/123"
    );
  });

  it("repairs YouTube iframe URLs in previously saved HTML", () => {
    const html =
      '<p>Lesson video</p><iframe src="https://www.youtube.com/watch?v=YTo1y9HCWIU"></iframe>';

    expect(normalizeYouTubeIframesInHtml(html)).toContain(
      'src="https://www.youtube.com/embed/YTo1y9HCWIU"'
    );
  });
});
