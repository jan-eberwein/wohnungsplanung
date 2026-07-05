import {
  CookingPot,
  House,
  ListTodo,
  Package,
  Settings,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  /** Voller Name (Sidebar) */
  label: string;
  /** Kurzlabel (Tab-Bar) */
  shortLabel: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", shortLabel: "Home", icon: House },
  { href: "/einkaufsliste", label: "Liste", shortLabel: "Liste", icon: ListTodo },
  { href: "/einkaufen", label: "Einkaufen", shortLabel: "Einkaufen", icon: ShoppingCart },
  { href: "/vorrat", label: "Vorrat", shortLabel: "Vorrat", icon: Package },
  { href: "/rezepte", label: "Rezepte", shortLabel: "Rezepte", icon: CookingPot },
  { href: "/einstellungen", label: "Einstellungen", shortLabel: "Mehr", icon: Settings },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
