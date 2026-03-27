export interface SlabRecord {
  id?: string;
  batch_id: string;
  grade: string;
  thickness: number;
  width: number;
  length: number;
  slab_weight: number;
  source?: 'sap' | 'mother' | 'cut';
}

export interface OpnameRecord {
  id?: string;
  created_at?: string;
  user_name: string;
  batch_id: string;
  grade: string;
  location: string;
  status: 'Synchronized' | 'Missing Data' | 'Not Available';
  dimension_match: boolean;
  grade_match: boolean;
  batch_match: boolean;
  remarks: string;
  time?: string;
  date?: string;
  grade_sap?: string;
  grade_mother?: string;
  grade_cut?: string;
  database_t?: number;
  database_w?: number;
  database_l?: number;
  actual_thick?: number;
  actual_width?: number;
  actual_length?: number;
  actual_grade?: string;
  actual_batch_id?: string;
  gang_baris?: string;
  image_url?: string;
}

export interface OpnameBackup {
  id: string;
  created_at: string;
  name: string;
  data: OpnameRecord[];
}

export interface Location {
  id: string;
  name: string;
}

export interface UserOnline {
  name: string;
  last_seen: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface LockStatus {
  lock_mode: boolean;
  locked_at: string | null;
  locked_by: string | null;
}

export interface ComprehensiveBackup {
  id: string;
  created_at: string;
  name: string;
  created_by: string;
  record_count: number;
}
