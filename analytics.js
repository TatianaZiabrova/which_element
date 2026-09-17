// Счётчик посещений на GoatCounter. Метки уходят картинкой 1×1, без кук и без
// сторонних библиотек. Ответы, имена и любые личные данные не отправляются —
// только метки вида step-03, finish и element-Na.

// Код сайта из GoatCounter: статистика открывается на
// https://schoolusu.goatcounter.com. Если строку очистить,
// счётчик замолчит, а тест продолжит работать как раньше.
const SITE = 'schoolusu';

const sent = new Set();

function send(params) {
  if (!SITE) return;
  try {
    const url = new URL(`https://${SITE}.goatcounter.com/count`);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    url.searchParams.set('rnd', Math.random().toString(36).slice(2)); // чтобы браузер не взял ответ из кеша
    new Image().src = url.href;
  } catch { /* счётчик никогда не должен ломать тест */ }
}

// Заход на страницу.
export function visit() {
  send({p: location.pathname, t: document.title, r: document.referrer});
}

// Шаг теста. Каждая метка уходит не чаще одного раза за визит,
// поэтому кнопка «Назад» и повторное прохождение статистику не накручивают.
export function count(name, title) {
  if (sent.has(name)) return;
  sent.add(name);
  send({p: name, t: title, e: 'true'});
}
