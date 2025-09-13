import { SunIcon, BoltIcon } from '@heroicons/react/24/outline';
import InfoCard from './InfoCard';

export default function SolarCard({ solarData = {} }) {
  // 已經直接傳入 solar 物件，所以這裡不要再 .solar
  const {
    voltage = 0,
    current = 0,
    power   = 0,
    status  = 'Unknown'
  } = solarData || {};

  return (
    <InfoCard title="太陽能板數據" icon={SunIcon} gradient>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              status === 'Charging' ? 'bg-green-400' : 'bg-red-400'
            }`}
          />
          <span className="font-medium text-base">
            {status === 'Charging' ? '充電中' : '未充電'}
          </span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-white/20">
          {status === 'Charging' ? '⚡ 正在充電' : '⚠️ 未充電'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-2">
        <Metric label="電壓"   value={voltage} unit="V" />
        <Metric label="電流"   value={current} unit="A" />
        <Metric label="功率"   value={power}   unit="W" />
      </div>

      <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/20">
        <span className="text-xs text-white/70">太陽能板規格: 6.0 V / 5.0 W</span>
        <div className="flex items-center">
          <BoltIcon className="w-4 h-4 mr-1 text-yellow-300" />
          <span className="text-xs text-yellow-300 font-medium">5.0 W 最大輸出</span>
        </div>
      </div>
    </InfoCard>
  );
}

function Metric({ label, value, unit }) {
  return (
    <div className="bg-black bg-opacity-20 rounded-lg p-3 flex flex-col">
      <span className="text-sm text-white/70 mb-1">{label}</span>
      <div className="flex items-baseline">
        <span className="text-xl lg:text-2xl font-bold">{Number(value).toFixed(1)}</span>
        <span className="ml-1 text-xs text-white/70">{unit}</span>
      </div>
    </div>
  );
}
