import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import NotificationList from '@/components/NotificationList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Plus, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationApi, Notification, eventApi, Event } from '@/services/api';
import EventCard from '@/components/EventCard';
import { set } from 'date-fns';

const Dashboard: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [organizedEvents, setorganizedEvents] = useState<Event[]>([]);
  const [joinedEvents, setjoinedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, these would be filtered API calls
        // For demo, we'll use mock data
        
        // Mock notifications
        // const mockNotifications = generateMockNotifications();
        // setNotifications(mockNotifications);
        
        
        // // Filter for events created by current user
        // const userEvents = allEvents.filter(event => event.organizer.fullName === user?.id);
        // setMyEvents(userEvents);
        const organizedResponse = await eventApi.getMyOrganizedEvents();
        setorganizedEvents(organizedResponse.data);

        const joinedResponse = await eventApi.getMyJoinedEvents();
        setjoinedEvents(joinedResponse.data);
        // // Filter for upcoming events user is attending
        // const upcoming = allEvents.filter(
        //   event => new Date(event.eventDate) > new Date() && Math.random() > 0.5 // Random selection for demo
        // );
        // setjoinedEvents(upcoming);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, navigate, user]);

  const handleDismissNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };



  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={() => navigate('/events/create')} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                <TabsTrigger value="myEvents">My Events</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>Events You're Attending</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {joinedEvents.length === 0 ? (
                      <div className="text-center py-6">
                        <Clock className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No upcoming events</p>
                        <Button 
                          variant="link" 
                          onClick={() => navigate('/')}
                          className="mt-2"
                        >
                          Find events to join
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {joinedEvents.map((event) => (
                          <EventCard key={event.eventID} event={event} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="myEvents" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <span>Events You're Organizing</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {organizedEvents.length === 0 ? (
                      <div className="text-center py-6">
                        <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">You haven't created any events yet</p>
                        <Button 
                          variant="link" 
                          onClick={() => navigate('/events/create')}
                          className="mt-2"
                        >
                          Create your first event
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {organizedEvents.map((event) => (
                          <EventCard key={event.eventID} event={event} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <NotificationList 
              notifications={notifications} 
              onDismiss={handleDismissNotification} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
