import React, { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';
import { CheckoutFormData, CheckoutValidationErrors } from '../lib/orderTypes';
import { validateCheckoutForm } from '../lib/orderValidation';

interface CheckoutFormProps {
  productName: string;
  maxQuantity: number;
  onSubmit: (data: CheckoutFormData) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function CheckoutForm({ productName, maxQuantity, onSubmit, onClose, isLoading = false }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    customerPhone: '',
    customerWhatsapp: '',
    customerEmail: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    quantity: 1,
    customerNote: ''
  });

  const [errors, setErrors] = useState<CheckoutValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate form
    const validationErrors = validateCheckoutForm(formData, maxQuantity);
    setErrors(validationErrors);

    // If no errors, submit
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const InputField = ({
    label,
    name,
    type = 'text',
    required = false,
    placeholder = '',
    rows
  }: {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    rows?: number;
  }) => {
    const hasError = touched[name] && errors[name];
    const isTextarea = rows !== undefined;

    return (
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {isTextarea ? (
          <textarea
            name={name}
            value={formData[name as keyof CheckoutFormData] || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            rows={rows}
            className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all ${
              hasError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/10 focus:ring-2 focus:ring-zinc-500'
            }`}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name as keyof CheckoutFormData] || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all ${
              hasError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/10 focus:ring-2 focus:ring-zinc-500'
            }`}
          />
        )}
        {hasError && (
          <p className="mt-1 text-sm text-red-400">{errors[name]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950 border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-zinc-100">
              Checkout
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Order for {productName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Close checkout form"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">
              Your Information
            </h3>
            <div className="space-y-4">
              <InputField
                label="Full Name"
                name="customerName"
                required
                placeholder="John Doe"
              />
              <InputField
                label="Phone Number"
                name="customerPhone"
                type="tel"
                required
                placeholder="+91 9876543210"
              />
              <InputField
                label="WhatsApp Number (if different)"
                name="customerWhatsapp"
                type="tel"
                placeholder="+91 9876543210"
              />
              <InputField
                label="Email Address (optional)"
                name="customerEmail"
                type="email"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">
              Delivery Address
            </h3>
            <div className="space-y-4">
              <InputField
                label="Full Address"
                name="address"
                required
                placeholder="House No., Street, Locality"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="City"
                  name="city"
                  required
                  placeholder="Delhi"
                />
                <InputField
                  label="State"
                  name="state"
                  required
                  placeholder="Delhi"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Pincode"
                  name="pincode"
                  required
                  placeholder="110001"
                />
                <InputField
                  label="Landmark (optional)"
                  name="landmark"
                  placeholder="Near Metro Station"
                />
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">
              Order Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Quantity <span className="text-red-400">*</span>
                </label>
                <select
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-2 text-zinc-100 focus:outline-none transition-all ${
                    touched['quantity'] && errors['quantity']
                      ? 'border-red-500 ring-2 ring-red-500/20'
                      : 'border-white/10 focus:ring-2 focus:ring-zinc-500'
                  }`}
                >
                  {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'item' : 'items'}
                    </option>
                  ))}
                </select>
                {touched['quantity'] && errors['quantity'] && (
                  <p className="mt-1 text-sm text-red-400">{errors['quantity']}</p>
                )}
              </div>
              
              <InputField
                label="Any Special Notes (optional)"
                name="customerNote"
                placeholder="E.g., prefer morning delivery, packaging instructions, etc."
                rows={3}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Loading...' : 'Review Order'}
              {!isLoading && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
