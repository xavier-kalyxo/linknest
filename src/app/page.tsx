import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        LinkNest
      </h1>
      <p className="mt-4 max-w-md text-center text-lg text-gray-600">
        The link-in-bio tool that makes you look professional in seconds.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/signup"
          className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
        >
          Get Started Free
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium hover:bg-gray-50"
        >
          Log In
        </Link>
      </div>
    </main>
  );
}
