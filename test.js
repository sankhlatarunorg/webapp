const assert = require('assert');

function testAddition() {
  // Define the values
  const num1 = 1;
  const num2 = 1;

  // Perform the addition
  const result = num1 + num2;

  // Assert that the result is equal to 2
  assert.strictEqual(result, 3, '1 + 1 should equal 2');
}

// Run the test
testAddition();
