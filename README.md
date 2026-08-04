# CHA Global Business AI — 학과 소개 사이트

차의과학대학교 미래융합대학 Global Business AI 전공(영어 강의, 유학생 대상) 소개 사이트.
React 19 + Vite + Tailwind. 아바타 상담(LiveAvatar), 음성/텍스트 챗봇, 회원가입, 설문을 포함한다.

## ⚠️ 배포 대상이 두 곳이다 — 빌드 명령을 반드시 구분할 것

같은 소스를 서로 **다른 백엔드** 위에 올린다. 빌드 명령을 잘못 쓰면 화면은 멀쩡한데
회원가입·설문·방문로깅·아바타·음성이 전부 404 로 죽는다. 실제로 그런 사고가 있었다.

| | **학교 서버 (운영)** | Vercel (구버전 방치) |
|---|---|---|
| 주소 | **`aiforalab.com/gba/`** | `cha-globalbiz-ai-bot.vercel.app` |
| 빌드 | **`npm run build`** (기본값) | `npm run build:vercel` |
| 경로 base | `/gba/` | `/` |
| 챗·아바타 API | `/gba/api/<name>.php` | `/api/<name>` (`api/<name>.js` 서버리스) |
| 회원·설문 API | `/globalbiz-api/globalbiz-api.php` | `/api/school-api` (`api/school-api.js`) |

**기본값(`npm run build`)이 운영용이다.** 운영이 학교 서버이므로, 아무 생각 없이 빌드해도
운영이 깨지지 않는 쪽을 기본으로 둔다. `--base=/gba/` 와 `--mode gba`(→ `.env.gba`)가 붙는다.

Vercel 은 대시보드에서 GitHub 에 연동돼 있어 push 시 자동 재빌드될 수 있다. 기본 빌드가
운영용으로 바뀌었으므로 `vercel.json` 에 `buildCommand: npm run build:vercel` 을 못박아 두었다.
이 줄을 지우면 Vercel 배포가 `/gba/` base 로 빌드돼 깨진다.

경로 분기는 하드코딩하지 말고 반드시 아래 두 곳을 거칠 것:

- `src/lib/endpoints.js` — `apiUrl('stt')` → 대상별로 `/api/stt` 또는 `/gba/api/stt.php`
- `src/lib/auth.js` — `VITE_API_BASE` (회원·설문·방문로깅)

라우터 basename 도 `import.meta.env.BASE_URL` 에서 받는다(`src/App.jsx`). 하드코딩 금지.

## 학교 서버 배포

```bash
npm run build
# dist/ 를 /var/www/html/gba/ 로 복사 (파일 소유자는 sdkpark:sdkpark, 644)
```

배포 후 반드시 확인:

1. `/gba/about` 등 하위 경로가 404 없이 열리는지 (basename 확인)
2. 페이지 로드 시 `/globalbiz-api/globalbiz-api.php?action=visit_count` 가 **200** 인지
3. 아바타 "Start avatar" 가 실제로 영상까지 뜨는지

## 백엔드 메모

- 학교 서버의 `/gba/api/*.php` 는 `api/*.js` (Vercel 서버리스) 를 PHP 5.4 로 포팅한 것이다.
  한쪽을 고치면 다른 쪽도 같이 고쳐야 한다.
- 아바타 세션은 LiveAvatar API 를 쓴다. 세션이 열린 채 방치되면 크레딧이 계속 빠지므로,
  대화 종료 시 `stop` 호출이 실제로 나가는지 확인할 것.
- 설문·방문로그는 `cha_interview_db` 의 `*_gba` 테이블에 쌓인다
  (`survey_responses_gba`, `visit_logs_gba`, `users_gba`). 인터뷰봇 테이블과 완전히 분리돼 있다.

## 개발

```bash
npm install
npm run dev      # http://localhost:5173
npm run lint
```
