import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../components/Button';

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, isLoading } = useAuthStore();
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  // Redirect if already subscribed
  React.useEffect(() => {
    if (user?.isSubscribed) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleSubscribe = async () => {
    setSubscriptionLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Update user profile with subscription status
      await updateProfile({ isSubscribed: true });
      
      navigate('/profile');
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  if (!isAuthenticated || user?.isSubscribed) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
        Upgrade Your Experience
      </h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 py-6 px-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Premium Subscription</h2>
          <p className="text-blue-100">Unlock all features and content</p>
        </div>
        
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-baseline justify-center mb-6">
              <span className="text-5xl font-extrabold text-gray-900">$9.99</span>
              <span className="ml-1 text-xl text-gray-500">/month</span>
            </div>
            
            <ul className="space-y-4">
              {[
                'Access to exclusive content',
                'Ad-free reading experience',
                'Early access to new features',
                'Priority support',
                'Exclusive community access'
              ].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="ml-3 text-gray-700">{feature}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <Button
            onClick={handleSubscribe}
            fullWidth
            size="lg"
            isLoading={subscriptionLoading || isLoading}
            disabled={subscriptionLoading || isLoading}
          >
            Subscribe Now
          </Button>
          
          <p className="text-center text-sm text-gray-500 mt-4">
            You can cancel your subscription at any time
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/profile')}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};

export default Subscription;