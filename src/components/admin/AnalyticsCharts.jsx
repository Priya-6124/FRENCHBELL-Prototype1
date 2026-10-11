import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend
} from 'recharts';

export function RevenueLineChart({ data }) {
  const chartData = data || [
    { date: 'Mon', revenue: 1450 },
    { date: 'Tue', revenue: 2100 },
    { date: 'Wed', revenue: 1890 },
    { date: 'Thu', revenue: 2800 },
    { date: 'Fri', revenue: 3950 },
    { date: 'Sat', revenue: 5200 },
    { date: 'Sun', revenue: 4800 }
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#8C7A6B" fontSize={11} />
          <YAxis stroke="#8C7A6B" fontSize={11} tickFormatter={(v) => `₹${v}`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F110A', borderColor: '#D4AF37', borderRadius: '12px', color: '#FAF5ED' }}
            formatter={(value) => [`₹${value}`, 'Revenue']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrderTypeDonutChart({ data }) {
  const chartData = data || [
    { name: 'Dine-In', value: 35, color: '#D4AF37' },
    { name: 'Takeaway', value: 25, color: '#E07A5F' },
    { name: 'Delivery', value: 40, color: '#2E7D32' }
  ];

  return (
    <div className="w-full h-72 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#1F110A', borderColor: '#D4AF37', borderRadius: '12px', color: '#FAF5ED' }}
            formatter={(value) => [`${value}%`, 'Share']}
          />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#1F110A' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopProductsBarChart({ data }) {
  const chartData = data || [
    { name: 'Cheesy Blaster', qty: 142 },
    { name: 'Double Zinger', qty: 118 },
    { name: 'Peri Peri Momos', qty: 95 },
    { name: 'Crispy Roll', qty: 86 },
    { name: 'Arabic Platter', qty: 64 }
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={chartData} margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
          <XAxis type="number" stroke="#8C7A6B" fontSize={11} />
          <YAxis type="category" dataKey="name" stroke="#1F110A" fontSize={11} width={100} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F110A', borderColor: '#D4AF37', borderRadius: '12px', color: '#FAF5ED' }}
            formatter={(value) => [`${value} Orders`, 'Quantity Sold']}
          />
          <Bar dataKey="qty" fill="#331B10" radius={[0, 8, 8, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
