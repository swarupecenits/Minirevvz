import React from 'react';
import { X, ChevronLeft, Loader } from 'lucide-react';
import { Button } from './ui/Button';
import { CheckoutFormData } from '../lib/orderTypes';

interface CheckoutConfirmationProps {
  productName: string;
  productPrice: number;
  productImage?: string;
  formData: CheckoutFormData;
  onConfirm: () => Promise<void>;
  onEdit: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function CheckoutConfirmation({
  productName,
  productPrice,
  productImage,
  formData,
  onConfirm,
  onEdit,
  onClose,
  isLoading = false
}: CheckoutConfirmationProps) {
  const totalPrice = productPrice * formData.quantity;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950 border-b border-white/10 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-zinc-100">
            Order Summary
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close confirmation"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Product Section */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">
              Product Details
            </h3>
            <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              {productImage && (
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-zinc-100 font-medium">{productName}</p>
                  <p className="text-sm text-zinc-400 mt-1">
                    Price: ₹{productPrice.toLocaleString('en-IN')} each
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Section */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">
              Quantity & Total
            </h3>
            <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Quantity:</span>
                <span className="text-zinc-100 font-medium">{formData.quantity}</span>
              </div>
              <div className="border-t border-white/10 pt-2 mt-2 flex justify-between items-center">
                <span className="text-zinc-100 font-semibold">Total Price:</span>
                <span className="text-lg font-bold text-amber-400">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">
              Delivery Information
            </h3>
            <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Name</p>
                <p className="text-zinc-100">{formData.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Phone</p>
                <p className="text-zinc-100">{formData.customerPhone}</p>
              </div>
              {formData.customerWhatsapp && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">WhatsApp</p>
                  <p className="text-zinc-100">{formData.customerWhatsapp}</p>
                </div>
              )}
              {formData.customerEmail && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Email</p>
                  <p className="text-zinc-100">{formData.customerEmail}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Address</p>
                <p className="text-zinc-100">
                  {formData.address}
                </p>
                <p className="text-zinc-400 text-sm">
                  {formData.city}, {formData.state} - {formData.pincode}
                </p>
                {formData.landmark && (
                  <p className="text-zinc-400 text-sm">
                    Near {formData.landmark}
                  </p>
                )}
              </div>
              {formData.customerNote && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Special Notes</p>
                  <p className="text-zinc-100 italic">{formData.customerNote}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Message */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-200">
              After confirming this order, you'll be redirected to WhatsApp to complete the payment with our team.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={onEdit}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Edit Details
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm Order'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
