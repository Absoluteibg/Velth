/**
 * Donate Screen
 * Support the developer and view app information
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

const DONATION_OPTIONS = [
  { amount: 50, label: '₹50', description: 'Coffee' },
  { amount: 100, label: '₹100', description: 'Lunch' },
  { amount: 500, label: '₹500', description: 'Dinner' },
  { amount: 1000, label: '₹1000', description: 'Premium Support' },
  { amount: 5000, label: '₹5000', description: 'VIP Support' },
];

export default function DonateScreen() {
  const colors = useColors();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [paymentModal, setPaymentModal] = useState(false);

  const handleDonate = (amount: number) => {
    setSelectedAmount(amount);
    setPaymentModal(true);
  };

  const handlePaymentMethod = (method: string) => {
    setPaymentModal(false);
    Alert.alert(
      'Payment',
      `Redirecting to ${method} for ₹${selectedAmount}...`,
      [{ text: 'OK', onPress: () => {} }]
    );
    // In a real app, integrate with UPI/PayPal APIs
  };

  return (
    <ScreenContainer className="p-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="mb-8">
          <Text className="text-4xl font-bold text-foreground mb-1">Support Velth</Text>
          <Text className="text-base text-muted font-medium">Help us build better financial tools</Text>
        </View>

        {/* Developer Message */}
        <View
          className="bg-surface rounded-2xl p-6 border border-border mb-8"
          style={{
            borderColor: colors.border,
            shadowColor: colors.foreground,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text className="text-lg font-bold text-foreground mb-3">Developer Notes</Text>
          <Text className="text-base text-muted leading-relaxed">
            Hi! I'm the developer behind Velth. This app was built with passion to help you manage your finances mindfully. Your support helps me continue improving and adding new features.
          </Text>
          <Text className="text-sm text-muted mt-4 leading-relaxed">
            Every donation, no matter the size, makes a difference and motivates me to build better features for you.
          </Text>
        </View>

        {/* Why Support */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">Why Support?</Text>

          <View
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
            <Text className="text-base font-semibold text-foreground mb-2">🚀 New Features</Text>
            <Text className="text-sm text-muted">
              Your support helps me develop new features like advanced analytics, cloud sync, and more.
            </Text>
          </View>

          <View
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
            <Text className="text-base font-semibold text-foreground mb-2">🐛 Bug Fixes</Text>
            <Text className="text-sm text-muted">
              Donations help me maintain the app, fix bugs, and ensure smooth performance.
            </Text>
          </View>

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
            <Text className="text-base font-semibold text-foreground mb-2">💝 Support</Text>
            <Text className="text-sm text-muted">
              Your support motivates me to keep building and improving Velth for you.
            </Text>
          </View>
        </View>

        {/* Donation Options */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">Choose Amount</Text>

          {DONATION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.amount}
              onPress={() => handleDonate(option.amount)}
              className="bg-surface rounded-2xl p-5 border border-border mb-3 flex-row justify-between items-center"
              style={{
                borderColor: colors.border,
                shadowColor: colors.foreground,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View>
                <Text className="text-lg font-bold text-foreground">{option.label}</Text>
                <Text className="text-sm text-muted">{option.description}</Text>
              </View>
              <Text className="text-primary font-semibold">Donate</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Other Ways to Support */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">Other Ways to Support</Text>

          <TouchableOpacity
            onPress={() => Alert.alert('Share', 'Share Velth with your friends and family!')}
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
                <Text className="text-base font-semibold text-foreground">Share Velth</Text>
                <Text className="text-sm text-muted mt-1">Tell your friends about the app</Text>
              </View>
              <Text className="text-primary font-semibold">Share</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Alert.alert('Rate', 'Rate Velth on the app store!')}
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
                <Text className="text-base font-semibold text-foreground">⭐ Rate Us</Text>
                <Text className="text-sm text-muted mt-1">5-star review on app store</Text>
              </View>
              <Text className="text-primary font-semibold">Rate</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Alert.alert('Feedback', 'Send us your feedback and suggestions!')}
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
                <Text className="text-base font-semibold text-foreground">💬 Feedback</Text>
                <Text className="text-sm text-muted mt-1">Share your ideas and suggestions</Text>
              </View>
              <Text className="text-primary font-semibold">Send</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center py-8">
          <Text className="text-sm text-muted text-center leading-relaxed">
            Thank you for supporting Velth! 🙏
          </Text>
          <Text className="text-xs text-muted mt-4">
            Made with ❤️ by the Velth Team
          </Text>
        </View>

        {/* Spacing */}
        <View className="h-8" />
      </ScrollView>

      {/* Payment Method Modal */}
      <Modal
        visible={paymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-surface rounded-t-3xl p-6 pb-8"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-2xl font-bold text-foreground mb-2">Donate ₹{selectedAmount}</Text>
            <Text className="text-sm text-muted mb-6">Choose payment method</Text>

            <TouchableOpacity
              onPress={() => handlePaymentMethod('UPI')}
              className="bg-primary rounded-lg py-4 mb-3"
            >
              <Text className="text-center font-semibold text-background text-base">
                Pay with UPI
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlePaymentMethod('PayPal')}
              className="bg-primary rounded-lg py-4 mb-3"
            >
              <Text className="text-center font-semibold text-background text-base">
                Pay with PayPal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlePaymentMethod('Card')}
              className="bg-primary rounded-lg py-4 mb-6"
            >
              <Text className="text-center font-semibold text-background text-base">
                Pay with Card
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPaymentModal(false)}
              className="border border-border rounded-lg py-3"
              style={{ borderColor: colors.border }}
            >
              <Text className="text-center font-semibold text-foreground">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
