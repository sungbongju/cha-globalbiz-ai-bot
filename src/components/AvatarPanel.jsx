import styles from './AvatarPanel.module.css'

// FTF-only avatar panel ported from cha-interview-bot-liveavatar.
// Renders the LiveKit avatar video + audio elements and exposes the
// same refs/props the session logic in Assistant.jsx attaches tracks to.
const STATUS_MAP = {
  idle:       { label: 'Idle',         dot: 'gray'   },
  connecting: { label: 'Connecting…',  dot: 'yellow' },
  connected:  { label: 'Connected',    dot: 'green'  },
  speaking:   { label: 'Speaking',     dot: 'blue'   },
}

export default function AvatarPanel({
  status,
  videoRef,
  audioRef,
  videoReady,
  onStart,
  onStop,
  onInterrupt,
}) {
  const mappedStatus = STATUS_MAP[status] || STATUS_MAP.idle
  const dot = mappedStatus.dot
  const label = mappedStatus.label

  return (
    <div className={styles.panel}>
      <div className={`${styles.mediaStage}`}>
        {/* Avatar audio — attached as a hidden element (audio also gets a
            separate <audio> appended to body in the session logic). */}
        <audio ref={audioRef} autoPlay playsInline className={styles.hiddenMedia} />

        <div className={styles.videoWrap}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={styles.video}
            style={{ opacity: videoReady ? 1 : 0 }}
          />
          {!videoReady && (
            <div className={styles.placeholder}>
              <div className={styles.avatarIcon}>
                <span>AI</span>
              </div>
              <p className={styles.placeholderText}>GBA Assistant</p>
              <p className={styles.placeholderSub}>Global Business AI · CHA University</p>
            </div>
          )}

          {videoReady && (
            <div className={styles.nameplate}>
              <div className={styles.nameplateInner}>
                <span className={styles.nameplateName}>GBA Assistant</span>
                <span className={styles.nameplateSub}>Global Business AI · CHA University</span>
              </div>
            </div>
          )}

          {status === 'speaking' && <div className={styles.speakGlow} />}
        </div>
      </div>

      {/* Status badge / interrupt */}
      {status === 'speaking' ? (
        <button className={styles.interruptBtn} onClick={onInterrupt} type="button" aria-label="Stop talking">
          <span className={`${styles.dot} ${styles[dot]}`} />
          <span className={styles.pauseIcon}>||</span>
          <span className={styles.statusLabel}>Stop talking</span>
        </button>
      ) : (
        <div className={styles.statusRow}>
          <span className={`${styles.dot} ${styles[dot]}`} />
          <span className={styles.statusLabel}>{label}</span>
        </div>
      )}

      {/* Start / connecting / stop */}
      {status === 'idle' && (
        <button className={styles.startBtn} onClick={onStart}>
          <span className={styles.startBtnIcon}>▶</span>
          Start avatar
        </button>
      )}
      {status === 'connecting' && (
        <button className={styles.startBtn} disabled>
          <span className={styles.spinner} /> Connecting…
        </button>
      )}
      {(status === 'connected' || status === 'speaking') && (
        <button
          className={styles.stopBtn}
          onClick={() => {
            if (window.confirm('End the conversation? The chat will reset.')) onStop?.()
          }}
        >
          <span className={styles.startBtnIcon}>■</span>
          End conversation
        </button>
      )}
    </div>
  )
}
