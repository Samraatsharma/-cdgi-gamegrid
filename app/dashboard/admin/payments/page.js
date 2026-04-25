"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '../../../../components/SideNav';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../lib/auth-context';

const CONFIDENCE_COLORS = { high: 'bg-green-500/10 text-green-400 border-green-500/20', medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', low: 'bg-red-500/10 text-red-400 border-red-500/20' };

export default function PaymentVerification() {
  const router = useRouter();
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [previewImage, setPreviewImage] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') { router.push('/login'); return; }
    fetchRegistrations();
  }, [user, filter]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const url = filter ? `/api/registrations?payment_status=${filter}` : '/api/registrations';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setRegistrations(data.registrations.filter(r => r.entry_fee > 0));
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleAction = async (regId, status) => {
    setProcessing(regId);
    try {
      const res = await fetch('/api/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: regId, payment_status: status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Payment ${status === 'verified' ? 'approved' : 'rejected'}`);
        setRegistrations(prev => prev.filter(r => r.id !== regId));
      } else { toast.error(data.error); }
    } catch { toast.error('Network error'); }
    finally { setProcessing(null); }
  };

  if (!user || loading) return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen font-body">
      <SideNav role="admin" />
      <main className="ml-24 pt-12 pb-24 px-8 max-w-7xl mx-auto">
        <h1 className="font-headline font-black italic text-4xl uppercase tracking-tighter mb-2">
          PAYMENT <span className="text-primary">VERIFICATION</span>
        </h1>
        <p className="text-on-surface-variant text-sm mb-8">Review and verify student payment submissions</p>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { value: 'pending', label: 'Pending', count: registrations.length },
            { value: 'verified', label: 'Verified' },
            { value: 'rejected', label: 'Rejected' },
            { value: '', label: 'All' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-5 py-2.5 rounded-xl font-headline font-bold uppercase text-[10px] tracking-widest transition-all ${
                filter === tab.value ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {registrations.length === 0 ? (
          <div className="bg-surface-container/30 p-20 rounded-3xl border-2 border-dashed border-outline-variant/20 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4">task_alt</span>
            <p className="text-on-surface-variant font-headline italic font-bold text-xl uppercase">No {filter || ''} payments to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map(reg => (
              <div key={reg.id} className="bg-surface-container-high/60 backdrop-blur-xl rounded-2xl p-6 border border-outline-variant/10 shadow-xl">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-headline font-black italic text-lg">{reg.student_name}</h3>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{reg.student_email} • {reg.branch} Y{reg.year}</p>
                      </div>
                      {reg.payment_confidence && reg.payment_confidence !== 'none' && (
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${CONFIDENCE_COLORS[reg.payment_confidence] || ''}`}>
                          {reg.payment_confidence} confidence
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-[11px]">
                      <div><span className="text-on-surface-variant/50">Event:</span> <strong>{reg.event_name}</strong></div>
                      <div><span className="text-on-surface-variant/50">Fee:</span> <strong className="text-primary">₹{reg.entry_fee}</strong></div>
                      {reg.payment_amount && <div><span className="text-on-surface-variant/50">Paid:</span> <strong className={reg.payment_amount === reg.entry_fee ? 'text-green-400' : 'text-yellow-400'}>₹{reg.payment_amount}</strong></div>}
                      {reg.transaction_id && <div><span className="text-on-surface-variant/50">Txn ID:</span> <strong className="font-mono">{reg.transaction_id}</strong></div>}
                    </div>
                  </div>

                  {/* Screenshot Preview */}
                  {reg.payment_screenshot_url && (
                    <div className="w-32 h-24 rounded-xl overflow-hidden border border-outline-variant/20 cursor-pointer hover:border-primary/40 transition-all flex-shrink-0"
                      onClick={() => setPreviewImage(reg.payment_screenshot_url)}>
                      <img src={reg.payment_screenshot_url} alt="Payment proof" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Actions */}
                  {filter === 'pending' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAction(reg.id, 'verified')}
                        disabled={processing === reg.id}
                        className="px-5 py-3 bg-green-500 text-white font-headline font-black italic uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 transition-all disabled:opacity-50"
                      >
                        {processing === reg.id ? '...' : 'APPROVE'}
                      </button>
                      <button
                        onClick={() => handleAction(reg.id, 'rejected')}
                        disabled={processing === reg.id}
                        className="px-5 py-3 bg-error text-white font-headline font-black italic uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 transition-all disabled:opacity-50"
                      >
                        REJECT
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-8" onClick={() => setPreviewImage(null)}>
            <img src={previewImage} alt="Payment screenshot" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
            <button onClick={() => setPreviewImage(null)} className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
