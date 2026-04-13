import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type StatusCardProps = {
  roomId: string;
  syncLabel: string;
  lastSyncedLabel: string;
  warning?: string | null;
};

export function StatusCard({
  roomId,
  syncLabel,
  lastSyncedLabel,
  warning,
}: StatusCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.metricsRow}>
        <View>
          <Text style={styles.label}>Room</Text>
          <Text style={styles.value}>{roomId}</Text>
        </View>
        <View>
          <Text style={styles.label}>Sync</Text>
          <Text style={styles.value}>{syncLabel}</Text>
        </View>
        <View>
          <Text style={styles.label}>Updated</Text>
          <Text style={styles.value}>{lastSyncedLabel}</Text>
        </View>
      </View>
      {warning ? <Text style={styles.warning}>{warning}</Text> : null}
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
  label: {
    color: '#7F8CB0',
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  value: {
    color: '#F4F7FF',
    fontSize: 15,
    fontWeight: '700',
  },
  warning: {
    color: '#FFCE8A',
    fontSize: 13,
    lineHeight: 19,
  },
});
