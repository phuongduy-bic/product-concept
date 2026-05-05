// In dev, requests go through the Vite proxy at `/api` (configured in
// vite.config.ts) so the browser stays on the same origin and we don't
// hit CORS / ngrok interstitial issues. In production, set VITE_API_BASE
// to the absolute backend URL (the backend must send CORS headers then).
const BASE =
  (import.meta.env.VITE_API_BASE_OVERRIDE as string | undefined) ??
  (import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api')

export type Creator = {
  name: string
  background: string
  role?: string
  audience?: string
  capacity?: string
  budget?: string
}

export type ConceptTier = {
  name: string
  price: string
  includes: string[]
  anchorRationale: string
}

// Original concept schema (per FRONTEND_INTEGRATION.md).
export type ConceptLegacy = {
  name: string
  tagline: string
  summary: string
  productOutline: Array<{
    section: string
    title: string
    description: string
    outputs: string[]
  }>
  deliverables: string[]
  marketing: {
    marketSize?: string
    competitors?: Array<{
      name: string
      pricing: string
      positioning: string
    }>
    trends?: string[]
    marketGap?: string
    positioning: string
    channels: string[]
    keyMessages: string[]
    contentIdeas: string[]
    partnerships: string[]
    launchSequence: string[]
  }
  pricing: {
    tiers: ConceptTier[]
    strategy: string
  }
}

// Two flat schemas have been observed from the live backend at finalize
// time. We accept both and merge into a single union (`ConceptV2`) at the
// type level — every field is optional so the renderer can show whatever
// the model actually returned without crashing on missing keys.
export type ConceptV2 = {
  name: string
  // ConceptV2-a (FiveFold-style)
  tagline?: string
  description?: string
  target_customer?: string
  value_proposition?: string
  pricing_model?: string
  go_to_market?: string
  // ConceptV2-b (PostPilot-style)
  one_liner?: string
  target_user?: string
  problem?: string
  solution?: string
  core_features?: string[]
  business_model?: string
}

// Union — Page 7 detects which shape it got and renders accordingly.
export type Concept = ConceptLegacy | ConceptV2

export function isConceptV2(c: Concept): c is ConceptV2 {
  // Anything flat that lacks the legacy nested shape is treated as v2.
  // We require both `productOutline` (legacy product structure) and
  // `marketing` (legacy nested marketing object) to be absent — that
  // catches every flat schema variant the backend has returned so far
  // (description+pricing_model, problem+solution, etc.).
  const v = c as Partial<ConceptLegacy>
  const hasLegacyOutline = Array.isArray(v.productOutline)
  const hasLegacyMarketing =
    v.marketing !== null &&
    v.marketing !== undefined &&
    typeof v.marketing === 'object'
  return !hasLegacyOutline && !hasLegacyMarketing
}

export type Research = {
  summary: string
  competitiveDensity: {
    level: 'open' | 'contested' | 'crowded' | 'saturated'
    note: string
  }
  creatorFit: string
  recommendedWedge: string
  pricingBenchmarks: string[]
  nextMoves: string[]
  marketSize: {
    estimate: string
    segment: string
    growth: string
    sources: string[]
  }
  competitors: Array<{
    name: string
    url: string
    pricing: string
    positioning: string
    notes: string
  }>
  trends: Array<{ trend: string; evidence: string; source: string }>
  audienceInsights: string[]
  opportunities: string[]
  risks: string[]
  sources: string[]
  reasoning: string
  generatedAt: string
}

export type Demo = {
  title: string
  sections: Array<{ heading: string; body: string }>
  keyTakeaways: string[]
  nextPreview: string
  reasoning: string
  generatedAt: string
}

export type TurnStatus = 'questioning' | 'complete'

// The deployed backend returns richer question objects than the doc shows
// (string[]), and may omit the `status` field — we derive status from the
// presence of `concept`. The question text field has been observed as
// `question`, `q`, `text`, or `prompt` across different turns. All shapes
// are accepted.
export type ServerQuestion =
  | string
  | {
      id: string
      question?: string
      q?: string
      text?: string
      prompt?: string
      type?: string
      options?: string[]
      placeholder?: string
    }

export type TurnResponse = {
  sessionId: string
  status?: TurnStatus
  reasoning: string
  clarityLevel?: string
  clarity?: string
  // Backend has been observed to use both `questions` and `next_questions`.
  questions?: ServerQuestion[]
  next_questions?: ServerQuestion[]
  concept?: Concept
}

export function getQuestions(turn: TurnResponse): ServerQuestion[] {
  return turn.questions ?? turn.next_questions ?? []
}

export function isComplete(turn: TurnResponse): boolean {
  if (turn.status === 'complete') return true
  if (turn.concept) return true
  return false
}

export function questionId(q: ServerQuestion, idx: number): string {
  if (typeof q === 'string') return `q${idx + 1}`
  return q.id
}

export function questionText(q: ServerQuestion): string {
  if (typeof q === 'string') return q
  return q.question ?? q.q ?? q.text ?? q.prompt ?? ''
}

export type SessionSnapshot = {
  sessionId: string
  idea: string
  creator: Creator
  createdAt: string
  turns: Array<{
    user: unknown
    assistant: unknown
    usage?: unknown
    cost?: number
  }>
  research?: Research
  concept?: Concept
  demo?: Demo
  conceptEditedAt?: string
}

type JsonInit = {
  method?: string
  headers?: Record<string, string>
  body?: unknown
}

async function request<T>(path: string, init?: JsonInit): Promise<T> {
  const { body, headers, method } = init ?? {}
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    let message = res.statusText
    try {
      const err = await res.json()
      if (err?.error) message = err.error
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export function startWorkflow(idea: string, creator: Creator) {
  return request<TurnResponse>('/workflow/start', {
    method: 'POST',
    body: { idea, creator },
  })
}

export function respond(sessionId: string, answers: unknown) {
  return request<TurnResponse>(`/workflow/${sessionId}/respond`, {
    method: 'POST',
    body: { answers },
  })
}

export function research(sessionId: string) {
  return request<{ sessionId: string; research: Research }>(
    `/workflow/${sessionId}/research`,
    { method: 'POST' },
  )
}

export function demo(sessionId: string) {
  return request<{ sessionId: string; demo: Demo }>(
    `/workflow/${sessionId}/demo`,
    { method: 'POST' },
  )
}

export function patchConcept(sessionId: string, concept: Concept) {
  return request<{
    sessionId: string
    concept: Concept
    conceptEditedAt: string
  }>(`/workflow/${sessionId}/concept`, {
    method: 'PATCH',
    body: { concept },
  })
}

export function getSession(sessionId: string) {
  return request<SessionSnapshot>(`/workflow/${sessionId}`)
}

export const CLARITY_LEVELS = ['VAGUE', 'EMERGING', 'CLEAR', 'SHARP'] as const
export type Clarity = (typeof CLARITY_LEVELS)[number]

export function clarityFromReasoning(reasoning = ''): Clarity | null {
  const m = /clarity\s*=\s*(VAGUE|EMERGING|CLEAR|SHARP)/i.exec(reasoning)
  return m ? (m[1].toUpperCase() as Clarity) : null
}

export const HARD_TURN_CAP = 8
