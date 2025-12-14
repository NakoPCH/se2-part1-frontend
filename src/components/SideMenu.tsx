import { Sun, Thermometer, Shield, Terminal, Tv, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SideMenuProps {
  children: React.ReactNode;
  onNavigate?: (path: string) => void;
}

const SideMenu = ({ children, onNavigate }: SideMenuProps) => {
  const menuItems = [
    { icon: Sun, label: "Lighting", path: "/lighting", disabled: false },
    { icon: Thermometer, label: "Temperature", path: "/temperature", disabled: true },
    { icon: Shield, label: "Security", path: "/security", disabled: true },
    { icon: Terminal, label: "Automations", path: "/automations", disabled: false },
    { icon: Tv, label: "Scenarios", path: "/scenarios", disabled: true },
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
                  disabled={item.disabled} 
                  onClick={() => onNavigate?.(item.path)}
                  data-cy={`nav-${item.label.toLowerCase()}-btn`} // <<<< ΝΕΑ ΠΡΟΣΘΗΚΗ
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-smooth",
                    item.disabled 
                      ? "text-foreground opacity-40 cursor-default" 
                      : "text-foreground hover:bg-muted/50 cursor-pointer"
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
              disabled={true} // <--- Disabled here
              onClick={() => onNavigate?.("/settings")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-smooth",
                // Pale & unclickable style applied manually here
                "text-foreground opacity-40 cursor-default"
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