"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout, type User } from "@/lib/api";
import { LayoutDashboard, PlusCircle, LogOut, ChevronRight } from "lucide-react";

interface Props {
  user: User;
}

const links = [
  { href: "/owner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/quadra/nova", label: "Nova Quadra", icon: PlusCircle },
];

export function OwnerNav({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/owner/login");
  }

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/" className="text-xl font-black tracking-widest text-green-600">FUTZER</Link>
        <p className="text-xs text-gray-500 mt-0.5">Painel do Dono</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">{user.nome}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
