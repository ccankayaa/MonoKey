interface ProfileAvatarProps { displayName: string; identityPhotoUrl?: string | null | undefined }
export function ProfileAvatar({ displayName, identityPhotoUrl }: ProfileAvatarProps) {
  let photo: string | null = null;
  if (identityPhotoUrl) {
    try { const url = new URL(identityPhotoUrl); if (url.protocol === "https:" && url.hostname === "lh3.googleusercontent.com" && !url.username && !url.password) photo = url.href; } catch { /* Initials remain available. */ }
  }
  return photo ? <img src={photo} alt="" referrerPolicy="no-referrer" /> : <span aria-hidden="true">{displayName.slice(0, 2).toUpperCase()}</span>;
}
