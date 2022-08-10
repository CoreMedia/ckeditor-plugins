export const heading = (text: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 1): string => `<p class="p--heading-${level}">${text}</p>`;

export const h1 = (text: string): string => heading(text, 1);
export const h2 = (text: string): string => heading(text, 1);
export const h3 = (text: string): string => heading(text, 1);
export const h4 = (text: string): string => heading(text, 1);
export const h5 = (text: string): string => heading(text, 1);
export const h6 = (text: string): string => heading(text, 1);

export const strong = (text: string): string => `<strong>${text}</strong>`;
export const em = (text: string): string => `<em>${text}</em>`;
export const p = (text: string): string => `<p>${text}</p>`;

export const sectionHeading = (text: string): string => p(strong(text));
