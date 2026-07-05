import type { LucideIcon } from "lucide-react";
import {
  Apple,
  Baby,
  Bath,
  Beef,
  Beer,
  CakeSlice,
  Candy,
  Carrot,
  Coffee,
  Cookie,
  Croissant,
  CupSoda,
  Dog,
  Droplets,
  Egg,
  Fish,
  Flower2,
  Ham,
  House,
  IceCreamCone,
  Leaf,
  Milk,
  Nut,
  Package,
  Pill,
  Pizza,
  Popcorn,
  Refrigerator,
  Salad,
  Sandwich,
  Shirt,
  ShoppingBasket,
  Snowflake,
  Soup,
  Sparkles,
  SprayCan,
  Tag,
  UtensilsCrossed,
  Wheat,
  Wine,
} from "lucide-react";

export type CategoryIconProps = {
  /** Icon-Name aus der Kategorie (z. B. "apple", "milk") oder ein Emoji */
  icon: string | null | undefined;
  className?: string;
};

/** Schlüssel: kleingeschrieben, ohne Leerzeichen/Bindestriche/Unterstriche */
const iconMap: Record<string, LucideIcon> = {
  // Lucide-Namen
  apple: Apple,
  baby: Baby,
  bath: Bath,
  beef: Beef,
  beer: Beer,
  cakeslice: CakeSlice,
  candy: Candy,
  carrot: Carrot,
  coffee: Coffee,
  cookie: Cookie,
  croissant: Croissant,
  cupsoda: CupSoda,
  dog: Dog,
  droplets: Droplets,
  egg: Egg,
  fish: Fish,
  flower2: Flower2,
  ham: Ham,
  home: House,
  house: House,
  icecreamcone: IceCreamCone,
  leaf: Leaf,
  milk: Milk,
  nut: Nut,
  package: Package,
  pill: Pill,
  pizza: Pizza,
  popcorn: Popcorn,
  refrigerator: Refrigerator,
  salad: Salad,
  sandwich: Sandwich,
  shirt: Shirt,
  shoppingbasket: ShoppingBasket,
  snowflake: Snowflake,
  soup: Soup,
  sparkles: Sparkles,
  spraycan: SprayCan,
  tag: Tag,
  utensilscrossed: UtensilsCrossed,
  wheat: Wheat,
  wine: Wine,
  // Deutsche Kategorienamen als Aliasse
  obst: Apple,
  gemuese: Carrot,
  gemüse: Carrot,
  fleisch: Beef,
  wurst: Ham,
  fisch: Fish,
  milch: Milk,
  milchprodukte: Milk,
  kaese: Milk,
  käse: Milk,
  eier: Egg,
  brot: Croissant,
  backwaren: Croissant,
  getreide: Wheat,
  nudeln: Wheat,
  pasta: Wheat,
  reis: Wheat,
  konserven: Package,
  vorrat: Package,
  tiefkuehl: Snowflake,
  tiefkühl: Snowflake,
  tk: Snowflake,
  getraenke: CupSoda,
  getränke: CupSoda,
  alkohol: Wine,
  kaffee: Coffee,
  tee: Coffee,
  suesses: Candy,
  süßes: Candy,
  suessigkeiten: Candy,
  süßigkeiten: Candy,
  snacks: Popcorn,
  gewuerze: Soup,
  gewürze: Soup,
  soßen: Soup,
  saucen: Soup,
  oel: Droplets,
  öl: Droplets,
  haushalt: House,
  putzmittel: SprayCan,
  reinigung: SprayCan,
  drogerie: Bath,
  hygiene: Bath,
  apotheke: Pill,
  tier: Dog,
  haustier: Dog,
  pflanzen: Flower2,
  sonstiges: Tag,
};

function normalize(icon: string): string {
  return icon.trim().toLowerCase().replace(/[\s_-]/g, "");
}

/** Nur ASCII-Wörter werden als Icon-Namen interpretiert; alles andere (z. B. Emojis) wird direkt gerendert. */
function isIconName(icon: string): boolean {
  return /^[a-zA-Z0-9äöüß\s_-]+$/.test(icon);
}

export function CategoryIcon({ icon, className }: CategoryIconProps) {
  const classes = className ?? "size-4";

  if (icon && !isIconName(icon)) {
    // Emoji oder anderes Symbol direkt anzeigen
    return (
      <span aria-hidden className={`inline-flex items-center justify-center leading-none ${classes}`}>
        {icon}
      </span>
    );
  }

  const Icon = (icon && iconMap[normalize(icon)]) || Tag;
  return <Icon className={classes} aria-hidden />;
}
