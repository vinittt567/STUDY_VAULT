import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, createUserProfile } from '../lib/supabase';
import { User as AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleUserProfile = async (authUser: any): Promise<void> => {
    try {
      console.log('👤 Handling user profile for:', authUser.id);

      // Try to fetch user profile with timeout
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
      );

      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('🔧 Creating missing profile...');
        try {
          await createUserProfile(authUser);

          // Fetch the newly created profile
          const { data: newProfile, error: newProfileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (!newProfileError && newProfile) {
            setUser({
              id: newProfile.id,
              name: newProfile.full_name,
              email: newProfile.email || '',
              role: newProfile.role as 'student' | 'admin'
            });
            console.log('✅ Profile created and user set');
            return;
          }
        } catch (createError) {
          console.error('❌ Error creating profile:', createError);
        }
      } else if (!profileError && profile) {
        // Profile exists, set user
        console.log('✅ Profile loaded, setting user');
        setUser({
          id: profile.id,
          name: profile.full_name,
          email: profile.email || '',
          role: profile.role as 'student' | 'admin'
        });
        return;
      }

      // Fallback: create user from auth data
      console.log('🔄 Using fallback user creation');
      setUser({
        id: authUser.id,
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        role: authUser.user_metadata?.role || 'student'
      });
    } catch (error) {
      console.error('❌ Error handling user profile:', error);
      // Always fallback to create user from auth data
      setUser({
        id: authUser.id,
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        role: authUser.user_metadata?.role || 'student'
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    let loadingTimeout: NodeJS.Timeout;

    // Set a safety timeout to ensure loading never gets stuck
    const setSafetyTimeout = () => {
      loadingTimeout = setTimeout(() => {
        if (isMounted) {
          console.log('⏰ Safety timeout reached - forcing loading to false');
          setIsLoading(false);
        }
      }, 8000); // 8 second safety timeout
    };

    const initializeAuth = async () => {
      try {
        console.log('🔍 Initializing authentication...');
        setSafetyTimeout();

        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.warn('❌ Session check error:', error);
          setUser(null);
          return;
        }

        console.log('📋 Session status:', session ? 'Found' : 'None');

        if (session?.user) {
          console.log('👤 User found, fetching profile...');
          await handleUserProfile(session.user);
        } else {
          console.log('👤 No user session found');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (loadingTimeout) clearTimeout(loadingTimeout);
        if (isMounted) {
          console.log('✅ Auth initialization complete');
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('🔄 Auth state change:', event, session ? 'Session exists' : 'No session');

      if (!isMounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        try {
          await handleUserProfile(session.user);
        } catch (error) {
          console.error('❌ Error handling sign in:', error);
        }
        if (isMounted) {
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        if (isMounted) {
          setUser(null);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed');
        // Don't need to reload profile on token refresh
      }
    });

    return () => {
      isMounted = false;
      if (loadingTimeout) clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.warn('Login error:', error.message, error.code);

        if (error.message === 'Invalid login credentials') {
          return { success: false, error: 'Invalid email or password. Please check your credentials.' };
        } else if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Please check your email and confirm your account before logging in.' };
        }

        return { success: false, error: error.message };
      }

      if (data.user) {
        await handleUserProfile(data.user);
        return { success: true };
      }

      return { success: false, error: 'Login failed. Please try again.' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const isAdmin = email === 'admin@example.com';

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: isAdmin ? 'admin' : 'student'
          }
        }
      });

      if (error) {
        console.warn('Signup error:', error.message);

        if (error.message === 'User already registered') {
          return { success: false, error: 'An account with this email already exists. Please log in instead.' };
        } else if (error.message.includes('Password should be at least')) {
          return { success: false, error: 'Password must be at least 6 characters long.' };
        } else if (error.message.includes('Invalid email')) {
          return { success: false, error: 'Please enter a valid email address.' };
        }

        return { success: false, error: error.message };
      }

      if (data.user) {
        try {
          const profileData = {
            ...data.user,
            user_metadata: {
              ...data.user.user_metadata,
              role: isAdmin ? 'admin' : 'student'
            }
          };
          await createUserProfile(profileData);

          setUser({
            id: data.user.id,
            name: name,
            email: email,
            role: isAdmin ? 'admin' : 'student'
          });
        } catch (profileError) {
          console.warn('Profile creation error:', profileError);
          return { success: false, error: 'Account created but failed to set up profile. Please try logging in.' };
        }

        return { success: true };
      }

      return { success: false, error: 'Failed to create account. Please try again.' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Logout error:', error);
    }
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};