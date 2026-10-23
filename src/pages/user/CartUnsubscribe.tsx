import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { cartApi } from '../../services/user/cart.Api';

export const CartUnsubscribe: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Missing unsubscribe token. Please click the link directly from your email.');
      return;
    }

    let isMounted = true;
    const processUnsubscribe = async () => {
      try {
        await cartApi.unsubscribeFromCartReminders(token);
        if (isMounted) {
          setStatus('success');
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(
            err?.response?.data?.message ||
              'Unable to process unsubscribe request. The link may have expired or was already used.'
          );
        }
      }
    };

    processUnsubscribe();
    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gray-50/60">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {status === 'loading' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-gray-600 font-medium text-sm">
              Processing your unsubscribe request...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Unsubscribed Successfully
              </h1>
              <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                You have been unsubscribed from abandoned cart reminder emails. You will no longer receive reminder notifications for this shopping session.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Notice
              </h1>
              <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Store
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartUnsubscribe;
