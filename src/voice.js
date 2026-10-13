// WebRTC Voice Call Module
import { db, ref, push, onValue, set, remove, onChildAdded } from './firebase.js';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ]
};

let peerConnection = null;
let localStream = null;
let callTimerInterval = null;
let callStartTime = null;

export class VoiceCall {
  constructor(roomId, username, callbacks) {
    this.roomId = roomId;
    this.username = username;
    this.callbacks = callbacks; // { onIncomingCall, onCallConnected, onCallEnded, onError }
    this.callRef = ref(db, `calls/${roomId}`);
    this.isCaller = false;
    this.listenForCalls();
  }

  listenForCalls() {
    onValue(this.callRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // If there's an incoming offer and we're not the caller
      if (data.offer && data.caller !== this.username && !peerConnection) {
        this.callbacks.onIncomingCall(data.caller);
      }
    });
  }

  async startCall() {
    try {
      this.isCaller = true;
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      peerConnection = new RTCPeerConnection(ICE_SERVERS);

      // Add local audio track
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      // Handle remote audio
      peerConnection.ontrack = (event) => {
        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        audio.play().catch(() => {});
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const candidatesRef = ref(db, `calls/${this.roomId}/callerCandidates`);
          push(candidatesRef, event.candidate.toJSON());
        }
      };

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      await set(this.callRef, {
        caller: this.username,
        offer: {
          type: offer.type,
          sdp: offer.sdp
        },
        status: 'ringing',
        timestamp: Date.now()
      });

      // Listen for answer
      const answerRef = ref(db, `calls/${this.roomId}/answer`);
      onValue(answerRef, async (snapshot) => {
        const answer = snapshot.val();
        if (answer && peerConnection && !peerConnection.currentRemoteDescription) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          this.onCallConnected();
        }
      });

      // Listen for callee ICE candidates
      const calleeCandidatesRef = ref(db, `calls/${this.roomId}/calleeCandidates`);
      onChildAdded(calleeCandidatesRef, (snapshot) => {
        if (peerConnection) {
          const candidate = new RTCIceCandidate(snapshot.val());
          peerConnection.addIceCandidate(candidate).catch(() => {});
        }
      });

      // Listen for call status changes
      const statusRef = ref(db, `calls/${this.roomId}/status`);
      onValue(statusRef, (snapshot) => {
        const status = snapshot.val();
        if (status === 'ended') {
          this.endCall(false);
        }
      });

      // Connection state
      peerConnection.onconnectionstatechange = () => {
        if (peerConnection?.connectionState === 'disconnected' || 
            peerConnection?.connectionState === 'failed') {
          this.endCall();
        }
      };

    } catch (error) {
      console.error('Error starting call:', error);
      this.callbacks.onError('Could not access microphone. Please allow microphone permissions.');
      this.cleanup();
    }
  }

  async acceptCall() {
    try {
      this.isCaller = false;
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      peerConnection = new RTCPeerConnection(ICE_SERVERS);

      // Add local audio
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      // Handle remote audio
      peerConnection.ontrack = (event) => {
        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        audio.play().catch(() => {});
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const candidatesRef = ref(db, `calls/${this.roomId}/calleeCandidates`);
          push(candidatesRef, event.candidate.toJSON());
        }
      };

      // Get the offer
      const callSnapshot = await new Promise((resolve) => {
        onValue(this.callRef, (snapshot) => resolve(snapshot), { onlyOnce: true });
      });
      const callData = callSnapshot.val();

      if (!callData?.offer) {
        throw new Error('No offer found');
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(callData.offer));

      // Create and send answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      await set(ref(db, `calls/${this.roomId}/answer`), {
        type: answer.type,
        sdp: answer.sdp
      });

      await set(ref(db, `calls/${this.roomId}/status`), 'connected');

      // Listen for caller ICE candidates
      const callerCandidatesRef = ref(db, `calls/${this.roomId}/callerCandidates`);
      onChildAdded(callerCandidatesRef, (snapshot) => {
        if (peerConnection) {
          const candidate = new RTCIceCandidate(snapshot.val());
          peerConnection.addIceCandidate(candidate).catch(() => {});
        }
      });

      // Listen for call status
      const statusRef = ref(db, `calls/${this.roomId}/status`);
      onValue(statusRef, (snapshot) => {
        const status = snapshot.val();
        if (status === 'ended') {
          this.endCall(false);
        }
      });

      // Connection state
      peerConnection.onconnectionstatechange = () => {
        if (peerConnection?.connectionState === 'disconnected' || 
            peerConnection?.connectionState === 'failed') {
          this.endCall();
        }
      };

      this.onCallConnected();

    } catch (error) {
      console.error('Error accepting call:', error);
      this.callbacks.onError('Could not access microphone. Please allow microphone permissions.');
      this.cleanup();
    }
  }

  declineCall() {
    set(ref(db, `calls/${this.roomId}/status`), 'ended');
    setTimeout(() => remove(this.callRef), 1000);
  }

  onCallConnected() {
    callStartTime = Date.now();
    this.callbacks.onCallConnected();

    callTimerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
      const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const seconds = String(elapsed % 60).padStart(2, '0');
      const timerEl = document.getElementById('call-timer');
      if (timerEl) timerEl.textContent = `${minutes}:${seconds}`;
    }, 1000);
  }

  async endCall(updateDb = true) {
    if (updateDb) {
      try {
        await set(ref(db, `calls/${this.roomId}/status`), 'ended');
        setTimeout(() => remove(this.callRef), 1000);
      } catch (e) {
        console.error('Error updating call status:', e);
      }
    }
    this.cleanup();
    this.callbacks.onCallEnded();
  }

  cleanup() {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    if (callTimerInterval) {
      clearInterval(callTimerInterval);
      callTimerInterval = null;
    }
    callStartTime = null;
  }

  toggleMute() {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // returns true if muted
      }
    }
    return false;
  }

  destroy() {
    this.cleanup();
  }
}
