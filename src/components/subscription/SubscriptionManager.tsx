
import { useSubscriptionManager } from "@/hooks/useSubscriptionManager";
import { SubscriptionLoading } from "./SubscriptionLoading";
import { SuccessDialog } from "./SuccessDialog";
import { CanceledDialog } from "./CanceledDialog";
import { SubscriptionPageHeader } from "./SubscriptionPageHeader";
import { SingleSubscriptionOption } from "./SingleSubscriptionOption";
import { PromoCodeBox } from "./PromoCodeBox";
import { usePromoCode } from "./usePromoCode";

const SubscriptionManager = () => {
  const {
    currentSubscription,
    isLoading,
    isProcessing,
    checkingSubscription,
    numberOfBeds,
    setNumberOfBeds,
    pricePerBed,
    showSuccessDialog,
    setShowSuccessDialog,
    showCanceledDialog,
    setShowCanceledDialog,
    calculateTotalPrice,
    handleSubscribe,
    handleManageSubscription
  } = useSubscriptionManager();

  const { handlePromoCode } = usePromoCode();

  if (isLoading) {
    return <SubscriptionLoading />;
  }

  return (
    <>
      <SubscriptionPageHeader 
        checkingSubscription={checkingSubscription}
        currentSubscription={currentSubscription}
        numberOfBeds={numberOfBeds}
        onBedsChange={setNumberOfBeds}
        pricePerBed={pricePerBed}
      />

      <PromoCodeBox onApplyPromo={handlePromoCode} />

      <SingleSubscriptionOption 
        pricePerBed={pricePerBed}
        numberOfBeds={numberOfBeds}
        totalPrice={Number(calculateTotalPrice())}
        currentSubscription={currentSubscription}
        isProcessing={isProcessing}
        onSubscribe={handleSubscribe}
        onManage={handleManageSubscription}
      />

      <SuccessDialog 
        open={showSuccessDialog} 
        onOpenChange={setShowSuccessDialog} 
      />
      
      <CanceledDialog 
        open={showCanceledDialog} 
        onOpenChange={setShowCanceledDialog} 
      />
    </>
  );
};

export default SubscriptionManager;
