export function RoleFooter({ label }: { label: string }) {
  return (
    <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} {label}. All rights reserved.
    </footer>
  );
}
