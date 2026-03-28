
import React, { useState } from 'react';
import { Database, Copy, Check, RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';

interface Props {
  onRetry: () => void;
}

const DatabaseSetup: React.FC<Props> = ({ onRetry }) => {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- 1. SAP Stock Table
CREATE TABLE IF NOT EXISTS public.sap_stock (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    batch_id TEXT NOT NULL,
    grade TEXT,
    thickness NUMERIC,
    width NUMERIC,
    length NUMERIC,
    slab_weight NUMERIC
);

-- 2. Mother Slab Stock Table
CREATE TABLE IF NOT EXISTS public.mother_slab_stock (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    batch_id TEXT NOT NULL,
    grade TEXT,
    thickness NUMERIC,
    width NUMERIC,
    length NUMERIC,
    slab_weight NUMERIC
);

-- 3. Cut Slab Stock Table
CREATE TABLE IF NOT EXISTS public.cut_slab_stock (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    batch_id TEXT NOT NULL,
    grade TEXT,
    thickness NUMERIC,
    width NUMERIC,
    length NUMERIC,
    slab_weight NUMERIC
);

-- 4. Opname Records Table
CREATE TABLE IF NOT EXISTS public.opname_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_name TEXT,
    batch_id TEXT,
    grade TEXT,
    location TEXT,
    status TEXT,
    dimension_match BOOLEAN,
    grade_match BOOLEAN,
    batch_match BOOLEAN,
    remarks TEXT,
    time TEXT,
    date TEXT
);

-- 5. Locations Table
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT UNIQUE NOT NULL
);

-- 6. Users Online Table (For Dashboard)
CREATE TABLE IF NOT EXISTS public.users_online (
    name TEXT PRIMARY KEY,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`;

  const handleCopy = () => { navigator.clipboard.writeText(sqlScript); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl"><Database size={32} /></div>
            <div><h1 className="text-2xl font-bold">Database Setup Required</h1><p className="text-blue-100 opacity-80">PPIC Slab System Initialization</p></div>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800 text-sm">
            <span className="text-xl">!</span>
            <div><p className="font-bold">Database & Realtime Step:</p><p>You must run the SQL script below and manually enable <strong>Realtime</strong> in Supabase for all tables.</p></div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><h3 className="font-bold text-gray-800">1. Run SQL in Supabase Editor</h3><button onClick={handleCopy} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied!' : 'Copy SQL Script'}</button></div>
            <pre className="bg-gray-900 text-gray-300 p-6 rounded-xl text-xs font-mono overflow-x-auto max-h-[250px] border border-gray-800">{sqlScript}</pre>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl space-y-3">
            <h3 className="font-bold text-blue-800 text-sm flex items-center gap-2"><ShieldCheck size={18}/> 2. Enable Realtime (MANDATORY)</h3>
            <p className="text-xs text-blue-700">Go to <strong>Database</strong> &gt; <strong>Replication</strong> &gt; <strong>supabase_realtime</strong> publication and enable it for:</p>
            <ul className="text-[10px] font-bold text-blue-900 list-disc ml-4 grid grid-cols-2 gap-x-4"><li>locations</li><li>users_online</li><li>opname_records</li><li>sap_stock</li><li>mother_slab_stock</li><li>cut_slab_stock</li></ul>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div><h3 className="font-bold text-gray-800 mb-1">3. Verify Bucket</h3><p className="text-[10px] text-gray-500">Ensure a storage bucket named <code className="bg-gray-100 px-1 rounded text-blue-600 font-bold">Slab_Opname</code> exists.</p></div>
            <div className="flex flex-col justify-end"><button onClick={onRetry} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"><RefreshCw size={20} /> I've Finished Setup</button></div>
          </div>
          <div className="text-center pt-2"><a href="https://supabase.com/dashboard/project/mqwpgqvyzrjfsitvrmgh/sql/new" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline inline-flex items-center gap-1">Open Supabase Dashboard <ExternalLink size={14} /></a></div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetup;
