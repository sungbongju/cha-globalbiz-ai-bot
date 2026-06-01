import { useState, useMemo, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { saveSurvey, getSessionId } from '../lib/auth'
import {
  TRUST_QUESTIONS, OVERALL_QUESTION, LAYER_LABELS,
  COUNTRIES, TRACKS, AGE_BANDS, GENDER_OPTIONS, MBTI_LIST,
} from '../lib/trustComponents'

// Reads which modes the user has tried (recorded by the Assistant page) so we can
// gate voice/video-only questions. Falls back to "all applicable" if unknown.
function readModesUsed() {
  try {
    const raw = localStorage.getItem('gba_modes_used')
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch { return [] /* localStorage unavailable */ }
}

// Trust-signals research survey (English, gba_v1). navy(#0a1e3f)/gold(#d4a574).
// Demographics → 4 layers of agree/disagree questions → overall trust → free text.
// Conditional questions (voice/video/revisit) are hidden when not applicable.
export default function SurveyModal({
  open,
  onClose,
  modesUsed,          // optional override: ['ftf','sts','ttt']
  visitCount = 1,     // >= 2 unlocks revisit questions
}) {
  const [country, setCountry] = useState('')
  const [track, setTrack]     = useState('')
  const [age, setAge]         = useState('')
  const [gender, setGender]   = useState('')
  const [mbti, setMbti]       = useState('')
  const [answers, setAnswers] = useState({})    // { q06_...: 1|0 }
  const [overall, setOverall] = useState(null)  // 1|0|null
  const [freePos, setFreePos] = useState('')
  const [freeNeg, setFreeNeg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const startedAtRef = useRef(0)
  // Re-read localStorage each time the modal opens so modes tried this session count.
  const [storedModes, setStoredModes] = useState([])

  const effectiveModes = useMemo(
    () => (modesUsed && modesUsed.length ? modesUsed : storedModes),
    [modesUsed, storedModes]
  )
  // If we have no signal at all about modes, assume voice/video may apply so the
  // questions aren't silently dropped for avatar users who never had tracking.
  const noModeSignal = effectiveModes.length === 0
  const usedVoice = noModeSignal || effectiveModes.includes('ftf') || effectiveModes.includes('sts')
  const usedVideo = noModeSignal || effectiveModes.includes('ftf')
  const isRevisit = visitCount >= 2

  const isQuestionApplicable = (q) => {
    if (!q.condition) return true
    if (q.condition === 'voice')   return usedVoice
    if (q.condition === 'video')   return usedVideo
    if (q.condition === 'revisit') return isRevisit
    return true
  }

  useEffect(() => {
    if (open) {
      startedAtRef.current = Date.now()
      setDone(false)
      setError('')
      setStoredModes(readModesUsed())
    }
  }, [open])

  if (!open) return null

  const layers = [1, 2, 3, 4, 5]
  const questionsByLayer = layers.map(layer => ({
    layer,
    questions: TRUST_QUESTIONS.filter(q => q.layer === layer),
  })).filter(g => g.questions.length > 0)

  const handleAnswer = (code, value) => {
    setAnswers(prev => ({ ...prev, [code]: value }))
  }

  const applicableQuestions = TRUST_QUESTIONS.filter(isQuestionApplicable)
  const totalRequired = applicableQuestions.length + 1 // +1 = overall
  const totalAnswered =
    applicableQuestions.filter(q => answers[q.code] === 0 || answers[q.code] === 1).length
    + (overall === 0 || overall === 1 ? 1 : 0)

  const canSubmit =
    country && track && age && gender && totalAnswered === totalRequired && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')

    const duration_seconds = Math.round((Date.now() - startedAtRef.current) / 1000)

    // Non-applicable conditional questions are sent as null (not answered).
    const questionPayload = {}
    TRUST_QUESTIONS.forEach(q => {
      questionPayload[q.code] = isQuestionApplicable(q) ? (answers[q.code] ?? null) : null
    })

    const payload = {
      session_id: getSessionId() || null,
      survey_version: 'gba_v1',
      country,
      track,
      age_band: age,
      gender,
      mbti: mbti || null,
      modes_used: effectiveModes.join(',') || null,
      visit_count: visitCount,
      ...questionPayload,
      q24_overall_trust: overall,
      free_positive: freePos.trim() || null,
      free_negative: freeNeg.trim() || null,
      duration_seconds,
    }

    try {
      const r = await saveSurvey(payload)
      if (r?.success) {
        setDone(true)
      } else {
        setError(r?.error || 'Could not save your response. Please try again shortly.')
      }
    } catch {
      setError('A network error occurred. Please try again shortly.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderAgree = (q, value, onSet) => {
    const applicable = isQuestionApplicable(q)
    if (!applicable) return null
    return (
      <div key={q.code} className="mb-3 rounded-xl border border-gray-100 bg-[#faf8f3] p-3.5">
        <div className="text-sm leading-relaxed text-[#0a1e3f]">
          <span className="font-bold text-[#d4a574]">Q{q.num}.</span> {q.text}
        </div>
        <div className="mt-2.5 flex gap-2">
          <button
            type="button"
            onClick={() => onSet(1)}
            className={`flex-1 max-w-[160px] rounded-lg border-2 px-4 py-2 text-sm font-semibold transition
              ${value === 1
                ? 'border-[#0a1e3f] bg-[#0a1e3f] text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-[#d4a574]'}`}
          >Agree</button>
          <button
            type="button"
            onClick={() => onSet(0)}
            className={`flex-1 max-w-[160px] rounded-lg border-2 px-4 py-2 text-sm font-semibold transition
              ${value === 0
                ? 'border-[#b04a3a] bg-[#b04a3a] text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-[#d4a574]'}`}
          >Disagree</button>
        </div>
      </div>
    )
  }

  const Chip = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition
        ${active
          ? 'border-[#0a1e3f] bg-[#0a1e3f] text-white'
          : 'border-gray-200 bg-white text-gray-700 hover:border-[#d4a574]'}`}
    >{children}</button>
  )

  if (done) {
    return (
      <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm px-4 py-8">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-[#0a1e3f] to-[#1a3567] px-8 py-10 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-[#d4a574] flex items-center justify-center text-white font-bold text-lg shadow-lg">
              CHA
            </div>
            <h3 className="mt-4 text-white text-xl font-bold">Thank you!</h3>
          </div>
          <div className="px-8 py-7 text-center">
            <p className="text-sm leading-relaxed text-gray-600">
              Your feedback helps us improve the assistant and supports our research.
              We really appreciate your time.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 rounded-xl bg-[#d4a574] text-white text-sm font-semibold
                shadow-lg shadow-[#d4a574]/30 hover:bg-[#c19463] transition"
            >Close</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm px-4 py-6">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden my-2">
        {/* navy header */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-[#0a1e3f] to-[#1a3567] px-6 py-5">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-white/70 hover:text-white transition"
          >
            <X size={22} />
          </button>
          <h2 className="text-white text-lg font-bold">Help us improve the GBA Assistant</h2>
          <p className="mt-1 text-white/70 text-sm">
            An anonymous research survey · ~2 minutes · no personally identifying data
          </p>
        </div>

        <div className="px-6 py-6">
          {/* Part I — demographics */}
          <section className="mb-7">
            <h3 className="inline-block border-b-2 border-[#d4a574] pb-1 text-base font-bold text-[#0a1e3f]">
              Part I · About you
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0a1e3f] mb-2">Country / Nationality</label>
                <select
                  className="w-full max-w-sm rounded-lg border border-gray-200 px-3 py-2.5 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#d4a574]/60 focus:border-[#d4a574]"
                  value={country} onChange={e => setCountry(e.target.value)}
                >
                  <option value="">Select…</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0a1e3f] mb-2">Intended track</label>
                <div className="flex flex-wrap gap-2">
                  {TRACKS.map(t => (
                    <Chip key={t.value} active={track === t.value} onClick={() => setTrack(t.value)}>{t.label}</Chip>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0a1e3f] mb-2">Age</label>
                <div className="flex flex-wrap gap-2">
                  {AGE_BANDS.map(a => (
                    <Chip key={a.value} active={age === a.value} onClick={() => setAge(a.value)}>{a.label}</Chip>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0a1e3f] mb-2">Gender</label>
                <div className="flex flex-wrap gap-2">
                  {GENDER_OPTIONS.map(g => (
                    <Chip key={g.value} active={gender === g.value} onClick={() => setGender(g.value)}>{g.label}</Chip>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0a1e3f] mb-2">
                  MBTI <span className="font-normal text-gray-400 text-xs">(optional)</span>
                </label>
                <select
                  className="w-full max-w-sm rounded-lg border border-gray-200 px-3 py-2.5 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#d4a574]/60 focus:border-[#d4a574]"
                  value={mbti} onChange={e => setMbti(e.target.value)}
                >
                  <option value="">Don't know / prefer not to say</option>
                  {MBTI_LIST.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Part II — trust questions */}
          <section className="mb-7">
            <h3 className="inline-block border-b-2 border-[#d4a574] pb-1 text-base font-bold text-[#0a1e3f]">
              Part II · Your experience
            </h3>
            <p className="mt-3 mb-4 text-sm text-gray-600">
              Based on how you actually felt, choose <strong>Agree</strong> or <strong>Disagree</strong> for each.
            </p>
            {questionsByLayer.map(({ layer, questions }) => {
              const visible = questions.filter(isQuestionApplicable)
              if (visible.length === 0) return null
              return (
                <div key={layer} className="mb-5">
                  <h4 className="mb-3 rounded-md bg-[#0a1e3f]/5 px-3 py-1.5 text-sm font-semibold text-[#0a1e3f]">
                    {LAYER_LABELS[layer]}
                  </h4>
                  {questions.map(q => renderAgree(q, answers[q.code] ?? null, v => handleAnswer(q.code, v)))}
                </div>
              )
            })}
          </section>

          {/* Part III — overall trust */}
          <section className="mb-7">
            <h3 className="inline-block border-b-2 border-[#d4a574] pb-1 text-base font-bold text-[#0a1e3f]">
              Part III · Overall trust
            </h3>
            <div className="mt-4">
              {renderAgree(OVERALL_QUESTION, overall, setOverall)}
            </div>
          </section>

          {/* Part IV — free text */}
          <section className="mb-2">
            <h3 className="inline-block border-b-2 border-[#d4a574] pb-1 text-base font-bold text-[#0a1e3f]">
              Part IV · Open feedback <span className="font-normal text-gray-400 text-xs">(optional)</span>
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0a1e3f] mb-1.5">
                  What moment or feature felt most trustworthy?
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-y
                    focus:outline-none focus:ring-2 focus:ring-[#d4a574]/60 focus:border-[#d4a574]"
                  rows={3} maxLength={2000}
                  value={freePos} onChange={e => setFreePos(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0a1e3f] mb-1.5">
                  What felt least trustworthy or awkward?
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-y
                    focus:outline-none focus:ring-2 focus:ring-[#d4a574]/60 focus:border-[#d4a574]"
                  rows={3} maxLength={2000}
                  value={freeNeg} onChange={e => setFreeNeg(e.target.value)}
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-4">
          <span className="text-sm font-medium text-gray-500">
            Answered {totalAnswered}/{totalRequired}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-xl bg-[#d4a574] px-8 py-3 text-sm font-semibold text-white
              shadow-lg shadow-[#d4a574]/30 transition hover:bg-[#c19463] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}
