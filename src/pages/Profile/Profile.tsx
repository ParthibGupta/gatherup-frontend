import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { profileApi, Profile as ProfileType } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Edit,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await profileApi.getUserProfile();
        console.log("Profile data:", response.data);
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({
          title: "Failed to load profile",
          description:
            "Could not retrieve profile details. Please try again later.",
          variant: "destructive",
        });
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate]);

  const getInitials = (name?: string): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse space-y-4 w-full max-w-2xl">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-32 bg-muted rounded w-full"></div>
              <div className="h-64 bg-muted rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Header Card */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.profilePicture} />
                    <AvatarFallback className="text-lg">
                      {getInitials(profile?.fullName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold mb-2">
                      {profile?.fullName}
                    </h1>
                    <p className="text-muted-foreground mb-4">
                      @{profile?.userName}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                      <Badge className="gap-1 bg-gatherup-purple hover:bg-gatherup-purple/90">
                        <User className="h-3 w-3" />
                        Member
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined{" "}
                        {format(new Date(profile?.createdAt || ""), "MMM yyyy")}
                      </Badge>
                    </div>

                    {profile?.userDescription && (
                      <p className="text-muted-foreground max-w-2xl">
                        {profile.userDescription}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => navigate("/profile/update")}>
                      <Edit className="h-4  w-4" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </span>
                    <p className="text-sm">{profile?.fullName}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Username
                    </span>
                    <p className="text-sm">@{profile?.userName}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email Address
                    </span>
                    <p className="text-sm">{profile?.email}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Member Since
                    </span>
                    <p className="text-sm">
                      {format(new Date(profile?.createdAt || ""), "PPPP")}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Bio
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {profile?.userDescription || "No bio added yet."}
                  </p>
                </div>

                {profile?.location && profile.location.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Location
                      </span>
                      <p className="text-sm">
                        {/* You might want to format location data appropriately */}
                        Location information available
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate("/dashboard")}
                >
                  <User className="h-4 w-4" />
                  View Dashboard
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate("/my-tickets")}
                >
                  <Calendar className="h-4 w-4" />
                  My Tickets
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate("/events/create")}
                >
                  <Calendar className="h-4 w-4" />
                  Create Event
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {profile?.createdAt
                      ? Math.floor(
                          (new Date().getTime() -
                            new Date(profile.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Days as member
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
