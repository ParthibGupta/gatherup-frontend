
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '@/services/api';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  //FIXXXXX
  const eventDate = new Date();
  console.log('Event Date:', eventDate);
  const isUpcoming = eventDate > new Date();
  
  const getCategoryColor = (category: string) => {
    const categories: Record<string, string> = {
      'social': 'bg-gatherup-purple text-white',
      'professional': 'bg-gatherup-teal text-white',
      'entertainment': 'bg-gatherup-pink text-white',
      'education': 'bg-gatherup-yellow text-black',
      'sports': 'bg-blue-500 text-white',
      'other': 'bg-gray-500 text-white',
    };
    
    return categories[category.toLowerCase()] || categories.other;
  };

  return (
    <Link to={`/events/${event.eventID}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="relative h-40 bg-gradient-to-br from-gatherup-purple to-gatherup-teal">
  {!isUpcoming && (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
      <img
        src={`${event.bannerURL}`} // Replace with the actual path to your image
        alt="Past Event"
        className="absolute inset-0 h-full w-full object-cover" // Fill the div
      />
    </div>
  )}
</div>
        
        <CardContent className="pt-4 flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg line-clamp-1">{event.name}</h3>
            <Badge className={`ml-2 ${getCategoryColor(event.category)}`}>{event.category}</Badge>
          </div>
          
          <p className="text-muted-foreground line-clamp-2 mb-4 text-sm">{event.description}</p>
          
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <Calendar className="mr-2 h-4 w-4" />
            {format(eventDate, 'PPP')}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <MapPin className="mr-2 h-4 w-4" />
            {event.locationTitle}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="mr-2 h-4 w-4" />
            {`${event.capacity} capacity`}
          </div>
        </CardContent>
        
        <CardFooter className="bg-muted/50 py-3 px-6">
          <div className="text-xs text-muted-foreground">
            Created {format(new Date(event.createdAt), 'PPp')}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default EventCard;
