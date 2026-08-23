"use client";
import { useSession, signOut } from "next-auth/react";

export default function AuthNav() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session) {
    return (
      <div className="auth-nav">
        <a href="/auth/signin" className="auth-link">Sign In</a>
      </div>
    );
  }

  return (
    <div className="auth-nav">
      <a href="/dashboard" className="auth-link">Dashboard</a>
      {session.user.role === "admin" && (
        <a href="/admin" className="auth-link">Admin</a>
      )}
      <button className="auth-link auth-logout" onClick={() => signOut({ callbackUrl: "/" })}>
        Sign Out
      </button>
    </div>
  );
}
