const {test} = require('node:test');
const assert = require('node:assert/strict');
const {catalogue} = require('../build-seo');

function age(birth, reference) {
  const {app} = catalogue();
  const nodes = {};
  for (const id of ['n', 'h', 'out', 'detail']) {
    nodes['#' + id] = {value:'', innerHTML:'', textContent:'', addEventListener(event, callback) { this[event] = callback; }};
  }
  app.TOOLS.find(tool => tool.id === 'age-calculator').init({querySelector:selector => nodes[selector]});
  nodes['#n'].value = birth;
  nodes['#h'].value = reference;
  nodes['#n'].input();
  return {output:nodes['#out'], detail:nodes['#detail'].textContent};
}

test('Month-end anniversaries clamp and never produce negative days', () => {
  assert(age('2025-01-31', '2025-02-28').output.innerHTML.startsWith('0 years, 1 months and 0 days'));
  assert(age('2025-01-31', '2025-03-01').output.innerHTML.startsWith('0 years, 1 months and 1 days'));
  assert(age('2024-01-31', '2024-03-01').output.innerHTML.startsWith('0 years, 1 months and 1 days'));
  assert(age('2025-01-31', '2025-03-30').output.innerHTML.startsWith('0 years, 1 months and 30 days'));
  assert(age('2000-06-15', '2025-06-15').output.innerHTML.startsWith('25 years, 0 months and 0 days'));
});

test('February 29 birthdays use February 28 in a non-leap year', () => {
  const birthday = age('2000-02-29', '2025-02-28').output.innerHTML;
  assert(birthday.startsWith('25 years, 0 months and 0 days'));
  assert(birthday.includes('Today is the birthday!'));
  assert(age('2000-02-29', '2025-02-27').output.innerHTML.includes('Next birthday in 1 days'));
  assert(age('2000-02-29', '2024-02-28').output.innerHTML.includes('Next birthday in 1 days'));
  assert(age('2000-02-29', '2025-03-01').output.innerHTML.includes('Next birthday in 364 days'));
});

test('Age, elapsed days and weekday are independent of browser time zone', () => {
  const previousZone = process.env.TZ;
  try {
    const results = [];
    for (const zone of ['UTC', 'America/Sao_Paulo', 'Pacific/Auckland']) {
      process.env.TZ = zone;
      const result = age('2000-06-15', '2025-06-15');
      assert(result.detail.includes('Day of the week you were born: Thursday'));
      assert(result.output.innerHTML.includes('Today is the birthday!'));
      results.push([result.output.innerHTML, result.detail]);
    }
    assert.deepEqual(results[1], results[0]);
    assert.deepEqual(results[2], results[0]);
  } finally {
    if (previousZone === undefined) delete process.env.TZ;
    else process.env.TZ = previousZone;
  }
});

test('Invalid or reversed dates clear stale age details', () => {
  for (const [birth, reference] of [['', '2025-06-15'], ['2025-02-29', '2025-06-15'], ['2025-06-16', '2025-06-15']]) {
    const result = age(birth, reference);
    assert.equal(result.output.textContent, '—');
    assert.equal(result.detail, '');
  }
});
