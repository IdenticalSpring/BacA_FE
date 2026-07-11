const PPT_AUTH_READY = "happyclass-ppt-auth-ready";
const PPT_AUTH_RESPONSE = "happyclass-ppt-auth-response";

const getPptBaseUrl = () => {
  const configured = process.env.REACT_APP_PPTIST_URL;
  const target = new URL(configured || "/ppt/", window.location.origin);

  if (target.origin !== window.location.origin) {
    throw new Error("PPT must be served from the HappyClass domain in production.");
  }

  return target;
};

export const openPptWindow = ({ lessonId, lessonByScheduleId, presentationId, title, language = "vi" } = {}) => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    throw new Error("Please sign in before opening PPT.");
  }

  const target = getPptBaseUrl();
  if (lessonId) target.searchParams.set("lessonId", String(lessonId));
  if (lessonByScheduleId) target.searchParams.set("lessonByScheduleId", String(lessonByScheduleId));
  if (presentationId) target.searchParams.set("presentationId", String(presentationId));
  if (title) target.searchParams.set("title", title);
  target.searchParams.set("lang", language);

  let pptWindow = null;
  let sent = false;
  let timeoutId = null;

  const cleanup = () => {
    window.removeEventListener("message", onMessage);
    if (timeoutId) window.clearTimeout(timeoutId);
  };

  const onMessage = (event) => {
    if (
      event.origin !== window.location.origin ||
      event.source !== pptWindow ||
      event.data?.type !== PPT_AUTH_READY ||
      sent
    ) {
      return;
    }

    sent = true;
    event.source.postMessage(
      { type: PPT_AUTH_RESPONSE, token },
      window.location.origin
    );
    cleanup();
  };

  window.addEventListener("message", onMessage);
  pptWindow = window.open(target.toString(), "_blank");

  if (!pptWindow) {
    cleanup();
    throw new Error("Browser blocked the PPT window. Please allow pop-ups and try again.");
  }

  timeoutId = window.setTimeout(cleanup, 15000);
  return pptWindow;
};
