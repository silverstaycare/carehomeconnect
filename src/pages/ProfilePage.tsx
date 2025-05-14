
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Home } from "lucide-react";
import { ProfileInfoTab } from "@/components/profile/ProfileInfoTab";
import { ManageSubscriptionTab } from "@/components/profile/ManageSubscriptionTab";
import { useProfileData } from "@/hooks/useProfileData";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(() => {
    // Check if we have a tab parameter in the location state
    return location.state?.activeTab || "profile";
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, fetchProfileData } = useProfileData(user?.id);

  useEffect(() => {
    if (!user) {
      // If no user is logged in, redirect to login
      navigate("/login", { 
        state: { redirectTo: "/profile" },
        replace: true 
      });
      return;
    }
    
    // Prevent unnecessary reloads by using a ref
    const initialLoad = { current: true };
    
    if (initialLoad.current) {
      initialLoad.current = false;
      fetchProfileData();
    }
    
    // Show success toast if subscribed parameter is present
    if (searchParams.has('subscribed')) {
      toast({
        title: "Subscription Activated",
        description: "Your care home subscription has been activated successfully.",
      });
      navigate("/profile", { replace: true });
    }
  }, [user, navigate, fetchProfileData, searchParams, toast]);

  // Fetch fresh profile data when needed, don't re-fetch on every render
  const handleProfileUpdated = async () => {
    if (!user) return;
    fetchProfileData();
  };

  // Determine if user is an owner to show subscription tab
  const isOwner = profile?.role === "owner";

  return (
    <div className="container py-8 px-4 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-gray-600">Manage your account {isOwner && "and subscription"}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className={`w-full grid ${isOwner ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {isOwner && (
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Subscription</span>
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="profile" className="pt-4">
          <ProfileInfoTab 
            user={user} 
            onProfileUpdated={handleProfileUpdated} 
          />
        </TabsContent>
        
        {isOwner && (
          <TabsContent value="manage" className="pt-4">
            <ManageSubscriptionTab user={user} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
