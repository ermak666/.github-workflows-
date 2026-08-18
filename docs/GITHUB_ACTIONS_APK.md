# Автоматическая APK-сборка из GitHub

Этот проект содержит workflow `.github/workflows/android-apk.yml`. Он запускает **облачную** Android-сборку APK двумя способами: вручную из вкладки **Actions** или после отправки тега, начинающегося с `v`, например `v1.0.1`.

## Однократная подготовка

Перед первым запуском необходимо связать копию проекта с вашим аккаунтом Expo. На своём компьютере установите зависимости, войдите в Expo и выполните первоначальную настройку:

```bash
corepack enable
pnpm install
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android --profile apk
```

Во время первого запуска Expo создаст проект, добавит идентификатор `extra.eas.projectId` в конфигурацию приложения и подготовит Android-ключ подписи. Сохраните эти изменения в GitHub-репозитории. Без этого одноразового шага облачная сборка из CI не сможет работать в неинтерактивном режиме.[1]

## Секрет GitHub

Создайте в Expo персональный токен доступа, затем в репозитории GitHub откройте **Settings → Secrets and variables → Actions → New repository secret**. Назовите секрет строго `EXPO_TOKEN` и вставьте токен. Значение токена не добавляйте в файлы проекта, сообщения или историю Git.[1]

## Запуск APK-сборки

Для ручного запуска в GitHub откройте **Actions → Build Android APK → Run workflow**. Для запуска по версии выполните:

```bash
git tag v1.0.1
git push origin v1.0.1
```

Workflow отправит запрос в Expo и закончит работу после успешной постановки сборки в очередь. Ссылка на страницу сборки будет в журнале шага **Trigger Android APK build**. После завершения на этой странице можно скачать и установить файл `.apk` на Android‑устройство.[1][2]

## Что создаёт профиль `apk`

Профиль `apk` в `eas.json` использует `android.buildType: "apk"` и `distribution: "internal"`. Он предназначен для прямой установки на телефон; производственный профиль можно оставить для формата AAB и публикации в Google Play.[2]

## References

[1] [Expo: Trigger builds from CI](https://docs.expo.dev/build/building-on-ci/)

[2] [Expo: Build APKs for Android devices](https://docs.expo.dev/build-reference/apk/)
