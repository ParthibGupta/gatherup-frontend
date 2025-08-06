import React, { useEffect, useState } from "react";
import { Profile, profileApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  FileText,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UpdateProfileFormData {
  fullName: string;
  email: string;
  userDescription: string;
}

const UpdateProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState<UpdateProfileFormData>({
    fullName: "",
    email: "",
    userDescription: "",
  });

  const [errors, setErrors] = useState<Partial<UpdateProfileFormData>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await profileApi.getUserProfile();
        setProfile(response.data);
        
        // Populate form data
        if (response.data) {
          setFormData({
            fullName: response.data.fullName || "",
            email: response.data.email || "",
            userDescription: response.data.userDescription || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({
          title: "Failed to load profile",
          description: "Could not retrieve profile details. Please try again later.",
          variant: "destructive",
        });
        navigate("/profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof UpdateProfileFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateProfileFormData> = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await profileApi.updateProfile({
        userName: profile?.userName || "", // Keep existing username
        fullName: formData.fullName,
        email: formData.email,
        userDescription: formData.userDescription,
      });

      if (response.status === "success") {
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
        navigate("/profile");
      } else {
        toast({
          title: "Update failed",
          description: response.error || "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update failed",
        description: "An error occurred while updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse space-y-4 w-full max-w-2xl">
              <div className="h-8 bg-muted rounded w-1/3"></div>
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

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Update Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Avatar Section */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.profilePicture} />
                    <AvatarFallback className="text-lg">
                      {getInitials(formData.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">
                      Profile picture management will be available soon.
                    </p>
                  </div>
                </div>

                {/* Username Display (Read-only) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Username
                  </Label>
                  <div className="px-3 py-2 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">@{profile?.userName}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Username cannot be changed as it's linked to your account
                  </p>
                </div>

                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500">{errors.fullName}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Bio/Description Field */}
                <div className="space-y-2">
                  <Label htmlFor="userDescription" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Bio
                  </Label>
                  <Textarea
                    id="userDescription"
                    name="userDescription"
                    placeholder="Tell us about yourself..."
                    value={formData.userDescription}
                    onChange={handleInputChange}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: Add a short description about yourself
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating Profile...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Update Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;