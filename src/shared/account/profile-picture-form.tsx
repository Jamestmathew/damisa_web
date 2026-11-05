"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { CurrentUserAvatar } from "./current-user-avatar";
import { useSession } from "@/modules/auth/hooks/session-provider";
import { updateAvatarAction } from "./update-avatar.action";
export function ProfilePictureForm() {
  const { user } = useSession();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile picture</CardTitle>
        <CardDescription>
          Upload your account picture. PNG, JPEG, or WebP; maximum 3 MB.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <CurrentUserAvatar name={user?.name ?? "Account"} />
        <form
          className="space-y-3"
          action={(data) =>
            startTransition(async () => {
              setMessage("");
              try {
                const result = await updateAvatarAction(data);
                setMessage(
                  result.ok ? "Profile picture updated." : result.error,
                );
              } catch {
                setMessage("Unable to upload. Please retry.");
              }
            })
          }
        >
          <label className="block text-sm">
            Choose picture
            <Input
              type="file"
              name="avatar"
              accept="image/png,image/jpeg,image/webp"
              required
            />
          </label>
          <Button type="submit" disabled={pending}>
            {pending ? "Uploading..." : "Save profile picture"}
          </Button>
          {message && (
            <p role="status" className="text-sm">
              {message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
