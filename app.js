import {elements, questions, getResult} from './data.js';
import {visit, count} from './analytics.js';

const main = document.querySelector('#main');
const notice = document.querySelector('#notice');
const letters = ['А','Б','В','Г','Д'];
const publicUrl = 'https://tatianaziabrova.github.io/which_element/';
let answers = Array(questions.length).fill(null);
let current = -1;
let result = null;
let noticeTimer;
let cachedCard = null;

function notify(text) { clearTimeout(noticeTimer); notice.textContent = text; noticeTimer = setTimeout(() => { notice.textContent = ''; }, 6000); }
function focusHeading() { main.querySelector('h1')?.focus({preventScroll:true}); window.scrollTo({top:0, behavior:'instant'}); }
function intro() {
  current = -1;
  main.innerHTML = `<section class="intro enter"><div><div class="eyebrow">Химия твоего настроения</div><h1>Какой ты<br>химический<br>элемент <em>сегодня?</em></h1><p class="intro-copy">Готовишься сиять или просишь ни с кем не реагировать?<br><strong>Давай узнаем, что у тебя за химия.</strong></p><button class="primary" id="start">Узнать свой элемент <span aria-hidden="true">→</span></button><div class="intro-meta"><span>8 простых вопросов</span><span>≈ 2 минуты</span><span>10 элементов</span></div></div><div class="card-scene" aria-hidden="true"><div class="sample-card sample-ne"><span class="atomic-number">10</span><span class="symbol">Ne</span><span class="element-name">Неон</span><span class="sample-caption">Красиво не реагирую</span></div><div class="sample-card sample-na"><span class="atomic-number">11</span><span class="symbol">Na</span><span class="element-name">Натрий</span><span class="sample-caption">Уже в реакции</span></div><p class="scene-note"><span>↖</span> А кто сегодня ты?</p></div></section>`;
  document.querySelector('#start').onclick = () => start();
}
function start() { answers = Array(questions.length).fill(null); current = 0; result = null; cachedCard = null; renderQuestion(); }
function renderQuestion() {
  count('step-' + String(current+1).padStart(2,'0'), `Вопрос ${current+1} из ${questions.length}`);
  const question = questions[current];
  main.innerHTML = `<section class="quiz enter"><div class="quiz-top"><span>Твоё настроение сегодня</span><strong>${current+1} / ${questions.length}</strong></div><div class="progress" role="progressbar" aria-label="Пройдено вопросов" aria-valuemin="0" aria-valuemax="8" aria-valuenow="${current}">${questions.map((_,i) => `<span class="${i<=current?'done':''}"></span>`).join('')}</div><p class="question-number">Вопрос ${String(current+1).padStart(2,'0')}</p><h1 id="question-title" tabindex="-1">${question.title}</h1><fieldset class="options" aria-labelledby="question-title">${question.options.map((option,i) => `<label class="option"><input type="radio" name="answer" value="${i}" ${answers[current]===i?'checked':''}><span class="letter" aria-hidden="true">${letters[i]}</span><span>${option.text}</span></label>`).join('')}</fieldset><div class="quiz-actions"><button class="back" id="back">← ${current===0?'К началу':'Назад'}</button><button class="primary" id="next" ${answers[current]===null?'disabled':''}>${current===7?'Мой элемент':'Дальше'} <span aria-hidden="true">→</span></button></div><p class="helper">Здесь нет правильных ответов. Выбирай, как чувствуешь сегодня.</p></section>`;
  main.querySelectorAll('input').forEach(input => input.onchange = () => { answers[current] = Number(input.value); document.querySelector('#next').disabled = false; });
  document.querySelector('#back').onclick = () => { if(current===0) {intro();document.querySelector('#start').focus();} else {current--;renderQuestion();} };
  document.querySelector('#next').onclick = advance;
  focusHeading();
}
function advance() { if(answers[current]===null) return; if(current<7) {current++;renderQuestion();} else {result=getResult(answers);renderResult();} }
function renderResult() {
  const e = elements[result];
  count('finish', 'Дошёл до конца');
  count('element-' + result, e.name);
  main.innerHTML = `<section class="result-layout enter"><article class="result-card" style="--element-color:${e.color}" aria-label="Твой элемент — ${e.name}"><div class="result-top"><span>Мой элемент сегодня</span><span>${e.number}</span></div><div class="result-element"><span class="result-symbol">${result}</span><span class="result-name">${e.name}</span></div><h2>${e.title}</h2><p class="result-description">${e.text}</p><div class="result-sign"><span>Химия с Татьяной</span><span>@schoolusu</span></div></article><div class="result-aside"><div class="eyebrow">Реакция прошла успешно</div><h1 tabindex="-1">Сегодня у тебя<br>вот такая химия.</h1><p class="lead">Узнаёшь себя? Сохрани карточку<br>и сравни настроение с друзьями.</p><div class="tip"><div class="tip-label">Маленький совет на сегодня</div><p>${e.tip}</p></div><div class="result-actions"><button class="primary" id="save">Сохранить карточку <span aria-hidden="true">↓</span></button><button class="secondary" id="share">Поделиться с друзьями <span aria-hidden="true">↗</span></button></div><div class="result-links"><button class="text-button" id="again">Пройти ещё раз</button><a href="https://t.me/schoolusu" target="_blank" rel="noopener noreferrer">В канал Татьяны ↗</a></div><p class="small-note">Это настроение, а не ярлык. Завтра ты можешь быть совсем другим элементом.</p></div></section>`;
  document.querySelector('#save').onclick = saveCard;
  document.querySelector('#share').onclick = shareCard;
  document.querySelector('#again').onclick = start;
  focusHeading();
  makeCard(result).then(blob => { if (result === eKey(e)) cachedCard = blob; }).catch(() => {});
}
function eKey(element) { return Object.keys(elements).find(key=>elements[key]===element); }

// Локальный PNG: без внешних картинок, библиотек и отправки ответов на сервер.
export async function makeCard(key) {
  const e = elements[key];
  if (!e) throw new Error('Неизвестный элемент');
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Не удалось создать карточку');
  ctx.fillStyle = '#f4f6fa'; ctx.fillRect(0,0,1080,1350);
  ctx.fillStyle = '#1b2439'; rounded(ctx,65,65,962,1160,34); ctx.fill();
  ctx.fillStyle = e.color; rounded(ctx,53,53,962,1160,34); ctx.fill();
  ctx.strokeStyle = '#1b2439'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#1b2439'; ctx.font = '24px Arial'; ctx.fillText('МОЙ ЭЛЕМЕНТ СЕГОДНЯ',105,116);
  ctx.textAlign='right';ctx.fillText(String(e.number),960,116);ctx.textAlign='left';
  ctx.font='bold 210px Arial';ctx.fillText(key,97,340);
  ctx.font='bold 52px Arial';ctx.textAlign='right';ctx.fillText(e.name,960,335);ctx.textAlign='left';
  line(ctx,105,390,960);
  let y=465;
  ctx.font='bold 58px Arial'; y=wrapped(ctx,e.title,105,y,840,67);
  y+=27;ctx.font='34px Arial';y=wrapped(ctx,e.text,105,y,850,48);
  y+=38;ctx.font='bold 22px Arial';ctx.fillText('СОВЕТ НА СЕГОДНЯ',105,y);
  y+=43;ctx.font='32px Arial';y=wrapped(ctx,e.tip,105,y,840,44);
  if(y>1110) throw new Error('Описание не помещается на карточке');
  line(ctx,105,1125,960);
  ctx.font='26px Arial';ctx.fillText('Химия с Татьяной',105,1173);ctx.textAlign='right';ctx.fillText('@schoolusu',960,1173);ctx.textAlign='left';
  ctx.fillStyle='#647087';ctx.font='24px Arial';ctx.textAlign='center';ctx.fillText('Узнай свой элемент: tatianaziabrova.github.io/which_element',540,1280);
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Не удалось сохранить изображение')),'image/png'));
}
function rounded(ctx,x,y,w,h,r) { ctx.beginPath(); ctx.roundRect(x,y,w,h,r); }
function line(ctx,x,y,end) {ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(end,y);ctx.strokeStyle='#1b243955';ctx.lineWidth=2;ctx.stroke();}
function wrapped(ctx,text,x,y,width,height) {let row='';for(const word of text.split(' ')){const next=row?row+' '+word:word;if(row&&ctx.measureText(next).width>width){ctx.fillText(row,x,y);y+=height;row=word;}else row=next;}if(row)ctx.fillText(row,x,y);return y+height;}
function download(blob,key) {const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`moy-element-${key}.png`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
async function saveCard() {const key=result;const button=document.querySelector('#save');button.disabled=true;try{const blob=cachedCard||await makeCard(key);download(blob,key);notify('Карточка готова. Если она открылась отдельно — удерживай её, чтобы сохранить.');}catch{notify('Не получилось скачать карточку. Можно сделать скриншот результата.');}finally{button.disabled=false;}}
async function shareCard() {
  const key=result;const e=elements[key];const button=document.querySelector('#share');
  const text=`Сегодня я — ${e.name.toLowerCase()}: «${e.title}». А какой элемент ты?`;
  button.disabled=true;
  try {
    // Используем заранее подготовленный файл, чтобы сохранить жест нажатия в мобильных браузерах.
    const file=cachedCard?new File([cachedCard],`moy-element-${key}.png`,{type:'image/png'}):null;
    if(file&&navigator.canShare?.({files:[file]})&&navigator.share){await navigator.share({files:[file],title:'Мой элемент сегодня',text:text+' '+publicUrl});}
    else if(navigator.share){await navigator.share({title:'Мой элемент сегодня',text,url:publicUrl});}
    else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text+' '+publicUrl);notify('Текст и ссылка скопированы. Карточку можно скачать отдельной кнопкой.');}
    else {window.prompt('Скопируй текст и отправь друзьям:',text+' '+publicUrl);}
  } catch(error) {if(error.name!=='AbortError'){window.prompt('Скопируй текст и отправь друзьям:',text+' '+publicUrl);}}
  finally {button.disabled=false;}
}

intro();
visit();

// Дополнительный доступ к тому же тесту в браузерах с поддержкой WebMCP.
if(document.modelContext?.registerTool){
  const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool)).catch(()=>{});}catch{}};
  register({name:'read_chemical_quiz',description:'Получить вопросы теста и текущее состояние без изменений.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({questions:questions.map(q=>({title:q.title,answers:q.options.map(o=>o.text)})),current,answers:[...answers],result})});
  register({name:'complete_chemical_quiz',description:'Ответить на восемь вопросов и показать результат теста. Индексы вариантов от 0 до 4.',inputSchema:{type:'object',properties:{answers:{type:'array',items:{type:'integer',minimum:0,maximum:4},minItems:8,maxItems:8}},required:['answers'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{const key=getResult(input?.answers);answers=[...input.answers];current=7;result=key;cachedCard=null;renderResult();return {symbol:key,...elements[key]};}});
}
