"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton, FormStatusMessage } from "@/modules/auth/components/ui";
import { AI_ALLOWED_UPLOAD_TYPES, type AiGovernancePolicy } from "@/shared/ai";

import {
  saveAiGovernanceAction,
  type AiGovernanceActionResult,
} from "../actions/save-ai-governance.action";
import {
  aiGovernanceFormSchema,
  type AiGovernanceFormSchema,
} from "../validation/ai-governance-form.schema";

export function AiGovernanceForm({ policy }: { policy: AiGovernancePolicy }) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<AiGovernanceActionResult | null>(null);

  const form = useForm<AiGovernanceFormSchema>({
    resolver: zodResolver(aiGovernanceFormSchema),
    defaultValues: {
      aiFeaturesEnabled: policy.aiFeaturesEnabled,
      studentChatEnabled: policy.studentChatEnabled,
      tutorKnowledgeBaseEnabled: policy.tutorKnowledgeBaseEnabled,
      maxUploadSizeMb: policy.maxUploadSizeMb,
      storageQuotaGb: policy.storageQuotaGb,
      allowedUploadTypes: policy.allowedUploadTypes,
    },
  });

  const allowedTypes = useWatch({
    control: form.control,
    name: "allowedUploadTypes",
  });

  function toggleType(type: string) {
    const next = allowedTypes.includes(type)
      ? allowedTypes.filter((t) => t !== type)
      : [...allowedTypes, type];
    form.setValue("allowedUploadTypes", next, { shouldValidate: true });
  }

  function onSubmit(values: AiGovernanceFormSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      if (values.aiFeaturesEnabled) formData.set("aiFeaturesEnabled", "on");
      if (values.studentChatEnabled) formData.set("studentChatEnabled", "on");
      if (values.tutorKnowledgeBaseEnabled)
        formData.set("tutorKnowledgeBaseEnabled", "on");
      formData.set("maxUploadSizeMb", String(values.maxUploadSizeMb));
      formData.set("storageQuotaGb", String(values.storageQuotaGb));
      values.allowedUploadTypes.forEach((type) =>
        formData.append("allowedUploadTypes", type),
      );

      const result = await saveAiGovernanceAction(null, formData);
      setState(result);
    });
  }

  const usagePercent = Math.round(
    (policy.storageUsedGb / policy.storageQuotaGb) * 100,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Storage usage</CardTitle>
          <CardDescription>
            {policy.storageUsedGb.toFixed(1)} GB of {policy.storageQuotaGb} GB
            used across all course knowledge bases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={usagePercent} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI feature governance</CardTitle>
          <CardDescription>
            Controls what Student and Tutor can do with AI — not the AI provider
            itself, which is reserved for a future platform-level configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            {state ? (
              <FormStatusMessage
                variant={state.ok ? "success" : "error"}
                message={state.ok ? state.message : state.error}
              />
            ) : null}

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="aiFeaturesEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-y-0 space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-input text-primary"
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        Enable AI features platform-wide
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studentChatEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-y-0 space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-input text-primary"
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        Student AI Chat
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tutorKnowledgeBaseEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-y-0 space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-input text-primary"
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        Tutor Knowledge Base uploads
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxUploadSizeMb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max upload size (MB)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="storageQuotaGb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage quota (GB)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="allowedUploadTypes"
                render={() => (
                  <FormItem>
                    <FormLabel>Allowed upload types</FormLabel>
                    <div className="flex flex-wrap gap-3">
                      {AI_ALLOWED_UPLOAD_TYPES.map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-1.5 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={allowedTypes.includes(type)}
                            onChange={() => toggleType(type)}
                            className="h-4 w-4 rounded border-input text-primary"
                          />
                          .{type}
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <LoadingButton
                type="submit"
                isLoading={isPending}
                loadingText="Saving..."
              >
                Save AI governance settings
              </LoadingButton>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
