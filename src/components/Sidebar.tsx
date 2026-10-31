import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Package,
  Layers,
  Repeat,
  Tag,
  CreditCard,
  FileText,
  BarChart3,
  History,
  Bell,
  Settings,
  User,
  ShoppingBag,
  LifeBuoy
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const role = user?.role || 'CUSTOMER';

  const adminNav = [
    { section: 'Overview' },
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { section: 'Management' },
    { name: 'Staff Management', path: '/admin/staff', icon: UserCheck },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Subscription Plans', path: '/admin/plans', icon: Layers },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: Repeat },
    { name: 'Discounts & Offers', path: '/admin/discounts', icon: Tag },
    { section: 'Billing & Logs' },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Invoices', path: '/admin/invoices', icon: FileText },
    { name: 'Activity Logs', path: '/admin/activity-logs', icon: History },
    { section: 'Preferences' },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Company Settings', path: '/admin/settings', icon: Settings },
    { name: 'Admin Profile', path: '/admin/profile', icon: User },
  ];

  const staffNav = [
    { section: 'Workspace' },
    { name: 'Staff Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Customers', path: '/staff/customers', icon: Users },
    { name: 'Managed Subscriptions', path: '/staff/subscriptions', icon: Repeat },
    { section: 'Records' },
    { name: 'Invoices', path: '/staff/invoices', icon: FileText },
    { name: 'Payments', path: '/staff/payments', icon: CreditCard },
    { section: 'Account' },
    { name: 'Staff Profile', path: '/staff/profile', icon: User },
  ];

  const customerNav = [
    { section: 'My Portal' },
    { name: 'Customer Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Browse Products', path: '/customer/products', icon: ShoppingBag },
    { name: 'Subscription Plans', path: '/customer/plans', icon: Layers },
    { section: 'Subscriptions & Billing' },
    { name: 'My Subscriptions', path: '/customer/subscriptions', icon: Repeat },
    { name: 'Payment History', path: '/customer/payments', icon: CreditCard },
    { name: 'My Invoices', path: '/customer/invoices', icon: FileText },
    { section: 'Personal' },
    { name: 'Notifications', path: '/customer/notifications', icon: Bell },
    { name: 'Account Profile', path: '/customer/profile', icon: User },
  ];

  const navItems = role === 'ADMIN' ? adminNav : role === 'STAFF' ? staffNav : customerNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-[#E6DDEC] transition-transform duration-300 ease-in-out flex flex-col shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E6DDEC] flex items-center justify-between bg-gradient-to-b from-[#F3EFFF] to-white">
          <BrandLogo size="md" />
        </div>

        {/* User Badge Info */}
        <div className="px-5 py-3.5 mx-4 mt-4 rounded-xl bg-[#F3EFFF] border border-[#E6DDEC] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#673B70] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#34243A] truncate">{user?.name || 'User'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                role === 'ADMIN' ? 'bg-[#4B2455] text-white' :
                role === 'STAFF' ? 'bg-[#673B70] text-[#E9DDF2]' : 'bg-[#E9DDF2] text-[#4B2455]'
              }`}>
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navItems.map((item, idx) => {
            if (item.section) {
              return (
                <div key={idx} className="pt-4 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-[#81758A]">
                  {item.section}
                </div>
              );
            }
            const Icon = item.icon!;
            return (
              <NavLink
                key={item.path}
                to={item.path!}
                onClick={() => { if (window.innerWidth < 1024 && onClose) onClose(); }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#673B70] text-white shadow-[0_4px_12px_rgba(103,59,112,0.25)]'
                      : 'text-[#34243A] hover:bg-[#F3EFFF] hover:text-[#673B70]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#E9DDF2]' : 'text-[#81758A]'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Support Info */}
        <div className="p-4 border-t border-[#E6DDEC] bg-[#F3EFFF]/50 text-xs text-[#81758A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-[#673B70]" />
            <span>Support: 1800-SMARTSUB</span>
          </div>
          <span className="text-[10px] font-semibold text-[#673B70]">v2.4.0</span>
        </div>
      </aside>
    </>
  );
};
