import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";

/** A phone can open its camera straight from a file input — no permission prompt
 *  and no secure context needed. Desktops ignore `capture`, so they get the
 *  webcam dialog instead. */
export function prefersNativeCamera() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function canUseWebcam() {
  return (
    typeof window !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    window.isSecureContext
  );
}

function cameraErrorMessage(error: unknown) {
  const name = error instanceof Error ? error.name : "";
  if (name === "NotAllowedError")
    return "Camera access was blocked. Allow it in your browser's address bar, then try again.";
  if (name === "NotFoundError" || name === "OverconstrainedError")
    return "No camera was found on this device. You can upload photos instead.";
  if (typeof window !== "undefined" && !window.isSecureContext)
    return "Using your camera needs a secure (https) connection. You can still upload photos.";
  return "We couldn't reach your camera. You can upload photos instead.";
}

export function CameraDialog({
  facingMode = "environment",
  onCapture,
  onClose,
}: {
  facingMode?: "user" | "environment";
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [shots, setShots] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1600 }, height: { ideal: 1200 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setReady(true);
      } catch (err) {
        if (!cancelled) setError(cameraErrorMessage(err));
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [facingMode]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  function shoot() {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(new File([blob], `asset-photo-${Date.now()}.jpg`, { type: "image/jpeg" }));
        setShots((count) => count + 1);
      },
      "image/jpeg",
      0.9,
    );
  }

  return (
    <div
      className="fixed inset-0 z-100 grid place-items-center bg-ink-900/80 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Take photos of your asset"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-card bg-white shadow-2xl">
        <div className="relative grid aspect-4/3 place-items-center bg-ink-900">
          {error ? (
            <p className="px-8 text-center text-sm leading-relaxed text-white/80" role="alert">{error}</p>
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
              style={facingMode === "user" ? { transform: "scaleX(-1)" } : undefined}
            />
          )}
          {shots > 0 && (
            <span className="pop absolute left-4 top-4 rounded-full bg-teal-500 px-3 py-1 text-xs font-semibold text-white">
              {shots} taken
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <p className="text-sm text-ink-500">
            {error ? "" : "Take as many as you need — they're added as you go."}
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost px-5 text-sm" onClick={onClose}>
              {shots > 0 ? "Done" : "Cancel"}
            </button>
            {!error && (
              <button type="button" className="btn btn-primary px-5 text-sm" onClick={shoot} disabled={!ready}>
                <Icon.camera className="h-4 w-4" /> Capture
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
