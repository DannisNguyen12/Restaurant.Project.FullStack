'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function PasswordResetForm() {
  const [formData, setFormData] = useState({
    email: '',
  });
  const [errors, setErrors] = useState<{
    email?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [serverError, setServerError] = useState('');

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name as keyof typeof errors];
        return newErrors;
      });
    }
};

  const validate = () => {
    const newErrors: {
      email?: string;
    } = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    return newErrors;
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();


};

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
          {emailSent ? (
            <div className="text-center">
              <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                Password Reset Email Sent
              </h2>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                We've sent a password reset link to {formData.email}.
                Please check your inbox and follow the instructions.
              </p>
              <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Forgot Password
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {serverError && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
                  <p>{serverError}</p>
                </div>
              )}
              
              <form className="mt-4 space-y-4 lg:mt-5 md:space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label 
                    htmlFor="email" 
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`bg-gray-50 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    placeholder="name@company.com"
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 disabled:opacity-70"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <div className="text-sm text-center mt-4">
                  <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}