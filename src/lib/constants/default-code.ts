export const DEFAULT_CODE = `// Welcome to Orbit
// Write JavaScript or TypeScript and press Ctrl+Shift+Enter to run

function fibonacci(n: number): number[] {
  const seq: number[] = [0, 1]
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2])
  }
  return seq.slice(0, n)
}

console.log('Fibonacci sequence:')
console.log(fibonacci(10))
`;