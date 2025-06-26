import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const ChatApp = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [userToAdd, setUserToAdd] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState('custom');
  const [chatAllowed, setChatAllowed] = useState(true);

  const messagesEndRef = useRef(null);

  const token = Cookies.get('token');
  const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  useEffect(() => {
    if (!token) {
      alert("User not authenticated. Please login.");
      setChatAllowed(false);
      return;
    }
    checkChatSupport();
  }, [token]);
const deleteMessage = async (msgId) => {
  const userId = localStorage.getItem('user_id');
  if (!window.confirm('Delete this message?')) return;

  try {
    await api.delete(`/chat-messages/${msgId}`, {
      data: { user_id: userId }, // DELETE body
    });

    setMessages(prev => prev.filter(m => m.id !== msgId));
  } catch (err) {
    console.error('[deleteMessage] Error:', err);
    alert('Failed to delete message. Make sure you are the sender.');
  }
};

  const checkChatSupport = async () => {
    try {
      const res = await api.get('/chat/support-check');
      if (!res.data.allowed) {
        setChatAllowed(false);
        alert("Chat is not available for your account (Missing Addon).");
        return;
      }
      fetchGroups();
    } catch (err) {
      console.error('[checkChatSupport] Error:', err);
      alert("Authentication failed or session expired. Please login again.");
      setChatAllowed(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/chat/groups');
      setGroups(res.data.groups);
      if (res.data.groups.length) {
        setSelectedGroup(res.data.groups[0]);
        fetchMessages(res.data.groups[0].id);
      } else {
        setSelectedGroup(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('[fetchGroups] Error:', err);
      alert('Failed to load chat groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (groupId) => {
    try {
      const res = await api.get(`/chat-messages/${groupId}`);
      setMessages(res.data.messages);
      scrollToBottom();
    } catch (err) {
      console.error('[fetchMessages] Error:', err);
      alert('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMsg && !attachment) return alert('Enter a message or select an attachment');

    const storedUserId = localStorage.getItem('user_id');
    if (!storedUserId) return alert('User ID not found in localStorage. Please set user_id.');

    try {
      const formData = new FormData();
      formData.append('group_id', selectedGroup.id);
      formData.append('user_id', storedUserId);
      if (newMsg) formData.append('message', newMsg);
      if (attachment) formData.append('attachment', attachment);

      const res = await api.post('/chat-messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessages(prev => [...prev, res.data.data]);
      setNewMsg('');
      setAttachment(null);
      scrollToBottom();
    } catch (err) {
      console.error('[sendMessage] Error:', err);
      alert('Failed to send message');
    }
  };

  const addUserToGroup = async () => {
    if (!userToAdd) return alert('Enter user ID');
    try {
      await api.post(`/chat/groups/${selectedGroup.id}/add-user`, { user_id: userToAdd });
      alert('User added!');
      setUserToAdd('');
      fetchGroups();
    } catch (err) {
      console.error('[addUserToGroup] Error:', err);
      alert('Failed to add user');
    }
  };

  const removeUserFromGroup = async (userId) => {
    if (!window.confirm('Remove this user?')) return;
    try {
      await api.post(`/chat/groups/${selectedGroup.id}/remove-user`, { user_id: userId });
      alert('User removed!');
      fetchGroups();
    } catch (err) {
      console.error('[removeUserFromGroup] Error:', err);
      alert('Failed to remove user');
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return alert('Group name cannot be empty');
    try {
      setLoading(true);
      await api.post('/chat/groups', {
        name: newGroupName.trim(),
        type: newGroupType,
        user_ids: [],
      });
      alert('Group created!');
      setCreatingGroup(false);
      setNewGroupName('');
      setNewGroupType('custom');
      fetchGroups();
    } catch (err) {
      console.error('[createGroup] Error:', err);
      alert('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!chatAllowed) return <div style={{ padding: 20, color: 'red' }}>Chat feature is not available.</div>;

  if (!token) return <div style={{ padding: 20, color: 'red' }}>Please login to access the chat.</div>;
  return (
  <div style={styles.appContainer}>
    <div style={styles.sidebar}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2>Chat Groups</h2>
        <button onClick={() => setCreatingGroup(true)} style={styles.createGroupBtn}>
          + Create Group
        </button>
      </div>

      {loading && <p>Loading groups...</p>}
      <ul style={styles.groupList}>
        {groups.map(g => (
          <li
            key={g.id}
            style={{ ...styles.groupItem, ...(selectedGroup?.id === g.id ? styles.selectedGroup : {}) }}
            onClick={() => {
              setSelectedGroup(g);
              fetchMessages(g.id);
            }}
          >
            {g.name || `Group #${g.id}`} ({g.users.length} users)
          </li>
        ))}
      </ul>

      {selectedGroup && (
        <>
          <h3>Group Users</h3>
          <ul style={styles.userList}>
            {selectedGroup.users.map(user => (
              <li key={user.id} style={styles.userItem}>
                {user.name} ({user.email})
                <button
                  style={styles.removeUserBtn}
                  onClick={() => removeUserFromGroup(user.id)}
                  title="Remove user"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 10 }}>
            <input
              type="number"
              placeholder="User ID to add"
              value={userToAdd}
              onChange={e => setUserToAdd(e.target.value)}
              style={styles.userInput}
            />
            <button onClick={addUserToGroup} style={styles.addUserBtn}>
              Add User (Only from the customer)
            </button>
          </div>
        </>
      )}

      {creatingGroup && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Create New Group</h3>
            <input
              type="text"
              placeholder="Group Name"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              style={styles.modalInput}
            />
            <select
              value={newGroupType}
              onChange={e => setNewGroupType(e.target.value)}
              style={styles.modalInput}
            >
              <option value="custom">Custom</option>
              <option value="tenant">Tenant</option>
            </select>
            <div style={{ marginTop: 15, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setCreatingGroup(false)} style={styles.modalCancelBtn}>
                Cancel
              </button>
              <button onClick={createGroup} style={styles.modalCreateBtn}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    <div style={styles.chatContainer}>
      <h2>{selectedGroup?.name || 'Select a group'}</h2>

      <div style={styles.messagesContainer}>
        {messages.map(msg => {
          const isSender = msg.user_id === parseInt(localStorage.getItem('user_id'));
          return (
            <div
              key={msg.id}
              style={{
                ...styles.message,
                alignSelf: isSender ? 'flex-end' : 'flex-start',
                backgroundColor: isSender ? '#d1f5d3' : '#eee',
                position: 'relative',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{msg.user?.name || 'Unknown'}</div>
              <div>{msg.message}</div>
              {msg.attachment && (
                <a
                  href={`http://localhost:8000/storage/${msg.attachment}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.attachmentLink}
                >
                  View Attachment
                </a>
              )}
              <small style={styles.msgDate}>{new Date(msg.created_at).toLocaleString()}</small>

              {isSender && (
                <button
                  onClick={() => deleteMessage(msg.id)}
                  title="Delete this message"
                   style={styles.deleteBtn}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Write a message..."
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          style={styles.messageInput}
          onKeyDown={e => {
            if (e.key === 'Enter') sendMessage();
          }}
        />
        <input
          type="file"
          onChange={e => setAttachment(e.target.files[0])}
          style={styles.fileInput}
          accept=".jpg,.jpeg,.png,.pdf,.docx,.txt"
        />
        <button onClick={sendMessage} style={styles.sendBtn}>
          Send
        </button>
      </div>
    </div>
  </div>
);
}
// Inline styles unchanged
const styles = {
  appContainer: {
    display: 'flex',
    height: '90vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#e5ddd5', // WhatsApp background color
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  },
  deleteBtn: {
  position: 'absolute',
  top: 0.1,
  right: 10,
  background: 'none',
  border: 'none',
  color: '#888',
  fontSize: 16,
  cursor: 'pointer',
  padding: 4,
  borderRadius: '50%',
  transition: 'color 0.3s ease',
}
,
  sidebar: {
    width: 320,
    backgroundColor: '#fff',
    borderRight: '1px solid #ddd',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  createGroupBtn: {
    backgroundColor: '#25D366', // WhatsApp green
    color: 'white',
    border: 'none',
    borderRadius: 24,
    padding: '10px 18px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: 14,
    boxShadow: '0 4px 8px rgba(37, 211, 102, 0.4)',
    transition: 'background-color 0.3s ease',
  },
  createGroupBtnHover: {
    backgroundColor: '#1ebe5b',
  },
  groupList: {
    listStyle: 'none',
    padding: 0,
    marginTop: 20,
    flexGrow: 1,
    overflowY: 'auto',
  },
  groupItem: {
    padding: 14,
    marginBottom: 12,
    cursor: 'pointer',
    borderRadius: 8,
    border: '1px solid transparent',
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background-color 0.25s ease',
  },
  groupItemHover: {
    backgroundColor: '#f2f2f2',
  },
  selectedGroup: {
    backgroundColor: '#25D366',
    color: 'white',
    borderColor: '#1ebe5b',
  },
  userList: {
    listStyle: 'none',
    padding: 0,
    maxHeight: 160,
    overflowY: 'auto',
    border: '1px solid #ccc',
    borderRadius: 12,
    marginTop: 18,
    backgroundColor: '#fafafa',
  },
  userItem: {
    padding: '10px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  removeUserBtn: {
    background: '#ff4d4f',
    border: 'none',
    color: 'white',
    borderRadius: '50%',
    width: 26,
    height: 26,
    fontWeight: 'bold',
    cursor: 'pointer',
    lineHeight: '24px',
    boxShadow: '0 2px 6px rgba(255,77,79,0.6)',
    transition: 'background-color 0.3s ease',
  },
  userInput: {
    padding: '10px 14px',
    width: '68%',
    borderRadius: 20,
    border: '1px solid #ccc',
    fontSize: 14,
    color: '#222',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  addUserBtn: {
    padding: '10px 18px',
    borderRadius: 20,
    border: 'none',
    backgroundColor: '#25D366',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: 14,
    boxShadow: '0 4px 10px rgba(37, 211, 102, 0.5)',
    transition: 'background-color 0.3s ease',
  },
  chatContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: 24,
    backgroundColor: '#ece5dd',
  },
  messagesContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '20px 12px',
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: 'inset 0 0 15px #ccc',
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  message: {
    maxWidth: '70%',
    padding: 14,
    borderRadius: 18,
    fontSize: 15,
    lineHeight: 1.4,
    wordBreak: 'break-word',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  messageSent: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6', // WhatsApp sent bubble green
    color: '#000',
    borderBottomRightRadius: 4,
  },
  messageReceived: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    color: '#000',
    borderBottomLeftRadius: 4,
    border: '1px solid #ddd',
  },
  attachmentLink: {
    display: 'inline-block',
    marginTop: 8,
    fontSize: 13,
    color: '#075E54',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  msgDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  inputContainer: {
    display: 'flex',
    gap: 12,
    paddingTop: 12,
    borderTop: '1px solid #ddd',
  },
  messageInput: {
    flexGrow: 1,
    padding: 14,
    borderRadius: 20,
    border: '1px solid #ccc',
    fontSize: 16,
    outline: 'none',
    color: '#222',
    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)',
    transition: 'border-color 0.3s ease',
  },
  fileInput: {
    cursor: 'pointer',
    borderRadius: 20,
    padding: '6px 12px',
    border: '1px solid #ccc',
    backgroundColor: '#f9f9f9',
    transition: 'background-color 0.3s ease',
  },
  sendBtn: {
    padding: '12px 28px',
    backgroundColor: '#25D366',
    border: 'none',
    color: 'white',
    borderRadius: 24,
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: 16,
    boxShadow: '0 5px 15px rgba(37, 211, 102, 0.7)',
    transition: 'background-color 0.3s ease',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
  },
  modal: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 20,
    width: 360,
    boxShadow: '0 12px 28px rgba(0,0,0,0.35)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalInput: {
    width: '100%',
    padding: 14,
    marginTop: 14,
    borderRadius: 20,
    border: '1.5px solid #ccc',
    fontSize: 16,
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  modalCancelBtn: {
    backgroundColor: '#999',
    border: 'none',
    padding: '12px 20px',
    borderRadius: 20,
    cursor: 'pointer',
    fontWeight: '600',
    color: 'white',
    transition: 'background-color 0.3s ease',
  },
  modalCreateBtn: {
    backgroundColor: '#25D366',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: 20,
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: 16,
    boxShadow: '0 6px 20px rgba(37, 211, 102, 0.7)',
    transition: 'background-color 0.3s ease',
  },
};


export default ChatApp;
