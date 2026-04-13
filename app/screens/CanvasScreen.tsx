import React, { useDeferredValue, useMemo, useState } from 'react';
import {
  Alert,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Canvas,
  Path,
  RoundedRect,
  Skia,
} from '@shopify/react-native-skia';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CanvasToolbar } from '../components/CanvasToolbar';
import { StatusCard } from '../components/StatusCard';
import { WidgetComposer } from '../components/WidgetComposer';
import { DEFAULT_ROOM_ID } from '../config/supabase';
import { useCanvasSession } from '../hooks/useCanvasSession';
import { buildStrokePath, formatSyncTime } from '../utils/canvasPayload';
import { wallpaperBridge } from '../services/wallpaperBridge';

export function CanvasScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [draftRoomId, setDraftRoomId] = useState(DEFAULT_ROOM_ID);
  const [activeRoomId, setActiveRoomId] = useState(DEFAULT_ROOM_ID);

  const {
    beginStroke,
    clearCanvas,
    endStroke,
    error,
    extendStroke,
    isSupabaseConfigured,
    lastSyncedAt,
    message,
    partnerName,
    setViewport,
    setMessage,
    setPartnerName,
    strokes,
    syncState,
    viewport,
  } = useCanvasSession(activeRoomId);

  const deferredStrokes = useDeferredValue(strokes);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: event => {
          beginStroke({
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
          });
        },
        onPanResponderMove: event => {
          extendStroke({
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
          });
        },
        onPanResponderRelease: () => {
          endStroke();
        },
        onPanResponderTerminate: () => {
          endStroke();
        },
        onStartShouldSetPanResponder: () => true,
      }),
    [beginStroke, endStroke, extendStroke],
  );

  async function handleApplyWallpaper() {
    try {
      const opened = await wallpaperBridge.openPicker();
      if (!opened) {
        Alert.alert(
          'Wallpaper module unavailable',
          'Build and run on Android to open the live wallpaper picker.',
        );
      }
    } catch (pickerError) {
      Alert.alert(
        'Unable to open wallpaper picker',
        pickerError instanceof Error
          ? pickerError.message
          : 'Please try again from an Android device.',
      );
    }
  }

  const warningMessage = !isSupabaseConfigured
    ? 'Add your Supabase URL and anon key in app/config/supabase.ts to enable multi-device sync. Local drawing and wallpaper cache still work.'
    : error;

  const syncLabel =
    syncState === 'loading'
      ? 'Loading'
      : syncState === 'syncing'
        ? 'Syncing'
        : syncState === 'error'
          ? 'Issue'
          : 'Live';

  const canvasHeight = Math.max(320, height * 0.45);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CUTU CANVAS MVP</Text>
        <Text style={styles.title}>Draw once, sync instantly, live on the wallpaper.</Text>
        <Text style={styles.subtitle}>
          Android-first collaborative canvas with a native live wallpaper renderer.
        </Text>
      </View>

      <StatusCard
        roomId={activeRoomId}
        syncLabel={syncLabel}
        lastSyncedLabel={formatSyncTime(lastSyncedAt)}
        warning={warningMessage}
      />

      <CanvasToolbar
        draftRoomId={draftRoomId}
        onDraftRoomIdChange={setDraftRoomId}
        onJoinRoom={() => setActiveRoomId(draftRoomId.trim() || DEFAULT_ROOM_ID)}
        onApplyWallpaper={handleApplyWallpaper}
        onClearCanvas={clearCanvas}
      />

      <WidgetComposer
        message={message}
        onMessageChange={setMessage}
        onPartnerNameChange={setPartnerName}
        partnerName={partnerName}
      />

      <View style={[styles.canvasShell, { height: canvasHeight }]}>
        <View style={styles.canvasBackdrop} />
        <Canvas
          onLayout={event => {
            const { width, height: nextHeight } = event.nativeEvent.layout;
            setViewport({ width, height: nextHeight });
          }}
          style={styles.canvas}
        >
          <RoundedRect
            x={0}
            y={0}
            width={viewport?.width ?? 0}
            height={viewport?.height ?? 0}
            r={28}
            color="#09111F"
          />
          <RoundedRect
            x={14}
            y={16}
            width={Math.max((viewport?.width ?? 0) - 28, 0)}
            height={Math.max((viewport?.height ?? 0) - 32, 0)}
            r={22}
            color="#0F1A2F"
          />
          {deferredStrokes.map(stroke => {
            if (stroke.points.length < 2) {
              return null;
            }

            return (
              <Path
                color={stroke.color}
                key={stroke.id}
                path={buildStrokePath(stroke)}
                strokeCap="round"
                strokeJoin="round"
                strokeWidth={stroke.width}
                style="stroke"
              />
            );
          })}
          <Path
            color="rgba(255,255,255,0.04)"
            path={Skia.Path.Make().addCircle(
              (viewport?.width ?? 0) - 52,
              50,
              26,
            )}
            style="fill"
          />
          <Path
            color="rgba(255,107,157,0.10)"
            path={Skia.Path.Make().addCircle(56, (viewport?.height ?? 0) - 56, 32)}
            style="fill"
          />
        </Canvas>
        <View
          {...panResponder.panHandlers}
          style={styles.touchLayer}
        />
        <View style={styles.canvasOverlay}>
          <Text style={styles.canvasHint}>Touch and draw anywhere in the live canvas.</Text>
          <Pressable onPress={handleApplyWallpaper} style={styles.floatingButton}>
            <Text style={styles.floatingButtonText}>Push to Wallpaper</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
  canvasBackdrop: {
    ...StyleSheet.absoluteFill,
    borderRadius: 28,
    backgroundColor: '#0A1220',
  },
  canvasHint: {
    color: '#B8C3E1',
    fontSize: 13,
    fontWeight: '500',
  },
  canvasOverlay: {
    position: 'absolute',
    right: 18,
    left: 18,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  canvasShell: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#202C46',
    backgroundColor: '#0B1424',
    position: 'relative',
  },
  eyebrow: {
    color: '#FF9FBE',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  floatingButton: {
    backgroundColor: 'rgba(255,107,157,0.18)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.45)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  floatingButtonText: {
    color: '#FFE0EA',
    fontSize: 13,
    fontWeight: '700',
  },
  header: {
    gap: 8,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#09111F',
    gap: 18,
  },
  subtitle: {
    color: '#94A2C5',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 420,
  },
  title: {
    color: '#F4F7FF',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    maxWidth: 420,
  },
  touchLayer: {
    ...StyleSheet.absoluteFill,
  },
});
