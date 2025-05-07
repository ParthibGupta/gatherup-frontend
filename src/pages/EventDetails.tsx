import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import InviteForm from '@/components/InviteForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users, ArrowLeft, User, Check } from 'lucide-react';
import { eventApi, Event, attendanceApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [attendees, setAttendees] = useState<{ userID: string; fullName: string }[]>([]);
  const [isAttending, setIsAttending] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setIsLoading(true);

      if (!id) {
        navigate('/');
        return;
      }

      try {

        const response = await eventApi.getEventById(id);
        console.log(response.data)

        setEvent(response.data);
        
        const attendees = response.data.eventAttendees;
        setAttendees(attendees);
        
        // Check if user is attending
        if (isAuthenticated && user) {
          console.log(user);
          console.log(attendees.some(a => a.userID === user.id))
          setIsAttending(attendees.some(a => a.userID === user.id));
        }
      } catch (error) {
        console.log(error.message)
        toast({
          title: "Failed to load event",
          description: "Could not retrieve event details. Please try again later.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, navigate, isAuthenticated, user]);

  const handleJoinEvent = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to join this event.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!event || !user) return;

    setIsJoining(true);

    try {
      // In a real implementation, this would be an API call
      // For demo purposes, we'll simulate the API call
      // await new Promise(resolve => setTimeout(resolve, 1000));


      // const newAttendance = {
      //   userID: user.id,
      //   eventID: event.eventID || '',
      //   joinedAt: new Date().toISOString(),
      //   status: 'attended' as const,
      // };
      const response = await attendanceApi.recordAttendance(event.eventID);
      console.log(response);

      setIsAttending(true);
      console.log(user);
      setAttendees(prev => [
        ...prev,
        { userID: user.id, fullName: user.name },
      ]);

      toast({
        title: "Successfully joined!",
        description: `You've joined "${event.name}". We look forward to seeing you there!`,
      });
    } catch (error) {
      toast({
        title: "Failed to join event",
        description: "There was an error joining the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!event || !user) return;

    try {
      // In a real implementation, this would be an API call
      // For demo purposes, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Remove user from attendees list for UI update
      setAttendees(attendees.filter(a => a.userID !== user.id));
      setIsAttending(false);

      toast({
        title: "Left event",
        description: `You've left "${event.name}".`,
      });
    } catch (error) {
      toast({
        title: "Failed to leave event",
        description: "There was an error leaving the event. Please try again.",
        variant: "destructive",
      });
    }
  };


  const generateMockAttendees = () => {
    const names = [
      "Alex Johnson", "Jamie Smith", "Taylor Wilson", 
      "Jordan Lee", "Casey Brown", "Morgan Davis"
    ];
    
    return names.map((name, index) => ({
      id: `user-${index + 1}`,
      name
    }));
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse space-y-4 w-full max-w-3xl">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-64 bg-muted rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.eventDate);
  const isUpcoming = eventDate > new Date();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">{event.name}</h1>
                  <div className="flex items-center mt-2 text-muted-foreground">
                    <User className="mr-1 h-4 w-4" />
                    <span className="text-sm">Organized by {event.organizer.userID === user?.id ? "you" : event.organizer.fullName}</span>
                  </div>
                </div>
                <Badge>{event.category}</Badge>
              </div>
              
              <div className="h-64 rounded-xl overflow-hidden">
                <img
                  src={event.bannerURL}
                  alt={`${event.name} Banner`}
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-primary/10 rounded-full p-2 text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Date and Time</div>
                      <div className="text-sm text-muted-foreground">{format(eventDate, 'PPPP')}</div>
                      <div className="text-sm text-muted-foreground">{format(eventDate, 'p')}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-primary/10 rounded-full p-2 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Location</div>
                      <div className="text-sm text-muted-foreground">{event.locationTitle}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">About this event</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Event Capacity</h3>
                    <Badge variant="outline">
                      {attendees.length}/{event.capacity}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2" 
                      style={{ width: `${(attendees.length / event.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                {isUpcoming ? (
                  isAttending ? (
                    <>
                      <div className="bg-primary/10 text-primary rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Check className="h-5 w-5" />
                          <span className="font-medium">You're attending</span>
                        </div>
                        <p className="text-sm">We look forward to seeing you!</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleLeaveEvent}
                      >
                        Cancel Attendance
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        className="w-full" 
                        disabled={isJoining || attendees.length >= event.capacity}
                        onClick={handleJoinEvent}
                      >
                        {isJoining ? "Joining..." : 
                          attendees.length >= event.capacity ? "Event Full" : "Join Event"}
                      </Button>
                      {attendees.length >= event.capacity && (
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          This event is at full capacity. You can join the waitlist.
                        </p>
                      )}
                    </>
                  )
                ) : (
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-muted-foreground">This event has ended</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Attendees ({attendees.length})</span>
                </h3>
                
                <div className="space-y-3">
                  {attendees.map((attendee, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(attendee.fullName)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{attendee.fullName}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {isAuthenticated && isUpcoming && (
              <InviteForm eventId={event.eventID || ''} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// // Missing Check icon import
// const Check = ({ className }: { className?: string }) => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="24"
//     height="24"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     className={className}
//   >
//     <polyline points="20 6 9 17 4 12"></polyline>
//   </svg>
// );

export default EventDetails;
