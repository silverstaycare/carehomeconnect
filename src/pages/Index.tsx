
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import HomePage from "./HomePage";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user is logged in and redirect appropriately
  useEffect(() => {
    // If user is already on the homepage (/) and trying to access profile,
    // redirect to /profile instead of causing a refresh loop
    const path = window.location.pathname;
    
    if (path === "/" && user) {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get("redirectTo");
      
      if (redirectTo === "profile") {
        navigate("/profile", { replace: true });
      }
    }
  }, [navigate, user]);

  // Render the homepage component
  return <HomePage />;
};

export default Index;
