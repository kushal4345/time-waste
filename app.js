// ============================================
// FIREBASE INIT
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyCNzu5b_YeEZgOqSXx9qeJqSOUFAsJ3tsk",
  authDomain: "chatttt-43322.firebaseapp.com",
  databaseURL: "https://chatttt-43322-default-rtdb.firebaseio.com",
  projectId: "chatttt-43322",
  storageBucket: "chatttt-43322.firebasestorage.app",
  messagingSenderId: "316086005259",
  appId: "1:316086005259:web:747c2c4fe76710ba5de10e",
  measurementId: "G-TGRG9V9TPS"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ============================================
// CLOUDINARY CONFIG
// ============================================
const CLOUD_NAME = 'e62m7ab4';
const UPLOAD_PRESET = 'goluuu';

// ============================================
// EMOJI DATA
// ============================================
const EMOJIS = [
  '😀','😁','😂','🤣','😃','😄','😅','😆',
  '😉','😊','😋','😎','😍','🥰','😘','😗',
  '😙','🥲','😚','🤗','🤩','🤔','🫣','🤨',
  '😐','😑','😶','🫥','😏','😒','🙄','😬',
  '😮','😯','😲','😳','🥺','🥹','😦','😧',
  '😨','😰','😥','😢','😭','😱','😖','😣',
  '😞','😓','😩','😫','🥱','😤','😡','🤬',
  '👋','🤚','🖐️','✋','🖖','👌','🤌','🤏',
  '✌️','🤞','🫰','🤟','🤘','🤙','👈','👉',
  '👆','🖕','👇','☝️','🫵','👍','👎','👏',
  '🙌','🫶','🤝','🙏','💪','🦾','🫡','🫂',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍',
  '🤎','💔','❤️‍🔥','💕','💞','💓','💗','💖',
  '💘','💝','💟','♥️','🔥','⭐','✨','💫',
  '🌟','💥','💯','🎉','🎊','🎈','🎁','🏆',
  '🥇','🎯','🎮','🎵','🎶','🎤','🎧','📱',
  '💻','📸','📷','🎬','☕','🍕','🍔','🍟',
  '🌮','🍩','🍰','🎂','🍫','🍬','🍭','🍿',
  '🧋','🥤','🍻','🥂','🌸','🌺','🌻','🌹',
  '🌷','🌈','☀️','🌙','🌊','❄️','🍀','🌿',
  '🐶','🐱','🐻','🐼','🦊','🦁','🐸','🐵',
  '🦋','🐝','🐢','🐙','🦄','💀','👻','👽',
  '🤖','💩','🫠','😈','💎','🔮','🧿','🃏'
];

// ============================================
// STATE
// ============================================
let currentUser = '';
let currentRoom = '';
let selectedMediaFile = null;
let isSendingMedia = false;
let isEmojiPickerOpen = false;
let typingTimeout = null;
let lastMessageDate = '';
let currentReply = null;
let isNearBottom = true;
let unreadCount = 0;
let soundsEnabled = localStorage.getItem('chat_sounds') !== 'false';
let mediaRecorder = null;
let recordedAudioChunks = [];
let recordingTimerInterval = null;
let recordingStartTime = 0;
let activeAudio = null;
let onlineUsersCount = 0;

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

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
const voiceRecordBtn = $('voice-record-btn');
const voiceRecordBar = $('voice-record-bar');
const voiceRecordTimer = $('voice-record-timer');
const cancelVoiceRecordBtn = $('cancel-voice-record');
const sendVoiceRecordBtn = $('send-voice-record');
const mainInputRow = $('main-input-row');
const emojiBtn = $('emoji-btn');
const emojiPicker = $('emoji-picker');
const emojiGrid = $('emoji-grid');
const imageInput = $('image-input');
const imageUploadLabel = $('image-upload-label');
const imagePreview = $('image-preview');
const previewImg = $('preview-img');
const previewVideo = $('preview-video');
const previewFilename = $('preview-filename');
const previewFilesize = $('preview-filesize');
const cancelImageBtn = $('cancel-image');
const uploadProgress = $('upload-progress');
const uploadBar = $('upload-bar');
const uploadStatusText = $('upload-status-text');
const scrollBottomBtn = $('scroll-bottom-btn');
const unreadBadge = $('unread-badge');
const replyBar = $('reply-bar');
const replySender = $('reply-sender');
const replyText = $('reply-text');
const cancelReplyBtn = $('cancel-reply-btn');
const soundToggleBtn = $('sound-toggle-btn');
const soundOnIcon = $('sound-on-icon');
const soundOffIcon = $('sound-off-icon');
const voiceCallBtn = $('voice-call-btn');
const activeCallBar = $('active-call-bar');
const callBarTitle = $('call-bar-title');
const callBarParticipants = $('call-bar-participants');
const joinCallBannerBtn = $('join-call-banner-btn');
const callModal = $('call-modal');
const minimizeCallBtn = $('minimize-call-btn');
const callParticipantsGrid = $('call-participants-grid');
const callStatusText = $('call-status-text');
const callTimerEl = $('call-timer');
const muteBtn = $('mute-btn');
const endCallBtn = $('end-call-btn');
const speakerBtn = $('speaker-btn');
const incomingCallModal = $('incoming-call-modal');
const incomingCallerName = $('incoming-caller-name');
const incomingCallDesc = $('incoming-call-desc');
const acceptCallBtn = $('accept-call-btn');
const declineCallBtn = $('decline-call-btn');
const remoteAudiosContainer = $('remote-audios-container');
const lightbox = $('lightbox');
const lightboxImg = $('lightbox-img');
const lightboxClose = $('lightbox-close');
const lightboxDownload = $('lightbox-download');
const lightboxDelete = $('lightbox-delete');
const deleteModal = $('delete-modal');
const deleteForEveryoneBtn = $('delete-for-everyone-btn');
const deleteForMeBtn = $('delete-for-me-btn');
const deleteCancelBtn = $('delete-cancel-btn');
const typingIndicator = $('typing-indicator');
const typingUserEl = $('typing-user');

// ============================================
// LOGIN
// ============================================
function validateInputs() {
  const nameValid = usernameInput.value.trim().length >= 1;
  const roomValid = roomInput.value.trim().length >= 1;
  joinBtn.disabled = !(nameValid && roomValid);
}

usernameInput.addEventListener('input', validateInputs);
usernameInput.addEventListener('change', validateInputs);
usernameInput.addEventListener('keyup', validateInputs);

roomInput.addEventListener('input', validateInputs);
roomInput.addEventListener('change', validateInputs);
roomInput.addEventListener('keyup', validateInputs);

usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (roomInput.value.trim().length >= 1) {
      joinRoom();
    } else {
      roomInput.focus();
    }
  }
});

roomInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    joinRoom();
  }
});

joinBtn.addEventListener('click', joinRoom);

function joinRoom() {
  currentUser = usernameInput.value.trim();
  currentRoom = roomInput.value.trim().toLowerCase().replace(/\s+/g, '-');
  if (!currentUser) {
    usernameInput.focus();
    return;
  }
  if (!currentRoom) {
    roomInput.focus();
    return;
  }

  window.location.hash = currentRoom;

  loginScreen.classList.remove('active');
  chatScreen.classList.add('active');
  roomName.textContent = '# ' + currentRoom;

  setupPresence();
  listenForMessages();
  listenForTyping();
  listenForCalls();
  updateInputButtonState();

  setTimeout(() => messageInput.focus(), 300);
  sendSystemMessage(currentUser + ' joined the room');
}

// ============================================
// LEAVE ROOM
// ============================================
leaveBtn.addEventListener('click', () => {
  sendSystemMessage(currentUser + ' left the room');
  setTimeout(leaveRoom, 300);
});

function leaveRoom() {
  db.ref('presence/' + currentRoom + '/' + currentUser).remove();
  db.ref('typing/' + currentRoom + '/' + currentUser).remove();
  db.ref('messages/' + currentRoom).off();
  db.ref('presence/' + currentRoom).off();
  db.ref('typing/' + currentRoom).off();
  db.ref('calls/' + currentRoom).off();

  leaveGroupCall(true);
  cancelReply();
  cancelMediaPreview();
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    cancelVoiceRecording();
  }

  messagesList.innerHTML = '';
  lastMessageDate = '';
  currentUser = '';
  currentRoom = '';

  chatScreen.classList.remove('active');
  loginScreen.classList.add('active');
}

// ============================================
// PRESENCE (Online Users)
// ============================================
// ============================================
// SOUND EFFECTS (Web Audio API Synthesizer)
// ============================================
let sfxAudioCtx = null;
function getSfxAudioContext() {
  if (!sfxAudioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) sfxAudioCtx = new AudioCtx();
  }
  if (sfxAudioCtx && sfxAudioCtx.state === 'suspended') {
    sfxAudioCtx.resume().catch(() => {});
  }
  return sfxAudioCtx;
}

function playSentSound() {
  if (!soundsEnabled) return;
  try {
    const ctx = getSfxAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(760, t + 0.08);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.start(t);
    osc.stop(t + 0.12);
  } catch (_) {}
}

function playReceivedSound() {
  if (!soundsEnabled) return;
  try {
    const ctx = getSfxAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(659, t);
    osc.frequency.setValueAtTime(880, t + 0.07);
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.start(t);
    osc.stop(t + 0.22);
  } catch (_) {}
}

if (soundToggleBtn) {
  const updateSoundIcons = () => {
    soundOnIcon.classList.toggle('hidden', !soundsEnabled);
    soundOffIcon.classList.toggle('hidden', soundsEnabled);
  };
  updateSoundIcons();
  soundToggleBtn.addEventListener('click', () => {
    soundsEnabled = !soundsEnabled;
    localStorage.setItem('chat_sounds', soundsEnabled ? 'true' : 'false');
    updateSoundIcons();
    showToast(soundsEnabled ? '🔊 Chat sounds on' : '🔇 Chat sounds muted');
  });
}

// ============================================
// PRESENCE (Online Users)
// ============================================
function setupPresence() {
  const presenceRef = db.ref('presence/' + currentRoom + '/' + currentUser);
  const connectedRef = db.ref('.info/connected');

  connectedRef.on('value', (snap) => {
    if (snap.val() === true) {
      presenceRef.set({ online: true, lastSeen: firebase.database.ServerValue.TIMESTAMP });
      presenceRef.onDisconnect().remove();
    }
  });

  db.ref('presence/' + currentRoom).on('value', (snap) => {
    const users = snap.val() || {};
    onlineUsersCount = Object.keys(users).length;
    onlineCount.textContent = onlineUsersCount + ' online';
  });
}

// ============================================
// MESSAGES & 7-DAY AUTO-CLEANUP
// ============================================
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
let previousMessageIds = new Set();
let isInitialLoad = true;

// Scroll Monitoring & Floating Scroll Button
if (messagesContainer) {
  messagesContainer.addEventListener('scroll', () => {
    const threshold = 140;
    const distanceToBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight;
    isNearBottom = distanceToBottom <= threshold;

    if (scrollBottomBtn) {
      if (isNearBottom) {
        scrollBottomBtn.classList.add('hidden');
        unreadCount = 0;
        unreadBadge.classList.add('hidden');
      } else {
        scrollBottomBtn.classList.remove('hidden');
      }
    }
  });
}

if (scrollBottomBtn) {
  scrollBottomBtn.addEventListener('click', () => {
    scrollToBottom(true);
    unreadCount = 0;
    unreadBadge.classList.add('hidden');
    scrollBottomBtn.classList.add('hidden');
  });
}

function listenForMessages() {
  previousMessageIds.clear();
  isInitialLoad = true;

  db.ref('messages/' + currentRoom).orderByChild('timestamp').on('value', (snap) => {
    messagesList.innerHTML = '';
    lastMessageDate = '';
    const messages = snap.val();
    if (!messages) {
      isInitialLoad = false;
      return;
    }

    const now = Date.now();
    const cutoffTime = now - SEVEN_DAYS_MS;
    const localDeletedKey = 'deleted_msgs_' + currentRoom;
    const localDeleted = new Set(JSON.parse(localStorage.getItem(localDeletedKey) || '[]'));

    const sorted = Object.entries(messages)
      .map(([key, val]) => ({ id: key, ...val }))
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    let hasNewIncomingMessage = false;

    sorted.forEach(msg => {
      // Auto-cleanup: remove messages older than 7 days
      if (msg.timestamp && msg.timestamp < cutoffTime) {
        db.ref('messages/' + currentRoom + '/' + msg.id).remove().catch(() => {});
        return;
      }
      // Skip locally deleted messages
      if (localDeleted.has(msg.id)) return;

      if (!isInitialLoad && !previousMessageIds.has(msg.id)) {
        if (msg.sender && msg.sender !== currentUser) {
          hasNewIncomingMessage = true;
        }
      }
      previousMessageIds.add(msg.id);

      renderMessage(msg);
    });

    if (hasNewIncomingMessage) {
      playReceivedSound();
      if (!isNearBottom) {
        unreadCount++;
        unreadBadge.textContent = unreadCount;
        unreadBadge.classList.remove('hidden');
      }
    }

    if (isInitialLoad || isNearBottom) {
      scrollToBottom(false);
    }

    isInitialLoad = false;
  });
}

// ============================================
// WHATSAPP MESSAGE FORMATTING & RENDERING
// ============================================
function formatMessageDate(timestamp) {
  const date = new Date(timestamp || Date.now());
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
}

function renderMessage(msg) {
  const msgDate = formatMessageDate(msg.timestamp);

  if (msgDate !== lastMessageDate) {
    lastMessageDate = msgDate;
    const sep = document.createElement('div');
    sep.className = 'date-separator';
    sep.innerHTML = '<span>' + msgDate + '</span>';
    messagesList.appendChild(sep);
  }

  if (msg.type === 'system') {
    const div = document.createElement('div');
    div.className = 'system-message';
    div.innerHTML = '<span>' + escapeHtml(msg.text) + '</span>';
    messagesList.appendChild(div);
    return;
  }

  const isOwn = msg.sender === currentUser;
  const div = document.createElement('div');
  div.id = 'msg-' + msg.id;
  div.className = 'message ' + (isOwn ? 'own' : 'other') + (msg.deleted ? ' is-deleted' : '');

  const time = new Date(msg.timestamp || Date.now()).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  // WhatsApp Double Checks (Single = sent, Double = delivered, Double Blue = read)
  const isRead = isOwn && onlineUsersCount > 1;
  const checkSvg = `
    <svg class="msg-check ${isRead ? 'read' : 'delivered'}" width="16" height="11" viewBox="0 0 16 11" fill="none">
      <path d="M1 5.5L4.5 9L11 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 5.5L8.5 9L15 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const metaHtml = '<div class="message-meta"><span class="message-time">' + time + '</span>' + (isOwn ? checkSvg : '') + '</div>';

  let html = '';

  // Hover Action Buttons (Reaction, Reply, Copy, Delete)
  html += `
    <div class="msg-actions-hover">
      <button class="msg-action-btn btn-react" title="React" data-id="${msg.id}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
      </button>
      <button class="msg-action-btn btn-reply" title="Reply" data-id="${msg.id}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
      </button>
      <button class="msg-action-btn btn-copy" title="Copy" data-text="${escapeHtml(msg.text || '')}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
      <button class="msg-action-btn btn-del" title="Delete" data-id="${msg.id}" data-own="${isOwn}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
  `;

  if (!isOwn) {
    html += '<div class="message-sender"><span class="sender-dot"></span>' + escapeHtml(msg.sender) + '</div>';
  }

  html += '<div class="message-bubble">';

  // WhatsApp Quoted Reply Block
  if (msg.replyTo) {
    html += `
      <div class="msg-quote" data-target="${escapeHtml(msg.replyTo.id)}">
        <span class="msg-quote-sender">${escapeHtml(msg.replyTo.sender)}</span>
        <span class="msg-quote-text">${escapeHtml(msg.replyTo.text || 'Media')}</span>
      </div>
    `;
  }

  // Content
  if (msg.deleted) {
    html += '<p class="bubble-text" style="opacity:0.65;font-style:italic;">🚫 This message was deleted</p>';
  } else if (msg.type === 'audio' || msg.audioUrl) {
    // WhatsApp Voice Note Player
    html += `
      <div class="voice-note-player" data-audio="${escapeHtml(msg.audioUrl)}">
        <button class="vn-play-btn" title="Play Voice Note">
          <svg class="play-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>
          <svg class="pause-icon hidden" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        </button>
        <div class="vn-waveform-wrap">
          <input type="range" class="vn-slider" min="0" max="100" value="0" />
          <div class="vn-meta-row">
            <span class="vn-duration">${msg.duration ? formatDuration(msg.duration) : 'Voice note'}</span>
            <button class="vn-speed-btn" title="Playback Speed">1x</button>
          </div>
        </div>
      </div>
    `;
    if (msg.text) html += '<p class="bubble-caption">' + formatText(msg.text) + '</p>';
  } else if (msg.videoUrl || msg.type === 'video') {
    html += '<div class="message-video-wrap">';
    html += '<video src="' + escapeHtml(msg.videoUrl) + '" controls playsinline preload="metadata" class="message-video"></video>';
    html += '<div class="media-overlay-actions">';
    html += '<button class="media-dl-btn" title="Download Video" data-dl="' + escapeHtml(msg.videoUrl) + '" data-ext="mp4">';
    html += '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    html += '</button>';
    html += '<button class="media-del-btn" title="Delete Video" data-id="' + msg.id + '" data-own="' + isOwn + '">';
    html += '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
    html += '</button>';
    html += '</div>';
    html += '</div>';
    if (msg.text) html += '<p class="bubble-caption">' + formatText(msg.text) + '</p>';
  } else if (msg.imageUrl || msg.type === 'image') {
    html += '<div class="message-image-wrap">';
    html += '<img src="' + escapeHtml(msg.imageUrl) + '" class="message-image" alt="Shared image" loading="lazy" />';
    html += '<div class="media-overlay-actions">';
    html += '<button class="media-dl-btn" title="Download Photo" data-dl="' + escapeHtml(msg.fullImageUrl || msg.imageUrl) + '" data-ext="jpg">';
    html += '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    html += '</button>';
    html += '<button class="media-del-btn" title="Delete Photo" data-id="' + msg.id + '" data-own="' + isOwn + '">';
    html += '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
    html += '</button>';
    html += '</div>';
    html += '</div>';
    if (msg.text) html += '<p class="bubble-caption">' + formatText(msg.text) + '</p>';
  } else {
    html += '<p class="bubble-text">' + formatText(msg.text) + '</p>';
  }

  // Reactions Chips
  if (msg.reactions) {
    const reactionCounts = {};
    let myReaction = null;
    Object.entries(msg.reactions).forEach(([user, emoji]) => {
      reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
      if (user === currentUser) myReaction = emoji;
    });

    html += '<div class="msg-reactions-chips">';
    Object.entries(reactionCounts).forEach(([emoji, count]) => {
      const isMine = myReaction === emoji;
      html += `<span class="reaction-chip ${isMine ? 'own-reacted' : ''}" data-emoji="${emoji}">${emoji} ${count > 1 ? count : ''}</span>`;
    });
    html += '</div>';
  }

  html += metaHtml;
  html += '</div>';

  div.innerHTML = html;

  // Event Listeners on Message
  attachMessageEventListeners(div, msg);

  messagesList.appendChild(div);
}

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function attachMessageEventListeners(div, msg) {
  const isOwn = msg.sender === currentUser;

  // Lightbox click on images
  const img = div.querySelector('.message-image');
  if (img) {
    img.addEventListener('click', () => openLightbox(msg.fullImageUrl || msg.imageUrl, msg.id, isOwn));
  }

  // Media download
  const dlBtn = div.querySelector('.media-dl-btn');
  if (dlBtn) {
    dlBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = dlBtn.getAttribute('data-dl');
      const ext = dlBtn.getAttribute('data-ext') || 'jpg';
      downloadMedia(url, `chatttt_${Date.now()}.${ext}`);
    });
  }

  // Media delete button
  const mediaDelBtn = div.querySelector('.media-del-btn');
  if (mediaDelBtn) {
    mediaDelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      promptDeleteMessage(msg.id, isOwn);
    });
  }

  // Click on quoted reply to jump
  const quoteEl = div.querySelector('.msg-quote');
  if (quoteEl) {
    quoteEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = quoteEl.getAttribute('data-target');
      const targetEl = document.getElementById('msg-' + targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetEl.classList.remove('highlight-flash');
        void targetEl.offsetWidth;
        targetEl.classList.add('highlight-flash');
      } else {
        showToast('Original message not found');
      }
    });
  }

  // Reply button
  const replyBtn = div.querySelector('.btn-reply');
  if (replyBtn) {
    replyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setReplyMessage(msg);
    });
  }

  // Copy button
  const copyBtn = div.querySelector('.btn-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const text = copyBtn.getAttribute('data-text');
      if (text) {
        try {
          await navigator.clipboard.writeText(text);
          showToast('Copied to clipboard! 📋');
        } catch {
          showToast('Could not copy text');
        }
      }
    });
  }

  // Delete button
  const delBtn = div.querySelector('.btn-del');
  if (delBtn) {
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      promptDeleteMessage(msg.id, isOwn);
    });
  }

  // Reaction button & picker popup
  const reactBtn = div.querySelector('.btn-react');
  if (reactBtn) {
    reactBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showReactionPicker(div, msg.id);
    });
  }

  // Reaction chips click to toggle
  const chips = div.querySelectorAll('.reaction-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const emoji = chip.getAttribute('data-emoji');
      toggleReaction(msg.id, emoji);
    });
  });

  // Voice Note Player logic
  const vnPlayer = div.querySelector('.voice-note-player');
  if (vnPlayer) {
    setupVoiceNotePlayer(vnPlayer);
  }

  // Mobile Swipe-Right to Reply
  let touchStartX = 0;
  let touchDeltaX = 0;
  div.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchDeltaX = 0;
  }, { passive: true });

  div.addEventListener('touchmove', (e) => {
    touchDeltaX = e.touches[0].clientX - touchStartX;
    if (touchDeltaX > 15 && touchDeltaX < 90) {
      div.style.transform = `translateX(${touchDeltaX}px)`;
    }
  }, { passive: true });

  div.addEventListener('touchend', () => {
    if (touchDeltaX > 55) {
      setReplyMessage(msg);
      if (navigator.vibrate) navigator.vibrate(15);
    }
    div.style.transform = '';
  });
}

function showReactionPicker(msgDiv, msgId) {
  // Remove existing popups
  document.querySelectorAll('.reactions-bar-popup').forEach(p => p.remove());

  const popup = document.createElement('div');
  popup.className = 'reactions-bar-popup';
  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '👏'];

  quickEmojis.forEach(emoji => {
    const span = document.createElement('span');
    span.className = 'reaction-pick-emoji';
    span.textContent = emoji;
    span.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleReaction(msgId, emoji);
      popup.remove();
    });
    popup.appendChild(span);
  });

  msgDiv.appendChild(popup);

  const closePopup = (e) => {
    if (!popup.contains(e.target)) {
      popup.remove();
      document.removeEventListener('click', closePopup);
    }
  };
  setTimeout(() => document.addEventListener('click', closePopup), 0);
}

function setupVoiceNotePlayer(container) {
  const audioUrl = container.getAttribute('data-audio');
  if (!audioUrl) return;

  const playBtn = container.querySelector('.vn-play-btn');
  const playIcon = container.querySelector('.play-icon');
  const pauseIcon = container.querySelector('.pause-icon');
  const slider = container.querySelector('.vn-slider');
  const durationEl = container.querySelector('.vn-duration');
  const speedBtn = container.querySelector('.vn-speed-btn');

  let audio = new Audio(audioUrl);
  let speeds = [1, 1.5, 2];
  let speedIdx = 0;

  audio.addEventListener('loadedmetadata', () => {
    if (audio.duration && !isNaN(audio.duration)) {
      durationEl.textContent = formatDuration(audio.duration);
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      slider.value = (audio.currentTime / audio.duration) * 100;
      durationEl.textContent = `${formatDuration(audio.currentTime)} / ${formatDuration(audio.duration)}`;
    }
  });

  audio.addEventListener('ended', () => {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    slider.value = 0;
    if (audio.duration) durationEl.textContent = formatDuration(audio.duration);
  });

  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeAudio && activeAudio !== audio) {
      activeAudio.pause();
    }
    if (audio.paused) {
      activeAudio = audio;
      audio.play().then(() => {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
      }).catch(err => {
        console.error('Audio play error:', err);
        showToast('Could not play audio');
      });
    } else {
      audio.pause();
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
    }
  });

  slider.addEventListener('input', (e) => {
    e.stopPropagation();
    if (audio.duration) {
      audio.currentTime = (slider.value / 100) * audio.duration;
    }
  });

  if (speedBtn) {
    speedBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      speedIdx = (speedIdx + 1) % speeds.length;
      audio.playbackRate = speeds[speedIdx];
      speedBtn.textContent = speeds[speedIdx] + 'x';
    });
  }
}

function setReplyMessage(msg) {
  currentReply = {
    id: msg.id,
    sender: msg.sender || 'Unknown',
    text: msg.text || (msg.imageUrl ? '📷 Photo' : (msg.videoUrl ? '🎥 Video' : (msg.audioUrl ? '🎤 Voice note' : 'Message'))),
    type: msg.type || 'text'
  };
  replySender.textContent = currentReply.sender;
  replyText.textContent = currentReply.text;
  replyBar.classList.remove('hidden');
  messageInput.focus();
}

function cancelReply() {
  currentReply = null;
  replyBar.classList.add('hidden');
}

if (cancelReplyBtn) {
  cancelReplyBtn.addEventListener('click', cancelReply);
}

function toggleReaction(msgId, emoji) {
  if (!currentRoom || !currentUser || !msgId) return;
  const reactionRef = db.ref(`messages/${currentRoom}/${msgId}/reactions/${currentUser}`);
  reactionRef.once('value', (snap) => {
    if (snap.val() === emoji) {
      reactionRef.remove();
    } else {
      reactionRef.set(emoji);
    }
  });
}

let pendingDeleteId = null;
let pendingDeleteIsOwn = false;

function promptDeleteMessage(msgId, isOwn) {
  pendingDeleteId = msgId;
  pendingDeleteIsOwn = isOwn;

  if (deleteModal) {
    if (deleteForEveryoneBtn) {
      deleteForEveryoneBtn.classList.toggle('hidden', !isOwn);
    }
    deleteModal.classList.remove('hidden');
  } else {
    if (isOwn) {
      const choice = confirm('Delete message for everyone?\nClick Cancel to delete only for you.');
      deleteMessage(msgId, choice);
    } else {
      if (confirm('Delete this message for yourself?')) {
        deleteMessage(msgId, false);
      }
    }
  }
}

function hideDeleteModal() {
  if (deleteModal) deleteModal.classList.add('hidden');
  pendingDeleteId = null;
}

if (deleteForEveryoneBtn) {
  deleteForEveryoneBtn.addEventListener('click', () => {
    if (pendingDeleteId) {
      deleteMessage(pendingDeleteId, true);
      hideDeleteModal();
    }
  });
}

if (deleteForMeBtn) {
  deleteForMeBtn.addEventListener('click', () => {
    if (pendingDeleteId) {
      deleteMessage(pendingDeleteId, false);
      hideDeleteModal();
    }
  });
}

if (deleteCancelBtn) {
  deleteCancelBtn.addEventListener('click', hideDeleteModal);
}

if (deleteModal) {
  deleteModal.querySelector('.modal-backdrop')?.addEventListener('click', hideDeleteModal);
}

function deleteMessage(msgId, forEveryone) {
  if (!msgId) return;
  if (forEveryone) {
    db.ref(`messages/${currentRoom}/${msgId}`).remove()
      .then(() => showToast('Message deleted for everyone 🗑️'))
      .catch((err) => {
        console.error('Delete error:', err);
        showToast('Failed to delete message');
      });
  } else {
    const key = 'deleted_msgs_' + currentRoom;
    const local = JSON.parse(localStorage.getItem(key) || '[]');
    if (!local.includes(msgId)) {
      local.push(msgId);
      localStorage.setItem(key, JSON.stringify(local));
    }
    const el = document.getElementById('msg-' + msgId);
    if (el) el.remove();
    showToast('Message deleted for you 🗑️');
  }
}

// WhatsApp Markdown Format & Linkify
function formatText(text) {
  if (!text) return '';
  let s = escapeHtml(text);
  // Code block ```code```
  s = s.replace(/```([\s\S]+?)```/g, '<code>$1</code>');
  // Bold *text*
  s = s.replace(/\*([^*\n]+?)\*/g, '<strong>$1</strong>');
  // Italic _text_
  s = s.replace(/\b_([^_]+?)_\b/g, '<em>$1</em>');
  // Strikethrough ~text~
  s = s.replace(/~([^~]+?)~/g, '<del>$1</del>');
  // URLs auto-link
  s = s.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color:var(--accent-light);text-decoration:underline;">$1</a>');
  return s;
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

// ============================================
// SEND MESSAGE & MEDIA (Keypad Stays Open!)
// ============================================
function sendMessage() {
  if (isSendingMedia) return;

  const text = messageInput.value.trim();
  if (!text && !selectedMediaFile) return;

  if (selectedMediaFile) {
    sendMediaMessage(text);
    return;
  }

  const msgData = {
    sender: currentUser,
    text: text,
    type: 'text',
    timestamp: Date.now()
  };

  if (currentReply) {
    msgData.replyTo = currentReply;
  }

  db.ref('messages/' + currentRoom).push(msgData);

  messageInput.value = '';
  cancelReply();
  updateInputButtonState();
  clearTyping();
  playSentSound();

  // Keep focus on input so keyboard stays open
  messageInput.focus();
}

async function sendMediaMessage(caption) {
  if (isSendingMedia || !selectedMediaFile) return;
  isSendingMedia = true;

  // Immediate visual feedback on Send button
  sendBtn.disabled = true;
  sendBtn.classList.add('sending');
  sendBtn.innerHTML = `
    <svg class="send-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <circle cx="12" cy="12" r="10" stroke-opacity="0.25" stroke="currentColor"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"/>
    </svg>
  `;

  uploadProgress.classList.remove('hidden');
  uploadBar.style.width = '0%';
  if (uploadStatusText) uploadStatusText.textContent = 'Preparing media...';
  if (previewFilesize) previewFilesize.textContent = 'Uploading... please wait';
  if (cancelImageBtn) cancelImageBtn.style.pointerEvents = 'none';

  try {
    const isVideo = selectedMediaFile.type.startsWith('video/');
    let fileToUpload = selectedMediaFile;

    if (!isVideo) {
      if (uploadStatusText) uploadStatusText.textContent = 'Optimizing image...';
      fileToUpload = await compressImage(selectedMediaFile);
    }

    if (uploadStatusText) uploadStatusText.textContent = 'Uploading 0%...';
    const result = await uploadToCloudinary(fileToUpload, (percent) => {
      uploadBar.style.width = percent + '%';
      if (uploadStatusText) uploadStatusText.textContent = `Uploading ${percent}%`;
    });

    const msgData = {
      sender: currentUser,
      text: caption || '',
      timestamp: Date.now()
    };

    if (currentReply) {
      msgData.replyTo = currentReply;
    }

    if (isVideo) {
      msgData.videoUrl = result.url;
      msgData.type = 'video';
      db.ref('messages/' + currentRoom).push(msgData);
      showToast('Video sent! 🎥');
    } else {
      msgData.imageUrl = result.thumbnail;
      msgData.fullImageUrl = result.url;
      msgData.type = 'image';
      db.ref('messages/' + currentRoom).push(msgData);
      showToast('Image sent! 📸');
    }

    cancelMediaPreview();
    cancelReply();
    messageInput.value = '';
    playSentSound();
    messageInput.focus();
  } catch (err) {
    console.error('Upload error:', err);
    showToast('Upload failed after retries. Tap send to try again.');
    if (uploadStatusText) uploadStatusText.textContent = 'Failed. Tap send to retry.';
    if (previewFilesize) previewFilesize.textContent = 'Failed • Tap Send to retry';
  } finally {
    isSendingMedia = false;
    if (cancelImageBtn) cancelImageBtn.style.pointerEvents = '';
    sendBtn.classList.remove('sending');
    sendBtn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    `;
    updateInputButtonState();
    uploadProgress.classList.add('hidden');
  }
}

function sendSystemMessage(text) {
  db.ref('messages/' + currentRoom).push({
    type: 'system',
    text: text,
    timestamp: Date.now()
  });
}

function scrollToBottom(smooth = false) {
  requestAnimationFrame(() => {
    if (!messagesContainer) return;
    if (smooth) {
      messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
    } else {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });
}

// ============================================
// RESILIENT CLOUDINARY UPLOAD WITH RETRY
// ============================================
function uploadToCloudinary(file, onProgress, attempt = 1, maxAttempts = 3) {
  return new Promise((resolve, reject) => {
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    const endpoint = (isVideo || isAudio) ? 'video/upload' : 'image/upload';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'chatttt');

    const xhr = new XMLHttpRequest();
    xhr.timeout = 45000;
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}`);

    if (xhr.upload && onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({
            url: res.secure_url,
            thumbnail: (isVideo || isAudio) ? res.secure_url : res.secure_url.replace('/upload/', '/upload/w_500,q_auto,f_auto/'),
            isVideo,
            isAudio
          });
        } catch (_) {
          retryOrReject(new Error('Invalid JSON response'));
        }
      } else {
        retryOrReject(new Error('Upload failed: ' + xhr.status));
      }
    });

    xhr.addEventListener('error', () => retryOrReject(new Error('Network error')));
    xhr.addEventListener('timeout', () => retryOrReject(new Error('Upload timed out')));

    function retryOrReject(err) {
      if (attempt < maxAttempts) {
        console.warn(`Upload attempt ${attempt} failed, retrying...`, err);
        if (uploadStatusText) {
          uploadStatusText.textContent = `Retrying (${attempt + 1}/${maxAttempts})...`;
        }
        setTimeout(() => {
          uploadToCloudinary(file, onProgress, attempt + 1, maxAttempts).then(resolve).catch(reject);
        }, attempt * 1000);
      } else {
        reject(err);
      }
    }

    xhr.send(formData);
  });
}

// Safe Image Compression that NEVER Hangs
function compressImage(file) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.size < 350 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    const blobUrl = URL.createObjectURL(file);
    let isSettled = false;

    const safeFallback = () => {
      if (isSettled) return;
      isSettled = true;
      try { URL.revokeObjectURL(blobUrl); } catch (_) {}
      resolve(file); // Graceful fallback to original file
    };

    img.onerror = safeFallback;

    img.onload = () => {
      try {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        const maxDim = 1600;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { safeFallback(); return; }

        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => {
          if (isSettled) return;
          isSettled = true;
          try { URL.revokeObjectURL(blobUrl); } catch (_) {}
          if (blob && blob.size < file.size) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.82);
      } catch (_) {
        safeFallback();
      }
    };

    setTimeout(safeFallback, 4000);
    img.src = blobUrl;
  });
}

// ============================================
// MESSAGE INPUT & BUTTON SWITCHING
// ============================================
function updateInputButtonState() {
  if (isSendingMedia) {
    sendBtn.classList.remove('hidden');
    sendBtn.disabled = true;
    voiceRecordBtn.classList.add('hidden');
    return;
  }

  const hasText = messageInput.value.trim().length > 0;
  const hasMedia = !!selectedMediaFile;

  if (hasText || hasMedia) {
    sendBtn.classList.remove('hidden');
    sendBtn.disabled = false;
    voiceRecordBtn.classList.add('hidden');
  } else {
    sendBtn.classList.add('hidden');
    sendBtn.disabled = true;
    voiceRecordBtn.classList.remove('hidden');
  }
}

messageInput.addEventListener('input', () => {
  updateInputButtonState();
  updateTyping();
});

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Prevent desktop clicks on auxiliary buttons from blurring the input
[emojiBtn, cancelReplyBtn].forEach(el => {
  if (!el) return;
  el.addEventListener('mousedown', (e) => {
    if (document.activeElement === messageInput) {
      e.preventDefault();
    }
  });
});

sendBtn.addEventListener('click', (e) => {
  e.preventDefault();
  sendMessage();
});

// Clipboard Paste (Supports Text and Direct Image Paste)
messageInput.addEventListener('paste', async (e) => {
  const clipboardData = e.clipboardData || window.clipboardData;
  if (!clipboardData) return;

  const items = clipboardData.items;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleSelectedFile(file);
          showToast('Image pasted from clipboard! 📋');
          return;
        }
      }
    }
  }

  setTimeout(() => {
    updateInputButtonState();
    updateTyping();
  }, 0);
});

// ============================================
// WHATSAPP VOICE NOTE RECORDING
// ============================================
voiceRecordBtn.addEventListener('click', () => {
  startVoiceRecording();
});

async function startVoiceRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedAudioChunks = [];
    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');
    mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedAudioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
    };

    mediaRecorder.start(200);
    recordingStartTime = Date.now();
    voiceRecordBar.classList.remove('hidden');
    mainInputRow.classList.add('hidden');

    recordingTimerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      voiceRecordTimer.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
    }, 250);

    playSentSound();
  } catch (err) {
    console.error('Microphone error:', err);
    showToast('Please grant microphone access to record voice notes');
  }
}

function cancelVoiceRecording() {
  if (recordingTimerInterval) {
    clearInterval(recordingTimerInterval);
    recordingTimerInterval = null;
  }
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  recordedAudioChunks = [];
  voiceRecordBar.classList.add('hidden');
  mainInputRow.classList.remove('hidden');
  voiceRecordTimer.textContent = '0:00';
  updateInputButtonState();
}

if (cancelVoiceRecordBtn) {
  cancelVoiceRecordBtn.addEventListener('click', cancelVoiceRecording);
}

if (sendVoiceRecordBtn) {
  sendVoiceRecordBtn.addEventListener('click', async () => {
    if (!mediaRecorder) return;
    const durationSec = Math.max(1, Math.floor((Date.now() - recordingStartTime) / 1000));

    if (recordingTimerInterval) {
      clearInterval(recordingTimerInterval);
      recordingTimerInterval = null;
    }

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedAudioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      const file = new File([blob], `voice_${Date.now()}.webm`, { type: blob.type });

      voiceRecordBar.classList.add('hidden');
      mainInputRow.classList.remove('hidden');
      voiceRecordTimer.textContent = '0:00';
      showToast('Sending voice note... 🎙️');

      try {
        const res = await uploadToCloudinary(file, null);
        const msgData = {
          sender: currentUser,
          type: 'audio',
          audioUrl: res.url,
          duration: durationSec,
          timestamp: Date.now()
        };
        if (currentReply) {
          msgData.replyTo = currentReply;
        }
        db.ref('messages/' + currentRoom).push(msgData);
        cancelReply();
        playSentSound();
        showToast('Voice note sent! 🎵');
      } catch (err) {
        console.error('Voice upload failed:', err);
        showToast('Failed to send voice note');
      }
      updateInputButtonState();
    };

    mediaRecorder.stop();
  });
}

// ============================================
// TYPING INDICATOR
// ============================================
function updateTyping() {
  db.ref('typing/' + currentRoom + '/' + currentUser).set({
    typing: true,
    timestamp: Date.now()
  });
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(clearTyping, 2000);
}

function clearTyping() {
  if (!currentRoom || !currentUser) return;
  db.ref('typing/' + currentRoom + '/' + currentUser).remove();
  if (typingTimeout) { clearTimeout(typingTimeout); typingTimeout = null; }
}

function listenForTyping() {
  db.ref('typing/' + currentRoom).on('value', (snap) => {
    const data = snap.val();
    if (!data) { typingIndicator.classList.add('hidden'); return; }

    const typingUsers = Object.keys(data).filter(u => u !== currentUser);
    if (typingUsers.length > 0) {
      typingUserEl.textContent = typingUsers[0];
      typingIndicator.classList.remove('hidden');
    } else {
      typingIndicator.classList.add('hidden');
    }
  });
}

// ============================================
// EMOJI PICKER
// ============================================
(function initEmojis() {
  emojiGrid.innerHTML = '';
  EMOJIS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'emoji-item';
    btn.textContent = emoji;
    btn.type = 'button';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      messageInput.value += emoji;
      messageInput.focus();
      updateInputButtonState();
    });
    emojiGrid.appendChild(btn);
  });
})();

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
// MEDIA UPLOAD & PREVIEW (Photos & Videos)
// ============================================
// Always reset file input value on click so selecting same file works
imageInput.addEventListener('click', () => {
  imageInput.value = '';
});

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  handleSelectedFile(file);
});

function handleSelectedFile(file) {
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  if (!isImage && !isVideo) {
    showToast('Please select an image or video file');
    return;
  }

  const maxSize = isVideo ? 200 * 1024 * 1024 : 30 * 1024 * 1024;
  if (file.size > maxSize) {
    showToast(isVideo ? 'Video too large. Max 200MB.' : 'Image too large. Max 30MB.');
    return;
  }

  selectedMediaFile = file;

  if (previewFilename) previewFilename.textContent = file.name;
  if (previewFilesize) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    previewFilesize.textContent = mb + ' MB • Ready to send';
  }

  if (isVideo) {
    previewImg.classList.add('hidden');
    previewImg.src = '';
    previewVideo.src = URL.createObjectURL(file);
    previewVideo.classList.remove('hidden');
  } else {
    previewVideo.classList.add('hidden');
    previewVideo.pause();
    previewVideo.src = '';
    previewImg.src = URL.createObjectURL(file);
    previewImg.classList.remove('hidden');
  }

  imagePreview.classList.remove('hidden');
  updateInputButtonState();
  messageInput.placeholder = isVideo ? 'Add a video caption...' : 'Add a photo caption...';
  messageInput.focus();
}

cancelImageBtn.addEventListener('click', cancelMediaPreview);

function cancelMediaPreview() {
  selectedMediaFile = null;
  imagePreview.classList.add('hidden');
  previewImg.src = '';
  previewImg.classList.add('hidden');
  if (previewVideo) {
    previewVideo.pause();
    previewVideo.src = '';
    previewVideo.classList.add('hidden');
  }
  imageInput.value = '';
  messageInput.placeholder = 'Type a message...';
  updateInputButtonState();
}

// ============================================
// MEDIA DOWNLOAD UTILITY
// ============================================
async function downloadMedia(url, filename) {
  if (!url) return;
  try {
    showToast('Starting download... ⏳');
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || ('chatttt_' + Date.now());
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
    showToast('Download complete! 💾');
  } catch (err) {
    // Direct open fallback if cross-origin blocks blob
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.download = filename || '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Opened media for saving! 💾');
  }
}

// ============================================
// LIGHTBOX
// ============================================
let currentLightboxUrl = '';
let currentLightboxMsgId = null;
let currentLightboxIsOwn = false;

function openLightbox(url, msgId, isOwn) {
  currentLightboxUrl = url;
  currentLightboxMsgId = msgId;
  currentLightboxIsOwn = isOwn;
  lightboxImg.src = url;
  lightbox.classList.remove('hidden');
}

if (lightboxDownload) {
  lightboxDownload.addEventListener('click', () => {
    if (currentLightboxUrl) {
      downloadMedia(currentLightboxUrl, `chatttt_${Date.now()}.jpg`);
    }
  });
}

if (lightboxDelete) {
  lightboxDelete.addEventListener('click', () => {
    if (currentLightboxMsgId) {
      lightbox.classList.add('hidden');
      promptDeleteMessage(currentLightboxMsgId, currentLightboxIsOwn);
    }
  });
}

lightboxClose.addEventListener('click', () => lightbox.classList.add('hidden'));
lightbox.querySelector('.modal-backdrop').addEventListener('click', () => lightbox.classList.add('hidden'));

// ============================================
// GROUP VOICE CALL (Mesh WebRTC)
// ============================================
let peers = {}; // username -> { pc, audioEl, candidateQueue }
let localStream = null;
let isInCall = false;
let isMicMuted = false;
let isSpeakerOn = true; // speaker starts ON (unmuted)
let callStartTime = null;
let callTimerInterval = null;
let currentCallParticipants = {};
let hasDismissedCallModal = false;
let ringtoneAudioCtx = null;
let ringtoneInterval = null;
let isListeningForOffers = false;

function playRingtoneSound() {
  stopRingtoneSound();
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ringtoneAudioCtx = new AudioCtx();
    const beep = () => {
      if (!ringtoneAudioCtx || ringtoneAudioCtx.state === 'closed') return;
      const osc = ringtoneAudioCtx.createOscillator();
      const gain = ringtoneAudioCtx.createGain();
      osc.connect(gain);
      gain.connect(ringtoneAudioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ringtoneAudioCtx.currentTime);
      osc.frequency.setValueAtTime(480, ringtoneAudioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ringtoneAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ringtoneAudioCtx.currentTime + 0.9);
      osc.start();
      osc.stop(ringtoneAudioCtx.currentTime + 0.9);
    };
    beep();
    ringtoneInterval = setInterval(beep, 2200);
  } catch (e) {
    console.warn('Ringtone sound error:', e);
  }
}

function stopRingtoneSound() {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
  if (ringtoneAudioCtx) {
    try { ringtoneAudioCtx.close(); } catch (e) {}
    ringtoneAudioCtx = null;
  }
}

function getPairKey(user1, user2) {
  return [user1, user2].sort().join('___');
}

function createRemoteAudioElement(username) {
  let existing = document.getElementById('remote-audio-' + username);
  if (!existing) {
    existing = document.createElement('audio');
    existing.id = 'remote-audio-' + username;
    existing.autoplay = true;
    existing.playsInline = true;
    existing.muted = !isSpeakerOn; // muted only when speaker is OFF
    if (remoteAudiosContainer) {
      remoteAudiosContainer.appendChild(existing);
    } else {
      document.body.appendChild(existing);
    }
  }
  return existing;
}

function removeRemoteAudioElement(username) {
  const el = document.getElementById('remote-audio-' + username);
  if (el) {
    el.srcObject = null;
    el.remove();
  }
}

function handleRemoteIceCandidate(remoteUser, candidateData) {
  if (!candidateData) return;
  const peerObj = peers[remoteUser];
  if (!peerObj || !peerObj.pc) return;
  const cand = new RTCIceCandidate(candidateData);
  if (peerObj.pc.remoteDescription && peerObj.pc.remoteDescription.type) {
    peerObj.pc.addIceCandidate(cand).catch(e => console.warn('ICE add candidate error:', e));
  } else {
    peerObj.candidateQueue.push(cand);
  }
}

async function flushCandidates(remoteUser) {
  const peerObj = peers[remoteUser];
  if (!peerObj || !peerObj.pc || !peerObj.pc.remoteDescription) return;
  while (peerObj.candidateQueue.length > 0) {
    const cand = peerObj.candidateQueue.shift();
    try {
      await peerObj.pc.addIceCandidate(cand);
    } catch (e) {
      console.warn('ICE candidate flush error:', e);
    }
  }
}

function renderCallParticipantsGrid(participants) {
  if (!callParticipantsGrid) return;
  callParticipantsGrid.innerHTML = '';
  const userList = Object.keys(participants || {});

  userList.forEach(user => {
    const isMe = (user === currentUser);
    const data = participants[user] || {};
    const card = document.createElement('div');
    card.className = 'participant-card in-call' + (data.muted ? ' muted' : '');

    const avatar = document.createElement('div');
    avatar.className = 'p-avatar';
    avatar.textContent = (user[0] || '?').toUpperCase();

    const name = document.createElement('div');
    name.className = 'p-name';
    name.textContent = isMe ? `${user} (You)` : user;

    const tag = document.createElement('div');
    tag.className = 'p-tag';
    tag.textContent = data.muted ? 'Muted' : 'Speaking';

    card.appendChild(avatar);
    card.appendChild(name);
    card.appendChild(tag);
    callParticipantsGrid.appendChild(card);
  });
}

function updateCallBanner(count, participants) {
  if (!activeCallBar) return;
  if (count > 0) {
    activeCallBar.classList.remove('hidden');
    const names = Object.keys(participants).join(', ');
    callBarParticipants.textContent = `${count} in call: ${names}`;
    if (isInCall) {
      joinCallBannerBtn.textContent = 'In Call';
      joinCallBannerBtn.classList.add('in-call');
    } else {
      joinCallBannerBtn.textContent = 'Join Call';
      joinCallBannerBtn.classList.remove('in-call');
    }
  } else {
    activeCallBar.classList.add('hidden');
  }
}

// ============================================
// WEBRTC PEER CONNECTIONS
// ============================================
async function initiatePeerConnection(remoteUser) {
  if (peers[remoteUser]) return;
  if (!localStream) return;

  console.log('Initiating call to:', remoteUser);

  const pc = new RTCPeerConnection(ICE_SERVERS);
  const audioEl = createRemoteAudioElement(remoteUser);
  peers[remoteUser] = { pc, audioEl, candidateQueue: [], answered: false };

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  pc.ontrack = (event) => {
    console.log('Got remote track from', remoteUser);
    audioEl.srcObject = event.streams[0];
    audioEl.play().catch(e => console.warn('Audio play error:', e));
  };

  const pairKey = getPairKey(currentUser, remoteUser);

  pc.onicecandidate = (event) => {
    if (event.candidate && currentRoom) {
      db.ref(`calls/${currentRoom}/signals/${pairKey}/ice_${currentUser}`).push(event.candidate.toJSON());
    }
  };

  pc.onconnectionstatechange = () => {
    console.log('Connection state with', remoteUser, ':', pc.connectionState);
    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
      closePeerConnection(remoteUser);
    }
  };

  // Listen for ICE candidates from the other side
  db.ref(`calls/${currentRoom}/signals/${pairKey}/ice_${remoteUser}`).on('child_added', (snap) => {
    handleRemoteIceCandidate(remoteUser, snap.val());
  });

  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await db.ref(`calls/${currentRoom}/signals/${pairKey}/offer`).set({
      from: currentUser,
      to: remoteUser,
      type: offer.type,
      sdp: offer.sdp,
      ts: Date.now()
    });

    console.log('Offer sent to', remoteUser);

    // Listen for answer
    db.ref(`calls/${currentRoom}/signals/${pairKey}/answer`).on('value', async (snap) => {
      const answer = snap.val();
      if (!answer || answer.to !== currentUser) return;
      const peerObj = peers[remoteUser];
      if (!peerObj || peerObj.answered) return;
      if (pc.signalingState !== 'have-local-offer') return;

      try {
        peerObj.answered = true;
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await flushCandidates(remoteUser);
        console.log('Answer received from', remoteUser, '— connected!');
      } catch (e) {
        console.error('Error setting answer from', remoteUser, e);
      }
    });

  } catch (err) {
    console.error('Error creating offer to', remoteUser, err);
  }
}

function listenForIncomingOffers() {
  if (!currentRoom || isListeningForOffers) return;
  isListeningForOffers = true;

  // Listen for all offers addressed TO me
  db.ref(`calls/${currentRoom}/signals`).on('child_added', (snap) => {
    const pairKey = snap.key;
    if (!pairKey || !pairKey.includes(currentUser)) return;

    db.ref(`calls/${currentRoom}/signals/${pairKey}/offer`).on('value', async (offerSnap) => {
      const offer = offerSnap.val();
      if (!offer || offer.to !== currentUser) return;
      if (!isInCall || !localStream) return;

      const remoteUser = offer.from;
      // Don't answer our own offer
      if (remoteUser === currentUser) return;
      // If we already initiated (peers[remoteUser] exists and has our offer), skip
      if (peers[remoteUser] && peers[remoteUser].answered === false && peers[remoteUser].pc.signalingState === 'have-local-offer') return;
      // Already fully connected
      if (peers[remoteUser] && peers[remoteUser].pc.connectionState === 'connected') return;

      console.log('Incoming offer from', remoteUser);

      // Create or reuse peer
      let peerObj = peers[remoteUser];
      if (!peerObj) {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        const audioEl = createRemoteAudioElement(remoteUser);
        peerObj = { pc, audioEl, candidateQueue: [], answered: false };
        peers[remoteUser] = peerObj;

        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

        pc.ontrack = (event) => {
          console.log('Got remote track from', remoteUser);
          audioEl.srcObject = event.streams[0];
          audioEl.play().catch(e => console.warn('Audio play error:', e));
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && currentRoom) {
            db.ref(`calls/${currentRoom}/signals/${pairKey}/ice_${currentUser}`).push(event.candidate.toJSON());
          }
        };

        pc.onconnectionstatechange = () => {
          console.log('Connection state with', remoteUser, ':', pc.connectionState);
          if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            closePeerConnection(remoteUser);
          }
        };

        // Listen for ICE candidates from initiator
        db.ref(`calls/${currentRoom}/signals/${pairKey}/ice_${remoteUser}`).on('child_added', (candSnap) => {
          handleRemoteIceCandidate(remoteUser, candSnap.val());
        });
      }

      try {
        if (peerObj.pc.signalingState === 'stable') {
          await peerObj.pc.setRemoteDescription(new RTCSessionDescription(offer));
          await flushCandidates(remoteUser);

          const answer = await peerObj.pc.createAnswer();
          await peerObj.pc.setLocalDescription(answer);

          await db.ref(`calls/${currentRoom}/signals/${pairKey}/answer`).set({
            from: currentUser,
            to: remoteUser,
            type: answer.type,
            sdp: answer.sdp,
            ts: Date.now()
          });

          peerObj.answered = true;
          console.log('Answer sent to', remoteUser);
        }
      } catch (err) {
        console.error('Error answering offer from', remoteUser, err);
      }
    });
  });
}

function closePeerConnection(username) {
  const peerObj = peers[username];
  if (peerObj) {
    try { peerObj.pc.close(); } catch (e) {}
    removeRemoteAudioElement(username);
    delete peers[username];
    if (currentRoom) {
      // Clean up signals
      const pairKey = getPairKey(currentUser, username);
      db.ref(`calls/${currentRoom}/signals/${pairKey}`).remove();
    }
  }
}

// ============================================
// ROOM CALL PARTICIPANT LISTENER
// ============================================
function listenForCalls() {
  db.ref('calls/' + currentRoom + '/participants').on('value', (snap) => {
    const participants = snap.val() || {};
    currentCallParticipants = participants;
    const count = Object.keys(participants).length;

    updateCallBanner(count, participants);
    renderCallParticipantsGrid(participants);

    if (count > 0) {
      voiceCallBtn.classList.add('active');

      if (!isInCall && !hasDismissedCallModal) {
        const callerName = Object.keys(participants)[0];
        incomingCallerName.textContent = callerName;
        incomingCallDesc.textContent = `started a voice call (${count} in call)`;
        incomingCallModal.classList.remove('hidden');
        playRingtoneSound();
      }
    } else {
      voiceCallBtn.classList.remove('active');
      incomingCallModal.classList.add('hidden');
      stopRingtoneSound();
      hasDismissedCallModal = false;
      if (isInCall) leaveGroupCall(false);
    }

    // Connect to new participants if we're in call
    if (isInCall && localStream) {
      Object.keys(participants).forEach(user => {
        if (user !== currentUser && !peers[user]) {
          // Both sides try, but only the "greater" username initiates offer
          if (currentUser > user) {
            initiatePeerConnection(user);
          }
          // The "lesser" username will answer via listenForIncomingOffers
        }
      });

      // Disconnect left participants
      Object.keys(peers).forEach(user => {
        if (!participants[user]) {
          closePeerConnection(user);
        }
      });
    }
  });
}

function startCallTimer() {
  if (callTimerInterval) clearInterval(callTimerInterval);
  callStartTime = Date.now();
  callTimerEl.textContent = '00:00';
  callTimerInterval = setInterval(() => {
    if (!callStartTime) return;
    const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    callTimerEl.textContent = m + ':' + s;
  }, 1000);
}

// ============================================
// JOIN / LEAVE GROUP CALL
// ============================================
async function joinGroupCall() {
  if (isInCall) {
    callModal.classList.remove('hidden');
    return;
  }

  stopRingtoneSound();
  hasDismissedCallModal = true;
  incomingCallModal.classList.add('hidden');

  callModal.classList.remove('hidden');
  callStatusText.textContent = 'Starting call...';
  callTimerEl.textContent = '00:00';

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    // Ensure mic track is enabled (not muted) when joining
    localStream.getAudioTracks().forEach(track => { track.enabled = true; });
    isMicMuted = false;
    isInCall = true;

    startCallTimer();
    callStatusText.textContent = 'Live Voice Call';
    voiceCallBtn.classList.add('active');

    // Register self as participant — onDisconnect auto-removes
    const myRef = db.ref(`calls/${currentRoom}/participants/${currentUser}`);
    await myRef.set({ joinedAt: firebase.database.ServerValue.TIMESTAMP, muted: false });
    myRef.onDisconnect().remove();

    // Start listening for incoming offers from others
    listenForIncomingOffers();

    // Connect to anyone already in the call
    const snap = await db.ref(`calls/${currentRoom}/participants`).once('value');
    const existing = snap.val() || {};
    const others = Object.keys(existing).filter(u => u !== currentUser);

    others.forEach(user => {
      if (currentUser > user) {
        initiatePeerConnection(user);
      }
      // else: they will offer us, we answer via listenForIncomingOffers
    });

    if (others.length === 0) {
      showToast('Voice call started! Others in this room will see a banner to join.');
    } else {
      showToast(`Joining call with ${others.join(', ')}...`);
    }

  } catch (err) {
    console.error('Join call error:', err);
    if (err.name === 'NotAllowedError') {
      showToast('Microphone permission denied. Please allow mic access and try again.');
    } else {
      showToast('Could not start call. Please check microphone permissions.');
    }
    leaveGroupCall(false);
  }
}

function leaveGroupCall(updateDb = true) {
  stopRingtoneSound();
  isInCall = false;
  isListeningForOffers = false;

  if (updateDb && currentRoom && currentUser) {
    db.ref(`calls/${currentRoom}/participants/${currentUser}`).remove();
    // Clean up signals involving currentUser
    db.ref(`calls/${currentRoom}/signals`).once('value', (snap) => {
      const all = snap.val() || {};
      Object.keys(all).forEach(k => {
        if (k.includes(currentUser)) {
          db.ref(`calls/${currentRoom}/signals/${k}`).remove();
        }
      });
    });
  }

  Object.keys(peers).forEach(user => closePeerConnection(user));
  peers = {};

  if (localStream) {
    localStream.getTracks().forEach(t => t.stop());
    localStream = null;
  }

  if (callTimerInterval) {
    clearInterval(callTimerInterval);
    callTimerInterval = null;
  }
  callStartTime = null;

  callModal.classList.add('hidden');
  callTimerEl.textContent = '00:00';
  isMicMuted = false;
  muteBtn.classList.remove('muted');
  muteBtn.querySelector('span').textContent = 'Mute';

  // Reset speaker state to ON
  isSpeakerOn = true;
  speakerBtn.classList.remove('muted');
  speakerBtn.querySelector('span').textContent = 'Speaker';

  if (joinCallBannerBtn) {
    joinCallBannerBtn.textContent = 'Join Call';
    joinCallBannerBtn.classList.remove('in-call');
  }
}

// ============================================
// CALL CONTROLS EVENT LISTENERS
// ============================================
voiceCallBtn.addEventListener('click', () => {
  if (isInCall) {
    callModal.classList.remove('hidden');
  } else {
    joinGroupCall();
  }
});

joinCallBannerBtn.addEventListener('click', () => {
  if (isInCall) {
    callModal.classList.remove('hidden');
  } else {
    joinGroupCall();
  }
});

acceptCallBtn.addEventListener('click', () => joinGroupCall());

declineCallBtn.addEventListener('click', () => {
  stopRingtoneSound();
  hasDismissedCallModal = true;
  incomingCallModal.classList.add('hidden');
});

endCallBtn.addEventListener('click', () => leaveGroupCall(true));

if (minimizeCallBtn) {
  minimizeCallBtn.addEventListener('click', () => {
    callModal.classList.add('hidden');
    showToast('Call running in background. Tap banner to return.');
  });
}

muteBtn.addEventListener('click', () => {
  if (!localStream) return;
  const track = localStream.getAudioTracks()[0];
  if (track) {
    track.enabled = !track.enabled;
    isMicMuted = !track.enabled;
    muteBtn.classList.toggle('muted', isMicMuted);
    muteBtn.querySelector('span').textContent = isMicMuted ? 'Unmute' : 'Mute';

    if (currentRoom && currentUser) {
      db.ref(`calls/${currentRoom}/participants/${currentUser}/muted`).set(isMicMuted);
    }
  }
});

speakerBtn.addEventListener('click', () => {
  isSpeakerOn = !isSpeakerOn;
  const shouldMute = !isSpeakerOn;
  if (remoteAudiosContainer) {
    remoteAudiosContainer.querySelectorAll('audio').forEach(a => a.muted = shouldMute);
  }
  // Also mute any <audio> elements created directly on body
  document.querySelectorAll('audio[id^="remote-audio-"]').forEach(a => a.muted = shouldMute);
  speakerBtn.classList.toggle('muted', !isSpeakerOn);
  speakerBtn.querySelector('span').textContent = isSpeakerOn ? 'Speaker' : 'Spkr Off';
  showToast(isSpeakerOn ? '🔊 Speaker on' : '🔇 Speaker off');
});

// ============================================
// SHARE ROOM LINK
// ============================================
const shareRoomBtn = $('share-room-btn');
if (shareRoomBtn) {
  shareRoomBtn.addEventListener('click', async () => {
    const roomUrl = window.location.origin + window.location.pathname + '#' + currentRoom;
    try {
      await navigator.clipboard.writeText(roomUrl);
      showToast('Room link copied! Open in another tab or send to a friend.');
    } catch {
      showToast('Room code: ' + currentRoom);
    }
  });
}

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
  setTimeout(() => toast.remove(), 3500);
}

// ============================================
// MOBILE KEYBOARD & VISUAL VIEWPORT (Zero Shatter!)
// ============================================
function setupVisualViewport() {
  if (window.visualViewport) {
    const updateViewport = () => {
      const vh = window.visualViewport.height;
      document.documentElement.style.setProperty('--vvh', `${vh}px`);
      if (isNearBottom) {
        scrollToBottom(false);
      }
    };
    window.visualViewport.addEventListener('resize', updateViewport);
    window.visualViewport.addEventListener('scroll', updateViewport);
    updateViewport();
  } else {
    const setFallback = () => {
      document.documentElement.style.setProperty('--vvh', `${window.innerHeight}px`);
    };
    window.addEventListener('resize', setFallback);
    setFallback();
  }

  // Input focus adjustment without fighting browser keyboard animation
  messageInput.addEventListener('focus', () => {
    setTimeout(() => {
      if (isNearBottom) scrollToBottom(false);
    }, 120);
  });
}

setupVisualViewport();

// Auto-fill room from URL hash (e.g., http://localhost:3000/#myroom)
if (window.location.hash) {
  const hashRoom = window.location.hash.replace(/^#/, '').trim();
  if (hashRoom) {
    roomInput.value = hashRoom;
    validateInputs();
    usernameInput.focus();
  }
}

// ============================================
// INIT
// ============================================
console.log('🚀 Chatttt loaded and ready!');

