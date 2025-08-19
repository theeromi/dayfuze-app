import { X, BarChart3, CheckSquare, Calendar, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";

interface DrawerNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DrawerNavigation({ isOpen, onClose }: DrawerNavigationProps) {
  const { currentUser, handleLogout } = useAuth();
  const [location] = useLocation();

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" data-testid="drawer-overlay">
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50">
        <div className="p-6 bg-primary text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <div className="font-semibold text-lg" data-testid="text-username">
                  {currentUser?.displayName || "User"}
                </div>
                <div className="text-sm text-blue-100" data-testid="text-email">
                  {currentUser?.email}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20"
              data-testid="button-close-drawer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <nav className="py-4">
          <Link href="/">
            <Button
              variant="ghost"
              className={`w-full justify-start px-6 py-4 text-left ${
                location === "/" ? "bg-gray-50 border-r-4 border-primary text-primary" : "text-gray-600"
              }`}
              onClick={onClose}
              data-testid="link-dashboard"
            >
              <BarChart3 className="w-5 h-5 mr-4" />
              <span className="font-medium">Dashboard</span>
            </Button>
          </Link>
          
          <Link href="/tasks">
            <Button
              variant="ghost"
              className={`w-full justify-start px-6 py-4 text-left ${
                location === "/tasks" ? "bg-gray-50 border-r-4 border-primary text-primary" : "text-gray-600"
              }`}
              onClick={onClose}
              data-testid="link-tasks"
            >
              <CheckSquare className="w-5 h-5 mr-4" />
              <span className="font-medium">Tasks</span>
            </Button>
          </Link>
          
          <Link href="/timeline">
            <Button
              variant="ghost"
              className={`w-full justify-start px-6 py-4 text-left ${
                location === "/timeline" ? "bg-gray-50 border-r-4 border-primary text-primary" : "text-gray-600"
              }`}
              onClick={onClose}
              data-testid="link-timeline"
            >
              <Calendar className="w-5 h-5 mr-4" />
              <span className="font-medium">Timeline</span>
            </Button>
          </Link>
          
          <Link href="/profile">
            <Button
              variant="ghost"
              className={`w-full justify-start px-6 py-4 text-left ${
                location === "/profile" ? "bg-gray-50 border-r-4 border-primary text-primary" : "text-gray-600"
              }`}
              onClick={onClose}
              data-testid="link-profile"
            >
              <Settings className="w-5 h-5 mr-4" />
              <span className="font-medium">Profile</span>
            </Button>
          </Link>
          
          <div className="border-t mt-4 pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start px-6 py-4 text-left text-red-600 hover:bg-red-50"
              onClick={handleLogoutClick}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5 mr-4" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
}
