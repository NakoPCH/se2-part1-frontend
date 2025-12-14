import { useState, useEffect } from "react";
import { Menu, User, Search, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import SideMenu from "@/components/SideMenu";
import AddDeviceForm from "./AddDeviceForm"; 
import { API_BASE_URL } from "@/config";

const AllDevices = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // State for Data
  const [allDevices, setAllDevices] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchDevices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lighting/devices`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setAllDevices(data);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const getCount = (categoryKey: string) => {
    return allDevices.filter((d) => d.category === categoryKey).length;
  };

  const handleDeviceAdded = () => {
    fetchDevices(); 
    setShowAddForm(false); 
  };

  // --- CONFIGURATION ---
  const deviceCategories = [
    { id: "lamps", name: "Lamps", icon: "💡", path: "/lighting", disabled: false },
    { id: "thermostats", name: "Thermostats", icon: "🌡️", path: "/temperature", disabled: true },
    { id: "acs", name: "ACs", icon: "❄️", path: "/temperature", disabled: true },
    { id: "cameras", name: "Cameras", icon: "📹", path: "/security", disabled: true },
  ];

  // Helper to find the correct icon for a search result
  const getIconForCategory = (catId: string) => {
    const category = deviceCategories.find(c => c.id === catId);
    return category ? category.icon : "📦";
  };

  // Helper to find where to navigate when clicking a search result
  const getPathForCategory = (catId: string) => {
    const category = deviceCategories.find(c => c.id === catId);
    return category ? category.path : "/devices";
  };

  // Filter logic
  const filteredDevices = allDevices.filter((device) =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background pb-20">
      <header className="gradient-header text-white p-4 flex items-center justify-between shadow-elevated">
        <SideMenu onNavigate={navigate}>
          <button className="p-2">
            <Menu className="w-6 h-6" />
          </button>
        </SideMenu>
        <h1 className="text-xl font-semibold">All devices</h1>
        <button className="p-2" onClick={() => navigate("/profile")}>
          <User className="w-6 h-6" />
        </button>
      </header>

      <div className="p-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Input
            placeholder="Search for smart devices"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-12 rounded-2xl bg-muted/80 border-0 text-base placeholder:text-muted-foreground/60"
          />
          <Menu className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>

        {/* --- CONDITIONAL RENDERING START --- */}
        <div className="space-y-3 pt-2">
          
          {/* CASE A: Search is EMPTY -> Show Categories */}
          {searchQuery.trim() === "" ? (
            deviceCategories.map((category) => {
              const count = getCount(category.id);
              return (
                <button
                  key={category.id}
                  disabled={category.disabled} // Disables interaction
                  onClick={() => !category.disabled && navigate(category.path)}
                  className={`w-full rounded-2xl p-4 shadow-card flex items-center justify-between transition-smooth 
                    ${category.disabled 
                        ? "bg-gray-50 opacity-60 cursor-default border border-dashed border-gray-200" 
                        : "bg-white hover:shadow-elevated"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-3xl ${category.disabled ? "grayscale opacity-50" : ""}`}>
                        {category.icon}
                    </span>
                    <div className="text-left">
                      <span className={`text-lg font-semibold block ${category.disabled ? "text-gray-400" : "text-foreground"}`}>
                        {category.name}
                      </span>
                      {/* FIX: Removed "Not installed" logic, now always shows count */}
                      <span className="text-sm text-muted-foreground">
                        {count === 0 ? "No devices" : `${count} device${count !== 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>
                  
                  {/* Hide chevron if disabled */}
                  {!category.disabled && <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </button>
              );
            })
          ) : (
            /* CASE B: Search has TEXT -> Show Matching Devices */
            <>
              {filteredDevices.map((device) => (
                <div
                  key={device.id}
                  onClick={() => 
                    navigate(getPathForCategory(device.category), { 
                      state: { targetRoom: device.location } 
                    })
                }
                  className="bg-white rounded-2xl p-4 shadow-card flex items-center justify-between transition-smooth hover:shadow-elevated cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">
                      {getIconForCategory(device.category)}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">{device.name}</h3>
                      <p className="text-sm text-muted-foreground">
                          {device.location} • {device.status ? "On" : "Off"}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90" />
                </div>
              ))}

              {filteredDevices.length === 0 && (
                <div className="text-center text-gray-400 py-10">
                  No devices found matching "{searchQuery}"
                </div>
              )}
            </>
          )}
        </div>
        {/* --- CONDITIONAL RENDERING END --- */}

        {/* Add Device Button */}
        {searchQuery.trim() === "" && (
          <div className="flex justify-center pt-8">
            {!showAddForm && (
              <Button
                className="bg-muted hover:bg-muted/80 text-foreground font-semibold px-8 h-14 rounded-2xl shadow-card transition-smooth"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add device
              </Button>
            )}
          </div>
        )}

        {showAddForm && searchQuery.trim() === "" && (
          <div className="mt-4">
            <AddDeviceForm 
              onDeviceAdded={handleDeviceAdded}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

      </div>

      <nav className="fixed bottom-0 left-0 right-0 gradient-header text-white shadow-elevated">
        <div className="flex items-center justify-around p-4">
          <button
            onClick={() => navigate("/home")}
            className="flex flex-col items-center gap-1 transition-smooth hover:scale-105 opacity-70"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xs font-medium">Homepage</span>
          </button>
          <button className="flex flex-col items-center gap-1 transition-smooth hover:scale-105">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
            <span className="text-xs font-medium">All devices</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AllDevices;