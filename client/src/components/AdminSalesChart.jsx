import React, { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import Card from 'react-bootstrap/Card';
import { API_BASE_URL } from "../config";
import { useTranslation } from 'react-i18next';

function AdminSalesChart() {
  const { t, i18n } = useTranslation('adminSalesChart');
  const [deliveredData, setDeliveredData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year] = useState(new Date().getFullYear());

  // Get months from translation or fallback to English
  const getMonths = useCallback(() => {
    try {
      const translatedMonths = t('months', { returnObjects: true });
      if (Array.isArray(translatedMonths) && translatedMonths.length === 12) {
        return translatedMonths;
      }
    } catch (e) {
      console.warn('Error loading translated months:', e);
    }
    // Fallback to English months
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  }, [t]);

  const months = getMonths();

  useEffect(() => {
    async function fetchChartData() {
      setDeliveredData([]);
      setPendingData([]);
      setTotalSales(0);

      const res = await fetch(`${API_BASE_URL}/admin/monthly-orders?month=${month}&year=${year}`);
      const raw = await res.json();

      if (res.ok) {
        const delivered = [];
        const pending = [];

        raw.daily.forEach(item => {
          const entry = {
            day: new Date(item.day).getDate(),
            orders: item.order_count,
            sales: Number(item.total_sales),
          };

          if (item.status === 'delivered') delivered.push(entry);
          else if (item.status === 'pending') pending.push(entry);
        });

        setDeliveredData(delivered);
        setPendingData(pending);
        setTotalSales(delivered.reduce((sum, d) => sum + d.sales, 0));
      }
    }

    fetchChartData();
  }, [month, year]);

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5>{t('totalSales', { amount: totalSales.toFixed(2) })}</h5>
        <select 
          value={month} 
          onChange={e => setMonth(Number(e.target.value))}
          className="form-select form-select-sm"
          style={{ width: 'auto' }}
        >
          {months && months.length > 0 ? (
            months.map((name, i) => (
              <option key={i} value={i + 1}>{name}</option>
            ))
          ) : (
            <option value={month}>
              {new Date(year, month - 1).toLocaleString(i18n.language, { month: 'long' })}
            </option>
          )}
        </select>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" type="number" domain={[1, 31]} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line 
              data={deliveredData} 
              type="monotone" 
              dataKey="orders" 
              stroke="#28a745" 
              name={t('chart.deliveredOrders')} 
            />
            <Line 
              data={pendingData} 
              type="monotone" 
              dataKey="orders" 
              stroke="#ffc107" 
              name={t('chart.pendingOrders')} 
            />
          </LineChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
}

export default AdminSalesChart;
