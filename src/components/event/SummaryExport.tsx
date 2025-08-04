import React from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Event } from "@/services/api";
import { Button } from '@/components/ui/button';

interface SummaryExportProps {
  event: Event;
}

const SummaryExport: React.FC<SummaryExportProps> = ({event}) => {
  
  const downloadSummary = async () => {
    const doc = new jsPDF();
    let y = 20; // Initial vertical position

    doc.setFontSize(16);
    doc.text("Event Summary", 14, y);
    y += 10;

    doc.setFontSize(12);
    const eventDetails = [
      `Event Name: ${event.name}`,
      `Description: ${event.description}`,
      `Date: ${new Date(event.eventDate).toLocaleDateString()}`,
      `Location: ${event.locationTitle}`,
      `Organizer: ${event.organizer.fullName} (${event.organizer.email})`,
    ]
    eventDetails.forEach((line, i) => {
      doc.text(line, 14, y);
      y += 7;
    });

    // Attendees Table
    if (event.eventAttendees?.length > 0) {
      y += 10;
      doc.setFontSize(14);
      doc.text("Attendees:", 14, y);
      y += 8;

      doc.setFontSize(12);
      event.eventAttendees.forEach((attendee) => {
        doc.text(`• ${attendee.fullName} <${attendee.email}>`, 18, y);
        y += 6;

        // Page break if needed
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
    } else {
      y += 10;
      doc.text("No attendees available.", 14, y);
    }

    // Save the PDF
    doc.save(`${event.name}.pdf`);
  };

  return (
    <Button className="w-full shadow-md" onClick={downloadSummary}>
      Download Summary
    </Button> 
  );
}

export default SummaryExport;