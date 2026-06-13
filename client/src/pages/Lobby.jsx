import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Lobby.module.css";

const DEFAULT_ROOMS = ["general", "tech", "random", "gaming"];

export default function Lobby({ username, onJoin, onLogout }) {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get("/api/rooms");
      // Merge default rooms with DB rooms
      const dbNames = data.map((r) => r.name);
      const merged = [
        ...DEFAULT_ROOMS.filter((r) => !dbNames.includes(r)).map((name) => ({ name })),
        ...data,
      ];
      setRooms(merged);
    } catch {
      setRooms(DEFAULT_ROOMS.map((name) => ({ name })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const createRoom = async (e) => {
    e.preventDefault();
    const name = newRoom.trim().toLowerCase().replace(/\s+/g, "-");
    if (!name || rooms.find((r) => r.name === name)) return;
    await axios.post("/api/rooms", { name });
    setNewRoom("");
    fetchRooms();
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.logo}>💬 ChatApp</div>
        <div className={styles.user}>
          <span className={styles.dot} />
          <span>{username}</span>
          <button className={styles.logout} onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className={styles.main}>
        <h2 className={styles.heading}>Choose a Room</h2>
        <p className={styles.sub}>Pick an existing room or create your own</p>

        {loading ? (
          <p className={styles.loading}>Loading rooms...</p>
        ) : (
          <div className={styles.grid}>
            {rooms.map((room) => (
              <button
                key={room.name}
                className={styles.roomCard}
                onClick={() => onJoin(room.name)}
              >
                <span className={styles.roomHash}>#</span>
                <span className={styles.roomName}>{room.name}</span>
                <span className={styles.joinLabel}>Join →</span>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={createRoom} className={styles.createForm}>
          <input
            className={styles.input}
            type="text"
            placeholder="Create new room..."
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            maxLength={32}
          />
          <button className={styles.createBtn} type="submit" disabled={!newRoom.trim()}>
            + Create
          </button>
        </form>
      </main>
    </div>
  );
}
