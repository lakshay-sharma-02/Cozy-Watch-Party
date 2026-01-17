const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for development
    methods: ["GET", "POST"]
  }
});

// Store room participants
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, userName }) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('user-connected', { userId: socket.id, userName });
    
    // Send existing participants to the joiner (simplified for 2 people)
    const clients = io.sockets.adapter.rooms.get(roomId);
    if (clients) {
       // logic to send back existing users if needed, 
       // but for P2P usually the existing user initiates the call upon seeing 'user-connected'
    }
  });

  // Signaling for WebRTC
  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', {
      offer: data.offer,
      senderId: socket.id,
      senderName: data.senderName
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', {
      answer: data.answer,
      senderId: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', {
      candidate: data.candidate,
      senderId: socket.id
    });
  });

  // Game State Sync
  socket.on('game-state-update', ({ roomId, newState }) => {
    socket.to(roomId).emit('game-state-update', newState);
  });
  
  socket.on('card-played', ({ roomId, card, nextPlayerId }) => {
    socket.to(roomId).emit('card-played', { card, nextPlayerId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Notify all rooms this socket was in
    // In a real app we'd track per-room, but socket.rooms is cleared on disconnect
    // So usually we maintain our own mapping if needed. 
    // For now we rely on the peer connection failing to detect disconnect or simple broadcast if we tracked it.
    io.emit('user-disconnected', socket.id); 
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
