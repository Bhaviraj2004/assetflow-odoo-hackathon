import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { ref, onValue, push, set } from "firebase/database";
import { rtdb } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function ResourceBooking() {
  const { userData } = useAuth();
  const [resources, setResources] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState("");
  
  const [bookings, setBookings] = useState([]);
  
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  
  const [conflictMessage, setConflictMessage] = useState("");

  useEffect(() => {
    // Fetch all assets (treating them as bookable resources for now)
    const unsub = onValue(ref(rtdb, 'assets'), (snapshot) => {
      const data = snapshot.val() || {};
      setResources(Object.entries(data).map(([id, val]) => ({ id, ...val })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (selectedResourceId && bookingDate) {
      // Fetch bookings for this resource on this day
      const unsub = onValue(ref(rtdb, 'bookings'), (snapshot) => {
        const data = snapshot.val() || {};
        const bks = Object.entries(data)
          .map(([id, val]) => ({ id, ...val }))
          .filter(b => b.resourceId === selectedResourceId && b.date === bookingDate);
        setBookings(bks);
      });
      return () => unsub();
    } else {
      setBookings([]);
    }
  }, [selectedResourceId, bookingDate]);

  // Check for conflicts whenever time changes
  useEffect(() => {
    setConflictMessage("");
    if (!startTime || !endTime || bookings.length === 0) return;
    
    const reqStart = parseTime(startTime);
    const reqEnd = parseTime(endTime);
    
    if (reqStart >= reqEnd) {
      setConflictMessage("End time must be after start time");
      return;
    }

    const hasConflict = bookings.some(b => {
      const bStart = parseTime(b.startTime);
      const bEnd = parseTime(b.endTime);
      // Overlap logic: Start of A < End of B AND End of A > Start of B
      return reqStart < bEnd && reqEnd > bStart;
    });

    if (hasConflict) {
      setConflictMessage("Requested slot conflicts with an existing booking.");
    }
  }, [startTime, endTime, bookings]);

  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(':');
    return parseInt(h) * 60 + parseInt(m);
  };

  const handleBook = async () => {
    if (conflictMessage) return;
    if (!selectedResourceId) return;
    
    const resource = resources.find(r => r.id === selectedResourceId);
    
    try {
      const newBookingRef = push(ref(rtdb, "bookings"));
      await set(newBookingRef, {
        resourceId: selectedResourceId,
        resourceName: resource.name,
        date: bookingDate,
        startTime,
        endTime,
        bookedBy: userData?.name || "Unknown",
        status: "Upcoming",
        createdAt: new Date().toISOString()
      });
      
      const newLogRef = push(ref(rtdb, "activityLogs"));
      await set(newLogRef, {
        action: "Booking Confirmed",
        entity: `${resource.name} on ${bookingDate} (${startTime}-${endTime})`,
        timestamp: new Date().toISOString()
      });

      alert("Resource booked successfully!");
    } catch (err) {
      console.error("Failed to book:", err);
      alert("Booking failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Resource Booking</h1>
        <p className="mt-1 text-sm md:text-base text-slate-500">Book conference rooms and shared resources.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="p-8 flex-1 overflow-y-auto">
          
          <div className="mb-8 flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Resource</label>
              <select 
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="block w-full py-2.5 px-3 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-slate-50"
              >
                <option value="">Select a resource...</option>
                {resources.map(r => (
                  <option key={r.id} value={r.id}>{r.tag} - {r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
              <input 
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="block w-full py-2.5 px-3 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-slate-50"
              />
            </div>
          </div>

          <div className="mb-8 border border-slate-200 rounded-lg p-6 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Schedule for {bookingDate}</h3>
            
            {bookings.length === 0 ? (
              <div className="text-slate-500 text-sm">No bookings for this date. Free all day!</div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="bg-blue-100 border border-blue-200 rounded p-3 flex items-center">
                    <Clock className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">
                      {b.startTime} - {b.endTime} : Booked by {b.bookedBy}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedResourceId && (
            <div className="bg-white p-6 border border-slate-200 rounded-xl mb-8">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">New Booking</h3>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="block w-full py-2 px-3 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
                  <input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="block w-full py-2 px-3 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border"
                  />
                </div>
              </div>
              
              {conflictMessage && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium text-red-800">{conflictMessage}</span>
                </div>
              )}

              <button 
                onClick={handleBook}
                disabled={!!conflictMessage || !startTime || !endTime}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  conflictMessage || !startTime || !endTime
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Confirm Booking
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
