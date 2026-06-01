// Trust-signals research survey — English adaptation for the Global Business AI
// (GBA) site. Ported from the Korean interview-bot survey (Q6–Q24) and adapted:
//  - Kakao items dropped (no Kakao here).
//  - q06 generalized from "Prof. Park himself" → the program's avatar host.
//  - Korean-ordinal greeting item reframed to natural English greeting.
//  - NEW "Background Recognition" construct (Layer 5): q25–q27.
// condition: 'voice' = voice/avatar modes only (sts/ftf),
//            'video' = avatar (ftf) only,
//            'revisit' = returning visitors only (visit count >= 2)

// Respondents are international students (e.g. Nepali). Keep demographics short.
export const COUNTRIES = [
  'Nepal',
  'India',
  'Vietnam',
  'Bangladesh',
  'Pakistan',
  'Indonesia',
  'Mongolia',
  'Uzbekistan',
  'China',
  'Korea',
  'Other',
]

// Intended study track within the major.
export const TRACKS = [
  { value: 'business', label: 'Business Management' },
  { value: 'ai',       label: 'Artificial Intelligence' },
  { value: 'both',     label: 'Both / Undecided' },
]

// Age bands (international cohort — grade level is less meaningful than age here).
export const AGE_BANDS = [
  { value: 'under18', label: 'Under 18' },
  { value: '18_21',   label: '18–21' },
  { value: '22_25',   label: '22–25' },
  { value: '26_30',   label: '26–30' },
  { value: 'over30',  label: 'Over 30' },
]

export const GENDER_OPTIONS = [
  { value: 'female',    label: 'Female' },
  { value: 'male',      label: 'Male' },
  { value: 'no_answer', label: 'Prefer not to say' },
]

export const MBTI_LIST = [
  'ISTJ','ISFJ','INFJ','INTJ',
  'ISTP','ISFP','INFP','INTP',
  'ESTP','ESFP','ENFP','ENTP',
  'ESTJ','ESFJ','ENFJ','ENTJ',
]

export const TRUST_QUESTIONS = [
  // Layer 1 — Identity of the bot
  { code: 'q06_digital_twin',       layer: 1, num: 6,  text: 'Talking with this assistant felt like talking to the program’s real avatar host.' },
  { code: 'q07_institution_id',     layer: 1, num: 7,  text: 'This assistant felt like an official tool of CHA University.' },
  { code: 'q08_ai_disclosure',      layer: 1, num: 8,  text: 'The assistant made it clear that it is an AI, not a real person.' },

  // Layer 2 — Quality of answers
  { code: 'q09_rag_grounding',      layer: 2, num: 9,  text: 'The assistant’s answers felt accurate and fact-based.' },
  { code: 'q10_limit_admit',        layer: 2, num: 10, text: 'When it did not know something, the assistant honestly said so or suggested contacting the program staff.' },
  { code: 'q11_warm_tone',          layer: 2, num: 11, text: 'The assistant’s tone felt warm and friendly.' },
  { code: 'q12_format_consistency', layer: 2, num: 12, text: 'The assistant’s answers were consistent and professional in style.' },

  // Layer 3 — Naturalness of the conversation
  { code: 'q13_latency_pacing',     layer: 3, num: 13, text: 'The pacing of the conversation (time from my question to its reply) felt natural.' },
  { code: 'q14_echo_guard',         layer: 3, num: 14, text: 'During voice conversation, my voice and the assistant’s voice never overlapped or cut off awkwardly.', condition: 'voice', conditionLabel: 'Only if you used Voice or Avatar mode' },
  { code: 'q15_esc_interrupt',      layer: 3, num: 15, text: 'When I wanted to interrupt while the assistant was speaking, I was able to (or felt I could).' },
  { code: 'q16_avatar_embodiment',  layer: 3, num: 16, text: 'The avatar’s lip movements and expressions looked natural.', condition: 'video', conditionLabel: 'Only if you used Avatar (video) mode' },
  { code: 'q17_mode_switch',        layer: 3, num: 17, text: 'I liked being able to switch freely between Avatar, Voice, and Text modes.' },

  // Layer 4 — Policy and relationship signals
  { code: 'q18_consent_ui',         layer: 4, num: 18, text: 'At sign-up, the data-handling notice (what is collected, why, and for how long) was presented clearly.' },
  { code: 'q19_guest_browse',       layer: 4, num: 19, text: 'Being able to browse without logging in made me feel more at ease.' },
  { code: 'q20_natural_greeting',   layer: 4, num: 20, text: 'I liked that the assistant greeted me with a natural, friendly welcome message.' },
  { code: 'q21_visit_tracking',     layer: 4, num: 21, text: 'It felt friendly that the assistant remembered how many times I had visited.', condition: 'revisit', conditionLabel: 'Only if you have visited more than once' },
  { code: 'q22_tts_normalize',      layer: 4, num: 22, text: 'The assistant read out abbreviations (AI, GPT, etc.) naturally when speaking.', condition: 'voice', conditionLabel: 'Only if you used Voice or Avatar mode' },

  // Layer 5 — Background recognition (NEW construct)
  { code: 'q25_bg_aware',     layer: 5, num: 25, text: 'The assistant seemed aware of my background and interests.' },
  { code: 'q26_bg_tailored',  layer: 5, num: 26, text: 'The answers felt tailored to someone like me, rather than generic.' },
  { code: 'q27_bg_returning', layer: 5, num: 27, text: 'I felt the site recognized me as a returning or known visitor.', condition: 'revisit', conditionLabel: 'Only if you have visited more than once' },
]

export const OVERALL_QUESTION = {
  code: 'q24_overall_trust', num: 24,
  text: 'Overall, I felt I could trust this assistant.',
}

export const LAYER_LABELS = {
  1: 'Bot Identity',
  2: 'Answer Quality',
  3: 'Conversation Naturalness',
  4: 'Policy & Relationship Signals',
  5: 'Background Recognition',
}
