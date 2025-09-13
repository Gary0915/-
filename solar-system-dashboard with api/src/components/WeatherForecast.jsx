// src/components/WeatherForecast.jsx
import React from 'react';
import SunIcon from '@heroicons/react/24/outline/SunIcon';
import CloudIcon from '@heroicons/react/24/outline/CloudIcon';
import BoltIcon from '@heroicons/react/24/outline/BoltIcon';

/**
 * WeatherForecast 组件
 *
 * Props:
 *   - forecastData: Array（长度约为 5，来自 OpenWeatherMap 5-day/3-hour Forecast 聚合后的每日中午数据）
 *       每一项格式为：
 *       {
 *         dt: number,        // Unix 时间戳（秒），代表当日 12:00
 *         temp: number,      // 当日 12:00 的平均温度 (°C)
 *         minTemp: number,   // 当日 12:00 的最低温度 (°C)
 *         maxTemp: number,   // 当日 12:00 的最高温度 (°C)
 *         pop: number,       // 当日 12:00 降水概率 (%)，已四舍五入整数
 *         weatherMain: string // 当日 12:00 的天气主描述 (e.g. "Clear", "Clouds", "Rain", "Thunderstorm")
 *       }
 *
 * 组件会将 forecastData 渲染为一个网格，每个小卡片里显示：
 *   - 星期几（如“週一”）
 *   - 根据 weatherMain 选定的图标 (SunIcon / CloudIcon / BoltIcon)
 *   - 当日中午温度 (°C)
 *   - 最高/最低温度 (°C)
 *   - 降水概率 (%)
 */
export default function WeatherForecast({ forecastData }) {
  return (
    // 最外层容器：水平居中且最大宽度为 4xl
    <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          未来 5 天中午天氣預報
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {forecastData.map((day) => {
            const date = new Date(day.dt * 1000);
            const weekday = date.toLocaleDateString('zh-TW', { weekday: 'short' }); // 例如“週一”

            // 根据 weatherMain 选择图标
            const wm = (day.weatherMain || '').toLowerCase();
            let IconComp = SunIcon;
            if (wm.includes('thunder')) {
              IconComp = BoltIcon;
            } else if (wm.includes('rain') || wm.includes('cloud')) {
              IconComp = CloudIcon;
            } else {
              IconComp = SunIcon;
            }

            return (
              <div
                key={day.dt}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex flex-col items-center"
              >
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{weekday}</p>
                <IconComp className="w-8 h-8 text-yellow-400 mb-2" />
                <p className="text-lg font-bold text-gray-800 dark:text-white">
                  {day.temp.toFixed(0)}°C
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  (H: {day.maxTemp.toFixed(0)}° L: {day.minTemp.toFixed(0)}°)
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  降水: {day.pop}%
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
