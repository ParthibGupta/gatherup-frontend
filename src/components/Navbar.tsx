
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, User, Calendar, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have new notifications in your dashboard.",
    });
    navigate('/dashboard');
  };

  const getInitials = (name?: string): string => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-full bg-gatherup-purple p-1.5">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gatherup-purple">GatherUp</span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/events/create')}>
                <Plus className="h-4 w-4" />
                <span>Create Event</span>
              </Button>
              
              <div className="relative cursor-pointer" onClick={handleNotificationClick}>
                <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center">
                  2
                </Badge>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profilePicture} />
                      <AvatarFallback>{getInitials(user?.name || user?.username)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-50">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name || user?.username}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-tickets" className="cursor-pointer">
                      My Tickets
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button className="bg-gatherup-purple hover:bg-gatherup-purple/90" onClick={() => navigate('/register')}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
