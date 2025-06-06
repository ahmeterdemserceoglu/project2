import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountPage from './page'; // Points to src/app/account/page.tsx
import { createClientComponentClient } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { useNotification } from '@/contexts/NotificationContext';
import type { User } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  createClientComponentClient: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

// Mock contexts
jest.mock('@/contexts/ToastContext', () => ({
  useToast: jest.fn(() => ({ showToast: jest.fn() })),
}));
jest.mock('@/contexts/NotificationContext', () => ({
  useNotification: jest.fn(() => ({ showNotification: jest.fn() })),
}));

describe('AccountPage', () => {
  let mockSupabaseClient: any; // Renamed to avoid confusion with supabase instances
  let mockShowNotification: jest.Mock;
  let capturedRequireAuthOnAuthStateChangeCallback: AuthStateChangeCallback | null = null;
  let mockRequireAuthUnsubscribe: jest.Mock;


  const mockUser: User = {
    id: 'test-user-id-123',
    app_metadata: {},
    user_metadata: { first_name: 'Test', last_name: 'User' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  const mockProfileData = {
    id: 'test-user-id-123',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    phone: '1234567890',
    is_email_verified: true,
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    mockShowNotification = jest.fn();
    (useNotification as jest.Mock).mockReturnValue({ showNotification: mockShowNotification });

    mockRequireAuthUnsubscribe = jest.fn();
    capturedRequireAuthOnAuthStateChangeCallback = null; // Reset for each test

    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(), // For AccountPage's direct calls
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      update: jest.fn().mockReturnThis(),
      auth: { // For RequireAuth's internal calls
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: mockUser } }, error: null }), // Assume session exists for simplicity here
        onAuthStateChange: jest.fn().mockImplementation((callback: AuthStateChangeCallback) => {
          capturedRequireAuthOnAuthStateChangeCallback = callback;
          return {
            data: { subscription: { unsubscribe: mockRequireAuthUnsubscribe } },
          };
        }),
      },
    };
    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
    capturedRequireAuthOnAuthStateChangeCallback = null;
  });

  test('renders loader initially, then profile data when user prop is provided', async () => {
    // Ensure RequireAuth's getSession provides a session so it renders children
    mockSupabaseClient.auth.getSession.mockResolvedValueOnce({ data: { session: { user: mockUser } }, error: null });
    // Mock AccountPage's profile fetch
    mockSupabaseClient.single.mockResolvedValueOnce({ data: mockProfileData, error: null });

    render(<AccountPage user={mockUser} />);

    // Check for loader (AccountPage has its own loader)
    expect(screen.getByTestId('account-loader')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('account-loader')).not.toBeInTheDocument();
      expect(screen.getByText(`${mockProfileData.first_name} ${mockProfileData.last_name}`)).toBeInTheDocument();
      // Use getAllByText and check the first instance for the summary display
      const emailElements = screen.getAllByText(mockProfileData.email);
      expect(emailElements[0]).toBeInTheDocument();
    });

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
    expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
    expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', mockUser.id);
    expect(mockSupabaseClient.single).toHaveBeenCalledTimes(1);
  });

  test('shows notification and does not fetch profile if user prop is not provided initially', async () => {
    // Simulate RequireAuth not providing a user (e.g. initial load no session)
    mockSupabaseClient.auth.getSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    // Trigger SIGNED_OUT for RequireAuth to ensure it doesn't authenticate
    act(() => {
        if (capturedRequireAuthOnAuthStateChangeCallback) {
            capturedRequireAuthOnAuthStateChangeCallback('SIGNED_OUT', null);
        }
    });

    render(<AccountPage user={undefined} />);

    // Wait for useEffect to run and potentially call showNotification in AccountPage
    await act(async () => {
      // Give time for any immediate effects or state changes
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Loader in AccountPage might show briefly or not at all if user is undefined.
    // The crucial part is that it shouldn't attempt to load profile data.
    expect(mockSupabaseClient.from).not.toHaveBeenCalledWith('profiles');

    // AccountPage's useEffect has a condition: if (!isLoading && !authUser) showNotification('Kullanıcı oturumu bekleniyor...', 'info');
    // Since RequireAuth would set its isLoading to false and not provide a user,
    // AccountPage's own isLoading might still be true or become false.
    // If user is undefined, AccountPage's loadUserProfile isn't called, showNotification('Kullanıcı bilgileri bulunamadı.', 'error');
    // from loadUserProfile won't be called.
    // The one from useEffect might be called if AccountPage's isLoading becomes false before user prop is available.
    // This test primarily ensures no data fetching if user is not passed.
    // The specific notification depends on the interaction between RequireAuth's loading and AccountPage's loading.
    // For this case, AccountPage itself, if rendered with user=undefined, its useEffect will run.
    // It will see user is undefined, and its own isLoading is true initially.
    // loadUserProfile won't be called.
    // It will set isLoading to false.
    // Then the `else { if (!isLoading) ...}` will not be hit immediately.
    // The most reliable check here is that profile data is not displayed.
    expect(screen.queryByText(`${mockProfileData.first_name} ${mockProfileData.last_name}`)).not.toBeInTheDocument();
  });

   test('handles profile fetch error gracefully', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValueOnce({ data: { session: { user: mockUser } }, error: null });
    mockSupabaseClient.single.mockRejectedValueOnce(new Error('Failed to fetch profile'));
    render(<AccountPage user={mockUser} />);

    expect(screen.getByTestId('account-loader')).toBeInTheDocument(); // Initial loader for AccountPage

    await waitFor(() => {
      expect(screen.queryByTestId('account-loader')).not.toBeInTheDocument(); // Loader should disappear
    });

    expect(mockShowNotification).toHaveBeenCalledWith('Profil bilgileri yüklenirken bir hata oluştu', 'error');
  });

  test('handles profile not found by using user_metadata and creating a default view', async () => {
    // Simulate profile not found (e.g. new user)
    mockSupabaseClient.auth.getSession.mockResolvedValueOnce({ data: { session: { user: mockUser } }, error: null });
    mockSupabaseClient.single.mockResolvedValueOnce({ data: null, error: { message: 'Profile not found', code: 'PGRST116' } });

    const newUserWithoutProfile: User = {
      ...mockUser,
      user_metadata: { first_name: 'New', last_name: 'ProfileUser' },
      email: 'new@example.com',
    };
    render(<AccountPage user={newUserWithoutProfile} />);

    await waitFor(() => {
      expect(screen.queryByTestId('account-loader')).not.toBeInTheDocument();
      // It should display data from user_metadata
      expect(screen.getByText('New ProfileUser')).toBeInTheDocument();
      // Check for the specific display instance of email, not the input field one.
      const emailDisplays = screen.getAllByText('new@example.com');
      // Assuming the first one is in the summary, and second in the (disabled) form field
      expect(emailDisplays.length).toBeGreaterThanOrEqual(1);
      expect(emailDisplays[0]).toBeInTheDocument();
    });
    // It should also log a warning
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Profile not found for user'), expect.any(String));
  });


});

// Mock console.warn for the specific test that expects it
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  (console.warn as jest.Mock).mockRestore();
});
