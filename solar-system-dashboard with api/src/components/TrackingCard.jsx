// src/components/TrackingCard.jsx
import { useState, useEffect } from 'react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import InfoCard from './InfoCard';

export default function TrackingCard({ trackingData = {}, sendCommand = () => {} }) {
  /* == 解構父層傳入的 tracking 物件 == */
  const {
    enabled      = false,
    angleX       = 90,
    angleY       = 45,
    lightValues  = [0, 0, 0, 0]
  } = trackingData || {};

  /* == 本地 UI 狀態：即時顯示滑桿值 == */
  const [localX, setLocalX] = useState(angleX);
  const [localY, setLocalY] = useState(angleY);

  /* 父層數據更新時，同步到本地 UI */
  useEffect(() => {
    setLocalX(angleX);
    setLocalY(angleY);
  }, [angleX, angleY]);

  /* == 手動調整角度 == */
  const handleManual = (axis, value) => {
    const v = Number(value);
    axis === 'x' ? setLocalX(v) : setLocalY(v);

    sendCommand({
      manualControl: true,
      ...(axis === 'x' ? { angleX: v } : { angleY: v })
    });
  };

  /* == 切換自動 / 手動 == */
  const toggleTracking = () => {
    // enabled=true → 目前自動；點擊後改手動 ⇒ manualControl:true
    // enabled=false → 目前手動；點擊後改自動 ⇒ manualControl:false
    sendCommand({ manualControl: enabled });
  };

  return (
    <InfoCard title="太陽能追蹤器" icon={AdjustmentsHorizontalIcon}>
      {/* 標題 + 開關按鈕 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-1 ${enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="font-medium text-base">
            {enabled ? '自動追蹤中' : '手動控制模式'}
          </span>
        </div>
        <button
          onClick={toggleTracking}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            enabled
              ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
              : 'bg-green-100 hover:bg-green-200 text-green-800'
          }`}
        >
          {enabled ? '切換手動' : '啟動追蹤'}
        </button>
      </div>

      {/* X / Y 軸角度滑桿 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Slider
          label="X軸角度"
          value={localX}
          onChange={(v) => handleManual('x', v)}
          disabled={enabled}
        />
        <Slider
          label="Y軸角度"
          value={localY}
          onChange={(v) => handleManual('y', v)}
          disabled={enabled}
        />
      </div>

      {/* 四顆光敏值 */}
      <p className="text-sm text-gray-600 mb-2">光敏電阻數值</p>
      <div className="grid grid-cols-2 gap-2">
        <LdrBlock value={lightValues[0]} label="左上" />
        <LdrBlock value={lightValues[1]} label="右上" />
        <LdrBlock value={lightValues[2]} label="左下" />
        <LdrBlock value={lightValues[3]} label="右下" />
      </div>
    </InfoCard>
  );
}

/* === 小元件們 === */
function Slider({ label, value, onChange, disabled }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-sm text-gray-500">{label}</label>
        <span className="text-xs font-medium text-gray-600">{value}°</span>
      </div>
      <input
        type="range"
        min="0"
        max="180"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}

function LdrBlock({ value = 0, label }) {
  return (
    <div className="flex flex-col items-center justify-center p-2 bg-gray-100 rounded-lg">
      <div className="text-sm font-medium">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
