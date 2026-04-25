"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '../../../../components/SideNav';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { useAuth } from '../../../../lib/auth-context';

export default function ReportsDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [logistics, setLogistics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab State: 'time' or 'event'
  const [activeTab, setActiveTab] = useState('time');

  // Time-Based Filter State
  const [timeFilter, setTimeFilter] = useState('7'); // '7', '30', 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Event-Specific Filter State
  const [selectedEventId, setSelectedEventId] = useState('');
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [eventTeams, setEventTeams] = useState([]);
  const [eventLoading, setEventLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'coordinator') { router.push('/dashboard/coordinator/reports'); return; }
    if (user.role !== 'admin') { router.push('/dashboard/student'); return; }
    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      const [eventsRes, logRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/logistics')
      ]);
      const eventsData = await eventsRes.json();
      const logData = await logRes.json();

      if (eventsData.success) {
        setEvents(eventsData.events);
      }
      if (logData.success) {
        setLogistics(logData.logistics);
      }
    } catch {
      toast.error('Failed to load base data for reports.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async (eventId) => {
    if (!eventId) return;
    setEventLoading(true);
    try {
      const [regRes, teamRes] = await Promise.all([
        fetch(`/api/registrations?event_id=${eventId}`),
        fetch(`/api/teams?event_id=${eventId}`)
      ]);
      const regData = await regRes.json();
      const teamData = await teamRes.json();

      if (regData.success) setEventRegistrations(regData.registrations);
      if (teamData.success) setEventTeams(teamData.team);
    } catch {
      toast.error('Failed to load event specific data.');
    } finally {
      setEventLoading(false);
    }
  };

  const updatePaymentStatus = async (id, status) => {
    try {
      const res = await fetch('/api/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, payment_status: status })
      });
      if (res.ok) {
        toast.success(`Payment status updated to ${status}`);
        fetchEventDetails(selectedEventId);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update payment status');
      }
    } catch {
      toast.error('Network error while updating payment');
    }
  };

  useEffect(() => {
    if (activeTab === 'event' && selectedEventId) {
      fetchEventDetails(selectedEventId);
    }
  }, [selectedEventId, activeTab]);

  // Derived Time-Based Data
  const getFilteredEvents = () => {
    const now = new Date();
    return events.filter(ev => {
      const evDate = new Date(ev.date);
      if (timeFilter === '7') {
        const diff = (now - evDate) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
      } else if (timeFilter === '30') {
        const diff = (now - evDate) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30;
      } else if (timeFilter === 'custom') {
        if (!customStart || !customEnd) return true;
        return evDate >= new Date(customStart) && evDate <= new Date(customEnd);
      }
      return true;
    });
  };

  const filteredEvents = getFilteredEvents();

  // Export Logic: Time-Based
  const exportTimeReportCSV = () => {
    const data = filteredEvents.map(e => {
      return {
        'Event Name': e.name,
        'Date': e.date,
        'Sport': e.sport,
        'Format': e.event_format || 'N/A',
        'Coordinator': e.coordinator_name || 'N/A',
        'Venue': e.venue || 'N/A',
        'Fee': e.entry_fee > 0 ? `Rs. ${e.entry_fee}` : 'Free',
        'Total Participants': e.registered_count || 0
      };
    });
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Time_Report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Downloaded');
  };

  const exportTimeReportPDF = () => {
    const doc = new jsPDF();
    doc.text(`CDGI Sports - Time Report (${timeFilter === 'custom' ? 'Custom' : 'Last ' + timeFilter + ' Days'})`, 14, 15);

    const tableColumn = ["Event Name", "Date", "Sport", "Format", "Coordinator", "Venue", "Fee"];
    const tableRows = [];

    filteredEvents.forEach(e => {
      tableRows.push([
        e.name,
        e.date,
        e.sport,
        e.event_format || 'N/A',
        e.coordinator_name || 'N/A',
        e.venue || 'N/A',
        e.entry_fee > 0 ? `Rs. ${e.entry_fee}` : 'Free'
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`Time_Report_${new Date().getTime()}.pdf`);
    toast.success('PDF Downloaded');
  };

  // Export Logic: Event-Specific
  const exportEventReportPDF = () => {
    const ev = events.find(e => e.id.toString() === selectedEventId);
    if (!ev) return;
    const logic = logistics.find(l => l.event_id === ev.id);

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Event Report: ${ev.name}`, 14, 20);

    doc.setFontSize(11);
    doc.text(`Sport Type: ${ev.sport}`, 14, 30);
    doc.text(`Format: ${ev.event_format || 'N/A'} - ${ev.gender_category || 'Open'}`, 14, 38);
    doc.text(`Date & Time: ${ev.date}`, 14, 46);
    doc.text(`Venue: ${ev.venue || 'TBD'}`, 14, 54);
    doc.text(`Entry Fee: ${ev.entry_fee > 0 ? 'Rs. ' + ev.entry_fee : 'Free'}`, 14, 62);
    doc.text(`Prize Pool: ${ev.prize_pool || 'N/A'}`, 14, 70);
    doc.text(`Coordinator: ${ev.coordinator_name || 'N/A'} (${ev.coordinator_contact || 'N/A'})`, 14, 78);
    doc.text(`Total Participants: ${ev.registered_count || 0} / ${ev.max_participants}`, 14, 86);

    // Check if team data is populated
    if (eventTeams.length > 0) {
      doc.text(`Teams / Selected Participants: ${eventTeams.length}`, 14, 94);
    }

    doc.text(`Completed: ${ev.status === 'completed' ? 'Yes' : 'No'}`, 14, 110);

    autoTable(doc, {
      head: [['ID', 'Name/Event ID', 'Registered At', 'Payment Status']],
      body: eventRegistrations.map(r => [
        r.id,
        r.student_id,
        new Date(r.registered_at).toLocaleString(),
        r.payment_status?.toUpperCase() || 'N/A'
      ]),
      startY: 120,
    });

    doc.save(`Event_Report_${ev.id}.pdf`);
    toast.success('Event PDF Downloaded');
  };

  if (loading || !user) return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen font-body overflow-x-hidden">
      <SideNav role="admin" />
      <main className="ml-20 min-h-screen p-8 lg:p-12 relative">
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-1 rounded-full bg-primary animate-ping" />
            <p className="text-[10px] font-headline font-black italic uppercase tracking-[0.4em] text-primary">Intelligence Hub</p>
          </div>
          <h1 className="font-headline font-black italic text-5xl tracking-tighter uppercase leading-tight mt-4">
            REPORT <span className="text-primary">GENERATOR</span>
          </h1>
        </header>

        {/* Tab Selection */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('time')}
            className={`px-8 py-3 rounded-2xl font-headline font-black italic uppercase tracking-widest text-sm transition-all ${activeTab === 'time' ? 'bg-primary text-on-primary shadow-lg scale-105' : 'bg-surface-container hover:bg-surface-container-high'}`}
          >
            Time-Based Report
          </button>
          <button
            onClick={() => setActiveTab('event')}
            className={`px-8 py-3 rounded-2xl font-headline font-black italic uppercase tracking-widest text-sm transition-all ${activeTab === 'event' ? 'bg-secondary text-on-secondary shadow-lg scale-105' : 'bg-surface-container hover:bg-surface-container-high'}`}
          >
            Event-Specific Report
          </button>
        </div>

        {/* Time-Based UI */}
        {activeTab === 'time' && (
          <div className="bg-surface-container-high/60 backdrop-blur-3xl rounded-3xl p-8 border border-outline-variant/10 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-6 mb-8 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Date Range</label>
                <select
                  className="w-full bg-surface-container-highest px-4 py-4 rounded-xl outline-none font-bold text-sm uppercase"
                  value={timeFilter}
                  onChange={e => setTimeFilter(e.target.value)}
                >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {timeFilter === 'custom' && (
                <>
                  <div className="flex-1">
                    <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Start Date</label>
                    <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="w-full bg-surface-container-highest px-4 py-4 rounded-xl outline-none font-bold text-sm uppercase" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2 block">End Date</label>
                    <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="w-full bg-surface-container-highest px-4 py-4 rounded-xl outline-none font-bold text-sm uppercase" />
                  </div>
                </>
              )}

              <div className="flex gap-4">
                <button onClick={exportTimeReportPDF} className="px-6 py-4 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-black italic uppercase tracking-widest text-xs flex items-center gap-2 transition-all">
                  <span className="material-symbols-outlined text-base">picture_as_pdf</span> PDF
                </button>
                <button onClick={exportTimeReportCSV} className="px-6 py-4 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white rounded-xl font-black italic uppercase tracking-widest text-xs flex items-center gap-2 transition-all">
                  <span className="material-symbols-outlined text-base">table_view</span> CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-outline-variant/10">
              <table className="w-full text-left bg-surface-container text-sm">
                <thead className="bg-surface-container-highest text-[10px] font-headline font-black uppercase tracking-widest">
                  <tr>
                    <th className="p-4">Event Name</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Sport</th>
                    <th className="p-4">Format</th>
                    <th className="p-4">Coordinator</th>
                    <th className="p-4">Venue</th>
                    <th className="p-4">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredEvents.map(e => {
                    return (
                      <tr key={e.id} className="hover:bg-surface-container-high transition-colors">
                        <td className="p-4 font-bold">{e.name}</td>
                        <td className="p-4 opacity-80">{e.date}</td>
                        <td className="p-4"><span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">{e.sport}</span></td>
                        <td className="p-4"><span className="text-secondary/80 text-[10px] uppercase font-bold tracking-widest">{e.event_format || 'N/A'}</span></td>
                        <td className="p-4 opacity-80">{e.coordinator_name || '-'}</td>
                        <td className="p-4 opacity-80">{e.venue || '-'}</td>
                        <td className="p-4 font-bold text-primary">{e.entry_fee > 0 ? `₹${e.entry_fee}` : 'Free'}</td>
                      </tr>
                    );
                  })}
                  {filteredEvents.length === 0 && (
                    <tr><td colSpan="5" className="p-8 text-center opacity-50 italic">No events found in this range.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Event-Specific UI */}
        {activeTab === 'event' && (
          <div className="bg-surface-container-high/60 backdrop-blur-3xl rounded-3xl p-8 border border-outline-variant/10 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-6 mb-8 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Select Event</label>
                <select
                  className="w-full bg-surface-container-highest px-4 py-4 rounded-xl outline-none font-bold text-sm uppercase"
                  value={selectedEventId}
                  onChange={e => setSelectedEventId(e.target.value)}
                >
                  <option value="">-- Choose an Event --</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name} ({ev.sport})</option>)}
                </select>
              </div>

              <button
                onClick={exportEventReportPDF}
                disabled={!selectedEventId}
                className="px-8 py-4 bg-primary text-on-primary disabled:opacity-50 hover:scale-105 rounded-xl font-black italic uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-lg"
              >
                <span className="material-symbols-outlined text-base">download</span> GET PDF REPORT
              </button>
            </div>

            {eventLoading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : selectedEventId && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant/10">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Total Registrations</p>
                    <p className="text-2xl font-black italic">{eventRegistrations.length}</p>
                  </div>
                  <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant/10">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Selected Teams/Participants</p>
                    <p className="text-2xl font-black italic">{eventTeams.length}</p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-outline-variant/10">
                  <table className="w-full text-left bg-surface-container text-sm">
                    <thead className="bg-surface-container-highest text-[10px] font-headline font-black uppercase tracking-widest">
                      <tr>
                        <th className="p-4">Reg ID</th>
                        <th className="p-4">Student ID</th>
                        <th className="p-4">Registered At</th>
                        <th className="p-4">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {eventRegistrations.map(r => (
                        <tr key={r.id} className="hover:bg-surface-container-high transition-colors">
                          <td className="p-4 font-bold">#{r.id}</td>
                          <td className="p-4 text-secondary">STU-{r.student_id}</td>
                          <td className="p-4 opacity-80">{new Date(r.registered_at).toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold inline-block mb-2 ${r.payment_status === 'verified' ? 'bg-green-500/20 text-green-500' : r.payment_status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-zinc-500/20 text-zinc-400'}`}>
                              {r.payment_status || 'N/A'}
                            </span>
                            {r.payment_screenshot_url && (
                              <div className="flex flex-wrap gap-2 items-center">
                                <a href={r.payment_screenshot_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-400 hover:text-blue-300 underline underline-offset-2">View Screenshot</a>
                                {r.payment_status === 'pending' && (
                                  <>
                                    <button onClick={() => updatePaymentStatus(r.id, 'verified')} className="text-[10px] font-bold text-green-400 hover:text-green-300 border border-green-500/30 px-2 py-1 rounded hover:bg-green-500/10 transition-colors">Verify</button>
                                    <button onClick={() => updatePaymentStatus(r.id, 'rejected')} className="text-[10px] font-bold text-red-400 hover:text-red-300 border border-red-500/30 px-2 py-1 rounded hover:bg-red-500/10 transition-colors">Reject</button>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {eventRegistrations.length === 0 && (
                        <tr><td colSpan="4" className="p-8 text-center opacity-50 italic">No registrations found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
