
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { addLocation, deleteLocation, kickAndRemoveUser } from '../services/dataService';
import { Location, UserRole } from '../types';
import { Plus, Trash2, MapPin, Users, ShieldAlert, Circle, RefreshCcw } from 'lucide-react';

interface Props {
  role: UserRole;
  locations: Location[];
  currentUserName: string;
  onRefresh: () => void;
  isLocked?: boolean;
}

const Setting: React.FC<Props> = ({ role, locations, currentUserName, onRefresh, isLocked = false }) => {
  const [newLocation, setNewLocation] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    const sub = supabase.channel('settings-users-view')
      .on('postgres_changes', { event: '*', table: 'users_online', schema: 'public' }, () => { fetchUsers(); })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('users_online').select('*').order('last_seen', { ascending: false });
    setUsers(data || []);
    setIsLoading(false);
  };

  const handleAddLocation = async () => {
    const trimmed = newLocation.trim();
    if (!trimmed) return;
    if (locations.some(l => l.name.toLowerCase() === trimmed.toLowerCase())) { alert("This location already exists."); return; }
    setIsSubmitting(true);
    try {
      await addLocation(trimmed);
      setNewLocation('');
      onRefresh();
    } catch (e: any) { console.error(e); alert('Error adding location: ' + (e.message || 'Unknown error')); }
    setIsSubmitting(false);
  };

  const handleDeleteLocation = async (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      try { await deleteLocation(id); onRefresh(); } catch (e) { alert('Error deleting location'); }
    }
  };

  const handleDeleteUser = async (name: string) => {
    if (name.toLowerCase() === 'admin' || name === currentUserName) { alert("System Protection: Cannot delete the master admin account or your own current session."); return; }
    if (confirm(`FORCE DISCONNECT: Are you sure you want to log out and remove "${name}"?`)) {
      setIsLoading(true);
      try {
        await kickAndRemoveUser(name);
        setUsers(prev => prev.filter(u => u.name !== name));
        alert(`User "${name}" has been kicked and removed.`);
      } catch (e) { console.error("Delete user failed:", e); alert('Failed to remove user.'); }
      setIsLoading(false);
    }
  };

  const getUserStatus = (lastSeen: string) => {
    const lastSeenDate = new Date(lastSeen).getTime();
    const now = new Date().getTime();
    return now - lastSeenDate < 5 * 60 * 1000;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white p-4 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Users className="text-blue-600" size={24} /> User Database & Management</h2>
          <button onClick={fetchUsers} className={`p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-50 transition-all ${isLoading ? 'animate-spin' : ''}`}><RefreshCcw size={18} /></button>
        </div>
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
              <tr><th className="px-6 py-4">User Name</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Last Active</th>{role === UserRole.ADMIN && <th className="px-6 py-4 text-center">Action</th>}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => {
                const active = getUserStatus(u.last_seen);
                const isProtected = u.name.toLowerCase() === 'admin' || u.name === currentUserName;
                return (
                  <tr key={u.name} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4 font-bold text-gray-700">{u.name}{u.name === currentUserName && <span className="ml-2 text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase">You</span>}</td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><Circle size={8} className={`fill-current ${active ? 'text-green-500' : 'text-gray-300'}`} /><span className={active ? 'text-green-600 font-bold' : 'text-gray-400'}>{active ? 'Online' : 'Offline'}</span></div></td>
                    <td className="px-6 py-4 text-xs text-gray-500">{new Date(u.last_seen).toLocaleString()}</td>
                    {role === UserRole.ADMIN && !isLocked && (
                      <td className="px-6 py-4 text-center">
                        {!isProtected ? (<button onClick={() => handleDeleteUser(u.name)} className="text-gray-300 hover:text-red-500 p-2 transition-colors" title="Force Logout User"><Trash2 size={16} /></button>) : (<div className="text-gray-200" title="System protected account"><Trash2 size={16} className="opacity-20 cursor-not-allowed" /></div>)}
                      </td>
                    )}
                  </tr>
                );
              })}
              {users.length === 0 && !isLoading && (<tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">No users registered yet</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-4 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><MapPin className="text-blue-600" size={24} /> Location Management</h2>
        {role === UserRole.ADMIN ? (
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input type="text" placeholder="e.g. Warehouse A..." value={newLocation} onChange={(e) => setNewLocation(e.target.value)} disabled={isLocked} className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black disabled:bg-gray-100" onKeyDown={(e) => e.key === 'Enter' && !isLocked && handleAddLocation()} />
            <button disabled={isSubmitting || isLocked} onClick={handleAddLocation} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed"><Plus size={18} /> {isSubmitting ? 'ADDING...' : 'ADD'}</button>
          </div>
        ) : (
          <div className="bg-blue-50 text-blue-600 p-4 rounded-xl text-sm mb-8 flex items-center gap-2"><ShieldAlert size={16}/> <strong>Standard View:</strong> Read-only access.</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {locations.map(loc => (
            <div key={loc.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white hover:shadow-md transition-all">
              <span className="font-semibold text-gray-700">{loc.name}</span>
              {role === UserRole.ADMIN && !isLocked && (<button onClick={() => handleDeleteLocation(loc.id)} className="text-gray-300 hover:text-red-500 p-2 transition-colors"><Trash2 size={16} /></button>)}
            </div>
          ))}
          {locations.length === 0 && (<div className="col-span-full py-10 text-center text-gray-400 italic">No locations defined.</div>)}
        </div>
      </div>
    </div>
  );
};

export default Setting;
