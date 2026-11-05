import Link from "next/link";
export default function Page() {
  return (
    <div className="mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-xl font-semibold">Your session has ended</h1>
      <p>Sign in again to continue.</p>
      <Link className="text-primary underline" href="/login">
        Go to login
      </Link>
    </div>
  );
}
