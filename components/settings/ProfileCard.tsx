import { Avatar } from "@/components/ui/Avatar";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Profile } from "@/lib/types";

/** Profil-Sektion: großer Avatar mit Accent-Ring, Name und Username. */
export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <GlassCard className="flex items-center gap-4 p-5">
      <span className="inline-flex shrink-0 rounded-full border-2 border-accent p-1">
        <Avatar
          name={profile.display_name}
          color={profile.accent_color}
          size="lg"
        />
      </span>
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold">{profile.display_name}</p>
        <p className="truncate text-sm text-muted">
          Angemeldet als {profile.username}
        </p>
      </div>
    </GlassCard>
  );
}
