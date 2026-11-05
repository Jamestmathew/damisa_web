"use client";

import { useRouter } from "next/navigation";
import { Upload, Archive } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/shared/components";

import { toggleCoursePublishAction } from "../actions/manage-course.action";

export function PublishToggle({
  courseId,
  status,
  courseTitle,
}: {
  courseId: string;
  status: "published" | "draft";
  courseTitle: string;
}) {
  const router = useRouter();

  if (status === "draft") {
    return (
      <ConfirmDialog
        trigger={
          <Button size="sm">
            <Upload className="size-4" />
            Publish course
          </Button>
        }
        title="Publish course"
        description={`${courseTitle} will become visible to enrolled students.`}
        confirmLabel="Publish"
        onConfirm={async () => {
          await toggleCoursePublishAction(courseId, "published");
          router.refresh();
        }}
      />
    );
  }

  return (
    <ConfirmDialog
      trigger={
        <Button size="sm" variant="outline">
          <Archive className="size-4" />
          Unpublish
        </Button>
      }
      title="Unpublish course"
      description={`${courseTitle} will be hidden from students until republished.`}
      confirmLabel="Unpublish"
      onConfirm={async () => {
        await toggleCoursePublishAction(courseId, "draft");
        router.refresh();
      }}
    />
  );
}
