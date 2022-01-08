/* eslint-disable */

// === Simple
// should compile to: alert(8)
alert(3 + 5);

// === Recursion
const fibonacci = (x) => (x <= 1 ? x : fibonacci(x - 1) + fibonacci(x - 2));

// fixed value, should compile to: alert(55)
alert(fibonacci(10));

// dynamic value, so cannot compile away recursive fibonacci function
// but could also be compiled to more efficient loop instead of recursion
// - convert recursion to DP
// - only store the needed (last 2) values in the DP array instead of all
// note possible infinite loop if input is NaN
alert(fibonacci(+prompt()));

// === Events
let a = 1;
document.addEventListener("mousedown", () => { a += 2; });
document.addEventListener("keydown", () => { a *= 3; });
