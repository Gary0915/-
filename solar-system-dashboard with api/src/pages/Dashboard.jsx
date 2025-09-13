// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { SunIcon, CloudIcon, ClockIcon, BeakerIcon } from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// --------------------------------------------------------------------------------
// 將傳入的 Date 物件格式化成「上午 HH:MM:SS / 下午 HH:MM:SS」的字串
const formatTimeForCard = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "無效時間";
  }
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const period = hours >= 12 ? (hours === 12 ? '中午' : '下午') : '上午';
  let displayHours = hours % 12;
  if (displayHours === 0) displayHours = 12;
  return `${period} ${displayHours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
};

// --------------------------------------------------------------------------------
// 單一的「詳細環境數據卡片 (DetailedEnvironmentCard)」
function DetailedEnvironmentCard({ environmentData, lastUpdateTimeString }) {
  const temp = environmentData?.temperature?.toFixed(1) ?? 'N/A';
  const hum = environmentData?.humidity?.toFixed(1) ?? 'N/A';
  const press = environmentData?.pressure?.toFixed(1) ?? 'N/A';
  const alt = environmentData?.altitude?.toFixed(0) ?? 'N/A';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl shadow-md">
      <div className="flex items-center mb-3 sm:mb-4">
        <CloudIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-2" />
        <h4 className="text-md sm:text-lg font-semibold text-gray-700 dark:text-gray-200">
          環境數據
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
        {/* 溫度 */}
        <div className="bg-blue-50 dark:bg-slate-700/80 p-2.5 sm:p-3 rounded-lg text-center">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-0.5">溫度</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
            {temp}
            {temp !== 'N/A' && (
              <span className="text-xs sm:text-sm font-normal align-baseline"> °C</span>
            )}
          </p>
        </div>

        {/* 濕度 */}
        <div className="bg-blue-50 dark:bg-slate-700/80 p-2.5 sm:p-3 rounded-lg text-center">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-0.5">濕度</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
            {hum}
            {hum !== 'N/A' && (
              <span className="text-xs sm:text-sm font-normal align-baseline"> %</span>
            )}
          </p>
        </div>

        {/* 氣壓 */}
        <div className="bg-blue-50 dark:bg-slate-700/80 p-2.5 sm:p-3 rounded-lg text-center">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-0.5">氣壓</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
            {press}
            {press !== 'N/A' && (
              <span className="text-xs sm:text-sm font-normal align-baseline"> hPa</span>
            )}
          </p>
        </div>

        {/* 海拔 */}
        <div className="bg-blue-50 dark:bg-slate-700/80 p-2.5 sm:p-3 rounded-lg text-center">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-0.5">海拔</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
            {alt}
            {alt !== 'N/A' && (
              <span className="text-xs sm:text-sm font-normal align-baseline"> m</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700/60">
        <div className="flex items-center">
          <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
          <span>更新時間: {lastUpdateTimeString}</span>
        </div>
        <a
          href="#"
          className="flex items-center text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 hover:underline"
        >
          <BeakerIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
          <span>環境分析</span>
        </a>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// 最終的 Dashboard 組件（一次只渲染一張 DetailedEnvironmentCard）
export default function Dashboard({
  environmentData,
  isConnected,
  historyData,
  isLoadingHistory,
  historyError,
  fetchHistoryData
}) {
  const [historicalData, setHistoricalData] = useState({
    labels: [], temperature: [], humidity: [], pressure: [], altitude: []
  });

  const [currentTimeFormatted, setCurrentTimeFormatted] = useState(
    formatTimeForCard(new Date())
  );

  // 每秒更新「現在時刻」字串
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeFormatted(formatTimeForCard(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 如果有 historyData，將它拆成四個陣列
  useEffect(() => {
    if (historyData && historyData.length > 0) {
      const labels = [];
      const temps = [];
      const hums = [];
      const press = [];
      const alts = [];

      const sorted = [...historyData].sort(
        (a, b) => new Date(a.serverTimestamp) - new Date(b.serverTimestamp)
      );

      sorted.forEach((entry) => {
        const t = formatTimeForCard(new Date(entry.serverTimestamp));
        labels.push(t);
        temps.push(entry.environment.temperature ?? 0);
        hums.push(entry.environment.humidity ?? 0);
        press.push(entry.environment.pressure ?? 0);
        alts.push(entry.environment.altitude ?? 0);
      });

      setHistoricalData({
        labels,
        temperature: temps,
        humidity: hums,
        pressure: press,
        altitude: alts
      });
    }
  }, [historyData]);

  // 如果沒有 historyData，就用環境資料補點，最多保留 20 個
  useEffect(() => {
    if ((!historyData || historyData.length === 0) && environmentData) {
      const now = new Date();
      const label = formatTimeForCard(now);

      setHistoricalData((prev) => ({
        labels: [...prev.labels, label].slice(-20),
        temperature: [...prev.temperature, environmentData.temperature ?? 0].slice(-20),
        humidity: [...prev.humidity, environmentData.humidity ?? 0].slice(-20),
        pressure: [...prev.pressure, environmentData.pressure ?? 0].slice(-20),
        altitude: [...prev.altitude, environmentData.altitude ?? 0].slice(-20)
      }));
    }
  }, [environmentData, historyData]);

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: document.body.classList.contains('dark')
            ? 'rgba(255,255,255,0.7)'
            : 'rgba(0,0,0,0.7)'
        }
      },
      x: {
        ticks: {
          color: document.body.classList.contains('dark')
            ? 'rgba(255,255,255,0.7)'
            : 'rgba(0,0,0,0.7)'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: document.body.classList.contains('dark')
            ? 'rgba(255,255,255,0.9)'
            : 'rgba(0,0,0,0.9)'
        }
      },
      title: {
        color: document.body.classList.contains('dark')
          ? 'rgba(255,255,255,0.9)'
          : 'rgba(0,0,0,0.9)',
        display: false
      }
    }
  };

  const chartDataConfig = (label, data, colorRgb) => ({
    labels: historicalData.labels,
    datasets: [
      {
        label,
        data,
        tension: 0.3,
        borderColor: `rgb(${colorRgb})`,
        backgroundColor: `rgba(${colorRgb}, 0.5)`,
        pointBackgroundColor: `rgb(${colorRgb})`,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: `rgb(${colorRgb})`
      }
    ]
  });

  const temperatureChartData = chartDataConfig(
    '溫度 (°C)',
    historicalData.temperature,
    '255, 99, 132'
  );
  const humidityChartData = chartDataConfig(
    '濕度 (%)',
    historicalData.humidity,
    '54, 162, 235'
  );
  const pressureChartData = chartDataConfig(
    '氣壓 (hPa)',
    historicalData.pressure,
    '75, 192, 192'
  );
  const altitudeChartData = chartDataConfig(
    '海拔 (m)',
    historicalData.altitude,
    '153, 102, 255'
  );

  // 如果環境資料尚未載入，就顯示 Loading
  if (!environmentData) {
    return (
      <div
        className="pt-20 pb-6 px-4 md:px-6 lg:px-8 w-full overflow-y-auto flex justify-center items-center h-screen"
        style={{ marginLeft: 'var(--sidebar-width, 64px)' }}
      >
        <div className="text-gray-500 dark:text-gray-400">
          正在加載儀表板數據...
        </div>
      </div>
    );
  }

  return (
    <div
      className="pt-20 pb-6 px-4 md:px-6 lg:px-8 w-full overflow-y-auto bg-gray-50 dark:bg-slate-900"
      style={{ marginLeft: 'var(--sidebar-width, 64px)' }}
    >
      {/* fixed Navbar placeholder */}
      <div
        className="fixed top-0 left-[var(--sidebar-width,64px)] right-0 h-16 bg-white dark:bg-slate-800 z-30 border-b border-gray-200 dark:border-slate-700"
      />

      <div className="max-w-7xl mx-auto">
        <header className="mb-8 pt-4" id="top">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            太陽能系統監控中心
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Real-time solar system monitoring
          </p>
        </header>

        {/* —— 系統概況 —— */}
        <div className="mb-6 flex items-center justify-between" id="overview">
          <div className="flex items-center">
            <SunIcon className="w-6 h-6 text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              系統概況
            </h2>
          </div>
          <div
            className={`bg-gray-100 dark:bg-slate-700 rounded-full px-3 py-1.5 text-sm flex items-center ${
              isConnected ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full mr-2 ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            {isConnected ? '系統狀態: 連線中' : '未連接到 ESP32'}
          </div>
        </div>

        {/* —— 只渲染一張環境數據卡片 —— */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              環境數據
            </h3>
            <button
              onClick={fetchHistoryData}
              disabled={isLoadingHistory}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingHistory ? '更新中...' : '更新歷史'}
            </button>
          </div>

          {historyError && (
            <p className="text-red-500 text-sm mb-3">
              獲取歷史數據時出錯: {typeof historyError === 'string' ? historyError : historyError.message || '未知錯誤'}
            </p>
          )}

          {/* ** 這裡只渲染一張 DetailedEnvironmentCard，不再用 map** */}
          <DetailedEnvironmentCard
            environmentData={environmentData}
            lastUpdateTimeString={currentTimeFormatted}
          />

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            全局更新時間: {currentTimeFormatted}
          </p>
        </div>

        {/* —— 四個折線圖 —— */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* 溫度折線圖 */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              溫度歷史走勢 (°C)
            </h3>
            <div style={{ height: '240px' }}>
              <Line
                data={temperatureChartData}
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    title: { display: true, text: '環境溫度歷史' }
                  }
                }}
              />
            </div>
          </div>

          {/* 濕度折線圖 */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              濕度歷史走勢 (%)
            </h3>
            <div style={{ height: '240px' }}>
              <Line
                data={humidityChartData}
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    title: { display: true, text: '環境濕度歷史' }
                  }
                }}
              />
            </div>
          </div>

          {/* 氣壓折線圖 */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              氣壓歷史走勢 (hPa)
            </h3>
            <div style={{ height: '240px' }}>
              <Line
                data={pressureChartData}
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    title: { display: true, text: '環境氣壓歷史' }
                  }
                }}
              />
            </div>
          </div>

          {/* 海拔折線圖 */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              海拔歷史走勢 (m)
            </h3>
            <div style={{ height: '240px' }}>
              <Line
                data={altitudeChartData}
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    title: { display: true, text: '環境海拔歷史' }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
