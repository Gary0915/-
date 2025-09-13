import { BoltIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import InfoCard from './InfoCard';

const PowerBankCard = ({ systemData = {} }) => {
  const { 
    voltage = 0, 
    current = 0, 
    power = 0 
  } = systemData || {};

  return (
    <InfoCard title="行動電源監控" icon={BoltIcon}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <BoltIcon className="w-5 h-5 mr-1 text-green-500" />
          <span className="font-medium text-base text-gray-800 dark:text-white">行動電源</span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          系統正常運作中
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-2">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex flex-col">
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">輸出電壓</span>
          <div className="flex items-baseline">
            <span className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">{voltage}</span>
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">V</span>
          </div>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex flex-col">
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">電流消耗</span>
          <div className="flex items-baseline">
            <span className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">{current}</span>
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">A</span>
          </div>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex flex-col">
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">功率消耗</span>
          <div className="flex items-baseline">
            <span className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">{power}</span>
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">W</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">規格: 5.0V 輸出</span>
        <div className="flex items-center">
          <ArrowDownTrayIcon className="w-4 h-4 mr-1 text-blue-500 dark:text-blue-400" />
          <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">支援快速充電</span>
        </div>
      </div>
    </InfoCard>
  );
};

export default PowerBankCard;
