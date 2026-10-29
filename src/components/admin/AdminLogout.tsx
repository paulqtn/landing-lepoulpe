"use client";

export function AdminLogout({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="w-full text-left"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin";
      }}
    >
      {children}
    </button>
  );
}
