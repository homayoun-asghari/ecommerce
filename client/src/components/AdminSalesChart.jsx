import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import Card from 'react-bootstrap/Card';

function AdminSalesChart() {
  const [deliveredData, setDeliveredData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    async function fetchChartData() {
      setDeliveredData([]);
      setPendingData([]);
      setTotalSales(0);

      const res = await fetch(`http://localhost:5050/admin/monthly-orders?month=${month}&year=${year}`);
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
        <h5>Total Sales: ${totalSales.toFixed(2)}</h5>
        <select value={month} onChange={e => setMonth(Number(e.target.value))}>
          {months.map((name, i) => (
            <option key={i} value={i + 1}>{name}</option>
          ))}
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
            <Line data={deliveredData} type="monotone" dataKey="orders" stroke="#28a745" name="Delivered Orders" />
            <Line data={pendingData} type="monotone" dataKey="orders" stroke="#ffc107" name="Pending Orders" />
          </LineChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
}

export default AdminSalesChart;
