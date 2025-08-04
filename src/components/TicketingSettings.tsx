import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Ticket as TicketIcon, 
  Users, 
  DollarSign, 
  AlertCircle,
  XCircle,
  Download
} from 'lucide-react';
import { Event, Ticket, ticketApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TicketingSettingsProps {
  event: Event;
  onEventUpdate: (updatedEvent: Partial<Event>) => void;
}

const TicketingSettings: React.FC<TicketingSettingsProps> = ({ 
  event, 
  onEventUpdate 
}) => {
  const [localSettings, setLocalSettings] = useState({
    ticketingEnabled: event.ticketingEnabled || false,
    ticketPrice: event.ticketPrice || 0,
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketSummary, setTicketSummary] = useState<{
    total: number;
    confirmed: number;
    pending: number;
    used: number;
    revoked: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchEventTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await ticketApi.getEventTickets(event.eventID);
      if (response.status === 'success' && response.data) {
        console.log('Fetched tickets response:', response.data);
        
        // Handle the new response structure with summary and tickets
        if (response.data.tickets) {
          setTickets(response.data.tickets);
        }
        
        if (response.data.summary) {
          setTicketSummary(response.data.summary);
        }
      }
    } catch (error) {
      toast({
        title: "Failed to load tickets",
        description: "Could not fetch event tickets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [event.eventID]);

  useEffect(() => {
    if (event.ticketingEnabled) {
      fetchEventTickets();
    }
  }, [event.eventID, event.ticketingEnabled, fetchEventTickets]);

  const handleSettingsChange = (field: string, value: string | number | boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSettings = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      onEventUpdate(localSettings);
      toast({
        title: "Settings Saved",
        description: "Ticketing settings have been updated successfully",
      });
      setIsSaving(false);
    }, 1000);
  };

  const handleTicketAction = async (ticketID: string, action: 'revoke') => {
    try {
      await ticketApi.revokeTicket(ticketID);
      toast({
        title: "Ticket Revoked",
        description: "The ticket has been revoked successfully",
      });
      
      // Refresh tickets
      fetchEventTickets();
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to revoke ticket",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      revoked: { color: 'bg-red-100 text-red-800', label: 'Revoked' },
      used: { color: 'bg-blue-100 text-blue-800', label: 'Used' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.confirmed;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const ticketStats = ticketSummary || {
    total: tickets.length,
    confirmed: tickets.filter(t => t.status === 'confirmed').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    used: tickets.filter(t => t.status === 'used').length,
    revoked: tickets.filter(t => t.status === 'revoked').length,
  };
  
  const revenue = (ticketStats.confirmed + ticketStats.used) * Number(event.ticketPrice || 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Ticketing Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-ticketing">Enable Ticketing</Label>
              <p className="text-sm text-muted-foreground">
                Allow attendees to purchase tickets for this event
              </p>
            </div>
            <Switch
              id="enable-ticketing"
              checked={localSettings.ticketingEnabled}
              onCheckedChange={(checked) => handleSettingsChange('ticketingEnabled', checked)}
            />
          </div>

          {localSettings.ticketingEnabled && (
            <>
              <Separator />
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ticket-price">Ticket Price ($)</Label>
                  <Input
                    id="ticket-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={localSettings.ticketPrice}
                    onChange={(e) => handleSettingsChange('ticketPrice', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Currently only $0.00 (free) events are supported. One ticket per user.
                  </p>
                </div>
              </div>

              {localSettings.ticketPrice === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This is set as a free event. Attendees will receive free tickets.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          <Button 
            onClick={saveSettings} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      {localSettings.ticketingEnabled && (
        <>
          {/* Ticket Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TicketIcon className="h-5 w-5" />
                Ticket Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{ticketStats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Tickets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{ticketStats.confirmed}</div>
                  <div className="text-sm text-muted-foreground">Confirmed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{ticketStats.pending}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{ticketStats.revoked}</div>
                  <div className="text-sm text-muted-foreground">Revoked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">${revenue.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Ticket Management
                </span>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8">
                  <TicketIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tickets purchased yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div key={ticket.ticketID} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{ticket.user?.fullName || 'Unknown User'}</div>
                        <div className="text-sm text-muted-foreground">{ticket.user?.email}</div>
                        <div className="text-xs text-muted-foreground">
                          Ticket: {ticket.ticketNumber}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {getStatusBadge(ticket.status)}
                        
                        {ticket.status !== 'revoked' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTicketAction(ticket.ticketID, 'revoke')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default TicketingSettings;
