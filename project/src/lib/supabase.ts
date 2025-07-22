import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase config check:');
console.log('URL:', supabaseUrl || '❌ Missing');
console.log('Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

// Check if Supabase URL is accessible
const checkSupabaseConnection = async () => {
  if (!supabaseUrl) return false;
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey || '',
      }
    });
    return response.ok;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};

let supabase: any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please click "Connect to Supabase" button in the top right to set up your database');
  
  // Create a mock client to prevent app crash
  const mockClient = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Please connect to Supabase first' } }),
      signInWithOAuth: () => Promise.resolve({ data: null, error: { message: 'Please connect to Supabase first' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Please connect to Supabase first' } }),
      signOut: () => Promise.resolve({ error: null })
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: { message: 'Please connect to Supabase first' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    },
    from: () => ({
      select: () => ({ 
        eq: () => ({ 
          single: () => Promise.resolve({ data: null, error: { message: 'Please connect to Supabase first' } }),
          order: () => Promise.resolve({ data: [], error: { message: 'Please connect to Supabase first' } })
        }),
        order: () => Promise.resolve({ data: [], error: { message: 'Please connect to Supabase first' } })
      }),
      insert: () => ({ 
        select: () => ({ 
          single: () => Promise.resolve({ data: null, error: { message: 'Please connect to Supabase first' } })
        })
      }),
      update: () => ({ eq: () => Promise.resolve({ error: { message: 'Please connect to Supabase first' } }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: { message: 'Please connect to Supabase first' } }) }),
      upsert: () => Promise.resolve({ data: null, error: { message: 'Please connect to Supabase first' } })
    })
  };
  
  supabase = mockClient;
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client created successfully');
  
  // Test connection
  checkSupabaseConnection().then(isConnected => {
    if (isConnected) {
      console.log('✅ Supabase connection verified');
    } else {
      console.warn('⚠️ Supabase connection failed - check your project URL and settings');
    }
  });
}

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          role: 'student' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email?: string | null;
          role?: 'student' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          role?: 'student' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          subject: string;
          semester: number;
          author: string | null;
          cover_image_url: string | null;
          pdf_url: string;
          file_path: string | null;
          file_size: number | null;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subject: string;
          semester: number;
          author?: string | null;
          cover_image_url?: string | null;
          pdf_url: string;
          file_path?: string | null;
          file_size?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          subject?: string;
          semester?: number;
          author?: string | null;
          cover_image_url?: string | null;
          pdf_url?: string;
          file_path?: string | null;
          file_size?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Book = Database['public']['Tables']['books']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type BookInsert = Database['public']['Tables']['books']['Insert'];

// Helper function to create user profile after signup
export const createUserProfile = async (user: any) => {
  try {
    console.log('🔧 Creating user profile for:', user.id);
    
    // Extract name from user metadata or email
    const fullName = user.user_metadata?.full_name || 
                    user.user_metadata?.name || 
                    user.email?.split('@')[0] || 
                    'User';

    // Check if this is an admin user
    const isAdmin = user.email === 'admin@example.com' || 
                   user.user_metadata?.role === 'admin';

    console.log('👤 Profile data:', {
      id: user.id,
      full_name: fullName,
      email: user.email,
      role: isAdmin ? 'admin' : 'student'
    });

    const { data, error } = await supabase.from('users').upsert({
      id: user.id,
      full_name: fullName,
      email: user.email,
      role: isAdmin ? 'admin' : 'student'
    }, {
      onConflict: 'id'
    });

    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
    
    console.log('✅ User profile created successfully');
  } catch (error) {
    console.error('Profile creation failed:', error);
    throw error;
  }
};

export { supabase };