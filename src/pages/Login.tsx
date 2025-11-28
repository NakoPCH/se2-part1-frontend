import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authAPI } from "@/services/api";
import { toast } from "sonner";
import homieaseLogo from "@/assets/homiease-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Call real backend API - POST /auth/login
      await authAPI.login(username, password);
      toast.success("Login successful!");
      navigate("/home");
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-welcome flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <img
            src={homieaseLogo}
            alt="HomiEase Logo"
            className="w-32 h-32 mx-auto"
          />
          <h1 className="text-4xl font-bold text-white">Welcome Back</h1>
          <p className="text-white/80">Sign in to control your smart home</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-white/10 backdrop-blur-lg rounded-3xl p-6">
          <div>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-14 bg-white/20 border-white/30 text-white placeholder:text-white/60"
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 bg-white/20 border-white/30 text-white placeholder:text-white/60"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-white text-primary hover:bg-white/90 font-semibold text-lg rounded-2xl"
          >
            {loading ? "Signing in..." : "Log in"}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate("/signup")}
            className="text-white/80 hover:text-white transition-smooth"
          >
            Don't have an account? <span className="font-semibold">Sign up</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
