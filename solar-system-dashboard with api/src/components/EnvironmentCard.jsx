// src/components/EnvironmentCard.jsx
import { CloudIcon, ClockIcon, BeakerIcon } from '@heroicons/react/24/outline';
import InfoCard from './InfoCard';
import { motion } from 'framer-motion';

/**
 * 完整版本：EnvironmentCard.jsx
 *
 * 這個元件期望從父層 (Dashboard) 接收到以下 props：
 *   • data：一個物件，內容長這樣：
 *       {
 *         temperature: 27.3,
 *         humidity:    51.2,
 *         pressure:    1013.5,
 *         altitude:    36
 *       }
 *   • isLoading：布林值，表示歷史資料是否正在加載
 *   • error：錯誤字串 (如果 fetch 歷史資料時出錯，就會放這裡)
 */

const EnvironmentCard = ({ 
  data = {},      // ← 跟 Dashboard.jsx 裡傳進來的 prop 名稱「data」要一致
  isLoading,
  error
}) => {
  // 調試：確認父層傳進來的 data 長甚麼樣
  console.log('EnvironmentCard 接收到的 data:', data);

  // 直接從 data 解構所需欄位，並給預設值 0
  const { 
    temperature = 0, 
    humidity    = 0, 
    pressure    = 0, 
    altitude    = 0 
  } = data;

  // 再印一次解構後的結果，確保有值
  console.log('解構後的環境數據:', { temperature, humidity, pressure, altitude });

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <InfoCard title="環境數據" icon={CloudIcon}>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <CloudIcon className="w-6 h-6 mr-2 text-blue-500" />
          環境數據
        </h2>
        
        {isLoading && <p className="text-gray-500">加載中...</p>}
        
        {error && (
          <p className="text-red-500">
            錯誤: {error}
          </p>
        )}
        
        {!isLoading && !error && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">溫度</p>
              <p className="text-2xl font-bold text-gray-800">
                {temperature.toFixed(1)} °C
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">濕度</p>
              <p className="text-2xl font-bold text-gray-800">
                {humidity.toFixed(1)} %
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">氣壓</p>
              <p className="text-2xl font-bold text-gray-800">
                {pressure.toFixed(1)} hPa
              </p>
            </div>
            {/* 如果要顯示高度 (altitude)，可以再加一個區塊。例如： */}
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">海拔</p>
              <p className="text-2xl font-bold text-gray-800">
                {altitude.toFixed(0)} m
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              更新時間: {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center">
            <BeakerIcon className="w-4 h-4 mr-1 text-purple-500 dark:text-purple-400" />
            <span className="text-xs text-purple-500 dark:text-purple-400 font-medium">
              環境分析
            </span>
          </div>
        </div>
      </InfoCard>
    </motion.div>
  );
};

export default EnvironmentCard;
