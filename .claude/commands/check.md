# Verificación FacturaIA

1. `git branch --show-current` — debe ser `main`
2. `cd android && ./gradlew assembleRelease` — debe compilar
3. `ls -la android/app/build/outputs/apk/release/` — APK existe?
4. `git status --porcelain | wc -l` — dirty files

Formato: BRANCH: OK/FAIL, BUILD: OK/FAIL, APK: existe/no, DIRTY: N
