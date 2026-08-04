// 배포 대상마다 API 위치가 다르다. 한 소스로 두 곳을 모두 지원하기 위한 헬퍼.
//
//   · Vercel      → /api/<name>          (api/<name>.js 서버리스 함수)
//   · 학교 서버    → /gba/api/<name>.php  (Apache + PHP 포팅본)
//
// 학교 서버용 빌드는 `npm run build:gba` 가 .env.gba 를 읽어 값을 주입한다.
// 기본값(env 없음)은 Vercel 기준이므로, 그냥 `npm run build` 한 결과를
// 학교 서버에 올리면 아바타·음성·채팅이 전부 404 가 된다.
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api'
const API_SUFFIX = import.meta.env.VITE_API_SUFFIX || ''

export function apiUrl(name) {
  return `${API_PREFIX}/${name}${API_SUFFIX}`
}
