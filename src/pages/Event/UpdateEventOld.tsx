import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLoadScript, Autocomplete, GoogleMap, Marker } from '@react-google-maps/api';
import Navbar from '@/components/Navbar';
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
import { ArrowLeft, CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { eventApi } from '@/services/api';
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: null as Date | null,
    locationTitle: '',
    capacity: 50,
    bannerURL: '',
    category: '',
    location: []
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
        // Parse location from string to array
        const locationArray = event.location;
        
        setFormData({
          name: event.name,
          description: event.description,
          date: new Date(event.eventDate),
          locationTitle: event.locationTitle,
          capacity: event.capacity,
          category: event.category,
          bannerURL: event.bannerURL,
          location: locationArray,
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
  }, [id, navigate]);

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

  const validateForm = () => {
    const newErrors = {
      name: '',
      description: '',
      date: '',
      locationTitle: '',
      capacity: '',
      category: '',
    };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (formData.date < new Date()) {
      newErrors.date = 'Date cannot be in the past';
    }
    
    if (!formData.locationTitle.trim()) {
      newErrors.locationTitle = 'Location is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    
    return !Object.values(newErrors).some(error => error);
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address && place.geometry?.location) {
        const location = [
          place.geometry.location.lng(),
          place.geometry.location.lat(),
        ];
        setFormData((prevData) => ({
          ...prevData,
          locationTitle: place.formatted_address || '',
          location,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      const eventData = {
        name: formData.name,
        description: formData.description,
        eventDate: formData.date!.toISOString(),
        locationTitle: formData.locationTitle,
        location: formData.location,
        capacity: formData.capacity,
        bannerURL: formData.bannerURL,
        category: formData.category,
      };
      
      const response = await eventApi.updateEvent(id, eventData);
      console.log(response);
      if(response.status === 'failed') {
        throw new Error(response.error);
      }
      
      toast({
        title: "Event updated!",
        description: `"${formData.name}" has been successfully updated.`,
      });
      
      navigate(`/events/${id}`);
    } catch (error) {
      toast({
        title: "Failed to update event",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error updating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || isLoading) {
    return <div>Loading...</div>;
  }

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
        
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Update Event</h1>
          
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Event Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    className={errors.description ? 'border-destructive' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.date && "text-muted-foreground",
                            errors.date && "border-destructive"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.date || undefined}
                          onSelect={handleDateChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.date && (
                      <p className="text-sm text-destructive">{errors.date}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="time" className="block text-sm font-medium">
                      Time
                    </label>
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => (document.getElementById('time') as HTMLInputElement)?.showPicker()}
                    >
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        value={formData.date ? format(formData.date, "HH:mm") : ""}
                        onChange={(e) => {
                          const timeValue = e.target.value;
                          const [hours, minutes] = timeValue.split(':').map(Number);
                          
                          let newDate;
                          if (formData.date) {
                            newDate = new Date(formData.date);
                          } else {
                            newDate = new Date();
                            newDate.setSeconds(0, 0);
                          }
                          
                          newDate.setHours(hours);
                          newDate.setMinutes(minutes);
                          handleDateChange(newDate);
                        }}
                        className={cn(
                          "pl-9 pointer-events-none", 
                          errors.date && "border-destructive",
                          "group-hover:border-primary",
                          "[&::-webkit-calendar-picker-indicator]{display: none}", // Hide the clock icon in Chrome
                          "[&::-webkit-inner-spin-button]{display: none}", // Hide any spin buttons
                          "[&::-webkit-clear-button]{display: none}" // Hide the clear button
                        )}
                      />
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {errors.date && (
                    <p className="text-sm text-destructive">{errors.date}</p>
                  )}
                </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="category" className="block text-sm font-medium">
                      Category
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger 
                        className={errors.category ? 'border-destructive' : ''}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive">{errors.category}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="locationTitle" className="block text-sm font-medium">
                      Location
                    </label>
                    <Autocomplete
                      onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                      onPlaceChanged={handlePlaceChanged}
                    >
                      <Input
                        id="locationTitle"
                        name="locationTitle"
                        value={formData.locationTitle}
                        onChange={(e) =>
                          setFormData({ ...formData, locationTitle: e.target.value })
                        }
                        placeholder="Search for a location"
                        className={errors.locationTitle ? 'border-destructive' : ''}
                      />
                    </Autocomplete>
                    {errors.locationTitle && (
                      <p className="text-sm text-destructive">{errors.locationTitle}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="capacity" className="block text-sm font-medium">
                      Capacity
                    </label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.capacity}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {formData.location.length > 0 && (
                  <div className="mt-4 h-[200px] w-full rounded-md overflow-hidden">
                    <GoogleMap
                        center={parseLocation(formData.location)}
                        zoom={15}
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                        mapId: import.meta.env.VITE_GOOGLE_MAP_ID, // Add this line
                        }}
                        onLoad={(map) => {
                            console.log(parseLocation(formData.location));
                            // Check if AdvancedMarkerElement is available
                            if (window.google.maps.marker?.AdvancedMarkerElement) {
                                new window.google.maps.marker.AdvancedMarkerElement({
                                position: parseLocation(formData.location),
                                map: map,
                                title: formData.locationTitle,
                                });
                            } else {
                                // Fallback to regular Marker if AdvancedMarkerElement is not available
                                new window.google.maps.Marker({
                                position: parseLocation(formData.location),
                                map: map,
                                title: formData.locationTitle,
                                });
                            }
                            }}
                    />
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/events/${id}`)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Event"}
                </Button>
              </CardFooter>
            </form>
          </Card>
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
export default UpdateEvent;