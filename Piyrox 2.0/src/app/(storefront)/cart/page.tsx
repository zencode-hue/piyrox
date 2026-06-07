"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag, Trash2, Zap, Bitcoin, Wallet, Loader2,
  CheckCircle, ArrowRight, Tag, CreditCard, ChevronRight, ExternalLink, X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";

const CAT: Record<string, string> = {
  STREAMING: "Streaming",
  AI_TOOLS: "AI Tools",
  SOFTWARE: "Software",
  GAMING: "Gaming",
};

type Provider = "nowpayments" | "balance" | "binance_gift_card";

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
      <div className="w-full max-w-md rounded-2xl bg-[#09090b] border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h3 className="font-bold text-white">Pay with Binance Gift Card</h3>
            <p className="text-xs text-zinc-400 mt-0.5">${denomination} USD card required for your cart</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center">
            <CheckCircle size={40} className="text-white mx-auto mb-3" />
            <p className="font-bold text-white mb-1">Code Submitted!</p>
            <p className="text-sm text-zinc-400">Our team is verifying your gift card. You&apos;ll receive all products via email once approved.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 px-5 pt-4 pb-2 text-xs">
              <button onClick={() => setStep("instructions")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${step === "instructions" ? "bg-white/10 text-white border-white/10" : "bg-white/5 text-zinc-400 border-transparent"} border`}>
                1. How to buy
              </button>
              <ChevronRight size={12} className="text-white/20" />
              <button onClick={() => setStep("code")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${step === "code" ? "bg-white/10 text-white border-white/10" : "bg-white/5 text-zinc-400 border-transparent"} border`}>
                2. Submit code
              </button>
            </div>

            <div className="p-5">
              {step === "instructions" && (
                <div className="space-y-4">
                  <ol className="space-y-3">
                    {[
                      `Click the button below to buy a $${denomination} USD Binance Gift Card on Eneba.`,
                      "Complete the purchase. You'll receive a gift card code (e.g. XXXX-XXXX-XXXX-XXXX).",
                      "Come back here and click \"I have my code\" to enter it.",
                      "Our staff will verify the code and deliver all your products within minutes.",
                    ].map((text, n) => (
                      <li key={n} className="flex gap-3 text-sm text-zinc-400">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 bg-white/10 text-white">
                          {n + 1}
                        </span>
                        {text}
                      </li>
                    ))}
                  </ol>
                  <div className="p-3 rounded-xl text-xs bg-white/5 border border-white/10 text-zinc-300">
                    ⚠️ Purchase exactly a <strong>${denomination} USD</strong> Binance Gift Card. Other amounts won&apos;t be accepted.
                  </div>
                  <a href={enebaUrl} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-white text-black hover:bg-zinc-200 transition-all">
                    <ExternalLink size={15} /> Buy ${denomination} USD Gift Card on Eneba
                  </a>
                  <button onClick={() => setStep("code")}
                    className="w-full py-2.5 rounded-xl text-sm transition-all bg-white/[0.02] border border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white">
                    I already have my code →
                  </button>
                </div>
              )}

              {step === "code" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs mb-2 text-zinc-400">
                      Paste your Binance Gift Card code
                    </label>
                    <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 font-mono tracking-widest text-sm" autoFocus />
                  </div>
                  {error && <p className="text-xs text-white">{error}</p>}
                  <button onClick={submitCode} disabled={submitting || !code.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 bg-white text-black hover:bg-zinc-200 transition-all">
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : "Submit Gift Card Code"}
                  </button>
                  <button onClick={() => setStep("instructions")} className="text-xs text-zinc-500 hover:text-white transition-colors">
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
  const [selectedPayment, setSelectedPayment] = useState<Provider>("nowpayments");
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

    clearCart();
    if (data.data?.redirectUrl) {
      window.location.href = data.data.redirectUrl;
    }
  }

  if (items.length === 0 && !giftCardModal) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-white/5 border border-white/10">
          <ShoppingBag size={36} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Your cart is empty</h1>
        <p className="text-zinc-500 mb-6">Add some products to get started.</p>
        <Link href="/products" className="bg-white text-black hover:bg-zinc-200 transition-all text-sm font-semibold rounded-xl px-6 py-3">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black text-white">
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

        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShoppingBag size={22} className="text-white" />
              Cart
              <span className="text-sm font-normal text-zinc-500">({items.length} item{items.length !== 1 ? "s" : ""})</span>
            </h1>
            <button onClick={clearCart} className="text-xs text-zinc-600 hover:text-white transition-colors">
              Clear all
            </button>
          </div>

          {/* Items */}
          <div className="space-y-2 mb-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{item.title}</p>
                  <p className="text-xs text-zinc-500">{CAT[item.category] ?? item.category}</p>
                </div>
                <p className="font-bold text-white shrink-0">${item.price.toFixed(2)}</p>
                <button onClick={() => removeItem(item.id)}
                  className="p-2 rounded-lg text-zinc-600 hover:text-white hover:bg-white/10 transition-all">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Discount code */}
          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-5 mb-4">
            <label className="block text-sm text-zinc-400 mb-2 flex items-center gap-1.5">
              <Tag size={14} /> Discount Code <span className="text-zinc-600 text-xs">(optional)</span>
            </label>
            <div className="flex gap-2">
              <input value={discountCode}
                onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountInfo(null); setDiscountErr(null); }}
                placeholder="SAVE20" className="flex-1 bg-white/[0.02] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 text-sm" />
              <button onClick={applyDiscount} disabled={checkingDiscount || !discountCode.trim()} 
                className="bg-white/[0.02] border border-white/10 text-white hover:bg-white/10 transition-all text-sm rounded-lg px-4 py-2 font-medium">
                {checkingDiscount ? "…" : "Apply"}
              </button>
            </div>
            {discountErr && <p className="text-white text-xs mt-2">{discountErr}</p>}
            {discountInfo && (
              <p className="text-zinc-300 text-xs mt-2">
                ✅ {discountInfo.type === "PERCENTAGE" ? `${discountInfo.value}% off` : `$${discountInfo.value} off`} — saving ${discountInfo.discountAmount.toFixed(2)}
              </p>
            )}
          </div>

          {/* Order summary */}
          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-5 mb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Order Summary</p>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-zinc-400">
                  <span className="truncate mr-4">{item.title}</span>
                  <span className="shrink-0">${item.price.toFixed(2)}</span>
                </div>
              ))}
              {discount > 0 && (
                <div className="flex justify-between text-white border-t border-white/5 pt-2">
                  <span>Discount</span><span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-white border-t border-white/5 pt-2 text-base">
                <span>Total</span><span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Guest Email Input */}
          {status !== "loading" && !session?.user && (
            <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-5 mb-4">
              <label className="block text-sm text-zinc-400 mb-2">
                Email Address for Delivery <span className="text-white">*</span>
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 text-sm"
              />
              <p className="text-xs text-zinc-500 mt-2">
                We will send your order details to this email. Sign in to save your purchase history.
              </p>
            </div>
          )}

          {/* Payment method */}
          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-5 mb-5">
            <p className="text-sm font-medium text-white mb-3">Payment Method</p>
            <div className="space-y-2">
              {/* Crypto */}
              <button onClick={() => setSelectedPayment("nowpayments")}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                  selectedPayment === "nowpayments" ? "bg-white/10 border-white/20" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                }`}>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Bitcoin size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Crypto Payment</p>
                  <p className="text-xs text-zinc-500">BTC, ETH, USDT, 100+ coins — one payment for everything</p>
                </div>
                {selectedPayment === "nowpayments" && <CheckCircle size={16} className="text-white shrink-0" />}
              </button>

              {/* Gift Card — hidden for North America */}
              {!isNorthAmerica && (
                <button onClick={() => setSelectedPayment("binance_gift_card")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                    selectedPayment === "binance_gift_card" ? "bg-white/10 border-white/20" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  }`}>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <CreditCard size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Card Payment (Key)</p>
                    <p className="text-xs text-zinc-500">Buy one Binance USDT Gift Card for the total on Eneba</p>
                  </div>
                  {selectedPayment === "binance_gift_card" && <CheckCircle size={16} className="text-white shrink-0" />}
                </button>
              )}

              {/* Balance */}
              {balance !== null && (
                <button onClick={() => canPayWithBalance && setSelectedPayment("balance")}
                  disabled={!canPayWithBalance}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                    selectedPayment === "balance" ? "bg-white/10 border-white/20" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  } ${!canPayWithBalance ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <Wallet size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Wallet Balance</p>
                    <p className="text-xs text-zinc-500">
                      Available: ${balance.toFixed(2)}{!canPayWithBalance ? " — insufficient" : " — instant delivery"}
                    </p>
                  </div>
                  {selectedPayment === "balance" && <CheckCircle size={16} className="text-white shrink-0" />}
                </button>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 flex-wrap mb-5">
            {[{ icon: "🔒", text: "Secure" }, { icon: "⚡", text: "Instant Delivery" }, { icon: "🔄", text: "Replacement Guarantee" }].map((b) => (
              <div key={b.text} className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className="text-white">{b.icon}</span><span>{b.text}</span>
              </div>
            ))}
          </div>

          {payErr && <p className="text-white text-sm text-center mb-4">{payErr}</p>}

          <button onClick={handleCheckout} disabled={paying}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-black text-base transition-all bg-white hover:bg-zinc-200 disabled:opacity-50">
            {paying ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
            {paying ? "Processing…" : `Pay $${finalTotal.toFixed(2)} — ${items.length} Item${items.length !== 1 ? "s" : ""}`}
          </button>

          <p className="text-center text-xs text-zinc-600 mt-3">
            One payment for all items. All products delivered to your email.
          </p>

          <div className="flex justify-center mt-6">
            <Link href="/products" className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
              Continue shopping <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
