import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Ticket as TicketIcon, Eye, QrCode } from 'lucide-react';
import { Event, ticketApi, Ticket } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import TicketDetailsPage from '@/components/TicketDetailsPage';

interface TicketPurchaseProps {
  event: Event;
  isAttending: boolean;
}

const TicketPurchase: React.FC<TicketPurchaseProps> = ({ 
  event, 
  isAttending 
}) => {
  const { user } = useAuth();
  const [userTicket, setUserTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showTicketDetails, setShowTicketDetails] = useState(false);

  const fetchUserTicket = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await ticketApi.getMyTickets();
      if (response.status === 'success' && response.data.tickets) {
        const tickets = response.data.tickets;
        const ticket = tickets.find((t: Ticket) => t.event?.eventID === event.eventID);
        console.log('Fetched user ticket:', ticket);
        setUserTicket(ticket || null);
      }
    } catch (error) {
      console.error('Error fetching user ticket:', error);
    } finally {
      setIsLoading(false);
    }
  }, [event.eventID]);

  useEffect(() => {
    if (event.ticketingEnabled && isAttending) {
      fetchUserTicket();
    }
  }, [event.ticketingEnabled, isAttending, fetchUserTicket]);

  const handleViewTicket = () => {
    if (!userTicket || !user) {
      toast({
        title: "Error",
        description: "Ticket or user information not available",
        variant: "destructive",
      });
      return;
    }

    setShowTicketDetails(true);
  };

  const handleShowQR = () => {
    if (userTicket && userTicket.qrCode) {
      setShowQRDialog(true);
    } else {
      toast({
        title: "QR Code Unavailable",
        description: "QR code not available for this ticket",
        variant: "destructive",
      });
    }
  };

  if (!event.ticketingEnabled || !isAttending) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { variant: 'default' as const, label: 'Confirmed' },
      pending: { variant: 'secondary' as const, label: 'Pending' },
      revoked: { variant: 'destructive' as const, label: 'Revoked' },
      used: { variant: 'outline' as const, label: 'Used' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.confirmed;
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading your ticket...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TicketIcon className="h-5 w-5" />
          Your Event Ticket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userTicket ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ticket Status</span>
              {getStatusBadge(userTicket.status)}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ticket Number</span>
              <span className="text-sm font-mono">{userTicket.ticketNumber}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Price</span>
              <span className="text-sm font-semibold">
                ${Number(event.ticketPrice || 0).toFixed(2)}
              </span>
            </div>

            {(userTicket.status === 'confirmed' || userTicket.status !== 'revoked') && (
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleViewTicket}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Ticket
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleShowQR}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            )}

            {userTicket.status === 'pending' && (
              <div className="bg-yellow-50 text-yellow-700 rounded-md p-3 text-center text-sm">
                Ticket is pending approval by the organizer
              </div>
            )}

            {userTicket.status === 'revoked' && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-center text-sm">
                This ticket has been revoked by the organizer
              </div>
            )}

            {userTicket.status === 'used' && (
              <div className="bg-green-50 text-green-700 rounded-md p-3 text-center text-sm">
                Ticket used for event check-in
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              You're registered for this event, but no ticket has been issued yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Please contact the organizer if you need assistance.
            </p>
          </div>
        )}

        {Number(event.ticketPrice || 0) === 0 && userTicket && (
          <p className="text-xs text-muted-foreground text-center pt-2 border-t">
            This is a free event ticket
          </p>
        )}
      </CardContent>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Ticket QR Code
            </DialogTitle>
          </DialogHeader>
          
          {userTicket && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg">{event.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Ticket #{userTicket.ticketNumber}
                </p>
              </div>
              
              <div className="flex justify-center bg-white p-4 rounded-lg border">
                {userTicket.qrCode ? (
                  <img 
                    src={userTicket.qrCode} 
                    alt="Ticket QR Code"
                    className="w-64 h-64 object-contain"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded">
                    <span className="text-gray-500">QR Code not available</span>
                  </div>
                )}
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Show this QR code at the event entrance for check-in</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ticket Details Modal */}
      <Dialog open={showTicketDetails} onOpenChange={setShowTicketDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0">
          {userTicket && user && (
            <TicketDetailsPage
              ticket={userTicket}
              attendeeName={user.name}
              attendeeEmail={user.email}
              onBack={() => setShowTicketDetails(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TicketPurchase;
