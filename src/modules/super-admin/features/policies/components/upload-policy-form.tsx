"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormStatusMessage } from "@/modules/auth/components/ui";

import { uploadPolicyAction } from "../actions/manage-policy.action";

export function UploadPolicyForm({
  allowedUploadTypes,
  maxUploadSizeMb,
}: {
  allowedUploadTypes: string[];
  maxUploadSizeMb: number;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }

    setError(null);
    const fileType = file.name.split(".").pop() ?? "";
    const fileSizeMb = file.size / (1024 * 1024);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("fileName", file.name);
      formData.set("fileType", fileType);
      formData.set("fileSizeMb", String(fileSizeMb));

      const result = await uploadPolicyAction(null, formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
      {error ? <FormStatusMessage variant="error" message={error} /> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Policy title, e.g. Refund Policy"
          className="sm:w-64"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedUploadTypes.map((type) => `.${type}`).join(",")}
          className="flex-1 text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground"
        />
        <Button onClick={handleUpload} disabled={isPending}>
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
