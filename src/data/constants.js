// Shared taxonomy used across the platform

export const LEVELS = [
  { id: 'P1', label: 'Primary 1', group: 'Primary' },
  { id: 'P2', label: 'Primary 2', group: 'Primary' },
  { id: 'P3', label: 'Primary 3', group: 'Primary' },
  { id: 'P4', label: 'Primary 4', group: 'Primary' },
  { id: 'P5', label: 'Primary 5', group: 'Primary' },
  { id: 'P6', label: 'Primary 6', group: 'Primary' },
  { id: 'S1', label: 'Senior 1', group: 'Ordinary Level' },
  { id: 'S2', label: 'Senior 2', group: 'Ordinary Level' },
  { id: 'S3', label: 'Senior 3', group: 'Ordinary Level' },
  { id: 'S4', label: 'Senior 4', group: 'Advanced Level' },
  { id: 'S5', label: 'Senior 5', group: 'Advanced Level' },
  { id: 'S6', label: 'Senior 6', group: 'Advanced Level' },
]

export const LEVEL_GROUPS = [
  {
    id: 'primary',
    name: 'Primary',
    range: 'P1 – P6',
    blurb: 'Foundations in literacy, numeracy and discovery.',
    levels: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    accent: 'brand',
  },
  {
    id: 'ordinary',
    name: 'Ordinary Level',
    range: 'S1 – S3',
    blurb: 'Building strong subject mastery and exam readiness.',
    levels: ['S1', 'S2', 'S3'],
    accent: 'accent',
  },
  {
    id: 'advanced',
    name: 'Advanced Level',
    range: 'S4 – S6',
    blurb: 'Specialised combinations toward national examinations.',
    levels: ['S4', 'S5', 'S6'],
    accent: 'gold',
  },
]

export const SUBJECTS = [
  'Mathematics',
  'English',
  'Kinyarwanda',
  'Science',
  'Biology',
  'Chemistry',
  'Physics',
  'Geography',
  'History',
  'Computer Science',
  'Entrepreneurship',
  'French',
]

export const EXAM_LEVELS = ['P6', 'S3', 'S6']

// Rwanda's national examination programme began in 1999.
// Generated from the current year down to 1999 (newest first).
export const EXAM_YEARS = Array.from(
  { length: new Date().getFullYear() - 1999 + 1 },
  (_, i) => new Date().getFullYear() - i
)
