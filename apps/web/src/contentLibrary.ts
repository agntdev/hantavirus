export type ContentFormat = 'article' | 'expert_submission' | 'infographic' | 'video';
export type ReviewStatus = 'expert_review' | 'needs_sources' | 'ready';

export type LibraryItem = {
  format: ContentFormat;
  id: string;
  owner: string;
  reviewStatus: ReviewStatus;
  sourceRequirement: string;
  summary: string;
  title: string;
};

export const contentFormats: Array<{ label: string; value: ContentFormat | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Articles', value: 'article' },
  { label: 'Videos', value: 'video' },
  { label: 'Infographics', value: 'infographic' },
  { label: 'Expert submissions', value: 'expert_submission' }
];

export const libraryItems: LibraryItem[] = [
  {
    format: 'article',
    id: 'prevention-checklist',
    owner: 'Content team',
    reviewStatus: 'expert_review',
    sourceRequirement: 'Needs public-health source review before publishing.',
    summary: 'Plain-language prevention checklist draft for household and workplace readers.',
    title: 'Prevention checklist article'
  },
  {
    format: 'video',
    id: 'outbreak-awareness-video',
    owner: 'Education team',
    reviewStatus: 'needs_sources',
    sourceRequirement: 'Needs cited script sources and reviewer approval.',
    summary: 'Short explainer outline for outbreak awareness and where to find updates.',
    title: 'Outbreak awareness video'
  },
  {
    format: 'infographic',
    id: 'response-pathway-infographic',
    owner: 'Design team',
    reviewStatus: 'expert_review',
    sourceRequirement: 'Needs medical reviewer sign-off before export.',
    summary: 'Infographic template for response steps and escalation resources.',
    title: 'Response pathway infographic'
  },
  {
    format: 'expert_submission',
    id: 'expert-correction-flow',
    owner: 'Expert contributors',
    reviewStatus: 'ready',
    sourceRequirement: 'Requires contact, credentials, source links, and correction notes.',
    summary: 'Structured submission lane for expert corrections and new content proposals.',
    title: 'Expert content submission'
  }
];

export function getLibraryItems(format: ContentFormat | 'all' = 'all') {
  return libraryItems.filter((item) => format === 'all' || item.format === format);
}

export function summarizeLibrary(items = libraryItems) {
  return {
    expertReview: items.filter((item) => item.reviewStatus === 'expert_review').length,
    formats: new Set(items.map((item) => item.format)).size,
    ready: items.filter((item) => item.reviewStatus === 'ready').length,
    total: items.length
  };
}
