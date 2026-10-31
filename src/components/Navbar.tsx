import React, { useState, useEffect } from 'react';
import { Menu, Bell, LogOut, User, Check, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, title }) => {
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      fetchNotifications();
    } catch (e) {
      // ignore
    }
  };

  const profilePath = user?.role === 'ADMIN' ? '/admin/profile' : user?.role === 'STAFF' ? '/staff/profile' : '/customer/profile';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E6DDEC] px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#34243A] hover:bg-[#F3EFFF] lg:hidden transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-[#34243A] tracking-tight">{title || 'SmartSub'}</h1>
          <p className="text-xs text-[#81758A] hidden sm:block">Unified Subscription Management</p>
        </div>
      </div>

      {/* Right: Currency badge, Notifications, User Menu */}
      <div className="flex items-center gap-3">
        {/* Currency Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3EFFF] text-[#673B70] border border-[#E6DDEC] text-xs font-bold shadow-2xs">
          <span>₹</span>
          <span>INR Billing</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowUserMenu(false);
            }}
            className="relative p-2.5 rounded-xl text-[#34243A] hover:bg-[#F3EFFF] transition-colors border border-transparent hover:border-[#E6DDEC]"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-[#34243A]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#D85B69] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#E6DDEC] shadow-[0_10px_30px_rgba(103,59,112,0.15)] z-50 overflow-hidden">
              <div className="p-4 border-b border-[#E6DDEC] flex items-center justify-between bg-[#F3EFFF]/50">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#34243A]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#673B70] text-white text-xs font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-[#673B70] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#E6DDEC]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-[#81758A]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div
                      key={n._id || n.id}
                      className={`p-3.5 hover:bg-[#F3EFFF]/40 transition-colors flex items-start justify-between gap-3 ${
                        !n.read ? 'bg-[#F3EFFF]/30' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[#34243A]">{n.title}</p>
                        <p className="text-xs text-[#81758A] mt-0.5 line-clamp-2">{n.description}</p>
                        <span className="text-[10px] text-[#A77BB8] mt-1 block">
                          {new Date(n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!n.read && (
                        <button
                          onClick={() => handleMarkAsRead(n._id || n.id)}
                          className="p-1 text-[#673B70] hover:bg-[#E9DDF2] rounded-md transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-[#E6DDEC] hover:bg-[#F3EFFF] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-[#673B70] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-xs font-bold text-[#34243A] hidden md:inline-block max-w-[120px] truncate">
              {user?.name || 'Account'}
            </span>
            <ChevronDown className="w-4 h-4 text-[#81758A]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#E6DDEC] shadow-[0_10px_30px_rgba(103,59,112,0.15)] z-50 p-2">
              <div className="px-3 py-2 border-b border-[#E6DDEC]">
                <p className="text-xs font-bold text-[#34243A] truncate">{user?.name}</p>
                <p className="text-[11px] text-[#81758A] truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  to={profilePath}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#34243A] hover:bg-[#F3EFFF] hover:text-[#673B70] rounded-xl transition-colors"
                >
                  <User className="w-4 h-4 text-[#81758A]" />
                  <span>Account Profile</span>
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#D85B69] hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
