import { useState } from "react";
import { Menu, User, Search, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import SideMenu from "@/components/SideMenu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AllDevices = () => {
  const navigate = useNavigate();
  const [selectedHouse, setSelectedHouse] = useState("house-1");
  const [selectedRoom, setSelectedRoom] = useState("living-room");
  const [searchQuery, setSearchQuery] = useState("");

  const deviceCategories = [
    { id: "lamps", name: "Lamps", icon: "💡", path: "/lighting" },
    { id: "thermostats", name: "Thermostats", icon: "🌡️", path: "/temperature" },
    { id: "acs", name: "ACs", icon: "❄️", path: "/temperature" },
    { id: "cameras", name: "Cameras", icon: "📹", path: "/security" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background pb-20">
      {/* Header */}
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

      {/* Content */}
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

        {/* House and Room Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <Select value={selectedHouse} onValueChange={setSelectedHouse}>
            <SelectTrigger className="h-14 rounded-2xl bg-teal/20 border-0 text-foreground font-medium">
              <SelectValue placeholder="Select house" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="house-1">"House - 1"</SelectItem>
              <SelectItem value="house-2">"House - 2"</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="h-14 rounded-2xl bg-teal/20 border-0 text-foreground font-medium">
              <SelectValue placeholder="Select room" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="living-room">Living Room</SelectItem>
              <SelectItem value="bedroom">Bedroom</SelectItem>
              <SelectItem value="kitchen">Kitchen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Device Categories */}
        <div className="space-y-3 pt-2">
          {deviceCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => navigate(category.path)}
              className="w-full bg-white rounded-2xl p-4 shadow-card flex items-center justify-between transition-smooth hover:shadow-elevated"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{category.icon}</span>
                <span className="text-lg font-semibold text-foreground">
                  {category.name}
                </span>
              </div>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Add Device Button */}
        <div className="flex justify-center pt-8">
          <Button
            className="bg-muted hover:bg-muted/80 text-foreground font-semibold px-8 h-14 rounded-2xl shadow-card transition-smooth"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add device
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
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
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
            <span className="text-xs font-medium">All devices</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AllDevices;
