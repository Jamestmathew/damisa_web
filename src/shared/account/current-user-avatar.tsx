"use client";
import { useSession } from "@/modules/auth/hooks/session-provider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
export function CurrentUserAvatar({ name }: { name: string }) {
  const { user } = useSession();
  const letters = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <Avatar>
      {user?.avatarUrl && (
        <AvatarImage src={user.avatarUrl} alt={`${name}'s profile picture`} />
      )}
      <AvatarFallback>{letters}</AvatarFallback>
    </Avatar>
  );
}
