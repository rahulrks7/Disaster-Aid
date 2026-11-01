const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Join user specific room
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket] User ${userId} joined room user:${userId}`);
      }
    });

    // Join role specific room (e.g. 'role:admin', 'role:volunteer')
    socket.on('join_role_room', (role) => {
      if (role) {
        socket.join(`role:${role}`);
        console.log(`[Socket] Socket ${socket.id} joined role:${role}`);
      }
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

// Helper notification emitter
const notifyUser = (userId, notification) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit('notification:new', notification);
  }
};

const notifyRole = (role, event, data) => {
  if (io && role) {
    io.to(`role:${role}`).emit(event, data);
  }
};

const broadcastEvent = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  notifyUser,
  notifyRole,
  broadcastEvent,
};
