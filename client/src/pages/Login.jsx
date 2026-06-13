import { useState } from "react";
import styles from "./Login.module.css";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");

  const handle = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    onLogin(trimmed);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.icon}>💬</div>
        <h1 className={styles.title}>ChatApp</h1>
        <p className={styles.sub}>Real-time multi-room chat</p>
        <form onSubmit={handle} className={styles.form}>
          <input
            className={styles.input}
            type="text"
            placeholder="Enter your username..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            autoFocus
          />
          <button className={styles.btn} type="submit" disabled={name.trim().length < 2}>
            Join →
          </button>
        </form>
      </div>
    </div>
  );
}
