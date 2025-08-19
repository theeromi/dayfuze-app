import { useState } from "react";
import { Header } from "@/components/Header";
import { DrawerNavigation } from "@/components/DrawerNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useTask } from "@/contexts/TaskContext";
import { updateProfile } from "firebase/auth";
import { useLocation } from "wouter";
import { User, Mail, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function Profile() {
  const { currentUser, handleLogout } = useAuth();
  const { tasks } = useTask();
  const [, setLocation] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [loading, setLoading] = useState(false);

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    try {
      const dueDate = task.dueDate.toDate();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today && !task.completed;
    } catch (error) {
      console.warn("Invalid dueDate for task:", task.id);
      return false;
    }
  });

  const handleUpdateProfile = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await updateProfile(currentUser, { displayName });
      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuClick={() => setDrawerOpen(true)}
        onProfileClick={() => setLocation("/profile")}
      />

      <DrawerNavigation
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <main className="pb-20">
        <section className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Profile</h1>
          <p className="text-gray-600">Manage your account and view statistics</p>
        </section>

        <section className="px-4 space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 bg-primary bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">
                    {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || "U"}
                  </span>
                </div>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      data-testid="input-display-name"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="flex-1"
                      data-testid="button-save-profile"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        setDisplayName(currentUser?.displayName || "");
                      }}
                      className="flex-1"
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700" data-testid="text-display-name">
                      {currentUser?.displayName || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700" data-testid="text-email">
                      {currentUser?.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      Member since {currentUser?.metadata.creationTime ? 
                        new Date(currentUser.metadata.creationTime).toLocaleDateString() : 
                        "Unknown"}
                    </span>
                  </div>
                  <Button
                    onClick={() => setEditing(true)}
                    variant="outline"
                    className="w-full"
                    data-testid="button-edit-profile"
                  >
                    Edit Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Task Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-accent-green" />
                  </div>
                  <div className="text-xl font-bold text-gray-800" data-testid="text-completed-count">
                    {completedTasks.length}
                  </div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-xl font-bold text-gray-800" data-testid="text-pending-count">
                    {pendingTasks.length}
                  </div>
                  <div className="text-xs text-gray-500">Pending</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-2">
                    <AlertCircle className="w-6 h-6 text-accent-red" />
                  </div>
                  <div className="text-xl font-bold text-gray-800" data-testid="text-overdue-count">
                    {overdueTasks.length}
                  </div>
                  <div className="text-xs text-gray-500">Overdue</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLogoutClick}
                variant="destructive"
                className="w-full"
                data-testid="button-logout-profile"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
