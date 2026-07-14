<p align="center">
  <img src="frontend/src/assets/images/logo.svg" alt="Decor Frontend" width="180">
</p>

<h1 align="center">Decor Frontend</h1>

<p align="center">
Frontend интернет-магазина растений, разработанный на <b>Angular 19</b>.
</p>

---

## 🚀 Требования

Перед запуском убедитесь, что установлены:

- Node.js 22+
- npm
- Angular CLI 19

Проверить версии можно командами:

```bash
node -v
npm -v
ng version
```

---

## ⚙️ Установка проекта

Клонируйте репозиторий и установите зависимости:

```bash
npm install
```

---

## ▶️ Запуск проекта

Для локальной разработки выполните:

```bash
npm start
```

или

```bash
ng serve
```

После запуска приложение будет доступно по адресу:

```
http://localhost:4200
```

Angular автоматически пересобирает проект после изменения файлов.

---

## 🛠 Production-сборка

Для сборки production-версии выполните:

```bash
npm run build
```

или

```bash
ng build
```

После завершения сборки готовые файлы будут находиться в папке:

```
dist/
```

---

## 🧩 Создание компонентов

Angular CLI позволяет быстро создавать новые компоненты.

Например:

```bash
ng generate component component-name
```

или сокращённо:

```bash
ng g c component-name
```

Полный список генераторов:

```bash
ng generate --help
```

---

## ✅ Запуск тестов

Unit-тесты:

```bash
ng test
```

---

## 🔄 End-to-End тестирование

Если в проекте подключено e2e-тестирование:

```bash
ng e2e
```

По умолчанию Angular не включает инструмент для e2e-тестирования, поэтому при необходимости можно использовать Cypress, Playwright или другое решение.

---

## 📋 Полезные команды

| Команда | Назначение |
|---------|------------|
| `npm install` | Установка зависимостей |
| `npm start` | Запуск проекта |
| `ng serve` | Запуск Angular Dev Server |
| `npm run build` | Production-сборка |
| `ng test` | Запуск unit-тестов |

---

## 📚 Используемые технологии

- Angular 19
- TypeScript
- RxJS
- SCSS
- Angular Router
- Angular Forms

---

## 📖 Документация

Официальная документация Angular:

https://angular.dev/