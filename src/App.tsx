import { useEffect, useState } from 'react'
import {
  HARD_TURN_CAP,
  clarityFromReasoning,
  getQuestions,
  isComplete,
  isConceptV2,
  patchConcept,
  questionId,
  questionText,
  respond,
  startWorkflow,
  type Clarity,
  type Concept,
  type ConceptLegacy,
  type ConceptV2,
  type TurnResponse,
} from './api'
import { MOCK_LEGACY_CONCEPT } from './mockConcept'
import './App.css'

const PROCESSING_MESSAGES = [
  'Reading your idea...',
  'Spotting what is still unclear...',
  'Drafting clarifying questions...',
  'Almost ready — bringing the questions to you...',
]

function App() {
  const [page, setPage] = useState(1)

  const [expertise, setExpertise] = useState('Instagram growth for small businesses')
  const [contentLink, setContentLink] = useState('')

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [concept, setConcept] = useState<Concept | null>(null)
  const [error, setError] = useState<string | null>(null)

  function navigateToPage(n: number) {
    setPage(n)
    window.scrollTo(0, 0)
  }

  function skipToResult() {
    setSessionId('demo-session')
    setConcept(MOCK_LEGACY_CONCEPT)
    navigateToPage(7)
  }

  return (
    <>
      {page === 1 && (
        <Page1
          onStart={() => navigateToPage(2)}
          onSkipToResult={skipToResult}
        />
      )}

      {page === 2 && (
        <Page2
          expertise={expertise}
          setExpertise={setExpertise}
          contentLink={contentLink}
          setContentLink={setContentLink}
          onBack={() => navigateToPage(1)}
          onNext={() => navigateToPage(6)}
        />
      )}

      {page === 6 && (
        <Page6Workflow
          expertise={expertise}
          contentLink={contentLink}
          onComplete={(sid, c) => {
            setSessionId(sid)
            setConcept(c)
            navigateToPage(7)
          }}
          onAbort={(msg) => {
            if (msg) setError(msg)
            navigateToPage(2)
          }}
        />
      )}

      {page === 7 && concept && sessionId && (
        <Page7
          sessionId={sessionId}
          concept={concept}
          onConceptChange={setConcept}
          onSeeFullCourse={() => navigateToPage(8)}
        />
      )}

      {page === 8 && (
        <Page8FullCourse onBack={() => navigateToPage(7)} />
      )}

      {page !== 6 && error && (
        <div style={{ maxWidth: 768, margin: '0 auto', padding: '0 20px' }}>
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss">
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/* ===== Page 1: Welcome ===== */
function Page1({
  onStart,
  onSkipToResult,
}: {
  onStart: () => void
  onSkipToResult: () => void
}) {
  return (
    <section className="page">
      <div className="page-container">
        <div className="content-card">
          <div className="text-center">
            <h1 className="heading-1 mb-4">
              Turn your expertise into a product plan
            </h1>
            <p className="paragraph-lg mb-8">
              Answer a few questions. Get a product concept you can build today.
            </p>

            <div
              className="flex items-center justify-center gap-2 mb-8"
              style={{ color: '#64748b' }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33334 8 1.33334C4.3181 1.33334 1.33334 4.3181 1.33334 8C1.33334 11.6819 4.3181 14.6667 8 14.6667Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 4V8L10.6667 9.33333"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="paragraph-small text-slate-600">~5 minutes</span>
            </div>

            <div
              className="flex items-center justify-center gap-3"
              style={{ flexWrap: 'wrap' }}
            >
              <button onClick={onStart} className="btn-primary">
                Start
              </button>
              <button
                onClick={onSkipToResult}
                className="btn-ghost"
                title="Skip the Q&A and jump straight to a sample product concept document"
              >
                Skip to result demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===== Page 2: Expertise ===== */
function Page2({
  expertise,
  setExpertise,
  contentLink,
  setContentLink,
  onBack,
  onNext,
}: {
  expertise: string
  setExpertise: (v: string) => void
  contentLink: string
  setContentLink: (v: string) => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <section className="page">
      <div className="page-container">
        <div className="content-card">
          <h2 className="heading-2 mb-6">What do you help people with?</h2>

          <div className="form-field mb-6">
            <input
              type="text"
              className="text-input"
              placeholder="e.g., Instagram growth for small businesses"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
            />
          </div>

          <div className="form-field mb-8">
            <label className="paragraph-small-semibold mb-2 block text-slate-700">
              Paste a link to your most popular content (optional)
            </label>
            <input
              type="url"
              className="text-input"
              placeholder="https://youtube.com/..."
              value={contentLink}
              onChange={(e) => setContentLink(e.target.value)}
            />
          </div>

          <div className="button-group">
            <button onClick={onBack} className="btn-ghost">
              Back
            </button>
            <button
              onClick={onNext}
              className="btn-primary"
              disabled={!expertise.trim()}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===== Page 6 workflow: spinner during /start + /respond, real Q&A in between =====
   Per the doc:
     "Each turn from the model returns status: questioning | complete.
      Keep calling /respond while status === questioning."
   So we never auto-answer — when the server is still questioning, we render
   the questions to the user and wait for them to submit. */

function Page6Workflow({
  expertise,
  contentLink,
  onComplete,
  onAbort,
}: {
  expertise: string
  contentLink: string
  onComplete: (sessionId: string, concept: Concept) => void
  onAbort: (msg: string | null) => void
}) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [turn, setTurn] = useState<TurnResponse | null>(null)
  const [turnCount, setTurnCount] = useState(0)
  const [busy, setBusy] = useState(true)
  const [busyMessage, setBusyMessage] = useState(PROCESSING_MESSAGES[0])
  const [busyStep, setBusyStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Kick off the session once on mount.
  useEffect(() => {
    let cancelled = false
    const tick = setInterval(() => {
      setBusyStep((s) => {
        const next = Math.min(s + 1, PROCESSING_MESSAGES.length - 1)
        setBusyMessage(PROCESSING_MESSAGES[next])
        return next
      })
    }, 1500)

    async function run() {
      try {
        const ideaParts: string[] = [
          `I help people with: ${expertise.trim()}.`,
        ]
        if (contentLink.trim()) {
          ideaParts.push(`Reference content: ${contentLink.trim()}.`)
        }
        const idea = ideaParts.join(' ')

        const creator = {
          name: 'Creator',
          background: expertise.trim(),
        }

        const first = await startWorkflow(idea, creator)
        if (cancelled) return
        clearInterval(tick)
        setSessionId(first.sessionId)
        setTurnCount(1)
        setTurn(first)
        setBusy(false)

        if (isComplete(first) && first.concept) {
          onComplete(first.sessionId, first.concept)
        }
      } catch (err) {
        clearInterval(tick)
        if (!cancelled)
          setError((err as Error).message || 'Failed to start session')
        setBusy(false)
      }
    }

    run()

    return () => {
      cancelled = true
      clearInterval(tick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submitAnswers(answers: Record<string, string>) {
    if (!sessionId || busy) return
    setBusy(true)
    setBusyMessage('Sending your answers…')
    setError(null)
    try {
      const next = await respond(sessionId, answers)
      const newTurnCount = turnCount + 1
      setTurn(next)
      setTurnCount(newTurnCount)
      if (isComplete(next) && next.concept) {
        setBusyMessage('Building your product concept...')
        onComplete(sessionId, next.concept)
        return
      }
      // If the server forced complete on turn 8 but no concept came back,
      // surface that explicitly per doc gotcha.
      if (newTurnCount >= HARD_TURN_CAP && !next.concept) {
        setError(
          `Reached the ${HARD_TURN_CAP}-turn limit but the server did not return a concept. Try starting over.`,
        )
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  // While starting the session, show the original processing screen.
  if (busy && !turn) {
    const progress = ((busyStep + 1) / PROCESSING_MESSAGES.length) * 100
    return (
      <section className="page">
        <div className="page-container">
          <div className="content-card text-center">
            <div className="loading-spinner mb-6" />
            <div
              className="paragraph-lg-semibold mb-4"
              style={{ color: '#334155' }}
            >
              {busyMessage}
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="paragraph-small text-slate-600">
              This usually takes 5–20 seconds.
            </p>
            {error && (
              <div className="error-banner" style={{ marginTop: 16 }}>
                <span>{error}</span>
                <button onClick={() => onAbort(null)} aria-label="Back">
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  if (!turn) return null

  // Otherwise we have a turn — either show its questions, or (briefly) the
  // spinner overlay while we wait for the next /respond round-trip.
  // The `key` resets per-turn answer state without an effect.
  return (
    <QuestionsView
      key={turnCount}
      turn={turn}
      turnCount={turnCount}
      busy={busy}
      busyMessage={busyMessage}
      error={error}
      onDismissError={() => setError(null)}
      onSubmit={submitAnswers}
      onStartOver={() => onAbort(null)}
    />
  )
}

/* ===== Q&A view rendered between turns ===== */
function QuestionsView({
  turn,
  turnCount,
  busy,
  busyMessage,
  error,
  onDismissError,
  onSubmit,
  onStartOver,
}: {
  turn: TurnResponse
  turnCount: number
  busy: boolean
  busyMessage: string
  error: string | null
  onDismissError: () => void
  onSubmit: (answers: Record<string, string>) => void
  onStartOver: () => void
}) {
  const qs = getQuestions(turn)
  // Per-turn state is reset by remounting (parent passes key={turnCount}),
  // so we don't need an effect to clear it here.
  const [answers, setAnswers] = useState<Record<string, string>>({})

  function update(id: string, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }))
  }

  const allAnswered = qs.every((q, idx) => {
    const id = questionId(q, idx)
    return (answers[id] ?? '').trim().length > 0
  })

  const fromReasoning = clarityFromReasoning(turn.reasoning ?? '')
  const fromField = (turn.clarityLevel ?? turn.clarity ?? '').toUpperCase()
  const clarity: Clarity | null =
    fromReasoning ?? ((fromField || null) as Clarity | null)
  const isLastTurn = turnCount >= HARD_TURN_CAP - 1

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allAnswered || busy) return
    onSubmit(answers)
  }

  return (
    <section className="page">
      <div className="page-container">
        <div className="content-card">
          <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: 12 }}>
            <span className="step-indicator">
              Turn {turnCount} of {HARD_TURN_CAP}
              {isLastTurn && ' · last turn before finalize'}
            </span>
            {clarity && <ClarityBar clarity={clarity as Clarity} />}
          </div>

          <h2 className="heading-2 mb-3">A few questions to sharpen this</h2>
          {turn.reasoning && (
            <p
              className="paragraph-small text-slate-600 mb-6"
              style={{
                background: 'var(--color-brand-subtle)',
                padding: 12,
                borderRadius: 6,
                borderLeft: '3px solid var(--color-brand-border)',
              }}
            >
              {turn.reasoning}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 mb-8">
              {qs.map((q, idx) => {
                const id = questionId(q, idx)
                const text = questionText(q)
                const opts =
                  typeof q === 'string' ? undefined : q.options
                const placeholder =
                  typeof q === 'string' ? '' : q.placeholder ?? ''
                const value = answers[id] ?? ''

                return (
                  <div className="form-field" key={id}>
                    <label className="paragraph-small-semibold mb-2 block text-slate-700">
                      {idx + 1}. {text}
                    </label>
                    {opts && opts.length > 0 ? (
                      <div className="space-y-4">
                        {opts.map((opt) => (
                          <label
                            key={opt}
                            className={`selectable-card${value === opt ? ' selected' : ''}`}
                            style={{ display: 'block', cursor: 'pointer' }}
                          >
                            <input
                              type="radio"
                              name={id}
                              value={opt}
                              checked={value === opt}
                              onChange={() => update(id, opt)}
                              style={{ marginRight: 8 }}
                              disabled={busy}
                            />
                            <span className="paragraph">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        className="text-input"
                        style={{ height: 'auto', minHeight: 80 }}
                        placeholder={placeholder || 'Your answer…'}
                        value={value}
                        onChange={(e) => update(id, e.target.value)}
                        disabled={busy}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {error && (
              <div className="error-banner" style={{ marginBottom: 16 }}>
                <span>{error}</span>
                <button
                  type="button"
                  onClick={onDismissError}
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>
            )}

            <div className="button-group">
              <button
                type="button"
                className="btn-ghost"
                onClick={onStartOver}
                disabled={busy}
              >
                Start over
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={busy || !allAnswered}
              >
                {busy
                  ? busyMessage || 'Thinking…'
                  : isLastTurn
                    ? 'Finalize concept'
                    : 'Submit answers'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

function ClarityBar({ clarity }: { clarity: Clarity }) {
  const levels: Clarity[] = ['VAGUE', 'EMERGING', 'CLEAR', 'SHARP']
  const idx = levels.indexOf(clarity)
  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        alignItems: 'center',
        flex: '1 1 auto',
        minWidth: 200,
      }}
    >
      {levels.map((lvl, i) => (
        <div
          key={lvl}
          title={lvl}
          style={{
            flex: 1,
            height: 24,
            borderRadius: 4,
            background:
              i <= idx
                ? 'var(--color-brand-border)'
                : 'var(--color-secondary)',
            color: i <= idx ? 'white' : 'var(--color-muted-foreground)',
            fontSize: 10,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            letterSpacing: 0.4,
          }}
        >
          {lvl}
        </div>
      ))}
    </div>
  )
}

/* ===== Page 7: Concept document — renders real concept + manual/AI edit ===== */
type ConceptUiMode = 'default' | 'ai'

function Page7({
  sessionId,
  concept,
  onConceptChange,
  onSeeFullCourse,
}: {
  sessionId: string
  concept: Concept
  onConceptChange: (c: Concept) => void
  onSeeFullCourse: () => void
}) {
  if (isConceptV2(concept)) {
    return (
      <Page7V2
        sessionId={sessionId}
        concept={concept}
        onConceptChange={(c: ConceptV2) => onConceptChange(c as Concept)}
        onSeeFullCourse={onSeeFullCourse}
      />
    )
  }

  return (
    <Page7Legacy
      sessionId={sessionId}
      concept={concept as ConceptLegacy}
      onConceptChange={(c: ConceptLegacy) => onConceptChange(c as Concept)}
      onSeeFullCourse={onSeeFullCourse}
    />
  )
}

/* ===== Page 7 (v2 schema): mirrors the original repo's 7-section layout
   but mapped onto the flat ConceptV2 shape returned by the live backend. ===== */

type V2EditableKey = Exclude<keyof ConceptV2, 'core_features'>

function extractFirstPrice(text: string): string | null {
  const m = /\$\s?\d[\d,]*(?:\s?[-–]\s?\$?\s?\d[\d,]*)?/.exec(text)
  return m ? m[0].replace(/\s+/g, '') : null
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/g)
    .map((s) => s.trim())
    .filter(Boolean)
}

function Page7V2({
  sessionId,
  concept,
  onConceptChange,
  onSeeFullCourse,
}: {
  sessionId: string
  concept: ConceptV2
  onConceptChange: (c: ConceptV2) => void
  onSeeFullCourse: () => void
}) {
  const [mode, setMode] = useState<ConceptUiMode>('default')
  const [editingField, setEditingField] = useState<V2EditableKey | null>(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEdit(field: V2EditableKey) {
    setEditingField(field)
    setDraft(((concept[field] as string | undefined) ?? '').toString())
  }
  function cancelEdit() {
    setEditingField(null)
    setDraft('')
  }

  async function save() {
    if (!editingField) return
    setSaving(true)
    setError(null)
    try {
      const next: ConceptV2 = { ...concept, [editingField]: draft }
      const r = await patchConcept(sessionId, next as Concept)
      onConceptChange(r.concept as unknown as ConceptV2)
      cancelEdit()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  // Pricing hero — pull a price from whichever pricing-ish field is present.
  const pricingText = concept.pricing_model ?? concept.business_model ?? ''
  const priceHero = pricingText ? extractFirstPrice(pricingText) : null

  // Lead text for the recommended-card paragraph: prefer description,
  // fall back to one_liner, then solution.
  const leadField: V2EditableKey =
    concept.description != null
      ? 'description'
      : concept.one_liner != null
        ? 'one_liner'
        : 'solution'
  const leadText =
    concept.description ?? concept.one_liner ?? concept.solution ?? ''

  // Target field — prefer target_customer, fall back to target_user.
  const targetField: V2EditableKey =
    concept.target_customer != null ? 'target_customer' : 'target_user'
  const targetText = concept.target_customer ?? concept.target_user ?? ''

  // Value field — prefer value_proposition, fall back to solution.
  const valueField: V2EditableKey =
    concept.value_proposition != null ? 'value_proposition' : 'solution'
  const valueText = concept.value_proposition ?? concept.solution ?? ''

  const goToMarketBullets = concept.go_to_market
    ? splitSentences(concept.go_to_market)
    : []

  function sectionProps(field: V2EditableKey) {
    return {
      editing: editingField === field,
      onEdit: () => startEdit(field),
    }
  }

  function renderEditOverlay(field: V2EditableKey, multiline: boolean) {
    if (editingField !== field) return null
    return (
      <div className="edit-overlay">
        {multiline ? (
          <textarea
            className="text-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        ) : (
          <input
            className="text-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        )}
        <div className="edit-actions">
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            className="btn-ghost"
            onClick={cancelEdit}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <section className="page">
      <div className="page-container-full">
        <div className="content-card-wide">
          <div className="mb-8 pb-6 border-b">
            <h1 className="heading-2">Your Product Concept</h1>
          </div>

          <div className="space-y-6">
            {/* A: Recommended (name + lead text) */}
            <ConceptSectionWrap field="name" {...sectionProps('name')}>
              <div className="flex items-start gap-3 mb-4">
                <span className="badge-teal">Recommended</span>
                <h3 className="heading-3">{concept.name}</h3>
              </div>
              {leadText && <p className="paragraph">{leadText}</p>}
              {renderEditOverlay('name', false)}
              {renderEditOverlay(leadField, true)}
            </ConceptSectionWrap>

            {/* B: Tagline / one-liner */}
            {(concept.tagline || concept.one_liner) && (
              <ConceptSectionWrap
                field="tagline"
                {...sectionProps(concept.tagline ? 'tagline' : 'one_liner')}
              >
                <h3 className="heading-4 mb-3">
                  {concept.tagline ? 'Tagline' : 'One-liner'}
                </h3>
                <p
                  className="paragraph-lg-semibold text-teal-700"
                  style={{ fontStyle: 'italic' }}
                >
                  "{concept.tagline ?? concept.one_liner}"
                </p>
                {renderEditOverlay(
                  concept.tagline ? 'tagline' : 'one_liner',
                  concept.tagline ? false : true,
                )}
              </ConceptSectionWrap>
            )}

            {/* C: Problem */}
            {concept.problem && (
              <ConceptSectionWrap
                field="problem"
                {...sectionProps('problem')}
              >
                <h3 className="heading-4 mb-3">The Problem</h3>
                <p className="paragraph">{concept.problem}</p>
                {renderEditOverlay('problem', true)}
              </ConceptSectionWrap>
            )}

            {/* D: Target user / customer */}
            {targetText && (
              <ConceptSectionWrap
                field="target"
                {...sectionProps(targetField)}
              >
                <h3 className="heading-4 mb-3">
                  {concept.target_customer ? 'Target Customer' : 'Target User'}
                </h3>
                <p className="paragraph">{targetText}</p>
                {renderEditOverlay(targetField, true)}
              </ConceptSectionWrap>
            )}

            {/* E: Value proposition / solution */}
            {valueText && valueText !== leadText && (
              <ConceptSectionWrap
                field="value"
                {...sectionProps(valueField)}
              >
                <h3 className="heading-4 mb-3">
                  {concept.value_proposition ? 'Value Proposition' : 'Solution'}
                </h3>
                <p className="paragraph">{valueText}</p>
                {renderEditOverlay(valueField, true)}
              </ConceptSectionWrap>
            )}

            {/* F: Core features (list) */}
            {Array.isArray(concept.core_features) &&
              concept.core_features.length > 0 && (
                <ConceptSectionWrap field="core_features">
                  <h3 className="heading-4 mb-4">Core Features</h3>
                  <ul className="boundary-list">
                    {concept.core_features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </ConceptSectionWrap>
              )}

            {/* G: Pricing / business model */}
            {pricingText && (
              <ConceptSectionWrap
                field="pricing"
                {...sectionProps(
                  concept.pricing_model ? 'pricing_model' : 'business_model',
                )}
              >
                <h3 className="heading-4 mb-3">
                  {concept.pricing_model ? 'Pricing' : 'Business Model'}
                </h3>
                {priceHero && (
                  <div
                    className="flex items-baseline gap-2 mb-3"
                    style={{ flexWrap: 'wrap' }}
                  >
                    <span
                      style={{
                        fontSize: 36,
                        fontWeight: 600,
                        color: '#0f766e',
                      }}
                    >
                      {priceHero}
                    </span>
                    <span className="paragraph text-slate-600">starting</span>
                  </div>
                )}
                <p className="paragraph text-slate-600">{pricingText}</p>
                {renderEditOverlay(
                  concept.pricing_model ? 'pricing_model' : 'business_model',
                  true,
                )}
              </ConceptSectionWrap>
            )}

            {/* G2: Lesson demo video — own full-width row */}
            <LessonSampleBlock />

            {/* H: Go-to-Market */}
            {concept.go_to_market && (
              <ConceptSectionWrap
                field="go_to_market"
                {...sectionProps('go_to_market')}
              >
                <h3 className="heading-4 mb-4">Go-to-Market</h3>
                {goToMarketBullets.length >= 2 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {goToMarketBullets.slice(0, 6).map((s, i) => (
                      <div key={i} className="deliverable-card">
                        <div className="paragraph-small-semibold text-slate-700 mb-1">
                          Move {i + 1}
                        </div>
                        <div className="paragraph">{s}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="paragraph">{concept.go_to_market}</p>
                )}
                {renderEditOverlay('go_to_market', true)}
              </ConceptSectionWrap>
            )}
          </div>

          {/* Actions */}
          <div className="actions-area">
            {mode === 'default' && (
              <div className="actions-group">
                <button
                  className="btn-ghost"
                  onClick={() => setMode('ai')}
                >
                  Edit by AI
                </button>
                <button
                  className="btn-secondary"
                  onClick={() =>
                    alert(
                      'This would start the validation workflow (POST /workflow/:id/demo).',
                    )
                  }
                >
                  Validate this concept
                </button>
                <button
                  className="btn-primary"
                  style={{ gap: 6 }}
                  onClick={onSeeFullCourse}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  See full course
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError(null)} aria-label="Dismiss">
                ×
              </button>
            </div>
          )}

          {mode === 'ai' && (
            <AIChatPanel onClose={() => setMode('default')} />
          )}

        </div>
      </div>
    </section>
  )
}

function Page7Legacy({
  sessionId,
  concept,
  onConceptChange,
  onSeeFullCourse,
}: {
  sessionId: string
  concept: ConceptLegacy
  onConceptChange: (c: ConceptLegacy) => void
  onSeeFullCourse: () => void
}) {
  const [mode, setMode] = useState<ConceptUiMode>('default')
  const [editingField, setEditingField] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEditField(field: string, currentText: string) {
    setEditingField(field)
    setDraft(currentText)
  }

  function cancelEditField() {
    setEditingField(null)
    setDraft('')
  }

  async function saveEditField() {
    if (!editingField) return
    setSaving(true)
    setError(null)
    try {
      const next: ConceptLegacy = JSON.parse(JSON.stringify(concept))
      switch (editingField) {
        case 'format':
          next.summary = draft
          break
        case 'title':
          next.name = draft
          break
        case 'tagline':
          next.tagline = draft
          break
        case 'positioning':
          next.marketing.positioning = draft
          break
        case 'pricing':
          next.pricing.strategy = draft
          break
      }
      const r = await patchConcept(sessionId, next as Concept)
      onConceptChange(r.concept as ConceptLegacy)
      cancelEditField()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page">
      <div className="page-container-full">
        <div className="content-card-wide">
          <div className="mb-8 pb-6 border-b">
            <h1 className="heading-2">Your Product Concept</h1>
          </div>

          <div className="space-y-6">
            {/* B: Suggested Title */}
            <ConceptSectionWrap
              field="title"
              editing={editingField === 'title'}
              onEdit={() => startEditField('title', concept.name)}
            >
              <h3 className="heading-4 mb-3">Suggested Product Title</h3>
              <p className="paragraph-lg-semibold text-teal-700">
                {concept.name}
              </p>
              {concept.tagline && (
                <p
                  className="paragraph text-slate-600"
                  style={{ marginTop: 8, fontStyle: 'italic' }}
                >
                  {concept.tagline}
                </p>
              )}
              {editingField === 'title' && (
                <EditOverlay
                  draft={draft}
                  setDraft={setDraft}
                  saving={saving}
                  onSave={saveEditField}
                  onCancel={cancelEditField}
                />
              )}
            </ConceptSectionWrap>

            {/* C: What's Included — product outline as table */}
            <ConceptSectionWrap field="included">
              <h3 className="heading-4 mb-4">What's Included</h3>
              <div className="overflow-x-auto">
                <table className="concept-table">
                  <thead>
                    <tr>
                      <th>Section</th>
                      <th>What It Covers</th>
                      <th>Outputs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {concept.productOutline.map((p, i) => (
                      <tr key={i}>
                        <td className="paragraph-small-semibold">
                          {p.section}: {p.title}
                        </td>
                        <td className="paragraph-small">{p.description}</td>
                        <td className="paragraph-small text-slate-600">
                          {p.outputs.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ConceptSectionWrap>

            {/* C2: Market context — marketSize / trends / competitors / marketGap */}
            {(concept.marketing.marketSize ||
              concept.marketing.marketGap ||
              (concept.marketing.trends &&
                concept.marketing.trends.length > 0) ||
              (concept.marketing.competitors &&
                concept.marketing.competitors.length > 0)) && (
              <ConceptSectionWrap field="market">
                <h3 className="heading-4 mb-4">Market context</h3>

                {concept.marketing.marketSize && (
                  <div className="mb-4">
                    <div className="paragraph-small-semibold text-slate-700 mb-1">
                      Market size
                    </div>
                    <p className="paragraph">
                      {concept.marketing.marketSize}
                    </p>
                  </div>
                )}

                {concept.marketing.marketGap && (
                  <div className="mb-4">
                    <div className="paragraph-small-semibold text-slate-700 mb-1">
                      The gap
                    </div>
                    <p className="paragraph">
                      {concept.marketing.marketGap}
                    </p>
                  </div>
                )}

                {concept.marketing.trends &&
                  concept.marketing.trends.length > 0 && (
                    <div className="mb-4">
                      <div className="paragraph-small-semibold text-slate-700 mb-1">
                        Trends
                      </div>
                      <ul className="boundary-list">
                        {concept.marketing.trends.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {concept.marketing.competitors &&
                  concept.marketing.competitors.length > 0 && (
                    <div>
                      <div className="paragraph-small-semibold text-slate-700 mb-2">
                        Competitors
                      </div>
                      <div className="overflow-x-auto">
                        <table className="concept-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Pricing</th>
                              <th>Positioning</th>
                            </tr>
                          </thead>
                          <tbody>
                            {concept.marketing.competitors.map((c, i) => (
                              <tr key={i}>
                                <td className="paragraph-small-semibold">
                                  {c.name}
                                </td>
                                <td className="paragraph-small">
                                  {c.pricing}
                                </td>
                                <td className="paragraph-small text-slate-600">
                                  {c.positioning}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </ConceptSectionWrap>
            )}

            {/* D: Positioning & messaging */}
            {concept.marketing?.keyMessages?.length > 0 && (
              <ConceptSectionWrap field="positioning">
                <h3 className="heading-4 mb-3">Positioning &amp; Messaging</h3>
                <p className="paragraph mb-3">
                  {concept.marketing.positioning}
                </p>
                <ul className="boundary-list">
                  {concept.marketing.keyMessages.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </ConceptSectionWrap>
            )}

            {/* E: The Deliverable */}
            <ConceptSectionWrap field="deliverable">
              <h3 className="heading-4 mb-4">The Deliverable</h3>
              <div className="grid grid-cols-3 gap-4">
                {concept.deliverables.slice(0, 6).map((d, i) => (
                  <div key={i} className="deliverable-card">
                    <div className="paragraph-small-semibold text-slate-700 mb-1">
                      Item {i + 1}
                    </div>
                    <div className="paragraph">{d}</div>
                  </div>
                ))}
              </div>
            </ConceptSectionWrap>

            {/* F: Suggested Price Range */}
            <ConceptSectionWrap
              field="pricing"
              editing={editingField === 'pricing'}
              onEdit={() => startEditField('pricing', concept.pricing.strategy)}
            >
              <h3 className="heading-4 mb-3">Suggested Price Range</h3>
              {concept.pricing.tiers.length > 0 && (
                <div
                  className="flex items-baseline gap-2 mb-3"
                  style={{ flexWrap: 'wrap' }}
                >
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: 600,
                      color: '#0f766e',
                    }}
                  >
                    {concept.pricing.tiers[0].price}
                  </span>
                  <span className="paragraph text-slate-600">
                    {concept.pricing.tiers[0].name}
                  </span>
                </div>
              )}
              <p className="paragraph text-slate-600">
                {concept.pricing.strategy}
              </p>
              {concept.pricing.tiers.length > 1 && (
                <ul
                  className="boundary-list"
                  style={{ marginTop: 12 }}
                >
                  {concept.pricing.tiers.slice(1).map((t, i) => (
                    <li key={i}>
                      <strong>{t.name}</strong> — {t.price}: {t.includes.join(', ')}
                    </li>
                  ))}
                </ul>
              )}
              {editingField === 'pricing' && (
                <EditOverlay
                  draft={draft}
                  setDraft={setDraft}
                  saving={saving}
                  onSave={saveEditField}
                  onCancel={cancelEditField}
                />
              )}
            </ConceptSectionWrap>

            {/* F2: Lesson demo video — own full-width row */}
            <LessonSampleBlock />
          </div>

          {/* Actions area */}
          <div className="actions-area">
            {mode === 'default' && (
              <div className="actions-group">
                <button
                  className="btn-ghost"
                  onClick={() => setMode('ai')}
                >
                  Edit by AI
                </button>
                <button
                  className="btn-secondary"
                  onClick={() =>
                    alert(
                      'This would start the validation workflow (POST /workflow/:id/demo).',
                    )
                  }
                >
                  Validate this concept
                </button>
                <button
                  className="btn-primary"
                  style={{ gap: 6 }}
                  onClick={onSeeFullCourse}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  See full course
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError(null)} aria-label="Dismiss">
                ×
              </button>
            </div>
          )}

          {mode === 'ai' && (
            <AIChatPanel onClose={() => setMode('default')} />
          )}

        </div>
      </div>
    </section>
  )
}

function ConceptSectionWrap({
  field,
  editing = false,
  onEdit,
  children,
}: {
  field: string
  editing?: boolean
  onEdit?: () => void
  children: React.ReactNode
}) {
  const cls = ['concept-section', editing ? 'editing' : '']
    .filter(Boolean)
    .join(' ')
  return (
    <div className={cls} data-field={field}>
      {onEdit && !editing && (
        <button
          type="button"
          className="section-edit-btn"
          onClick={onEdit}
          aria-label="Edit section"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
          Edit
        </button>
      )}
      {children}
    </div>
  )
}

function EditOverlay({
  draft,
  setDraft,
  saving,
  onSave,
  onCancel,
}: {
  draft: string
  setDraft: (v: string) => void
  saving: boolean
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="edit-overlay" onClick={(e) => e.stopPropagation()}>
      <textarea
        className="text-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <div className="edit-actions">
        <button
          className="btn-primary"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          className="btn-ghost"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

/* ===== Lesson demo: video player + AI-generation prompt + paywall ===== */
const LESSON_VIDEO_SRC = '/backend_video.mp4'

function LessonSampleBlock() {
  const [editing, setEditing] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [showPaywall, setShowPaywall] = useState(false)

  return (
    <>
      <aside className="lesson-card" aria-label="Lesson demo video">
        <div className="lesson-header">
          <span className="lesson-title">Lesson 1 — Demo</span>
          <span className="lesson-badge">sample</span>
        </div>

        <div className="lesson-video-frame">
          {LESSON_VIDEO_SRC ? (
            <video
              className="lesson-video"
              src={LESSON_VIDEO_SRC}
              controls
              preload="metadata"
            />
          ) : (
            <div className="lesson-video-placeholder">
              <svg
                width="44"
                height="44"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <circle
                  cx="12"
                  cy="12"
                  r="11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M10 8.5v7l6-3.5-6-3.5z"
                  fill="currentColor"
                />
              </svg>
              <span>Video demo</span>
            </div>
          )}
        </div>

        {editing && (
          <div className="lesson-edit-area">
            <label className="lesson-edit-label">
              AI video maker prompt
            </label>
            <textarea
              className="lesson-edit-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what the AI should generate for this lesson video…"
            />
            <div className="lesson-edit-actions">
              <button
                className="btn-ghost-dark"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => setShowPaywall(true)}
              >
                Save video content
              </button>
            </div>
          </div>
        )}

        {!editing && (
          <div className="lesson-actions">
            <button
              className="btn-ghost-dark"
              onClick={() => setEditing(true)}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
              Edit
            </button>
          </div>
        )}
      </aside>

      {showPaywall && (
        <PaywallModal onClose={() => setShowPaywall(false)} />
      )}
    </>
  )
}

/* ===== Page 8: Full course — lesson list with one unlocked demo ===== */

type CourseLessonData = {
  number: number
  title: string
  description: string
  duration: string
  locked: boolean
}

const COURSE_LESSONS: CourseLessonData[] = [
  {
    number: 1,
    title: 'Foundations & first concept brief',
    description:
      'Set up your workspace and turn a rough idea into a one-page brief you can build on.',
    duration: '12 min',
    locked: false,
  },
  {
    number: 2,
    title: 'Researching your real audience',
    description:
      'Pinpoint who you are building for and the moments where they actually feel the pain.',
    duration: '18 min',
    locked: true,
  },
  {
    number: 3,
    title: 'Pricing, packaging & positioning',
    description:
      'Choose a price point and message that line up with how your audience already buys.',
    duration: '21 min',
    locked: true,
  },
  {
    number: 4,
    title: 'Launch, gather signal, iterate',
    description:
      'Ship a small first version and use early reactions to decide what to double down on.',
    duration: '16 min',
    locked: true,
  },
]

function Page8FullCourse({ onBack }: { onBack: () => void }) {
  const [showPaywall, setShowPaywall] = useState(false)

  return (
    <section className="page">
      <div className="page-container-full">
        <div className="content-card-wide">
          <div className="course-header mb-8 pb-6 border-b">
            <button
              type="button"
              className="course-back-btn"
              onClick={onBack}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              Back to concept
            </button>
            <h1 className="heading-2">Full Course</h1>
            <p
              className="paragraph text-slate-600"
              style={{ marginTop: 8 }}
            >
              {COURSE_LESSONS.length} lessons · designed around the concept
              you just built. Lesson 1 is on us — preview it below.
            </p>
          </div>

          <div className="course-lessons">
            {COURSE_LESSONS.map((lesson) => (
              <CourseLesson
                key={lesson.number}
                lesson={lesson}
                onLockedAction={() => setShowPaywall(true)}
              />
            ))}
          </div>

          <div className="course-cta">
            <p
              className="paragraph text-slate-600 text-center"
            >
              Ready for the rest? Unlock all {COURSE_LESSONS.length} lessons
              and editable AI scripts.
            </p>
            <button
              type="button"
              className="btn-primary course-cta-btn"
              onClick={() => setShowPaywall(true)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Unlock full course
            </button>
          </div>
        </div>
      </div>
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </section>
  )
}

function CourseLesson({
  lesson,
  onLockedAction,
}: {
  lesson: CourseLessonData
  onLockedAction: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [prompt, setPrompt] = useState('')

  function handleEditClick() {
    if (lesson.locked) {
      onLockedAction()
      return
    }
    setEditing((v) => !v)
  }

  return (
    <article className={`course-lesson${lesson.locked ? ' locked' : ''}`}>
      <div className="course-lesson-video">
        {lesson.locked ? (
          <button
            type="button"
            className="course-lesson-locked"
            onClick={onLockedAction}
            aria-label={`Unlock lesson ${lesson.number}`}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="course-lesson-locked-label">
              Locked — unlock to watch
            </span>
          </button>
        ) : (
          <video
            className="lesson-video"
            src={LESSON_VIDEO_SRC}
            controls
            preload="metadata"
          />
        )}
      </div>

      <div className="course-lesson-body">
        <div className="course-lesson-meta">
          <span className="course-lesson-number">
            Lesson {lesson.number}
          </span>
          <span className="course-lesson-duration">{lesson.duration}</span>
          {lesson.locked ? (
            <span className="course-lesson-lock-badge">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Locked
            </span>
          ) : (
            <span className="course-lesson-free-badge">Free preview</span>
          )}
        </div>

        <h3 className="heading-4 course-lesson-title">{lesson.title}</h3>
        <p className="paragraph text-slate-600">{lesson.description}</p>

        {editing && !lesson.locked && (
          <div className="course-lesson-edit">
            <label className="paragraph-small-semibold mb-2 block text-slate-700">
              AI video maker prompt
            </label>
            <textarea
              className="text-input"
              style={{ height: 'auto', minHeight: 80 }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what the AI should generate for this lesson video…"
            />
            <div className="edit-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={onLockedAction}
              >
                Save video content
              </button>
            </div>
          </div>
        )}

        <div className="course-lesson-actions">
          <button
            type="button"
            className="course-lesson-edit-btn"
            onClick={handleEditClick}
            aria-label={`Edit lesson ${lesson.number}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
            Edit
          </button>
        </div>
      </div>
    </article>
  )
}

function PaywallModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="paywall-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="paywall-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="paywall-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="paywall-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h3 className="heading-3 paywall-title">Unlock the full course</h3>
        <p className="paragraph paywall-sub">
          Generate AI lesson videos and access the complete curriculum.
        </p>

        <div className="paywall-price">
          <span className="paywall-price-amount">$49</span>
          <span className="paywall-price-period">one-time</span>
        </div>

        <ul className="boundary-list paywall-features">
          <li>Unlimited AI-generated lesson videos</li>
          <li>Full course access — every lesson, every module</li>
          <li>Editable scripts and prompts</li>
        </ul>

        <div className="paywall-actions">
          <button className="btn-ghost" onClick={onClose}>
            Maybe later
          </button>
          <button
            className="btn-primary"
            onClick={() => alert('Stripe checkout would open here.')}
          >
            Pay $49 & unlock
          </button>
        </div>
      </div>
    </div>
  )
}

function AIChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<
    Array<{ role: 'assistant' | 'user'; text: string }>
  >([
    {
      role: 'assistant',
      text: "I've created your product concept. What would you like to adjust?",
    },
  ])
  const [input, setInput] = useState('')

  function send(text?: string) {
    const value = (text ?? input).trim()
    if (!value) return
    setMessages((m) => [...m, { role: 'user', text: value }])
    setInput('')
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: 'I can help you adjust that. (In the wired version this would call /respond with your edit and PATCH the concept.)',
        },
      ])
    }, 800)
  }

  const chips = [
    'Change format to ebook',
    'Add more modules',
    'Adjust pricing higher',
  ]

  return (
    <div className="chat-section">
      <div className="flex items-center justify-between mb-4">
        <h4 className="paragraph-semibold">Edit by AI</h4>
        <button className="btn-close" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="chat-messages mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.role}`}>
            <p className="paragraph-small">{m.text}</p>
          </div>
        ))}
      </div>

      <div className="suggested-prompts mb-4">
        {chips.map((c) => (
          <button
            key={c}
            className="prompt-chip"
            onClick={() => setInput(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Ask AI to adjust your concept..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send()
          }}
        />
        <button className="btn-primary" onClick={() => send()}>
          Send
        </button>
      </div>
    </div>
  )
}

export default App
