import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";

interface AddAutomationFormProps {
    initialData?: any; 
    onSuccess: () => void;
    onCancel: () => void;
}

const AddAutomationForm: React.FC<AddAutomationFormProps> = ({ initialData, onSuccess, onCancel }) => {
    // 1. Initialize state with initialData if it exists (Edit Mode), otherwise defaults (Add Mode)
    const [name, setName] = useState(initialData?.name || "");
    const [time, setTime] = useState(initialData?.time || "07:00");
    const [action, setAction] = useState(initialData?.action || "turn_on");
    const [selectedDevices, setSelectedDevices] = useState<string[]>(initialData?.selectedDevices || []);

    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch devices for the checklist
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/lighting/devices`)
            .then((res) => res.json())
            .then((data) => setDevices(data))
            .catch(() => setError("Failed to load devices"));
    }, []);

    const toggleDevice = (deviceId: string) => {
        setSelectedDevices((prev) =>
            prev.includes(deviceId)
                ? prev.filter((id) => id !== deviceId) // Untick
                : [...prev, deviceId] // Tick
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = initialData
                ? `${API_BASE_URL}/api/automations/${initialData.id}`
                : `${API_BASE_URL}/api/automations`;

            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, time, selectedDevices, action }),
            });

            if (!res.ok) throw new Error("Failed to save");

            // 2. ADD SUCCESS TOAST HERE
            toast.success(initialData ? "Rule updated successfully" : "New rule created");

            onSuccess();
        } catch (err) {
            // 3. ADD ERROR TOAST HERE
            toast.error("Failed to save automation");
            setError("Error saving rule");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    {/* 3. Dynamic Title */}
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? "Edit Automation" : "Add New Automation"}
                    </h2>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Rule Name</label>
                        <input
                            required
                            data-testid="rule-name-input" // <--- TEST ID
                            className="w-full p-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-teal/50 outline-none"
                            placeholder="e.g. Evening Light Routine"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Trigger (Time) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Trigger (Time)</label>
                        <input
                            type="time"
                            required
                            data-testid="rule-time-input" // <--- TEST ID
                            className="w-full p-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-teal/50 outline-none"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>

                    {/* Devices (Checkbox List) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Select Devices</label>
                        <div className="max-h-40 overflow-y-auto border rounded-xl p-2 bg-gray-50 space-y-2">
                            {devices.map((dev) => (
                                <div
                                    key={dev.id}
                                    data-testid={`device-item-${dev.id}`} // <--- TEST ID (Dynamic)
                                    onClick={() => toggleDevice(dev.id)}
                                    className={`p-3 rounded-lg flex items-center justify-between cursor-pointer border transition-all ${selectedDevices.includes(dev.id)
                                            ? "bg-teal/10 border-teal"
                                            : "bg-white border-transparent hover:border-gray-300"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{dev.category === 'lamps' ? '💡' : '📱'}</span>
                                        <span className="font-medium text-sm">{dev.name}</span>
                                    </div>
                                    {selectedDevices.includes(dev.id) && <Check className="w-4 h-4 text-teal" />}
                                </div>
                            ))}
                            {devices.length === 0 && <p className="text-sm text-gray-400 p-2">No devices found.</p>}
                        </div>
                    </div>

                    {/* Action */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Action</label>
                        <select
                            data-testid="rule-action-select" // <--- TEST ID
                            className="w-full p-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-teal/50 outline-none"
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                        >
                            <option value="turn_on">Turn On</option>
                            <option value="turn_off">Turn Off</option>
                        </select>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        data-testid="submit-rule-btn" // <--- TEST ID
                        className="w-full bg-teal hover:bg-teal/90 text-white font-semibold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2 mt-4"
                    >
                        {/* 4. Dynamic Button Text */}
                        {loading ? "Saving..." : (initialData ? "Save Changes" : "Add Automation")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddAutomationForm;