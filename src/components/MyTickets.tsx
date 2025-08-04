import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Ticket as TicketIcon, Download, QrCode, Calendar, MapPin, X } from 'lucide-react';
import { Ticket, ticketApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    setIsLoading(true);
    try {
      const response = await ticketApi.getMyTickets();
      if (response.status === 'success' && response.data.tickets) {
        console.log('Fetched tickets:', response.data.tickets);
        setTickets(response.data.tickets);
      }
    } catch (error) {
      toast({
        title: "Failed to load tickets",
        description: "Could not fetch your tickets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleShowQR = (ticket: Ticket) => {
    if (ticket.qrCode) {
      setSelectedTicket(ticket);
      setShowQRDialog(true);
    } else {
      toast({
        title: "QR Code Unavailable",
        description: "QR code not available for this ticket",
        variant: "destructive",
      });
    }
  };

  const handleDownloadTicket = (ticket: Ticket) => {
    if (ticket.pdfUrl) {
      // Redirect to the PDF URL on the backend
      const API_URL = import.meta.env.VITE_API_URL!;
      window.open(`${API_URL}/${ticket.pdfUrl}`, '_blank');
      
      toast({
        title: "Download Started",
        description: `Downloading ticket for ${ticket.event?.name}`,
      });
    } else {
      toast({
        title: "Download Error",
        description: "PDF not available for this ticket",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <p className="text-muted-foreground">Manage your event tickets</p>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TicketIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No tickets yet</h2>
            <p className="text-muted-foreground">
              When you purchase tickets for events, they'll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket) => (
            <Card key={ticket.ticketID}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{ticket.event?.name || 'Unknown Event'}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Ticket #{ticket.ticketNumber}
                    </p>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.event && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(ticket.event.eventDate), 'PPP')} at{' '}
                        {format(new Date(ticket.event.eventDate), 'p')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Event Location</span>
                    </div>
                  </>
                )}

                <div className="flex gap-2 pt-4">
                  {ticket.status === 'confirmed' && (
                    <>
                      <Button 
                        onClick={() => handleDownloadTicket(ticket)}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleShowQR(ticket)}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {ticket.status === 'pending' && (
                    <div className="flex-1 bg-yellow-50 text-yellow-700 rounded-md p-3 text-center text-sm">
                      Ticket is pending approval
                    </div>
                  )}
                  
                  {ticket.status === 'revoked' && (
                    <div className="flex-1 bg-destructive/10 text-destructive rounded-md p-3 text-center text-sm">
                      This ticket has been revoked
                    </div>
                  )}
                  
                  {ticket.status === 'used' && (
                    <div className="flex-1 bg-green-50 text-green-700 rounded-md p-3 text-center text-sm">
                      Ticket used for event check-in
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Ticket QR Code
            </DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg">{selectedTicket.event?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Ticket #{selectedTicket.ticketNumber}
                </p>
              </div>
              
              <div className="flex justify-center bg-white p-4 rounded-lg border">
                {selectedTicket.qrCode ? (
                  <img 
                    src={selectedTicket.qrCode} 
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
    </div>
  );
};

export default MyTickets;
