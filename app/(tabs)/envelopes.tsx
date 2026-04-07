/**
 * Envelope Budgeting Screen
 * Manage budget envelopes and track spending per category
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

interface CreateEnvelopeModalState {
  visible: boolean;
  name: string;
  budget: string;
}

export default function EnvelopesScreen() {
  const { state, addEnvelope, deleteEnvelope, updateEnvelope } = useFinance();
  const colors = useColors();
  const [modal, setModal] = useState<CreateEnvelopeModalState>({
    visible: false,
    name: '',
    budget: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreateEnvelope = () => {
    if (!modal.name.trim() || !modal.budget.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const budgetAmount = parseFloat(modal.budget);
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    if (editingId) {
      updateEnvelope(editingId, modal.name, budgetAmount);
      setEditingId(null);
    } else {
      addEnvelope(modal.name, budgetAmount);
    }

    setModal({ visible: false, name: '', budget: '' });
  };

  const handleEditEnvelope = (id: string, name: string, budget: number) => {
    setEditingId(id);
    setModal({
      visible: true,
      name,
      budget: budget.toString(),
    });
  };

  const handleDeleteEnvelope = (id: string) => {
    Alert.alert('Delete Envelope', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: () => deleteEnvelope(id),
        style: 'destructive',
      },
    ]);
  };

  const getPercentageUsed = (spent: number, budget: number) => {
    if (budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  const renderEnvelopeCard = ({ item }: { item: any }) => {
    const percentageUsed = getPercentageUsed(item.spent, item.budget);
    const remaining = Math.max(0, item.budget - item.spent);
    const isOverBudget = item.spent > item.budget;

    return (
      <View
        className="bg-surface rounded-2xl p-4 mb-3 border border-border"
        style={{ borderColor: colors.border }}
      >
        {/* Header: Name and Actions */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-foreground flex-1">
            {item.name}
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => handleEditEnvelope(item.id, item.name, item.budget)}
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-xs font-medium text-background">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteEnvelope(item.id)}
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: colors.error }}
            >
              <Text className="text-xs font-medium text-background">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Budget Info */}
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-muted">
            Budget: ₹{item.budget.toFixed(2)}
          </Text>
          <Text className={cn('text-sm font-medium', isOverBudget ? 'text-error' : 'text-success')}>
            Spent: ₹{item.spent.toFixed(2)}
          </Text>
        </View>

        {/* Progress Bar */}
        <View
          className="h-2 rounded-full overflow-hidden mb-2"
          style={{ backgroundColor: colors.border }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${percentageUsed}%`,
              backgroundColor: isOverBudget ? colors.error : colors.primary,
            }}
          />
        </View>

        {/* Remaining */}
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">
            {percentageUsed.toFixed(0)}% used
          </Text>
          <Text className={cn('text-xs font-medium', isOverBudget ? 'text-error' : 'text-success')}>
            {isOverBudget ? `Over by ₹${(item.spent - item.budget).toFixed(2)}` : `₹${remaining.toFixed(2)} remaining`}
          </Text>
        </View>
      </View>
    );
  };

  const totalBudget = state.envelopes.reduce((sum, e) => sum + e.budget, 0);
  const totalSpent = state.envelopes.reduce((sum, e) => sum + e.spent, 0);

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Envelopes</Text>
          <Text className="text-sm text-muted">Manage your budget categories</Text>
        </View>

        {/* Summary Cards */}
        <View className="flex-row gap-3 mb-6">
          <View
            className="flex-1 bg-surface rounded-xl p-3 border border-border"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-xs text-muted mb-1">Total Budget</Text>
            <Text className="text-lg font-bold text-foreground">
              ₹{totalBudget.toFixed(2)}
            </Text>
          </View>
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
            <Text className="text-xs text-muted mb-1">Remaining</Text>
            <Text className="text-lg font-bold text-success">
              ₹{Math.max(0, totalBudget - totalSpent).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Envelopes List */}
        {state.envelopes.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Text className="text-lg text-muted mb-4">No envelopes yet</Text>
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
        <View className="h-20" />
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        onPress={() => {
          setEditingId(null);
          setModal({ visible: true, name: '', budget: '' });
        }}
        style={({ pressed }) => [
          {
            position: 'absolute',
            bottom: 80,
            right: 16,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        <Text className="text-2xl text-background font-bold">+</Text>
      </Pressable>

      {/* Create/Edit Envelope Modal */}
      <Modal
        visible={modal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setModal({ visible: false, name: '', budget: '' })}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-surface rounded-t-3xl p-6 pb-8"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-2xl font-bold text-foreground mb-6">
              {editingId ? 'Edit Envelope' : 'Create Envelope'}
            </Text>

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
              placeholder="Budget amount (e.g., 5000)"
              placeholderTextColor={colors.muted}
              value={modal.budget}
              onChangeText={(text) => setModal({ ...modal, budget: text })}
              keyboardType="decimal-pad"
              className="border border-border rounded-lg p-3 mb-6 text-foreground"
              style={{
                borderColor: colors.border,
                color: colors.foreground,
              }}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setModal({ visible: false, name: '', budget: '' })}
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
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
