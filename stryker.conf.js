module.exports = function(config) {
  config.set({
    files: [
      { pattern: 'src/**/*.ts', mutated: true },
      'test/**/*.ts',
    ],
    tsconfigFile: 'tsconfig.json',
    transpilers: [
      'typescript'
    ],
    mutator: 'typescript',
    testRunner: 'mocha',
    testFramework: 'mocha',
    coverageAnalysis: 'off',
    reporter: ['clear-text', 'html', 'progress', 'baseline']
  });
}
