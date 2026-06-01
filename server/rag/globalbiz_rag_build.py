#!/usr/bin/env python3
"""
Global Business AI program RAG index builder.

Input:  rag_chunks.jsonl  (one JSON per line with id/section/question/answer/keywords/embedding_text)
Output: chunks.json       (lightweight metadata for retrieval)
        embeddings.npy    (normalized float32 matrix, shape (N, D))

Embedding model: Ollama bge-m3 @ http://127.0.0.1:11436
Pattern adopted from /home/ai_master/cha_rag/cha_rag_build.py to keep parity.
Completely isolated from cha_rag — different directory, different files.
"""

import json
import sys
import time
from pathlib import Path

import numpy as np
import requests

OLLAMA_URL = "http://127.0.0.1:11436/api/embeddings"
MODEL = "bge-m3"

HERE = Path(__file__).resolve().parent
CHUNKS_FILE = HERE / "rag_chunks.jsonl"
OUT_CHUNKS = HERE / "chunks.json"
OUT_EMBED = HERE / "embeddings.npy"


def embed(text: str) -> np.ndarray:
    """Embed one text via Ollama, return normalized float32 vector."""
    r = requests.post(
        OLLAMA_URL,
        json={"model": MODEL, "prompt": text},
        timeout=30,
    )
    r.raise_for_status()
    vec = np.array(r.json()["embedding"], dtype=np.float32)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec


def main() -> int:
    if not CHUNKS_FILE.exists():
        print(f"[error] {CHUNKS_FILE} not found", file=sys.stderr)
        return 1

    chunks = []
    with CHUNKS_FILE.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                chunks.append(json.loads(line))

    print(f"[info] loaded {len(chunks)} chunks")

    vectors = []
    t0 = time.time()
    for i, c in enumerate(chunks, 1):
        # Prefer explicit embedding_text; fall back to Q+A concatenation
        text = c.get("embedding_text") or (c["question"] + " " + c["answer"])
        v = embed(text)
        vectors.append(v)
        print(f"  [{i:02d}/{len(chunks)}] {c['id']:32s} [{c['section']}] (dim={len(v)})")

    elapsed = time.time() - t0
    arr = np.stack(vectors)  # shape: (N, D)

    # Strip embedding_text from runtime metadata to save bytes
    meta = []
    for c in chunks:
        meta.append({
            "id": c["id"],
            "section": c["section"],
            "question": c["question"],
            "answer": c["answer"],
            "keywords": c.get("keywords", []),
        })

    OUT_CHUNKS.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    np.save(OUT_EMBED, arr)

    print(f"\n[done] embeddings {arr.shape} -> {OUT_EMBED.name}")
    print(f"[done] metadata {len(meta)} -> {OUT_CHUNKS.name}")
    print(f"[time] {elapsed:.1f}s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
