
import React, { forwardRef, ForwardRefRenderFunction } from "react";

interface CardPaymentSectionProps {
  user: any;
  isEditMode?: boolean;
  isOwner?: boolean;
}

// Create the forwarded ref component
const CardPaymentSectionComponent: ForwardRefRenderFunction<any, CardPaymentSectionProps> = ({ 
  user,
  isEditMode = false,
  isOwner = false
}, ref) => {
  return (
    <div className="space-y-8">
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
        <p className="text-amber-700">
          Payment information is now processed securely through Stripe and not stored in our system.
          Payment details will be requested at checkout.
        </p>
      </div>
    </div>
  );
};

// Export the component with forwardRef
export const CardPaymentSection = forwardRef(CardPaymentSectionComponent);
