"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormStatusMessage } from "@/modules/auth/components/ui";

import { addModuleAction } from "../actions/manage-course.action";
import type { CourseBuilderActionResult } from "../actions/create-course.action";

export function AddModuleForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [state, setState] = useState<CourseBuilderActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("courseId", courseId);
      formData.set("title", title);

      const result = await addModuleAction(null, formData);
      setState(result);

      if (result.ok) {
        setTitle("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {state && !state.ok ? <FormStatusMessage variant="error" message={state.error} /> : null}
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New module title..."
          className="flex-1"
        />
        <Button type="submit" disabled={isPending || !title.trim()}>
          <Plus className="size-4" />
          Add module
        </Button>
      </div>
    </form>
  );
}
