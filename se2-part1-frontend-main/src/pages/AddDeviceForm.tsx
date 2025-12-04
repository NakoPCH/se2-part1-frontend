import React, { useState } from "react";

interface AddDeviceFormProps {
  onDeviceAdded?: (device: any) => void;
  onCancel?: () => void;
}

const AddDeviceForm: React.FC<AddDeviceFormProps> = ({ onDeviceAdded, onCancel }) => {
  const [form, setForm] = useState({ name: "", type: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5001/api/lighting/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Σφάλμα προσθήκης συσκευής");
      else {
        setForm({ name: "", type: "", location: "" });
        if (onDeviceAdded) onDeviceAdded(data);
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16, padding: 12, background: "#fff", borderRadius: 7, boxShadow: "0 2px 8px #eee" }}>
      <input
        name="name"
        required
        placeholder="Όνομα"
        value={form.name}
        onChange={handleChange}
        style={{ marginBottom: 8, width: "100%", padding: 8 }}
      />
      <input
        name="type"
        required
        placeholder="Τύπος (π.χ. bulb)"
        value={form.type}
        onChange={handleChange}
        style={{ marginBottom: 8, width: "100%", padding: 8 }}
      />
      <input
        name="location"
        required
        placeholder="Τοποθεσία"
        value={form.location}
        onChange={handleChange}
        style={{ marginBottom: 8, width: "100%", padding: 8 }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={loading} style={{ padding: 8 }}>
          {loading ? "Προσθήκη..." : "Προσθήκη συσκευής"}
        </button>
        {onCancel &&
          <button type="button" onClick={onCancel} style={{padding: 8}}>
            Άκυρο
          </button>
        }
      </div>
      {error && <div style={{ color: "red", marginTop: 4 }}>{error}</div>}
    </form>
  );
};

export default AddDeviceForm;