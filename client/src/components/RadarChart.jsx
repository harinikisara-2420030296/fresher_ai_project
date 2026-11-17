import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';

export default function PerformanceRadarChart({ data, title, count = 0, color = '#FFFFFF' }) {
  // If count is 0 or data is missing, render clean empty state
  if (!count || !data || data.length === 0) {
    return (
      <div className="dark-card p-6 flex flex-col justify-between h-[360px]">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-gray-500">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polygon points="12 2 2 8.5 2 15.5 12 22 22 15.5 22 8.5 12 2" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-300">No Data Available</p>
          <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
            Complete at least one interview to generate your 8-axis spider radar.
          </p>
        </div>
        <div className="text-center pt-3 border-t border-white/5">
          <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
            {title} ({count})
          </p>
        </div>
      </div>
    );
  }

  // Ensure all 8 axes are present with fallback numbers
  const chartData = [
    { subject: 'Correctness', value: data.correctness ?? 0 },
    { subject: 'Clarity', value: data.clarity ?? 0 },
    { subject: 'Relevance', value: data.relevance ?? 0 },
    { subject: 'Detail', value: data.detail ?? 0 },
    { subject: 'Efficiency', value: data.efficiency ?? 0 },
    { subject: 'Communication', value: data.communication ?? 0 },
    { subject: 'Problem solving', value: data.problemSolving ?? 0 },
    { subject: 'Creativity', value: data.creativity ?? 0 }
  ];

  return (
    <div className="dark-card p-6 flex flex-col justify-between h-[380px] relative overflow-hidden group">
      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="rgba(255, 255, 255, 0.12)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              stroke="rgba(255, 255, 255, 0.15)"
              tick={{ fill: '#6B7280', fontSize: 9 }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={color}
              fillOpacity={0.18}
            />
          </RechartsRadar>
        </ResponsiveContainer>
      </div>

      <div className="text-center pt-2 border-t border-white/5">
        <p className="text-xs text-gray-300 font-semibold tracking-wide">
          {title} ({count})
        </p>
      </div>
    </div>
  );
}

