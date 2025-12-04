import { Sun, Thermometer, Shield, Terminal, Tv, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SideMenuProps {
  children: React.ReactNode;
  onNavigate?: (path: string) => void;
}

const SideMenu = ({ children, onNavigate }: SideMenuProps) => {
  const menuItems = [
    { icon: Sun, label: "lighting", path: "/lighting" },
    { icon: Thermometer, label: "temperature", path: "/temperature" },
    { icon: Shield, label: "security", path: "/security" },
    { icon: Terminal, label: "automations", path: "/automations" },
    { icon: Tv, label: "scenarios", path: "/scenarios" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 bg-white">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h2 className="text-muted-foreground text-sm font-medium mb-4">Menu</h2>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => onNavigate?.(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-foreground",
                    "hover:bg-muted/50 transition-smooth text-left"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-base">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          <div className="mt-auto p-6 border-t">
            <button
              onClick={() => onNavigate?.("/settings")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-foreground",
                "hover:bg-muted/50 transition-smooth text-left"
              )}
            >
              <Settings className="w-5 h-5" />
              <span className="text-base">settings</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SideMenu;
