"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "tus-js-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  startMaterialUploadAction,
  completeMaterialUploadAction,
  removeMaterialAction,
} from "./actions";
import {
  COURSE_FILE_ACCEPT,
  COURSE_FILES_BUCKET,
  COURSE_MATERIAL_LIMIT,
  courseFileMetadata,
  formatCourseBytes,
  type CourseMaterial,
} from "./policy";
export function CourseMaterialUploader({
  courseId,
  materials,
}: {
  courseId: string;
  materials: CourseMaterial[];
}) {
  const router = useRouter(),
    upload = useRef<Upload | null>(null);
  const [transferring, setTransferring] = useState(false);
  const [file, setFile] = useState<File | null>(null),
    [busy, setBusy] = useState(false),
    [paused, setPaused] = useState(false),
    [percent, setPercent] = useState(0),
    [message, setMessage] = useState("");
  useEffect(
    () => () => {
      void upload.current?.abort();
    },
    [],
  );
  async function finish(id: string) {
    const result = await completeMaterialUploadAction(courseId, id);
    setMessage(result.ok ? "Course file uploaded and saved." : result.error);
    if (result.ok) {
      setFile(null);
      upload.current = null;
    }
    router.refresh();
  }
  async function start() {
    if (!file) return;
    setMessage("");
    setBusy(true);
    setPaused(false);
    try {
      courseFileMetadata(file.name, file.size);
      const grant = await startMaterialUploadAction(
        courseId,
        file.name,
        file.size,
      );
      if (!grant.ok) throw new Error(grant.error);
      if (grant.alreadyUploaded) {
        await finish(grant.entry.id);
        setBusy(false);
        return;
      }
      const task = new Upload(file, {
        endpoint: grant.endpoint,
        headers: {
          "x-signature": grant.token,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        },
        chunkSize: 6 * 1024 * 1024,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        fingerprint: async () => `smi-course-${grant.entry.id}-${file.size}`,
        metadata: {
          bucketName: COURSE_FILES_BUCKET,
          objectName: grant.entry.path,
          contentType: grant.entry.mimeType,
          cacheControl: "3600",
        },
        onProgress: (sent, total) =>
          setPercent(Math.round((sent / total) * 100)),
        onError: () => {
          setBusy(false);
          setTransferring(false);
          setPaused(true);
          setMessage(
            "Upload interrupted or rejected by storage. Resume to retry. Check your connection and the Free-plan storage allowance; each file must be 3 MB or smaller.",
          );
        },
        onSuccess: () => {
          void finish(grant.entry.id)
            .catch(() =>
              setMessage(
                "The transfer finished. Sign in again if needed, then use Finish / check to save the file.",
              ),
            )
            .finally(() => {
              setBusy(false);
              setTransferring(false);
            });
        },
      });
      upload.current = task;
      setTransferring(true);
      const previous = await task.findPreviousUploads().catch(() => []);
      if (previous[0]) task.resumeFromPreviousUpload(previous[0]);
      task.start();
    } catch (error) {
      setBusy(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start upload. Sign in and retry.",
      );
    }
    router.refresh();
  }
  async function remove(id: string) {
    setBusy(true);
    try {
      const result = await removeMaterialAction(courseId, id);
      setMessage(result.ok ? "Course file removed." : result.error);
      router.refresh();
    } catch {
      setMessage("Unable to remove the file. Sign in and retry.");
    } finally {
      setBusy(false);
    }
  }
  const used = materials.reduce((sum, m) => sum + m.sizeBytes, 0);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {formatCourseBytes(used)} of 150 MB reserved for this course. PDF,
        documents, archives, video and audio; cover pictures are separate. Your
        storage plan may allow a smaller maximum.
      </p>
      <label className="block text-sm">
        Choose course file
        <Input
          type="file"
          accept={COURSE_FILE_ACCEPT}
          disabled={busy}
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setPercent(0);
            setMessage("");
          }}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={!file || busy || used > COURSE_MATERIAL_LIMIT}
          onClick={() => void start()}
        >
          {busy
            ? "Uploading…"
            : paused
              ? "Resume upload"
              : "Upload course file"}
        </Button>
        {busy && transferring && (
          <Button
            variant="outline"
            onClick={() => {
              void upload.current?.abort();
              setBusy(false);
              setPaused(true);
              setTransferring(false);
            }}
          >
            Pause
          </Button>
        )}
      </div>
      {(busy || percent > 0) && (
        <div>
          <progress
            className="h-2 w-full"
            value={percent}
            max={100}
            aria-label="Course file upload progress"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {percent}% transferred{percent === 100 ? " · verifying file…" : ""}
          </p>
        </div>
      )}
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
      <ul className="space-y-2">
        {materials.map((m) => (
          <li
            key={m.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm"
          >
            <div className="min-w-0">
              <p className="break-words font-medium">{m.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {formatCourseBytes(m.sizeBytes)} ·{" "}
                {m.status === "ready"
                  ? "Available to enrolled students"
                  : "Pending upload"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {m.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => {
                    setBusy(true);
                    void finish(m.id)
                      .catch(() => setMessage("Sign in and retry."))
                      .finally(() => setBusy(false));
                  }}
                >
                  Finish / check
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => {
                  if (window.confirm(`Remove ${m.fileName} from this course?`))
                    void remove(m.id);
                }}
              >
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
