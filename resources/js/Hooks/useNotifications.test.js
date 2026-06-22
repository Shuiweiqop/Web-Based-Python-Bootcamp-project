import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { useNotifications } from './useNotifications';

vi.mock('axios');

const sampleNotifications = [
  { notification_id: 1, is_read: false, message: 'a' },
  { notification_id: 2, is_read: false, message: 'b' },
];

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  axios.get.mockResolvedValue({
    data: { success: true, notifications: sampleNotifications, unread_count: 2 },
  });
  axios.post.mockResolvedValue({ data: { success: true } });
  axios.delete.mockResolvedValue({ data: { success: true } });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('useNotifications', () => {
  it('fetches notifications on mount', async () => {
    const { result } = renderHook(() => useNotifications({ limit: 10 }));

    await waitFor(() => expect(result.current.unreadCount).toBe(2));
    expect(result.current.notifications).toHaveLength(2);
    expect(axios.get).toHaveBeenCalledWith('/student/notifications/unread?limit=10');
    expect(result.current.error).toBeNull();
  });

  it('surfaces an error when the request fails', async () => {
    axios.get.mockRejectedValueOnce({
      response: { data: { message: 'boom' } },
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.error).toBe('boom'));
    expect(result.current.notifications).toHaveLength(0);
  });

  it('markAsRead flags one notification and decrements the count', async () => {
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.unreadCount).toBe(2));

    await act(async () => {
      await result.current.markAsRead(1);
    });

    expect(axios.post).toHaveBeenCalledWith('/student/notifications/1/read');
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.notifications.find(n => n.notification_id === 1).is_read).toBe(true);
  });

  it('markAllAsRead clears the unread count', async () => {
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.unreadCount).toBe(2));

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(axios.post).toHaveBeenCalledWith('/student/notifications/read-all');
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.every(n => n.is_read)).toBe(true);
  });

  it('deleteNotification removes the item and adjusts the unread count', async () => {
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.unreadCount).toBe(2));

    await act(async () => {
      await result.current.deleteNotification(1);
    });

    expect(axios.delete).toHaveBeenCalledWith('/student/notifications/1');
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.unreadCount).toBe(1);
  });
});
