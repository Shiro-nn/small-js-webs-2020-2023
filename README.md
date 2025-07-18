# small‑js‑webs‑2020‑2023 🌍📦

[![GitHub stars](https://img.shields.io/github/stars/Shiro-nn/small-js-webs-2020-2023?style=social)](https://github.com/Shiro-nn/small-js-webs-2020-2023/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Shiro-nn/small-js-webs-2020-2023?style=social)](https://github.com/Shiro-nn/small-js-webs-2020-2023/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Shiro-nn/small-js-webs-2020-2023)](https://github.com/Shiro-nn/small-js-webs-2020-2023/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/Shiro-nn/small-js-webs-2020-2023)](https://github.com/Shiro-nn/small-js-webs-2020-2023/commits)
[![License: MIT](https://img.shields.io/github/license/Shiro-nn/small-js-webs-2020-2023)](LICENSE)
[![Status: Archived](https://img.shields.io/badge/status-archived-lightgrey.svg)](https://github.com/Shiro-nn/small-js-webs-2020-2023)

![Repo Stats](https://github-readme-stats.vercel.app/api/pin/?username=Shiro-nn\&repo=small-js-webs-2020-2023)

> **small‑js‑webs‑2020‑2023** — микросборник **двух** крошечных Node.js‑веб‑серверов, написанных для быстрого раздачи статических файлов. Проекты использовались как вспомогательные «one‑shot» решения в личных пет‑проектах и в марте 2025 года были окончательно **архивированы**.

Код публикуется «как есть»: без гарантий безопасности, актуальности зависимостей и поддержки.

---

## 📂 Структура репозитория

| Директория   | Стек / версии                                      | Краткое описание                                                                                                                      |
| ------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `download`   | **Node.js 16+**  · `express@4`                     | Mini‑сервер, который отдаёт всё из поддиректории **`/public`** на **80** порту с кэш‑заголовками по умолчанию. Файл входа — `app.js`. |
| `getcontent` | **Node.js 18+**  · `fastify@4` + `@fastify/static` | Более лёгкая альтернатива на Fastify. Раздаёт директорию **`.public`** на **4252** порту; выводит в консоль сообщение при старте.     |

> ⚠️ **Не добавляйте новые каталоги**: репозиторий зафиксирован в этой конфигурации.

---

## 🚀 Быстрый старт

> Оба проекта изолированы: переходите в нужную папку, ставьте зависимости и запускайте. Ниже — минимальные команды без Docker и PM2.

### download (Express)

```bash
git clone https://github.com/Shiro-nn/small-js-webs-2020-2023.git
cd small-js-webs-2020-2023/download
npm install --production
node app.js          # слушает :80, потребуются root/PORT forwarding
```

*Папку `public/` создайте рядом с `app.js` и положите внутрь ваш контент.*

### getcontent (Fastify)

```bash
cd ../getcontent
npm install --production
node init.js         # слушает :4252
```

*Статику разместите в `.public/` (точка в названии обязательна — совпадает с кодом).* Файл `init.js` выведет «Раздатчик контента запущен…» при успешном старте.

---

## 🛠️ Требования

* **Node.js 16+** для `download` (Express 4).
* **Node.js 18+** для `getcontent` (Fastify 4) — использует современные ESM‑фичи и async‑hooks.
* Открытые порты **80** и/или **4252** либо соответствующий порт‑форвардинг (при запуске от не‑root можно изменить `PORT` через окружение и правку кода).

---

## 🤝 Вклад

Репозиторий **архивирован**. Принимаю только PR‑ы, исправляющие критические ошибки безопасности. Новые фичи и каталоги не рассматриваются.

---

## ⚖️ Лицензия

Код распространяется под лицензией **MIT**. Используйте на свой страх и риск.

> Спасибо, что заглянули! Возможно, эти мини‑сервера ускорят ваш прототип или станут отправной точкой для собственного проекта.
