"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Megaphone, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton, FormStatusMessage } from "@/modules/auth/components/ui";
import { EmptyState, ConfirmDialog } from "@/shared/components";

import {
  createTutorAnnouncementAction,
  deleteTutorAnnouncementAction,
} from "../actions/manage-announcement.action";
import {
  tutorAnnouncementFormSchema,
  type TutorAnnouncementFormSchema,
} from "../validation/announcement-form.schema";
import type { TutorAnnouncement, TutorAnnouncementActionResult } from "../types";

interface TutorAnnouncementsManagerProps {
  announcements: TutorAnnouncement[];
  courseOptions: { id: string; label: string }[];
}

export function TutorAnnouncementsManager({ announcements, courseOptions }: TutorAnnouncementsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<TutorAnnouncementActionResult | null>(null);

  const form = useForm<TutorAnnouncementFormSchema>({
    resolver: zodResolver(tutorAnnouncementFormSchema),
    defaultValues: { courseId: courseOptions[0]?.id ?? "", title: "", body: "" },
  });

  function onSubmit(values: TutorAnnouncementFormSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("courseId", values.courseId);
      formData.set("title", values.title);
      formData.set("body", values.body);

      const result = await createTutorAnnouncementAction(null, formData);
      setState(result);

      if (result.ok) {
        form.reset();
        router.refresh();
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        {announcements.length === 0 ? (
          <EmptyState icon={Megaphone} title="No announcements yet" />
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium text-foreground">{announcement.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {announcement.courseCode} · {announcement.postedAt}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{announcement.body}</p>
                  </div>
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" size="icon" aria-label={`Delete ${announcement.title}`}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    }
                    title="Delete announcement"
                    description={`This will remove "${announcement.title}".`}
                    confirmLabel="Delete"
                    onConfirm={async () => {
                      await deleteTutorAnnouncementAction(announcement.id);
                      router.refresh();
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Form {...form}>
        {state && !state.ok ? <FormStatusMessage variant="error" message={state.error} /> : null}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="courseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courseOptions.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton type="submit" isLoading={isPending} loadingText="Posting...">
            Post announcement
          </LoadingButton>
        </form>
      </Form>
    </div>
  );
}
