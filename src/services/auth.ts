
import { toast } from "@/hooks/use-toast";

interface AuthUser {
  id: string;
  username: string;
  email: string;
  name?: string;
  profilePicture?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  name?: string;
}

// This is a placeholder service that would be replaced with AWS Cognito integration
export class AuthService {
  // Initial auth state
  private static authState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  };

  // Auth state change listeners
  private static listeners: Set<(state: AuthState) => void> = new Set();

  // Subscribe to auth state changes
  static subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    listener(this.authState);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Update auth state and notify listeners
  private static updateAuthState(newState: Partial<AuthState>): void {
    this.authState = { ...this.authState, ...newState };
    this.listeners.forEach(listener => listener(this.authState));
  }

  // Initialize auth state on app load
  static async init(): Promise<void> {
    try {
      // Check for existing session
      const token = localStorage.getItem('gatherup_token');
      
      if (!token) {
        this.updateAuthState({ loading: false });
        return;
      }

      // In a real implementation, this would validate the token with Cognito
      // Mock user data for demonstration
      const user = {
        id: 'user123',
        username: 'demouser',
        email: 'demo@example.com',
        name: 'Demo User'
      };
      
      this.updateAuthState({ 
        isAuthenticated: true, 
        user,
        loading: false 
      });

    } catch (error) {
      console.error('Auth initialization error:', error);
      localStorage.removeItem('gatherup_token');
      
      this.updateAuthState({ 
        isAuthenticated: false, 
        user: null,
        loading: false,
        error: 'Authentication session expired. Please log in again.' 
      });
    }
  }

  // Login user
  static async login(credentials: LoginCredentials): Promise<boolean> {
    this.updateAuthState({ loading: true, error: null });
    
    try {
      // In a real implementation, this would call Cognito
      // For demo purposes, we'll simulate a successful login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const user = {
        id: 'user123',
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        name: 'Demo User'
      };
      
      // Mock token - would be provided by Cognito in a real implementation
      const token = 'mock-jwt-token';
      localStorage.setItem('gatherup_token', token);
      
      this.updateAuthState({ 
        isAuthenticated: true, 
        user,
        loading: false 
      });

      toast({
        title: "Login successful!",
        description: `Welcome back, ${user.name || user.username}!`,
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login. Please check your credentials.';
      
      this.updateAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: errorMessage
      });
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  }

  // Register user
  static async register(credentials: RegisterCredentials): Promise<boolean> {
    this.updateAuthState({ loading: true, error: null });
    
    try {
      // In a real implementation, this would call Cognito
      // For demo purposes, we'll simulate a successful registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const user = {
        id: 'user456',
        username: credentials.username,
        email: credentials.email,
        name: credentials.name
      };
      
      // Mock token - would be provided by Cognito in a real implementation
      const token = 'mock-jwt-token';
      localStorage.setItem('gatherup_token', token);
      
      this.updateAuthState({ 
        isAuthenticated: true, 
        user,
        loading: false 
      });
      
      toast({
        title: "Registration successful!",
        description: `Welcome to GatherUp, ${user.name || user.username}!`,
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register. Please try again.';
      
      this.updateAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: errorMessage
      });
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    this.updateAuthState({ loading: true });
    
    try {
      // In a real implementation, this would call Cognito to invalidate the session
      // For demo purposes, we'll simply remove the token
      localStorage.removeItem('gatherup_token');
      
      this.updateAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to logout properly.';
      
      toast({
        title: "Logout issue",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Still clear the local state even if the server request failed
      localStorage.removeItem('gatherup_token');
      
      this.updateAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });
    }
  }

  // Get current authenticated user
  static getCurrentUser(): AuthUser | null {
    return this.authState.user;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }
}
