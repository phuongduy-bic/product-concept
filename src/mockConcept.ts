import type { ConceptLegacy, Demo } from './api'

// Static demo concept that mirrors the original repo's Page 7 example —
// used by the "Skip to result" button on the welcome page so the final
// layout can be reviewed without running the full Q&A.
export const MOCK_LEGACY_CONCEPT: ConceptLegacy = {
  name: 'Backend Course 2026: From Zero to Production-Ready APIs',
  tagline:
    'A hands-on bootcamp that takes a junior developer from "I know a language" to shipping reliable backend services in production.',
  summary:
    'Based on your expertise depth and audience level, a structured cohort-based course is the ideal format. It provides enough rigor for serious learners while staying achievable in a focused term, and pairs theory with weekly shippable projects. This format has high perceived value because the modern backend stack changes fast and self-taught developers struggle to know what to learn next in 2026.',
  productOutline: [
    {
      section: 'Module 1',
      title: 'HTTP, REST, and the Request Lifecycle',
      description:
        'How requests actually travel, status codes that matter, idempotency, and designing predictable endpoints',
      outputs: ['"What happens between curl and my handler?"'],
    },
    {
      section: 'Module 2',
      title: 'Databases and Data Modeling',
      description:
        'Relational fundamentals, indexes, transactions, N+1 traps, and when to reach for Postgres vs. key-value stores',
      outputs: ['"Why is my query slow?"'],
    },
    {
      section: 'Module 3',
      title: 'Authentication and Authorization',
      description:
        'Sessions vs. JWTs, OAuth flows, password hashing, RBAC, and the failure modes that cause breaches',
      outputs: ['"How do I keep this secure?"'],
    },
    {
      section: 'Module 4',
      title: 'Background Jobs and Async Work',
      description:
        'Queues, workers, retries, idempotent handlers, and choosing between cron, queues, and event streams',
      outputs: ['"...without blocking the request"'],
    },
    {
      section: 'Module 5',
      title: 'Observability and Shipping to Production',
      description:
        'Structured logs, metrics, tracing, on-call basics, deploys, and the runbook for your first 3 a.m. page',
      outputs: ['Production-ready confidence'],
    },
  ],
  deliverables: [
    '5 module workshops (90 min each, recorded)',
    'Weekly shippable project (build a real API end-to-end)',
    '8-week cohort, ~6 hrs/week part-time',
    'Private GitHub org with reference implementations',
    'Two live code-review sessions with the instructor',
    'Lifetime updates as the stack evolves into 2027',
  ],
  marketing: {
    marketSize:
      '$5.8B globally in 2025 for developer education and bootcamps, with backend-focused programs the fastest-growing segment (HolonIQ proxy).',
    marketGap:
      'Junior devs in 2026 know how to prompt an LLM to write a handler, but cannot debug a slow query or design an idempotent job. Existing courses still teach 2019 patterns.',
    trends: [
      'AI-generated code raises the bar on what "junior" means — depth in fundamentals is now the differentiator',
      'Postgres + a queue + a small service has decisively beaten microservices for early-stage teams',
      'Buyers prefer outcome-based cohorts (~$499-899) over passive video libraries',
    ],
    competitors: [
      {
        name: 'Boot.dev',
        pricing: '$30/month',
        positioning: 'Self-paced gamified backend curriculum, very broad',
      },
      {
        name: 'Educative Backend Path',
        pricing: '$59-99/month',
        positioning: 'Text-based interactive lessons, strong on system design',
      },
    ],
    positioning:
      'The shortest path from "I can write a handler" to "I can run a service in production" for a working junior dev in the AI-assisted coding era.',
    channels: [
      'Developer newsletters (Bytes, TLDR, Pragmatic Engineer)',
      'Hacker News and r/ExperiencedDevs build-in-public posts',
      'Conference workshops and meetup partnerships',
    ],
    keyMessages: [
      'Frontend frameworks, CSS, or UI work',
      'Mobile development or native app concerns',
      'Heavy ML training pipelines or model serving internals',
      'Kubernetes administration or SRE-level infra deep-dives',
      'Language-specific syntax for absolute beginners',
    ],
    contentIdeas: [
      'Live debugging sessions on real slow queries',
      '"What junior devs miss in 2026" thread series',
      'Architecture teardowns of well-known small SaaS backends',
    ],
    partnerships: [
      'Junior-friendly hiring platforms (Otta, Hatchways)',
      'Postgres tooling vendors (Neon, Supabase) for joint workshops',
    ],
    launchSequence: [
      'Pre-launch the curriculum on a personal newsletter for 3 weeks',
      'Open early-bird pricing for 10 days with a cohort cap',
      'Public launch with a partner cross-promo and a free Module 1 sample',
    ],
  },
  pricing: {
    tiers: [
      {
        name: 'self-paced',
        price: '$299-399',
        includes: ['All 5 modules', 'Weekly project briefs', 'Lifetime updates'],
        anchorRationale:
          'Affordable for self-funding juniors while signaling structured value over scattered free tutorials.',
      },
      {
        name: 'cohort with reviews',
        price: '$899',
        includes: [
          'Everything in self-paced',
          'Live cohort sessions',
          'Two 1:1 code reviews with the instructor',
        ],
        anchorRationale:
          'Anchors the entry tier and captures buyers whose employers will reimburse a structured cohort with feedback.',
      },
    ],
    strategy:
      'This price range balances accessibility for self-funding juniors with the value of accountability and feedback. Cohort-based dev courses at this price typically convert well when the curriculum is anchored to shippable outcomes.',
  },
}

// Sample lesson — demo output that follows /workflow/:id/demo's Demo
// schema. Used by the "Skip to result" button so the lesson page can be
// reviewed without running an actual generation.
export const MOCK_DEMO: Demo = {
  title: 'The Request Lifecycle: What Actually Happens Between curl and Your Handler',
  sections: [
    {
      heading: 'Why most junior backend devs ship subtly broken APIs',
      body: 'Three out of four junior backend developers can write a working handler on day one. Far fewer can explain what happens between the client typing a URL and their function running. That gap is where most production bugs live.\n\nWhen your endpoint "works on my machine" but times out in staging, the problem is rarely your business logic. It\'s a layer you never thought about — DNS, a load balancer, a connection pool, a middleware that swallowed the error.\n\nA mental model of the request lifecycle is the smallest version of "backend knowledge" that prevents the most common production incidents. Not the version with every protocol detail. The version where, if you stripped one more layer, you\'d miss the bug.\n\nMost junior devs in 2026 skip this because an LLM will write the handler for them — but the LLM cannot tell you why your p99 latency just doubled. That\'s what this lesson fixes.\n\nBy the end of today you\'ll be able to draw the eight stops a request makes, name the failure mode at each one, and identify which layer is responsible the next time something is slow. We\'re not writing code yet. The mental model takes 60 minutes and saves you years of confused debugging.',
    },
    {
      heading: 'The eight stops of a request',
      body: 'Run any incoming HTTP request through these eight layers. Sketch them on paper — do not open a diagram tool, do not fancy it up.\n\n1. DNS resolution. The client turns api.yourapp.com into an IP. Failure mode: stale cache, expired record, geo-routing mistake.\n\n2. TCP + TLS handshake. The client opens a connection and negotiates encryption. Failure mode: expired certificate, clock skew, slow handshake under load.\n\n3. Load balancer. The request hits your edge — an ALB, a CDN, an Nginx box. Failure mode: timeout misconfigured, sticky sessions wrong, health check too aggressive.\n\n4. Application server. Your runtime accepts the connection from a worker pool. Failure mode: pool exhausted, slow startup, head-of-line blocking on a single thread.\n\n5. Middleware chain. Auth, logging, rate limiting, body parsing run in order. Failure mode: middleware swallows an error, runs on every request when it should be conditional, or mutates state that later middleware depends on.\n\n6. Router and handler. Your function finally runs. Failure mode: this is where you usually look — and usually not where the bug is.\n\n7. Downstream calls. Database, cache, queue, third-party API. Failure mode: N+1 query, missing index, no timeout, no retry budget.\n\n8. Response serialization and return. Bytes go back through the same layers. Failure mode: large payload, missed gzip, leaked internal field.',
    },
    {
      heading: 'A worked example',
      body: 'Let\'s run through it with a real symptom: "GET /orders/:id is slow in production but fast locally."\n\nSounds like a query problem. Now run the eight-stop test before you change anything.\n\nDNS? Same domain hit by your monitoring — fine. TLS? Cert valid, no handshake spike in metrics — fine. Load balancer? p99 timeout is 30s, you\'re returning in 4s, so not a timeout. But the LB metric shows 80% of requests are queueing for >2s before reaching your app.\n\nApplication server? Worker pool size is 4. Your service takes 3s per /orders/:id call. Math: 4 workers × 3s = ~1.3 RPS sustained before queueing. Production traffic is 5 RPS. Found it.\n\nNow look at why one call takes 3s. Middleware? Auth middleware is fetching the user from the database on every request — no cache. Handler? Runs a single query. Downstream? That single query joins five tables and the orders table grew past the index that covered it.\n\nFix order: add the index (1 minute, biggest win), cache the auth lookup (1 hour, second biggest win), then think about pool size. The naive fix — bumping the worker pool — would hide the real problems and burn money.\n\nThe lesson: the bug was in three layers, not one. Without the eight-stop model you would have rewritten the handler, blamed the ORM, and shipped nothing useful.',
    },
    {
      heading: 'Your turn',
      body: 'Pick an endpoint in your current project. Walk it through all eight stops right now — before this lesson is over. Set a 30-minute timer.\n\nDo not skip Stop 5. Middleware is where junior devs lose the most time, because they never wrote it and assume it is correct.\n\nDo not skip Stop 7 either. "It\'s just a query" is the same energy as "it\'s just a small change." Every downstream call needs a timeout, a retry policy, and an answer to "what happens if this is slow?"\n\nWhen you finish, you\'ll have one of three results: Confident — you can name the failure mode at every stop, and tomorrow\'s lesson on idempotency will land. Gaps — write down the stops where you said "I don\'t know" and we\'ll cover them in office hours. Lost — go back to Stop 1 and use the worked example as a template.\n\nDrop your sketch in the cohort Discord (or commit it to your notes repo) before you log off.',
    },
  ],
  keyTakeaways: [
    'A request passes through eight layers — bugs live between them, not inside your handler.',
    'If you cannot name the failure mode at each stop, you cannot debug production.',
    'Worker pool math (RPS × latency vs. pool size) explains most "slow in prod, fast locally" mysteries.',
    'Every downstream call needs a timeout and an answer to "what if this is slow?" — no exceptions.',
    'The eight-stop model takes 60 minutes to learn and prevents years of misdirected fixes.',
  ],
  nextPreview:
    'Tomorrow: idempotency and retries. You will learn why "just retry the request" is a foot-gun and how to design handlers that survive being called twice — without writing a single line of business logic.',
  reasoning:
    'Drafted as Module 1, Lesson 1 of the cohort; sets up the request-lifecycle mental model that every later module (databases, auth, jobs, observability) reaches back to.',
  generatedAt: new Date().toISOString(),
}
