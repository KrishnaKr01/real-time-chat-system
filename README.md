<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6591dd61-a73f-46d4-a7c5-8362f1bc9797" />
# 💬 Real-Time Chat System

A full-stack real-time multi-room chat application built with the MERN stack and Socket.io.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React.js + Vite, CSS Modules |
| Backend | Node.js, Express.js |
| Real-time | Socket.io (WebSockets) |
| Database | MongoDB (local) + Mongoose |
| REST fallback | Express REST API for message history |

## Features

- ✅ Multi-room chat (join / create rooms)
- ✅ Real-time messaging via Socket.io WebSockets
- ✅ Persistent message logging to MongoDB
- ✅ REST API fallback for message history on reconnect (paginated)
- ✅ Live user presence notifications (join/leave)
- ✅ Typing indicators
- ✅ Load older messages (pagination)
- ✅ Dark glassmorphism UI

## Project Structure

```
chat-app/
├── server/          # Node.js + Express + Socket.io backend
│   ├── models/      # Mongoose schemas (Message, Room)
│   ├── routes/      # REST API routes
│   ├── index.js     # Entry point
│   └── .env         # Environment variables
└── client/          # React + Vite frontend
    └── src/
        ├── pages/       # Login, Lobby, ChatRoom
        ├── components/  # MessageBubble
        └── context/     # SocketContext
```

## Setup & Run

### Prerequisites
- Node.js v18+
- MongoDB running locally on port 27017

### 1. Start MongoDB
```bash
mongod
```

### 2. Backend
```bash
cd server
npm install
npm run dev        # runs on http://localhost:5000
```

### 3. Frontend
```bash
cd client
npm install
npm run dev        # runs on http://localhost:5173
```

Open **http://localhost:5173** in two browser tabs to test real-time messaging!

## Environment Variables (`server/.env`)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/chatapp
CLIENT_URL=http://localhost:5173
```
