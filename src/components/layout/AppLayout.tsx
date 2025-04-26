
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, Search, CalendarCheck } from "lucide-react";
import { useEffect } from "react";

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Function to handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Function to handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2" onClick={() => navigate("/")} role="button">
            <Home className="h-6 w-6 text-care-600" />
            <h1 className="text-xl font-bold text-care-800">Silver Stay</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="hidden md:flex" 
              onClick={() => navigate("/search")}
            >
              <Search className="h-4 w-4 mr-2" />
              Find homes
            </Button>
            
            {user ? (
              <>
                <Button 
                  variant="ghost"
                  onClick={() => navigate(user.role === "owner" ? "/owner/dashboard" : "/family/dashboard")}
                >
                  Dashboard
                </Button>
                {user.role === "owner" && (
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/owner/list-property")}
                  >
                    List your property
                  </Button>
                )}
                <Button onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button onClick={() => navigate("/register")}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Silver Stay</h3>
              <p className="text-gray-600">
                Connecting families with quality residential care homes for their loved ones.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/" className="text-care-600 hover:underline">Home</a></li>
                <li><a href="/search" className="text-care-600 hover:underline">Search</a></li>
                <li><a href="/login" className="text-care-600 hover:underline">Login</a></li>
                <li><a href="/register" className="text-care-600 hover:underline">Sign Up</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <p className="text-gray-600">
                123 Care Street<br />
                Suite 456<br />
                Careington, CA 90210<br />
                info@silverstay.com
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500">
              © {new Date().getFullYear()} Silver Stay. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
