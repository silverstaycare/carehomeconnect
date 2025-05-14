
import { Spinner } from "@/components/ui/spinner";

export const SubscriptionLoading = () => {
  return (
    <div className="container py-12 flex justify-center items-center">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">Loading subscription information...</p>
      </div>
    </div>
  );
};
