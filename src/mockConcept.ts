import type { ConceptLegacy, Demo } from './api'

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

// Sample lesson — demo output that follows /workflow/:id/demo's Demo
// schema. Used by the "Skip to result" button so the lesson page can be
// reviewed without running an actual generation.
export const MOCK_DEMO: Demo = {
  title: 'The 30-Day Test: Filtering Ideas Before You Build',
  sections: [
    {
      heading: 'Why most indie SaaS projects die before launch',
      body: 'Three out of four indie SaaS projects never get a single paying customer. Not because the code didn\'t work — because the founder picked an idea that was too big to ship to their available time, or too vague to know when it was "done."\n\nWhen you\'ve been building for a year and still haven\'t shown it to anyone, the problem is rarely your skills. It\'s the wedge.\n\nA wedge is the smallest version of your idea that someone would still pay for. Not the version with every feature you\'re excited about. The version where, if you stripped one more thing, no one would buy it.\n\nMost ideas fail the wedge test on day one — but you can\'t tell, because you haven\'t asked the right questions yet. That\'s what this lesson fixes.\n\nBy the end of today you\'ll have a wedge candidate written in one sentence, three reasons it might fail, and a clear yes/no on whether it\'s small enough to ship in 30 days. We\'re not building anything yet. Filtering bad wedges takes 60 minutes and saves you 6 months.',
    },
    {
      heading: 'The 30-day test',
      body: 'Run your idea through these four questions. Write the answers in plain text — don\'t open a doc tool, don\'t fancy it up. A notes app or even paper.\n\n1. Who pays? Name a specific person — first name, role, what they do all day. Not "small business owners." Sara, who runs a 4-person dental office and spends Tuesday afternoons fighting with insurance claims.\n\n2. What\'s the trigger? What did Sara just experience that would make her search for your thing? If you can\'t name a trigger, you don\'t have a product, you have a vitamin.\n\n3. What\'s the smallest thing that solves it? If you removed half your planned features, what\'s left? If you removed half of that, what\'s left? Keep cutting until removing one more thing breaks the value.\n\n4. Could you ship that in 30 days, working solo, evenings only? Be honest. If the answer is "maybe with a heroic push" — no. If it\'s "easily" — your wedge might still be too small, and that\'s fine. We can prune it. Too-big wedges kill projects. Too-small ones just feel cringe.',
    },
    {
      heading: 'A worked example',
      body: 'Let\'s run through it with a real idea: "a tool that helps freelancers track their time."\n\nSounds reasonable. Now run the test.\n\nWho pays? "Freelancers" — too vague. Narrow it: Jamal, a freelance UX designer with 4-6 active clients, who\'s been burned twice by undercounting hours when invoicing.\n\nTrigger? Last Friday Jamal sent an invoice and realized he\'d worked 11 more hours than he tracked. He\'s losing $1,200 a month to bad estimates.\n\nSmallest thing? Not yet another timer app. Maybe: a Friday-evening Slack DM that says "You logged 23 hours this week. Based on past weeks, you probably worked 28-32. Want to add the gap before invoicing?" That\'s it. No timer. No dashboard. One nudge.\n\n30 days, solo, evenings only? The Slack bot is doable. The estimation logic (based on past weeks?) needs at least 2 weeks of historical data per user, which means onboarding has to feel useful before that data exists. So either ship without estimation (just the friction-free logging nudge) or pre-fill from the user\'s calendar. Both are smaller than building a full timer app. Both can ship in 30 days.',
    },
    {
      heading: 'Your turn',
      body: 'Pick your idea. Run the four questions on it right now — before this lesson is over. Set a 30-minute timer.\n\nDo not skip Question 1. "Small business owners," "creators," "developers" all fail. You need a name and a Tuesday afternoon.\n\nDo not skip Question 4 either. The honesty question is where most people lie to themselves. "I can totally do it in 30 days" is the same energy as "I\'ll only have one drink."\n\nWhen you finish, you\'ll have one of three results: Pass — congrats, you\'ve got a wedge, and tomorrow\'s lesson is the 5-conversation validation sprint. Too big — narrow it: cut a feature, cut a customer segment, cut the timeline ambition. Too vague — go back to Question 1. The fix is almost always "I can\'t actually name who this is for."\n\nDrop your wedge in the cohort Discord (or your notes app) before you log off.',
    },
  ],
  keyTakeaways: [
    "A wedge is the smallest version someone would still pay for — not a feature-complete v1.",
    "If you can't name a specific person who pays, you don't have a wedge yet.",
    'Triggers, not pain points, are what make people search for the thing.',
    "If 30 days, solo, evenings only feels heroic, your scope is wrong.",
    'Bad wedges kill projects. Filtering takes 60 minutes.',
  ],
  nextPreview:
    "Tomorrow: the 5-conversation validation sprint. You'll talk to 5 people who match your wedge and learn whether the trigger is real — without writing a single line of code.",
  reasoning:
    'Drafted as Lesson 1 of the mini-course; sets up the wedge framework that the rest of the lessons depend on.',
  generatedAt: new Date().toISOString(),
}
