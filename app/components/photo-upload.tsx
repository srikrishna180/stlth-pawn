import { useEffect, useRef, useState } from "react";
import { CameraDialog, canUseWebcam, prefersNativeCamera } from "./camera-capture";
import { Icon } from "./icons";

export const MAX_PHOTOS = 10;
export const MAX_PHOTO_MB = 10;
export const MAX_TOTAL_MB = 20;

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "heif", "gif"];

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(file: File) {
  if (file.type.startsWith("image/")) return true;
  // iPhones hand over HEIC with an empty or unexpected MIME type.
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS.includes(extension);
}

type Props = {
  name: string;
  onChange: (count: number) => void;
  invalid?: boolean;
};

export function PhotoUpload({ name, onChange, invalid }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  // The dialog stays open for repeat shots, so reads must not go through state,
  // which may not have flushed between two quick captures.
  const filesRef = useRef<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [nativeCamera, setNativeCamera] = useState(false);
  const [webcam, setWebcam] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const captureRef = useRef<HTMLInputElement>(null);

  // Decided after mount: depends on the device and a secure context.
  useEffect(() => {
    setNativeCamera(prefersNativeCamera());
    setWebcam(canUseWebcam());
  }, []);

  // Rebuild previews whenever the set changes, and release the old object URLs.
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  /** The <input> is the thing the form submits, so it stays the source of truth. */
  function sync(next: File[]) {
    const transfer = new DataTransfer();
    next.forEach((file) => transfer.items.add(file));
    if (inputRef.current) inputRef.current.files = transfer.files;
    filesRef.current = next;
    setFiles(next);
    onChange(next.length);
  }

  function add(incoming: FileList | null) {
    if (!incoming?.length) return;
    const current = filesRef.current;
    const problems: string[] = [];
    const accepted: File[] = [];
    let total = current.reduce((sum, file) => sum + file.size, 0);

    for (const file of Array.from(incoming)) {
      if (current.length + accepted.length >= MAX_PHOTOS) {
        problems.push(`You can attach up to ${MAX_PHOTOS} photos.`);
        break;
      }
      if (!isImage(file)) {
        problems.push(`${file.name} isn't an image.`);
        continue;
      }
      if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
        problems.push(`${file.name} is ${formatBytes(file.size)} — the limit is ${MAX_PHOTO_MB} MB per photo.`);
        continue;
      }
      if (total + file.size > MAX_TOTAL_MB * 1024 * 1024) {
        problems.push(`That would push the total past ${MAX_TOTAL_MB} MB. Try fewer or smaller photos.`);
        break;
      }
      // Skip anything already attached.
      if (current.some((existing) => existing.name === file.name && existing.size === file.size)) continue;
      total += file.size;
      accepted.push(file);
    }

    setErrors(problems);
    if (accepted.length) sync([...current, ...accepted]);
    // Let the same file be chosen again after a removal.
    if (inputRef.current && !accepted.length) inputRef.current.value = "";
  }

  function remove(index: number) {
    setErrors([]);
    sync(filesRef.current.filter((_, i) => i !== index));
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*,.heic,.heif"
        multiple
        className="sr-only"
        aria-label="Photos of your asset"
        onChange={(event) => add(event.target.files)}
      />

      {/* A phone opens its camera straight from here — works over plain http too. */}
      {nativeCamera && (
        <input
          ref={captureRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(event) => {
            add(event.target.files);
            event.target.value = "";
          }}
        />
      )}

      {(nativeCamera || webcam) && files.length < MAX_PHOTOS && (
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-ghost px-5 text-sm"
            onClick={() => (nativeCamera ? captureRef.current?.click() : setCameraOpen(true))}
          >
            <Icon.camera className="h-4 w-4 text-teal-500" />
            {nativeCamera ? "Take a photo" : "Use your webcam"}
          </button>
          <button type="button" className="btn btn-ghost px-5 text-sm" onClick={() => inputRef.current?.click()}>
            Choose files
          </button>
        </div>
      )}

      {cameraOpen && (
        <CameraDialog
          facingMode="environment"
          onClose={() => setCameraOpen(false)}
          onCapture={(file) => {
            const transfer = new DataTransfer();
            transfer.items.add(file);
            add(transfer.files);
          }}
        />
      )}

      {files.length === 0 ? (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Add photos. Up to ${MAX_PHOTOS}, ${MAX_PHOTO_MB} MB each.`}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            add(event.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center gap-3 rounded-card border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
            dragging
              ? "scale-[1.01] border-teal-500 bg-teal-50"
              : invalid
                ? "border-red-400 bg-red-50/40"
                : "border-ink-500/25 bg-ink-500/[0.02] hover:border-teal-500/60 hover:bg-teal-50/50"
          }`}
        >
          <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${dragging ? "bg-teal-500 text-white" : "bg-teal-50 text-teal-600"}`}>
            <Icon.camera className="h-6 w-6" />
          </span>
          <span className="font-semibold text-ink-900">Add photos of your asset</span>
          <span className="max-w-xs text-sm leading-relaxed text-ink-500">
            Drag them here or tap to browse. Front, back, both sides, the interior and the odometer
            help us value it accurately.
          </span>
          <span className="text-xs text-ink-500/80">
            Up to {MAX_PHOTOS} photos · {MAX_PHOTO_MB} MB each
          </span>
        </div>
      ) : (
        <div className={`rounded-card border p-4 ${invalid ? "border-red-400" : "border-ink-500/15"}`}>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {files.map((file, index) => (
              <li key={`${file.name}-${file.size}-${index}`} className="pop group relative aspect-square">
                <img
                  src={previews[index]}
                  alt={`Photo ${index + 1}: ${file.name}`}
                  className="h-full w-full rounded-xl border border-ink-500/15 object-cover"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <span className="sr-only">Remove {file.name}</span>
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
                <span className="absolute inset-x-1 bottom-1 truncate rounded-md bg-ink-900/75 px-1.5 py-0.5 text-[10px] text-white">
                  {formatBytes(file.size)}
                </span>
              </li>
            ))}

            {files.length < MAX_PHOTOS && (
              <li className="aspect-square">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink-500/25 text-ink-500 transition-colors hover:border-teal-500 hover:bg-teal-50/60 hover:text-teal-600"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="text-xs font-medium">Add more</span>
                </button>
              </li>
            )}
          </ul>

          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-ink-500/10 pt-3 text-sm text-ink-500">
            <Icon.check className="h-4 w-4 text-teal-500" />
            <span className="font-medium text-ink-900">
              {files.length} photo{files.length === 1 ? "" : "s"} attached
            </span>
            <span>· {formatBytes(totalBytes)} of {MAX_TOTAL_MB} MB</span>
          </p>
        </div>
      )}

      {errors.map((message) => (
        <span key={message} className="field-error" role="alert">{message}</span>
      ))}
    </div>
  );
}
