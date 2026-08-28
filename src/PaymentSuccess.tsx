import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle, Send, ArrowLeft, XCircle } from 'lucide-react';
import { BlockDAGWatermark } from './components/BlockDAGAnimation';


const API_BASE = import.meta.env.VITE_API_URL || 'https://kasapp2-production.up.railway.app/api';


export default function PaymentSuccess() {
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [debugError, setDebugError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [voucher, setVoucher] = useState<{
    code: string;
    amountKas: number;
    amountNaira: number;
    whatsapp_url: string;
  } | null>(null);


  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }


    const hashParams = new URLSearchParams(location.search);
    const urlParams = new URLSearchParams(window.location.search);


    const reference = 
      hashParams.get('reference') || 
      hashParams.get('trxref') || 
      urlParams.get('reference') || 
      urlParams.get('trxref');


    if (!reference) {
      setDebugError(`Missing reference in URL. Search params: ${window.location.search}`);
      setStatus('error');
      return;
    }


    const verifyPayment = (ref: string, attemptsLeft: number) => {
      fetch(`${API_BASE}/payment/verify?tx_ref=${ref}`)
        .then(async (res) => {
          let data;
          try {
            data = await res.json();
          } catch (e) {
            setDebugError(`Invalid JSON from backend. HTTP Status: ${res.status}`);
            setStatus('error');
            return;
          }


          if (res.ok && data.status === 'success') {
            setVoucher({
              code: data.code,
              amountKas: data.amountKas,
              amountNaira: data.amountNaira,
              whatsapp_url: data.whatsapp_url,
            });
            setStatus('success');
          } else if (res.status === 404 && attemptsLeft > 0) {
            // Race condition hit: Wait 3 seconds and try again
            setRetryCount(prev => prev + 1);
            setTimeout(() => verifyPayment(ref, attemptsLeft - 1), 3000);
          } else {
            setDebugError(`Backend Rejected: HTTP ${res.status} | Data: ${JSON.stringify(data)}`);
            setStatus('error');
          }
        })
        .catch(err => {
          setDebugError(`Network/Fetch Error: ${err.message}. Check CORS or if backend is down.`);
          setStatus('error');
        });
    };


    // Start verification with 5 max attempts (15 seconds total polling time)
    verifyPayment(reference, 5);


  }, [location.search]);


  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#FBFBFB] dark:bg-[#0B141A] text-[#111827] dark:text-[#E9EDEF] font-sans flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-sm font-semibold mb-2">Verifying your Paystack payment...</p>
        {retryCount > 0 && (
          <p className="text-xs text-gray-500 animate-pulse">
            Waiting for Paystack confirmation... (Attempt {retryCount}/5)
          </p>
        )}
      </div>
    );
  }


  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#FBFBFB] dark:bg-[#0B141A] flex flex-col items-center justify-center p-6 text-center">
        <XCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold dark:text-white mb-2">Verification Failed</h1>
        <p className="text-gray-500 dark:text-[#8696A0] mb-6 max-w-sm">We couldn't verify your payment. If you were debited, please contact support.</p>
        
        {/* DEBUG BOX */}
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left text-xs font-mono text-red-600 dark:text-red-400 break-words w-full max-w-md">
          <strong className="block mb-1 text-red-700 dark:text-red-300">Technical Error Details:</strong>
          {debugError}
        </div>


        <a href="/" className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold">
          Return to Home
        </a>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#FBFBFB] dark:bg-[#0B141A] text-[#111827] dark:text-[#E9EDEF] font-sans flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20"><BlockDAGWatermark /></div>
      <main className="relative z-10 container mx-auto px-6 py-12 max-w-md my-auto text-center">
        <div className="bg-white/95 dark:bg-[#111B21]/95 backdrop-blur-md p-8 rounded-3xl border border-gray-200 dark:border-[#202C33] shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#D9FDD3] dark:bg-[#005C4B] text-[#075E54] dark:text-[#E9EDEF] flex items-center justify-center mb-4 shadow-sm">
            <CheckCircle size={36} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#075E54] dark:text-[#25D366] bg-[#D9FDD3] dark:bg-[#005C4B]/50 px-3 py-1 rounded-full mb-2">
            Payment Successful
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Your Kasapp Voucher is Ready</h1>
          <p className="text-xs text-gray-500 dark:text-[#8696A0] mb-6">Tap below to redeem on WhatsApp instantly.</p>
          <div className="w-full bg-gray-50 dark:bg-[#202C33] border-2 border-dashed border-gray-300 dark:border-[#2A3942] rounded-2xl p-5 mb-6 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-[#8696A0] block mb-1">Voucher Code</span>
            <span className="text-2xl sm:text-3xl font-mono font-black text-gray-900 dark:text-white tracking-wider block select-all">
              {voucher?.code}
            </span>
            <span className="text-xs text-gray-500 dark:text-[#8696A0] mt-2 block font-medium">
              Value: <strong className="dark:text-[#E9EDEF]">{voucher?.amountKas.toFixed(2)} KAS</strong> (₦{voucher?.amountNaira.toLocaleString()})
            </span>
          </div>
          <a
            href={voucher?.whatsapp_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-4 bg-black dark:bg-[#25D366] hover:bg-gray-800 dark:hover:bg-[#1DA851] text-white dark:text-[#111B21] rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-transform"
          >
            <Send size={18} /> Auto-Redeem on WhatsApp
          </a>
          <a
            href="/"
            className="text-xs text-gray-400 dark:text-[#8696A0] hover:text-gray-900 dark:hover:text-white mt-5 underline font-medium flex items-center justify-center gap-1"
          >
            <ArrowLeft size={12} /> Return to Home
          </a>
        </div>
      </main>
    </div>
  );
}