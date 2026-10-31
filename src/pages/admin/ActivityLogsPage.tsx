import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Shield, User, Clock } from 'lucide-react';
import { api } from '../../api/client';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';

export const ActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/activity-logs?search=${encodeURIComponent(search)}&role=${roleFilter}`);
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, roleFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#34243A] tracking-tight">System Activity & Audit Logs</h2>
        <p className="text-xs text-[#81758A] mt-0.5">
          Immutable audit record of all authentication, configuration, payment and subscription actions.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DDEC] shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#81758A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, user or details..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E6DDEC] bg-white text-xs text-[#34243A] focus:outline-none focus:border-[#673B70]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#81758A]" />
          <span className="text-xs font-semibold text-[#81758A]">Actor Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E6DDEC] text-xs font-bold text-[#34243A] bg-white focus:outline-none focus:border-[#673B70]"
          >
            <option value="all">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STAFF">STAFF</option>
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="SYSTEM">SYSTEM</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          title="No Logs Found"
          description="System actions will be recorded here automatically."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EFFF] text-[#81758A] uppercase tracking-wider font-bold border-b border-[#E6DDEC]">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DDEC]">
                {logs.map((log) => (
                  <tr key={log._id || log.id} className="hover:bg-[#F3EFFF]/40 transition-colors">
                    <td className="py-3.5 px-4 text-[#81758A] whitespace-nowrap">
                      {new Date(log.timestamp || Date.now()).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#34243A]">
                      {log.userName || 'System'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={log.userRole || 'SYSTEM'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#673B70]">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 text-[#34243A]">
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
