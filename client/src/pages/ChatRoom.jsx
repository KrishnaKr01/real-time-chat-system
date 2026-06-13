import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import MessageBubble from "../components/MessageBubble";
import styles from "./ChatRoom.module.css";

export default function ChatRoom({ username, room, onLeave }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const [presenceMsg, setPresenceMsg] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const LIMIT = 30;

  // Load message history (REST fallback)
  const loadHistory = useCallback(async (p = 1) => {
    setLoadingHistory(true);
    try {
      const { data } = await axios.get(`/api/messages/${room}?page=${p}&limit=${LIMIT}`);
      if (p === 1) {
        setMessages(data.messages);
      } else {
        setMessages((prev) => [...data.messages, ...prev]);
      }
      setHasMore(p < data.totalPages);
    } catch {
      console.error("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  }, [room]);

  // Connect socket + join room
  useEffect(() => {
    if (!socket) return;
    socket.connect();
    socket.emit("join_room", { room, username });

    // Load initial history
    loadHistory(1);

    // Incoming message
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Presence
    socket.on("user_presence", ({ users, message }) => {
      setOnlineCount(users);
      setPresenceMsg(message);
      setTimeout(() => setPresenceMsg(""), 3000);
    });

    // Typing
    socket.on("user_typing", ({ username: u }) => {
      setTypingUser(u);
    });
    socket.on("user_stop_typing", () => setTypingUser(""));

    return () => {
      socket.off("receive_message");
      socket.off("user_presence");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.disconnect();
    };
  }, [socket, room, username, loadHistory]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || !socket) return;
    socket.emit("send_message", { room, username, message: msg });
    socket.emit("stop_typing", { room });
    setInput("");
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socket) return;
    socket.emit("typing", { room, username });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", { room });
    }, 1500);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadHistory(next);
  };

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.left}>
          <button className={styles.back} onClick={onLeave}>← Back</button>
          <div>
            <h2 className={styles.roomName}># {room}</h2>
            <span className={styles.online}>
              <span className={styles.dot} /> {onlineCount} online
            </span>
          </div>
        </div>
        <span className={styles.user}>@{username}</span>
      </header>

      {/* Messages */}
      <div className={styles.messages}>
        {hasMore && (
          <button className={styles.loadMore} onClick={loadMore} disabled={loadingHistory}>
            {loadingHistory ? "Loading..." : "Load older messages"}
          </button>
        )}

        {presenceMsg && <div className={styles.presence}>{presenceMsg}</div>}

        {messages.map((msg, i) => (
          <MessageBubble
            key={msg._id || i}
            msg={msg}
            isMine={msg.username === username}
          />
        ))}

        {typingUser && (
          <div className={styles.typing}>{typingUser} is typing...</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form className={styles.inputBar} onSubmit={sendMessage}>
        <input
          className={styles.input}
          type="text"
          placeholder={`Message #${room}...`}
          value={input}
          onChange={handleTyping}
          maxLength={2000}
          autoFocus
        />
        <button className={styles.sendBtn} type="submit" disabled={!input.trim()}>
          Send ↑
        </button>
      </form>
    </div>
  );
}
