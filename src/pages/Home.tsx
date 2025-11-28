import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Home as HomeIcon, List, Menu, User, Lightbulb, Star, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import SideMenu from "@/components/SideMenu";

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"houses" | "rooms">("rooms");
  const [deviceStates, setDeviceStates] = useState({
    livingRoomLight: true,
  });

  const toggleDevice = (deviceId: string) => {
    setDeviceStates(prev => ({
      ...prev,
      [deviceId]: !prev[deviceId as keyof typeof prev],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background pb-20">
      {/* Header */}
      <header className="gradient-header text-white p-4 flex items-center justify-between shadow-elevated">
        <SideMenu onNavigate={navigate}>
          <button className="p-2">
            <Menu className="w-6 h-6" />
          </button>
        </SideMenu>
        <h1 className="text-xl font-semibold">Homepage</h1>
        <button className="p-2" onClick={() => navigate("/profile")}>
          <User className="w-6 h-6" />
        </button>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Houses/Rooms Toggle */}
        <div className="flex gap-3">
          <Button
            variant={activeTab === "houses" ? "default" : "secondary"}
            onClick={() => setActiveTab("houses")}
            className={cn(
              "flex-1 h-12 rounded-2xl font-semibold text-base transition-smooth",
              activeTab === "houses" 
                ? "bg-teal text-white shadow-card hover:bg-teal/90" 
                : "bg-white text-teal shadow-card hover:bg-white/80"
            )}
          >
            Houses
          </Button>
          <Button
            variant={activeTab === "rooms" ? "default" : "secondary"}
            onClick={() => setActiveTab("rooms")}
            className={cn(
              "flex-1 h-12 rounded-2xl font-semibold text-base transition-smooth",
              activeTab === "rooms" 
                ? "bg-teal text-white shadow-card hover:bg-teal/90" 
                : "bg-white text-teal shadow-card hover:bg-white/80"
            )}
          >
            Rooms
          </Button>
        </div>

        {/* Shortcuts Section */}
        <div>
          <h2 className="text-muted-foreground text-sm font-medium mb-3 px-1">
            Shortcuts
          </h2>
          
          <div className="space-y-3">
            {/* Device Shortcut Card */}
            <div className="bg-white rounded-2xl p-4 shadow-card flex items-center justify-between transition-smooth hover:shadow-elevated">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-start to-orange-mid rounded-xl flex items-center justify-center shadow-sm">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Living Room Light</h3>
                  <p className="text-sm text-muted-foreground">Brightness: 70</p>
                </div>
              </div>
              <Switch
                checked={deviceStates.livingRoomLight}
                onCheckedChange={() => toggleDevice("livingRoomLight")}
                className="data-[state=checked]:bg-teal"
              />
            </div>

            {/* Scenario Card */}
            <div className="bg-gradient-to-br from-white to-muted/30 rounded-2xl p-4 shadow-card transition-smooth hover:shadow-elevated">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal to-teal-light rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <Star className="w-6 h-6 text-white fill-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Scenario "Morning Wake-Up"
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Bedroom lights On<br />
                    adjust temperature at 22°C
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Homepage Button */}
        <div className="flex justify-center pt-4">
          <Button
            className="bg-teal hover:bg-teal/90 text-white font-semibold px-8 h-12 rounded-2xl shadow-card transition-smooth"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit homepage
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 gradient-header text-white shadow-elevated">
        <div className="flex items-center justify-around p-4">
          <button className="flex flex-col items-center gap-1 transition-smooth hover:scale-105">
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Homepage</span>
          </button>
          <button
            onClick={() => navigate("/devices")}
            className="flex flex-col items-center gap-1 transition-smooth hover:scale-105 opacity-70"
          >
            <List className="w-6 h-6" />
            <span className="text-xs font-medium">All devices</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Home;
