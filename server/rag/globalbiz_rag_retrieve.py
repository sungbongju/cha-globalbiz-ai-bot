"""
Global Business AI program — RAG retrieval module.

Use:
    from globalbiz_rag_retrieve import retrieve, format_context
    hits = retrieve("Who is the program chair?", top_k=3)
    ctx  = format_context(hits)

Chunks and embeddings are lazy-loaded once on first call and cached
for the life of the process. Each subsequent retrieve() = 1 embedding
call to Ollama + a single matrix-vector dot product.
"""

import json
import logging
import os
from pathlib import Path
from typing import List, Dict, Any

import numpy as np
import requests

log = logging.getLogger(__name__)

RAG_DIR = Path(os.environ.get("GLOBALBIZ_RAG_DIR", str(Path(__file__).resolve().parent)))
CHUNKS_PATH = RAG_DIR / "chunks.json"
EMBEDS_PATH = RAG_DIR / "embeddings.npy"

OLLAMA_URL = os.environ.get(
    "GLOBALBIZ_RAG_OLLAMA_URL",
    "http://127.0.0.1:11436/api/embeddings",
)
EMBED_MODEL = os.environ.get("GLOBALBIZ_RAG_EMBED_MODEL", "bge-m3")
HTTP_TIMEOUT = 5.0

# In-memory cache
_chunks: List[Dict[str, Any]] = []
_embeds: np.ndarray = np.zeros((0, 0))


def _load() -> None:
    global _chunks, _embeds
    if _chunks and _embeds.size:
        return
    if not CHUNKS_PATH.exists() or not EMBEDS_PATH.exists():
        log.warning("RAG files not found at %s — retrieve() will return []", RAG_DIR)
        return
    _chunks = json.loads(CHUNKS_PATH.read_text(encoding="utf-8"))
    _embeds = np.load(EMBEDS_PATH)
    log.info("globalbiz-RAG loaded: %d chunks, %s embeddings", len(_chunks), _embeds.shape)


def _embed(text: str) -> np.ndarray:
    r = requests.post(
        OLLAMA_URL,
        json={"model": EMBED_MODEL, "prompt": text},
        timeout=HTTP_TIMEOUT,
    )
    r.raise_for_status()
    v = np.array(r.json()["embedding"], dtype=np.float32)
    n = np.linalg.norm(v)
    return v / n if n > 0 else v


def retrieve(query: str, top_k: int = 3, min_score: float = 0.40) -> List[Dict[str, Any]]:
    """Return top_k chunks ranked by cosine similarity to `query`.

    Each returned dict: {id, section, question, answer, keywords, score}.
    Hits with score < min_score are filtered out to avoid hallucination
    when the user asks something off-topic.

    On any error returns [] so the calling LLM handler can degrade
    gracefully (just answer from general knowledge / system prompt).
    """
    try:
        _load()
        if not _chunks:
            return []
        qv = _embed(query)
        sims = _embeds @ qv  # normalized vectors → dot = cosine
        idx = np.argsort(-sims)[:top_k]
        out: List[Dict[str, Any]] = []
        for i in idx:
            score = float(sims[i])
            if score < min_score:
                continue
            c = dict(_chunks[i])
            c["score"] = round(score, 4)
            out.append(c)
        return out
    except Exception as e:
        log.warning("globalbiz-RAG retrieve failed: %s", e)
        return []


def format_context(hits: List[Dict[str, Any]]) -> str:
    """Format retrieved chunks for injection into the LLM system prompt."""
    if not hits:
        return ""
    lines = [
        "[OFFICIAL PROGRAM INFORMATION — base your answer on the facts below;",
        " if a question is outside this scope, say you'll connect them with the admissions team]"
    ]
    for i, h in enumerate(hits, 1):
        lines.append(f"\n({i}) Q: {h['question']}\n    A: {h['answer']}")
    return "\n".join(lines)


if __name__ == "__main__":
    # CLI: python globalbiz_rag_retrieve.py "your question"
    import sys
    if len(sys.argv) < 2:
        print('Usage: python globalbiz_rag_retrieve.py "your question"')
        sys.exit(1)
    q = " ".join(sys.argv[1:])
    hits = retrieve(q, top_k=3)
    print(f"[query] {q}\n")
    print(f"[results] {len(hits)} hit(s)")
    for h in hits:
        print(f"\n  {h['id']} (score={h['score']}) [{h['section']}]")
        print(f"  Q: {h['question']}")
        print(f"  A: {h['answer'][:160]}{'...' if len(h['answer'])>160 else ''}")
    print("\n--- LLM context injection ---")
    print(format_context(hits))
