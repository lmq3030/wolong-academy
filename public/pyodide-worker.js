// Load Pyodide from CDN
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');

let pyodide = null;

async function initPyodide() {
  pyodide = await loadPyodide();
  // Redirect stdout/stderr
  pyodide.runPython(`
import sys
from io import StringIO
  `);
  self.postMessage({ type: 'ready' });
}

async function runCode(id, code, timeout = 5000) {
  if (!pyodide) {
    self.postMessage({ id, success: false, output: '', error: 'Pyodide not initialized', duration: 0 });
    return;
  }

  const start = performance.now();

  // Set up stdout capture
  pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
  `);

  let timeoutId;

  try {
    // Create a timeout promise
    const result = await Promise.race([
      (async () => {
        await pyodide.runPythonAsync(code);
        const stdout = pyodide.runPython('sys.stdout.getvalue()');
        const stderr = pyodide.runPython('sys.stderr.getvalue()');
        return { stdout, stderr };
      })(),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('代码执行超时 (5秒)：可能存在无限循环')), timeout);
      })
    ]);

    clearTimeout(timeoutId);
    const duration = performance.now() - start;

    self.postMessage({
      id,
      success: true,
      output: result.stdout,
      error: result.stderr || undefined,
      duration: Math.round(duration),
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const duration = performance.now() - start;

    // Parse Python error for kid-friendly display
    let errorMsg = err.message || String(err);
    // Extract just the relevant part of Python tracebacks
    if (errorMsg.includes('File "<exec>"')) {
      const lines = errorMsg.split('\n');
      const relevantLines = lines.filter(l => !l.includes('File "<exec>"') && l.trim());
      errorMsg = relevantLines.join('\n') || errorMsg;
    }

    self.postMessage({
      id,
      success: false,
      output: '',
      error: errorMsg,
      duration: Math.round(duration),
    });
  }
}

self.onmessage = async function(event) {
  const { id, type, code, timeout } = event.data;

  if (type === 'init') {
    await initPyodide();
  } else if (type === 'run') {
    await runCode(id, code, timeout);
  }
};

// Auto-initialize on worker start
initPyodide();
