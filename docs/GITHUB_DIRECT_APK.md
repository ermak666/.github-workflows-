# Быстрый APK через GitHub Actions

Этот вариант создаёт **устанавливаемый тестовый APK** прямо на сервере GitHub: без ожидания облачной Expo-сборки и без ключей доступа Expo. Он предназначен для установки на свой Android-смартфон и проверки приложения.

> Файл `app-debug.apk` автоматически подписывается отладочным ключом. Он подходит для личного тестирования, но не для публикации в Google Play.

## Как получить APK

1. Загрузите исходный код в репозиторий GitHub вместе с папкой `.github`.
2. Откройте вкладку **Actions** в репозитории.
3. Выберите workflow **Build Android APK Directly**.
4. Нажмите **Run workflow** и подтвердите запуск.
5. После успеха откройте конкретный запуск. В блоке **Artifacts** скачайте `python-bez-strakha-debug-apk-<номер>`.
6. Распакуйте архив и передайте `app-debug.apk` на телефон. Android может попросить разрешить установку из этого источника.

Workflow также запускается после отправки тега вида `android-v1.0.0`:

```bash
git tag android-v1.0.0
git push origin android-v1.0.0
```

## Что делает workflow

| Шаг | Результат |
| --- | --- |
| Устанавливает Node.js, Java 17 и зависимости | Подготавливает среду Android-сборки |
| Генерирует папку `android` через Expo | Создаёт нативный Android-проект для текущего кода |
| Выполняет `assembleDebug` | Создаёт устанавливаемый `app-debug.apk` |
| Прикрепляет файл к запуску GitHub | APK можно скачать из **Artifacts** 14 дней |

## Когда понадобится ключ подписи

Для Google Play требуется релизная подпись. Не добавляйте keystore в репозиторий. Храните его в секретах GitHub в Base64-представлении вместе с псевдонимом и паролями; затем отдельный release-workflow сможет восстанавливать ключ только во время сборки.

Официальная документация Expo описывает необходимость upload key для релизной Android-сборки, а GitHub рекомендует использовать Gradle cache и artifacts для передачи результата. [1] [2] [3]

## Ссылки

[1]: https://docs.expo.dev/guides/local-app-production/ "Expo: локальная релизная Android-сборка"
[2]: https://docs.github.com/actions/guides/building-and-testing-java-with-gradle "GitHub: сборка с Gradle"
[3]: https://github.com/actions/upload-artifact "GitHub Actions: upload-artifact"
