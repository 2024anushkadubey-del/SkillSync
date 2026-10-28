import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  Radio,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  Megaphone,
  Wifi,
  WifiOff
} from 'lucide-react';
import Button from './Button';
import Badge from './Badge';
import { announcementsApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';

// Format timestamp matching reference document (e.g., 20/10/2026, 12:40:39 pm)
function formatTimestamp(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export default function LiveAnnouncements({ isAdmin = false }) {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState('');
  const [publishError, setPublishError] = useState('');
  const socketRef = useRef(null);

  // Initial load of existing live announcements (if any)
  useEffect(() => {
    let isMounted = true;
    announcementsApi
      .getAll()
      .then((data) => {
        if (isMounted && data?.announcements) {
          setAnnouncements(data.announcements);
        }
      })
      .catch(() => {
        // Fallback silently if offline or initial load fails
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Establish and manage Socket.IO connection
  useEffect(() => {
    const rawUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '';
    const SOCKET_URL = rawUrl ? rawUrl.replace(/\/api\/?$/, '').replace(/\/$/, '') : '';

    // Connect to Socket.IO server (supports Vite proxy /socket.io or direct URL)
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('Connected');
      socket.emit('join-announcements');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('Disconnected');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('Connection error');
    });

    socket.on('new-announcement', (newAnnounce) => {
      setAnnouncements((previous) => {
        // Deduplicate announcement by id or exact timestamp & message
        const isDuplicate = previous.some(
          (item) =>
            (newAnnounce.id && item.id === newAnnounce.id) ||
            (item.message === newAnnounce.message && item.timestamp === newAnnounce.timestamp)
        );
        if (isDuplicate) return previous;
        return [newAnnounce, ...previous];
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('new-announcement');
      socket.disconnect();
    };
  }, []);

  // Admin Announcement Publishing Handler
  const handlePublish = async (e) => {
    if (e) e.preventDefault();

    if (!announcementMessage.trim()) {
      setPublishError('Please enter an announcement.');
      setPublishStatus('');
      return;
    }

    setPublishing(true);
    setPublishStatus('');
    setPublishError('');

    try {
      // Authenticated HTTP POST to /api/announcements using existing Axios client with JWT
      const res = await announcementsApi.publish(announcementMessage.trim());

      setAnnouncementMessage('');
      setPublishStatus(res.message || 'Announcement published successfully!');
    } catch (err) {
      setPublishError(err.message || 'Failed to publish announcement');
    } finally {
      setPublishing(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'Connected':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            Connected
          </span>
        );
      case 'Connecting...':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
            Connecting...
          </span>
        );
      case 'Connection error':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            <WifiOff className="w-3 h-3 text-rose-600" />
            Connection error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
            <WifiOff className="w-3 h-3 text-stone-500" />
            Disconnected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">

      {/* FEATURE A: ADMIN PUBLISH ANNOUNCEMENT FORM */}
      {isAdmin && (
        <div className="card-surface p-6 sm:p-7 space-y-4 border border-sand-300 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-forest-800" />
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                Admin: Publish Announcement
              </h2>
            </div>
            <Badge variant="rose" size="sm">
              Admin Only
            </Badge>
          </div>

          <form onSubmit={handlePublish} className="space-y-3.5">
            <div>
              <label htmlFor="announcementText" className="sr-only">
                Announcement Message
              </label>
              <textarea
                id="announcementText"
                rows={3}
                value={announcementMessage}
                onChange={(e) => {
                  setAnnouncementMessage(e.target.value);
                  if (publishError) setPublishError('');
                }}
                placeholder="Enter an announcement..."
                className="w-full p-3.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-all resize-y min-h-[90px]"
                disabled={publishing}
              />
            </div>

            {/* Publishing Feedback Messages */}
            {publishStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-medium text-emerald-800 animate-slide-up">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{publishStatus}</span>
              </div>
            )}

            {publishError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-medium text-rose-800 animate-slide-up">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{publishError}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-stone-400">
                Broadcasts instantly via WebSocket to all connected peers
              </span>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={publishing || !announcementMessage.trim()}
                className="font-semibold"
              >
                {publishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1.5" />
                    Publish Announcement
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* FEATURE B: LIVE ANNOUNCEMENTS STREAM */}
      <div className="card-surface p-6 sm:p-7 space-y-4 border border-sand-300 shadow-sm animate-fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-forest-800 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              Live Announcements
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
          </div>
        </div>

        {/* Announcements List Container */}
        <div className="space-y-3 min-h-[100px]">
          {announcements.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400 bg-sand-50/50 rounded-xl border border-dashed border-stone-200">
              <p>No new announcements yet. Updates will appear here in real time.</p>
            </div>
          ) : (
            announcements.map((item, index) => (
              <div
                key={item.id || `${item.timestamp}-${index}`}
                className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs hover:border-forest-200 transition-all space-y-2 animate-slide-up"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-stone-900 leading-relaxed break-words whitespace-pre-wrap">
                    {item.message}
                  </p>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-forest-100 text-forest-900 shrink-0">
                    Live
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-1 border-t border-stone-100">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-mono text-[11px]">
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
