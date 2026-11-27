// Photos in src/assets/images, looked up by file name without the extension. Build-time only:
// pages pass the result to <Photo>, which serves sized AVIF and WebP copies.
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/images/*.webp', {
  eager: true,
});
const photos = new Map(
  Object.entries(files).map(([path, mod]) => [
    path.slice(path.lastIndexOf('/') + 1, -5),
    mod.default,
  ]),
);

export function photo(name: string): ImageMetadata {
  const image = photos.get(name);
  if (!image) {
    throw new Error(`No photo named ${name} in src/assets/images`);
  }
  return image;
}
