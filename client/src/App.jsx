import { useState } from "react";
import { SocketProvider } from "./context/SocketContext";
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import ChatRoom from "./pages/ChatRoom";

export default function App() {
  const [username, setUsername] = useState("");
  const [currentRoom, setCurrentRoom] = useState(null);

  // Screen: login → lobby → chat
  if (!username) {
    return (
      <SocketProvider>
        <Login onLogin={setUsername} />
      </SocketProvider>
    );
  }

  if (!currentRoom) {
    return (
      <SocketProvider>
        <Lobby username={username} onJoin={setCurrentRoom} onLogout={() => setUsername("")} />
      </SocketProvider>
    );
  }

  return (
    <SocketProvider>
      <ChatRoom
        username={username}
        room={currentRoom}
        onLeave={() => setCurrentRoom(null)}
      />
    </SocketProvider>
  );
}
