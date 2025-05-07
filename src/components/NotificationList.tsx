
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { Notification, notificationApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface NotificationListProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications, onDismiss }) => {
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
    try {
      await notificationApi.deleteNotification(id);
      onDismiss(id);
      toast({
        description: "Notification dismissed",
      });
    } catch (error) {
      toast({
        title: "Error dismissing notification",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span>Notifications</span>
          <span className="ml-2 rounded-full bg-primary w-6 h-6 flex items-center justify-center text-sm text-white">
            {notifications.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-0">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`flex items-start justify-between p-3 border-b last:border-0 ${
              notification.type === 'invite' ? 'bg-accent/20' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`rounded-full p-2 ${
                notification.type === 'invite' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{notification.description}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(notification.createdAt), 'PPp')}
                </p>
                {notification.type === 'invite' && (
                  <div className="mt-2">
                    <Button size="sm" variant="default" className="mr-2 h-7 px-2 text-xs">
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full opacity-70 hover:opacity-100"
              onClick={() => notification.id && handleDismiss(notification.id)}
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
