import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

export default function PayrollChart({ data }) {
  // Transform data for the chart - rename 'PROCESSED' to more readable names
  const chartData = data
    ? data.map((item) => ({
        name: item._id === 'PROCESSED' ? 'Processed' : item._id || 'Unknown',
        value: item.count || 0,
      }))
    : [];

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-72 text-gray-500">
        <p>No payroll data available</p>
      </div>
    );
  }

  // Colors for statuses
  const COLORS = {
    Processed: '#10b981',
    PENDING: '#f59e0b',
    REJECTED: '#ef4444',
  };

  const getColor = (name) => {
    return COLORS[name] || '#3b82f6';
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: 'none', 
              borderRadius: '8px',
              color: '#fff'
            }} 
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Fallback render if Doughnut not working */}
      <div className="mt-4 space-y-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getColor(item.name) }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {item.name}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
