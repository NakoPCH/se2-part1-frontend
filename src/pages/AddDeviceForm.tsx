import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { API_BASE_URL } from "@/config";

// 1. Ορίζουμε το Interface για τη συσκευή (Device)
// Περιλαμβάνει τα πεδία που στέλνεις (name, category, location) και το id που συνήθως επιστρέφει η βάση.
export interface Device {
  id: string;
  name: string;
  category: string;
  location: string;
  // Μπορείς να προσθέσεις κι άλλα πεδία αν επιστρέφει κι άλλα το backend (π.χ. isOn, status)
}

interface AddDeviceFormProps {
  // 2. Αντικαθιστούμε το 'any' με το 'Device'
  onDeviceAdded?: (device: Device) => void;
  onCancel?: () => void;
  forcedCategory?: string;
  defaultRoom?: string;
}

const AddDeviceForm: React.FC<AddDeviceFormProps> = ({
  onDeviceAdded,
  onCancel,
  forcedCategory,
  defaultRoom
}) => {
  const [form, setForm] = useState({
    name: "",
    category: forcedCategory || "lamps",
    location: ""
  });

  const [rooms, setRooms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/lighting/rooms`)
      .then(res => res.json())
      .then(data => {
        setRooms(data);
        // Default Room Logic
        const startingRoom = defaultRoom || (data.length > 0 ? data[0] : "");
        setForm(prev => ({ ...prev, location: startingRoom }));
      })
      .catch(err => console.error("Failed to fetch rooms", err));
  }, [defaultRoom]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/lighting/devices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error adding device");
      } else {
        // Reset form
        setForm({
          name: "",
          category: forcedCategory || "lamps",
          location: defaultRoom || (rooms.length > 0 ? rooms[0] : "")
        });
        
        // Εδώ καλούμε το callback με τα δεδομένα που πλέον ξέρουμε ότι είναι τύπου Device
        if (onDeviceAdded) onDeviceAdded(data);
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 capitalize">
            {forcedCategory ? `Add New ${forcedCategory.slice(0, -1)}` : "Add New Device"}
          </h2>
          {onCancel && (
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Device Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Device Name</label>
            <input
              name="name"
              required
              placeholder="e.g. Living Room Lamp"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-teal/50 outline-none transition-all"
            />
          </div>

          {/* Category Selector (Hidden if forcedCategory is active) */}
          {!forcedCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-teal/50 outline-none transition-all"
              >
                <option value="lamps">Lamps 💡</option>
                <option value="thermostats">Thermostats 🌡️</option>
                <option value="acs">AC Units ❄️</option>
                <option value="cameras">Cameras 📷</option>
              </select>
            </div>
          )}

          {/* Location Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-teal/50 outline-none transition-all"
            >
              {rooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
              {rooms.length === 0 && <option value="">Loading rooms...</option>}
            </select>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal hover:bg-teal/90 text-white font-semibold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2 mt-4"
          >
            {loading ? "Adding Device..." : "Add Device"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDeviceForm;