import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Tag, CreditCard, CheckCircle2, ArrowRight, ArrowLeft, Smartphone, Building2, AlertTriangle, Sparkles } from 'lucide-react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { BrandLogo } from '../../components/BrandLogo';

export const CustomerCheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const planIdParam = searchParams.get('planId');

  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Discount
  const [discountCode, setDiscountCode] = useState('FESTIVE50');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountMessage, setDiscountMessage] = useState('');
  const [discountError, setDiscountError] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'UPI' | 'Net Banking'>('Card');
  const [simulateOutcome, setSimulateOutcome] = useState<'SUCCESS' | 'FAIL'>('SUCCESS');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Card details mock pre-fill
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [upiId, setUpiId] = useState('customer@okaxis');

  useEffect(() => {
    api.get('/plans')
      .then((res) => {
        const allPlans = res.data.plans || [];
        setPlans(allPlans);
        if (planIdParam) {
          const matched = allPlans.find((p: any) => p._id === planIdParam || p.id === planIdParam);
          if (matched) setSelectedPlan(matched);
        } else if (allPlans.length > 0) {
          setSelectedPlan(allPlans[0]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [planIdParam]);

  // Apply discount check
  const handleApplyDiscount = async () => {
    if (!selectedPlan || !discountCode.trim()) return;
    setDiscountError('');
    setDiscountMessage('');

    try {
      const res = await api.post('/discounts/validate', {
        code: discountCode,
        amount: selectedPlan.price,
      });
      setAppliedDiscount(res.data.discount);
      setDiscountMessage(res.data.message);
    } catch (err: any) {
      setAppliedDiscount(null);
      setDiscountError(err.response?.data?.message || 'Invalid discount coupon');
    }
  };

  // Pricing calculations
  const originalPrice = selectedPlan?.price || 0;
  const discountAmount = appliedDiscount?.discountAmount || 0;
  const taxableAmount = Math.max(0, originalPrice - discountAmount);
  const taxAmount = Math.round(taxableAmount * 0.18); // 18% GST
  const finalTotal = taxableAmount + taxAmount;

  // Process Checkout
  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (simulateOutcome === 'FAIL') {
      alert('Payment Simulated Failure: Transaction was declined by the issuing bank.');
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        customerId: user?.id,
        customerName: user?.name,
        customerEmail: user?.email,
        productId: selectedPlan.productId,
        productName: selectedPlan.productName,
        planId: selectedPlan._id || selectedPlan.id,
        planName: selectedPlan.name,
        period: selectedPlan.period,
        originalAmount: originalPrice,
        discountAmount,
        taxAmount,
        finalAmount: finalTotal,
        paymentMethod,
        transactionRef: `TXN-${paymentMethod.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      };

      const res = await api.post('/subscriptions', payload);
      setCompletedOrder({
        subscription: res.data.subscription,
        invoiceNumber: res.data.invoiceNumber,
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Checkout failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/customer/plans"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#81758A] hover:text-[#673B70]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Plans
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold text-[#2E9467] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Encrypted Checkout
        </div>
      </div>

      {completedOrder ? (
        /* Success Screen */
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#E6DDEC] shadow-[0_10px_40px_rgba(103,59,112,0.15)] space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#2E9467] border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-[#34243A]">Subscription Confirmed & Active!</h2>
          <p className="text-xs sm:text-sm text-[#81758A] max-w-md mx-auto leading-relaxed">
            Thank you, <span className="font-bold text-[#34243A]">{user?.name}</span>. Your subscription to{' '}
            <span className="font-bold text-[#673B70]">{selectedPlan?.productName}</span> has been activated immediately.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-[#F3EFFF] border border-[#D8C2E5] max-w-sm mx-auto text-left font-mono text-xs space-y-1">
            <p><strong>Subscription ID:</strong> {completedOrder.subscription?.subscriptionId}</p>
            <p><strong>Invoice Number:</strong> {completedOrder.invoiceNumber}</p>
            <p><strong>Amount Paid:</strong> ₹{finalTotal}</p>
            <p><strong>Status:</strong> Active</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="px-6 py-2.5 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white font-bold text-xs shadow-sm"
            >
              Go to Customer Dashboard
            </button>
            <button
              onClick={() => navigate('/customer/invoices')}
              className="px-6 py-2.5 rounded-xl border border-[#E6DDEC] text-[#34243A] hover:bg-[#F3EFFF] font-bold text-xs"
            >
              View Invoices
            </button>
          </div>
        </div>
      ) : (
        /* Main Checkout Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Plan selector & Payment form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Selected Plan */}
            <div className="bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#81758A]">
                Step 1 of 2: Select Subscription Tier
              </span>

              <div>
                <label className="block text-xs font-bold text-[#34243A] uppercase mb-1">
                  Choose Plan Tier
                </label>
                <select
                  value={selectedPlan?._id || selectedPlan?.id || ''}
                  onChange={(e) => {
                    const found = plans.find((p) => (p._id || p.id) === e.target.value);
                    if (found) {
                      setSelectedPlan(found);
                      setAppliedDiscount(null);
                      setDiscountMessage('');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDEC] bg-white text-xs font-bold text-[#34243A] focus:outline-none focus:border-[#673B70]"
                >
                  {plans.map((p) => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.productName} — {p.name} (₹{p.price}/{p.period.toLowerCase()})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPlan && (
                <div className="p-3 bg-[#F3EFFF] rounded-xl border border-[#D8C2E5] flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#34243A]">{selectedPlan.name}</span>
                    <p className="text-[11px] text-[#81758A]">Cycle: {selectedPlan.period}</p>
                  </div>
                  <span className="text-lg font-black text-[#673B70]">₹{selectedPlan.price}</span>
                </div>
              )}
            </div>

            {/* Step 2: Payment Gateway Selection */}
            <div className="bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#81758A]">
                Step 2 of 2: Payment Mode
              </span>

              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'Card'
                      ? 'border-[#673B70] bg-[#F3EFFF] text-[#673B70] shadow-xs'
                      : 'border-[#E6DDEC] hover:bg-gray-50 text-[#81758A]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-bold block">Credit/Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-[#673B70] bg-[#F3EFFF] text-[#673B70] shadow-xs'
                      : 'border-[#E6DDEC] hover:bg-gray-50 text-[#81758A]'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-bold block">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Net Banking')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'Net Banking'
                      ? 'border-[#673B70] bg-[#F3EFFF] text-[#673B70] shadow-xs'
                      : 'border-[#E6DDEC] hover:bg-gray-50 text-[#81758A]'
                  }`}
                >
                  <Building2 className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-bold block">Net Banking</span>
                </button>
              </div>

              {/* Method Details */}
              {paymentMethod === 'Card' && (
                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <label className="block font-bold text-[#34243A] uppercase mb-1">Card Number (Demo prefilled)</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#34243A] uppercase mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#34243A] uppercase mb-1">CVV</label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="space-y-3 pt-2 text-xs">
                  <label className="block font-bold text-[#34243A] uppercase mb-1">Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="user@upi"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white font-mono"
                  />
                  <p className="text-[11px] text-[#81758A]">Google Pay, PhonePe, Paytm, or BHIM supported</p>
                </div>
              )}

              {paymentMethod === 'Net Banking' && (
                <div className="space-y-3 pt-2 text-xs">
                  <label className="block font-bold text-[#34243A] uppercase mb-1">Select Bank</label>
                  <select className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white font-semibold">
                    <option>HDFC Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* Demo Simulation Outcome Selector */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs">
                <span className="font-bold text-[#D99A39] flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4" /> Demo Test Outcome Selector:
                </span>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="outcome"
                      checked={simulateOutcome === 'SUCCESS'}
                      onChange={() => setSimulateOutcome('SUCCESS')}
                      className="text-[#673B70]"
                    />
                    <span className="font-bold text-[#2E9467]">Simulate Success</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="outcome"
                      checked={simulateOutcome === 'FAIL'}
                      onChange={() => setSimulateOutcome('FAIL')}
                      className="text-[#673B70]"
                    />
                    <span className="font-bold text-[#D85B69]">Simulate Decline</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] space-y-5 sticky top-24">
            <h3 className="text-base font-black text-[#34243A] pb-3 border-b border-[#E6DDEC]">
              Order Summary
            </h3>

            {/* Promo Code Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#34243A] mb-1.5">
                Apply Discount Coupon
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-[#81758A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FESTIVE50"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E6DDEC] bg-white font-mono font-bold text-xs uppercase focus:outline-none focus:border-[#673B70]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  className="px-4 py-2 rounded-xl bg-[#E9DDF2] hover:bg-[#D8C2E5] text-[#4B2455] font-bold text-xs transition-colors"
                >
                  Apply
                </button>
              </div>
              {discountMessage && (
                <p className="text-[11px] font-bold text-[#2E9467] mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {discountMessage}
                </p>
              )}
              {discountError && (
                <p className="text-[11px] font-bold text-[#D85B69] mt-1.5">
                  {discountError}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-3 border-t border-[#E6DDEC] text-xs">
              <div className="flex justify-between text-[#81758A]">
                <span>Original Plan Price:</span>
                <span className="font-bold text-[#34243A]">₹{originalPrice}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#2E9467] font-bold">
                  <span>Coupon Discount:</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-[#81758A]">
                <span>Taxable Amount:</span>
                <span className="font-bold text-[#34243A]">₹{taxableAmount}</span>
              </div>
              <div className="flex justify-between text-[#81758A]">
                <span>GST (18%):</span>
                <span className="font-bold text-[#34243A]">₹{taxAmount}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#E6DDEC] text-base font-black text-[#34243A]">
                <span>Total Amount:</span>
                <span className="text-[#673B70]">₹{finalTotal}</span>
              </div>
            </div>

            {/* Complete Purchase Button */}
            <button
              onClick={handleCompletePayment}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white font-bold text-sm shadow-[0_6px_20px_rgba(103,59,112,0.35)] transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Pay ₹{finalTotal} & Activate</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-[#81758A] leading-relaxed">
              By confirming, you authorize Brightloop Software to activate recurring billing for this subscription.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
