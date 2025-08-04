import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { Ticket } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { generatePDFFromElement } from '@/utils/pdfGenerator';
import TicketView from '@/components/TicketView';

interface TicketDetailsPageProps {
  ticket: Ticket;
  attendeeName: string;
  attendeeEmail: string;
  onBack: () => void;
}

const TicketDetailsPage: React.FC<TicketDetailsPageProps> = ({
  ticket,
  attendeeName,
  attendeeEmail,
  onBack
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      await generatePDFFromElement({
        elementId: 'ticket-view',
        filename: `ticket-${ticket.ticketNumber}.pdf`
      });
      
      toast({
        title: "PDF Generated",
        description: `Ticket PDF has been downloaded successfully`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Could not generate ticket PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && ticket.qrCode) {
      try {
        await navigator.share({
          title: `Ticket for ${ticket.event?.name}`,
          text: `Here's my ticket for ${ticket.event?.name}`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying link
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Ticket link copied to clipboard",
        });
      }
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Ticket link copied to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Event Ticket</h1>
                <p className="text-sm text-muted-foreground">
                  {ticket.event?.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isGeneratingPDF ? "Generating..." : "Download PDF"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ maxWidth: '210mm' }}>
            <TicketView
              ticket={ticket}
              attendeeName={attendeeName}
              attendeeEmail={attendeeEmail}
            />
          </div>
        </div>
        
        {/* Mobile Download Button */}
        <div className="mt-8 flex justify-center md:hidden">
          <Button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            size="lg"
            className="w-full max-w-sm"
          >
            <Download className="h-5 w-5 mr-2" />
            {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-8 max-w-2xl mx-auto">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">How to use your ticket:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-medium text-primary">1.</span>
                <span>Save this ticket to your device by downloading the PDF or taking a screenshot</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-primary">2.</span>
                <span>Bring the ticket (digital or printed) to the event entrance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-primary">3.</span>
                <span>Show the QR code to event staff for quick check-in</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-primary">4.</span>
                <span>Have a valid ID ready for verification</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsPage;
