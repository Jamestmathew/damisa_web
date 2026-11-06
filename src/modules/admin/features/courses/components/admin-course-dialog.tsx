"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createAdminCourseAction } from "../actions/create-admin-course.action";
export function AdminCourseDialog({
  tutors,
}: {
  tutors: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false),
    [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create course</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create course</DialogTitle>
          <DialogDescription>
            Save the course, then upload PDFs and course files on its page.
            Cover pictures are optional and separate.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          action={(data) =>
            startTransition(async () => {
              setError("");
              try {
                const result = await createAdminCourseAction(data);
                if (result.ok) {
                  setOpen(false);
                  router.push(
                    data.get("afterCreate") === "dashboard"
                      ? "/admin/dashboard"
                      : `/admin/courses/${result.courseId}`,
                  );
                  router.refresh();
                } else setError(result.error);
              } catch {
                setError("Unable to save. Check your connection and retry.");
              }
            })
          }
        >
          <label className="block text-sm">
            Title
            <Input name="title" required maxLength={200} />
          </label>
          <label className="block text-sm">
            Course code
            <Input name="code" required maxLength={40} />
          </label>
          <label className="block text-sm">
            Description
            <Textarea name="description" required maxLength={10000} />
          </label>
          <label className="block text-sm">
            Credit units
            <Input
              name="creditUnits"
              type="number"
              min="1"
              max="30"
              defaultValue="3"
              required
            />
          </label>
          <label className="block text-sm">
            Tutor
            <select
              name="instructorId"
              className="h-10 w-full rounded-md border bg-background px-3"
              required
            >
              {tutors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          {!tutors.length && (
            <p className="text-sm">
              Create an active Tutor account under Staff first.
            </p>
          )}
          <label className="block text-sm">
            Status
            <select
              name="status"
              className="h-10 w-full rounded-md border bg-background px-3"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="block text-sm">
            Cover picture (optional)
            <Input
              name="cover"
              type="file"
              accept="image/png,image/jpeg,image/webp"
            />
          </label>
          <p className="text-xs text-muted-foreground">
            PNG, JPEG, or WebP; maximum 3 MB.
          </p>
          <label className="block text-sm">
            After creating
            <select
              name="afterCreate"
              className="h-10 w-full rounded-md border bg-background px-3"
            >
              <option value="course">
                Open the created course to upload files
              </option>
              <option value="dashboard">Go to dashboard</option>
            </select>
          </label>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={pending || !tutors.length}>
            {pending ? "Creating..." : "Create course"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
