import { useState, useEffect } from "react";
import { Clock, AlertCircle, Plus, Trash2 } from "lucide-react";
import { ref, onValue, push, set, remove } from "firebase/database";
import { rtdb } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";

export default function ResourceBooking() {
  const { userData, user } = useAuth();
  const [resources, setResources] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState("");
  
  const [bookings, setBookings] = useState([]);
  
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  
  const [conflictMessage, setConflictMessage] = useState("");
  
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);
  const [newResourceName, setNewResourceName] = useState("");
  const [newResourceType, setNewResourceType] = useState("Room");

  useEffect(() => {
    // Fetch all shared resources
    const unsub = onValue(ref(rtdb, 'sharedResources'), (snapshot) => {
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
          .map(([id, val]) => {
            let bookedBy = val.bookedBy;
            if (!bookedBy || bookedBy === "Unknown") bookedBy = "Admin";
            return { id, ...val, bookedBy };
          })
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
        bookedBy: userData?.name || user?.email?.split('@')[0] || "Admin",
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

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      const newRef = push(ref(rtdb, 'sharedResources'));
      await set(newRef, {
        name: newResourceName,
        type: newResourceType,
        createdAt: new Date().toISOString()
      });
      setIsAddResourceModalOpen(false);
      setNewResourceName("");
      setNewResourceType("Room");
    } catch (err) {
      console.error("Failed to add resource", err);
    }
  };

  const handleDeleteResource = async () => {
    if (!selectedResourceId) return;
    if (window.confirm("Are you sure you want to delete this resource? All its bookings will be lost.")) {
      try {
        await remove(ref(rtdb, `sharedResources/${selectedResourceId}`));
        setSelectedResourceId("");
        alert("Resource deleted successfully!");
      } catch (err) {
        console.error("Failed to delete resource", err);
        alert("Error deleting resource");
      }
    }
  };

  // Timeline UI Helper
  const calculateTimelinePosition = (startTime, endTime) => {
    const startMins = parseTime(startTime);
    const endMins = parseTime(endTime);
    const dayStartMins = 8 * 60; // Timeline starts at 8:00 AM
    const dayEndMins = 18 * 60; // Timeline ends at 6:00 PM
    const totalDayMins = dayEndMins - dayStartMins;
    
    // Clamp values for UI rendering
    const clampedStart = Math.max(dayStartMins, Math.min(startMins, dayEndMins));
    const clampedEnd = Math.max(dayStartMins, Math.min(endMins, dayEndMins));
    
    const leftPercent = ((clampedStart - dayStartMins) / totalDayMins) * 100;
    const widthPercent = ((clampedEnd - clampedStart) / totalDayMins) * 100;
    
    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Resource Booking</h1>
          <p className="mt-1 text-sm md:text-base text-slate-500">Book conference rooms, cars, and shared equipment.</p>
        </div>
        {userData?.role === "Admin" && (
          <Button onClick={() => setIsAddResourceModalOpen(true)} icon={Plus}>
            Add Resource
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="p-8 flex-1 overflow-y-auto">
          
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Resource</label>
              <div className="flex gap-2 items-center">
                <select 
                  value={selectedResourceId}
                  onChange={(e) => setSelectedResourceId(e.target.value)}
                  className="block w-full py-2.5 px-3 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-slate-50"
                >
                  <option value="">Select a resource...</option>
                  {resources.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                  ))}
                </select>
                {userData?.role === "Admin" && selectedResourceId && (
                  <button 
                    onClick={handleDeleteResource}
                    title="Delete Resource"
                    className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-transparent hover:border-red-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="sm:w-48">
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
              <div className="space-y-4">
                {/* Visual Timeline (8 AM to 6 PM) */}
                <div className="pt-6 pb-2 hidden sm:block">
                  <div className="relative h-12 bg-slate-200 rounded-lg border border-slate-300">
                    {/* Hour Markers */}
                    {[8, 10, 12, 14, 16, 18].map((hour) => (
                      <div key={hour} className="absolute top-0 bottom-0 w-px bg-slate-300 z-0" style={{ left: `${((hour - 8) / 10) * 100}%` }}>
                        <span className="absolute text-[11px] font-medium text-slate-500 -translate-x-1/2 -top-6">{hour}:00</span>
                      </div>
                    ))}
                    
                    {bookings.map(b => (
                      <div 
                        key={b.id} 
                        title={`${b.startTime} - ${b.endTime} by ${b.bookedBy}`}
                        className="absolute top-1 bottom-1 bg-blue-500 rounded border border-blue-600 text-[11px] text-white px-2 shadow-sm cursor-pointer hover:bg-blue-600 transition-colors flex items-center justify-center z-10 overflow-hidden"
                        style={calculateTimelinePosition(b.startTime, b.endTime)}
                      >
                        <div className="truncate w-full text-center">
                          <span className="font-semibold">{b.startTime}</span> - <span className="opacity-90">{b.bookedBy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {bookings.map(b => (
                    <div key={b.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">
                          {b.startTime} - {b.endTime}
                        </span>
                      </div>
                      <span className="text-sm text-slate-600">Booked by <span className="font-semibold text-slate-900">{b.bookedBy}</span></span>
                    </div>
                  ))}
                </div>
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

      {/* Add Resource Modal */}
      <Modal isOpen={isAddResourceModalOpen} onClose={() => setIsAddResourceModalOpen(false)} title="Add Shared Resource">
        <form onSubmit={handleAddResource} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resource Name</label>
            <input 
              type="text" 
              required 
              value={newResourceName} 
              onChange={e => setNewResourceName(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              placeholder="e.g. Conference Room A, Company Car" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select 
              value={newResourceType} 
              onChange={e => setNewResourceType(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="Room">Meeting Room</option>
              <option value="Vehicle">Vehicle / Car</option>
              <option value="Equipment">Equipment / Projector</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddResourceModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Resource</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
