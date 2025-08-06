import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthenticatedRoute from "@/components/AuthenticatedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import EventDetails from "./pages/Event/EventDetails";
import CreateEvent from "./pages/Event/CreateEvent";
import UpdateEvent from "./pages/Event/UpdateEvent";
import MyTicketsPage from "./pages/MyTickets";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile/Profile";
import UpdateProfile from "./pages/Profile/UpdateProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/events/:id" element={<EventDetails />}/>

            {/* Authenticated Routes */}
            <Route
              path="/dashboard"
              element={
                <AuthenticatedRoute>
                  <Dashboard />
                </AuthenticatedRoute>
              }
            />

            <Route
              path="/events/create"
              element={
                <AuthenticatedRoute>
                  <CreateEvent />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/events/update/:id"
              element={
                <AuthenticatedRoute>
                  <UpdateEvent />
                </AuthenticatedRoute>
              }
            />              
            <Route
              path="/my-tickets"
              element={
                <AuthenticatedRoute>
                  <MyTicketsPage />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthenticatedRoute>
                  <Profile />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/profile/update"
              element={
                <AuthenticatedRoute>
                  <UpdateProfile />
                </AuthenticatedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
