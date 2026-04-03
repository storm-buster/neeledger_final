const fetch = require('node-fetch');
(async () => {
  try {
    const res = await fetch('http://localhost:4000/api/xai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codePhrase: 'open-sesame', fileName: 'demo.webm' })
    });
    const j = await res.json();
    console.log(JSON.stringify(j, null, 2));
  } catch (e) {
    console.error('Test failed', e);
    process.exit(1);
  }
})();
