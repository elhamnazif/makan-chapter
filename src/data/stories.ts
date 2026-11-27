// Stories behind Makan Chapter, shown on /our-story/ in order.
// Only add stories the owners have written or approved. Each one renders as a
// chapter with an optional photo from public/images (name without extension).
//
// Example:
// {
//   title: 'Where it started',
//   paragraphs: ['First paragraph.', 'Second paragraph.'],
//   image: 'ambeng-basket',
//   imageAlt: 'Nasi ambeng in a woven basket',
// },
export interface Story {
  title: string;
  paragraphs: Array<string>;
  image?: string;
  imageAlt?: string;
}

export const stories: Array<Story> = [];
