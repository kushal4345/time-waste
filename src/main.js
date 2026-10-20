// Main application entry point
import './style.css';
import { db, ref, push, onValue, set, onDisconnect, serverTimestamp, off, update } from './firebase.js';
import { uploadImage, compressImage } from './cloudinary.js';
import { initEmojiPicker } from './emoji.js';
import { VoiceCall } from './voice.js';

// ============================================
// STATE
// ============================================
let currentUser = '';
let currentRoom = '';
let voiceCall = null;
let selectedImageFile = null;
let isEmojiPickerOpen = false;
let typingTimeout = null;
let lastMessageDate = '';
let userEntryTimestamp = null;
let userHasLeft = false;

function formatTime12h(ts) {
  const d = new Date(ts || Date.now());
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

function sanitizeDbKey(key) {
  return String(key || '').replace(/[.#$[\]/]/g, '_');
}

// ============================================
// DOM ELEMENTS
// ============================================
const $ = (id) => document.getElementById(id);

const loginScreen = $('login-screen');
const chatScreen = $('chat-screen');
const usernameInput = $('username-input');
const roomInput = $('room-input');
const joinBtn = $('join-btn');
const leaveBtn = $('leave-btn');
const roomName = $('room-name');
const onlineCount = $('online-count');
const messagesList = $('messages-list');
const messagesContainer = $('messages-container');
const messageInput = $('message-input');
const sendBtn = $('send-btn');
const emojiBtn = $('emoji-btn');
const emojiPicker = $('emoji-picker');
const emojiGrid = $('emoji-grid');
const imageInput = $('image-input');
const imagePreview = $('image-preview');
const previewImg = $('preview-img');
const cancelImage = $('cancel-image');
const uploadProgress = $('upload-progress');
const uploadBar = $('upload-bar');
const voiceCallBtn = $('voice-call-btn');
const callModal = $('call-modal');
const callStatusText = $('call-status-text');
const callTimer = $('call-timer');
const muteBtn = $('mute-btn');
const endCallBtn = $('end-call-btn');
const speakerBtn = $('speaker-btn');
const incomingCallModal = $('incoming-call-modal');
const incomingCallerName = $('incoming-caller-name');
const acceptCallBtn = $('accept-call-btn');
const declineCallBtn = $('decline-call-btn');
const lightbox = $('lightbox');
const lightboxImg = $('lightbox-img');
const lightboxClose = $('lightbox-close');
const typingIndicator = $('typing-indicator');
const typingUser = $('typing-user');

// ============================================
// LOGIN
// ============================================
function validateInputs() {
  const nameValid = usernameInput.value.trim().length >= 1;
  const roomValid = roomInput.value.trim().length >= 1;
  joinBtn.disabled = !(nameValid && roomValid);
}

usernameInput.addEventListener('input', validateInputs);
roomInput.addEventListener('input', validateInputs);

function resetLoginCredentials() {
  if (usernameInput) usernameInput.value = '';
  if (roomInput) {
    roomInput.value = '';
    roomInput.type = 'password';
  }
  if (joinBtn) joinBtn.disabled = true;
  try {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  } catch (_) {
    window.location.hash = '';
  }
}

// Allow Enter key to join
roomInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !joinBtn.disabled) joinRoom();
});
usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') roomInput.focus();
});

joinBtn.addEventListener('click', joinRoom);

function joinRoom() {
  currentUser = usernameInput.value.trim();
  currentRoom = roomInput.value.trim().toLowerCase().replace(/\s+/g, '-');

  if (!currentUser || !currentRoom) return;

  loginScreen.classList.remove('active');
  chatScreen.classList.add('active');
  roomName.textContent = `# ${currentRoom}`;

  userHasLeft = false;

  const sessionKey = 'chat_entry_' + currentRoom + '_' + currentUser;
  const storedEntry = sessionStorage.getItem(sessionKey);
  if (storedEntry && !isNaN(Number(storedEntry))) {
    userEntryTimestamp = Number(storedEntry);
  } else {
    userEntryTimestamp = Date.now();
    sessionStorage.setItem(sessionKey, String(userEntryTimestamp));
  }
  const entryTimeStr = formatTime12h(userEntryTimestamp);

  const safeUserKey = sanitizeDbKey(currentUser);
  const sessionRef = ref(db, `user_sessions/${currentRoom}/${safeUserKey}`);
  set(sessionRef, {
    username: currentUser,
    room: currentRoom,
    enteredAt: userEntryTimestamp,
    enteredTimeStr: entryTimeStr,
    leftAt: null,
    leftTimeStr: null,
    status: 'online',
    lastActive: serverTimestamp()
  });
  onDisconnect(sessionRef).update({
    leftAt: serverTimestamp(),
    status: 'offline'
  });

  setupPresence();
  listenForMessages();
  listenForTyping();
  setupVoiceCall();

  // Focus message input
  setTimeout(() => messageInput.focus(), 300);

  // Send join message with entry time
  sendSystemMessage(`${currentUser} joined the room • Entered at ${entryTimeStr}`, {
    action: 'join',
    user: currentUser,
    enteredAt: userEntryTimestamp,
    enteredTimeStr: entryTimeStr
  });
}

// ============================================
// LEAVE ROOM
// ============================================
function recordAndSendUserLeave() {
  if (!currentRoom || !currentUser || userHasLeft) return;
  userHasLeft = true;

  const leftAt = Date.now();
  const leftTimeStr = formatTime12h(leftAt);
  const entryTimeStr = formatTime12h(userEntryTimestamp || leftAt);

  const leaveMsgText = `${currentUser} left the room • Left at ${leftTimeStr} (Entered at ${entryTimeStr})`;

  sendSystemMessage(leaveMsgText, {
    action: 'leave',
    user: currentUser,
    enteredAt: userEntryTimestamp || leftAt,
    enteredTimeStr: entryTimeStr,
    leftAt: leftAt,
    leftTimeStr: leftTimeStr
  });

  const safeUserKey = sanitizeDbKey(currentUser);
  try {
    const sessionRef = ref(db, `user_sessions/${currentRoom}/${safeUserKey}`);
    update(sessionRef, {
      leftAt: leftAt,
      leftTimeStr: leftTimeStr,
      status: 'offline',
      lastActive: serverTimestamp()
    });
  } catch (_) {}

  try {
    sessionStorage.removeItem('chat_entry_' + currentRoom + '_' + currentUser);
  } catch (_) {}
}

leaveBtn.addEventListener('click', () => {
  recordAndSendUserLeave();
  leaveRoom();
});

window.addEventListener('beforeunload', () => {
  if (currentRoom && currentUser && !userHasLeft) {
    recordAndSendUserLeave();
  }
});

function leaveRoom() {
  // Clean up presence
  const safeUserKey = sanitizeDbKey(currentUser);
  const presenceRef = ref(db, `presence/${currentRoom}/${safeUserKey}`);
  set(presenceRef, null);

  // Clean up typing
  const typingRef = ref(db, `typing/${currentRoom}/${safeUserKey}`);
  set(typingRef, null);

  // Clean up voice call
  if (voiceCall) {
    voiceCall.destroy();
    voiceCall = null;
  }

  // Clean up listeners
  off(ref(db, `messages/${currentRoom}`));
  off(ref(db, `presence/${currentRoom}`));
  off(ref(db, `typing/${currentRoom}`));

  // Reset state
  messagesList.innerHTML = '';
  lastMessageDate = '';
  currentUser = '';
  currentRoom = '';
  userEntryTimestamp = null;
  userHasLeft = false;

  // Clear URL hash to prevent room leak in browser history & address bar
  try {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  } catch (_) {
    window.location.hash = '';
  }

  // Security: Reset both name and room code fields completely
  resetLoginCredentials();

  // Switch screens
  chatScreen.classList.remove('active');
  loginScreen.classList.add('active');
  if (usernameInput) usernameInput.focus();
}

// Background & Inactivity Security Handler: Reset values when opening from background
let backgroundTimer = null;
const INACTIVITY_RESET_MS = 5 * 60 * 1000; // 5 minutes

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    backgroundTimer = Date.now();
  } else {
    const elapsed = backgroundTimer ? (Date.now() - backgroundTimer) : 0;
    backgroundTimer = null;

    if (!chatScreen.classList.contains('active')) {
      resetLoginCredentials();
    } else if (elapsed > INACTIVITY_RESET_MS) {
      recordAndSendUserLeave();
      leaveRoom();
    }
  }
});

// Handle Back/Forward Navigation & browser back button
window.addEventListener('pageshow', (event) => {
  if (!chatScreen.classList.contains('active')) {
    resetLoginCredentials();
  }
});

window.addEventListener('popstate', () => {
  if (chatScreen.classList.contains('active')) {
    recordAndSendUserLeave();
    leaveRoom();
  } else {
    resetLoginCredentials();
  }
});

// ============================================
// PRESENCE (Online Users)
// ============================================
function setupPresence() {
  const presenceRef = ref(db, `presence/${currentRoom}/${currentUser}`);
  const connectedRef = ref(db, '.info/connected');

  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === true) {
      set(presenceRef, { online: true, lastSeen: Date.now() });
      onDisconnect(presenceRef).remove();
    }
  });

  // Listen for presence changes
  const roomPresenceRef = ref(db, `presence/${currentRoom}`);
  onValue(roomPresenceRef, (snapshot) => {
    const users = snapshot.val();
    const count = users ? Object.keys(users).length : 0;
    onlineCount.textContent = `${count} online`;
  });
}

// ============================================
// MESSAGES
// ============================================
function listenForMessages() {
  const messagesRef = ref(db, `messages/${currentRoom}`);

  onValue(messagesRef, (snapshot) => {
    messagesList.innerHTML = '';
    lastMessageDate = '';
    const messages = snapshot.val();

    if (messages) {
      const sorted = Object.entries(messages)
        .map(([key, val]) => ({ id: key, ...val }))
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      sorted.forEach(msg => renderMessage(msg));
    }

    scrollToBottom();
  });
}

function renderMessage(msg) {
  // Date separator
  const msgDate = new Date(msg.timestamp || Date.now()).toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  });

  if (msgDate !== lastMessageDate) {
    lastMessageDate = msgDate;
    const sep = document.createElement('div');
    sep.className = 'date-separator';
    sep.innerHTML = `<span>${msgDate}</span>`;
    messagesList.appendChild(sep);
  }

  if (msg.type === 'system') {
    const div = document.createElement('div');
    div.className = 'system-message';
    div.innerHTML = `<span>${escapeHtml(msg.text)}</span>`;
    messagesList.appendChild(div);
    return;
  }

  const isOwn = msg.sender === currentUser;
  const div = document.createElement('div');
  div.className = `message ${isOwn ? 'own' : 'other'}`;

  const time = new Date(msg.timestamp || Date.now()).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  let content = '';

  if (msg.imageUrl) {
    content = `
      <div class="message-image-wrapper">
        ${!isOwn ? `<div class="message-sender">${escapeHtml(msg.sender)}</div>` : ''}
        <div class="message-bubble">
          <img src="${msg.imageUrl}" class="message-image" alt="Shared image" loading="lazy" />
          ${msg.text ? `<p style="margin-top:8px">${formatMessageText(msg.text)}</p>` : ''}
          <div class="message-time">${time}</div>
        </div>
      </div>
    `;
  } else {
    content = `
      ${!isOwn ? `<div class="message-sender">${escapeHtml(msg.sender)}</div>` : ''}
      <div class="message-bubble">
        <p>${formatMessageText(msg.text)}</p>
        <div class="message-time">${time}</div>
      </div>
    `;
  }

  div.innerHTML = content;

  // Image click handler for lightbox
  const img = div.querySelector('.message-image');
  if (img) {
    img.addEventListener('click', () => openLightbox(msg.imageUrl));
  }

  messagesList.appendChild(div);
}

function formatMessageText(text) {
  if (!text) return '';
  let escaped = escapeHtml(text);
  // Bold: *text*
  escaped = escaped.replace(/\*(.+?)\*/g, '<strong>$1</strong>');
  // Links
  escaped = escaped.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color:var(--accent-light);text-decoration:underline">$1</a>');
  return escaped;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function sendMessage() {
  const text = messageInput.value.trim();

  if (!text && !selectedImageFile) return;

  if (selectedImageFile) {
    sendImageMessage(text);
    return;
  }

  const messagesRef = ref(db, `messages/${currentRoom}`);
  push(messagesRef, {
    sender: currentUser,
    text: text,
    type: 'text',
    timestamp: Date.now()
  });

  messageInput.value = '';
  sendBtn.disabled = true;
  clearTyping();
}

async function sendImageMessage(caption = '') {
  uploadProgress.classList.remove('hidden');
  uploadBar.style.width = '0%';

  try {
    const compressed = await compressImage(selectedImageFile);
    const result = await uploadImage(compressed, (percent) => {
      uploadBar.style.width = `${percent}%`;
    });

    const messagesRef = ref(db, `messages/${currentRoom}`);
    push(messagesRef, {
      sender: currentUser,
      text: caption,
      imageUrl: result.thumbnail,
      fullImageUrl: result.url,
      type: 'image',
      timestamp: Date.now()
    });

    cancelImagePreview();
    messageInput.value = '';
    sendBtn.disabled = true;
    showToast('Image sent! 📸');
  } catch (error) {
    console.error('Upload error:', error);
    showToast('Failed to upload image. Try again.');
  }

  uploadProgress.classList.add('hidden');
}

function sendSystemMessage(text, meta = {}) {
  const messagesRef = ref(db, `messages/${currentRoom}`);
  push(messagesRef, {
    type: 'system',
    text: text,
    timestamp: Date.now(),
    ...meta
  });
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}

// ============================================
// MESSAGE INPUT
// ============================================
messageInput.addEventListener('input', () => {
  sendBtn.disabled = !messageInput.value.trim() && !selectedImageFile;
  updateTyping();
});

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener('click', sendMessage);

// ============================================
// TYPING INDICATOR
// ============================================
function updateTyping() {
  const typingRef = ref(db, `typing/${currentRoom}/${currentUser}`);
  set(typingRef, { typing: true, timestamp: Date.now() });

  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(clearTyping, 2000);
}

function clearTyping() {
  const typingRef = ref(db, `typing/${currentRoom}/${currentUser}`);
  set(typingRef, null);
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
}

function listenForTyping() {
  const typingRef = ref(db, `typing/${currentRoom}`);
  onValue(typingRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      typingIndicator.classList.add('hidden');
      return;
    }

    const typingUsers = Object.keys(data).filter(u => u !== currentUser);
    if (typingUsers.length > 0) {
      typingUser.textContent = typingUsers[0];
      typingIndicator.classList.remove('hidden');
    } else {
      typingIndicator.classList.add('hidden');
    }
  });
}

// ============================================
// EMOJI PICKER
// ============================================
initEmojiPicker(emojiGrid, (emoji) => {
  messageInput.value += emoji;
  messageInput.focus();
  sendBtn.disabled = false;
});

emojiBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  isEmojiPickerOpen = !isEmojiPickerOpen;
  emojiPicker.classList.toggle('hidden', !isEmojiPickerOpen);
});

document.addEventListener('click', (e) => {
  if (isEmojiPickerOpen && !emojiPicker.contains(e.target) && e.target !== emojiBtn) {
    isEmojiPickerOpen = false;
    emojiPicker.classList.add('hidden');
  }
});

// ============================================
// IMAGE UPLOAD
// ============================================
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showToast('Image too large. Max 10MB.');
    return;
  }

  selectedImageFile = file;
  previewImg.src = URL.createObjectURL(file);
  imagePreview.classList.remove('hidden');
  sendBtn.disabled = false;
  messageInput.placeholder = 'Add a caption...';
  messageInput.focus();
});

cancelImage.addEventListener('click', cancelImagePreview);

function cancelImagePreview() {
  selectedImageFile = null;
  imagePreview.classList.add('hidden');
  previewImg.src = '';
  imageInput.value = '';
  messageInput.placeholder = 'Type a message...';
  sendBtn.disabled = !messageInput.value.trim();
}

// ============================================
// LIGHTBOX
// ============================================
function openLightbox(url) {
  lightboxImg.src = url;
  lightbox.classList.remove('hidden');
}

lightboxClose.addEventListener('click', () => lightbox.classList.add('hidden'));
lightbox.querySelector('.modal-backdrop').addEventListener('click', () => lightbox.classList.add('hidden'));

// ============================================
// VOICE CALL
// ============================================
function setupVoiceCall() {
  voiceCall = new VoiceCall(currentRoom, currentUser, {
    onIncomingCall: (callerName) => {
      incomingCallerName.textContent = callerName;
      incomingCallModal.classList.remove('hidden');
    },
    onCallConnected: () => {
      incomingCallModal.classList.add('hidden');
      callModal.classList.remove('hidden');
      callStatusText.textContent = 'Connected';
      voiceCallBtn.classList.add('active');
    },
    onCallEnded: () => {
      callModal.classList.add('hidden');
      incomingCallModal.classList.add('hidden');
      voiceCallBtn.classList.remove('active');
      callStatusText.textContent = 'Connecting...';
      callTimer.textContent = '00:00';
      muteBtn.classList.remove('muted');
      muteBtn.querySelector('span').textContent = 'Mute';
    },
    onError: (message) => {
      showToast(message);
    }
  });
}

voiceCallBtn.addEventListener('click', () => {
  if (!voiceCall) return;
  callModal.classList.remove('hidden');
  callStatusText.textContent = 'Calling...';
  voiceCall.startCall();
});

acceptCallBtn.addEventListener('click', () => {
  if (voiceCall) voiceCall.acceptCall();
});

declineCallBtn.addEventListener('click', () => {
  if (voiceCall) voiceCall.declineCall();
  incomingCallModal.classList.add('hidden');
});

endCallBtn.addEventListener('click', () => {
  if (voiceCall) voiceCall.endCall();
});

muteBtn.addEventListener('click', () => {
  if (!voiceCall) return;
  const isMuted = voiceCall.toggleMute();
  muteBtn.classList.toggle('muted', isMuted);
  muteBtn.querySelector('span').textContent = isMuted ? 'Unmute' : 'Mute';
});

// Close call modals via backdrop
callModal.querySelector('.modal-backdrop').addEventListener('click', () => {});
incomingCallModal.querySelector('.modal-backdrop').addEventListener('click', () => {});

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// ============================================
// MOBILE KEYBOARD HANDLING
// ============================================
// Fix for mobile keyboards pushing content
if (/Mobi|Android/i.test(navigator.userAgent)) {
  messageInput.addEventListener('focus', () => {
    setTimeout(scrollToBottom, 300);
  });

  // Handle viewport changes on mobile
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      document.documentElement.style.setProperty(
        '--vh',
        `${window.visualViewport.height * 0.01}px`
      );
      scrollToBottom();
    });
  }
}

// Prevent pull-to-refresh on mobile
document.body.addEventListener('touchmove', (e) => {
  if (e.target.closest('#messages-container')) return;
  if (e.target.closest('#emoji-picker')) return;
  e.preventDefault();
}, { passive: false });

// ============================================
// INIT
// ============================================
console.log('🚀 Chatttt loaded!');
