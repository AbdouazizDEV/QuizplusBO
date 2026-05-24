import type { Profile } from '@domain/entities/profile';

export function formatProfileLabel(profile: Pick<Profile, 'full_name' | 'username'>): string {
  const name = profile.full_name?.trim();
  const username = profile.username?.trim();

  if (name && username) {
    return `${name} (@${username})`;
  }
  if (username) return `@${username}`;
  if (name) return name;
  return 'Joueur sans identifiant';
}
