'use client';
import { useState } from 'react';
import { useToast } from '../../context/ToastContext';

export interface PaymentFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

interface PaymentFormProps {
  initialData?: Partial<PaymentFormData>;
  total: number;
  onSubmit: (formData: PaymentFormData) => Promise<void>;
  isProcessing?: boolean;
}

export default function PaymentForm({ 
  initialData = {}, 
  total, 
  onSubmit, 
  isProcessing = false 
}: PaymentFormProps) {
  const { addToast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState<string>('');
  const [formData, setFormData] = useState<PaymentFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    ...initialData,
  });

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add a space every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Apply formatting based on input type
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      // Limit to 19 characters (16 digits + 3 spaces)
      if (formattedValue.length > 19) {
        formattedValue = formattedValue.substring(0, 19);
      }
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
      // Limit to 5 characters (MM/YY)
      if (formattedValue.length > 5) {
        formattedValue = formattedValue.substring(0, 5);
      }
    } else if (name === 'cvv') {
      // Only allow digits for CVV
      formattedValue = value.replace(/\D/g, '');
      // Limit to 4 digits
      if (formattedValue.length > 4) {
        formattedValue = formattedValue.substring(0, 4);
      }
    } else if (name === 'zipCode') {
      // Only allow digits and hyphens for ZIP code
      formattedValue = value.replace(/[^0-9-]/g, '');
      // Limit to 10 characters (12345-6789)
      if (formattedValue.length > 10) {
        formattedValue = formattedValue.substring(0, 10);
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Customer Information Validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'ZIP code is invalid';
    }

    // Payment Information Validation
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else {
      // Remove spaces for validation
      const cardNumberDigits = formData.cardNumber.replace(/\s/g, '');
      if (!/^\d{16}$/.test(cardNumberDigits)) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }
    }

    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Expiry date is invalid (MM/YY)';
    } else {
      // Additional validation to check if the date is in the future
      const dateParts = formData.expiryDate.split('/');
      if (dateParts.length === 2 && dateParts[0] && dateParts[1]) {
        const month = dateParts[0];
        const year = dateParts[1];
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
        const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
        const expiryYear = parseInt(year, 10);
        const expiryMonth = parseInt(month, 10);
        
        if (!isNaN(expiryYear) && !isNaN(expiryMonth)) {
          if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
            newErrors.expiryDate = 'Card has expired';
          }
        }
      }
    }

    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV is invalid';
    }

    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setPaymentError('Please fix the errors below and try again.');
      addToast({
        type: 'error',
        title: 'Form validation failed',
        message: 'Please check your information and try again',
      });
      return;
    }

    setPaymentError('');

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Payment form error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      setPaymentError(errorMessage);
      addToast({
        type: 'error',
        title: 'Payment failed',
        message: errorMessage,
      });
    }
  };

  return (
    <div className="lg:w-3/5 p-6">
      {paymentError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
              <p className="mt-1 text-sm text-red-700">{paymentError}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                autoComplete="name"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                autoComplete="tel"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.zipCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number *
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
                autoComplete="cc-number"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.cardNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.cardNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date *
              </label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                placeholder="MM/YY"
                inputMode="numeric"
                autoComplete="cc-exp"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.expiryDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV *
              </label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                inputMode="numeric"
                autoComplete="cc-csc"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.cvv ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.cvv && (
                <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name *
              </label>
              <input
                type="text"
                name="cardName"
                value={formData.cardName}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.cardName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.cardName && (
                <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              `Complete Payment - $${total.toFixed(2)}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}