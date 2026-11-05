"use client";
import { useState, useTransition } from "react";
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
import { createAdmissionAction } from "../actions/create-admission.action";
export function CreateAdmissionDialog() {
  const [open, setOpen] = useState(false),
    [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add application</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record admission application</DialogTitle>
          <DialogDescription>
            Approval records the admission decision. Provision the
            student&apos;s login separately under Users.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          action={(data) =>
            startTransition(async () => {
              try {
                const result = await createAdmissionAction(data);
                if (result.ok) setOpen(false);
                else setError(result.error);
              } catch {
                setError("Unable to save the application. Please retry.");
              }
            })
          }
        >
          {[
            { name: "applicantName", label: "Applicant name" },
            { name: "email", label: "Email" },
            { name: "program", label: "Program" },
            { name: "session", label: "Academic session" },
          ].map((f) => (
            <label className="block text-sm" key={f.name}>
              {f.label}
              <Input
                name={f.name}
                type={f.name === "email" ? "email" : "text"}
                required
                maxLength={150}
              />
            </label>
          ))}
          {error && <p role="alert">{error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save application"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
