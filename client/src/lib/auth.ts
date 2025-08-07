import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'auth_token';

class AuthManager {
  private state: AuthState = {
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  };

  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    this.initialize();
  }

  private async initialize() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        const user = await this.verifyToken(token);
        this.setState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        this.logout();
      }
    } else {
      this.setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }

  private setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState() {
    return this.state;
  }

  private async verifyToken(token: string): Promise<User> {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    const data = await response.json();
    return data.user;
  }

  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    this.setState({
      user: data.user,
      token: data.token,
      isAuthenticated: true,
    });

    return data;
  }

  async initiateRegistration(email: string, firstName: string, lastName: string, password: string, confirmPassword: string) {
    const response = await fetch('/api/auth/register/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, firstName, lastName, password, confirmPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration initiation failed');
    }

    return data;
  }

  async completeRegistration(email: string, otp: string, firstName: string, lastName: string, password: string) {
    const response = await fetch('/api/auth/register/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp, firstName, lastName, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration completion failed');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    this.setState({
      user: data.user,
      token: data.token,
      isAuthenticated: true,
    });

    return data;
  }

  async initiatePasswordReset(email: string) {
    const response = await fetch('/api/auth/password-reset/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Password reset initiation failed');
    }

    return data;
  }

  async verifyPasswordResetOTP(email: string, otp: string) {
    const response = await fetch('/api/auth/password-reset/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }

    return data;
  }

  async completePasswordReset(token: string, password: string, confirmPassword: string) {
    const response = await fetch('/api/auth/password-reset/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password, confirmPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Password reset failed');
    }

    return data;
  }

  async resendOTP(email: string, type: 'register' | 'reset-password') {
    const response = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, type }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend OTP');
    }

    return data;
  }

  async logout() {
    try {
      const token = this.state.token;
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      this.setState({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  }
}

export const authManager = new AuthManager();

export function useAuth() {
  const [state, setState] = useState(authManager.getState());

  useEffect(() => {
    return authManager.subscribe(setState);
  }, []);

  return {
    ...state,
    login: authManager.login.bind(authManager),
    logout: authManager.logout.bind(authManager),
    initiateRegistration: authManager.initiateRegistration.bind(authManager),
    completeRegistration: authManager.completeRegistration.bind(authManager),
    initiatePasswordReset: authManager.initiatePasswordReset.bind(authManager),
    verifyPasswordResetOTP: authManager.verifyPasswordResetOTP.bind(authManager),
    completePasswordReset: authManager.completePasswordReset.bind(authManager),
    resendOTP: authManager.resendOTP.bind(authManager),
  };
}