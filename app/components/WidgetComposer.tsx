import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type WidgetComposerProps = {
  partnerName: string;
  message: string;
  onPartnerNameChange: (value: string) => void;
  onMessageChange: (value: string) => void;
};

export function WidgetComposer({
  partnerName,
  message,
  onPartnerNameChange,
  onMessageChange,
}: WidgetComposerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Widget Story</Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Partner name</Text>
          <TextInput
            autoCorrect={false}
            onChangeText={onPartnerNameChange}
            placeholder="Aditi"
            placeholderTextColor="#6C7896"
            style={styles.input}
            value={partnerName}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Widget message</Text>
          <TextInput
            autoCorrect={false}
            onChangeText={onMessageChange}
            placeholder="Made this for you"
            placeholderTextColor="#6C7896"
            style={styles.input}
            value={message}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    backgroundColor: '#101B32',
    borderWidth: 1,
    borderColor: '#1E2943',
    padding: 18,
    gap: 12,
  },
  field: {
    flex: 1,
    gap: 8,
  },
  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#25304B',
    backgroundColor: '#0D162A',
    color: '#F6F8FF',
    paddingHorizontal: 16,
    fontSize: 15,
  },
  label: {
    color: '#7F8CB0',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  title: {
    color: '#F4F7FF',
    fontSize: 16,
    fontWeight: '700',
  },
});
