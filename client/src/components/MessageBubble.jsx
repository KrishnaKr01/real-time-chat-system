import styles from "./MessageBubble.module.css";

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageBubble({ msg, isMine }) {
  return (
    <div className={`${styles.wrapper} ${isMine ? styles.mine : styles.theirs}`}>
      {!isMine && <span className={styles.avatar}>{msg.username[0].toUpperCase()}</span>}
      <div className={styles.content}>
        {!isMine && <span className={styles.username}>{msg.username}</span>}
        <div className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleTheirs}`}>
          {msg.message}
        </div>
        <span className={styles.time}>{formatTime(msg.createdAt)}</span>
      </div>
    </div>
  );
}
