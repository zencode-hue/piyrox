"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag, Trash2, Zap, Bitcoin, Wallet, Loader2,
  CheckCircle, ArrowRight, Tag, CreditCard, ChevronRight, ExternalLink, X, Package
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";

const CAT: Record<string, string> = {
  STREAMING: "Streaming",
  AI_TOOLS: "AI Tools",
  SOFTWARE: "Software",
  GAMING: "Gaming",
};

type Provider = "paymento" | "balance" | "binance_gift_card";

// ── Gift Card Modal ───────────────────────────────────────────────────────────
function GiftCardModal({
  amount,
  orderId,
  onClose,
  onSuccess,
}: {
  amount: number;
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<"instructions" | "code">("instructions");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const denominations = [
    0.5, 1, 2, 3, 4, 5, 6, 7, 7.5, 8, 9, 10, 10.5, 11, 12, 13, 14, 15,
    17, 18, 20, 20.5, 22, 25, 27, 28, 29, 30, 33, 33.5, 35, 40, 43, 43.5,
    44, 44.5, 45, 45.5, 46, 50, 50.5, 55, 60, 65, 66, 70, 100, 150, 200,
    250, 300, 400, 500, 750,
  ];
  const denomination = denominations.find((d) => d >= amount) ?? amount;
  const denomStr = denomination % 1 === 0 ? String(denomination) : denomination.toFixed(1).replace(".", "-");
  const enebaUrl = `https://www.eneba.com/binance-binance-gift-card-usdt-${denomStr}-usd-key-global`;

  async function submitCode() {
    if (!code.trim()) return;
    setSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/v1/checkout/binance-gift-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, giftCardCode: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to submit"); return; }
      setSubmitted(true);
      setTimeout(onSuccess, 2000);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h3 className="font-bold text-white text-lg">Binance Gift Card</h3>
            <p className="text-xs text-zinc-400 mt-0.5">${denomination} USD card required for your cart</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <p className="text-xl font-bold text-white mb-2">Code Submitted!</p>
            <p className="text-sm text-zinc-400 leading-relaxed">Our team is verifying your gift card. You&apos;ll receive all products via email once approved.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 px-5 pt-5 pb-2 text-xs">
              <button onClick={() => setStep("instructions")}
                className={`flex-1 py-2 rounded-xl font-bold transition-all ${step === "instructions" ? "bg-amber-500/15 text-amber-500 border-amber-500/30" : "bg-white/5 text-zinc-500 border-transparent hover:text-white"} border`}>
                1. How to buy
              </button>
              <ChevronRight size={14} className="text-zinc-700 shrink-0" />
              <button onClick={() => setStep("code")}
                className={`flex-1 py-2 rounded-xl font-bold transition-all ${step === "code" ? "bg-amber-500/15 text-amber-500 border-amber-500/30" : "bg-white/5 text-zinc-500 border-transparent hover:text-white"} border`}>
                2. Submit code
              </button>
            </div>

            <div className="p-5">
              {step === "instructions" && (
                <div className="space-y-4">
                  <ol className="space-y-3">
                    {[
                      `Click the button below to buy a $${denomination} USD Binance Gift Card on Eneba.`,
                      "Complete the purchase. You'll receive a gift card code.",
                      "Come back here and click \"I have my code\" to enter it.",
                      "Our staff will verify the code and deliver your products.",
                    ].map((text, n) => (
                      <li key={n} className="flex gap-3 text-sm text-zinc-300 font-medium">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-white/10 text-white shadow-sm border border-white/5">
                          {n + 1}
                        </span>
                        <span className="mt-0.5 leading-relaxed">{text}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="p-4 rounded-xl text-xs bg-amber-500/10 border border-amber-500/20 text-amber-200/80 font-medium">
                    ⚠️ Purchase exactly a <strong className="text-amber-400">${denomination} USD</strong> Binance Gift Card. Other amounts won&apos;t be accepted.
                  </div>
                  <a href={enebaUrl} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                    <ExternalLink size={16} /> Buy ${denomination} Gift Card on Eneba
                  </a>
                  <button onClick={() => setStep("code")}
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all bg-white/[0.03] border border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white">
                    I already have my code →
                  </button>
                </div>
              )}

              {step === "code" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-500">
                      Paste Binance Gift Card code
                    </label>
                    <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500/50 focus:bg-amber-500/5 font-mono tracking-widest text-sm transition-all shadow-inner" autoFocus />
                  </div>
                  {error && <p className="text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}
                  <button onClick={submitCode} disabled={submitting || !code.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold disabled:opacity-50 bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : "Submit Gift Card Code"}
                  </button>
                  <button onClick={() => setStep("instructions")} className="text-xs font-medium text-zinc-500 hover:text-white transition-colors w-full text-center mt-2">
                    ← Back to instructions
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Cart Page ─────────────────────────────────────────────────────────────────
export default function CartPage() {
  const { items, total, removeItem, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<Provider>("paymento");
  const [balance, setBalance] = useState<number | null>(null);
  const [isNorthAmerica, setIsNorthAmerica] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{ discountAmount: number; value: number; type: string } | null>(null);
  const [discountErr, setDiscountErr] = useState<string | null>(null);
  const [checkingDiscount, setCheckingDiscount] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState<string | null>(null);
  const [giftCardModal, setGiftCardModal] = useState<{ orderId: string; amount: number } | null>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const { data: session, status } = useSession();

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/balance").then((r) => r.json()).catch(() => null),
      fetch("https://ipapi.co/json/").then((r) => r.json()).catch(() => null),
    ]).then(([balData, geoData]) => {
      if (balData?.data?.balance !== undefined) setBalance(Number(balData.data.balance));
      if (["US", "CA", "MX"].includes(geoData?.country_code)) setIsNorthAmerica(true);
    });
  }, []);

  const discount = discountInfo?.discountAmount ?? 0;
  const finalTotal = Math.max(0, total - discount);
  const canPayWithBalance = balance !== null && balance >= finalTotal;

  async function applyDiscount() {
    if (!discountCode.trim() || items.length === 0) return;
    setCheckingDiscount(true); setDiscountErr(null);
    const res = await fetch("/api/v1/discount/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: discountCode, productId: items[0].productId }),
    });
    const data = await res.json();
    setCheckingDiscount(false);
    if (!res.ok) { setDiscountErr(data.error); return; }
    setDiscountInfo(data.data);
  }

  async function handleCheckout() {
    if (items.length === 0) return;
    
    if (status !== "loading" && !session?.user && !guestEmail.trim()) {
      setPayErr("Please provide an email address for delivery.");
      return;
    }

    setPaying(true); setPayErr(null);

    const res = await fetch("/api/v1/checkout/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId })),
        paymentProvider: selectedPayment,
        discountCode: discountCode || undefined,
        guestEmail: guestEmail || undefined,
      }),
    });

    const data = await res.json();
    setPaying(false);

    if (!res.ok) { setPayErr(data.error ?? "Checkout failed"); return; }

    if (selectedPayment === "binance_gift_card") {
      setGiftCardModal({ orderId: data.data.orderId, amount: data.data.denomination ?? finalTotal });
      return;
    }

    // For crypto: redirect to invoice page so user has a record before paying
    if (selectedPayment === "paymento" && data.data?.orderIds?.[0]) {
      clearCart();
      window.location.href = `/invoice/${data.data.orderIds[0]}`;
      return;
    }

    clearCart();
    if (data.data?.redirectUrl) {
      window.location.href = data.data.redirectUrl;
    }
  }

  if (items.length === 0 && !giftCardModal) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 bg-white/[0.02] border border-white/5 shadow-2xl relative">
          <div className="absolute inset-0 bg-amber-500/10 rounded-[32px] blur-xl" />
          <ShoppingBag size={40} className="text-zinc-500 relative z-10" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Your cart is empty</h1>
        <p className="text-zinc-400 mb-8 max-w-sm text-sm leading-relaxed">Ready to get started? Explore our digital products and subscriptions.</p>
        <Link href="/products" className="bg-white text-black hover:bg-zinc-200 transition-all text-sm font-bold rounded-xl px-8 py-3.5 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen py-12 lg:py-16">
        {giftCardModal && (
          <GiftCardModal
            amount={giftCardModal.amount}
            orderId={giftCardModal.orderId}
            onClose={() => setGiftCardModal(null)}
            onSuccess={() => {
              clearCart();
              setGiftCardModal(null);
            }}
          />
        )}

        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Checkout</h1>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/5">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column — Cart Items */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Review your order</h2>
                <button onClick={clearCart} className="text-xs font-semibold text-zinc-500 hover:text-red-400 transition-colors bg-white/5 px-3 py-1.5 rounded-lg">
                  Remove all
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex gap-4 transition-all hover:bg-white/[0.04]">
                    {/* Item Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl bg-black/40 border border-white/10 overflow-hidden relative">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-50">
                          <Package size={24} className="text-zinc-600" />
                        </div>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-bold text-white text-base sm:text-lg truncate group-hover:text-amber-400 transition-colors">{item.title}</h3>
                          <button onClick={() => removeItem(item.id)}
                            className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0 -mt-1 -mr-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] uppercase tracking-widest font-bold text-zinc-400 border border-white/5">
                            {CAT[item.category] ?? item.category}
                          </span>
                          {item.variantName && (
                            <span className="text-xs font-medium text-zinc-500 truncate">{item.variantName}</span>
                          )}
                        </div>
                      </div>
                      <p className="font-black text-white text-lg mt-2">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column — Summary & Payment */}
            <div className="lg:col-span-5">
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 lg:p-8 sticky top-24 shadow-2xl backdrop-blur-xl">
                
                {/* Guest Email Input */}
                {status !== "loading" && !session?.user && (
                  <div className="mb-6">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Delivery Email <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500/50 text-sm transition-all shadow-inner"
                    />
                  </div>
                )}

                <h3 className="text-lg font-bold text-white mb-4">Payment Method</h3>
                <div className="space-y-3 mb-8">
                  {/* Crypto */}
                  <button onClick={() => setSelectedPayment("paymento")}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      selectedPayment === "paymento" ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    }`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${selectedPayment === "paymento" ? "bg-amber-500/20 border-amber-500/20" : "bg-white/5 border-white/5"}`}>
                      <Bitcoin size={20} className={selectedPayment === "paymento" ? "text-amber-500" : "text-zinc-500"} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-white">Crypto Payment</p>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">Pay with BTC, ETH, USDT & more</p>
                    </div>
                    {selectedPayment === "paymento" && <div className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center shrink-0"><CheckCircle size={12} className="stroke-[4]" /></div>}
                  </button>

                  {/* Gift Card */}
                  {!isNorthAmerica && (
                    <button onClick={() => setSelectedPayment("binance_gift_card")}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        selectedPayment === "binance_gift_card" ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                      }`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${selectedPayment === "binance_gift_card" ? "bg-amber-500/20 border-amber-500/20" : "bg-white/5 border-white/5"}`}>
                        <CreditCard size={20} className={selectedPayment === "binance_gift_card" ? "text-amber-500" : "text-zinc-500"} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-white">Card Payment</p>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">Redeem a Binance Gift Card</p>
                      </div>
                      {selectedPayment === "binance_gift_card" && <div className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center shrink-0"><CheckCircle size={12} className="stroke-[4]" /></div>}
                    </button>
                  )}

                  {/* Balance */}
                  {balance !== null && (
                    <button onClick={() => canPayWithBalance && setSelectedPayment("balance")}
                      disabled={!canPayWithBalance}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        selectedPayment === "balance" ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                      } ${!canPayWithBalance ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${selectedPayment === "balance" ? "bg-amber-500/20 border-amber-500/20" : "bg-white/5 border-white/5"}`}>
                        <Wallet size={20} className={selectedPayment === "balance" ? "text-amber-500" : "text-zinc-500"} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-white">Wallet Balance</p>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          ${balance.toFixed(2)} {!canPayWithBalance && "— insufficient"}
                        </p>
                      </div>
                      {selectedPayment === "balance" && <div className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center shrink-0"><CheckCircle size={12} className="stroke-[4]" /></div>}
                    </button>
                  )}
                </div>

                {/* Discount Code */}
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                    <Tag size={14} /> Discount Code
                  </label>
                  <div className="flex gap-2">
                    <input value={discountCode}
                      onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountInfo(null); setDiscountErr(null); }}
                      placeholder="Enter promo code" className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500/50 text-sm transition-all shadow-inner" />
                    <button onClick={applyDiscount} disabled={checkingDiscount || !discountCode.trim()} 
                      className="bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all text-sm font-bold rounded-xl px-5 py-3">
                      {checkingDiscount ? "…" : "Apply"}
                    </button>
                  </div>
                  {discountErr && <p className="text-red-400 text-xs font-medium mt-2 ml-1">{discountErr}</p>}
                  {discountInfo && (
                    <p className="text-green-400 text-xs font-bold mt-2 ml-1 flex items-center gap-1">
                      <CheckCircle size={12} /> {discountInfo.type === "PERCENTAGE" ? `${discountInfo.value}% off` : `$${discountInfo.value} off`} applied
                    </p>
                  )}
                </div>

                {/* Order Summary */}
                <div className="pt-6 border-t border-white/10 space-y-3 mb-6">
                  <div className="flex justify-between text-zinc-400 text-sm font-medium">
                    <span>Subtotal</span>
                    <span className="text-white">${total.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400 text-sm font-bold">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-3 border-t border-white/5">
                    <span className="text-white font-bold text-base">Total Due</span>
                    <span className="text-3xl font-black text-white">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {payErr && <p className="text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-sm font-medium text-center mb-4">{payErr}</p>}

                <button onClick={handleCheckout} disabled={paying}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-black text-base transition-all bg-amber-500 hover:bg-amber-400 disabled:opacity-50 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                  {paying ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} className="fill-black" />}
                  {paying ? "Processing Order…" : "Pay Now"}
                </button>
                <div className="flex items-center justify-center gap-6 mt-5 text-zinc-500">
                  <span className="flex items-center gap-1.5 text-xs font-medium"><span className="text-base">🔒</span> Secure</span>
                  <span className="flex items-center gap-1.5 text-xs font-medium"><span className="text-base">⚡</span> Instant</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
