# Cutu Canvas MVP

Cutu Canvas is an Android-first React Native MVP that lets a shared room draw on a canvas, sync the strokes through Supabase, mirror the latest payload into native Android cache, and render that cache inside a live wallpaper service.

## Stack

- React Native CLI + TypeScript
- `@shopify/react-native-skia` for drawing
- Supabase realtime for canvas sync
- Kotlin `WallpaperService` for Android live wallpaper rendering
- Android `AppWidgetProvider` for home-screen widget previews

## Local setup

1. Install the Android React Native toolchain, including Java and Android Studio.
2. Open [app/config/supabase.ts](./app/config/supabase.ts) and replace the placeholder URL and anon key.
3. Apply [supabase/schema.sql](./supabase/schema.sql) to your Supabase project.
4. Start Metro:

```sh
npm start
```

5. In another terminal, run Android:

```sh
npm run android
```

## MVP flow

1. Launch the app and enter a shared room code.
2. Draw on the canvas.
3. The app debounces writes to Supabase and subscribes to realtime updates.
4. Every local or remote update is mirrored into Android shared preferences.
5. The home-screen widget renders the latest cached drawing with partner/message metadata.
6. Tap `Apply Wallpaper` to open the Android live wallpaper picker with `CutuWallpaperService`.

## Key directories

- `app/screens` - primary UI
- `app/hooks` - drawing and sync session logic
- `app/services` - Supabase and native bridge wrappers
- `android/app/src/main/java/com/cutucanvas/wallpaper` - wallpaper service, cache repo, renderer
- `android/app/src/main/java/com/cutucanvas/wallpaper/CutuWidgetProvider.kt` - widget provider
- `android/app/src/main/java/com/cutucanvas/bridge` - React Native native module and package

## Notes

- This MVP is Android-only for wallpaper rendering.
- Supabase auth is intentionally deferred; room codes scope the shared canvas.
- The wallpaper redraws on cache updates and lifecycle changes rather than on a continuous frame loop.
