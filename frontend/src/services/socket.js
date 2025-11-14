import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId, userId, username) {
    if (this.socket) {
      this.socket.emit('join-room', { roomId, userId, username });
    }
  }

  leaveRoom(roomId, username) {
    if (this.socket) {
      this.socket.emit('leave-room', { roomId, username });
    }
  }

  sendMessage(roomId, userId, username, message) {
    if (this.socket) {
      this.socket.emit('send-message', {
        roomId,
        userId,
        username,
        message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive-message', callback);
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

const socketService = new SocketService();
export default socketService;
