"use client";

import { useState, useTransition } from "react";
import { Sparkles, Send } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormStatusMessage } from "@/modules/auth/components/ui";

import { testCourseAiAction } from "../actions/test-course-ai.action";
import type { TestChatExchange } from "../types";

export function TestCourseAiPanel() {
  const [question, setQuestion] = useState("");
  const [exchanges, setExchanges] = useState<TestChatExchange[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAsk() {
    const q = question.trim();
    if (!q) return;

    setError(null);
    startTransition(async () => {
      const result = await testCourseAiAction(q);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setExchanges((prev) => [
        ...prev,
        { id: `ex_${Date.now()}`, question: q, answer: result.answer },
      ]);
      setQuestion("");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Test your course&apos;s AI</CardTitle>
        <CardDescription>
          Preview how students will experience AI Chat for this course, grounded
          in what you&apos;ve uploaded.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <FormStatusMessage variant="error" message={error} /> : null}

        {exchanges.length > 0 ? (
          <div className="space-y-3">
            {exchanges.map((exchange) => (
              <div key={exchange.id} className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {exchange.question}
                </p>
                <div className="flex items-start gap-2 rounded-md bg-secondary p-3 text-sm text-secondary-foreground">
                  <Sparkles className="mt-0.5 size-4 shrink-0" />
                  <p>{exchange.answer}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Ask a question a student might ask..."
          />
          <Button
            onClick={handleAsk}
            disabled={isPending || !question.trim()}
            aria-label="Ask"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
