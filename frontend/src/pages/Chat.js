import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import socketService from '../services/socket';

function Chat({ user }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await chatAPI.getRooms();
        setRooms(response.data);
        // Auto-select user's university room
        const userRoom = response.data.find(r => r.id === user.university);
        if (userRoom) {
          setSelectedRoom(userRoom);
        }
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
      }
    };
    fetchRooms();

    // Connect to socket
    socketService.connect();

    return () => {
      if (selectedRoom) {
        socketService.leaveRoom(selectedRoom.id, user.username);
      }
      socketService.disconnect();
    };
  }, [user.university, user.username, selectedRoom]);

  useEffect(() => {
    if (selectedRoom) {
      // Fetch messages for the selected room
      const fetchMessages = async () => {
        try {
          const response = await chatAPI.getMessages(selectedRoom.id);
          setMessages(response.data);
        } catch (err) {
          console.error('Failed to fetch messages:', err);
        }
      };
      fetchMessages();

      // Join the room
      socketService.joinRoom(selectedRoom.id, user.id, user.username);

      // Listen for new messages
      socketService.onReceiveMessage((message) => {
        setMessages(prev => [...prev, message]);
      });

      socketService.onUserJoined((data) => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          username: 'System',
          message: data.message,
          timestamp: new Date().toISOString(),
          isSystem: true
        }]);
      });

      socketService.onUserLeft((data) => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          username: 'System',
          message: data.message,
          timestamp: new Date().toISOString(),
          isSystem: true
        }]);
      });

      return () => {
        socketService.removeAllListeners();
      };
    }
  }, [selectedRoom, user.id, user.username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRoomSelect = (room) => {
    if (selectedRoom) {
      socketService.leaveRoom(selectedRoom.id, user.username);
    }
    setSelectedRoom(room);
    setMessages([]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedRoom) {
      socketService.sendMessage(selectedRoom.id, user.id, user.username, newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
          <h1>University Chat Rooms</h1>
          <p style={{ color: '#666', marginTop: '8px' }}>
            Connect with students from Swiss universities
          </p>
        </div>
        <div className="chat-container">
          <div className="chat-sidebar">
            <h3 style={{ marginBottom: '16px' }}>Available Rooms</h3>
            {rooms.map(room => (
              <div
                key={room.id}
                className={`room-card ${selectedRoom?.id === room.id ? 'active' : ''}`}
                onClick={() => handleRoomSelect(room)}
              >
                <h4>{room.name}</h4>
                <p style={{ fontSize: '14px', marginTop: '4px', opacity: 0.8 }}>
                  {room.location} • {room.memberCount} members
                </p>
              </div>
            ))}
          </div>

          <div className="chat-main">
            {selectedRoom ? (
              <>
                <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
                  <h2>{selectedRoom.name}</h2>
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                    {selectedRoom.location}
                  </p>
                </div>
                <div className="chat-messages">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={`chat-message ${msg.userId === user.id ? 'own' : ''}`}
                      style={msg.isSystem ? { background: '#e3f2fd', color: '#1976d2', textAlign: 'center', alignSelf: 'center', maxWidth: '100%' } : {}}
                    >
                      {!msg.isSystem && msg.userId !== user.id && (
                        <strong style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                          {msg.username}
                        </strong>
                      )}
                      <div>{msg.message}</div>
                      <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="chat-input-container">
                  <input
                    type="text"
                    className="input chat-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                  />
                  <button type="submit" className="button">Send</button>
                </form>
              </>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                <h2>Select a chat room to start</h2>
                <p style={{ marginTop: '12px' }}>Choose a university chat room from the sidebar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
