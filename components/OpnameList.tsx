
import React, { useState, useEffect } from 'react';
import { fetchAllOpnameRecords, deleteOpnameRecord, getStockCounts } from '../services/dataService';
import { OpnameRecord, UserRole } from '../types';
import { Search, Trash2, Download, Eye, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  role: UserRole;
  userName: string;
  isLocked?: boolean;
}

const OpnameList: React.FC<Props> = ({ role, userName, isLocked = false }) => {
  const [records, setRecords] = useState<OpnameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<OpnameRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [stockCounts, setStockCounts] = useState({ sap: 0, mother: 0, cut: 0 });
  const recordsPerPage = 500;

  useEffect(() => {
    loadRecords();
    loadStockCounts();
  }, []);

  const loadRecords = async (forceRefresh = false) => {
    setLoading(true);
    const data = await fetchAllOpnameRecords(forceRefresh);
    setRecords(data || []);
    setLoading(false);
  };

  const loadStockCounts = async () => {
    const counts = await getStockCounts();
    setStockCounts(counts);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteOpnameRecord(id);
      await loadRecords(true);
    } catch (e) {
      alert('Error deleting record');
    }
  };

  const exportToCSV = () => {
    const headers = ['Batch ID', 'Grade', 'Location', 'Status', 'Dimension Match', 'Grade Match', 'Remarks', 'User', 'Time'];
    const rows = filteredRecords.map(r => [
      r.batch_id, r.grade || '', r.location || '', r.status || '',
      r.dimension_match ? 'Yes' : 'No', r.grade_match ? 'Yes' : 'No',
      r.remarks || '', r.user_name || '', r.time || ''
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opname_records_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = !searchTerm || (r.batch_id || '').toLowerCase().includes(searchTerm.toLowerCase()) || (r.user_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesLocation = filterLocation === 'all' || r.location === filterLocation;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
  const uniqueLocations = Array.from(new Set(records.map(r => r.location).filter(Boolean)));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-4 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Download className="text-blue-600" size={24} /> Opname Records</h2>
          <div className="flex gap-2">
            <button onClick={() => loadRecords(true)} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"><Download size={14} /> Refresh</button>
            {role === UserRole.ADMIN && <button onClick={exportToCSV} className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 flex items-center gap-2"><Download size={14} /> Export CSV</button>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Search Batch ID or User..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="all">All Status</option>
            <option value="Synchronized">Synchronized</option>
            <option value="Missing Data">Missing Data</option>
            <option value="Not Available">Not Available</option>
          </select>
          <select value={filterLocation} onChange={(e) => { setFilterLocation(e.target.value); setCurrentPage(1); }} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="all">All Locations</option>
            {uniqueLocations.map(loc => <option key={loc} value={loc!}>{loc}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase">
              <tr>
                <th className="px-4 py-3">Batch ID</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Time</th>
                {role === UserRole.ADMIN && !isLocked && <th className="px-4 py-3 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (<tr><td colSpan={7} className="px-4 py-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={24} /></td></tr>) : paginatedRecords.length === 0 ? (<tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 italic">No records found</td></tr>) : paginatedRecords.map((r, idx) => (
                <tr key={idx} className="hover:bg-gray-50 group">
                  <td className="px-4 py-3 font-bold text-gray-900">{r.batch_id}</td>
                  <td className="px-4 py-3">{r.grade || '-'}</td>
                  <td className="px-4 py-3">{r.location || '-'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${r.status === 'Synchronized' ? 'bg-green-100 text-green-700' : r.status === 'Missing Data' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{r.status || '-'}</span></td>
                  <td className="px-4 py-3 text-gray-500">{r.user_name}</td>
                  <td className="px-4 py-3 text-gray-500">{r.time || '-'}</td>
                  {role === UserRole.ADMIN && !isLocked && (
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setSelectedRecord(r)} className="text-blue-600 hover:text-blue-800 p-1"><Eye size={16} /></button>
                      <button onClick={() => handleDelete(r.id!)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Page {currentPage} of {totalPages} ({filteredRecords.length} records)</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-100 rounded text-xs disabled:opacity-50"><ChevronLeft size={14} /></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-100 rounded text-xs disabled:opacity-50"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-gray-800">Record Details</h3>
              <button onClick={() => setSelectedRecord(null)} className="hover:bg-gray-100 rounded-full p-1"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Batch ID:</span><span className="font-bold">{selectedRecord.batch_id}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Grade:</span><span>{selectedRecord.grade || '-'}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Location:</span><span>{selectedRecord.location || '-'}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Status:</span><span>{selectedRecord.status || '-'}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Dimension Match:</span><span>{selectedRecord.dimension_match ? 'Yes' : 'No'}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Grade Match:</span><span>{selectedRecord.grade_match ? 'Yes' : 'No'}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">User:</span><span>{selectedRecord.user_name}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Time:</span><span>{selectedRecord.time || '-'}</span></div>
              {selectedRecord.remarks && <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Remarks:</span><span>{selectedRecord.remarks}</span></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpnameList;
