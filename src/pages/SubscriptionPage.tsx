
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SubscriptionManager from '@/components/subscription/SubscriptionManager';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Check for success or canceled status from URL
  useEffect(() => {
    // Show success toast if redirected from successful subscription
    if (searchParams.has('success')) {
      toast({
        title: "Subscription Successful",
        description: "Your subscription has been activated successfully.",
        variant: "default",
      });
      // Clean up URL params
      navigate('/owner/subscription', { replace: true });
    }
    
    // Show canceled toast if subscription was canceled
    else if (searchParams.has('canceled')) {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription process was canceled.",
        variant: "default",
      });
      // Clean up URL params
      navigate('/owner/subscription', { replace: true });
    }
  }, [searchParams, navigate, toast]);

  const handleBackToProfile = () => {
    // Navigate to profile page with the manage tab active
    navigate('/profile', { state: { activeTab: 'manage' } });
  };

  return (
    <div className="container py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <Button 
          variant="default" 
          onClick={handleBackToProfile} 
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </Button>
      </div>
      <SubscriptionManager />
    </div>
  );
}

export default SubscriptionPage;
