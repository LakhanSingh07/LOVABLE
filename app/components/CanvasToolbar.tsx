import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type CanvasToolbarProps = {
  draftRoomId: string;
  onDraftRoomIdChange: (value: string) => void;
  onJoinRoom: () => void;
  onApplyWallpaper: () => void;
  onClearCanvas: () => void;
};

export function CanvasToolbar({
  draftRoomId,
  onDraftRoomIdChange,
  onJoinRoom,
  onApplyWallpaper,
  onClearCanvas,
}: CanvasToolbarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.roomRow}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onDraftRoomIdChange}
          placeholder="Shared room code"
          placeholderTextColor="#6C7896"
          style={styles.input}
          value={draftRoomId}
        />
        <Pressable onPress={onJoinRoom} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Join</Text>
        </Pressable>
      </View>
      <View style={styles.actionRow}>
        <Pressable onPress={onClearCanvas} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Clear</Text>
        </Pressable>
        <Pressable onPress={onApplyWallpaper} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Apply Wallpaper</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  container: {
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#25304B',
    backgroundColor: '#0D162A',
    color: '#F6F8FF',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    borderRadius: 16,
    justifyContent: 'center',
    minWidth: 88,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: '#09111F',
    fontSize: 15,
    fontWeight: '700',
  },
  roomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#273550',
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: '#DCE6FF',
    fontSize: 14,
    fontWeight: '600',
  },
});
