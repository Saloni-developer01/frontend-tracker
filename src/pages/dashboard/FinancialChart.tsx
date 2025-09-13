import React, { useMemo } from "react";
import { useFinancialRecords } from "../../contexts/financial-record-context";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export const FinancialChart: React.FC = () => {
  const { records } = useFinancialRecords();

  const chartData: MonthlyData[] = useMemo(() => {
    const monthlyData: { [key: string]: MonthlyData } = {};
    
    const sortedRecords = records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedRecords.forEach((record) => {
      const date = new Date(record.date);
      const monthYear = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          income: 0,
          expense: 0,
        };
      }
      if (record.amount > 0) {
        monthlyData[monthYear].income += record.amount;
      } else {
        monthlyData[monthYear].expense += Math.abs(record.amount);
      }
    });

    return Object.values(monthlyData);
  }, [records]);

  return (
    <div style={{ marginTop: "20px"}}>
      <h3 style={{ textAlign: "center" }}>Monthly Income vs. Expense</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <XAxis dataKey="month"/>
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="#4c78a8" name="Income" />
          <Bar dataKey="expense" fill="#e45756" name="Expense" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
