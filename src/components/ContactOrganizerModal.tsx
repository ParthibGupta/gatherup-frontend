import React, { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";
import { emailApi, Event } from "@/services/api";


interface ContactOrganizerModalProps {
  event: Event
  attendee: {
    fullName: string;
    email: string;
  }
} 

const ContactOrganizerModal: React.FC<ContactOrganizerModalProps> = ({event, attendee}) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  interface Attendee {
  fullName: string;
  email: string;
}

interface EventDetails {
  name: string;
  eventDate: string;
  locationTitle: string;
  organizer: {
    fullName: string;
    email: string;
  };
  attendees: Attendee[];
}
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const response = await emailApi.sendContactRequest(attendee, event.organizer, message, event);
    if (response) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsPopoverOpen(false);
      }, 1000); // Close the popover after 2 seconds
    } else {
      alert("Failed to send message. Please try again.");
    }
    setMessage(""); // Clear the message after submission
    setIsSubmitting(false);
    setIsSuccess(false);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 w-[200px]">
          Contact Organizer
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={message}
            onChange={handleInputChange}
            placeholder="Write your message here..."
            className="w-full h-32 px-3 py-2 border rounded-md"
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="default" size="sm" className="gap-2" disabled={isSubmitting}>
              {isSubmitting ? (isSuccess? "Sent" : "Sending") : "Send"}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default ContactOrganizerModal;