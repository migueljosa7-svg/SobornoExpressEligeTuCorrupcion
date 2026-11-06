# Soborno Express: Elige tu Corrupción

Juego satírico tipo "swipe" (React + Vite + Tailwind + TypeScript) empaquetado con Capacitor.

## Desarrollo
    npm install
    npm run dev          # navegador / PWA
    npm run build        # tsc + vite build

## Android (requiere JDK 21 y Android SDK)
    npm run cap:sync     # build web + copia a android/
    ./gradlew assembleDebug     # APK -> android/app/build/outputs/apk/debug/
    ./gradlew bundleRelease     # AAB -> android/app/build/outputs/bundle/release/

`./gradlew` en la raíz delega en `android/`. Crea `android/local.properties` con `sdk.dir=...`
y define JAVA_HOME apuntando a un JDK 21.

## Firmar para Google Play
Genera un keystore (`keytool -genkey -v -keystore release.keystore -alias soborno -keyalg RSA -keysize 2048 -validity 10000`)
y firma el .aab con `jarsigner`, o configura `signingConfigs` en `android/app/build.gradle`. No subas el keystore al repo.

## Añadir eventos
Edita/crea JSON en `src/data/` (id, who, icon, text, left/right con label y fx {p,o,j,l}) e impórtalo en `src/lib/game.ts`.
