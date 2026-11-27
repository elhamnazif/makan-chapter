// Photos in src/assets/images, looked up by file name without the extension. Build-time only:
// pages pass the result to <Photo>, which serves sized AVIF and WebP copies.
import type { ImageMetadata } from 'astro';
import sharp from 'sharp';

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

// Each photo's average colour, painted behind it. A photo that is still loading then shows as
// a block of its own colour, not as a hole in the page that flashes when the picture arrives.
const colours = new Map(
  await Promise.all(
    [...photos.keys()].map(async (name) => {
      const file = `${process.cwd()}/src/assets/images/${name}.webp`;
      const [r, g, b] = await sharp(file).resize(1, 1).removeAlpha().raw().toBuffer();
      return [name, `rgb(${r} ${g} ${b})`] as const;
    }),
  ),
);

export function photoColour(name: string): string {
  return colours.get(name) ?? 'transparent';
}
