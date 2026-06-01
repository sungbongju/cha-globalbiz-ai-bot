-- ============================================================================
-- cha_globalbiz_ai — Global Business AI Bot Database Schema
-- ============================================================================
-- Target server: 106.247.236.2:3306 (CHA Big Data Server)
-- Owner: user2
-- Purpose: store users, chat history, surveys for the Global Business AI
--          program homepage (https://cha-globalbiz-ai-bot.vercel.app)
--
-- Convention: English column names, snake_case
-- Charset: utf8mb4 (full Unicode incl. emoji, all languages)
-- Engine: InnoDB (transactions, FK)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS cha_globalbiz_ai
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE cha_globalbiz_ai;

-- ---------------------------------------------------------------------------
-- users — Registered visitors (international students, prospective applicants)
-- ---------------------------------------------------------------------------
-- Email-OTP based auth. No password stored. On signup we send a 6-digit code
-- to the email; once verified, status becomes 'verified' and OTP fields are
-- cleared.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email           VARCHAR(254) NOT NULL,                                    -- RFC 5321 max
  display_name    VARCHAR(120) NOT NULL,
  department      VARCHAR(120) DEFAULT NULL,                                -- e.g. "Business Administration"
  country         VARCHAR(80)  DEFAULT NULL,                                -- e.g. "Vietnam", "South Korea"
  affiliation     VARCHAR(120) DEFAULT NULL,                                -- e.g. "Prospective student", "CHA Univ"
  status          ENUM('pending','verified','blocked') NOT NULL DEFAULT 'pending',
  otp_code        CHAR(6)      DEFAULT NULL,                                -- current 6-digit code, NULL when verified
  otp_expires_at  DATETIME     DEFAULT NULL,
  otp_attempts    TINYINT UNSIGNED NOT NULL DEFAULT 0,                      -- failed verify counter (rate-limit)
  consent_privacy TINYINT(1)   NOT NULL DEFAULT 0,                          -- privacy policy accepted
  consent_research TINYINT(1)  NOT NULL DEFAULT 0,                          -- data may be used for research
  ip_signup       VARCHAR(45)  DEFAULT NULL,                                -- IPv6-ready
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at     DATETIME     DEFAULT NULL,
  last_login_at   DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_email (email),
  KEY idx_status (status),
  KEY idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------------
-- chat_sessions — One row per user "conversation" (across a mode)
-- ---------------------------------------------------------------------------
-- mode: ttt  = text-to-text (typing chat)
--       sts  = speech-to-speech (voice in/out)
--       ftf  = face-to-face (HeyGen LiveAvatar streaming)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_sessions (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED NOT NULL,
  mode            ENUM('ttt','sts','ftf') NOT NULL,
  language        VARCHAR(8) NOT NULL DEFAULT 'en',                         -- en | ko | …
  user_agent      VARCHAR(255) DEFAULT NULL,
  ip              VARCHAR(45) DEFAULT NULL,
  started_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at        DATETIME DEFAULT NULL,
  message_count   INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_user (user_id),
  KEY idx_started (started_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------------
-- chat_messages — Every user/assistant turn
-- ---------------------------------------------------------------------------
-- retrieved_chunks: JSON array of RAG chunk metadata that was injected into
-- the prompt for this turn. Stored for post-hoc analysis (which chunks help?).
-- Format: [{"id":"faculty_park", "score":0.78}, ...]
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id        BIGINT UNSIGNED NOT NULL,
  role              ENUM('user','assistant','system') NOT NULL,
  content           MEDIUMTEXT NOT NULL,
  retrieved_chunks  JSON DEFAULT NULL,                                      -- RAG hits used for this turn
  latency_ms        INT UNSIGNED DEFAULT NULL,                              -- LLM round-trip time (assistant rows)
  created_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_session (session_id),
  KEY idx_created (created_at),
  CONSTRAINT fk_messages_session FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------------
-- surveys — Post-interaction learner perception survey (v2_edu_en)
-- ---------------------------------------------------------------------------
-- 14-item Likert (1=Strongly Disagree … 7=Strongly Agree)
-- Items grouped into 6 constructs (see docs/survey_v2_edu_en.md):
--   q1-q3  : Information Quality
--   q4-q5  : Ease of Use
--   q6-q8  : Learning Helpfulness
--   q9-q10 : Trust
--   q11-q12: Intention to Use
--   q13-q14: Overall Satisfaction
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS surveys (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED NOT NULL,
  session_id      BIGINT UNSIGNED DEFAULT NULL,                             -- which conversation triggered this
  mode            ENUM('ttt','sts','ftf') DEFAULT NULL,                     -- mode used when surveyed
  q1  TINYINT UNSIGNED DEFAULT NULL,
  q2  TINYINT UNSIGNED DEFAULT NULL,
  q3  TINYINT UNSIGNED DEFAULT NULL,
  q4  TINYINT UNSIGNED DEFAULT NULL,
  q5  TINYINT UNSIGNED DEFAULT NULL,
  q6  TINYINT UNSIGNED DEFAULT NULL,
  q7  TINYINT UNSIGNED DEFAULT NULL,
  q8  TINYINT UNSIGNED DEFAULT NULL,
  q9  TINYINT UNSIGNED DEFAULT NULL,
  q10 TINYINT UNSIGNED DEFAULT NULL,
  q11 TINYINT UNSIGNED DEFAULT NULL,
  q12 TINYINT UNSIGNED DEFAULT NULL,
  q13 TINYINT UNSIGNED DEFAULT NULL,
  q14 TINYINT UNSIGNED DEFAULT NULL,
  comments        TEXT DEFAULT NULL,
  submitted_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user (user_id),
  KEY idx_submitted (submitted_at),
  CONSTRAINT fk_surveys_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_surveys_session FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------------
-- auth_tokens — Short-lived session tokens after OTP verification
-- ---------------------------------------------------------------------------
-- After OTP verification we issue a long-random token, send it back to the
-- browser as a cookie or localStorage entry, and use it to authenticate
-- subsequent /chat and /survey calls (no per-request OTP).
-- Tokens auto-expire after 30 days.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_tokens (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED NOT NULL,
  token         CHAR(64) NOT NULL,                                          -- 256-bit hex, e.g. crypto.randomBytes(32).toString('hex')
  ip            VARCHAR(45) DEFAULT NULL,
  user_agent    VARCHAR(255) DEFAULT NULL,
  issued_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at    DATETIME NOT NULL,
  revoked_at    DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_token (token),
  KEY idx_user (user_id),
  KEY idx_expires (expires_at),
  CONSTRAINT fk_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------------
-- Convenience view — sessions with user info
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_sessions_overview AS
SELECT
  s.id              AS session_id,
  s.mode,
  s.language,
  s.started_at,
  s.ended_at,
  s.message_count,
  u.email,
  u.display_name,
  u.country,
  u.department
FROM chat_sessions s
JOIN users u ON u.id = s.user_id
ORDER BY s.started_at DESC;
