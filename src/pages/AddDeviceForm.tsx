import React, { useState, useEffect } from "react";

interface AddDeviceFormProps {
  onDeviceAdded?: (device: any) => void;
  onCancel?: () => void;
  forcedCategory?: string;
  defaultRoom?: string; // <--- NEW PROP
}

const AddDeviceForm: React.FC<AddDeviceFormProps> = ({ 
  onDeviceAdded, 
  onCancel, 
  forcedCategory,
  defaultRoom // Destructure it
}) => {
  const [form, setForm] = useState({ 
    name: "", 
    category: forcedCategory || "lamps", 
    // Start empty, we fill this in the useEffect below
    location: "" 
  });
  
  const [rooms, setRooms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5050/api/lighting/rooms")
      .then(res => res.json())
      .then(data => {
        setRooms(data);
        
        // LOGIC:
        // 1. If 'defaultRoom' was passed, use that.
        // 2. Otherwise, default to the first room in the list.
        const startingRoom = defaultRoom || (data.length > 0 ? data[0] : "");
        
        setForm(prev => ({ ...prev, location: startingRoom }));
      })
      .catch(err => console.error("Failed to fetch rooms", err));
  }, [defaultRoom]); // Re-run if defaultRoom changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5050/api/lighting/devices", {
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
          // Reset location to the same default
          location: defaultRoom || (rooms.length > 0 ? rooms[0] : "")
        });
        if (onDeviceAdded) onDeviceAdded(data);
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginBottom: 16,
        padding: 12,
        background: "#fff",
        borderRadius: 7,
        boxShadow: "0 2px 8px #eee",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}
    >
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
        {forcedCategory ? `Add New ${forcedCategory.slice(0, -1)}` : "Add New Device"}
      </h3>
      
      <input
        name="name"
        required
        placeholder="Device Name"
        value={form.name}
        onChange={handleChange}
        style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
      />

      {!forcedCategory && (
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", background: "white" }}
        >
          <option value="lamps">Lamps 💡</option>
          <option value="thermostats">Thermostats 🌡️</option>
          <option value="acs">AC Units ❄️</option>
          <option value="cameras">Cameras 📷</option>
        </select>
      )}

      <select
        name="location"
        value={form.location}
        onChange={handleChange}
        style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", background: "white" }}
      >
        {rooms.map(room => (
          <option key={room} value={room}>{room}</option>
        ))}
        {rooms.length === 0 && <option value="">Loading rooms...</option>}
      </select>

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button 
          type="submit" 
          disabled={loading} 
          style={{ padding: "8px 16px", background: "#0F172A", color: "white", borderRadius: 4, border: "none", cursor: "pointer" }}
        >
          {loading ? "Adding..." : "Add Device"}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: "8px 16px", background: "#E2E8F0", color: "black", borderRadius: 4, border: "none", cursor: "pointer" }}
          >
            Cancel
          </button>
        )}
      </div>
      
      {error && <div style={{ color: "red", fontSize: "0.9rem" }}>{error}</div>}
    </form>
  );
};

export default AddDeviceForm;