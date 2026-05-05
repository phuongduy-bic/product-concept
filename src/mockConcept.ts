import type { ConceptLegacy } from './api'

// Static demo concept that mirrors the original repo's Page 7 example —
// used by the "Skip to result" button on the welcome page so the final
// layout can be reviewed without running the full Q&A.
export const MOCK_LEGACY_CONCEPT: ConceptLegacy = {
  name: 'Instagram Business Kickstart: From Setup to Your First Followers',
  tagline:
    'A focused mini-course that takes a small business from a blank Instagram account to a thriving profile.',
  summary:
    'Based on your expertise depth and audience level, a mini-course is the ideal format. It provides enough structure for beginners without overwhelming them, and can be completed in a focused learning session. This format has high perceived value while being achievable to create.',
  productOutline: [
    {
      section: 'Lesson 1',
      title: 'Business Profile Setup',
      description:
        'Converting to business account, choosing category, completing profile sections',
      outputs: ['"How do I set up..."'],
    },
    {
      section: 'Lesson 2',
      title: 'Profile Optimization',
      description:
        'Bio writing, link strategy, highlights setup, profile photo guidelines',
      outputs: ['"How do people find me..."'],
    },
    {
      section: 'Lesson 3',
      title: 'Content Strategy Basics',
      description:
        'Content pillars, post types that work, posting frequency fundamentals',
      outputs: ['"What should I post..."'],
    },
    {
      section: 'Lesson 4',
      title: 'Your First 30 Days',
      description: 'Simple content calendar, engagement tactics, hashtag basics',
      outputs: ['"...to get followers"'],
    },
    {
      section: 'Lesson 5',
      title: 'Simple Growth Tactics',
      description:
        'Community engagement, collaborations, measuring what works',
      outputs: ['Foundational growth'],
    },
  ],
  deliverables: [
    '5 video lessons (10-15 min each)',
    'PDF templates for each lesson',
    '2-3 weeks creation time, part-time',
    'Private resource library with swipe files',
    'One bonus office-hours call',
    'Lifetime updates as Instagram changes',
  ],
  marketing: {
    marketSize:
      '$1.2B globally in 2024 for small-business social-media education (Statista proxy).',
    marketGap:
      'Beginners want a single, structured starter path — not generic advice scattered across YouTube and TikTok.',
    trends: [
      'Short-form video continues to dominate discovery on Instagram',
      'Small businesses increasingly demand "done-with-you" rather than "done-for-you"',
      'Buyers prefer mini-courses (~$29-49) over high-ticket cohorts',
    ],
    competitors: [
      {
        name: 'Later Academy',
        pricing: 'Free + paid tiers',
        positioning: 'Big-brand authority for scheduling-led content',
      },
      {
        name: 'Jenna Kutcher mini-courses',
        pricing: '$49-99',
        positioning: 'Influencer-led, lifestyle-flavored fundamentals',
      },
    ],
    positioning:
      'The shortest path from "blank profile" to "first 100 customers via Instagram" for a non-marketer small-business owner.',
    channels: [
      'Instagram itself (build-in-public)',
      'Small-business newsletters and Slack groups',
      'Local chamber-of-commerce partnerships',
    ],
    keyMessages: [
      'Advanced Instagram ads or paid promotion strategies',
      'Reels editing or video production techniques',
      'Complex analytics and reporting tools',
      'Influencer outreach or partnership negotiation',
      'E-commerce integration or Instagram Shopping setup',
    ],
    contentIdeas: [
      'Behind-the-scenes building of the course',
      'Live "profile teardowns" as social posts',
      'Founder lessons-learned threads',
    ],
    partnerships: [
      'Local small-business networks',
      'Bookkeeping or web-design freelancers who serve the same ICP',
    ],
    launchSequence: [
      'Tease the course on Instagram for 2 weeks',
      'Open early-bird pricing for 7 days',
      'Public launch with a partner cross-promo',
    ],
  },
  pricing: {
    tiers: [
      {
        name: 'one-time payment',
        price: '$29-49',
        includes: ['All 5 lessons', 'PDF templates', 'Lifetime updates'],
        anchorRationale:
          'Affordable for beginners while signaling structured value over free YouTube content.',
      },
      {
        name: 'with office hours',
        price: '$129',
        includes: ['Everything in base', '1 group office-hours call'],
        anchorRationale:
          'Anchors the entry tier and captures buyers who want a small accountability nudge.',
      },
    ],
    strategy:
      'This price range balances affordability for beginners with the value of structured learning. Mini-courses at this price point typically convert well for audiences starting from scratch.',
  },
}
