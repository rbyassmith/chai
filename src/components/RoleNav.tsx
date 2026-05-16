"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { DictKey } from "@/lib/i18n/dictionaries";

type Item = { href: string; labelKey: DictKey };

export function RoleNav({ items }: { items: Item[] }) {
  const pathname = usePathname();
  const { t } = useLocale();
  return (
    <nav className="flex items-center gap-1 overflow-x-auto text-sm">
      {items.map((it) => {
        const active =
          pathname === it.href ||
          (it.href !== "/" && pathname.startsWith(it.href));
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`whitespace-nowrap rounded-full px-3 py-1 transition-colors ${active ? "bg-clay-500 text-cream-50" : "text-ink-700 hover:bg-cream-200"}`}
          >
            {t(it.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
