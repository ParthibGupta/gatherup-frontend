import React, { useState, useRef, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { useNavigate } from 'react-router-dom';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ScrollArea } from "@/components/ui/scroll-area";

type PexelsPhoto = {
  id: number;
  src: {
    original: string;
    large2x: string;
  };
  alt: string;
};

const libraries: Libraries = ['places'];

const CreateEvent: React.FC = () => {
  console.log(import.meta.env.VITE_GOOGLE_API_KEY)
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: null as Date | null,
    locationTitle: '',
    capacity: 50,
    category: '',
    location: {
      lat: 0,
      lng: 0
    },
    bannerURL: '',
    ticketingEnabled: false,
    ticketPrice: 0,
  });
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    date: '',
    locationTitle: '',
    capacity: '',
    category: '',
    bannerURL: '',
  });

  const [bannerSuggestions, setBannerSuggestions] = useState<PexelsPhoto[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<string>('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY!, 
    libraries,
  });

  const debouncedSearchBanners = useCallback(
    debounce(async (query: string) => {
      if (!query) return;
      
      setIsLoadingBanners(true);
      try {
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=9&orientation=landscape`,
          {
            headers: {
              Authorization: import.meta.env.VITE_PEXELS_API_KEY,
            },
          }
        );
        const data = await response.json();
        setBannerSuggestions(data.photos);
      } catch (error) {
        console.error('Error fetching banner suggestions:', error);
      } finally {
        setIsLoadingBanners(false);
      }
    }, 500),
    []
  );

  React.useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to create an event.",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (formData.name.length > 6) {
      debouncedSearchBanners(formData.name);
    } else {
      setBannerSuggestions([]);
    }
  }, [formData.name]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user selects a value
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData({ ...formData, date });
    
    // Clear error when user selects a date
    if (errors.date) {
      setErrors({ ...errors, date: '' });
    }
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address && place.geometry?.location) {
        setFormData({
          ...formData,
          locationTitle: place.formatted_address,
          location: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        });
        setErrors({ ...errors, locationTitle: '' });
      }
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
      bannerURL: '',
    };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date and time are required';
    } else {
      const now = new Date();
      if (formData.date < now) {
        newErrors.date = 'Date and time cannot be in the past';
      }
    }
    
    if (!formData.locationTitle.trim()) {
      newErrors.locationTitle = 'Location is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.bannerURL) {
      newErrors.bannerURL = 'Please select a banner image';
    }
    
    setErrors(newErrors);
    
    // Form is valid if no errors
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const eventData = {
        name: formData.name,
        description: formData.description,
        eventDate: formData.date!.toISOString(),
        locationTitle: formData.locationTitle,
        location: [formData.location.lng, formData.location.lat], 
        capacity: formData.capacity,
        bannerURL:formData.bannerURL,
        category: formData.category,
        ticketingEnabled: formData.ticketingEnabled,
        ticketPrice: formData.ticketPrice,
      };
      
      const response = await eventApi.createEvent(eventData);
      console.log(response);
      
      
      toast({
        title: "Event created!",
        description: `"${formData.name}" has been successfully created.`,
      });
      
      // Navigate to the events page
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Failed to create event",
        description: "There was an error creating your event. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const generateDescription = async () => {
    if (!formData.name.trim()) return;
  
    setIsGeneratingDescription(true);
  
    try {
      const response = await eventApi.getAIDescription(formData.name, formData.description);
  
      if (!response.status) {
        throw new Error('Failed to generate description');
      }
  
      const data = await response.data;
      setFormData({ ...formData, description: data.description });
      setErrors({ ...errors, description: '' });
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        title: 'Failed to generate description',
        description: 'An error occurred while generating the description. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };
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
          <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
          
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
                  <label className="block text-sm font-medium">
                    Event Banner
                  </label>
                  <div className="space-y-4">
                    {formData.bannerURL && (
                      <div className="relative h-48 rounded-lg overflow-hidden">
                        <img
                          src={formData.bannerURL}
                          alt="Selected banner"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setFormData({ ...formData, bannerURL: '' });
                            setSelectedBanner('');
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    
                    {formData.name.length > 2 && (
                      <ScrollArea className="h-[280px] rounded-md border">
                        {isLoadingBanners ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 p-2">
                            {bannerSuggestions.map((photo) => (
                              <div
                                key={photo.id}
                                className={cn(
                                  "relative aspect-video cursor-pointer rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition-all",
                                  selectedBanner === photo.src.original && "ring-2 ring-primary"
                                )}
                                onClick={() => {
                                  setSelectedBanner(photo.src.original);
                                  setFormData({ ...formData, bannerURL: photo.src.original });
                                  setErrors({ ...errors, bannerURL: '' });
                                }}
                              >
                                <img
                                  src={photo.src.large2x}
                                  alt={photo.alt}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    )}
                    {errors.bannerURL && (
                      <p className="text-sm text-destructive">{errors.bannerURL}</p>
                    )}
                  </div>
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
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateDescription}
                      disabled={!formData.name.trim() || isGeneratingDescription}
                    >
                      {isGeneratingDescription ? "Generating..." : "Generate using AI"}
                    </Button>
                    {!formData.name.trim() && (
                      <p className="text-sm text-muted-foreground">
                        Enter an event name to generate a description.
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Date and Time
                    </label>
                    <div className="space-y-2">
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
                            disabled={(date) => date < new Date()}
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
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

                <Separator className="my-6" />

                {/* Ticketing Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Event Ticketing</h3>
                      <p className="text-sm text-muted-foreground">
                        Enable ticketing for your event (currently free events only)
                      </p>
                    </div>
                    <Switch
                      checked={formData.ticketingEnabled}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, ticketingEnabled: checked })
                      }
                    />
                  </div>

                  {formData.ticketingEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                      <div className="space-y-2">
                        <label htmlFor="ticketPrice" className="block text-sm font-medium">
                          Ticket Price ($)
                        </label>
                        <Input
                          id="ticketPrice"
                          name="ticketPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.ticketPrice}
                          onChange={(e) => 
                            setFormData({ ...formData, ticketPrice: parseFloat(e.target.value) || 0 })
                          }
                          placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground">
                          Currently only $0.00 (free) events are supported. One ticket per user.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {formData.location.lat !== 0 && (
                  <div className="mt-4 h-[200px] w-full rounded-md overflow-hidden">
                    <GoogleMap
                      center={formData.location}
                      zoom={15}
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                      }}
                    >
                      <Marker position={formData.location} />
                    </GoogleMap>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Event"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );

  
};



export default CreateEvent;
