/**
 * Settings Screen
 * User profile, preferences, currency, and data management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Share,
  Pressable,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useFinance } from '@/lib/finance-context';
import { useColors } from '@/hooks/use-colors';
import { CurrencyCode } from '@/lib/types';

const CURRENCIES: { code: CurrencyCode; symbol: string; name: string }[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
];

export default function SettingsScreen() {
  const { state, setUserProfile, updateSettings, setCurrency, exportDataAsJSON, importDataFromJSON, deleteAllData } = useFinance();
  const colors = useColors();

  const [profileModal, setProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(state.userProfile.name);
  const [profileEmail, setProfileEmail] = useState(state.userProfile.email);
  const [currencyModal, setCurrencyModal] = useState(false);

  const handleSaveProfile = () => {
    if (!profileName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    setUserProfile({
      name: profileName,
      email: profileEmail,
    });
    setProfileModal(false);
  };

  const handleChangeCurrency = (currency: CurrencyCode) => {
    setCurrency(currency);
    setCurrencyModal(false);
  };

  const handleExportData = async () => {
    try {
      const jsonData = exportDataAsJSON();
      await Share.share({
        message: jsonData,
        title: 'Velth Data Backup',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleImportData = () => {
    Alert.prompt(
      'Import Data',
      'Paste your backup JSON data:',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Import',
          onPress: (text: string | undefined) => {
            if (text && importDataFromJSON(text)) {
              Alert.alert('Success', 'Data imported successfully');
            } else {
              Alert.alert('Error', 'Invalid data format');
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your financial data. This action cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            deleteAllData();
            Alert.alert('Success', 'All data has been deleted');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const selectedCurrency = CURRENCIES.find((c) => c.code === state.settings.currency);

  return (
    <ScreenContainer className="p-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="mb-8">
          <Text className="text-4xl font-bold text-foreground mb-1">Settings</Text>
          <Text className="text-base text-muted font-medium">Manage your profile and preferences</Text>
        </View>

        {/* Profile Section */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">Profile</Text>

          <TouchableOpacity
            onPress={() => setProfileModal(true)}
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
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-xs font-semibold text-muted mb-1 tracking-wide">NAME</Text>
                <Text className="text-lg font-bold text-foreground">{state.userProfile.name}</Text>
              </View>
              <Text className="text-primary font-semibold">Edit</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Currency Section */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">Currency</Text>

          <TouchableOpacity
            onPress={() => setCurrencyModal(true)}
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
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-xs font-semibold text-muted mb-1 tracking-wide">SELECTED CURRENCY</Text>
                <Text className="text-lg font-bold text-foreground">
                  {selectedCurrency?.symbol} {selectedCurrency?.name}
                </Text>
              </View>
              <Text className="text-primary font-semibold">Change</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Auto-Save Section */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">Auto-Save</Text>

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
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base font-semibold text-foreground">Enabled</Text>
              <View
                className="w-12 h-7 rounded-full"
                style={{
                  backgroundColor: state.settings.autoSaveEnabled ? colors.success : colors.border,
                }}
              />
            </View>
            <Text className="text-sm text-muted">
              Auto-save is {state.settings.autoSaveEnabled ? 'enabled' : 'disabled'}. Your data is saved automatically every {state.settings.autoSaveInterval / 1000} seconds.
            </Text>
          </View>
        </View>

        {/* Data Management Section */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">Data Management</Text>

          <TouchableOpacity
            onPress={handleExportData}
            className="bg-surface rounded-2xl p-5 border border-border mb-3"
            style={{
              borderColor: colors.border,
              shadowColor: colors.foreground,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-base font-semibold text-foreground">Export Data</Text>
                <Text className="text-sm text-muted mt-1">Download backup as JSON</Text>
              </View>
              <Text className="text-primary font-semibold">Export</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleImportData}
            className="bg-surface rounded-2xl p-5 border border-border mb-3"
            style={{
              borderColor: colors.border,
              shadowColor: colors.foreground,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-base font-semibold text-foreground">Import Data</Text>
                <Text className="text-sm text-muted mt-1">Restore from backup</Text>
              </View>
              <Text className="text-primary font-semibold">Import</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAllData}
            className="bg-surface rounded-2xl p-5 border border-border"
            style={{
              borderColor: colors.error,
              shadowColor: colors.foreground,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-base font-semibold text-error">Delete All Data</Text>
                <Text className="text-sm text-muted mt-1">Permanently remove all data</Text>
              </View>
              <Text className="text-error font-semibold">Delete</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">About</Text>

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
            <View className="mb-4">
              <Text className="text-xs font-semibold text-muted mb-1 tracking-wide">VERSION</Text>
              <Text className="text-base font-bold text-foreground">1.0.0</Text>
            </View>
            <View>
              <Text className="text-xs font-semibold text-muted mb-1 tracking-wide">APP NAME</Text>
              <Text className="text-base font-bold text-foreground">Velth</Text>
            </View>
          </View>
        </View>

        {/* Spacing */}
        <View className="h-8" />
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={profileModal}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-surface rounded-t-3xl p-6 pb-8"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-2xl font-bold text-foreground mb-6">Edit Profile</Text>

            <TextInput
              placeholder="Full name"
              placeholderTextColor={colors.muted}
              value={profileName}
              onChangeText={setProfileName}
              className="border border-border rounded-lg p-3 mb-4 text-foreground"
              style={{
                borderColor: colors.border,
                color: colors.foreground,
              }}
            />

            <TextInput
              placeholder="Email (optional)"
              placeholderTextColor={colors.muted}
              value={profileEmail}
              onChangeText={setProfileEmail}
              keyboardType="email-address"
              className="border border-border rounded-lg p-3 mb-6 text-foreground"
              style={{
                borderColor: colors.border,
                color: colors.foreground,
              }}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setProfileModal(false)}
                className="flex-1 border border-border rounded-lg py-3"
                style={{ borderColor: colors.border }}
              >
                <Text className="text-center font-semibold text-foreground">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveProfile}
                className="flex-1 rounded-lg py-3"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-center font-semibold text-background">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Currency Modal */}
      <Modal
        visible={currencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setCurrencyModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-surface rounded-t-3xl p-6 pb-8 max-h-4/5"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-2xl font-bold text-foreground mb-6">Select Currency</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {CURRENCIES.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  onPress={() => handleChangeCurrency(currency.code)}
                  className="py-4 px-4 border-b"
                  style={{ borderColor: colors.border }}
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-base font-semibold text-foreground">
                        {currency.symbol} {currency.name}
                      </Text>
                      <Text className="text-sm text-muted">{currency.code}</Text>
                    </View>
                    {state.settings.currency === currency.code && (
                      <View
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: colors.primary }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setCurrencyModal(false)}
              className="mt-4 rounded-lg py-3"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-center font-semibold text-background">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
