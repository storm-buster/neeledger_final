import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Share2, User, Settings as SettingsIcon, Save, Shield, Palette } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
  ColorBends,
} from '@/components/ui-bits';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('Admin');
  const [email, setEmail] = useState('spearsh29workin@gmail.com');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(false);
  const { toast } = useToast();

  const handleSaveProfile = () => {
    toast({
      title: 'Profile updated',
      description: 'Your profile settings have been saved successfully.',
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Notification preferences updated',
      description: 'Your notification settings have been saved.',
    });
  };

  return (
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <ColorBends
        colors={['#ff5c7a', '#8a5cff', '#00ffd1']}
        rotation={30}
        speed={0.3}
        scale={1.2}
        frequency={1.4}
        warpStrength={1.2}
        mouseInfluence={0.8}
        parallax={0.6}
        noise={0.08}
        transparent
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 readable-surface"
      >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-nee-100 rounded-lg">
          <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-nee-700" />
        </div>
        <div>
          <h1 className="text-gradient-heading text-2xl sm:text-3xl font-extrabold hero-readable-text">Settings</h1>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400 font-medium">Manage your account and application preferences</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultSelectedKey="profile" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full max-w-full sm:max-w-md grid-cols-3">
          <TabsTrigger id="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger id="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger id="integrations">
            <Share2 className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent id="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-nee-700" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-700/60 text-gray-900 dark:text-gray-100 px-4 py-2 text-sm transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-nee-500 focus:outline-none focus:ring-2 focus:ring-nee-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 text-sm transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-nee-500 focus:outline-none focus:ring-2 focus:ring-nee-500/20"
                />
              </div>

              <div className="border-t my-4" />

              <div className="flex justify-end">
                <Button onPress={handleSaveProfile} className="gap-2 hover:scale-[1.02] transition-transform">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-nee-700" />
                Security
              </CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
              <Button variant="outline" className="w-full">
                Enable Two-Factor Authentication
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent id="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-nee-700" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Email Notifications</label>
                    <p className="text-sm text-gray-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4 text-nee-600 rounded focus:ring-nee-500"
                  />
                </div>

                <div className="border-t border-gray-200 my-4" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">In-App Notifications</label>
                    <p className="text-sm text-gray-500">
                      Show notifications within the application
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={inAppNotifications}
                    onChange={(e) => setInAppNotifications(e.target.checked)}
                    className="w-4 h-4 text-nee-600 rounded focus:ring-nee-500"
                  />
                </div>
              </div>

              <div className="border-t my-4" />

              <div className="flex justify-end">
                <Button onPress={handleSaveNotifications} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent id="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-nee-700" />
                Third-Party Integrations
              </CardTitle>
              <CardDescription>
                Configure API keys, webhooks, and external services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">API Access</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Generate and manage API keys for programmatic access
                  </p>
                  <Button variant="outline">Generate API Key</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Webhooks</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Configure webhook endpoints for real-time updates
                  </p>
                  <Button variant="outline">Configure Webhooks</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">External Services</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Connect with third-party services and platforms
                  </p>
                  <Button variant="outline">Manage Connections</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-nee-700" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Theme Settings (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </motion.div>
    </div>
  );
}
