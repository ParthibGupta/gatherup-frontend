import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLoadScript, Autocomplete, GoogleMap, Marker } from '@react-google-maps/api';
import Navbar from '@/components/Navbar';
import TicketingSettings from '@/components/TicketingSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ArrowLeft, CalendarIcon, Clock, Save } from 'lucide-react';
import { format } from 'date-fns';
import { eventApi, Event } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Libraries } from '@react-google-maps/api';

const libraries: Libraries = ['places'];

const UpdateEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: null as Date | null,
    locationTitle: '',
    capacity: 50,
    bannerURL: '',
    category: '',
    location: [],
    ticketingEnabled: false,
    ticketPrice: 0,
    maxTicketsPerUser: 5,
  });

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    date: '',
    locationTitle: '',
    capacity: '',
    category: '',
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY!,
    libraries,
  });

  // Load existing event data
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) {
        navigate('/dashboard');
        return;
      }

      try {
        const response = await eventApi.getEventById(id);
        const event = response.data;
        if(event && event.organizer.userID !== user?.id) {
          toast({
            title: "Unauthorized",
            description: "You are not authorized to update this event.",
            variant: "destructive",
          });
          navigate('/dashboard');
          return;
        }
        
        setCurrentEvent(event);
        setFormData({
          name: event.name,
          description: event.description,
          date: new Date(event.eventDate),
          locationTitle: event.locationTitle,
          capacity: event.capacity,
          category: event.category,
          bannerURL: event.bannerURL,
          location: event.location,
          ticketingEnabled: event.ticketingEnabled || false,
          ticketPrice: event.ticketPrice || 0,
          maxTicketsPerUser: event.maxTicketsPerUser || 5,
        });
      } catch (error) {
        toast({
          title: "Failed to load event",
          description: "Could not retrieve event details. Please try again later.",
          variant: "destructive",
        });
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, navigate, user?.id]);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to update an event.",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData({ ...formData, date });
    
    if (errors.date) {
      setErrors({ ...errors, date: '' });
    }
  };

  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setFormData({
          ...formData,
          locationTitle: place.formatted_address || place.name || '',
          location: [lng, lat],
        });
        
        if (errors.locationTitle) {
          setErrors({ ...errors, locationTitle: '' });
        }
      }
    }
  };

  const validateForm = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
      isValid = false;
    }

    if (!formData.date) {
      newErrors.date = 'Event date is required';
      isValid = false;
    } else if (formData.date <= new Date()) {
      newErrors.date = 'Event date must be in the future';
      isValid = false;
    }

    if (!formData.locationTitle.trim()) {
      newErrors.locationTitle = 'Event location is required';
      isValid = false;
    }

    if (formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
      isValid = false;
    }

    if (!formData.category) {
      newErrors.category = 'Event category is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!id) return;

    setIsSubmitting(true);

    try {
      const eventData = {
        name: formData.name,
        description: formData.description,
        eventDate: formData.date!.toISOString(),
        locationTitle: formData.locationTitle,
        location: formData.location,
        capacity: formData.capacity,
        bannerURL: formData.bannerURL,
        category: formData.category,
        ticketingEnabled: formData.ticketingEnabled,
        ticketPrice: formData.ticketPrice,
        maxTicketsPerUser: formData.maxTicketsPerUser,
      };

      const response = await eventApi.updateEvent(id, eventData);

      if (response.status === 'success') {
        toast({
          title: "Event updated successfully!",
          description: "Your event has been updated and is now live.",
        });
        navigate(`/events/${id}`);
      } else {
        throw new Error(response.error || 'Update failed');
      }
    } catch (error) {
      toast({
        title: "Failed to update event",
        description: error instanceof Error ? error.message : "There was an error updating your event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTicketingUpdate = (ticketingData: Partial<Event>) => {
    setFormData(prev => ({
      ...prev,
      ...ticketingData
    }));
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading || !currentEvent) {
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
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          {/* Event Banner Header */}
          <div className="relative rounded-xl overflow-hidden mb-6">
            <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/10 relative">
              {currentEvent.bannerURL && (
                <img
                  src={currentEvent.bannerURL}
                  alt={`${currentEvent.name} Banner`}
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-end">
                <div className="p-6 text-white">
                  <h1 className="text-3xl font-bold">{currentEvent.name}</h1>
                  <p className="text-white/80 mt-2">Update Event Details</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Update Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Event Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter event name"
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your event"
                      rows={4}
                      className={errors.description ? 'border-destructive' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Event Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.date && "text-muted-foreground",
                              errors.date && "border-destructive"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.date || undefined}
                            onSelect={handleDateChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.date && (
                        <p className="text-sm text-destructive">{errors.date}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="capacity" className="text-sm font-medium">
                        Capacity
                      </label>
                      <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                        placeholder="Maximum attendees"
                        min="1"
                        className={errors.capacity ? 'border-destructive' : ''}
                      />
                      {errors.capacity && (
                        <p className="text-sm text-destructive">{errors.capacity}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      Category
                    </label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="meetup">Meetup</SelectItem>
                        <SelectItem value="seminar">Seminar</SelectItem>
                        <SelectItem value="party">Party</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive">{errors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bannerURL" className="text-sm font-medium">
                      Banner Image URL
                    </label>
                    <Input
                      id="bannerURL"
                      name="bannerURL"
                      value={formData.bannerURL}
                      onChange={handleInputChange}
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>

                  {isLoaded && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <Autocomplete
                        onLoad={(autocomplete) => {
                          autocompleteRef.current = autocomplete;
                        }}
                        onPlaceChanged={handlePlaceSelect}
                      >
                        <Input
                          name="locationTitle"
                          value={formData.locationTitle}
                          onChange={handleInputChange}
                          placeholder="Search for a location"
                          className={errors.locationTitle ? 'border-destructive' : ''}
                        />
                      </Autocomplete>
                      {errors.locationTitle && (
                        <p className="text-sm text-destructive">{errors.locationTitle}</p>
                      )}
                      
                      {formData.location.length > 0 && (
                        <div className="h-48 w-full rounded-md overflow-hidden border">
                          <GoogleMap
                            center={{ lat: formData.location[1], lng: formData.location[0] }}
                            zoom={15}
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            options={{
                              disableDefaultUI: true,
                              zoomControl: true,
                            }}
                          >
                            <Marker position={{ lat: formData.location[1], lng: formData.location[0] }} />
                          </GoogleMap>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Updating Event..." : "Update Event"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>

          {/* Ticketing Settings Sidebar */}
          <div className="space-y-6">
            <TicketingSettings 
              event={currentEvent} 
              onEventUpdate={handleTicketingUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateEvent;
