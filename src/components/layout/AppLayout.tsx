import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, Search, List, DollarSign, Users, Info, Phone, Briefcase, Shield, FileText } from "lucide-react";

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

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
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <Users size={20} className="text-care-600" />
                For Families
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="/search" className="text-gray-600 hover:text-care-600 flex items-center gap-2">
                    <Search size={16} />
                    Search Homes
                  </a>
                </li>
                <li>
                  <a href="/how-it-works" className="text-gray-600 hover:text-care-600">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="/resources" className="text-gray-600 hover:text-care-600">
                    Resources
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-gray-600 hover:text-care-600">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <Home size={20} className="text-care-600" />
                For Home Owners
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="/owner/list-property" className="text-gray-600 hover:text-care-600 flex items-center gap-2">
                    <List size={16} />
                    List Your Property
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="text-gray-600 hover:text-care-600 flex items-center gap-2">
                    <DollarSign size={16} />
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/owner/resources" className="text-gray-600 hover:text-care-600">
                    Owner Resources
                  </a>
                </li>
                <li>
                  <a href="/owner/faq" className="text-gray-600 hover:text-care-600">
                    Owner FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <Info size={20} className="text-care-600" />
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="/about" className="text-gray-600 hover:text-care-600 flex items-center gap-2">
                    <Info size={16} />
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-600 hover:text-care-600 flex items-center gap-2">
                    <Phone size={16} />
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/careers" className="text-gray-600 hover:text-care-600 flex items-center gap-2">
                    <Briefcase size={16} />
                    Careers
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-gray-600 hover:text-care-600 flex items-center gap-2">
                    <Shield size={16} />
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-gray-600 hover:text-care-600 flex items-center gap-2">
                    <FileText size={16} />
                    Terms of Service
                  </a>
                </li>
              </ul>
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
