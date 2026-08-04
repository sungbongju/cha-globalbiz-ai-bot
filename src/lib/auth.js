// 학교 서버 PHP API 클라이언트 (cha_interview_db, *_gba 테이블 — interview-bot과 완전 격리)
// 배포 대상마다 백엔드가 다르다. Vercel은 api/school-api.js 서버리스 함수를 쓰고,
// 학교 서버(aiforalab.com/gba/)는 Apache + globalbiz-api.php 를 쓴다.
// 학교 서버용 빌드는 `npm run build:gba` (VITE_API_BASE 주입) 로 만든다.
const API_BASE = import.meta.env.VITE_API_BASE || '/api/school-api'

const TOKEN_KEY = 'gba_token'
const USER_KEY  = 'gba_user'
const SID_KEY   = 'gba_sid'

export function getToken() { return localStorage.getItem(TOKEN_KEY) }
export function getUser()  {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null }
}
export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY,  JSON.stringify(user))
}
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// 새 세션 ID 발급 (대화 시작할 때마다 새로)
export function newSessionId() {
  const sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10)
  localStorage.setItem(SID_KEY, sid)
  return sid
}
export function getSessionId() { return localStorage.getItem(SID_KEY) }

// 익명 방문도 셀 수 있도록 첫 로드부터 세션 ID 보장 (없으면 발급)
export function ensureSessionId() {
  return getSessionId() || newSessionId()
}

async function call(action, payload = {}) {
  const res = await fetch(`${API_BASE}?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return res.json()
}

export async function emailSignup(email, password, name, country = null, track = null) {
  const r = await call('email_signup', { email, password, name, country, track })
  if (r.success) setAuth(r.token, r.user)
  return r
}

export async function emailLogin(email, password) {
  const r = await call('email_login', { email, password })
  if (r.success) setAuth(r.token, r.user)
  return r
}

export async function verifyToken() {
  const token = getToken()
  if (!token) return null
  const r = await call('verify', { token })
  if (!r.success) { clearAuth(); return null }
  localStorage.setItem(USER_KEY, JSON.stringify(r.user))
  return r.user
}

// fire-and-forget: 응답 안 기다림. 토큰 있으면 user_id 매핑, 없으면 익명
export function saveChat(session_id, role, message, rag_hits = null) {
  const token = getToken()
  const body = { session_id, role, message }
  if (rag_hits) body.rag_hits = rag_hits
  if (token)    body.token = token
  // fire-and-forget — UX 절대 막지 않음
  fetch(`${API_BASE}?action=save_chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true
  }).catch(() => {})
}

// ─── Visitor analytics ──────────────────────────────────────────────
// visit_logs_gba.role 은 ENUM('user','assistant')이라 'pageview'/'action' 을
// 직접 못 넣는다 → role='user' + message 에 '[pageview] /path' / '[action] name'
// 형태로 구분 가능하게 기록. saveChat 과 동일한 fire-and-forget 경로.
// 식별: 로그인 시 token→user_id, 아니면 익명 gba_sid. path/action 외 PII 없음.
export function logVisit(kind, value) {
  const session_id = ensureSessionId()
  const prefix = kind === 'action' ? '[action]' : '[pageview]'
  const message = `${prefix} ${value || ''}`.trim()
  saveChat(session_id, 'user', message)
}

// 재방문 횟수 조회 (읽기 전용). 토큰 있으면 user 기준, 없으면 session 기준.
// 응답: { success, count, days, sessions, by }. 실패해도 throw 안 함 → null 반환.
export async function getVisitCount() {
  try {
    const session_id = ensureSessionId()
    const token = getToken()
    const body = { session_id }
    if (token) body.token = token
    const r = await call('visit_count', body)
    return r && r.success ? r : null
  } catch {
    return null
  }
}

// 설문 제출 — answers 객체 그대로 전달. answers.survey_version 가 있으면 그대로
// 사용하고, 없으면 기본값 'gba_v1'. *_gba 테이블은 임의의 answer key 를 JSON 형태로 수용.
export async function saveSurvey(answers) {
  const token = getToken()
  const body = { survey_version: 'gba_v1', ...answers }
  if (token) body.token = token
  const r = await call('save_survey', body)
  return r
}
