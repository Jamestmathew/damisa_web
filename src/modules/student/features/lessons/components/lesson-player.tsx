import { FileText, PlayCircle, Paperclip } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { LessonDetails } from "../types";

const CONTENT_ICON = {
  video: PlayCircle,
  reading: FileText,
  resource: Paperclip,
} as const;

export function LessonPlayer({ lesson }: { lesson: LessonDetails }) {
  const Icon = CONTENT_ICON[lesson.contentType];

  return (
    <Card>
      {lesson.contentType === "video" &&
      /^https:\/\//.test(lesson.body.trim()) ? (
        <video
          className="aspect-video w-full rounded-t-lg bg-black"
          controls
          preload="metadata"
          src={lesson.body.trim()}
        />
      ) : null}
      <CardContent className="space-y-3 p-6">
        {lesson.contentType !== "video" && (
          <Icon className="size-6 text-muted-foreground" />
        )}
        <h2 className="text-lg font-semibold text-foreground">
          {lesson.title}
        </h2>
        {lesson.contentType === "resource" &&
        /^https:\/\//.test(lesson.body.trim()) ? (
          <a
            className="text-primary underline"
            href={lesson.body.trim()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open lesson resource
          </a>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {lesson.body}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
