function safeDivide(dividend, divisor) {
  return `${dividend} / nullif(${divisor}, 0)`;
}