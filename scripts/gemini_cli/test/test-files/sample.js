
// サンプルJavaScriptファイル
function calculateSum(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('引数は数値である必要があります');
  }
  return a + b;
}

class Calculator {
  constructor() {
    this.history = [];
  }

  add(a, b) {
    const result = calculateSum(a, b);
    this.history.push({ operation: 'add', a, b, result });
    return result;
  }

  getHistory() {
    return this.history;
  }
}

export { Calculator, calculateSum };
