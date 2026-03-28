
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { UserRole, Location, LockStatus } from './types';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import OpnameSlab from './components/OpnameSlab';
import OpnameList from './components/OpnameList';
import Setting from './components/Setting';
import Database from './components/Database';
import DatabaseSetup from './components/DatabaseSetup';
import LockBanner from './components/LockBanner';
import { Minus, Plus, Lock, Unlock, X, Info } from 'lucide-react';
import { getSystemNotification, getLockStatus, setLockMode } from './services/dataService';

const App: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('slab_opname_user'));
  const [role, setRole] = useState<UserRole>(localStorage.getItem('slab_opname_role') as UserRole || UserRole.USER);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [locations, setLocations] = useState<Location[]>([]);
  const [isDbReady, setIsDbReady] = useState<boolean | null>(null);
  const [uiScale, setUiScale] = useState<number>(Number(localStorage.getItem('slab_ui_scale')) || 1);
  
  const [globalSearchInput, setGlobalSearchInput] = useState('');
  const [globalSelectedBatchId, setGlobalSelectedBatchId] = useState<string | null>(null);
  const [lastManualInput, setLastManualInput] = useState('');

  const [tempName, setTempName] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  // Notification State
  const [notification, setNotification] = useState('');
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  // Lock State
  const [lockStatus, setLockStatus] = useState<LockStatus>({ lock_mode: false, locked_at: null, locked_by: null });
  const [togglingLock, setTogglingLock] = useState(false);

  useEffect(() => {
    checkDatabase();
    fetchLockStatus();
  }, []);

  const handleLogout = useCallback(() => {
    setUserName(null);
    setTempName('');
    setPassword('');
    setIsAdminLogin(false);
    localStorage.removeItem('slab_opname_user');
    localStorage.removeItem('slab_opname_role');
    sessionStorage.removeItem('hasSeenNotification');
  }, []);

  // Real-time listeners & Notification
  useEffect(() => {
    if (!userName || !isDbReady) return;

    // Fetch initial notification
    getSystemNotification().then(text => {
      setNotification(text);
      if (text && !sessionStorage.getItem('hasSeenNotification')) {
        setShowNotificationPopup(true);
        sessionStorage.setItem('hasSeenNotification', 'true');
      }
    });

    // 1. Kick Signal Listener
    const systemChannel = supabase.channel('system-signals')
      .on('broadcast', { event: 'KICK_USER' }, ({ payload }) => {
        if (payload.name === userName) {
          alert("SECURITY ALERT: Your session has been terminated by the Administrator.");
          handleLogout();
        }
      })
      .subscribe();

    // 2. Locations Real-time Sync
    const locationChannel = supabase.channel('locations-realtime')
      .on('postgres_changes', { event: '*', table: 'locations', schema: 'public' }, () => {
        fetchInitialData();
      })
      .subscribe();

    // 3. Settings Real-time Sync
    const settingsChannel = supabase.channel('settings-realtime')
      .on('postgres_changes', { event: '*', table: 'system_settings', schema: 'public' }, (payload) => {
        const newText = (payload.new as any).notification_text || '';
        setNotification(newText);
        
        // Also update lock status from realtime
        if (payload.new) {
          setLockStatus({
            lock_mode: (payload.new as any).lock_mode ?? false,
            locked_at: (payload.new as any).locked_at ?? null,
            locked_by: (payload.new as any).locked_by ?? null
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(systemChannel);
      supabase.removeChannel(locationChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [userName, isDbReady, handleLogout]);

  const checkDatabase = async () => {
    try {
      const { error } = await supabase.from('sap_stock').select('id').limit(1);
      if (error && (error.code === 'PGRST205' || error.message.includes('not found'))) {
        setIsDbReady(false);
      } else {
        setIsDbReady(true);
      }
    } catch (e) {
      setIsDbReady(false);
    }
  };

  useEffect(() => {
    if (userName && isDbReady) {
      updateUserStatus(userName, true); // Initial login = true
      fetchInitialData();
      const interval = setInterval(() => updateUserStatus(userName, false), 60000); // Heartbeat = false
      return () => clearInterval(interval);
    }
  }, [userName, isDbReady]);

  const fetchInitialData = async () => {
    const { data: locs } = await supabase.from('locations').select('*').order('name');
    setLocations(locs || []);
  };

  const fetchLockStatus = async () => {
    try {
      const status = await getLockStatus();
      setLockStatus(status);
    } catch (error) {
      console.error('Failed to fetch lock status:', error);
    }
  };

  const handleToggleLock = async () => {
    if (!userName || role !== UserRole.ADMIN) return;
    
    setTogglingLock(true);
    try {
      const newLockState = !lockStatus.lock_mode;
      await setLockMode(newLockState, userName);
      await fetchLockStatus();
    } catch (error) {
      console.error('Failed to toggle lock:', error);
      alert('Failed to update lock status');
    } finally {
      setTogglingLock(false);
    }
  };

  const updateUserStatus = async (name: string, isInitial: boolean) => {
    try {
      if (isInitial) {
        await supabase.from('users_online').upsert([{ 
          name, 
          last_seen: new Date().toISOString() 
        }], { onConflict: 'name' });
      } else {
        // Heartbeat: Update only. If user missing (deleted by admin), logout.
        const { data, error } = await supabase
          .from('users_online')
          .update({ last_seen: new Date().toISOString() })
          .eq('name', name)
          .select();
        
        if (!error && data && data.length === 0) {
          alert("Session terminated by Administrator.");
          handleLogout();
        }
      }
    } catch (e) {
      console.warn("User status update failed", e);
    }
  };

  const handleNameInput = (val: string) => {
    setTempName(val);
    if (val.trim().toLowerCase() === 'admin') {
      setIsAdminLogin(true);
    } else {
      setIsAdminLogin(false);
      setPassword('');
    }
  };

  const attemptLogin = () => {
    const name = tempName.trim();
    if (!name) return;

    if (name.toLowerCase() === 'admin') {
      if (password === 'admin') {
        processLogin(name, UserRole.ADMIN);
      } else {
        alert("Invalid Admin Password");
      }
    } else {
      processLogin(name, UserRole.USER);
    }
  };

  const processLogin = (name: string, userRole: UserRole) => {
    setUserName(name);
    setRole(userRole);
    localStorage.setItem('slab_opname_user', name);
    localStorage.setItem('slab_opname_role', userRole);
  };

  const adjustScale = (delta: number) => {
    const newScale = Math.min(Math.max(uiScale + delta, 0.6), 1.4);
    setUiScale(newScale);
    localStorage.setItem('slab_ui_scale', newScale.toString());
  };

  const LOGO_URL = "https://myjourney-api.atmajaya.ac.id/storage/20240705/0fecce437f9e4991781ea0291336233e89f7a14f.png";

  if (isDbReady === false) {
    return <DatabaseSetup onRetry={checkDatabase} />;
  }

  if (isDbReady === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="animate-pulse text-blue-600 font-bold tracking-widest text-sm text-center px-4 uppercase">Initializing System</div>
        </div>
      </div>
    );
  }

  if (!userName) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-w-sm w-full border border-gray-100 animate-slideUp">
          <div className="flex justify-center mb-6">
             <img src={LOGO_URL} alt="GRP" className="h-16 object-contain" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">System Access</h2>
          <p className="text-xs text-gray-400 mb-8 text-center uppercase tracking-widest font-bold">PPIC Slab Stock Opname</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">User Name</label>
              <input 
                type="text" 
                placeholder="Enter User Name"
                autoFocus
                value={tempName}
                onChange={(e) => handleNameInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-4 focus:ring-blue-50 outline-none transition-all focus:border-blue-500 text-gray-900 bg-white"
                onKeyDown={(e) => e.key === 'Enter' && (!isAdminLogin ? attemptLogin() : null)}
              />
            </div>

            {isAdminLogin && (
              <div className="animate-fadeIn">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">
                  <Lock size={10}/> Admin Password
                </label>
                <input 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-4 focus:ring-blue-50 outline-none transition-all focus:border-blue-500 text-gray-900 bg-white"
                  onKeyDown={(e) => e.key === 'Enter' && attemptLogin()}
                />
              </div>
            )}

            <button 
              onClick={attemptLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95 mt-4"
            >
              Access System
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      style={{ zoom: uiScale }}
    >
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden shrink-0">
            <img src={LOGO_URL} alt="GRP" className="h-8 md:h-10 object-contain" />
            <div className="h-6 w-[1px] bg-gray-200 hidden xs:block"></div>
            <div className="hidden sm:block">
              <h1 className="text-xs md:text-sm font-black text-gray-900 truncate uppercase tracking-tighter">PPIC Slab Stock Opname</h1>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Reconciliation Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6 shrink-0">
            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
              <button onClick={() => adjustScale(-0.1)} className="p-1.5 hover:bg-white rounded transition-colors text-gray-600"><Minus size={14}/></button>
              <div className="px-2 text-[10px] font-bold text-gray-400 select-none min-w-[35px] text-center">{Math.round(uiScale * 100)}%</div>
              <button onClick={() => adjustScale(0.1)} className="p-1.5 hover:bg-white rounded transition-colors text-gray-600"><Plus size={14}/></button>
            </div>

            <div className="flex items-center gap-2 md:gap-3 md:border-r md:pr-6 border-gray-100">
              {role === UserRole.ADMIN && (
                <button
                  onClick={handleToggleLock}
                  disabled={togglingLock}
                  className={`p-2 rounded-lg transition-all ${
                    lockStatus.lock_mode 
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  title={lockStatus.lock_mode ? 'Unlock System' : 'Lock System'}
                >
                  {togglingLock ? (
                    <Minus size={16} className="animate-spin" />
                  ) : lockStatus.lock_mode ? (
                    <Lock size={16} />
                  ) : (
                    <Unlock size={16} />
                  )}
                </button>
              )}
              <div className="text-right hidden xs:block">
                <p className="text-xs font-bold text-gray-900">{userName}</p>
                <p className="text-[9px] uppercase tracking-wider text-blue-500 font-black">{role}</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-[10px] md:text-xs font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              Sign Out
            </button>
          </div>
        </div>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <LockBanner 
          isLocked={lockStatus.lock_mode}
          lockedBy={lockStatus.locked_by}
          lockedAt={lockStatus.locked_at}
          role={role}
          onToggleLock={handleToggleLock}
        />
      </header>

      <main className="flex-1 overflow-auto bg-white">
        <div className="max-w-7xl mx-auto w-full p-3 md:p-8 origin-top">
          {activeTab === 'Dashboard' && <Dashboard userName={userName} role={role} notification={notification} />}
          {activeTab === 'Opname Slab' && (
            <OpnameSlab 
              userName={userName} 
              locations={locations} 
              searchInput={globalSearchInput}
              setSearchInput={setGlobalSearchInput}
              selectedBatchId={globalSelectedBatchId}
              setSelectedBatchId={setGlobalSelectedBatchId}
              lastManualInput={lastManualInput}
              setLastManualInput={setLastManualInput}
              isLocked={lockStatus.lock_mode}
            />
          )}
          {activeTab === 'Opname List' && <OpnameList role={role} userName={userName} isLocked={lockStatus.lock_mode} />}
          {activeTab === 'Setting' && <Setting role={role} locations={locations} currentUserName={userName} onRefresh={fetchInitialData} isLocked={lockStatus.lock_mode} />}
          {activeTab === 'Database' && <Database role={role} isLocked={lockStatus.lock_mode} userName={userName} />}
        </div>
      </main>

      {/* Notification Login Popup */}
      {showNotificationPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp border border-yellow-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-yellow-600 flex items-center gap-2">
                <Info size={20} className="fill-yellow-100 stroke-yellow-600"/> SYSTEM ANNOUNCEMENT
              </h3>
              <button onClick={() => setShowNotificationPopup(false)} className="hover:bg-gray-100 rounded-full p-1"><X size={20}/></button>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl text-sm font-medium text-gray-800 whitespace-pre-wrap">
              {notification}
            </div>
            <button
              onClick={() => setShowNotificationPopup(false)}
              className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl transition-all"
            >
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
