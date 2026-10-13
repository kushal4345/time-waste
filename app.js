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
let isEmojiPickerOpen = false;
let typingTimeout = null;
let lastMessageDate = '';

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
const emojiBtn = $('emoji-btn');
const emojiPicker = $('emoji-picker');
const emojiGrid = $('emoji-grid');
const imageInput = $('image-input');
const imagePreview = $('image-preview');
const previewImg = $('preview-img');
const previewVideo = $('preview-video');
const cancelImageBtn = $('cancel-image');
const uploadProgress = $('upload-progress');
const uploadBar = $('upload-bar');
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
    const users = snap.val();
    const count = users ? Object.keys(users).length : 0;
    onlineCount.textContent = count + ' online';
  });
}

// ============================================
// MESSAGES
// ============================================
// ============================================
// MESSAGES & 7-DAY AUTO-CLEANUP
// ============================================
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function listenForMessages() {
  db.ref('messages/' + currentRoom).orderByChild('timestamp').on('value', (snap) => {
    messagesList.innerHTML = '';
    lastMessageDate = '';
    const messages = snap.val();
    if (!messages) return;

    const now = Date.now();
    const cutoffTime = now - SEVEN_DAYS_MS;

    const sorted = Object.entries(messages)
      .map(([key, val]) => ({ id: key, ...val }))
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    sorted.forEach(msg => {
      // Auto-cleanup: remove messages older than 7 days from Firebase so database never fills up
      if (msg.timestamp && msg.timestamp < cutoffTime) {
        db.ref('messages/' + currentRoom + '/' + msg.id).remove().catch(() => {});
        return;
      }
      renderMessage(msg);
    });

    scrollToBottom();
  });
}

function renderMessage(msg) {
  const msgDate = new Date(msg.timestamp || Date.now()).toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  });

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
  div.className = 'message ' + (isOwn ? 'own' : 'other');

  const time = new Date(msg.timestamp || Date.now()).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  const checkSvg = '<svg class="msg-check" width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M1 5.5L4.5 9L11 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 5.5L8.5 9L15 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const metaHtml = '<div class="message-meta"><span class="message-time">' + time + '</span>' + (isOwn ? checkSvg : '') + '</div>';

  let html = '';

  if (!isOwn) {
    html += '<div class="message-sender"><span class="sender-dot"></span>' + escapeHtml(msg.sender) + '</div>';
  }

  html += '<div class="message-bubble">';

  if (msg.videoUrl || msg.type === 'video') {
    html += '<div class="message-video-wrap">';
    html += '<video src="' + escapeHtml(msg.videoUrl) + '" controls playsinline preload="metadata" class="message-video"></video>';
    html += '<button class="media-dl-btn" title="Download Video" data-dl="' + escapeHtml(msg.videoUrl) + '" data-ext="mp4">';
    html += '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    html += '</button>';
    html += '</div>';
    if (msg.text) html += '<p class="bubble-caption">' + formatText(msg.text) + '</p>';
  } else if (msg.imageUrl || msg.type === 'image') {
    html += '<div class="message-image-wrap">';
    html += '<img src="' + escapeHtml(msg.imageUrl) + '" class="message-image" alt="Shared image" loading="lazy" />';
    html += '<button class="media-dl-btn" title="Download Photo" data-dl="' + escapeHtml(msg.fullImageUrl || msg.imageUrl) + '" data-ext="jpg">';
    html += '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    html += '</button>';
    html += '</div>';
    if (msg.text) html += '<p class="bubble-caption">' + formatText(msg.text) + '</p>';
  } else {
    html += '<p class="bubble-text">' + formatText(msg.text) + '</p>';
  }

  html += metaHtml;
  html += '</div>';

  div.innerHTML = html;

  const img = div.querySelector('.message-image');
  if (img) {
    img.addEventListener('click', () => openLightbox(msg.fullImageUrl || msg.imageUrl));
  }

  const dlBtn = div.querySelector('.media-dl-btn');
  if (dlBtn) {
    dlBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = dlBtn.getAttribute('data-dl');
      const ext = dlBtn.getAttribute('data-ext') || 'bin';
      downloadMedia(url, `chatttt_${Date.now()}.${ext}`);
    });
  }

  messagesList.appendChild(div);
}

function formatText(text) {
  if (!text) return '';
  let s = escapeHtml(text);
  s = s.replace(/\*(.+?)\*/g, '<strong>$1</strong>');
  s = s.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color:var(--accent-light);text-decoration:underline">$1</a>');
  return s;
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text && !selectedMediaFile) return;

  if (selectedMediaFile) {
    sendMediaMessage(text);
    return;
  }

  db.ref('messages/' + currentRoom).push({
    sender: currentUser,
    text: text,
    type: 'text',
    timestamp: Date.now()
  });

  messageInput.value = '';
  sendBtn.disabled = true;
  clearTyping();
}

async function sendMediaMessage(caption) {
  uploadProgress.classList.remove('hidden');
  uploadBar.style.width = '0%';

  try {
    const isVideo = selectedMediaFile.type.startsWith('video/');
    let fileToUpload = selectedMediaFile;
    if (!isVideo) {
      fileToUpload = await compressImage(selectedMediaFile);
    }

    const result = await uploadToCloudinary(fileToUpload, (percent) => {
      uploadBar.style.width = percent + '%';
    });

    if (isVideo) {
      db.ref('messages/' + currentRoom).push({
        sender: currentUser,
        text: caption || '',
        videoUrl: result.url,
        type: 'video',
        timestamp: Date.now()
      });
      showToast('Video sent! 🎥');
    } else {
      db.ref('messages/' + currentRoom).push({
        sender: currentUser,
        text: caption || '',
        imageUrl: result.thumbnail,
        fullImageUrl: result.url,
        type: 'image',
        timestamp: Date.now()
      });
      showToast('Image sent! 📸');
    }

    cancelMediaPreview();
    messageInput.value = '';
    sendBtn.disabled = true;
  } catch (err) {
    console.error('Upload error:', err);
    showToast('Failed to upload. Try again.');
  }

  uploadProgress.classList.add('hidden');
}

function sendSystemMessage(text) {
  db.ref('messages/' + currentRoom).push({
    type: 'system',
    text: text,
    timestamp: Date.now()
  });
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}

// ============================================
// CLOUDINARY UPLOAD
// ============================================
function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const isVideo = file.type.startsWith('video/');
    const endpoint = isVideo ? 'video/upload' : 'image/upload';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'chatttt');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}`);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        resolve({
          url: res.secure_url,
          thumbnail: isVideo ? res.secure_url : res.secure_url.replace('/upload/', '/upload/w_400,q_auto,f_auto/'),
          isVideo: isVideo
        });
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error?.message || 'Upload failed'));
        } catch (_) {
          reject(new Error('Upload failed'));
        }
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.send(formData);
  });
}

function compressImage(file) {
  return new Promise((resolve) => {
    if (file.size < 500 * 1024) { resolve(file); return; }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let w = img.width, h = img.height;
      const maxW = 1200;
      if (w > maxW) { h = (h * maxW) / w; w = maxW; }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.8);
    };

    img.src = URL.createObjectURL(file);
  });
}

// ============================================
// MESSAGE INPUT HANDLERS
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
      sendBtn.disabled = false;
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
// MEDIA UPLOAD (Photo & Video)
// ============================================
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  if (!isImage && !isVideo) {
    showToast('Please select an image or video file');
    return;
  }

  const maxSize = isVideo ? 200 * 1024 * 1024 : 15 * 1024 * 1024;
  if (file.size > maxSize) {
    showToast(isVideo ? 'Video too large. Max 200MB.' : 'Image too large. Max 15MB.');
    return;
  }

  selectedMediaFile = file;

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
  sendBtn.disabled = false;
  messageInput.placeholder = isVideo ? 'Add a video caption...' : 'Add a photo caption...';
  messageInput.focus();
});

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
  sendBtn.disabled = !messageInput.value.trim();
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

function openLightbox(url) {
  currentLightboxUrl = url;
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

lightboxClose.addEventListener('click', () => lightbox.classList.add('hidden'));
lightbox.querySelector('.modal-backdrop').addEventListener('click', () => lightbox.classList.add('hidden'));

// ============================================
// GROUP VOICE CALL (Mesh WebRTC)
// ============================================
let peers = {}; // username -> { pc, audioEl, candidateQueue }
let localStream = null;
let isInCall = false;
let isMicMuted = false;
let isSpeakerMuted = false;
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
    existing.muted = isSpeakerMuted;
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
  isSpeakerMuted = !isSpeakerMuted;
  if (remoteAudiosContainer) {
    remoteAudiosContainer.querySelectorAll('audio').forEach(a => a.muted = isSpeakerMuted);
  }
  speakerBtn.classList.toggle('muted', isSpeakerMuted);
  speakerBtn.querySelector('span').textContent = isSpeakerMuted ? 'Muted' : 'Speaker';
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
// MOBILE & HASH HANDLING
// ============================================
if (/Mobi|Android/i.test(navigator.userAgent)) {
  messageInput.addEventListener('focus', () => setTimeout(scrollToBottom, 300));

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      document.documentElement.style.setProperty('--vh', window.visualViewport.height * 0.01 + 'px');
      scrollToBottom();
    });
  }
}

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

