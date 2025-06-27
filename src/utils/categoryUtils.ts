export const categorySlugMap: Record<string, string> = {
  'getting-started': 'Getting Started with Web3',
  'digital-assets': 'Managing Your Digital Assets',
  'communities': 'Participating in Decentralized Communities',
  'creative-publishing': 'Creative & Publishing',
  'data-infrastructure': 'Data & Infrastructure',
  'real-world-apps': 'Real-World Applications'
};

export const getCategoryBySlug = (slug: string) => {
  return categorySlugMap[slug] || null;
};

export const getSlugByCategory = (categoryTitle: string) => {
  const entry = Object.entries(categorySlugMap).find(([_, title]) => title === categoryTitle);
  return entry ? entry[0] : null;
};