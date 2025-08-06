
import React, { useEffect, useState } from 'react';
import { eventApi, Event } from '@/services/api';
import EventCard from '@/components/EventCard';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await eventApi.getAllEvents();
        if (response.events) {
          // Sort events by date (most recent first)
          console.log(response.events)
          const sortedEvents = response.events.sort((a, b) => 
            new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
          );
          setEvents(sortedEvents);
          setFilteredEvents(sortedEvents);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const filterEvents = (term: string, tab: string) => {
      let result = [...events];
      
      // Filter by search term
      if (term) {
        result = result.filter(event => 
          event.name.toLowerCase().includes(term.toLowerCase()) ||
          event.description.toLowerCase().includes(term.toLowerCase()) ||
          event.locationTitle.toLowerCase().includes(term.toLowerCase()) ||
          event.category.toLowerCase().includes(term.toLowerCase())
        );
      }
      
      // Filter by tab
      if (tab === 'upcoming') {
        result = result.filter(event => new Date(event.eventDate) > new Date());
      } else if (tab === 'past') {
        result = result.filter(event => new Date(event.eventDate) <= new Date());
      }
      
      setFilteredEvents(result);
    };

    filterEvents(searchTerm, activeTab);
  }, [searchTerm, activeTab, events]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Find your next event</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join events, meet people, and create memories. GatherUp makes it easy to find and organize events.
          </p>
          
          <div className="max-w-lg mx-auto flex gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-9"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Button className="gap-2">
              <Calendar className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>
        
        {/* Events Tabs */}
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0">
            {renderEventGrid(isLoading, filteredEvents)}
          </TabsContent>
          <TabsContent value="upcoming" className="mt-0">
            {renderEventGrid(isLoading, filteredEvents)}
          </TabsContent>
          <TabsContent value="past" className="mt-0">
            {renderEventGrid(isLoading, filteredEvents)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const renderEventGrid = (isLoading: boolean, events: Event[]) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <Skeleton className="h-40 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No events found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.eventID} event={event} />
      ))}
    </div>
  );
};

export default HomePage;
