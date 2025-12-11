import React, { useState, useEffect } from "react";
import { Menu, User, Search, Sun, Trash2, Plus } from "lucide-react"; 
import { Button } from "@/components/ui/button"; 
import { toast } from "sonner"; 
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom"; 
import SideMenu from "@/components/SideMenu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddDeviceForm from "./AddDeviceForm"; 

const Lighting = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  
  // CHANGED: Default to "All Rooms"
  const [selectedRoom, setSelectedRoom] = useState("All Rooms");
  
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [lights, setLights] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // 1. Fetch Rooms
  useEffect(() => {
    fetch("http://localhost:5050/api/lighting/rooms")
      .then(res => res.json())
      .then(data => {
        setAvailableRooms(data);

        // LOGIC: Check if we came from "All Devices" with a specific target room
        const incomingRoom = locationState.state?.targetRoom;
        
        if (incomingRoom && data.includes(incomingRoom)) {
          setSelectedRoom(incomingRoom);
        } else {
          // CHANGED: Default to "All Rooms" if no specific room requested
          setSelectedRoom("All Rooms");
        }
      })
      .catch(err => console.error("Error loading rooms", err));
  }, []);

  // 2. Fetch Lights
  const fetchLights = async () => {
    try {
      const response = await fetch("http://localhost:5050/api/lighting/devices");
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setLights(data);
    } catch (error) {
      console.error("Error loading lights:", error);
      toast.error("Failed to load lights"); 
    }
  };

  useEffect(() => {
    fetchLights();
  }, []);

  // 3. Update Device
  const updateDeviceState = async (deviceId: string, updates: any) => {
    setLights((prev) =>
      prev.map((l) => (l.id === deviceId ? { ...l, ...updates } : l))
    );

    try {
      await fetch(`http://localhost:5050/api/lighting/devices/${deviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error("Error updating device:", error);
      toast.error("Failed to update device"); 
      fetchLights(); 
    }
  };

  // 4. Delete Device
  const deleteDevice = async (deviceId: string) => {
    if (!confirm("Are you sure you want to delete this device?")) return;
    
    setLights((prev) => prev.filter(l => l.id !== deviceId));
    
    try {
      const res = await fetch(`http://localhost:5050/api/lighting/devices/${deviceId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Device deleted successfully"); 

    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete device"); 
      fetchLights(); 
    }
  };

  const handleDeviceAdded = () => {
    fetchLights();
    setShowAddForm(false);
    toast.success("New light added successfully"); 
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background pb-20">
      <header className="gradient-header text-white p-4 flex items-center justify-between shadow-elevated">
        <SideMenu onNavigate={navigate}>
          <button className="p-2">
            <Menu className="w-6 h-6" />
          </button>
        </SideMenu>
        <h1 className="text-xl font-semibold">lighting</h1>
        <button className="p-2" onClick={() => navigate("/profile")}>
          <User className="w-6 h-6" />
        </button>
      </header>

      <div className="p-6 space-y-6">
        <div className="relative">
          <Input
            placeholder="Search for smart lamp"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-12 rounded-2xl bg-muted/80 border-0 text-base placeholder:text-muted-foreground/60"
          />
          <Menu className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>

        {/* Room Selector */}
        <div className="grid grid-cols-1 gap-3">
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="h-14 rounded-2xl bg-teal/20 border-0 text-foreground font-medium">
              <SelectValue placeholder="Select room" />
            </SelectTrigger>
            <SelectContent>
              {/* NEW: All Rooms Option */}
              <SelectItem value="All Rooms">All Rooms</SelectItem>
              {availableRooms.map((room) => (
                <SelectItem key={room} value={room}>{room}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Device List */}
        <div className="space-y-3 pt-2">
          {lights
            .filter(
              (light) =>
                light.category === "lamps" &&
                // NEW LOGIC: If "All Rooms" is selected, ignore location check
                (selectedRoom === "All Rooms" || light.location === selectedRoom) && 
                light.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((light) => (
              <div
                key={light.id}
                className="bg-white rounded-2xl p-4 shadow-card flex flex-col gap-4 transition-smooth hover:shadow-elevated"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="text-3xl transition-all duration-500"
                      style={{
                        filter: (light.status && light.brightness > 0) ? "none" : "grayscale(100%) opacity(0.3)",
                        transform: (light.status && light.brightness > 0) ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      💡
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{light.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {/* Display Room Name if in "All Rooms" mode for clarity */}
                        {selectedRoom === "All Rooms" && <span className="font-medium text-teal">{light.location} • </span>}
                        {light.status ? `Brightness: ${light.brightness}%` : "Off"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={light.status === true || light.status === "active"}
                      onCheckedChange={(checked) =>
                        updateDeviceState(light.id, { status: checked })
                      }
                      className="data-[state=checked]:bg-teal"
                    />
                    <button 
                      onClick={() => deleteDevice(light.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {light.status && (
                  <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                    <Sun className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={light.brightness || 0}
                      onChange={(e) => {
                        const newVal = parseInt(e.target.value);
                        setLights((prev) =>
                          prev.map((l) => l.id === light.id ? { ...l, brightness: newVal } : l)
                        );
                      }}
                      onMouseUp={(e) => updateDeviceState(light.id, { brightness: parseInt(e.currentTarget.value) })}
                      onTouchEnd={(e) => updateDeviceState(light.id, { brightness: parseInt(e.currentTarget.value) })}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-teal"
                    />
                    <span className="text-xs font-medium w-8 text-right">
                      {light.brightness}%
                    </span>
                  </div>
                )}
              </div>
            ))}
            
            {lights.filter(l => l.category === "lamps" && (selectedRoom === "All Rooms" || l.location === selectedRoom)).length === 0 && (
              <div className="text-center text-gray-400 py-4">
                No lamps found {selectedRoom !== "All Rooms" ? `in ${selectedRoom}` : ""}.
              </div>
            )}
        </div>

        {/* Add Lamp Button */}
        <div className="flex justify-center pt-8">
          {!showAddForm && (
            <Button
              className="bg-muted hover:bg-muted/80 text-foreground font-semibold px-8 h-14 rounded-2xl shadow-card transition-smooth"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Lamp
            </Button>
          )}
        </div>

        {showAddForm && (
          <div className="mt-4">
            <AddDeviceForm 
              forcedCategory="lamps"
              // SAFETY: If "All Rooms" is selected, default to the first real room available
              defaultRoom={selectedRoom === "All Rooms" ? availableRooms[0] : selectedRoom}
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
          <button
            onClick={() => navigate("/devices")}
            className="flex flex-col items-center gap-1 transition-smooth hover:scale-105"
          >
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

export default Lighting;