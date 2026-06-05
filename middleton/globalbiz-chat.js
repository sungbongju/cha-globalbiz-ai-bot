/**
 * GlobalBiz (GBA Assistant) Chat Route — DEDICATED endpoint for the Global
 * Business AI site, decoupled from the competition team-chat.js.
 *
 *   POST /api/globalbiz/chat-stream   SSE  (team_90 RAG + Gemma4 + background recognition)
 *   POST /api/globalbiz/chat          batch
 *
 * It reuses the isolated team_90 RAG + persona, but lives in its own route so
 * GBA-only logic (background recognition / personalization for logged-in users)
 * never touches the 16 competition teams in team-chat.js.
 *
 * Body: { message, history?, images?, userContext? }
 *   userContext (optional, only from logged-in GBA users):
 *     { name?, visitCount?, country?, track?, interests? }
 */
const express = require('express');
const router  = express.Router();
const teamRag = require('../utils/team-rag');

const GEMMA_URL   = 'http://127.0.0.1:11435/api/chat';
const GEMMA_MODEL = process.env.TEAM_MODEL || 'gemma4:latest';
const GBA_TEAM    = '90';

function stripMarkdown(s) {
  return String(s || '')
    .replace(/\*+/g, '')
    .replace(/`+/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

// ── Background recognition ──────────────────────────────────────────────
// Build a short, safe personalization block from the logged-in user's context.
// Only included when the frontend sends userContext (i.e. a logged-in visitor).
function buildBackgroundBlock(uc) {
  if (!uc || typeof uc !== 'object') return '';
  const clip = (v, n) => (typeof v === 'string' ? v.slice(0, n).trim() : '');
  const name      = clip(uc.name, 60);
  const visit     = Number(uc.visitCount ?? uc.visit_count ?? 0) || 0;
  const country   = clip(uc.country, 40);
  const track     = clip(uc.track, 40);
  const interests = clip(uc.interests, 160);

  const facts = [];
  if (name)  facts.push(`Their name is ${name}.`);
  if (visit >= 2) facts.push(`This is visit #${visit} — they are a returning visitor.`);
  else if (visit === 1) facts.push(`This is their first visit.`);
  if (country)   facts.push(`They are from ${country}.`);
  if (track)     facts.push(`They are interested in the "${track}" track.`);
  if (interests) facts.push(`Their stated interests: ${interests}.`);
  if (facts.length === 0) return '';

  return [
    '',
    '## About the person you are talking to',
    facts.join(' '),
    'Greet them by name when it feels natural, and subtly show that you recognize them and their background (returning visitor, country, interests). Tailor your suggestions to them rather than giving generic answers — but keep it light and human; do not mechanically restate their profile.',
  ].join('\n');
}

function buildPrompt(chunks, team, userContext) {
  const customPrompt = (team && team.systemPrompt || '').trim();
  const botName = (team && team.botName) || 'GBA Assistant';
  const intro = customPrompt || `You are "${botName}", the official AI guide for the Global Business AI major at CHA University. Answer in clear, warm English.`;

  const lines = [intro];
  const bg = buildBackgroundBlock(userContext);
  if (bg) lines.push(bg);

  if (chunks && chunks.length) {
    lines.push(
      '',
      '## Reference material (background knowledge)',
      'Use the items below when they are relevant to the question. If they are not relevant, answer from your general knowledge — never refuse with "it is not in my materials".'
    );
    for (const c of chunks) {
      const q = (c.question || '').trim();
      const a = (c.answer || '').trim();
      if (!q && !a) continue;
      lines.push(`\n- Q: ${q}\n  A: ${a}`);
    }
  }
  return lines.join('\n');
}

function getTeam() {
  return teamRag.getTeam(GBA_TEAM);
}

// ── Batch ───────────────────────────────────────────────────────────────
router.post('/globalbiz/chat', async (req, res) => {
  const team = getTeam();
  if (!team) return res.status(404).json({ error: 'GBA bot (team 90) not configured' });

  const { message, history = [], userContext = null } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });

  try {
    const chunks = await teamRag.retrieve(GBA_TEAM, message, 5);
    const systemPrompt = buildPrompt(chunks, team, userContext);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8),
      { role: 'user', content: message },
    ];
    const r = await fetch(GEMMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: GEMMA_MODEL, messages, stream: false, think: false,
        options: { num_predict: 512, temperature: 0.7 },
      }),
    });
    const data = await r.json();
    const reply = stripMarkdown((data?.message?.content || '').trim());
    res.json({ reply, ttsReply: reply, ragHits: chunks.length });
  } catch (e) {
    console.error('[globalbiz-chat]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Streaming (SSE) ─────────────────────────────────────────────────────
router.post('/globalbiz/chat-stream', async (req, res) => {
  const team = getTeam();
  if (!team) return res.status(404).json({ error: 'GBA bot (team 90) not configured' });

  const { message, history = [], images = [], userContext = null } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const writeEvent = (data) => { res.write(`data: ${JSON.stringify(data)}\n\n`); };

  try {
    const chunks = await teamRag.retrieve(GBA_TEAM, message, 5);
    const systemPrompt = buildPrompt(chunks, team, userContext);
    console.log(`[globalbiz/${team.botName}] Q: ${message.slice(0, 40)} hits=${chunks.length} ctx=${userContext ? 'yes' : 'no'}`);

    const userMsg = { role: 'user', content: message };
    if (Array.isArray(images) && images.length > 0) {
      userMsg.images = images.map(s => String(s).replace(/^data:image\/[^;]+;base64,/, ''));
    }
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8),
      userMsg,
    ];

    const upstream = await fetch(GEMMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: GEMMA_MODEL, messages, stream: true, think: false,
        options: { num_predict: 512, temperature: 0.7 },
      }),
    });

    if (!upstream.ok || !upstream.body) {
      writeEvent({ error: 'ollama upstream error', status: upstream.status });
      res.end();
      return;
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        let obj;
        try { obj = JSON.parse(trimmed); } catch { continue; }
        const token = (obj.message?.content || '')
          .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}\u{2700}-\u{27BF}\u{FE0F}]/gu, '')
          .replace(/[*`#]/g, '');
        if (token) { fullText += token; writeEvent({ token }); }
        if (obj.done) {
          writeEvent({ done: true, fullText, ragHits: chunks.length });
          res.write('data: [DONE]\n\n');
          res.end();
          return;
        }
      }
    }
    writeEvent({ done: true, fullText, ragHits: chunks.length });
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e) {
    console.error('[globalbiz-chat-stream]', e.message);
    try { writeEvent({ error: e.message }); } catch {}
    try { res.end(); } catch {}
  }
});

module.exports = router;
