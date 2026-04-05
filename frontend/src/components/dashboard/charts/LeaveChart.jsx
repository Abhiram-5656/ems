import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function LeaveChart({ data }) {
  // Transform data for the chart
  const chartData = data
    ? data.map((item) => ({
        type: item._id || 'Unknown',
        count: item.count || 0,
        days: item.totalDays || 0,
      }))
    : [];

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-72 text-gray-500">
        <p>No leave data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="type" />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1f2937', 
            border: 'none', 
            borderRadius: '8px',
            color: '#fff'
          }} 
        />
        <Legend />
        <Bar dataKey="count" fill="#f59e0b" name="Count" radius={[8, 8, 0, 0]} />
        <Bar dataKey="days" fill="#10b981" name="Total Days" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
