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
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { Libraries } from '@react-google-maps/api';
import { FastAverageColor } from 'fast-average-color';
import ContactOrganizerModal from '@/components/ContactOrganizerModal';
import SummaryExport from '@/components/event/SummaryExport';
const libraries: Libraries = ['places', 'marker'];
const fac = new FastAverageColor();

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [attendees, setAttendees] = useState<{ userID: string; fullName: string; email: string }[]>([]);
  const [isAttending, setIsAttending] = useState(false);
  const [bgColor, setBgColor] = useState<string>('');

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY!,
    libraries,
  });

  const getImageColor = async (imageUrl: string) => {
    try {
      const result = await fac.getColorAsync(imageUrl);
      const [r, g, b] = result.value;
      return `rgb(${r}, ${g}, ${b})`;
    } catch (error) {
      console.error('Error getting image color:', error);
      return 'rgb(0, 0, 0)'; // fallback color
    }
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      setIsLoading(true);

      if (!id) {
        navigate('/');
        return;
      }

      try {
        const response = await eventApi.getEventById(id);
        setEvent(response.data);

        // Get background color from banner
        if (response.data.bannerURL) {
          const color = await getImageColor(response.data.bannerURL);
          setBgColor(color);
          console.log('Background color:', color);
        }

        const attendees = response.data.eventAttendees;
        setAttendees(attendees);

        // Check if user is attending
        if (isAuthenticated && user) {
          setIsAttending(attendees.some(a => a.userID === user.id));
        }
      } catch (error) {
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
      const response = await attendanceApi.recordAttendance(event.eventID);

      setIsAttending(true);
      setAttendees(prev => [
        ...prev,
        { userID: user.id, fullName: user.name , email: user.email },
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
      await new Promise(resolve => setTimeout(resolve, 1000));

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
<div 
  className="min-h-screen bg-background"
  style={{
    backgroundColor: 'rgb(155 97 255 / 0.03)',
    backgroundImage: `
      radial-gradient(circle at 100% 100%, transparent 18%, rgb(155 97 255 / 0.08) 16%, rgb(155 97 255 / 0.08) 20%, transparent 21%, transparent 100%),
      radial-gradient(circle at 0% 100%, transparent 18%, rgb(155 97 255 / 0.08) 16%, rgb(155 97 255 / 0.08) 20%, transparent 21%, transparent 100%),
      radial-gradient(circle at 100% 0%, transparent 18%, rgb(155 97 255 / 0.08) 16%, rgb(155 97 255 / 0.08) 20%, transparent 21%, transparent 100%),
      radial-gradient(circle at 0% 0%, transparent 18%, rgb(155 97 255 / 0.08) 16%, rgb(155 97 255 / 0.08) 20%, transparent 21%, transparent 100%),
      conic-gradient(from 90deg at 50% 50%, rgb(155 97 255 / 0.05) 0%, rgb(155 97 255 / 0.1) 25%, rgb(155 97 255 / 0.05) 50%, rgb(155 97 255 / 0.1) 75%, rgb(155 97 255 / 0.05) 100%)
    `,
    backgroundSize: `50px 50px, 50px 50px, 50px 50px, 50px 50px, 100% 100%`,
    backgroundPosition: `0 0, 0 0, 0 0, 0 0, center center`,
    backgroundRepeat: 'repeat, repeat, repeat, repeat, no-repeat',
    backgroundBlendMode: 'multiply'
  }}
>
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
                  style={{ backgroundColor: bgColor }}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-full p-2 text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Date and Time</div>
                      <div className="text-sm text-muted-foreground">{format(eventDate, 'PPPP')}</div>
                      <div className="text-sm text-muted-foreground">{format(eventDate, 'p')}</div>
                    </div>
                  </div>
                  {(isAuthenticated && isAttending)? (<ContactOrganizerModal event={event} attendee={{fullName: user.name, email: user.email}}/>) : ""}
                  
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


              {event.organizer.userID === user?.id ? (
                <div className='space-y-4' style={{ display: 'flex', flexDirection: 'column' }}>

                  <Button 
                    className="w-full mt-4" 
                    onClick={() =>  window.location.href = `/events/update/${event.eventID}`}
                  > 
                    Make Changes to Event
                  </Button>
                  <SummaryExport event={event} />
                </div>
                
              ) : null}
              </CardContent>
            </Card>

            <Card>
                  <CardContent className="space-y-4">
                    <div className="p-4 flex items-center gap-3">
                      <div className="bg-primary/10 rounded-full p-2 text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Location</div>
                        <div className="text-sm text-muted-foreground">{event.locationTitle}</div>
                      </div>
                    </div>
                    
                    {/* Map Container */}
                    <div className="h-[200px] w-full rounded-md overflow-hidden">
                      {isLoaded && event.location && (
                        <GoogleMap
                          center={parseLocation(event.location)}
                          zoom={15}
                          mapContainerStyle={{ width: '100%', height: '100%' }}
                          options={{
                            disableDefaultUI: true,
                            zoomControl: true,
                            mapId: import.meta.env.VITE_GOOGLE_MAP_ID, // Add this line
                          }}
                          onLoad={(map) => {
                            // Check if AdvancedMarkerElement is available
                            if (window.google.maps.marker?.AdvancedMarkerElement) {
                              new window.google.maps.marker.AdvancedMarkerElement({
                                position: parseLocation(event.location),
                                map: map,
                                title: event.locationTitle,
                              });
                            } else {
                              // Fallback to regular Marker if AdvancedMarkerElement is not available
                              new window.google.maps.Marker({
                                position: parseLocation(event.location),
                                map: map,
                                title: event.locationTitle,
                              });
                            }
                          }}
                        />
                      )}
                    </div>
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
const parseLocation = (location: string | number[]) => {
  try {
    if (Array.isArray(location)) {
      const [lng, lat] = location;
      return { lat, lng };
    }
    if(!location.includes('{') || !location.includes('}')) {
      return { lat: -33.8688, lng: 151.2093 }; // Default to Sydney coordinates
    }
    // Remove the curly braces and split the string
    const cleaned = location.replace(/[{}]/g, '');
    const [lng, lat] = cleaned.split(',').map(coord => 
      Number(coord.replace(/"/g, ''))
    );

    return { lat, lng };
  } catch (error) {
    console.error('Error parsing location:', error);
    // Default to Sydney coordinates if parsing fails
    return { lat: -33.8688, lng: 151.2093 };
  }
};

export default EventDetails;
