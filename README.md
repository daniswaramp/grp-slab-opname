<div align="center">
  <h1>🏭 GRP Slab Opname System</h1>
  <p><strong>Real-time inventory monitoring and slab stock reconciliation for PPIC</strong></p>
  <p>
    <img src="https://img.shields.io/badge/React-18-blue" alt="React 18">
    <img src="https://img.shields.io/badge/Vite-6-purple" alt="Vite 6">
    <img src="https://img.shields.io/badge/Tailwind-CSS-cyan" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/Supabase-Backend-green" alt="Supabase">
  </p>
</div>

---

## 📋 Overview

The **GRP Slab Opname System** is a comprehensive real-time inventory management application designed for PPIC (Production Planning and Inventory Control) teams to perform slab stock reconciliation.

### Key Capabilities

| Feature | Description |
|---------|-------------|
| **Real-time Sync** | Instant updates across all connected clients via WebSocket |
| **Opname Matrix** | Visual inventory grid for quick status assessment |
| **Evidence Capture** | Photo documentation for missing/unavailable items |
| **Role-based Access** | Admin and User roles with appropriate permissions |
| **Data Management** | CSV import/export, backup/restore functionality |
| **Lock Mode** | Freeze system during processing periods |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | UI Components |
| **Build Tool** | Vite 6 | Fast bundling & HMR |
| **Styling** | Tailwind CSS 3 | Utility-first CSS |
| **Backend** | Supabase | PostgreSQL + Auth + Storage |
| **Realtime** | Supabase Realtime | WebSocket subscriptions |
| **Icons** | Lucide React | Icon library |
| **Charts** | Recharts | Dashboard visualizations |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **Supabase Project** with configured database and storage

### Installation

```bash
git clone https://github.com/daniswaramp/grp-slab-opname.git
cd grp-slab-opname
npm install
```

### Environment Configuration

Create `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev
```

---

## 📝 License

This project is proprietary software developed for internal use at GRP (Gunung Raja Paksi).
