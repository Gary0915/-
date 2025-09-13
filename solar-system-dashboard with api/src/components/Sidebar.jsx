import { useState, useEffect } from 'react';
import { HashLink as Link } from 'react-router-hash-link';
import { 
  SunIcon, 
  BoltIcon, 
  ChartBarIcon, 
  AdjustmentsHorizontalIcon, 
  CloudIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  
  // Update CSS variable when sidebar is collapsed/expanded
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '64px' : '256px');
    return () => {
      document.documentElement.style.removeProperty('--sidebar-width');
    };
  }, [collapsed]);
  
  const navItems = [
    { name: '概覽', icon: HomeIcon, href: '#overview' },
    { name: '太陽能板', icon: SunIcon, href: '#solar' },
    { name: '系統電源', icon: BoltIcon, href: '#system' },
    { name: '環境數據', icon: CloudIcon, href: '#environment' },
    { name: '追蹤控制', icon: AdjustmentsHorizontalIcon, href: '#tracking' },
    { name: '統計圖表', icon: ChartBarIcon, href: '#statistics' },
  ];

  return (
    <aside 
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } h-screen bg-gradient-to-b from-primary-700 to-secondary-900 text-white transition-all duration-300 fixed left-0 top-0 z-20`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-primary-600">
          {!collapsed && (
            <h2 className="text-xl font-bold">Solar System</h2>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            {collapsed ? (
              <ArrowRightIcon className="w-5 h-5" />
            ) : (
              <ArrowLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex items-center p-3 text-base font-normal rounded-lg hover:bg-primary-600 transition-colors"
            >
              <item.icon className={`w-6 h-6 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
