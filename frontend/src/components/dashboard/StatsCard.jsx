export default function StatsCard({
  title,
  value,
  icon,
  bgColor = 'bg-blue-50',
  textColor = 'text-blue-600',
  subtext,
}) {
  return (
    <div className={`${bgColor} rounded-lg shadow-md p-6 dark:bg-gray-800 border-l-4 border-current`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-semibold ${textColor} dark:text-opacity-80`}>
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {subtext}
            </p>
          )}
        </div>
        <span className="text-4xl opacity-80">{icon}</span>
      </div>
    </div>
  );
}
