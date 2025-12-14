/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Menu, User, Lightbulb, Power, Edit, X, Sun, Clock, Check, CloudRain, Wind } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SideMenu from "@/components/SideMenu";
import { toast } from "sonner";
import AddAutomationForm from "./AddAutomationForm";
import { shortcutsAPI, automationsAPI } from "../services/api";

const Home = () => {
  const navigate = useNavigate();

  // Data State
  const [lights, setLights] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [shortcuts, setShortcuts] = useState<any[]>([]);

  // Live Clock Logic
  const [currentTime, setCurrentTime] = useState(new Date());

  // NEW: Weather & User State
  const [username, setUsername] = useState("User");
  const [weather, setWeather] = useState<{ temp: number, code: number } | null>(null);

  // UI State
  const [isEditingShortcuts, setIsEditingShortcuts] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);
  const [showAutoForm, setShowAutoForm] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  // 1. Fetch All Data
  const fetchAllData = async () => {
    try {
      // Fetch Lights
      const lightsRes = await fetch("http://localhost:5050/api/lighting/devices");
      const lightsData = await lightsRes.json();
      setLights(lightsData);

      // Fetch Automations
      const autoData = await automationsAPI.getAutomations();
      setAutomations(autoData);

      // Fetch Shortcuts
      const shortcutsData = await shortcutsAPI.getShortcuts();
      setShortcuts(shortcutsData);

    } catch (error) {
      console.error("Error loading homepage data:", error);
    }
  };

  // NEW: Fetch Weather & Username
  useEffect(() => {
    // 1. Get Username
    const storedName = localStorage.getItem("username");
    if (storedName) setUsername(storedName);

    // 2. Fetch Weather (Thessaloniki Coordinates)
    // You can change latitude/longitude to any city
    fetch("https://api.open-meteo.com/v1/forecast?latitude=40.64&longitude=22.94&current_weather=true")
      .then(res => res.json())
      .then(data => {
        setWeather({
          temp: Math.round(data.current_weather.temperature),
          code: data.current_weather.weathercode
        });
      })
      .catch(err => console.error("Weather fetch failed", err));

    fetchAllData();
  }, []);

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  // --- ACTIONS: LIGHTS ---
  const updateLight = async (id: string, updates: any) => {
    setLights(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    try {
      await fetch(`http://localhost:5050/api/lighting/devices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      toast.error("Failed to update light");
      fetchAllData();
    }
  };

  // Master Off Logic for all lights
  const handleMasterOff = async () => {
    // 1. Filter only the lights that are currently ON
    const activeLights = lights.filter(l => l.status === true || l.status === "active");

    if (activeLights.length === 0) {
      toast("All lights are already off!");
      return;
    }

    // 2. Optimistic Update (Turn them off visually instantly)
    setLights(prev => prev.map(l => ({ ...l, status: false })));
    toast.success(`Turning off ${activeLights.length} lights...`);

    // 3. Send requests to backend for each light
    try {
      // We use Promise.all to send all requests in parallel
      await Promise.all(
        activeLights.map(light =>
          fetch(`http://localhost:5050/api/lighting/devices/${light.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: false }),
          })
        )
      );
    } catch (error) {
      console.error("Master off failed", error);
      toast.error("Some lights might not have turned off");
      fetchAllData(); // Re-fetch to ensure state is correct
    }
  };

  // --- ACTIONS: AUTOMATIONS ---
  const toggleAutomation = async (id: string, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, isActive: !currentStatus } : a));
    try {
      await automationsAPI.updateAutomation(id, { isActive: !currentStatus });
    } catch (err) {
      toast.error("Failed to toggle automation");
      fetchAllData();
    }
  };

  const handleEditAutomation = (rule: any) => {
    setEditingAutomation(rule);
    setShowAutoForm(true);
  };

  // --- ACTIONS: SHORTCUTS ---
  const toggleShortcutSelection = (item: any, type: 'device' | 'automation') => {
    setShortcuts(prev => {
      const exists = prev.find(s => s.id === item.id);
      if (exists) {
        return prev.filter(s => s.id !== item.id);
      } else {
        return [...prev, { id: item.id, type }];
      }
    });
  };

  const saveShortcuts = async () => {
    setLoadingSave(true);
    try {
      await shortcutsAPI.saveShortcuts(shortcuts);
      setIsEditingShortcuts(false);
      toast.success("Homepage updated");
    } catch (err) {
      toast.error("Failed to save shortcuts");
    } finally {
      setLoadingSave(false);
    }
  };

  // --- HELPER: GREETING ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Good Night";
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getDate = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Helper to format time (e.g., "23:05")
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Change to true if you want AM/PM
    });
  };



  // Calculations for Chips
  const activeLightsCount = lights.filter(l => l.status === true || l.status === "active").length;
  const activeRulesCount = automations.filter(a => a.isActive).length;


  // --- RENDER HELPERS ---
  // Render a Light Card 
  const renderLightCard = (light: any) => (
    <div key={light.id} className="bg-white rounded-2xl p-4 shadow-card flex flex-col gap-4 transition-smooth hover:shadow-elevated">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="text-3xl transition-all duration-500"
            style={{
              filter: (light.status && light.brightness > 0) ? "none" : "grayscale(100%) opacity(0.3)",
              transform: (light.status && light.brightness > 0) ? "scale(1.1)" : "scale(1)"
            }}
          >
            
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{light.name}</h3>
            <p className="text-sm text-muted-foreground">
              {/* NEW: Added Location Label here */}
              <span className="font-medium text-teal">{light.location} • </span>
              {light.status ? `Brightness: ${light.brightness}%` : "Off"}
            </p>
          </div>
        </div>
        <Switch
          checked={light.status === true || light.status === "active"}
          onCheckedChange={(checked) => updateLight(light.id, { status: checked })}
          className="data-[state=checked]:bg-teal"
        />
      </div>

      {(light.status === true || light.status === "active") && (
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
          <Sun className="w-4 h-4 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="100"
            value={light.brightness || 0}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setLights(prev => prev.map(l => l.id === light.id ? { ...l, brightness: val } : l));
            }}
            onMouseUp={(e) => updateLight(light.id, { brightness: parseInt(e.currentTarget.value) })}
            onTouchEnd={(e) => updateLight(light.id, { brightness: parseInt(e.currentTarget.value) })}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-teal"
          />
        </div>
      )}
    </div>
  );

  const renderAutoCard = (rule: any) => (
    <div
      key={rule.id}
      onClick={() => handleEditAutomation(rule)}
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
      <Switch
        checked={rule.isActive}
        onCheckedChange={() => toggleAutomation(rule.id, rule.isActive)}
        onClick={(e) => e.stopPropagation()}
        className="data-[state=checked]:bg-teal"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background pb-20">

      {/* Header */}
      <header className="gradient-header text-white p-4 flex items-center justify-between shadow-elevated">
        <SideMenu onNavigate={navigate}>
          <button className="p-2"><Menu className="w-6 h-6" /></button>
        </SideMenu>
        <h1 className="text-xl font-semibold">Homepage</h1>
        <button className="p-2" onClick={() => navigate("/profile")}>
          <User className="w-6 h-6" />
        </button>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">

        {/* 1. SMART GREETING SECTION */}
        <div className="mb-2">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            {getGreeting()}, <span className="text-teal capitalize">{username}</span>
          </h2>

          {/* UPDATED DATE & TIME ROW */}
          <p className="text-muted-foreground font-medium text-sm mt-1 flex items-center gap-2">
            {getDate()}
            <span className="w-1 h-1 rounded-full bg-gray-300" /> {/* Little dot separator */}
            <span className="text-teal font-bold tracking-wide font-mono text-base">
              {formatTime(currentTime)}
            </span>
          </p>
        </div>

        {/* 2. STATUS CHIPS ROW */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {/* Chip 1: Lights (With Master Off) */}
          <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 min-w-fit transition-all hover:shadow-md">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeLightsCount > 0 ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-400'}`}>
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Lights</p>
              <p className="text-sm font-bold text-gray-800">{activeLightsCount} On</p>
            </div>

            {/* NEW: The Panic Button (Only shows if lights are ON) */}
            {activeLightsCount > 0 && (
              <button
                onClick={handleMasterOff}
                className="ml-2 w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all active:scale-90"
                title="Turn all off"
              >
                <Power className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Chip 2: Automations */}
          <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 min-w-fit">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeRulesCount > 0 ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}`}>
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Rules</p>
              <p className="text-sm font-bold text-gray-800">{activeRulesCount} Active</p>
            </div>
          </div>

          {/* Chip 3: REAL WEATHER (New!) */}
          <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 min-w-fit">
            <div className="w-8 h-8 rounded-full bg-teal/10 text-teal flex items-center justify-center">
              {weather ? (weather.code > 3 ? <CloudRain className="w-4 h-4" /> : <Sun className="w-4 h-4" />) : <Wind className="w-4 h-4 animate-pulse" />}
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Weather</p>
              <p className="text-sm font-bold text-gray-800">
                {weather ? `${weather.temp}°C` : "Loading..."}
              </p>
            </div>
          </div>
        </div>

        {/* Shortcuts List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-muted-foreground text-sm font-medium px-1">Your Shortcuts</h2>
          </div>

          <div className="space-y-4">
            {shortcuts.map((shortcut) => {
              if (shortcut.type === 'device') {
                const light = lights.find(l => l.id === shortcut.id);
                return light ? renderLightCard(light) : null;
              } else {
                const rule = automations.find(a => a.id === shortcut.id);
                return rule ? renderAutoCard(rule) : null;
              }
            })}

            {shortcuts.length === 0 && (
              <div className="text-center py-10 text-gray-400 bg-white/50 rounded-2xl border border-dashed">
                No shortcuts yet. Click "Edit homepage" to add some!
              </div>
            )}
          </div>
        </div>

        {/* Edit Homepage Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => setIsEditingShortcuts(true)}
            className="bg-teal hover:bg-teal/90 text-white font-semibold px-8 h-12 rounded-2xl shadow-card transition-smooth"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit homepage
          </Button>
        </div>
      </div>

      {/* --- MODAL: SELECT SHORTCUTS --- */}
      {isEditingShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl max-h-[85vh] flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Manage Shortcuts</h3>
              <button onClick={() => setIsEditingShortcuts(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-6 pr-1">
              {/* Section: Lights */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Select Lights</label>
                <div className="max-h-60 overflow-y-auto border rounded-xl p-2 bg-gray-50 space-y-2">
                  {lights.filter(l => l.category === 'lamps').map(light => {
                    const isSelected = shortcuts.some(s => s.id === light.id);
                    return (
                      <div
                        key={light.id}
                        onClick={() => toggleShortcutSelection(light, 'device')}
                        className={`p-3 rounded-lg flex items-center justify-between cursor-pointer border transition-all ${isSelected
                          ? "bg-teal/10 border-teal"
                          : "bg-white border-transparent hover:border-gray-300"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">💡</span>
                          <span className="font-medium text-sm">{light.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-teal" />}
                      </div>
                    );
                  })}
                  {lights.length === 0 && <p className="text-sm text-gray-400 p-2">No lights found.</p>}
                </div>
              </div>

              {/* Section: Automations */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Select Automations</label>
                <div className="max-h-60 overflow-y-auto border rounded-xl p-2 bg-gray-50 space-y-2">
                  {automations.map(rule => {
                    const isSelected = shortcuts.some(s => s.id === rule.id);
                    return (
                      <div
                        key={rule.id}
                        onClick={() => toggleShortcutSelection(rule, 'automation')}
                        className={`p-3 rounded-lg flex items-center justify-between cursor-pointer border transition-all ${isSelected
                          ? "bg-teal/10 border-teal"
                          : "bg-white border-transparent hover:border-gray-300"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">⏰</span>
                          <span className="font-medium text-sm">{rule.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-teal" />}
                      </div>
                    );
                  })}
                  {automations.length === 0 && <p className="text-sm text-gray-400 p-2">No automations found.</p>}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t">
              <button
                onClick={saveShortcuts}
                disabled={loadingSave}
                className="w-full bg-teal hover:bg-teal/90 text-white font-semibold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2"
              >
                {loadingSave ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAutoForm && (
        <AddAutomationForm
          initialData={editingAutomation}
          onSuccess={() => { setShowAutoForm(false); fetchAllData(); }}
          onCancel={() => setShowAutoForm(false)}
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 gradient-header text-white shadow-elevated">
        <div className="flex items-center justify-around p-4">
          <button className="flex flex-col items-center gap-1 transition-smooth hover:scale-105">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
            <span className="text-xs font-medium">Homepage</span>
          </button>
          <button
            onClick={() => navigate("/devices")}
            className="flex flex-col items-center gap-1 transition-smooth hover:scale-105 opacity-70"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" /></svg>
            <span className="text-xs font-medium">All devices</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Home;