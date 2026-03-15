import { encryptHTML } from 'pagecrypt';
import { readFile, writeFile } from 'fs/promises';

const password = process.env.WORK_PASSWORD;

if (!password) {
  console.error('Error: WORK_PASSWORD environment variable is not set.');
  process.exit(1);
}

const files = [
  'work.html',
  'work/northbeam-revamp.html',
  'work/gamma.html',
  'work/footprint.html',
  'work/avail.html',
  'work/binge.html',
  'work/connected-nursery.html',
  'work/custodial-banking.html',
  'work/oshi-health.html',
];

async function encryptWithStyle(inputFile, outputFile, pwd) {
  const inputHTML = await readFile(inputFile, 'utf-8');
  const encryptedPage = await encryptHTML(inputHTML, pwd);

  // Extract pagecrypt's decryption script and encrypted payload
  const scriptMatch = encryptedPage.match(/<script type=module>[\s\S]*?<\/script>/);
  const preMatch = encryptedPage.match(/<pre[\s\S]*?<\/pre>/);

  const pagecryptScript = scriptMatch[0];
  const encryptedPayload = preMatch[0];

  // Relative base path: project pages live one level deeper
  const base = inputFile.startsWith('work/') ? '../' : '';

  const customPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Selected Work – Morrie Nimmer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,300&family=Share+Tech+Mono&display=swap" rel="stylesheet">
  ${pagecryptScript}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --paper:    #E4DFD3;
      --paper-hi: #EDE9E1;
      --ink:      #1a1714;
      --ink-2:    #4a4540;
      --ink-3:    #8a8278;
      --accent:   #C4681A;
      --rule:     #ccc8c0;
      --mono:     'Share Tech Mono', monospace;
    }

    html, body {
      background: var(--paper);
      color: var(--ink);
      font-family: 'DM Sans', sans-serif;
      font-weight: 300;
      min-height: 100%;
    }

    .hidden { display: none !important; }

    /* ── Nav ────────────────────────────────────────────────── */
    nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 58px;
      background: var(--paper);
      border-bottom: 1px solid var(--rule);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 3rem;
      z-index: 400;
    }

    .nav-brand {
      font-family: var(--mono);
      font-size: 1rem;
      letter-spacing: 0.12em;
      color: var(--ink);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-prompt { color: var(--accent); font-size: 0.75rem; }

    .nav-links { display: flex; list-style: none; }

    .nav-links li a {
      font-family: var(--mono);
      font-size: 0.6875rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-decoration: none;
      color: var(--ink-2);
      padding: 0 1.375rem;
      height: 58px;
      display: flex;
      align-items: center;
      border-left: 1px solid var(--rule);
    }

    .nav-links li:last-child a { border-right: 1px solid var(--rule); }
    .nav-links li a.active { color: var(--accent); }

    /* ── Loading state ──────────────────────────────────────── */
    #load {
      position: fixed;
      inset: 0;
      background: var(--paper);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 600;
      gap: 0.6rem;
      font-family: var(--mono);
      font-size: 0.5625rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--ink-3);
    }

    .spinner {
      width: 0.875rem;
      height: 0.875rem;
      border: 2px solid var(--rule);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Modal overlay ──────────────────────────────────────── */
    header.flex {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(26, 23, 20, 0.55);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      z-index: 300;
      padding: 2rem;
    }

    /* ── Gate box ───────────────────────────────────────────── */
    .gate-box {
      width: 100%;
      max-width: 480px;
      border: 1px solid var(--rule);
      background: var(--paper-hi);
    }

    .gate-box-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid var(--rule);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .gate-title {
      font-size: 1.25rem;
      font-weight: 300;
      letter-spacing: -0.02em;
    }

    .gate-title strong { font-weight: 700; }

    .label {
      font-family: var(--mono);
      font-size: 0.5625rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--ink-3);
    }

    .gate-body {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .gate-body > p {
      font-size: 0.875rem;
      color: var(--ink-2);
      font-weight: 300;
      line-height: 1.6;
    }

    /* ── Error message ──────────────────────────────────────── */
    #msg {
      font-family: var(--mono);
      font-size: 0.5625rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #b94040;
      display: none;
    }

    header.red #msg { display: block; }

    /* ── Form ───────────────────────────────────────────────── */
    .gate-input-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .gate-input-wrap label {
      font-family: var(--mono);
      font-size: 0.5625rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--ink-3);
    }

    input[type="password"] {
      background: var(--paper);
      border: 1px solid var(--rule);
      padding: 0.75rem 1rem;
      font-family: var(--mono);
      font-size: 0.875rem;
      color: var(--ink);
      outline: none;
      width: 100%;
      transition: border-color 0.15s;
    }

    input[type="password"]:focus { border-color: var(--ink); }

    input[type="submit"] {
      background: var(--ink);
      color: var(--paper);
      border: none;
      padding: 0.75rem 2rem;
      font-family: var(--mono);
      font-size: 0.5625rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.15s;
      margin-top: 0.5rem;
    }

    input[type="submit"]:hover { background: var(--accent); }
  </style>
</head>
<body>

  <nav>
    <a href="${base}index.html" class="nav-brand"><span class="nav-prompt">❯</span> MORRIE NIMMER</a>
    <ul class="nav-links">
      <li><a href="${base}work.html" class="active">Work</a></li>
      <li><a href="${base}press.html">Press</a></li>
      <li><a href="${base}process.html">Process</a></li>
      <li><a href="${base}about.html">About</a></li>
      <li><a href="${base}contact.html">Contact</a></li>
    </ul>
  </nav>

  <div id="load">
    <div class="spinner"></div>
    <span>Loading</span>
  </div>

  <header class="hidden">
    <div class="gate-box">
      <div class="gate-box-header">
        <h1 class="gate-title">Selected <strong>Work</strong></h1>
        <span class="label">Protected</span>
      </div>
      <div class="gate-body">
        <p>This portfolio contains sensitive client work. Enter the password to continue.</p>
        <span id="msg"></span>
        <form class="hidden">
          <div class="gate-input-wrap">
            <label for="pwd">Password</label>
            <input type="password" id="pwd" name="pwd" autocomplete="current-password" placeholder="············">
          </div>
          <input type="submit" value="Enter">
        </form>
      </div>
    </div>
  </header>

  ${encryptedPayload}
</body>
</html>`;

  await writeFile(outputFile, customPage, 'utf-8');
  console.log(`Encrypted: ${inputFile}`);
}

for (const file of files) {
  await encryptWithStyle(file, file, password);
}

console.log('Done.');
