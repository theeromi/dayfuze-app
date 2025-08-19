import React from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, Eye, Lock, Database, Mail, Smartphone } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Page Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how DayFuse protects and handles your personal information.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Privacy Sections */}
          <div className="space-y-6">
            
            {/* Information Collection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Information We Collect</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Account Information</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    When you create a DayFuse account, we collect your name, email address, and authentication credentials through Firebase Auth.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Task Data</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    We store your tasks, descriptions, due dates, priorities, and completion status to provide our productivity services.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Usage Information</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    We may collect information about how you use DayFuse, including feature usage and performance metrics.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>How We Use Your Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Provide and maintain DayFuse productivity services</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Send task reminders and notifications (with your permission)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Sync your tasks across devices in real-time</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Improve our services and develop new features</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Respond to your feedback and support requests</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Data Security & Storage</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Firebase Security</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your data is stored securely using Google Firebase with industry-standard encryption and security rules that ensure only you can access your tasks.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Isolation</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Each user's data is completely isolated. We use Firebase security rules to ensure no user can access another user's tasks or personal information.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Local Storage</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Some preferences (like theme settings) are stored locally on your device and never transmitted to our servers.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Notifications & Permissions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Push Notifications</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    We only send push notifications for task reminders and only with your explicit permission. You can disable notifications at any time.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Calendar Integration</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    On iOS devices, we may generate calendar files (.ics) as notification fallbacks. These files contain only your task information and are processed locally on your device.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Your Rights & Contact</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Your Rights</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">You have the right to:</p>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                    <li>• Access your personal data</li>
                    <li>• Correct inaccurate information</li>
                    <li>• Delete your account and all associated data</li>
                    <li>• Export your task data</li>
                    <li>• Withdraw consent for notifications</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Us</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    If you have questions about this Privacy Policy or want to exercise your rights, please contact us through the feedback form in your Profile page.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Updates</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    We may update this Privacy Policy occasionally. We'll notify you of any significant changes through the app or email.
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}