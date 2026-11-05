export const SESSION_COOKIE = "lms_session";
export const RECOVERY_COOKIE = "lms_recovery";
export const SESSION_SECONDS = 24 * 60 * 60;
export const REMEMBER_SECONDS = 30 * SESSION_SECONDS;

export function safeLocalPath(value: string | null, fallback = "/dashboard") {
  return value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !/[\\\r\n]/.test(value)
    ? value
    : fallback;
}

export function gradeAnswers(
  questions: { id: string; options: string[]; correctOptionIndex: number }[],
  answers: Record<string, string>,
) {
  if (
    !questions.length ||
    Object.keys(answers).length !== questions.length ||
    Object.keys(answers).some((id) => !questions.some((q) => q.id === id))
  ) {
    throw new Error("Answer every question exactly once.");
  }
  let correctCount = 0;
  for (const question of questions) {
    const answer = answers[question.id];
    const option = Number(answer);
    if (
      !answer ||
      !/^\d+$/.test(answer) ||
      !Number.isInteger(option) ||
      option < 0 ||
      option >= question.options.length
    ) {
      throw new Error("Invalid answer option.");
    }
    if (option === question.correctOptionIndex) correctCount++;
  }
  return {
    correctCount,
    totalCount: questions.length,
    scorePercent: Math.round((correctCount / questions.length) * 100),
  };
}

export function parseClassSchedule(value: string) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
  const selected = days.filter((day) =>
    new RegExp(`\\b${day}\\b`, "i").test(value),
  );
  const match = value.match(
    /\b([01]\d|2[0-3]):([0-5]\d)\s*[-–]\s*([01]\d|2[0-3]):([0-5]\d)/,
  );
  if (!selected.length || !match) return null;
  const startTime = `${match[1]}:${match[2]}`,
    endTime = `${match[3]}:${match[4]}`;
  if (startTime >= endTime) return null;
  return {
    days: selected,
    startTime,
    endTime,
    venue: value.split("|")[1]?.trim() ?? "",
  };
}

export function normalizeDeadline(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value))
    throw new Error("Choose a due date and time.");
  const time = new Date(
    /Z$|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}+01:00`,
  );
  if (!Number.isFinite(time.getTime())) throw new Error("Invalid due date.");
  return time.toISOString();
}

export function isMatricIdentifier(value: string) {
  return /^[a-z0-9][a-z0-9/_. -]{0,99}$/i.test(value);
}
