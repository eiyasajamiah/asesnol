'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// بيانات تجريبية - تستبدل بالبيانات الحقيقية من API
const profitData = [
  { date: '2026-08-01', profit: 120, cumulative: 120 },
  { date: '2026-08-02', profit: -45, cumulative: 75 },
  { date: '2026-08-03', profit: 200, cumulative: 275 },
  { date: '2026-08-04', profit: 150, cumulative: 425 },
  { date: '2026-08-05', profit: -30, cumulative: 395 },
  { date: '2026-08-06', profit: 180, cumulative: 575 },
  { date: '2026-08-07', profit: 220, cumulative: 795 },
];

const botDistribution = [
  { name: 'Scalping', value: 35, color: 'var(--kimi-chart-1)' },
  { name: 'Trend Following', value: 25, color: 'var(--kimi-chart-2)' },
  { name: 'Grid Trading', value: 20, color: 'var(--kimi-chart-3)' },
  { name: 'Arbitrage', value: 20, color: 'var(--kimi-chart-4)' },
];

const stats = [
  { label: 'إجمالي الربح', value: '+$795', trend: '+12.5%', positive: true },
  { label: 'الصفقات الناجحة', value: '142', trend: '+8', positive: true },
  { label: 'معدل النجاح', value: '68.4%', trend: '-2.1%', positive: false },
  { label: 'البوتات النشطة', value: '5', trend: '0', positive: true },
];

export function TradingDashboard() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className={`text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>أداء التداول</CardTitle>
              <div className="flex gap-2">
                {['24h', '7d', '30d', '90d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      timeRange === range
                        ? 'bg-black text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={profitData}>
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--kimi-chart-1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--kimi-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('ar-SA')}
                />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  formatter={(value: number) => [`$${value}`, 'الربح']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('ar-SA')}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="var(--kimi-chart-1)"
                  fill="url(#profitGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bot Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع البوتات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={botDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {botDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {botDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades Table */}
      <Card>
        <CardHeader>
          <CardTitle>آخر الصفقات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4 text-sm font-medium">الزوج</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">النوع</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">السعر</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">الحجم</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">الربح</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">الوقت</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { pair: 'EUR/USD', type: 'BUY', price: 1.0850, size: 0.1, profit: 25.50, time: '2m ago' },
                  { pair: 'GBP/USD', type: 'SELL', price: 1.2740, size: 0.2, profit: -12.30, time: '5m ago' },
                  { pair: 'USD/JPY', type: 'BUY', price: 149.20, size: 0.15, profit: 18.75, time: '12m ago' },
                ].map((trade, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{trade.pair}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        trade.type === 'BUY' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{trade.price}</td>
                    <td className="py-3 px-4">{trade.size} lot</td>
                    <td className={`py-3 px-4 ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.profit >= 0 ? '+' : ''}{trade.profit}$
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{trade.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}