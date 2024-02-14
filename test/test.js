const assert = require('assert');

function unitTestAddition() {
  const num1 = 1;
  const num2 = 1;
  const result = num1 + num2;
  assert.strictEqual(result, 2, '1 + 1 should equal 2');
}

unitTestAddition();
