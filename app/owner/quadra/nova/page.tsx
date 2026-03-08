"use client";

import { OwnerGuard } from "@/components/owner-guard";
import { OwnerNav } from "@/components/owner-nav";
import { QuadraForm } from "@/components/quadra-form";
import type { User } from "@/lib/api";

function NovaQuadraContent({ user }: { user: User }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <OwnerNav user={user} />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <QuadraForm mode="criar" redirectTo="/owner" />
        </div>
      </main>
    </div>
  );
}

export default function NovaQuadraPage() {
  return <OwnerGuard>{(user) => <NovaQuadraContent user={user} />}</OwnerGuard>;
}
