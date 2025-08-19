
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, Users, AlertTriangle, Scale, Clock, Zap } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Page Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Please read these terms carefully before using DayFuse. By using our service, you agree to these terms.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Terms Sections */}
          <div className="space-y-6">
            
            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Service Description</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  DayFuse is a productivity application that helps you manage tasks, set reminders, and organize your daily activities. 
                  Our service includes web-based access, real-time synchronization, and push notifications across supported devices.
                </p>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What We Provide</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                    <li>• Task creation, editing, and management</li>
                    <li>• Real-time synchronization across devices</li>
                    <li>• Push notifications and reminders</li>
                    <li>• Data backup and security</li>
                    <li>• Progressive Web App (PWA) functionality</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* User Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>User Responsibilities</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Account Security</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Appropriate Use</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                    <li>• Use DayFuse only for lawful purposes</li>
                    <li>• Do not share inappropriate or harmful content</li>
                    <li>• Respect the service limits and guidelines</li>
                    <li>• Do not attempt to access other users' data</li>
                    <li>• Report any security vulnerabilities responsibly</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Service Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Service Availability</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Uptime & Maintenance</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    While we strive to provide reliable service, we cannot guarantee 100% uptime. We may perform maintenance that temporarily affects service availability.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Device Compatibility</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    DayFuse works best on modern browsers and devices. Some features (like push notifications) may have limited availability on certain platforms, particularly older iOS devices.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Limitations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Limitations & Disclaimers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Service "As Is"</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    DayFuse is provided "as is" without warranties of any kind. We are not liable for any data loss, missed notifications, or productivity impacts.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Platform Limitations</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Some features depend on third-party platforms (browsers, operating systems, Firebase). We cannot guarantee functionality when these platforms change their policies or capabilities.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Backup</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    While we implement data protection measures, you should maintain your own backups of important information. We are not responsible for data loss due to user error, technical failures, or service termination.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Privacy & Data Handling</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Collection</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our data collection and usage practices are detailed in our Privacy Policy. By using DayFuse, you also agree to our Privacy Policy.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Account Termination</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    You may delete your account at any time. We reserve the right to terminate accounts that violate these terms. Upon termination, your data will be deleted according to our Privacy Policy.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Changes & Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Changes & Contact</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Terms Updates</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    We may update these Terms of Service occasionally. Significant changes will be communicated through the app. Continued use after updates constitutes acceptance.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Questions</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    If you have questions about these terms, please visit our <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact page</a> or use the feedback form in your Profile page.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Governing Law</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    These terms are governed by applicable local laws. Any disputes will be resolved through appropriate legal channels.
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