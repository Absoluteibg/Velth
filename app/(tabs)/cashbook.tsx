/**
 * Cashbook Screen
 * Manual transaction logging and ledger view
 */

import React, { useState, useMemo } from 'react';
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
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScreenContainer } from '@/components/screen-container';
import { useFinance } from '@/lib/finance-context';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import { validateTransactionForm } from '@/lib/validators';
import { formatCurrency } from '@/lib/currency';

interface TransactionModalState {
  visible: boolean;
  amount: string;
  envelopeId: string;
  date: Date;
  notes: string;
  showDatePicker: boolean;
}

export default function CashbookScreen() {
  const { state, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const colors = useColors();
  const [modal, setModal] = useState<TransactionModalState>({
    visible: false,
    amount: '',
    envelopeId: state.envelopes[0]?.id || '',
    date: new Date(),
    notes: '',
    showDatePicker: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreateTransaction = () => {
    // Validate all fields
    const validation = validateTransactionForm(
      modal.amount,
      modal.envelopeId,
      modal.date.getTime(),
      modal.notes,
      state.envelopes
    );

    if (!validation.valid) {
      const errorMessages = Object.values(validation.errors).join('\n');
      Alert.alert('Validation Error', errorMessages);
      return;
    }

    const amount = parseFloat(modal.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (editingId) {
      updateTransaction(editingId, amount, modal.envelopeId, modal.date.getTime(), modal.notes);
      setEditingId(null);
    } else {
      addTransaction(amount, modal.envelopeId, modal.date.getTime(), modal.notes);
    }

    setModal({
      visible: false,
      amount: '',
      envelopeId: state.envelopes[0]?.id || '',
      date: new Date(),
      notes: '',
      showDatePicker: false,
    });
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingId(transaction.id);
    setModal({
      visible: true,
      amount: transaction.amount.toString(),
      envelopeId: transaction.envelopeId,
      date: new Date(transaction.date),
      notes: transaction.notes,
      showDatePicker: false,
    });
  };

  const handleDeleteTransaction = (id: string) => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: () => deleteTransaction(id),
        style: 'destructive',
      },
    ]);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setModal({ ...modal, showDatePicker: false });
    }
    if (selectedDate) {
      setModal({ ...modal, date: selectedDate });
    }
  };

  const sortedTransactions = useMemo(() => {
    return [...state.transactions].sort((a, b) => b.date - a.date);
  }, [state.transactions]);

  const renderTransactionItem = ({ item }: { item: any }) => {
    const envelope = state.envelopes.find((e) => e.id === item.envelopeId);
    const date = new Date(item.date);
    const dateStr = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return (
      <View
        className="bg-surface rounded-xl p-4 mb-2 border border-border flex-row justify-between items-center"
        style={{ borderColor: colors.border }}
      >
        <View className="flex-1">
          <View className="flex-row justify-between mb-1">
            <Text className="font-semibold text-foreground">
              {envelope?.name || 'Unknown'}
            </Text>
            <Text className="font-bold text-warning">₹{item.amount.toFixed(2)}</Text>
          </View>
          <Text className="text-xs text-muted mb-1">{dateStr}</Text>
          {item.notes && (
            <Text className="text-xs text-muted italic">{item.notes}</Text>
          )}
        </View>
        <View className="flex-row gap-2 ml-4">
          <TouchableOpacity
            onPress={() => handleEditTransaction(item)}
            className="px-2 py-1"
          >
            <Text className="text-xs font-medium" style={{ color: colors.primary }}>
              Edit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteTransaction(item.id)}
            className="px-2 py-1"
          >
            <Text className="text-xs font-medium" style={{ color: colors.error }}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const totalTransactions = state.transactions.length;
  const totalAmount = state.transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Cashbook</Text>
          <Text className="text-sm text-muted">Track all your transactions</Text>
        </View>

        {/* Summary Cards */}
        <View className="flex-row gap-3 mb-6">
          <View
            className="flex-1 bg-surface rounded-xl p-3 border border-border"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-xs text-muted mb-1">Transactions</Text>
            <Text className="text-lg font-bold text-foreground">
              {totalTransactions}
            </Text>
          </View>
          <View
            className="flex-1 bg-surface rounded-xl p-3 border border-border"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-xs text-muted mb-1">Total Spent</Text>
            <Text className="text-lg font-bold text-warning">
              ₹{totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Transactions List */}
        {sortedTransactions.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Text className="text-lg text-muted mb-4">No transactions yet</Text>
            <Text className="text-sm text-muted text-center">
              Add your first transaction to start tracking
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortedTransactions}
            keyExtractor={(item) => item.id}
            renderItem={renderTransactionItem}
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
          setModal({
            visible: true,
            amount: '',
            envelopeId: state.envelopes[0]?.id || '',
            date: new Date(),
            notes: '',
            showDatePicker: false,
          });
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

      {/* Date Picker Modal (Android) */}
      {modal.showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={modal.date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Create/Edit Transaction Modal */}
      <Modal
        visible={modal.visible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setModal({
            visible: false,
            amount: '',
            envelopeId: state.envelopes[0]?.id || '',
            date: new Date(),
            notes: '',
            showDatePicker: false,
          })
        }
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-surface rounded-t-3xl p-6 pb-8"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-2xl font-bold text-foreground mb-6">
              {editingId ? 'Edit Transaction' : 'Add Transaction'}
            </Text>

            {/* Amount Input */}
            <TextInput
              placeholder="Amount (e.g., 500)"
              placeholderTextColor={colors.muted}
              value={modal.amount}
              onChangeText={(text) => setModal({ ...modal, amount: text })}
              keyboardType="decimal-pad"
              className="border border-border rounded-lg p-3 mb-4 text-foreground"
              style={{
                borderColor: colors.border,
                color: colors.foreground,
              }}
            />

            {/* Envelope Selector */}
            {state.envelopes.length > 0 ? (
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">
                  Category
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row gap-2"
                >
                  {state.envelopes.map((envelope) => (
                    <TouchableOpacity
                      key={envelope.id}
                      onPress={() => setModal({ ...modal, envelopeId: envelope.id })}
                      className={cn(
                        'px-4 py-2 rounded-full border',
                        modal.envelopeId === envelope.id
                          ? 'border-primary'
                          : 'border-border'
                      )}
                      style={{
                        backgroundColor:
                          modal.envelopeId === envelope.id
                            ? colors.primary
                            : 'transparent',
                        borderColor:
                          modal.envelopeId === envelope.id
                            ? colors.primary
                            : colors.border,
                      }}
                    >
                      <Text
                        className={cn(
                          'text-sm font-medium',
                          modal.envelopeId === envelope.id
                            ? 'text-background'
                            : 'text-foreground'
                        )}
                      >
                        {envelope.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View className="mb-4 p-3 bg-warning/10 rounded-lg">
                <Text className="text-sm text-warning">
                  Please create an envelope first
                </Text>
              </View>
            )}

            {/* Date Picker */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Date</Text>
              <TouchableOpacity
                onPress={() => setModal({ ...modal, showDatePicker: true })}
                className="border border-border rounded-lg p-3"
                style={{ borderColor: colors.border }}
              >
                <Text className="text-foreground">
                  {modal.date.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
              {Platform.OS === 'ios' && modal.showDatePicker && (
                <DateTimePicker
                  value={modal.date}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Notes Input */}
            <TextInput
              placeholder="Notes (optional)"
              placeholderTextColor={colors.muted}
              value={modal.notes}
              onChangeText={(text) => setModal({ ...modal, notes: text })}
              multiline
              numberOfLines={3}
              className="border border-border rounded-lg p-3 mb-6 text-foreground"
              style={{
                borderColor: colors.border,
                color: colors.foreground,
                textAlignVertical: 'top',
              }}
            />

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() =>
                  setModal({
                    visible: false,
                    amount: '',
                    envelopeId: state.envelopes[0]?.id || '',
                    date: new Date(),
                    notes: '',
                    showDatePicker: false,
                  })
                }
                className="flex-1 border border-border rounded-lg py-3"
                style={{ borderColor: colors.border }}
              >
                <Text className="text-center font-semibold text-foreground">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateTransaction}
                className="flex-1 rounded-lg py-3"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-center font-semibold text-background">
                  {editingId ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
