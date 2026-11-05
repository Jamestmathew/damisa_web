import Link from "next/link";

interface AuthFooterProps {
  prompt: string;
  linkLabel: string;
  href: string;
}

export function AuthFooter({ prompt, linkLabel, href }: AuthFooterProps) {
  return (
    <p className="mt-6 text-center text-sm text-muted-foreground">
      {prompt}{" "}
      <Link
        href={href}
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        {linkLabel}
      </Link>
    </p>
  );
}
