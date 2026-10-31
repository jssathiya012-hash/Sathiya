import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Clock, Info, ShieldAlert, Sparkles } from 'lucide-react';
import { api } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#34243A] tracking-tight">Notifications Center</h2>
          <p className="text-xs text-[#81758A] mt-0.5">
            System updates, billing events, renewal alerts, and administrative dispatches.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-[#F3EFFF] hover:bg-[#E9DDF2] text-[#673B70] text-xs font-bold border border-[#D8C2E5] flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No Notifications"
          description="You are completely up to date. Important billing and renewal alerts will arrive here."
          icon={Bell}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] divide-y divide-[#E6DDEC] overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n._id || n.id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                !n.read ? 'bg-[#F3EFFF]/40' : 'hover:bg-gray-50/50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                    !n.read ? 'bg-[#673B70] text-white' : 'bg-[#F3EFFF] text-[#81758A]'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#34243A]">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#673B70] animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-[#81758A] mt-1 leading-relaxed">{n.description}</p>
                  <span className="text-[10px] text-[#A77BB8] mt-2 block font-medium">
                    {new Date(n.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkAsRead(n._id || n.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#673B70] hover:bg-[#E9DDF2] transition-colors shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
