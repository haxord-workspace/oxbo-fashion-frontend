import type { User } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    await delay(1500); // Simulate network delay
    
    // Simulate validation error
    if (password !== 'password') {
      throw new Error('Invalid email or password. Use password "password" to test.');
    }

    return {
      user: {
        id: '1',
        email,
        name: email.split('@')[0],
      },
      token: 'fake-jwt-token-123',
    };
  },

  register: async (name: string, email: string, password: string, mobileNumber?: string): Promise<{ user: User; token: string }> => {
    await delay(1500);

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    return {
      user: {
        id: '2',
        email,
        name,
        mobileNumber,
      },
      token: 'fake-jwt-token-456',
    };
  }
};
