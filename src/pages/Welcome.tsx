import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import homieaseLogo from "@/assets/homiease-logo.png";

const Welcome = () => {
  return (
    <div className="gradient-welcome min-h-screen flex flex-col items-center justify-between p-8 relative overflow-hidden">
      {/* Decorative circles matching mockup */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal rounded-full opacity-80 -translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-orange-mid rounded-full opacity-60 translate-x-1/4 -translate-y-1/4" />
      
      <div className="flex-1 flex flex-col items-center justify-center z-10 space-y-12">
        {/* Logo */}
        <div className="w-40 h-40 bg-white rounded-3xl shadow-elevated flex items-center justify-center mb-4 p-2.5">
          <img src={homieaseLogo} alt="HomiEase Logo" className="w-full h-full object-contain" />
        </div>
        
        <h1 className="text-6xl font-bold text-white tracking-wider">
          HOMIEASE
        </h1>
        
        <div className="space-y-4 w-full max-w-xs">
          <Link to="/login">
            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full bg-white/95 hover:bg-white text-teal font-semibold text-lg h-14 rounded-2xl shadow-elevated"
              data-cy="welcome-login-btn" // <<<< ΠΡΟΣΘΗΚΗ data-cy
            >
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full bg-transparent hover:bg-white/20 text-white border-2 border-white/80 font-semibold text-lg h-14 rounded-2xl"
            >
              Sign up
            </Button>
          </Link>
        </div>
      </div>
      
      <p className="text-white/90 text-xl italic z-10 pb-8">
        Smart Living, Simplified
      </p>
    </div>
  );
};

export default Welcome;
