/**
 * Home/Dashboard Screen
 * Quick overview of financial status
 */

import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useFinance } from "@/lib/finance-context";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const router = useRouter();
  const { state } = useFinance();
  const colors = useColors();

  const totalBudget = state.envelopes.reduce((sum, e) => sum + e.budget, 0);
  const totalSpent = state.envelopes.reduce((sum, e) => sum + e.spent, 0);
  const remaining = Math.max(0, totalBudget - totalSpent);
  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const topEnvelopes = state.envelopes
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  const recentTransactions = state.transactions
    .sort((a, b) => b.date - a.date)
    .slice(0, 3);

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-1">Velth</Text>
          <Text className="text-sm text-muted">Mindful Money Management</Text>
        </View>

        {/* Main Status Card */}
        <View
          className="bg-surface rounded-2xl p-6 mb-6 border border-border"
          style={{ borderColor: colors.border }}
        >
          <Text className="text-sm text-muted mb-4">This Month's Overview</Text>

          {/* Budget Progress */}
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-lg font-bold text-foreground">₹{totalSpent.toFixed(2)}</Text>
              <Text className="text-sm text-muted">of ₹{totalBudget.toFixed(2)}</Text>
            </View>
            <View
              className="h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: colors.border }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(percentageUsed, 100)}%`,
                  backgroundColor: percentageUsed > 100 ? colors.error : colors.primary,
                }}
              />
            </View>
          </View>

          {/* Remaining */}
          <View className="flex-row justify-between items-center pt-4 border-t" style={{ borderColor: colors.border }}>
            <Text className="text-sm text-muted">Remaining Budget</Text>
            <Text className="text-2xl font-bold text-success">₹{remaining.toFixed(2)}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row gap-3 mb-6">
          <View
            className="flex-1 bg-surface rounded-xl p-3 border border-border"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-xs text-muted mb-1">Envelopes</Text>
            <Text className="text-2xl font-bold text-foreground">
              {state.envelopes.length}
            </Text>
          </View>
          <View
            className="flex-1 bg-surface rounded-xl p-3 border border-border"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-xs text-muted mb-1">Transactions</Text>
            <Text className="text-2xl font-bold text-foreground">
              {state.transactions.length}
            </Text>
          </View>
        </View>

        {/* Top Spending Categories */}
        {topEnvelopes.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Top Spending
            </Text>
            {topEnvelopes.map((envelope) => {
              const percentage = envelope.budget > 0 ? (envelope.spent / envelope.budget) * 100 : 0;
              return (
                <View
                  key={envelope.id}
                  className="bg-surface rounded-lg p-3 mb-2 border border-border flex-row justify-between items-center"
                  style={{ borderColor: colors.border }}
                >
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">
                      {envelope.name}
                    </Text>
                    <Text className="text-xs text-muted">
                      ₹{envelope.spent.toFixed(2)} / ₹{envelope.budget.toFixed(2)}
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-warning">
                    {percentage.toFixed(0)}%
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Recent Activity
            </Text>
            {recentTransactions.map((transaction) => {
              const envelope = state.envelopes.find((e) => e.id === transaction.envelopeId);
              const date = new Date(transaction.date);
              const dateStr = date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              });

              return (
                <View
                  key={transaction.id}
                  className="bg-surface rounded-lg p-3 mb-2 border border-border flex-row justify-between items-center"
                  style={{ borderColor: colors.border }}
                >
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">
                      {envelope?.name || "Unknown"}
                    </Text>
                    <Text className="text-xs text-muted">{dateStr}</Text>
                  </View>
                  <Text className="text-sm font-semibold text-warning">
                    ₹{transaction.amount.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {state.envelopes.length === 0 && state.transactions.length === 0 && (
          <View className="items-center justify-center py-12">
            <Text className="text-lg font-semibold text-foreground mb-2">
              Welcome to Velth
            </Text>
            <Text className="text-sm text-muted text-center mb-6">
              Start by creating your first envelope to begin tracking your finances
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/envelopes")}
              className="px-6 py-3 rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-background font-semibold">Create Envelope</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
