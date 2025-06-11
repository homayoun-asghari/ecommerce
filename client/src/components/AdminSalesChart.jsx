import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Card, Form, Spinner } from 'react-bootstrap';

// Helper function to get month names
const getMonthName = (month) => {
  const date = new Date(month + '-01');
  return date.toLocaleString('default', { month: 'short' });
};

// Generate month options for the last 12 months
const generateMonthOptions = () => {
  const months = [];
  const date = new Date();
  
  for (let i = 0; i < 12; i++) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    months.unshift({ value: `${year}-${month}`, label: `${year}-${month}` });
    date.setMonth(date.getMonth() - 1);
  }
  
  return months;
};

const AdminSalesChart = ({ fetchMonthlyOrders }) => {
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [chartData, setChartData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const monthOptions = generateMonthOptions();

  // Fetch and process data when selectedMonth changes
  const fetchAndProcessData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMonthlyOrders(selectedMonth || '');
      
      // Process the data
      const months = [];
      const today = new Date();
      const monthsToShow = selectedMonth ? 1 : 6; // Show 1 month if selected, else 6
      
      // Initialize months array
      for (let i = 0; i < monthsToShow; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() - (monthsToShow - 1) + i, 1);
        months[date.toISOString().slice(0, 7)] = {
          month: date.toISOString().slice(0, 7),
          delivered: 0,
          pending: 0,
          totalSales: 0
        };
      }
      
      // Fill in the data from the API
      data.forEach(item => {
        if (months[item.month]) {
          if (item.status === 'delivered') {
            months[item.month].delivered = item.order_count;
            months[item.month].totalSales = item.total_sales;
          } else if (item.status === 'pending') {
            months[item.month].pending = item.order_count;
          }
        }
      });
      
      const processedData = Object.values(months).sort((a, b) => 
        a.month.localeCompare(b.month)
      );
      
      const salesTotal = processedData.reduce(
        (sum, month) => sum + (parseFloat(month.totalSales) || 0), 0
      );
      
      setChartData(processedData);
      setTotalSales(salesTotal);
    } catch (err) {
      console.error('Error in fetchAndProcessData:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchMonthlyOrders, selectedMonth]);
  
  useEffect(() => {
    fetchAndProcessData();
  }, [fetchAndProcessData, selectedMonth]);

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center flex-wrap">
        <h5 className="mb-2 mb-md-0">Total Sales: ${totalSales.toFixed(2)}</h5>
        <div className="d-flex align-items-center">
          <Form.Label className="me-2 mb-0">Filter by Month:</Form.Label>
          <Form.Select 
            style={{ width: 'auto' }} 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value || '')}
          >
            <option value="">Last 6 Months</option>
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </Form.Select>
        </div>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={getMonthName}
                tick={{ fontSize: 12 }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip 
                formatter={(value, name) => [value, name === 'delivered' ? 'Delivered' : 'Pending']}
                labelFormatter={(month) => `Month: ${month}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="delivered" 
                name="Delivered Orders" 
                stroke="#28a745" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="pending" 
                name="Pending Orders" 
                stroke="#ffc107" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AdminSalesChart;
