import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { formatCategory } from '../../utils/helpers';

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
};

const CATEGORY_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs">
        <p className="font-bold text-white mb-1">{label || payload[0].name}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color || entry.fill }} className="font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const DisastersByCategoryChart = ({ data = [] }) => {
  const formattedData = data.map((item) => ({
    name: formatCategory(item.name),
    count: item.count,
  }));

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800">
      <h4 className="text-sm font-bold text-white mb-4">Disaster Reports by Category</h4>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-25} textAnchor="end" />
            <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Incidents" radius={[6, 6, 0, 0]}>
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const SeverityDonutChart = ({ data = [] }) => {
  const formattedData = data.map((item) => ({
    name: item.name ? item.name.toUpperCase() : 'UNKNOWN',
    value: item.count,
    color: SEVERITY_COLORS[item.name?.toLowerCase()] || '#64748b',
  }));

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800">
      <h4 className="text-sm font-bold text-white mb-4">Incidents by Severity Level</h4>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const IncidentTrendsChart = ({ data = [] }) => {
  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800">
      <h4 className="text-sm font-bold text-white mb-4">Monthly Incident Reporting vs Resolution</h4>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="reports"
              name="Reports Submitted"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorReports)"
            />
            <Area
              type="monotone"
              dataKey="resolved"
              name="Incidents Resolved"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorResolved)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const HelpRequestsChart = ({ data = [] }) => {
  const formattedData = data.map((item) => ({
    name: formatCategory(item.name),
    requests: item.count,
  }));

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800">
      <h4 className="text-sm font-bold text-white mb-4">Emergency Assistance Requests by Type</h4>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="requests" name="Requests" fill="#3b82f6" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
