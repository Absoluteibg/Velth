/**
 * Reports & Insights Screen
 * Visual spending summaries and analytics
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  FlatList,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useFinance } from '@/lib/finance-context';
import { useColors } from '@/hooks/use-colors';

const { width } = Dimensions.get('window');

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
}

export default function ReportsScreen() {
  const { state } = useFinance();
  const colors = useColors();

  // Calculate current month stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = useMemo(() => {
    return state.transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
  }, [state.transactions, currentMonth, currentYear]);

  const totalSpent = useMemo(() => {
    return currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const totalBudget = useMemo(() => {
    return state.envelopes.reduce((sum, e) => sum + e.budget, 0);
  }, [state.envelopes]);

  const categoryData = useMemo(() => {
    const spending: Record<string, number> = {};

    currentMonthTransactions.forEach((t) => {
      const envelope = state.envelopes.find((e) => e.id === t.envelopeId);
      if (envelope) {
        spending[envelope.name] = (spending[envelope.name] || 0) + t.amount;
      }
    });

    const data: CategoryData[] = Object.entries(spending)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return data;
  }, [currentMonthTransactions, state.envelopes, totalSpent]);

  // Calculate monthly trend (last 6 months)
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    const monthLabels: string[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

      months[key] = 0;
      monthLabels.push(label);
    }

    state.transactions.forEach((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months.hasOwnProperty(key)) {
        months[key] += t.amount;
      }
    });

    return {
      labels: monthLabels,
      data: Object.values(months),
    };
  }, [state.transactions, currentMonth, currentYear]);

  // Simple pie chart visualization using colored circles
  const renderPieChart = () => {
    if (categoryData.length === 0) {
      return (
        <View className="items-center justify-center py-8">
          <Text className="text-muted">No spending data for this month</Text>
        </View>
      );
    }

    const chartWidth = width - 32; // Account for padding
    const chartHeight = 200;
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;
    const radius = 70;

    let currentAngle = -Math.PI / 2;
    const segments: any[] = [];

    categoryData.forEach((item, index) => {
      const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;

      // Get color from palette
      const colors_list = [colors.primary, colors.warning, colors.success, colors.error];
      const color = colors_list[index % colors_list.length];

      segments.push({
        id: item.name,
        color,
        percentage: item.percentage,
        startAngle,
        endAngle,
      });

      currentAngle = endAngle;
    });

    return (
      <View className="items-center">
        <View
          style={{
            width: chartWidth,
            height: chartHeight,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Pie chart segments as colored bars (simplified visualization) */}
          <View className="flex-row gap-2 flex-wrap justify-center">
            {categoryData.map((item, index) => {
              const colors_list = [colors.primary, colors.warning, colors.success, colors.error];
              const color = colors_list[index % colors_list.length];
              return (
                <View
                  key={item.name}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    backgroundColor: color,
                  }}
                />
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  // Simple bar chart for monthly trend
  const renderBarChart = () => {
    if (monthlyData.data.every((v) => v === 0)) {
      return (
        <View className="items-center justify-center py-8">
          <Text className="text-muted">No spending data available</Text>
        </View>
      );
    }

    const maxValue = Math.max(...monthlyData.data, 1);
    const chartHeight = 150;
    const barWidth = (width - 32 - 20) / monthlyData.data.length; // Account for padding and gaps

    return (
      <View className="items-center">
        <View
          style={{
            width: width - 32,
            height: chartHeight + 40,
            justifyContent: 'flex-end',
          }}
        >
          <View className="flex-row gap-1 justify-between items-flex-end h-full">
            {monthlyData.data.map((value, index) => {
              const barHeight = (value / maxValue) * chartHeight;
              return (
                <View key={index} className="items-center flex-1">
                  <View
                    style={{
                      width: barWidth - 4,
                      height: barHeight,
                      backgroundColor: colors.primary,
                      borderRadius: 4,
                      marginBottom: 8,
                    }}
                  />
                  <Text className="text-xs text-muted">
                    {monthlyData.labels[index]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderCategoryItem = ({ item }: { item: CategoryData }) => (
    <View className="flex-row justify-between items-center mb-3">
      <View className="flex-1">
        <Text className="text-sm font-medium text-foreground">{item.name}</Text>
        <Text className="text-xs text-muted">
          {item.percentage.toFixed(1)}% of spending
        </Text>
      </View>
      <Text className="text-sm font-semibold text-warning">
        ₹{item.amount.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Reports</Text>
          <Text className="text-sm text-muted">
            {new Date(currentYear, currentMonth).toLocaleDateString('en-IN', {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Summary Cards */}
        <View className="flex-row gap-3 mb-6">
          <View
            className="flex-1 bg-surface rounded-xl p-3 border border-border"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-xs text-muted mb-1">Total Spent</Text>
            <Text className="text-lg font-bold text-warning">
              ₹{totalSpent.toFixed(2)}
            </Text>
          </View>
          <View
            className="flex-1 bg-surface rounded-xl p-3 border border-border"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-xs text-muted mb-1">Budget</Text>
            <Text className="text-lg font-bold text-foreground">
              ₹{totalBudget.toFixed(2)}
            </Text>
          </View>
          <View
            className="flex-1 bg-surface rounded-xl p-3 border border-border"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-xs text-muted mb-1">Remaining</Text>
            <Text className="text-lg font-bold text-success">
              ₹{Math.max(0, totalBudget - totalSpent).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Category Breakdown */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Category Breakdown
          </Text>
          <View
            className="bg-surface rounded-xl p-4 border border-border"
            style={{ borderColor: colors.border }}
          >
            {categoryData.length === 0 ? (
              <Text className="text-center text-muted py-4">
                No spending data for this month
              </Text>
            ) : (
              <>
                {renderPieChart()}
                <View className="mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
                  <FlatList
                    data={categoryData}
                    keyExtractor={(item) => item.name}
                    renderItem={renderCategoryItem}
                    scrollEnabled={false}
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {/* Monthly Trend */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">
            6-Month Trend
          </Text>
          <View
            className="bg-surface rounded-xl p-4 border border-border"
            style={{ borderColor: colors.border }}
          >
            {renderBarChart()}
          </View>
        </View>

        {/* Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
