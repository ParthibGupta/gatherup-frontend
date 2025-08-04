# GatherUp Frontend

**A modern event management platform built with React, TypeScript, and Tailwind CSS**

GatherUp is a comprehensive event management application that allows users to create, manage, and attend events with features like e-ticketing, and real-time attendee management.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## Features

### **Event Management**
- **Create Events**: Rich event creation with banner uploads, location mapping, and detailed descriptions
- **Event Discovery**: Browse and search events by category, date, and location
- **Event Updates**: Real-time event editing with versioning support
- **Capacity Management**: Set and monitor event capacity with visual indicators
- **Event Categories**: Organized event categorization system

### **Ticketing System**
- **Digital Tickets**: Generate PDF tickets with QR codes for event entry
- **Ticket Status Management**: Use and revoke tickets as required
- **Ticket Download**: Direct PDF download for the e-ticket.
- **One Ticket Per User**: Simplified ticketing with automatic confirmation
- **Organizer Controls**: Ticket management and revocation capabilities

### **User Management**
- **AWS Cognito Authentication**: Secure user registration and login
- **User Profiles**: Comprehensive profile management
- **Attendee Tracking**: Real-time attendee lists
- **Join/Leave Events**: Seamless event participation

### **Analytics & Reporting**
- **Event Analytics**: Attendee statistics and engagement metrics (Under development)
- **Ticket Analytics**: Revenue tracking and ticket status distribution
- **Summary Export**: Export event data and attendee lists
- **Real-time Statistics**: Live updates on event metrics

### **UI/UX Features**
- **Modern Design**: Clean, responsive design with shadcn/ui components
- **Dark/Light Theme**: Theme switching support
- **Mobile Responsive**: Optimized for all device sizes
- **Loading States**: Beautiful loading animations and progress indicators
- **Interactive Components**: Smooth animations and transitions

## Tech Stack

### **Frontend Framework**
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server

### **Styling & UI**
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### **Routing & State**
- **React Router DOM** - Client-side routing
- **TanStack Query** - Server state management
- **Context API** - Authentication state management

### **Maps & Location**
- **@react-google-maps/api** - Google Maps integration
- **Google Places API** - Location search and autocomplete

### **Authentication**
- **AWS Cognito** - User authentication and management
- **amazon-cognito-identity-js** - Cognito integration

### **Utilities**
- **date-fns** - Date manipulation and formatting
- **zod** - Runtime type validation
- **react-hook-form** - Form management
- **jspdf** - PDF generation utilities

## Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Google Maps API Key** with Maps JavaScript API and Places API enabled
- **AWS Cognito User Pool** configured
- **Backend API** running (GatherUp backend service)

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd gatherup-frontend
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL={your_hosted_backend_URL}

# Google Maps Configuration
VITE_GOOGLE_API_KEY=your_google_maps_api_key
VITE_GOOGLE_MAP_ID=your_google_map_id

# AWS Cognito Configuration
VITE_COGNITO_USER_POOL_ID=your_cognito_user_pool_id
VITE_COGNITO_USER_POOL_CLIENT_ID=your_cognito_client_id
VITE_COGNITO_REGION=your_aws_region
```

### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
```

## Build & Deployment

### Production Build
```bash
npm run build
# or
yarn build
```

### Preview Production Build
```bash
npm run preview
# or
yarn preview
```

### Development Build
```bash
npm run build:dev
# or
yarn build:dev
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── EventCard.tsx   # Event display component
│   ├── MyTickets.tsx   # User ticket management
│   ├── TicketPurchase.tsx # Ticket purchasing interface
│   ├── TicketingSettings.tsx # Organizer ticket controls
│   ├── Navbar.tsx      # Navigation component
│   └── ...
├── pages/              # Route components
│   ├── Event/          # Event-related pages
│   │   ├── CreateEvent.tsx
│   │   ├── EventDetails.tsx
│   │   └── UpdateEvent.tsx
│   ├── Dashboard.tsx   # User dashboard
│   ├── Login.tsx       # Authentication
│   ├── MyTickets.tsx   # Ticket management page
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── services/           # API and external services
│   ├── api.ts          # API client and interfaces
│   └── auth.ts         # Authentication service
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── assets/             # Static assets
```

## Key Components

### **EventCard.tsx**
Displays event information in a card format with:
- Event banner and details
- Attendee count and capacity
- Join/Leave functionality
- Category badges

### **MyTickets.tsx**
User ticket management interface featuring:
- Ticket list with status badges
- QR code display modal
- PDF download functionality
- Event information display

### **TicketingSettings.tsx**
Organizer ticket management with:
- Ticket statistics and analytics
- Individual ticket management
- Revenue tracking
- Ticket revocation controls

### **EventDetails.tsx**
Comprehensive event view including:
- Event information and banner
- Google Maps integration
- Attendee management
- Ticket purchasing
- Contact organizer functionality

## Ticketing System

### **Ticket States**
- **Confirmed**: Active tickets ready for use
- **Pending**: Tickets awaiting approval
- **Used**: Tickets that have been scanned at events
- **Revoked**: Cancelled tickets

### **QR Code Integration**
- Base64 encoded QR codes from backend
- Modal display for easy scanning
- Mobile-optimized viewing experience

### **PDF Generation**
- Backend-generated PDF tickets
- Direct download via secure URLs
- Ticket information and QR codes included

## Maps Integration

### **Google Maps Setup**
1. Enable Maps JavaScript API in Google Cloud Console
2. Enable Places API for location search
3. Create a Map ID for custom styling
4. Add API key to environment variables

### **Features**
- Interactive event location maps
- Location search with autocomplete
- Custom map markers
- Responsive map containers

## Authentication

### **AWS Cognito Integration**
- User registration and verification
- Secure login/logout
- Password reset functionality
- JWT token management
- Protected routes

### **Auth Context**
Centralized authentication state management:
- User session persistence
- Automatic token refresh
- Route protection
- Login state tracking

## Styling

### **Design System**
- Consistent color palette
- Typography scale
- Spacing system
- Component variants

### **Responsive Design**
- Mobile-first approach
- Breakpoint-based layouts
- Touch-friendly interfaces
- Optimized for all screen sizes

## Mobile Experience

### **Progressive Web App Features**
- Responsive design
- Touch gestures
- Mobile-optimized modals
- Fast loading times

### **Mobile-Specific Features**
- Swipe interactions
- Touch-friendly buttons
- Mobile navigation
- Optimized maps

## Development

### **Code Quality**
- TypeScript for type safety
- ESLint for code consistency
- Component-based architecture
- Custom hooks for reusability

### **Performance**
- Vite for fast development
- Code splitting
- Lazy loading
- Optimized bundle size

## API Integration

### **API Client**
Centralized API management with:
- Type-safe interfaces
- Error handling
- Authentication headers
- Response transformation

### **Key Endpoints**
- Event management (CRUD)
- User authentication
- Ticket operations
- Attendee management
- File uploads

## Troubleshooting

### **Common Issues**

1. **Google Maps not loading**
   - Verify API key is correct
   - Check API restrictions
   - Ensure billing is enabled

2. **Authentication errors**
   - Verify Cognito configuration
   - Check user pool settings
   - Validate environment variables

3. **Build failures**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify environment variables

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review existing issues

---

**Built with ❤️ by the GatherUp team**
