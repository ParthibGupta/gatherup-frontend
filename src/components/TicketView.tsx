import React from 'react';
import { format } from 'date-fns';
import { Ticket } from '@/services/api';

interface TicketViewProps {
  ticket: Ticket;
  attendeeName: string;
  attendeeEmail: string;
}

const TicketView: React.FC<TicketViewProps> = ({ ticket, attendeeName, attendeeEmail }) => {
  const eventDate = ticket.event?.eventDate ? new Date(ticket.event.eventDate) : new Date();

  return (
    <>
      <style>
        {`
          #ticket-view {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          }
          #ticket-view * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Mobile responsive styles */
          @media (max-width: 768px) {
            #ticket-view {
              width: 100% !important;
              height: auto !important;
              min-height: 100vh !important;
            }
            .ticket-content {
              flex-direction: column !important;
            }
          }
        `}
      </style>
      <div 
        id="ticket-view"
        className="bg-white"
        style={{ 
          width: '210mm', 
          height: '297mm',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          position: 'relative',
          margin: 0,
          padding: '40px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
      {/* Subtle background watermark */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          transform: 'rotate(-45deg)',
          fontSize: '100px',
          fontWeight: '300',
          color: 'rgba(155, 135, 245, 0.015)',
          letterSpacing: '20px',
          zIndex: 0
        }}
      >
        GATHERUP
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div 
          className="text-center border-b"
          style={{ 
            borderBottomColor: '#9b87f5',
            borderBottomWidth: '2px',
            paddingBottom: '30px',
            marginBottom: '40px'
          }}
        >
          <h1 
            className="m-0 font-bold"
            style={{ 
              fontSize: '36px',
              color: '#1f2937',
              letterSpacing: '1px',
              marginBottom: '8px'
            }}
          >
            Event Ticket
          </h1>
        </div>

        {/* Body */}
        <div 
          className="flex-1 flex flex-col justify-between"
        >
          <div>
            <p className="text-lg mb-6" style={{ color: '#4b5563' }}>Hello {attendeeName},</p>
            <p className="text-base mb-8" style={{ color: '#6b7280', lineHeight: '1.6' }}>
              Thank you for registering! Please present this ticket at the event entrance.
            </p>

            {/* Event Name */}
            <div 
              className="text-center mb-8"
              style={{
                padding: '30px 0',
                borderTop: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <div 
                className="font-bold mb-3"
                style={{
                  fontSize: '32px',
                  color: '#111827',
                  letterSpacing: '0.5px'
                }}
              >
                {ticket.event?.name || 'Unknown Event'}
              </div>
              <div 
                style={{
                  fontSize: '18px',
                  color: '#6b7280',
                  marginTop: '12px'
                }}
              >
                <div className="mb-2">{format(eventDate, 'PPPP')}</div>
                <div>{format(eventDate, 'p')}</div>
              </div>
            </div>

            {/* Main Content */}
            <div className="ticket-content flex flex-col md:flex-row gap-8 mb-8 items-start">
              {/* Ticket Details */}
              <div 
                className="flex-1"
                style={{
                  padding: '0'
                }}
              >
                <div className="mb-6 text-lg" style={{ color: '#374151' }}>
                  <span className="font-semibold text-gray-900 inline-block min-w-32">Attendee:</span>
                  <span className="ml-4">{attendeeName}</span>
                </div>
                <div className="mb-6 text-lg" style={{ color: '#374151' }}>
                  <span className="font-semibold text-gray-900 inline-block min-w-32">Email:</span>
                  <span className="ml-4">{attendeeEmail}</span>
                </div>
                
                <div className="mb-6 text-lg" style={{ color: '#374151' }}>
                  <span className="font-semibold text-gray-900 inline-block min-w-32">No. of attendees:</span>
                  <span className="ml-4">1</span>
                </div>
<div className="mb-6 text-lg" style={{ color: '#374151' }}>
                  <span className="font-semibold text-gray-900 inline-block min-w-32">Locaiton:</span>
                  <span className="ml-4">{}</span>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="text-center flex flex-col items-center" style={{ padding: '20px 0', minWidth: '200px' }}>
                {ticket.qrCode && (
                  <img 
                    src={ticket.qrCode} 
                    alt="QR Code"
                    className="border border-gray-200 rounded-lg"
                    style={{ 
                      width: '160px', 
                      height: '160px',
                      objectFit: 'contain',
                      padding: '10px'
                    }}
                  />
                )}
                <div 
                  className="text-gray-500 uppercase font-medium mt-4"
                  style={{ 
                    fontSize: '12px',
                    letterSpacing: '1px'
                  }}
                >
                  Scan to Verify
                </div>
              </div>
            </div>

            {/* Ticket Number */}
            <div 
              className="text-center font-semibold"
              style={{
                fontSize: '20px',
                color: '#9b87f5',
                padding: '20px 0',
                letterSpacing: '2px',
                borderTop: '1px solid #e5e7eb',
                marginTop: '30px'
              }}
            >
              Ticket #{ticket.ticketNumber}
            </div>

            {/* Divider */}
            <div 
              style={{ 
                borderTop: '1px solid #e5e7eb',
                margin: '30px 0'
              }}
            />
          </div>

          {/* Footer Section */}
          <div className="mt-auto">
            <p className="text-center text-base my-6" style={{ color: '#6b7280', lineHeight: '1.6' }}>
              Please present this ticket at the event entrance along with a valid ID.
            </p>
            <p className="text-center text-base my-6" style={{ color: '#6b7280', lineHeight: '1.6' }}>
              We look forward to seeing you there!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="text-center text-sm border-t"
          style={{
            color: '#9ca3af',
            padding: '20px 0',
            borderTop: '1px solid #e5e7eb',
            marginTop: '40px'
          }}
        >
          <p>&copy; 2025 GatherUp. All rights reserved.</p>
        </div>
      </div>
    </div>
    </>
  );
};

export default TicketView;
