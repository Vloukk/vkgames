const originalConsoleError = console.error;

console.error = function (...args) {
  if (args[0] && args[0].includes && args[0].includes("🚨 Boucle infinie détectée")) {
    alert("⚠️ Une boucle infinie a été détectée ! Vérifiez la console.");
  }
  originalConsoleError.apply(console, args);
};
