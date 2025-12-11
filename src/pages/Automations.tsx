import React, { useState, useEffect } from "react";
import { Menu, User, Plus, Clock, Trash2, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import SideMenu from "@/components/SideMenu";
import AddAutomationForm from "./AddAutomationForm";
import BASE_URL from "../services/api";
import { toast } from "sonner";

const Automations = () => {
    const navigate = useNavigate();
    const [automations, setAutomations] = useState<any[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);

    // NEW: State to track which rule is being edited
    const [editingRule, setEditingRule] = useState<any>(null);

    const fetchAutomations = async () => {
        try {
            const res = await fetch("http://localhost:5050/api/automations");
            const data = await res.json();
            setAutomations(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAutomations();
    }, []);

    const toggleAutomation = async (id: string, currentStatus: boolean) => {
        // 1. Optimistic UI Update (Change the switch visually immediately)
        setAutomations(prev => prev.map(a => a.id === id ? { ...a, isActive: !currentStatus } : a));

        try {
            // 2. Send PUT request to the specific ID
            // FIX: Added `/${id}` to the URL
            await fetch(`http://localhost:5050/api/automations/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus })
            });
        } catch (error) {
            console.error("Failed to toggle rule:", error);
            // Optional: Revert change if it fails
        }
    };

    const deleteAutomation = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        // Keep the confirm dialog for safety, or remove it if you prefer instant delete
        if (!confirm("Delete this rule?")) return;

        // Optimistic Delete (Remove from UI immediately)
        setAutomations(prev => prev.filter(a => a.id !== id));

        try {
            await fetch(`http://localhost:5050/api/automations/${id}`, { method: "DELETE" });

            // 2. ADD SUCCESS TOAST
            toast.success("Automation rule deleted");

        } catch (error) {
            // 3. ADD ERROR TOAST (and maybe revert the list)
            toast.error("Failed to delete rule");
            fetchAutomations(); // Refresh list to bring it back if it failed
        }
    };

    // NEW: Handle opening the form in "Add" mode
    const handleAddNew = () => {
        setEditingRule(null); // Clear editing state
        setShowAddForm(true);
    };

    // NEW: Handle opening the form in "Edit" mode
    const handleEditClick = (rule: any) => {
        setEditingRule(rule); // Load rule data
        setShowAddForm(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background pb-20">
            {/* Header */}
            <header className="gradient-header text-white p-4 flex items-center justify-between shadow-elevated">
                <SideMenu onNavigate={navigate}>
                    <button className="p-2"><Menu className="w-6 h-6" /></button>
                </SideMenu>
                <h1 className="text-xl font-semibold">Automation</h1>
                <button className="p-2" onClick={() => navigate("/profile")}>
                    <User className="w-6 h-6" />
                </button>
            </header>

            <div className="p-6 space-y-6">

                {/* Header Section */}
                <div className="bg-teal text-white rounded-2xl p-6 shadow-card relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-1">Automations</h2>
                        <p className="opacity-90">Manage your smart routines</p>
                    </div>
                    <Settings className="absolute right-[-20px] bottom-[-20px] w-32 h-32 opacity-10 rotate-12" />
                </div>

                {/* List of Rules */}
                <div className="space-y-4">
                    {automations.map((rule) => (
                        <div
                            key={rule.id}
                            onClick={() => handleEditClick(rule)} // NEW: Click card to edit
                            className="bg-white p-4 rounded-2xl shadow-card flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-muted p-3 rounded-xl text-teal">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{rule.name}</h3>
                                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded-md">At {rule.time}</span>
                                        <span className="bg-gray-100 px-2 py-0.5 rounded-md">
                                            {rule.action === 'turn_on' ? 'Turn On' : 'Turn Off'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={rule.isActive}
                                    // FIX 1: Pass only the ID and Status (no event needed here)
                                    onCheckedChange={() => toggleAutomation(rule.id, rule.isActive)}

                                    // FIX 2: Handle the "Don't open edit form" logic here on the click
                                    onClick={(e) => e.stopPropagation()}

                                    className="data-[state=checked]:bg-teal"
                                />
                                <button
                                    onClick={(e) => deleteAutomation(rule.id, e)} // Updated to pass event
                                    className="text-gray-400 hover:text-red-500 p-2"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {automations.length === 0 && (
                        <div className="text-center text-gray-400 py-10">No automations yet. Create one!</div>
                    )}
                </div>

                {/* Add Button */}
                <div className="flex justify-center pt-4">
                    <button
                        onClick={handleAddNew} // Updated to use new handler
                        className="bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 py-4 rounded-2xl shadow-card flex items-center gap-2 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add automation
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showAddForm && (
                <AddAutomationForm
                    initialData={editingRule} // NEW: Pass the data to the form
                    onSuccess={() => { setShowAddForm(false); fetchAutomations(); }}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {/* Footer Nav */}
            <nav className="fixed bottom-0 left-0 right-0 gradient-header text-white shadow-elevated">
                <div className="flex items-center justify-around p-4">
                    <button onClick={() => navigate("/home")} className="flex flex-col items-center gap-1 opacity-70">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
                        <span className="text-xs">Homepage</span>
                    </button>
                    <button onClick={() => navigate("/devices")} className="flex flex-col items-center gap-1 opacity-70">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" /></svg>
                        <span className="text-xs">All devices</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Automations;