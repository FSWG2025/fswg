import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Video,
  Copy,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  Users,
} from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { socketOrigin } from "@/lib/socketOrigin";
import ClientToolShell from "@/components/client/ClientToolShell";
import { useAuth } from "@/hooks/AuthProvider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PeerInfo = { socketId: string; userId?: string; name?: string };

const iceServers: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export default function VideoRooms() {
  const { user } = useAuth();
  const defaultRoom = useMemo(
    () => `FSWG-${String(user?._id || "guest").slice(-8)}-consult`,
    [user?._id]
  );
  const [room, setRoom] = useState(defaultRoom);
  const [joined, setJoined] = useState(false);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const roomSlug = room.replace(/[^a-zA-Z0-9-_]/g, "-") || defaultRoom;

  const attachRemoteTrack = useCallback((track: MediaStreamTrack) => {
    if (!remoteStreamRef.current) {
      remoteStreamRef.current = new MediaStream();
    }
    remoteStreamRef.current.addTrack(track);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, []);

  const createPeerConnection = useCallback(
    (remoteSocketId: string, polite: boolean) => {
      if (pcsRef.current.has(remoteSocketId)) {
        return pcsRef.current.get(remoteSocketId)!;
      }

      const pc = new RTCPeerConnection({ iceServers });
      pcsRef.current.set(remoteSocketId, pc);

      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("video:signal", {
            to: remoteSocketId,
            data: { type: "ice", candidate: event.candidate },
          });
        }
      };

      pc.ontrack = (event) => {
        event.streams[0]?.getTracks().forEach(attachRemoteTrack);
        if (!event.streams[0] && event.track) attachRemoteTrack(event.track);
      };

      pc.onnegotiationneeded = async () => {
        if (!polite) return;
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current?.emit("video:signal", {
            to: remoteSocketId,
            data: { type: "offer", sdp: pc.localDescription },
          });
        } catch (err) {
          console.error("negotiation error", err);
        }
      };

      return pc;
    },
    [attachRemoteTrack]
  );

  const cleanupCall = useCallback(() => {
    pcsRef.current.forEach((pc) => pc.close());
    pcsRef.current.clear();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    socketRef.current?.emit("video:leave");
    socketRef.current?.disconnect();
    socketRef.current = null;
    setPeers([]);
    setJoined(false);
    setConnecting(false);
  }, []);

  const joinCall = async () => {
    setConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: "user" },
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const socket = io(socketOrigin(), {
        path: "/socket.io",
        withCredentials: true,
        transports: ["websocket", "polling"],
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("video:join", {
          roomId: roomSlug,
          userId: user?._id,
          name: user?.name || "Client",
        });
        setJoined(true);
        setConnecting(false);
        toast.success("Joined video room");
      });

      socket.on("video:peers", (list: PeerInfo[]) => {
        setPeers(list);
        list.forEach((p) => {
          createPeerConnection(p.socketId, true);
        });
      });

      socket.on("video:peer-joined", (peer: PeerInfo) => {
        setPeers((prev) =>
          prev.some((p) => p.socketId === peer.socketId) ? prev : [...prev, peer]
        );
        createPeerConnection(peer.socketId, false);
      });

      socket.on("video:peer-left", ({ socketId }: { socketId: string }) => {
        setPeers((prev) => prev.filter((p) => p.socketId !== socketId));
        const pc = pcsRef.current.get(socketId);
        pc?.close();
        pcsRef.current.delete(socketId);
      });

      socket.on(
        "video:signal",
        async ({ from, data }: { from: string; data: any }) => {
          const pc = createPeerConnection(from, false);
          try {
            if (data.type === "offer") {
              await pc.setRemoteDescription(data.sdp);
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              socket.emit("video:signal", {
                to: from,
                data: { type: "answer", sdp: pc.localDescription },
              });
            } else if (data.type === "answer") {
              await pc.setRemoteDescription(data.sdp);
            } else if (data.type === "ice" && data.candidate) {
              await pc.addIceCandidate(data.candidate);
            }
          } catch (err) {
            console.error("signal error", err);
          }
        }
      );

      socket.on("connect_error", () => {
        toast.error("Could not connect to signaling server");
        cleanupCall();
      });
    } catch {
      toast.error("Camera or microphone permission denied");
      setConnecting(false);
    }
  };

  useEffect(() => () => cleanupCall(), [cleanupCall]);

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCamOn(track.enabled);
  };

  const copyInvite = async () => {
    const link = `${window.location.origin}/app/video?room=${encodeURIComponent(roomSlug)}`;
    await navigator.clipboard.writeText(link);
    toast.success("Invite link copied");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("room");
    if (r) setRoom(r);
  }, []);

  return (
    <ClientToolShell
      eyebrow="In-app · 02"
      title="Video rooms"
      description="Real-time consultation rooms powered by Socket.IO signaling and WebRTC: no third-party tab required."
      icon={Video}
      actions={
        joined ? (
          <button
            type="button"
            onClick={cleanupCall}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <PhoneOff className="h-4 w-4" /> Leave
          </button>
        ) : null
      }
    >
      {!joined ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="text-lg font-bold text-[#12213E]">Create or join a room</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Share your room name with your advisor. Socket.IO keeps signaling live;
              video streams peer-to-peer.
            </p>
            <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Room name
              <input
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="mt-2 w-full border-0 border-b border-[#E5EAF0] bg-transparent px-1 py-3 text-sm font-medium text-[#12213E] outline-none focus:border-[#C69259]"
              />
            </label>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={joinCall}
                disabled={connecting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#12213E] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Phone className="h-4 w-4" />
                {connecting ? "Connecting…" : "Join video call"}
              </button>
              <button
                type="button"
                onClick={copyInvite}
                className="inline-flex items-center gap-2 rounded-xl bg-[#F3DFC7] px-5 py-3 text-sm font-semibold text-[#12213E]"
              >
                <Copy className="h-4 w-4" />
                Copy invite link
              </button>
            </div>
          </div>
          <div className="rounded-2xl bg-[#12213E] p-5 text-white lg:col-span-2">
            <h3 className="font-bold">Before you join</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>Allow camera and microphone when prompted.</li>
              <li>Use headphones in a quiet space.</li>
              <li>Have ID and income docs ready if discussing rentals.</li>
              <li>You can also message your advisor from Messages.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-[#12213E]">{roomSlug}</p>
              <p className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <Users className="h-3.5 w-3.5" />
                {peers.length + 1} in room
                {peers.length
                  ? ` · with ${peers.map((p) => p.name || "Guest").join(", ")}`
                  : " · waiting for others"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleMic}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  micOn ? "bg-[#EEF2F6] text-[#12213E]" : "bg-red-100 text-red-600"
                )}
                aria-label={micOn ? "Mute" : "Unmute"}
              >
                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={toggleCam}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  camOn ? "bg-[#EEF2F6] text-[#12213E]" : "bg-red-100 text-red-600"
                )}
                aria-label={camOn ? "Stop camera" : "Start camera"}
              >
                {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="relative grid gap-3 overflow-hidden rounded-2xl bg-[#0B1220] p-2 sm:grid-cols-2 sm:p-3">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
              {!peers.length && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-white/50">
                  Waiting for participant…
                </div>
              )}
              <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white">
                {peers[0]?.name || "Remote"}
              </span>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover mirror"
              />
              <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white">
                You
              </span>
            </div>
          </div>
        </div>
      )}
    </ClientToolShell>
  );
}
