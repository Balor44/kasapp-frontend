import React, { useState, useEffect } from 'react';
import {
  Menu, X, Send, PhoneCall, Zap, ArrowLeftRight, Lock, Key, ShieldCheck,
  ExternalLink, CheckCircle, Sparkles, Copy, Check, ArrowRight, Camera, 
  Mic, Paperclip, CheckCircle2, ArrowLeft, ShoppingBag
} from 'lucide-react';
import { BlockDAGWatermark } from './components/BlockDAGAnimation';
import kasappLogo from './kasapp-logo.jpg';


interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}


const BOT_PHONE_NUMBER = import.meta.env.VITE_WHATSAPP_BOT_NUMBER || '2348000000000'; 
const API_BASE = import.meta.env.VITE_API_URL || '/api';
const WHATSAPP_BOT_URL = `https://wa.me/${BOT_PHONE_NUMBER}?text=Hi`;


export default function KasappLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [number, setNumber] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);


  // Voucher Checkout Modal State
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyEmail, setBuyEmail] = useState('');
  const [buyPhone, setBuyPhone] = useState('');
  const [buyAmount, setBuyAmount] = useState<number | ''>(3000);
  const [amountError, setAmountError] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);


  // Post-Purchase Voucher State (Generated after checkout)
  const [purchasedVoucher, setPurchasedVoucher] = useState<{
    code: string;
    amountKas: number;
    amountNaira: number;
  } | null>(null);


  // State Detection: Listen for URL query params when redirected back from checkout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const voucherCode = urlParams.get('voucher_code') || urlParams.get('code');
    const kasAmount = urlParams.get('kas') || urlParams.get('amountKas');
    const nairaAmount = urlParams.get('naira') || urlParams.get('amountNaira');


    if (voucherCode && kasAmount) {
      setPurchasedVoucher({
        code: voucherCode,
        amountKas: parseFloat(kasAmount),
        amountNaira: parseFloat(nairaAmount || '3000'),
      });
    }
  }, []);


  const openWhatsAppDirect = () => {
    window.open(`https://wa.me/${BOT_PHONE_NUMBER}`, '_blank');
  };


  const handlePurchaseVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (buyAmount === '' || buyAmount < 3000) {
      setAmountError('Please enter a valid amount of at least ₦3,000.');
      return;
    }


    setIsInitializing(true);
    try {
      const res = await fetch(`${API_BASE}/payment/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: buyEmail,
          phone: buyPhone,
          amountNaira: Number(buyAmount),
          currency: 'NGN',
          gateway: 'paystack', // Flutterwave removed per your instruction
          redirect_url: `${window.location.origin}/`,
        }),
      });


      const data = await res.json();
      if (res.ok && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        alert(data.error || `Failed to initialize Paystack.`);
      }
    } catch {
      alert('Network error initializing payment gateway.');
    } finally {
      setIsInitializing(false);
    }
  };


  const buildWaRedeemLink = (code: string) => {
    const text = encodeURIComponent(`redeem ${code}`);
    return `https://wa.me/${BOT_PHONE_NUMBER}?text=${text}`;
  };


  const joinWaitlist = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setNumber(data.number);
      } else {
        setStatus('error');
        if (data.number) setNumber(data.number);
      }
    } catch {
      setStatus('error');
    }
  };


  const copyInviteLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  // ==========================================================================
  // STATE B: POST-PURCHASE STATE (1-TAP AUTO-REDEEM VIEW)
  // ==========================================================================
  if (purchasedVoucher) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] text-[#111827] font-sans flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40"><BlockDAGWatermark /></div>
        <main className="relative z-10 container mx-auto px-6 py-12 max-w-md my-auto text-center">
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-gray-200 shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#D9FDD3] text-[#075E54] flex items-center justify-center mb-4 shadow-sm">
              <CheckCircle size={36} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#075E54] bg-[#D9FDD3] px-3 py-1 rounded-full mb-2">
              Payment Successful
            </span>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Your Kasapp Voucher is Ready</h1>
            <p className="text-xs text-gray-500 mb-6">Tap below to redeem on WhatsApp instantly.</p>
            <div className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-5 mb-6 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Voucher Code</span>
              <span className="text-2xl sm:text-3xl font-mono font-black text-gray-900 tracking-wider block select-all">
                {purchasedVoucher.code}
              </span>
              <span className="text-xs text-gray-500 mt-2 block font-medium">
                Value: <strong>{purchasedVoucher.amountKas.toFixed(2)} KAS</strong> (₦{purchasedVoucher.amountNaira.toLocaleString()})
              </span>
            </div>
            <a
              href={buildWaRedeemLink(purchasedVoucher.code)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-4 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-transform"
            >
              <Send size={18} /> Auto-Redeem on WhatsApp
            </a>
            <button
              onClick={() => {
                setPurchasedVoucher(null);
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
              className="text-xs text-gray-400 hover:text-gray-900 mt-5 underline font-medium flex items-center justify-center gap-1"
            >
              <ArrowLeft size={12} /> Buy Another Voucher
            </button>
          </div>
        </main>
      </div>
    );
  }


  // ==========================================================================
  // STATE C: WAITLIST SUCCESS VIEW
  // ==========================================================================
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#FBFBFB] text-[#111827] font-sans flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40"><BlockDAGWatermark /></div>
        <header className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2">
            <img src={kasappLogo} alt="Kasapp Logo" className="w-9 h-9 rounded-xl object-cover mix-blend-multiply" />
            <span className="text-xl font-bold tracking-tight text-gray-900">KASAPP</span>
          </div>
          <button onClick={() => { setStatus('idle'); setPhone(''); }} className="text-sm font-semibold text-gray-500 hover:text-gray-900">
            ← Back to Home
          </button>
        </header>


        <main className="relative z-10 container mx-auto px-6 py-12 max-w-xl text-center">
          <div className="bg-white/95 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-gray-200 shadow-xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#D9FDD3] text-[#075E54] flex items-center justify-center mb-6">
              <CheckCircle size={36} />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-[#D9FDD3] text-[#075E54] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={14} /> You're On The List
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Welcome to Kasapp</h1>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              We've registered <strong className="text-gray-900">{phone}</strong> for early access testing.
            </p>
            <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 text-center">
              <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block">Your Waitlist Position</span>
              <span className="text-4xl md:text-5xl font-black text-[#22C55E] mt-1 block">#{number || '1'}</span>
              <p className="text-xs text-gray-500 mt-2">You will receive a direct WhatsApp message when your access key goes live.</p>
            </div>
            <div className="w-full flex flex-col gap-3">
              <button onClick={copyInviteLink} className="w-full bg-gray-900 text-white px-4 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Link Copied!" : "Copy Invite Link"}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }


  // ==========================================================================
  // STATE A: MAIN LANDING PAGE VIEW (PRE-PURCHASE)
  // ==========================================================================
  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#111827] font-sans antialiased selection:bg-[#70C7BA] selection:text-white">
      
      {/* NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#FBFBFB]/90 backdrop-blur-md border-b border-gray-100/80">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={kasappLogo} alt="Kasapp Logo" className="w-9 h-9 rounded-xl object-cover mix-blend-multiply" />
            <span className="text-xl font-bold tracking-tight text-gray-900">KASAPP</span>
          </div>


          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it Works</a>
            <a href="#security" className="hover:text-gray-900 transition-colors">Security</a>
            <a href="https://kaspa.university" target="_blank" rel="noreferrer" className="text-[#16A34A] hover:text-[#15803D] flex items-center gap-1 font-semibold transition-colors">
              Kaspa University <ExternalLink size={13} />
            </a>
          </nav>


          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => setShowBuyModal(true)} className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-3.5 py-2.5 rounded-full hover:bg-gray-100 transition-all">
              Buy Voucher
            </button>
            <button onClick={openWhatsAppDirect} className="bg-black hover:bg-gray-800 text-white text-sm font-medium px-5 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-sm">
              <Send size={14} /> Start on WhatsApp
            </button>
          </div>


          <button className="md:hidden text-gray-900" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>


        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-4 shadow-lg absolute w-full left-0">
            <a href="#features" onClick={() => setMenuOpen(false)} className="text-gray-800 font-medium">Features</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="text-gray-800 font-medium">How it Works</a>
            <a href="#security" onClick={() => setMenuOpen(false)} className="text-gray-800 font-medium">Security</a>
            <a href="https://kaspa.university" target="_blank" rel="noreferrer" className="text-[#16A34A] font-medium flex items-center gap-1">
              Kaspa University <ExternalLink size={14} />
            </a>
            <hr className="border-gray-100" />
            <button onClick={() => { setMenuOpen(false); setShowBuyModal(true); }} className="py-2.5 text-gray-900 font-semibold border border-gray-300 rounded-xl">
              Buy Kaspa Voucher
            </button>
            <button onClick={openWhatsAppDirect} className="py-2.5 bg-black text-white font-semibold rounded-xl flex items-center justify-center gap-2">
               Start on WhatsApp
            </button>
          </div>
        )}
      </header>


      {/* HERO SECTION WITH BLOCKDAG BACKGROUND */}
      <section className="relative w-full overflow-hidden">
        {/* Layer 0: Simulation */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <BlockDAGWatermark />
        </div>


        {/* Layer 1: Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-20 lg:pt-16 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-6 space-y-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D9FDD3] border border-[#25D366]/30 text-[#075E54] text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                Kaspa Payments. Inside WhatsApp.
              </div>


              <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.08]">
                Your money, <br />
                where you <br />
                already <span className="text-[#22C55E]">chat.</span>
              </h1>


              <p className="text-lg text-gray-600 font-normal max-w-md leading-relaxed">
                Send KAS. Buy airtime. Pay bills. <br />
                All directly from WhatsApp.
              </p>


              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button onClick={openWhatsAppDirect} className="bg-black hover:bg-gray-800 text-white font-semibold px-7 py-3.5 rounded-xl flex items-center gap-2.5 shadow-md transition-all">
                  <Send size={18} /> Start on WhatsApp
                </button>
                <button onClick={() => setShowBuyModal(true)} className="px-6 py-3.5 rounded-xl border border-gray-300 font-semibold text-gray-800 bg-white/80 backdrop-blur-sm hover:bg-gray-100 transition-all flex items-center gap-1.5">
                  Buy Voucher <ArrowRight size={16} />
                </button>
              </div>


              {/* Waitlist Integration preserved from old code */}
              <div className="mt-4 pt-6 border-t border-gray-200/80 max-w-md">
                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Join early access testing</p>
                <form onSubmit={joinWaitlist} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp number..."
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-500 shadow-sm"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="bg-gray-100 text-gray-900 border border-gray-300 px-5 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
                  >
                    {status === 'loading' ? 'Joining...' : 'Waitlist'}
                  </button>
                </form>
                {status === 'error' && (
                  <p className="text-xs text-red-600 font-medium mt-2">
                    {number ? `You are already registered at position #${number}` : 'Something went wrong. Please try again.'}
                  </p>
                )}
              </div>
            </div>


            {/* Right Hero: WhatsApp CSS Mockup (Matching the Image) */}
            <div className="lg:col-span-6 flex justify-center relative pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[#22C55E]/10 -z-10"></div>
              
              <div className="w-[320px] sm:w-[340px] bg-white rounded-[3rem] p-3.5 shadow-2xl border-4 border-gray-900 ring-1 ring-gray-950/5 relative z-20">
                <div className="bg-[#EFEAE2] rounded-[2.3rem] overflow-hidden flex flex-col h-[520px] border border-gray-200/50">
                  <div className="bg-[#075E54] text-white px-4 py-3.5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src={kasappLogo} alt="Kasapp Logo" className="w-9 h-9 rounded-xl object-cover mix-blend-multiply" />
                      <div>
                        <h4 className="text-sm font-semibold leading-none">Kasapp</h4>
                        <span className="text-[10px] text-emerald-200">online</span>
                      </div>
                    </div>
                    <div className="text-white/80 text-xs">⋮</div>
                  </div>


                  <div className="p-4 flex-1 space-y-3.5 overflow-y-auto font-sans text-xs">
                    <div className="flex justify-end">
                      <div className="bg-[#D9FDD3] text-gray-900 p-2.5 rounded-2xl rounded-tr-none shadow-sm max-w-[80%]">
                        <p className="font-medium">Send 50 KAS to John</p>
                        <span className="text-[9px] text-gray-500 block text-right mt-1">9:41 AM ✓✓</span>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-900 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] border border-gray-100">
                        <p className="font-semibold text-[#075E54] flex items-center gap-1 mb-1">
                          <span className="w-3 h-3 rounded-full bg-[#25D366] inline-block"></span> Kasapp
                        </p>
                        <p className="text-gray-600">You're sending 50 KAS to John</p>
                        <span className="text-[9px] text-gray-400 block text-right mt-1">9:41 AM</span>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[88%] border border-[#25D366]/30">
                        <div className="flex items-center gap-2 mb-1.5">
                          <CheckCircle2 size={16} className="text-[#25D366]" />
                          <span className="font-bold text-gray-900 text-[11px]">50 KAS sent to John</span>
                        </div>
                        <p className="text-[10px] text-gray-500">Transaction confirmed</p>
                        <div className="mt-2 pt-2 border-t border-gray-100 text-right text-[9px] text-gray-400">9:41 AM</div>
                      </div>
                    </div>
                  </div>


                  <div className="p-2.5 bg-[#F0F2F5] flex items-center gap-2 border-t border-gray-200">
                    <div className="flex-1 bg-white rounded-full px-3.5 py-1.5 text-[11px] text-gray-400 flex items-center justify-between shadow-inner">
                      <span>Message</span>
                      <div className="flex items-center gap-2"><Paperclip size={13} /><Camera size={13} /></div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#00A884] flex items-center justify-center text-white"><Mic size={13} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* FEATURES GRID */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-100 relative z-10 bg-[#FBFBFB]">
        <div className="mb-12">
          <span className="text-xs font-bold tracking-wider text-[#22C55E] uppercase">One chat. Real utility.</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mt-2">Everything you need, <br /> without leaving WhatsApp.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#D9FDD3] text-[#075E54] flex items-center justify-center mb-5"><Send size={18} /></div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Send KAS</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Send Kaspa to anyone instantly. Kasapp users or external wallets.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5"><PhoneCall size={18} /></div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Buy Airtime & Data</h3>
            <p className="text-xs text-gray-500 leading-relaxed">MTN, Airtel, Glo, 9mobile. Pay for airtime and data with KAS.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5"><Zap size={18} /></div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Pay Bills</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Electricity, cable TV, and other services. Instant payment, zero stress.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5"><ArrowLeftRight size={18} /></div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Fiat ↔ KAS</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Move between fiat and KAS using familiar Nigerian payment rails.</p>
          </div>
        </div>
      </section>


      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-100 bg-[#FBFBFB]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-xs font-bold tracking-wider text-[#22C55E] uppercase">How it works</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mt-1">Crypto without the learning curve.</h2>
            </div>
            <div className="space-y-8 pt-4">
              <div className="flex items-start gap-5">
                <div className="w-8 h-8 rounded-full bg-[#D9FDD3] text-[#075E54] font-bold text-xs flex items-center justify-center shrink-0">01</div>
                <div><h4 className="text-sm font-bold text-gray-900">Open WhatsApp</h4><p className="text-xs text-gray-500 mt-1">No new app download. No complexity.</p></div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-8 h-8 rounded-full bg-[#D9FDD3] text-[#075E54] font-bold text-xs flex items-center justify-center shrink-0">02</div>
                <div><h4 className="text-sm font-bold text-gray-900">Tell Kasapp what you need</h4><p className="text-xs text-gray-500 mt-1">Send KAS, buy airtime, pay a bill and more.</p></div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-8 h-8 rounded-full bg-[#D9FDD3] text-[#075E54] font-bold text-xs flex items-center justify-center shrink-0">03</div>
                <div><h4 className="text-sm font-bold text-gray-900">Confirm</h4><p className="text-xs text-gray-500 mt-1">Kasapp handles the rest.</p></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-sm text-center lg:text-left">
            <h3 className="text-3xl font-extrabold text-gray-900 leading-tight">You don't need <br className="hidden lg:block"/> to know how <br className="hidden lg:block"/> it works.</h3>
            <p className="text-2xl font-bold text-[#22C55E] mt-4">That's the point.</p>
            <div className="mt-8 border-b-2 border-dotted border-gray-300 w-24 mx-auto lg:mx-0"></div>
          </div>
        </div>
      </section>


      {/* SECURITY SECTION */}
      <section id="security" className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-100 bg-[#FBFBFB]">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold tracking-wider text-[#22C55E] uppercase">Your Keys. Your KAS.</span>
              <h2 className="text-3xl font-extrabold text-gray-950">Non-custodial by design.</h2>
              <p className="text-xs text-gray-500 leading-relaxed">Kasapp doesn't hold your funds. You're in control, always.</p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <Lock size={18} className="text-[#22C55E] mb-3" />
                <h4 className="text-sm font-bold text-gray-900">Non-custodial</h4>
                <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">Kasapp never holds your funds.</p>
              </div>
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <Key size={18} className="text-[#22C55E] mb-3" />
                <h4 className="text-sm font-bold text-gray-900">Your recovery phrase</h4>
                <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">Back up your wallet and restore it anywhere.</p>
              </div>
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <ShieldCheck size={18} className="text-[#22C55E] mb-3" />
                <h4 className="text-sm font-bold text-gray-900">Protected actions</h4>
                <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">PIN verification for large transfers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* BOTTOM CTA BANNER */}
      <section className="max-w-6xl mx-auto px-6 pb-20 bg-[#FBFBFB]">
        <div className="bg-black text-white p-8 sm:p-12 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <img src={kasappLogo} alt="Kasapp Logo" className="w-9 h-9 rounded-xl object-cover mix-blend-multiply" />
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">Kaspa was built for fast money.</h3>
              <p className="text-xl sm:text-2xl font-bold text-[#22C55E]">Let's make it useful.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button onClick={openWhatsAppDirect} className="w-full sm:w-auto bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Send size={16} /> Start using Kasapp
            </button>
          </div>
        </div>
      </section>


      {/* FOOTER */}
      <footer className="border-t border-gray-200 py-10 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm">KASAPP</span>
            <span>© 2026 Kasapp Technologies Ltd.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://kaspa.university" target="_blank" rel="noreferrer" className="hover:text-gray-900 font-medium">Docs</a>
            <a href={WHATSAPP_BOT_URL} target="_blank" rel="noreferrer" className="hover:text-gray-900 font-medium">Community</a>
            <a href="#security" className="hover:text-gray-900 font-medium">Privacy</a>
          </div>
        </div>
      </footer>


      {/* ONLINE BUY VOUCHER MODAL (PAYSTACK ONLY) */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowBuyModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 p-1 transition-colors">
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <img src={kasappLogo} alt="Kasapp Logo" className="w-9 h-9 rounded-xl object-cover mix-blend-multiply" />
              <h3 className="text-xl font-bold text-gray-900">Purchase Voucher</h3>
            </div>
            <p className="text-xs text-gray-500 mb-5">Pay via Card or Bank Transfer to generate a redeemable Kaspa voucher code.</p>


            <form onSubmit={handlePurchaseVoucher} className="flex flex-col gap-5">
              {/* Amount Selection */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Amount (NGN)</label>
                <div className="flex gap-2 mb-3">
                  {[3000, 5000, 10000].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => { setBuyAmount(preset); setAmountError(''); }}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                        buyAmount === preset ? 'bg-black border-black text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      ₦{preset.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Custom amount (Min ₦3,000)"
                  value={buyAmount}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : '';
                    setBuyAmount(val);
                    if (val !== '' && val < 3000) setAmountError('Minimum amount is ₦3,000.');
                    else setAmountError('');
                  }}
                  className={`w-full bg-gray-50 border ${amountError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'} rounded-xl px-4 py-3 text-sm outline-none transition-colors`}
                />
                {amountError && <p className="text-[10px] text-red-500 mt-1.5 font-bold">{amountError}</p>}
              </div>


              {/* User Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="08012345678"
                    value={buyPhone}
                    onChange={(e) => setBuyPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={buyEmail}
                    onChange={(e) => setBuyEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-500 transition-colors"
                  />
                </div>
              </div>


              {/* Checkout Action */}
              <button
                type="submit"
                disabled={isInitializing || (buyAmount !== '' && buyAmount < 3000)}
                className="w-full mt-2 py-4 bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-50 text-black rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                {isInitializing ? 'Connecting...' : `Pay ₦${(buyAmount || 0).toLocaleString()} with Paystack`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
