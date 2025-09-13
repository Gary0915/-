// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import WeatherForecast from './components/WeatherForecast';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

/* =========================================
   dev 模式使用本地后端，build 后同域 /api/*
   ========================================= */
const API_BASE_URL = import.meta.env.DEV ? 'http://172.20.10.4:3000' : '';

export default function App() {
  /* ---------- 全局状态 ---------- */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  /* ---------- 环境数据（从 KV 读 key="sensor1"） ---------- */
  const [environmentData, setEnvironmentData] = useState({
    temperature: 0,
    humidity: 0,
    pressure: 0,
    altitude: 0
  });

  /* ---------- 历史数据（从 KV 读 key="sensorHistory"，假设是个数组） ---------- */
  const [historyData, setHistoryData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  /* ---------- 天气预报（5-day/3-hour Forecast 聚合后的每日中午数据） ---------- */
  const [forecastData, setForecastData] = useState([]); // Array<{ dt, temp, minTemp, maxTemp, pop, weatherMain }>
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  const [collapsed, setCollapsed] = useState(true); // Sidebar 折叠状态

  /* ---------- 获取最新环境数据 ---------- */
  const fetchLatestData = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/read?key=sensor1`);
      if (!res.ok) {
        if (res.status !== 404) {
          console.error('fetchLatestData 失败，状态码：', res.status);
        }
        return;
      }
      const data = await res.json();
      console.log('🔍 fetchLatestData 返回：', data);
      setEnvironmentData({
        temperature: data.temperature ?? 0,
        humidity:    data.humidity ?? 0,
        pressure:    data.pressure ?? 0,
        altitude:    data.altitude ?? 0
      });
      setIsConnected(true);
    } catch (err) {
      console.error('fetchLatestData error:', err);
      setIsConnected(false);
    }
  };

  /* ---------- 获取历史数据 ---------- */
  const fetchHistoryData = async () => {
    if (!isAuthenticated) return;
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/read?key=sensorHistory`);
      if (!res.ok) {
        if (res.status === 404) {
          setHistoryData([]); // 尚无历史
          return;
        }
        throw new Error(`fetchHistoryData 失败，状态码：${res.status}`);
      }
      const arr = await res.json();
      setHistoryData(arr);
    } catch (err) {
      console.error('fetchHistoryData error:', err);
      setHistoryError(err.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  /* ---------- 获取天气预报（5-day / 3-hour Forecast） ---------- */
  const fetchWeatherData = async () => {
    if (!isAuthenticated) return;
    setIsLoadingWeather(true);
    setWeatherError(null);
    try {
      const lat = import.meta.env.VITE_OWM_LAT;
      const lon = import.meta.env.VITE_OWM_LON;
      const apiKey = import.meta.env.VITE_OWM_API_KEY;

      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      console.log('🔗 fetchWeatherData URL:', url);

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`fetchWeatherData 失败，状态码 ${res.status}`);
      }
      const json = await res.json();
      // json.list 是每 3 小时一条，一共 5 天 × 8 = 40 条
      // 下面取出 “时间字符串以 "12:00:00" 结尾” 的项作为“当日中午”数据
      const list = json.list || [];
      const dayMap = {};
      list.forEach((entry) => {
        // entry.dt_txt 形如 "2025-06-12 12:00:00"
        if (entry.dt_txt.endsWith('12:00:00')) {
          const dateKey = entry.dt_txt.split(' ')[0]; // "2025-06-12"
          dayMap[dateKey] = {
            dt: entry.dt,
            temp: entry.main.temp,
            minTemp: entry.main.temp_min,
            maxTemp: entry.main.temp_max,
            pop: Math.round((entry.pop ?? 0) * 100), // 百分比
            weatherMain: entry.weather[0]?.main || ''
          };
        }
      });
      // 把 dayMap 转成数组，只取前 5 个键（通常会包含今日 + 接下来 4 天，共 5 条）
      const dailyArray = Object.keys(dayMap)
        .slice(0, 5)
        .map((dateKey) => ({
          dt: dayMap[dateKey].dt,
          temp: dayMap[dateKey].temp,
          minTemp: dayMap[dateKey].minTemp,
          maxTemp: dayMap[dateKey].maxTemp,
          pop: dayMap[dateKey].pop,
          weatherMain: dayMap[dateKey].weatherMain
        }));
      setForecastData(dailyArray);
    } catch (err) {
      console.error('fetchWeatherData error:', err);
      setWeatherError(err.message);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  /* ---------- 首次 & 定时拉取（环境 + 历史 + 天气） ---------- */
  useEffect(() => {
    // 从 localStorage 读取 token，只要存在就认为已登录
    setIsAuthenticated(!!localStorage.getItem('authToken'));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // 登录后立即拉一次
    fetchLatestData();
    fetchHistoryData();
    fetchWeatherData();

    // 每 30 秒刷新最新环境数据
    const envTimer = setInterval(fetchLatestData, 30_000);
    // 每 10 分钟刷新天气预报
    const weatherTimer = setInterval(fetchWeatherData, 10 * 60_000);

    return () => {
      clearInterval(envTimer);
      clearInterval(weatherTimer);
    };
  }, [isAuthenticated]);

  /* ---------- 登录 / 登出 逻辑 ---------- */
  const handleLogin = async ({ username, password }) => {
    // 示例：只有 admin/beaulo 与 user/solar 有效
    const valid =
      (username === 'admin' && password === 'beaulo') ||
      (username === 'user' && password === 'solar');
    if (!valid) {
      return { success: false, message: '用户名或密码错误' };
    }
    const token = `solar_token_${Date.now()}`;
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', username);
    setIsAuthenticated(true);
    return { success: true, message: '登录成功' };
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setIsConnected(false);
  };

  /* ---------- 渲染 ---------- */
  return (
    <ThemeProvider>
      <Router>
        <div className="App h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
          {/* Navbar */}
          <div className="z-50 relative">
            <Navbar
              onLogout={handleLogout}
              isConnected={isConnected}
              isAuthenticated={isAuthenticated}
              username={localStorage.getItem('username') || ''}
            />
          </div>

          <div className="flex flex-1 overflow-hidden mt-16">
            {/* 登录后显示 Sidebar */}
            {isAuthenticated && (
              <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            )}

            <main
              className="flex-1 overflow-y-auto"
              style={{
                marginLeft: isAuthenticated
                  ? `var(--sidebar-width, ${collapsed ? '64px' : '256px'})`
                  : 0
              }}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    isAuthenticated ? (
                      <>
                        {/* Dashboard: 环境数据 + 历史折线图 */}
                        <Dashboard
                          environmentData={environmentData}
                          isConnected={isConnected}
                          historyData={historyData}
                          isLoadingHistory={isLoadingHistory}
                          historyError={historyError}
                          fetchHistoryData={fetchHistoryData}
                        />

                        {/* 天气预报板块（未来 5 天中午） */}
                        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                          {isLoadingWeather ? (
                            <p className="text-center text-gray-500 dark:text-gray-400">
                              天气数据加载中…
                            </p>
                          ) : weatherError ? (
                            <p className="text-center text-red-500">
                              天气数据加载失败: {weatherError}
                            </p>
                          ) : (
                            <WeatherForecast forecastData={forecastData} />
                          )}
                        </div>
                      </>
                    ) : (
                      <Login onLogin={handleLogin} />
                    )
                  }
                />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}
