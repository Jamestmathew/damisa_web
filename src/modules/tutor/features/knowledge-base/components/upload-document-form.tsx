"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FormStatusMessage } from "@/modules/auth/components/ui";

import { uploadDocumentAction } from "../actions/upload-document.action";

interface UploadDocumentFormProps {
  courseOptions: { id: string; label: string }[];
  allowedUploadTypes: string[];
  maxUploadSizeMb: number;
}

export function UploadDocumentForm({ courseOptions, allowedUploadTypes, maxUploadSizeMb }: UploadDocumentFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [courseId, setCourseId] = useState(courseOptions[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }

    setError(null);
    const courseLabel = courseOptions.find((c) => c.id === courseId)?.label ?? "";
    const fileType = file.name.split(".").pop() ?? "";
    const fileSizeMb = file.size / (1024 * 1024);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("courseId", courseId);
      formData.set("courseTitle", courseLabel);
      formData.set("fileName", file.name);
      formData.set("fileType", fileType);
      formData.set("fileSizeMb", String(fileSizeMb));

      const result = await uploadDocumentAction(null, formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
      {error ? <FormStatusMessage variant="error" message={error} /> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courseOptions.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          ref={fileInputRef}
          type="file"
          accept={allowedUploadTypes.map((type) => `.${type}`).join(",")}
          className="flex-1 text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground"
        />

        <Button onClick={handleUpload} disabled={isPending || !courseId}>
          <Upload className="size-4" />
          {isPending ? "Uploading..." : "Upload"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Allowed types: {allowedUploadTypes.join(", ")} · Max size: {maxUploadSizeMb}MB
      </p>
    </div>
  );
}
