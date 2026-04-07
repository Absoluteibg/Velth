/**
 * Home/Dashboard Screen
 * Quick overview of financial status with premium design
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
    <ScreenContainer className="p-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="mb-8">
          <Text className="text-4xl font-bold text-foreground mb-1">Velth</Text>
          <Text className="text-base text-muted font-medium">Mindful Money Management</Text>
        </View>

        {/* Main Status Card - Premium */}
        <View
          className="bg-surface rounded-3xl p-7 mb-8 border border-border"
          style={{
            borderColor: colors.border,
            shadowColor: colors.foreground,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <Text className="text-sm font-semibold text-muted mb-5 tracking-wide">THIS MONTH'S OVERVIEW</Text>

          {/* Budget Progress */}
          <View className="mb-6">
            <View className="flex-row justify-between mb-3">
              <Text className="text-2xl font-bold text-foreground">₹{totalSpent.toFixed(2)}</Text>
              <Text className="text-sm font-medium text-muted">of ₹{totalBudget.toFixed(2)}</Text>
            </View>
            <View
              className="h-3.5 rounded-full overflow-hidden"
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
          <View className="flex-row justify-between items-center pt-6 border-t" style={{ borderColor: colors.border }}>
            <Text className="text-sm font-medium text-muted">Remaining Budget</Text>
            <Text className="text-3xl font-bold text-success">₹{remaining.toFixed(2)}</Text>
          </View>
        </View>

        {/* Quick Stats - Enhanced */}
        <View className="gap-4 mb-8">
          <View
            className="bg-surface rounded-2xl p-5 border border-border"
            style={{
              borderColor: colors.border,
              shadowColor: colors.foreground,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text className="text-xs font-semibold text-muted mb-2 tracking-wide">TOTAL BUDGET</Text>
            <Text className="text-3xl font-bold text-foreground">
              ₹{totalBudget.toFixed(2)}
            </Text>
          </View>

          <View className="flex-row gap-4">
            <View
              className="flex-1 bg-surface rounded-2xl p-5 border border-border"
              style={{
                borderColor: colors.border,
                shadowColor: colors.foreground,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text className="text-xs font-semibold text-muted mb-2 tracking-wide">TOTAL SPENT</Text>
              <Text className="text-2xl font-bold text-warning">
                ₹{totalSpent.toFixed(2)}
              </Text>
            </View>
            <View
              className="flex-1 bg-surface rounded-2xl p-5 border border-border"
              style={{
                borderColor: colors.border,
                shadowColor: colors.foreground,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text className="text-xs font-semibold text-muted mb-2 tracking-wide">REMAINING</Text>
              <Text className="text-2xl font-bold text-success">
                ₹{Math.max(0, totalBudget - totalSpent).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Top Spending Categories */}
        {topEnvelopes.length > 0 && (
          <View className="mb-8">
            <Text className="text-xl font-bold text-foreground mb-4">Top Spending</Text>
            {topEnvelopes.map((envelope) => {
              const percentage = envelope.budget > 0 ? (envelope.spent / envelope.budget) * 100 : 0;
              return (
                <View
                  key={envelope.id}
                  className="bg-surface rounded-2xl p-4 mb-3 border border-border flex-row justify-between items-center"
                  style={{
                    borderColor: colors.border,
                    shadowColor: colors.foreground,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {envelope.name}
                    </Text>
                    <Text className="text-xs text-muted font-medium">
                      ₹{envelope.spent.toFixed(2)} / ₹{envelope.budget.toFixed(2)}
                    </Text>
                  </View>
                  <Text className="text-base font-bold text-warning">
                    {percentage.toFixed(0)}%
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <View className="mb-8">
            <Text className="text-xl font-bold text-foreground mb-4">Recent Activity</Text>
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
                  className="bg-surface rounded-2xl p-4 mb-3 border border-border flex-row justify-between items-center"
                  style={{
                    borderColor: colors.border,
                    shadowColor: colors.foreground,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {envelope?.name || "Unknown"}
                    </Text>
                    <Text className="text-xs text-muted font-medium">{dateStr}</Text>
                  </View>
                  <Text className="text-base font-bold text-warning">
                    ₹{transaction.amount.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {state.envelopes.length === 0 && state.transactions.length === 0 && (
          <View className="items-center justify-center py-16">
            <Text className="text-xl font-bold text-foreground mb-3">
              Welcome to Velth
            </Text>
            <Text className="text-base text-muted text-center mb-8 leading-relaxed">
              Start by creating your first envelope to begin tracking your finances mindfully
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/envelopes")}
              className="px-8 py-4 rounded-full"
              style={{
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text className="text-base font-bold text-background">Create Envelope</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
