"use client";
import { useState, useTransition } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { updateCourseCoverAction } from "../actions/update-cover.action";
export function CourseCoverDialog({ id }: { id: string }) {
  const [open, setOpen] = useState(false),
    [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Change course cover">
          <ImagePlus className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Course cover picture</DialogTitle>
          <DialogDescription>
            Upload a PNG, JPEG, or WebP picture up to 3 MB.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          action={(data) =>
            startTransition(async () => {
              setError("");
              try {
                const result = await updateCourseCoverAction(data);
                if (result.ok) setOpen(false);
                else setError(result.error);
              } catch {
                setError("Unable to upload the picture.");
              }
            })
          }
        >
          <input type="hidden" name="courseId" value={id} />
          <label className="block text-sm">
            Cover picture
            <Input
              type="file"
              name="cover"
              accept="image/png,image/jpeg,image/webp"
              required
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Uploading..." : "Save picture"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
