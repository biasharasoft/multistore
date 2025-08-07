import { QueryClient, QueryFunction } from '@tanstack/react-query';

const TOKEN_KEY = 'auth_token';

// Default query function that includes authentication headers
const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const url = queryKey[0] as string;
  const token = localStorage.getItem(TOKEN_KEY);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// API request function for mutations (POST, PUT, DELETE)
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Create query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    },
  },
});