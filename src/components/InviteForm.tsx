
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { inviteApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface InviteFormProps {
  eventId: string;
}

const InviteForm: React.FC<InviteFormProps> = ({ eventId }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address to send an invite.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to send invites.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, we would look up the user ID based on the email
      // For now, we'll just use a mock ID
      const receiverId = `user-${Math.random().toString(36).substring(7)}`;

      await inviteApi.sendInvite({
        senderID: user.id,
        receiverID: receiverId,
        eventID: eventId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Invite sent!",
        description: `An invitation has been sent to ${email}.`,
      });

      setEmail('');
    } catch (error) {
      toast({
        title: "Failed to send invite",
        description: "There was an error sending the invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          <span>Invite People</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInvite} className="flex items-center gap-2">
          <Input
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InviteForm;
