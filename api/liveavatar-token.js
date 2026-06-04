// api/liveavatar-token.js
// LiveAvatar 세션 토큰 생성 + 세션 시작 (2단계 통합)
// Ported from cha-interview-bot-liveavatar.
// AVATAR_ID는 비밀이 아니라 단순 식별자라 하드코딩 (env 불필요). API 키만 server-side.
// 박교수님 LiveAvatar — 신규 완성 아바타 (2026-06-03 처리 완료, 교수님 확인).
// 기존(3554efce-af84-4701-981e-2cbd46e991af)에서 교체.
const PROF_PARK_AVATAR_ID = "3303593d-4571-486f-a82d-35056b0d2e2c"; // 박교수님 LiveAvatar (신규)

function corsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
  corsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const LIVEAVATAR_API_KEY = process.env.LIVEAVATAR_API_KEY;
  if (!LIVEAVATAR_API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const body = req.body || {};
    const avatarId = body.avatar_id || PROF_PARK_AVATAR_ID;
    const contextId = body.context_id || null;
    const interactivityType = body.interactivity_type || "CONVERSATIONAL";

    if (!avatarId) {
      return res.status(400).json({ error: "avatar_id required" });
    }

    // Step 1: 세션 토큰 생성
    const tokenRes = await fetch("https://api.liveavatar.com/v1/sessions/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": LIVEAVATAR_API_KEY,
      },
      body: JSON.stringify({
        // FULL 모드 — avatar.speak_text(외부 텍스트 발화 = HeyGen repeat 동등) 허용
        // LITE 모드는 LiveAvatar 자체 STT+LLM 자동 응답 전용이라 외부 텍스트 발화 throw됨.
        // 본 시스템은 미들턴(Gemma4)이 답변 생성 → LiveAvatar는 발화만 담당 → FULL 필수.
        mode: "FULL",
        avatar_id: avatarId,
        is_sandbox: false,
        video_settings: {
          quality: "medium",
          encoding: "H264",
        },
        avatar_persona: {
          context_id: contextId,
          language: "ko",
          // 사진(이미지) 기반 아바타는 자체 음성이 없어 voice_id 필수.
          // dkpark = 박교수님 본인 클론 음성(Voice Clone). eleven_flash_v2_5(다국어)라 한/영 모두 발화.
          // ⚠️ API는 voice_id를 avatar_persona 바로 아래에서 읽음 (voice_settings 안이 아님).
          voice_id: "33868819-2331-4d2f-8b7d-dd589c82cead",
          voice_settings: {
            model: "eleven_flash_v2_5",
            speed: 1.0,
          },
          stt_config: {
            provider: "deepgram",
          },
        },
        interactivity_type: interactivityType,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.code !== 1000) {
      return res.status(tokenRes.status).json({ error: "Token creation failed", detail: tokenData });
    }

    const sessionToken = tokenData.data.session_token;
    const sessionId = tokenData.data.session_id;

    // Step 2: 세션 시작
    const startRes = await fetch("https://api.liveavatar.com/v1/sessions/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + sessionToken,
      },
    });

    const startData = await startRes.json();
    if (!startRes.ok || startData.code !== 1000) {
      return res.status(startRes.status).json({ error: "Session start failed", detail: startData });
    }

    return res.status(200).json({
      session_id: sessionId,
      session_token: sessionToken,
      livekit_url: startData.data.livekit_url,
      livekit_client_token: startData.data.livekit_client_token,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
