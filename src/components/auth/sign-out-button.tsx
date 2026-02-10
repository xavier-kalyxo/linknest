"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-gray-500 transition-colors hover:text-gray-800"
    >
      Sign out
    </button>
  );
}
