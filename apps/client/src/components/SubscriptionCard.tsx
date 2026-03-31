"use client";

import React, { useState } from 'react';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  ChevronRight,
  Loader,
} from 'lucide-react';
import { cancelSubscription, createCheckoutSession } from '@/services/stripe.service';

interface SubscriptionCardProps {
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  onSubscriptionChange?: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscriptionStatus = 'INACTIVE',
  subscriptionPlan = '',
  subscriptionStartDate = '',
  subscriptionEndDate = '',
  onSubscriptionChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getPlanDetails = () => {
    switch (subscriptionPlan) {
      case 'MONTHLY':
        return { name: 'Monthly', price: '$9.99/month', duration: '30 days' };
      case 'QUARTERLY':
        return { name: 'Quarterly', price: '$24.99/3 months', duration: '90 days' };
      case 'YEARLY':
        return { name: 'Yearly', price: '$79.99/year', duration: '365 days' };
      default:
        return { name: 'No Plan', price: 'N/A', duration: 'N/A' };
    }
  };

  const getStatusColor = () => {
    switch (subscriptionStatus) {
      case 'ACTIVE':
        return 'bg-green-50 border-green-200';
      case 'EXPIRED':
        return 'bg-yellow-50 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (subscriptionStatus) {
      case 'ACTIVE':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'EXPIRED':
        return <AlertCircle size={20} className="text-yellow-600" />;
      case 'CANCELLED':
        return <AlertCircle size={20} className="text-red-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (subscriptionStatus) {
      case 'ACTIVE':
        return { label: 'Active', color: 'text-green-700' };
      case 'EXPIRED':
        return { label: 'Expired', color: 'text-yellow-700' };
      case 'CANCELLED':
        return { label: 'Cancelled', color: 'text-red-700' };
      default:
        return { label: 'Inactive', color: 'text-gray-700' };
    }
  };

  const planDetails = getPlanDetails();
  const statusText = getStatusText();
  const daysRemaining =
    subscriptionEndDate && subscriptionStatus === 'ACTIVE'
      ? Math.ceil(
          (new Date(subscriptionEndDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  const handleUpgrade = async (newPlan: 'MONTHLY' | 'QUARTERLY' | 'YEARLY') => {
    setIsLoading(true);
    setError('');
    try {
      await createCheckoutSession(newPlan);
    } catch (err: any) {
      setError(err.message || 'Failed to upgrade subscription');
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await cancelSubscription();
      setSuccess('Subscription cancelled successfully');
      setTimeout(() => {
        setSuccess('');
        onSubscriptionChange?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
      setIsLoading(false);
    }
  };

  return (
    <div className={`border rounded-2xl p-8 ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white border border-gray-200 rounded-xl shadow-sm">
            <CreditCard size={24} className="text-gray-900" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Subscription</h3>
            <p className="text-gray-600 text-sm">Manage your DevScan subscription</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`font-semibold text-sm ${statusText.color}`}>{statusText.label}</span>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-green-600 shrink-0" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {/* Plan Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Current Plan */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-600 text-xs font-medium mb-1">CURRENT PLAN</p>
          <p className="text-lg font-bold text-gray-900">{planDetails.name}</p>
          <p className="text-sm text-gray-500 mt-1">{planDetails.price}</p>
        </div>

        {/* Duration */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-600 text-xs font-medium mb-1">DURATION</p>
          <p className="text-lg font-bold text-gray-900">{planDetails.duration}</p>
          <p className="text-sm text-gray-500 mt-1">per period</p>
        </div>

        {/* Start Date */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-600 text-xs font-medium mb-1">START DATE</p>
          <p className="text-lg font-bold text-gray-900 truncate">{formatDate(subscriptionStartDate)}</p>
        </div>

        {/* End Date / Days Remaining */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-600 text-xs font-medium mb-1">
            {subscriptionStatus === 'ACTIVE' ? 'DAYS REMAINING' : 'END DATE'}
          </p>
          <p className="text-lg font-bold text-gray-900">
            {subscriptionStatus === 'ACTIVE' ? `${Math.max(0, daysRemaining)} days` : formatDate(subscriptionEndDate)}
          </p>
        </div>
      </div>

      {/* Plan Selection - Only show if inactive or want to upgrade */}
      {subscriptionStatus !== 'ACTIVE' && (
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Select a Plan</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['MONTHLY', 'QUARTERLY', 'YEARLY'] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => handleUpgrade(plan)}
                disabled={isLoading || subscriptionStatus === 'ACTIVE'}
                className={`p-4 border rounded-xl transition-all ${
                  subscriptionPlan === plan
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-900'
                } disabled:opacity-50`}
              >
                <div className="font-semibold mb-1">
                  {plan === 'MONTHLY' ? 'Monthly' : plan === 'QUARTERLY' ? 'Quarterly' : 'Yearly'}
                </div>
                <div className="text-sm opacity-75">
                  {plan === 'MONTHLY' ? '$9.99' : plan === 'QUARTERLY' ? '$24.99' : '$79.99'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {subscriptionStatus === 'ACTIVE' && (
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => handleUpgrade(subscriptionPlan as 'MONTHLY' | 'QUARTERLY' | 'YEARLY')}
            disabled={isLoading || !subscriptionPlan}
            className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 transition"
          >
            {isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap size={18} />
                Upgrade Plan
              </>
            )}
          </button>

          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-semibold hover:bg-red-100 disabled:opacity-50 transition"
          >
            Cancel Subscription
          </button>
        </div>
      )}

      {/* Inactive/Expired CTA */}
      {subscriptionStatus !== 'ACTIVE' && (
        <button
          onClick={() => handleUpgrade('MONTHLY')}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 transition"
        >
          {isLoading ? (
            <>
              <Loader size={18} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap size={18} />
              Subscribe Now
            </>
          )}
        </button>
      )}

      {/* Info Message */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
        <p className="font-medium mb-1">💡 Premium Access</p>
        <p>Your subscription gives you unlimited access to code audits, analysis tools, and more.</p>
      </div>
    </div>
  );
};

export default SubscriptionCard;
