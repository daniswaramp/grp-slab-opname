
import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => Promise<void>;
  title?: string;
}

const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, onConfirm, title = 'Create Backup' }) => {
  const [backupName, setBackupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!backupName.trim()) return;
    setIsLoading(true);
    try {
      await onConfirm(backupName.trim());
      setBackupName('');
      onClose();
    } catch (error) { console.error('Backup failed:', error); alert('Failed to create backup'); } finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2"><Save size={20} className="text-blue-600" />{title}</h3>
          <button onClick={onClose} className="hover:bg-gray-100 rounded-full p-1" disabled={isLoading}><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Backup Name</label>
            <input type="text" value={backupName} onChange={(e) => setBackupName(e.target.value)} placeholder="e.g., March 2026 Complete Backup" className="w-full border border-gray-200 rounded-xl p-3 focus:border-blue-500 outline-none text-sm font-medium" autoFocus disabled={isLoading} />
          </div>
          <p className="text-xs text-gray-400">This backup will capture all opname records, stock data, locations, and system settings.</p>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} disabled={isLoading} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
            <button onClick={handleConfirm} disabled={!backupName.trim() || isLoading} className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">{isLoading ? <><Loader2 size={16} className="animate-spin" />Creating...</> : <><Save size={16} />Create Backup</>}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupModal;
