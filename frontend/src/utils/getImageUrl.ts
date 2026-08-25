const ASSET_URL = import.meta.env.VITE_ASSET_URL || "http://localhost:5000";

export const getImageUrl = (
  path?: string | null,
  fallbackLabel: string = "No+Image",
): string => {
  if (!path) {
    return `https://placehold.co/600x600/f4f4f5/94a3b8?text=${fallbackLabel}`;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${ASSET_URL}${path}`;
};

export default getImageUrl;
