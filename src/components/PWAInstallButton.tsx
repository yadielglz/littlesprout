import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone, Monitor, Tablet, CheckCircle, Info } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Button, Card } from './common';
import toast from 'react-hot-toast';

const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, installApp, getInstallInstructions } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast.success('LittleSprout has been installed successfully! 🎉');
    } else {
      toast.error('Installation was cancelled or failed');
    }
  };

  const instructions = getInstallInstructions();

  const getPlatformIcon = () => {
    switch (instructions.platform) {
      case 'iOS':
        return <Smartphone className="w-5 h-5" />;
      case 'Android':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  if (isInstalled) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-200">
              App Installed Successfully!
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              LittleSprout is now installed on your device
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getPlatformIcon()}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Install LittleSprout
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add to your home screen for quick access
            </p>
          </div>
        </div>
      </div>

      {isInstallable ? (
        <div className="space-y-3">
          <Button
            onClick={handleInstall}
            variant="primary"
            size="lg"
            className="w-full"
            icon={<Download className="w-5 h-5" />}
          >
            Install App
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Tap to install LittleSprout on your device
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <Button
            onClick={() => setShowInstructions(!showInstructions)}
            variant="secondary"
            size="lg"
            className="w-full"
            icon={<Info className="w-5 h-5" />}
          >
            Show Install Instructions
          </Button>
          
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
            >
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Install on {instructions.platform}:
              </h4>
              <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                {instructions.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {index + 1}.
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Your browser will show an install prompt when available
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center space-y-1">
            <Smartphone className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Mobile</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <Tablet className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Tablet</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <Monitor className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Desktop</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PWAInstallButton;
