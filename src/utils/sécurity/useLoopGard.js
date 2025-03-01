const loopTracker = {}; // Stocke les appels des fonctions globalement

export default function useLoopGuard(functionName, maxCalls = 10, resetTime = 5000) {
  if (!loopTracker[functionName]) {
    loopTracker[functionName] = { count: 0, firstCall: Date.now() };
  }

  const now = Date.now();
  const timeElapsed = now - loopTracker[functionName].firstCall;

  if (timeElapsed > resetTime) {
    loopTracker[functionName] = { count: 0, firstCall: now }; // 🔄 Réinitialise après un certain temps
  }

  loopTracker[functionName].count++;

  if (loopTracker[functionName].count > maxCalls) {
    console.error(
      `🚨 Boucle infinie détectée dans "${functionName}" ! (${loopTracker[functionName].count} appels en ${timeElapsed}ms)`
    );
    throw new Error(`🚨 Boucle infinie détectée dans "${functionName}"`);
  }
}
