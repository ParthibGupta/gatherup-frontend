// NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { notificationApi, Notification } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  dismissAllNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  // Calculate unread notifications count
  const unreadCount = notifications.filter(notification => notification.status === 'unread').length;

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await notificationApi.getAllNotifications();
      
      if (response.data) {
        // Sort notifications by creation date (newest first)
        const sortedNotifications = response.data.sort((a, b) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        setNotifications(sortedNotifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const dismissNotification = useCallback(async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      
      // Remove from local state immediately for better UX
      setNotifications(prev => prev.filter(notification => notification.notificationID !== id));
      
      toast({
        description: "Notification dismissed",
      });
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
      toast({
        title: "Error",
        description: "Failed to dismiss notification",
        variant: "destructive",
      });
      // Refresh to ensure consistency
      await refreshNotifications();
    }
  }, [refreshNotifications]);

  const dismissAllNotifications = useCallback(async () => {
    try {
      // Delete all notifications
      const deletePromises = notifications.map(notification => 
        notification.notificationID ? notificationApi.deleteNotification(notification.notificationID) : Promise.resolve()
      );
      
      await Promise.all(deletePromises);
      
      // Clear local state
      setNotifications([]);
      
      toast({
        description: "All notifications dismissed",
      });
    } catch (err) {
      console.error('Failed to dismiss all notifications:', err);
      toast({
        title: "Error",
        description: "Failed to dismiss all notifications",
        variant: "destructive",
      });
      // Refresh to ensure consistency
      await refreshNotifications();
    }
  }, [notifications, refreshNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.notificationID === id 
          ? { ...notification, status: 'read' }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, status: 'read' }))
    );
  }, []);

  const addNotification = useCallback(async (notificationData: Omit<Notification, 'notificationID' | 'createdAt'>) => {
    try {
      await notificationApi.createNotification(notificationData);
      // Refresh to get the new notification with server-generated ID and timestamp
      await refreshNotifications();
    } catch (err) {
      console.error('Failed to create notification:', err);
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive",
      });
    }
  }, [refreshNotifications]);

  // Fetch notifications when component mounts or authentication changes
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Clear notifications when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setError(null);
    }
  }, [isAuthenticated]);

  // Auto-refresh notifications every 30 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshNotifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    dismissNotification,
    dismissAllNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

export default NotificationProvider;
