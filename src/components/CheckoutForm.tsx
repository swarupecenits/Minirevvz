import React, { useState, useCallback, useRef } from 'react';
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

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  defaultValue?: string;
  error?: string;
  touched?: boolean;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const InputField = React.memo(function InputField({
  label,
  name,
  type = 'text',
  required = false,
  placeholder = '',
  rows,
  defaultValue = '',
  error,
  touched,
  onBlur
}: InputFieldProps) {
  const hasError = touched && error;
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
          defaultValue={defaultValue}
          onBlur={onBlur}
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
          defaultValue={defaultValue}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all ${
            hasError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/10 focus:ring-2 focus:ring-zinc-500'
          }`}
        />
      )}
      {hasError && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
});

export function CheckoutForm({ productName, maxQuantity, onSubmit, onClose, isLoading = false }: CheckoutFormProps) {
  // Use refs to read values from DOM without re-rendering
  const formRef = useRef<HTMLFormElement>(null);

  const [errors, setErrors] = useState<CheckoutValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Read all form values from DOM on demand (no re-renders while typing)
  const getFormData = useCallback((): CheckoutFormData => {
    if (!formRef.current) {
      return {
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
      };
    }
    const form = formRef.current;
    const formDataObj = new FormData(form);
    return {
      customerName: (formDataObj.get('customerName') as string) || '',
      customerPhone: (formDataObj.get('customerPhone') as string) || '',
      customerWhatsapp: (formDataObj.get('customerWhatsapp') as string) || '',
      customerEmail: (formDataObj.get('customerEmail') as string) || '',
      address: (formDataObj.get('address') as string) || '',
      city: (formDataObj.get('city') as string) || '',
      state: (formDataObj.get('state') as string) || '',
      pincode: (formDataObj.get('pincode') as string) || '',
      landmark: (formDataObj.get('landmark') as string) || '',
      quantity: parseInt(formDataObj.get('quantity') as string, 10) || 1,
      customerNote: (formDataObj.get('customerNote') as string) || ''
    };
  }, []);

  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));
    
    // Validate single field on blur
    const formData = getFormData();
    const validationErrors = validateCheckoutForm(formData, maxQuantity);
    setErrors(validationErrors);
  }, [getFormData, maxQuantity]);

  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleBlur(e as React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>);
  }, [handleBlur]);

  const handleSelectBlur = useCallback((e: React.FocusEvent<HTMLSelectElement>) => {
    handleBlur(e);
  }, [handleBlur]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Read all values from the DOM at submit time
    const formData = getFormData();

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

  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));
  }, []);

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
        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-8">
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
                error={errors.customerName}
                touched={touched.customerName}
                onBlur={handleInputBlur}
              />
              <InputField
                label="Phone Number"
                name="customerPhone"
                type="tel"
                required
                placeholder="+91 9876543210"
                error={errors.customerPhone}
                touched={touched.customerPhone}
                onBlur={handleInputBlur}
              />
              <InputField
                label="WhatsApp Number (if different)"
                name="customerWhatsapp"
                type="tel"
                placeholder="+91 9876543210"
                error={errors.customerWhatsapp}
                touched={touched.customerWhatsapp}
                onBlur={handleInputBlur}
              />
              <InputField
                label="Email Address (optional)"
                name="customerEmail"
                type="email"
                placeholder="you@example.com"
                error={errors.customerEmail}
                touched={touched.customerEmail}
                onBlur={handleInputBlur}
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
                error={errors.address}
                touched={touched.address}
                onBlur={handleInputBlur}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="City"
                  name="city"
                  required
                  placeholder="Delhi"
                  error={errors.city}
                  touched={touched.city}
                  onBlur={handleInputBlur}
                />
                <InputField
                  label="State"
                  name="state"
                  required
                  placeholder="Delhi"
                  error={errors.state}
                  touched={touched.state}
                  onBlur={handleInputBlur}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Pincode"
                  name="pincode"
                  required
                  placeholder="110001"
                  error={errors.pincode}
                  touched={touched.pincode}
                  onBlur={handleInputBlur}
                />
                <InputField
                  label="Landmark (optional)"
                  name="landmark"
                  placeholder="Near Metro Station"
                  error={errors.landmark}
                  touched={touched.landmark}
                  onBlur={handleInputBlur}
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
                  defaultValue={1}
                  onChange={handleQuantityChange}
                  onBlur={handleSelectBlur}
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
                error={errors.customerNote}
                touched={touched.customerNote}
                onBlur={handleInputBlur}
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