// Static site content: stats, benefits, popular subjects, FAQs, nav links.

import {
  BookOpen, FileText, Brain, Search, GraduationCap, ShieldCheck,
  Zap, HeartHandshake, Globe2, Wallet, Sparkles, LineChart,
  Sigma, Atom, Microscope, FlaskConical, Languages, Laptop, MapPin, Landmark,
} from 'lucide-vue-next'

export const navLinks = [
  { name: 'Home', key: 'nav.home', to: '/' },
  { name: 'Books', key: 'nav.books', to: '/books' },
  { name: 'Past Papers', key: 'nav.papers', to: '/past-papers' },
  { name: 'Exercises', key: 'nav.exercises', to: '/exercises' },
  { name: 'About', key: 'nav.about', to: '/about' },
  { name: 'Contact', key: 'nav.contact', to: '/contact' },
]

export const stats = [
  { value: 1200, suffix: '+', label: 'Curriculum books' },
  { value: 850, suffix: '+', label: 'Exam past papers' },
  { value: 5000, suffix: '+', label: 'Practice questions' },
  { value: 60000, suffix: '+', label: 'Active learners' },
]

export const benefits = [
  {
    icon: Wallet,
    title: '100% Free Access',
    desc: 'Every book, paper and exercise is available at no cost \u2014 quality education for every Rwandan learner.',
  },
  {
    icon: GraduationCap,
    title: 'Curriculum Aligned',
    desc: 'All content follows the official Rwandan competence-based curriculum from P1 through S6.',
  },
  {
    icon: Zap,
    title: 'Learn Anytime',
    desc: 'Study offline-ready PDFs and practice interactively from any phone, tablet or computer.',
  },
    {
    icon: LineChart,
    title: 'Save & Track',
    desc: 'Create a free account to bookmark your favourite books and papers and pick up where you left off.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted Content',
    desc: 'Sourced from REB and verified educators so you always study from reliable material.',
  },
  {
    icon: Globe2,
    title: 'One Central Hub',
    desc: 'Stop searching across the web. Find everything you need to succeed in a single place.',
  },
]

export const featureHighlights = [
  {
    icon: BookOpen,
    name: 'Curriculum Books',
    desc: 'Browse and download official textbooks for every level and subject.',
    to: '/books',
    accent: 'brand',
  },
  {
    icon: FileText,
    name: 'Past Papers',
    desc: 'Practise with real P6, S3 and S6 national examination papers.',
    to: '/past-papers',
    accent: 'accent',
  },
  {
    icon: Brain,
    name: 'Interactive Exercises',
    desc: 'Test yourself with instant feedback and clear explanations.',
    to: '/exercises',
    accent: 'gold',
  },
  {
    icon: Search,
    name: 'Smart Discovery',
    desc: 'Powerful search and filters help you find resources in seconds.',
    to: '/books',
    accent: 'brand',
  },
]

// Professional Lucide icons (no emojis) with per-subject accent colours.
export const popularSubjects = [
  { name: 'Mathematics', count: 240, icon: Sigma, accent: 'brand' },
  { name: 'Physics', count: 132, icon: Atom, accent: 'accent' },
  { name: 'Biology', count: 158, icon: Microscope, accent: 'brand' },
  { name: 'Chemistry', count: 121, icon: FlaskConical, accent: 'gold' },
  { name: 'English', count: 196, icon: BookOpen, accent: 'accent' },
  { name: 'Kinyarwanda', count: 174, icon: Languages, accent: 'brand' },
  { name: 'Computer Science', count: 88, icon: Laptop, accent: 'accent' },
  { name: 'Geography', count: 102, icon: Globe2, accent: 'gold' },
  { name: 'History', count: 96, icon: Landmark, accent: 'brand' },
  { name: 'Entrepreneurship', count: 74, icon: LineChart, accent: 'accent' },
]

export const faqs = [
  {
    q: 'Is MENYA really free to use?',
    a: 'Yes. MENYA is completely free. Every curriculum book, past paper and exercise can be accessed and downloaded at no cost.',
  },
  {
    q: 'Which levels does MENYA cover?',
    a: 'We cover the full Rwandan school journey \u2014 Primary 1 (P1) through Senior 6 (S6) \u2014 across all core subjects.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No account is required. You can start reading, practising and downloading immediately.',
  },
  {
    q: 'Can I use MENYA on my phone?',
    a: 'Absolutely. MENYA is fully responsive and works smoothly on phones, tablets and computers.',
  },
  {
    q: 'Where does the content come from?',
    a: 'Our materials are aligned with the official REB competence-based curriculum and reviewed by experienced Rwandan educators.',
  },
  {
    q: 'How can teachers contribute content?',
    a: 'Educators can reach out through our Contact page. We welcome partnerships to expand and improve the library.',
  },
]

export const contactInfo = {
  email: 'hello@menya.rw',
  phone: '+250 788 000 000',
  address: 'KG 7 Ave, Kigali Innovation City, Kigali, Rwanda',
}
