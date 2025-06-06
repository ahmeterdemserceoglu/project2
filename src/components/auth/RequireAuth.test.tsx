import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import RequireAuth from './RequireAuth';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock @/lib/supabase
jest.mock('@/lib/supabase', () => ({
  createClientComponentClient: jest.fn(),
}));

// Define a type for our mock Supabase client for better type safety
type MockSupabaseClient = {
  auth: {
    getSession: jest.Mock<Promise<{ data: { session: any }; error: any }>>;
    onAuthStateChange: jest.Mock<ReturnType<typeof supabase.auth.onAuthStateChange>>;
  };
};

// Define a type for the onAuthStateChange callback
type AuthStateChangeCallback = (event: string, session: any) => void;
let supabase: any; // Placeholder for actual Supabase client type

describe('RequireAuth', () => {
  let mockRouterPush: jest.Mock;
  let mockSupabase: MockSupabaseClient;
  let capturedOnAuthStateChangeCallback: AuthStateChangeCallback | null = null;
  let mockUnsubscribe: jest.Mock;

  beforeEach(() => {
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });

    mockUnsubscribe = jest.fn();
    mockSupabase = {
      auth: {
        getSession: jest.fn(),
        // Ensure the mock for onAuthStateChange returns the correct structure for the subscription
        onAuthStateChange: jest.fn().mockImplementation((callback: AuthStateChangeCallback) => {
          capturedOnAuthStateChangeCallback = callback;
          return {
            data: { subscription: { unsubscribe: mockUnsubscribe } },
          };
        }),
      },
    };
    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    capturedOnAuthStateChangeCallback = null;
    jest.useRealTimers();
  });

  const ProtectedContent = () => <div>Protected Content</div>;

  test('Scenario 1a: getSession (no session) -> onAuthStateChange (SIGNED_IN) -> authenticated', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: null }, error: null });

    render(<RequireAuth><ProtectedContent /></RequireAuth>);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    act(() => {
      if (capturedOnAuthStateChangeCallback) {
        capturedOnAuthStateChangeCallback('SIGNED_IN', { user: { id: '123' } });
      }
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  test('Scenario 1b: getSession (session) -> authenticated quickly', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: { user: { id: '123' } } }, error: null });
    render(<RequireAuth><ProtectedContent /></RequireAuth>);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  test('Scenario 1c & 2: No session (getSession & onAuthStateChange SIGNED_OUT) -> redirect with param', async () => {
    // window.location.pathname is now fixed to '/account/test-page' by Jest config
    mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    render(<RequireAuth><ProtectedContent /></RequireAuth>);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    act(() => {
      if (capturedOnAuthStateChangeCallback) {
        capturedOnAuthStateChangeCallback('SIGNED_OUT', null);
      }
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(mockRouterPush).toHaveBeenCalledWith('/login?redirect=%2Faccount%2Ftest-page');
    });
  });

  test('Scenario 1c & 2 (alternative): No session (getSession & onAuthStateChange INITIAL_SESSION no session) -> redirect', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    render(<RequireAuth><ProtectedContent /></RequireAuth>);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    act(() => {
      if (capturedOnAuthStateChangeCallback) {
        capturedOnAuthStateChangeCallback('INITIAL_SESSION', null);
      }
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(mockRouterPush).toHaveBeenCalledWith('/login?redirect=%2Faccount%2Ftest-page');
    });
  });

  test('Scenario 1c & 2 (timeout): No session (getSession & no onAuthStateChange event) -> redirect via timeout', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    render(<RequireAuth><ProtectedContent /></RequireAuth>);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(mockRouterPush).toHaveBeenCalledWith('/login?redirect=%2Faccount%2Ftest-page');
    });
  });

  test('Unsubscribes on unmount', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    const { unmount } = render(<RequireAuth><ProtectedContent /></RequireAuth>);

    act(() => {
      if (capturedOnAuthStateChangeCallback) {
        capturedOnAuthStateChangeCallback('INITIAL_SESSION', null);
      }
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument());

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  test('Handles getSession error and relies on onAuthStateChange or timeout for redirection', async () => {
    mockSupabase.auth.getSession.mockRejectedValueOnce(new Error('Get session failed'));
    render(<RequireAuth><ProtectedContent /></RequireAuth>);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    act(() => {
      if (capturedOnAuthStateChangeCallback) {
        capturedOnAuthStateChangeCallback('SIGNED_OUT', null);
      }
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(mockRouterPush).toHaveBeenCalledWith('/login?redirect=%2Faccount%2Ftest-page');
    });
  });

  test('Still redirects via timeout if getSession errors and onAuthStateChange does not fire timely', async () => {
    mockSupabase.auth.getSession.mockRejectedValueOnce(new Error('Get session failed'));
    render(<RequireAuth><ProtectedContent /></RequireAuth>);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(mockRouterPush).toHaveBeenCalledWith('/login?redirect=%2Faccount%2Ftest-page');
    });
  });

});

export {};
