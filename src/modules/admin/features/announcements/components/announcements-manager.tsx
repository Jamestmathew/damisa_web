"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, EntityToolbar, ConfirmDialog } from "@/shared/components";

import { deleteAnnouncementAction } from "../actions/delete-announcement.action";
import type { AdminAnnouncement } from "../types";

import { AnnouncementFormDialog } from "./announcement-form-dialog";

const AUDIENCE_LABEL: Record<AdminAnnouncement["audience"], string> = {
  everyone: "Everyone",
  students: "Students",
  tutors: "Tutors",
  admins: "Admins",
};

export function AnnouncementsManager({ announcements }: { announcements: AdminAnnouncement[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return announcements;
    return announcements.filter((a) => a.title.toLowerCase().includes(q));
  }, [announcements, query]);

  return (
    <div>
      <EntityToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search announcements..."
        action={
          <AnnouncementFormDialog
            onSaved={() => router.refresh()}
            trigger={
              <Button>
                <Plus className="size-4" />
                New announcement
              </Button>
            }
          />
        }
      />

      {filtered.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements found" />
      ) : (
        <div className="space-y-3">
          {filtered.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{announcement.title}</p>
                    <Badge variant="outline">{AUDIENCE_LABEL[announcement.audience]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{announcement.body}</p>
                  <p className="text-xs text-muted-foreground">{announcement.postedAt}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <AnnouncementFormDialog
                    announcement={announcement}
                    onSaved={() => router.refresh()}
                    trigger={
                      <Button variant="ghost" size="icon" aria-label={`Edit ${announcement.title}`}>
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" size="icon" aria-label={`Delete ${announcement.title}`}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    }
                    title="Delete announcement"
                    description={`This will permanently remove "${announcement.title}".`}
                    confirmLabel="Delete"
                    onConfirm={async () => {
                      await deleteAnnouncementAction(announcement.id);
                      router.refresh();
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
