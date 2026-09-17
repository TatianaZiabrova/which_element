import test from 'node:test';
import assert from 'node:assert/strict';
import {elements, questions, getResult} from '../data.js';

test('Второй вопрос сохраняет согласованные химические пары', () => {
  assert.deepEqual([questions[1].options[0].primary, questions[1].options[0].secondary], ['Na','Mg']);
  assert.deepEqual([questions[1].options[1].primary, questions[1].options[1].secondary], ['Ne','Au']);
  assert.match(questions[1].options[1].text, /^Не приду/);
});

test('Неполные и неверные ответы не дают результат', () => {
  for (const answers of [[],null,Array(8).fill(null),Array(8).fill(5),Array(8).fill(-1),Array(8).fill('1'),Array(8).fill(0.5)]) {
    assert.throws(()=>getResult(answers));
  }
});

test('Все 390625 вариантов дают результат; каждый элемент достижим', () => {
  const counts=Object.fromEntries(Object.keys(elements).map(key=>[key,0]));
  for(let n=0;n<5**8;n++) {
    let v=n;
    const answers=questions.map(()=>{const digit=v%5;v=Math.floor(v/5);return digit;});
    const result=getResult(answers);
    assert.ok(elements[result]);
    counts[result]++;
  }
  for(const count of Object.values(counts)) {
    assert.ok(count>0,'Каждый результат должен быть достижим');
    assert.ok(count/(5**8)<0.25,'Один элемент не должен занимать более четверти комбинаций');
  }
  console.log('Распределение по комбинациям (не прогноз реальной аудитории):',counts);
});

test('Повторные ответы и ничьи разрешаются предсказуемо', () => {
  const answers=[1,1,1,1,1,1,1,1];
  assert.equal(getResult(answers),'Ne');
  assert.equal(getResult(answers),getResult([...answers]));
});
