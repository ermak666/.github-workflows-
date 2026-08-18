# Подписанный Android-релиз и GitHub Release

Workflow **Build Signed Android Release** формирует два подписанных файла:

| Файл | Назначение |
| --- | --- |
| `app-release.apk` | Установка на Android-устройство вручную |
| `app-release.aab` | Загрузка в Google Play Console |

При отправке тега формата `release-v1.0.0` workflow автоматически создаёт GitHub Release и прикрепляет оба файла. Ручной запуск создаёт артефакты в Actions, но не создаёт публичный релиз.

## Обязательные GitHub Secrets

В репозитории откройте **Settings → Secrets and variables → Actions** и добавьте четыре секретных значения:

| Имя | Что хранит |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64 содержимого release keystore |
| `ANDROID_KEYSTORE_PASSWORD` | Пароль keystore |
| `ANDROID_KEY_ALIAS` | Псевдоним ключа |
| `ANDROID_KEY_PASSWORD` | Пароль ключа |

Не добавляйте keystore, пароли или Base64-строку в Git, код или обычные переменные workflow. Ключ подписи должен оставаться постоянным: Google Play использует его для проверки обновлений приложения. [1]

## Запуск релиза

```bash
git tag release-v1.0.0
git push origin release-v1.0.0
```

После успеха откройте вкладку **Releases** в GitHub и скачайте APK либо загрузите AAB в Google Play Console.

## Ссылки

[1]: https://docs.expo.dev/guides/local-app-production/ "Expo: подпись локального Android-релиза"
