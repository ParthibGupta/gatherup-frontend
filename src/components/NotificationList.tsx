import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { format } from 'date-fns';
import { useNotifications } from '@/contexts/NotificationContext';

const NotificationList: React.FC = () => {
  const { notifications, isLoading, dismissNotification, markAsRead } = useNotifications();

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No new notifications</p>
        </CardContent>
      </Card>
    );
  }

  const handleDismiss = async (id: string) => {
    dismissNotification(id);
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span>Notifications</span>
          <span className="ml-2 rounded-full bg-gatherup-purple hover:bg-gatherup-purple/90 w-6 h-6 flex items-center justify-center text-sm text-white">
            {notifications.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid p-0">
        {isLoading && (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        )}
        {!isLoading && notifications.length === 0 && (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No notifications available</p>
          </div>
        )}
        {notifications.map((notification) => (
          <div
            key={notification.notificationID} 
            className="flex items-start justify-between p-3 border-b last:border-0 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="rounded-full p-2 bg-gatherup-purple/10 text-gatherup-purple">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium leading-relaxed">{notification.description}</p>
                {notification.createdAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(notification.createdAt), 'PPp')}
                  </p>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full opacity-70 hover:opacity-100 ml-2"
              onClick={() => notification.notificationID && handleDismiss(notification.notificationID)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default NotificationList;
