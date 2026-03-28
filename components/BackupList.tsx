
import React, { useState, useEffect } from 'react';
import { RotateCcw, Trash2, Loader2, AlertTriangle, X } from 'lucide-react';
import { getComprehensiveBackups, loadComprehensiveBackup, deleteBackup, ComprehensiveBackup } from '../services/dataService';

interface BackupListProps {
  onRefresh?: () => void;
  onLoadSuccess?: () => void;
  onClose?: () => void;
}

const BackupList: React.FC<BackupListProps> = ({ onRefresh, onLoadSuccess, onClose }) => {
  const [backups, setBackups] = useState<ComprehensiveBackup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadModal, setLoadModal] = useState<ComprehensiveBackup | null>(null);
  const [deleteModal, setDeleteModal] = useState<ComprehensiveBackup | null>(null);

  const fetchBackups = async () => {
    setIsLoading(true);
    try {
      const data = await getComprehensiveBackups();
      setBackups(data);
    } catch (error) { console.error('Failed to fetch backups:', error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleLoad = async (id: string) => {
    setLoadingId(id);
    try {
      await loadComprehensiveBackup(id);
      setLoadModal(null);
      onLoadSuccess?.();
      alert('Backup loaded successfully!');
    } catch (error) { console.error('Failed to load backup:', error); alert('Failed to load backup'); } finally { setLoadingId(null); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteBackup(id); setDeleteModal(null); fetchBackups(); onRefresh?.(); } catch (error) { console.error('Failed to delete backup:', error); alert('Failed to delete backup'); }
  };

  if (isLoading) { return (<div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-blue-600" size={24} /></div>); }
  if (backups.length === 0) { return (<div className="text-center py-8 text-gray-400"><p className="text-sm">No backups available</p></div>); }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100"><h3 className="font-bold text-gray-800">Load Backup</h3>{onClose && <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>}</div>
      <div className="space-y-2">
        {backups.map((backup) => (
          <div key={backup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm truncate">{backup.name}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1"><span>{new Date(backup.created_at).toLocaleDateString()}</span><span>{backup.record_count} records</span><span>by {backup.created_by}</span></div>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <button onClick={() => setLoadModal(backup)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">LOAD</button>
              <button onClick={() => setDeleteModal(backup)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors">DELETE</button>
            </div>
          </div>
        ))}
      </div>

      {loadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-black text-gray-800 flex items-center gap-2"><RotateCcw size={20} className="text-blue-600" /> Load Backup</h3><button onClick={() => setLoadModal(null)} className="hover:bg-gray-100 rounded-full p-1"><X size={20} /></button></div>
            <div className="mb-4 p-4 bg-blue-50 rounded-xl"><p className="font-bold text-gray-800 text-sm">{loadModal.name}</p><div className="flex items-center gap-3 text-xs text-gray-500 mt-1"><span>{new Date(loadModal.created_at).toLocaleDateString()}</span><span>{loadModal.record_count} records</span><span>by {loadModal.created_by}</span></div></div>
            <p className="text-sm text-amber-600 mb-4 bg-amber-50 p-3 rounded-xl"><AlertTriangle size={14} className="inline mr-1.5" />This will replace all current opname records with this backup.</p>
            <div className="flex gap-2">
              <button onClick={() => setLoadModal(null)} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={() => handleLoad(loadModal.id)} disabled={loadingId === loadModal.id} className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">{loadingId === loadModal.id ? <><Loader2 size={16} className="animate-spin" />Loading...</> : <><RotateCcw size={16} />Load Backup</>}</button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-black text-gray-800 flex items-center gap-2"><Trash2 size={20} className="text-red-500" /> Delete Backup</h3><button onClick={() => setDeleteModal(null)} className="hover:bg-gray-100 rounded-full p-1"><X size={20} /></button></div>
            <div className="mb-4 p-4 bg-gray-50 rounded-xl"><p className="font-bold text-gray-800 text-sm">{deleteModal.name}</p><div className="flex items-center gap-3 text-xs text-gray-500 mt-1"><span>{new Date(deleteModal.created_at).toLocaleDateString()}</span><span>{deleteModal.record_count} records</span></div></div>
            <p className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-xl"><AlertTriangle size={14} className="inline mr-1.5" />This backup will be permanently deleted.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteModal.id)} className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 transition-colors"><Trash2 size={16} />Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupList;
