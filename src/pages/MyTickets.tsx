import React from 'react';
import Navbar from '@/components/Navbar';
import MyTickets from '@/components/MyTickets';

const MyTicketsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MyTickets />
    </div>
  );
};

export default MyTicketsPage;
