/**
 * Enhanced Envelope Budgeting Screen
 * Manage budget envelopes with goals, opening balance, and add/reduce functionality
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
  Pressable,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useFinance } from '@/lib/finance-context';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';

interface CreateEnvelopeModalState {
  visible: boolean;
  name: string;
  budget: string;
  openingBalance: string;
  goal: string;
  alertThreshold: string;
}

interface AdjustBalanceModalState {
  visible: boolean;
  envelopeId: string;
  amount: string;
  reason: string;
}

export default function EnvelopesScreen() {
  const { state, addEnvelope, deleteEnvelope, updateEnvelope, adjustEnvelopeBalance } = useFinance();
  const colors = useColors();
  const currency = state.settings.currency;
  const [modal, setModal] = useState<CreateEnvelopeModalState>({
    visible: false,
    name: '',
    budget: '',
    openingBalance: '',
    goal: '',
    alertThreshold: '80',
  });
  const [adjustModal, setAdjustModal] = useState<AdjustBalanceModalState>({
    visible: false,
    envelopeId: '',
    amount: '',
    reason: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreateEnvelope = () => {
    if (!modal.name.trim() || !modal.budget.trim()) {
      Alert.alert('Error', 'Please fill in required fields (Name and Budget)');
      return;
    }

    const budgetAmount = parseFloat(modal.budget);
    const openingBalance = parseFloat(modal.openingBalance) || 0;
    const goal = parseFloat(modal.goal) || 0;

    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    if (editingId) {
      const alertThreshold = parseFloat(modal.alertThreshold) || 80;
      updateEnvelope(editingId, modal.name, budgetAmount, openingBalance, goal, alertThreshold);
      setEditingId(null);
    } else {
      addEnvelope(modal.name, budgetAmount, openingBalance, goal);
    }

    setModal({
      visible: false,
      name: '',
      budget: '',
      openingBalance: '',
      goal: '',
      alertThreshold: '80',
    });
  };

  const handleEditEnvelope = (envelope: any) => {
    setEditingId(envelope.id);
    setModal({
      visible: true,
      name: envelope.name,
      budget: envelope.budget.toString(),
      openingBalance: envelope.openingBalance.toString(),
      goal: envelope.goal.toString(),
      alertThreshold: envelope.alertThreshold.toString(),
    });
  };

  const handleDeleteEnvelope = (id: string) => {
    Alert.alert('Delete Envelope', 'This will delete all transactions in this envelope. Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: () => deleteEnvelope(id),
        style: 'destructive',
      },
    ]);
  };

  const handleAdjustBalance = () => {
    if (!adjustModal.amount.trim() || !adjustModal.reason.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amount = parseFloat(adjustModal.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    adjustEnvelopeBalance(adjustModal.envelopeId, amount, adjustModal.reason);
    setAdjustModal({ visible: false, envelopeId: '', amount: '', reason: '' });
  };

  const getPercentageUsed = (spent: number, budget: number) => {
    if (budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  const getGoalProgress = (spent: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min((spent / goal) * 100, 100);
  };

  const renderEnvelopeCard = ({ item }: { item: any }) => {
    const percentageUsed = getPercentageUsed(item.spent, item.budget);
    const remaining = Math.max(0, item.budget - item.spent);
    const isOverBudget = item.spent > item.budget;
    const isNearAlert = percentageUsed >= item.alertThreshold;
    const goalProgress = getGoalProgress(item.spent, item.goal);

    return (
      <View
        className="bg-surface rounded-3xl p-5 mb-4 border border-border shadow-lg"
        style={{
          borderColor: colors.border,
          shadowColor: colors.foreground,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Header: Name and Actions */}
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground mb-1">
              {item.name}
            </Text>
            {isNearAlert && (
              <View className="flex-row items-center gap-1">
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors.warning }}
                />
                <Text className="text-xs font-medium text-warning">
                  Alert: {percentageUsed.toFixed(0)}% used
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => handleEditEnvelope(item)}
              className="px-3 py-2 rounded-lg"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-xs font-semibold text-background">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteEnvelope(item.id)}
              className="px-3 py-2 rounded-lg"
              style={{ backgroundColor: colors.error }}
            >
              <Text className="text-xs font-semibold text-background">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Opening Balance */}
        {item.openingBalance > 0 && (
          <View className="mb-3 pb-3 border-b" style={{ borderColor: colors.border }}>
            <Text className="text-xs text-muted mb-1">Opening Balance</Text>
                      <Text className="text-sm text-success">
              {formatCurrency(item.openingBalance, currency)}
            </Text>
          </View>
        )}

        {/* Budget Section */}
        <View className="mb-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm font-medium text-muted">Budget Allocation</Text>
            <Text className="text-sm font-bold text-foreground">
              {formatCurrency(item.budget, currency)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-xs text-muted">Spent</Text>
            <Text className={cn('text-xs font-semibold', isOverBudget ? 'text-error' : 'text-warning')}>
              {formatCurrency(item.spent, currency)}
            </Text>
          </View>

          {/* Progress Bar */}
          <View
            className="h-2.5 rounded-full overflow-hidden mb-2"
            style={{ backgroundColor: colors.border }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${percentageUsed}%`,
                backgroundColor: isOverBudget ? colors.error : isNearAlert ? colors.warning : colors.primary,
              }}
            />
          </View>

          <View className="flex-row justify-between">
            <Text className="text-xs text-muted">
              {percentageUsed.toFixed(0)}% used
            </Text>
            <Text className={cn('text-xs font-semibold', isOverBudget ? 'text-error' : 'text-success')}>
              {isOverBudget ? `Over by ${formatCurrency(item.spent - item.budget, currency)}` : `${formatCurrency(remaining, currency)} left`}
            </Text>
          </View>
        </View>

        {/* Goal Section */}
        {item.goal > 0 && (
          <View className="mb-4 pb-4 border-b" style={{ borderColor: colors.border }}>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-medium text-muted">Savings Goal</Text>
              <Text className="text-sm font-bold text-foreground">
                {formatCurrency(item.goal, currency)}
              </Text>
            </View>

            {/* Goal Progress Bar */}
            <View
              className="h-2 rounded-full overflow-hidden mb-2"
              style={{ backgroundColor: colors.border }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  width: `${goalProgress}%`,
                  backgroundColor: colors.success,
                }}
              />
            </View>

            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">
                {goalProgress.toFixed(0)}% towards goal
              </Text>
              <Text className="text-xs font-semibold text-success">
                {formatCurrency(Math.max(0, item.goal - item.spent), currency)} to go
              </Text>
            </View>
          </View>
        )}

        {/* Add/Reduce Button */}
        <TouchableOpacity
          onPress={() => setAdjustModal({ visible: true, envelopeId: item.id, amount: '', reason: '' })}
          className="py-2 rounded-lg border border-primary"
          style={{ borderColor: colors.primary }}
        >
          <Text className="text-center text-sm font-semibold text-primary">
            Add / Reduce Balance
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const totalBudget = state.envelopes.reduce((sum, e) => sum + e.budget, 0);
  const totalSpent = state.envelopes.reduce((sum, e) => sum + e.spent, 0);
  const totalGoal = state.envelopes.reduce((sum, e) => sum + e.goal, 0);

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-4xl font-bold text-foreground mb-2">Envelopes</Text>
          <Text className="text-sm text-muted">Manage your budget categories</Text>
        </View>

        {/* Summary Cards */}
        <View className="gap-3 mb-6">
          <View
            className="bg-surface rounded-2xl p-4 border border-border shadow-md"
            style={{
              borderColor: colors.border,
              shadowColor: colors.foreground,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Text className="text-xs text-muted mb-1 font-medium">Total Budget</Text>
            <Text className="text-2xl font-bold text-foreground">
              {formatCurrency(totalBudget, currency)}
            </Text>
          </View>

          <View className="flex-row gap-3">
            <View
              className="flex-1 bg-surface rounded-2xl p-4 border border-border shadow-md"
              style={{
                borderColor: colors.border,
                shadowColor: colors.foreground,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text className="text-xs text-muted mb-1 font-medium">Total Spent</Text>
              <Text className="text-2xl font-bold text-warning">
                {formatCurrency(totalSpent, currency)}
              </Text>            </View>
            <View
              className="flex-1 bg-surface rounded-2xl p-4 border border-border shadow-md"
              style={{
                borderColor: colors.border,
                shadowColor: colors.foreground,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text className="text-xs text-muted mb-1 font-medium">Remaining</Text>              <Text className="text-2xl font-bold text-success">
                {formatCurrency(Math.max(0, totalBudget - totalSpent), currency)}
              </Text>
            </View>
          </View>

          {totalGoal > 0 && (
            <View
              className="bg-surface rounded-2xl p-4 border border-border shadow-md"
              style={{
                borderColor: colors.border,
                shadowColor: colors.foreground,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text className="text-xs text-muted mb-1 font-medium">Total Savings Goal</Text>
            <Text className="text-2xl font-bold text-success">
              {formatCurrency(totalGoal, currency)}
            </Text>
            </View>
          )}
        </View>

        {/* Envelopes List */}
        {state.envelopes.length === 0 ? (
          <View className="items-center justify-center py-16">
            <Text className="text-lg font-semibold text-muted mb-2">No envelopes yet</Text>
            <Text className="text-sm text-muted text-center">
              Create your first envelope to start budgeting
            </Text>
          </View>
        ) : (
          <FlatList
            data={state.envelopes}
            keyExtractor={(item) => item.id}
            renderItem={renderEnvelopeCard}
            scrollEnabled={false}
          />
        )}

        {/* Spacing for FAB */}
        <View className="h-24" />
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        onPress={() => {
          setEditingId(null);
          setModal({
            visible: true,
            name: '',
            budget: '',
            openingBalance: '',
            goal: '',
            alertThreshold: '80',
          });
        }}
        style={({ pressed }) => [
          {
            position: 'absolute',
            bottom: 100,
            right: 20,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.92 : 1 }],
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          },
        ]}
      >
        <Text className="text-3xl text-background font-bold">+</Text>
      </Pressable>

      {/* Create/Edit Envelope Modal */}
      <Modal
        visible={modal.visible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setModal({
            visible: false,
            name: '',
            budget: '',
            openingBalance: '',
            goal: '',
            alertThreshold: '80',
          })
        }
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-surface rounded-t-3xl p-6 pb-8"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-2xl font-bold text-foreground mb-6">
              {editingId ? 'Edit Envelope' : 'Create Envelope'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                placeholder="Envelope name (e.g., Food)"
                placeholderTextColor={colors.muted}
                value={modal.name}
                onChangeText={(text) => setModal({ ...modal, name: text })}
                className="border border-border rounded-lg p-3 mb-4 text-foreground"
                style={{
                  borderColor: colors.border,
                  color: colors.foreground,
                }}
              />

              <TextInput
                placeholder="Budget amount (required)"
                placeholderTextColor={colors.muted}
                value={modal.budget}
                onChangeText={(text) => setModal({ ...modal, budget: text })}
                keyboardType="decimal-pad"
                className="border border-border rounded-lg p-3 mb-4 text-foreground"
                style={{
                  borderColor: colors.border,
                  color: colors.foreground,
                }}
              />

              <TextInput
                placeholder="Opening balance (optional)"
                placeholderTextColor={colors.muted}
                value={modal.openingBalance}
                onChangeText={(text) => setModal({ ...modal, openingBalance: text })}
                keyboardType="decimal-pad"
                className="border border-border rounded-lg p-3 mb-4 text-foreground"
                style={{
                  borderColor: colors.border,
                  color: colors.foreground,
                }}
              />

              <TextInput
                placeholder="Savings goal (optional)"
                placeholderTextColor={colors.muted}
                value={modal.goal}
                onChangeText={(text) => setModal({ ...modal, goal: text })}
                keyboardType="decimal-pad"
                className="border border-border rounded-lg p-3 mb-4 text-foreground"
                style={{
                  borderColor: colors.border,
                  color: colors.foreground,
                }}
              />

              <TextInput
                placeholder="Alert threshold % (default: 80)"
                placeholderTextColor={colors.muted}
                value={modal.alertThreshold}
                onChangeText={(text) => setModal({ ...modal, alertThreshold: text })}
                keyboardType="decimal-pad"
                className="border border-border rounded-lg p-3 mb-6 text-foreground"
                style={{
                  borderColor: colors.border,
                  color: colors.foreground,
                }}
              />

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() =>
                    setModal({
                      visible: false,
                      name: '',
                      budget: '',
                      openingBalance: '',
                      goal: '',
                      alertThreshold: '80',
                    })
                  }
                  className="flex-1 border border-border rounded-lg py-3"
                  style={{ borderColor: colors.border }}
                >
                  <Text className="text-center font-semibold text-foreground">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateEnvelope}
                  className="flex-1 rounded-lg py-3"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-center font-semibold text-background">
                    {editingId ? 'Update' : 'Create'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Adjust Balance Modal */}
      <Modal
        visible={adjustModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setAdjustModal({ visible: false, envelopeId: '', amount: '', reason: '' })}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-surface rounded-t-3xl p-6 pb-8"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-2xl font-bold text-foreground mb-6">
              Add / Reduce Balance
            </Text>

            <TextInput
              placeholder="Amount"
              placeholderTextColor={colors.muted}
              value={adjustModal.amount}
              onChangeText={(text) => setAdjustModal({ ...adjustModal, amount: text })}
              keyboardType="decimal-pad"
              className="border border-border rounded-lg p-3 mb-4 text-foreground"
              style={{
                borderColor: colors.border,
                color: colors.foreground,
              }}
            />

            <TextInput
              placeholder="Reason (e.g., Salary, Refund)"
              placeholderTextColor={colors.muted}
              value={adjustModal.reason}
              onChangeText={(text) => setAdjustModal({ ...adjustModal, reason: text })}
              className="border border-border rounded-lg p-3 mb-6 text-foreground"
              style={{
                borderColor: colors.border,
                color: colors.foreground,
              }}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setAdjustModal({ visible: false, envelopeId: '', amount: '', reason: '' })}
                className="flex-1 border border-border rounded-lg py-3"
                style={{ borderColor: colors.border }}
              >
                <Text className="text-center font-semibold text-foreground">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAdjustBalance}
                className="flex-1 rounded-lg py-3"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-center font-semibold text-background">Adjust</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
