"use client";
import { useState, useTransition } from "react";
import { useSession } from "@/modules/auth/hooks/session-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { updateAccountNameAction } from "./update-name.action";
export function AccountNameForm() {
  const { user } = useSession();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Account details</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          action={(data) =>
            startTransition(async () => {
              try {
                const result = await updateAccountNameAction(data);
                setMessage(result.ok ? "Account name updated." : result.error);
              } catch {
                setMessage("Unable to update your account.");
              }
            })
          }
        >
          <label className="block text-sm">
            Display name
            <Input
              name="name"
              defaultValue={user?.name ?? ""}
              required
              minLength={2}
              maxLength={150}
            />
          </label>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save account details"}
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
