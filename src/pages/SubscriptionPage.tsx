
import { useEffect, useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import SubscriptionManager from '@/components/subscription/SubscriptionManager';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for success or canceled status from URL
  useEffect(() => {
    // Clean up URL params
    if (searchParams.has('success') || searchParams.has('canceled')) {
      navigate('/owner/subscription', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="container py-8 px-4 max-w-6xl">
      <SubscriptionManager />
    </div>
  );
};

export default SubscriptionPage;
