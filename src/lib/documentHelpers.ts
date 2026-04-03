export const formatDocumentAsHtml = (title: string, content: string): string => {
    // Parse the plain text into styled HTML sections
    const lines = content.split('\n');
    let bodyHtml = '';
    let inList = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip the title line and separator (already in header)
      if (trimmed.startsWith('━') || trimmed === '') {
        if (inList) { bodyHtml += '</ul>'; inList = false; }
        if (trimmed === '') bodyHtml += '<div class="spacer"></div>';
        continue;
      }

      // Major headings (all caps with no leading spaces, like "VERIFICATION CLAIM REPORT")
      if (/^[A-Z][A-Z\s\(\)&]+$/.test(trimmed) && trimmed.length > 3) {
        if (inList) { bodyHtml += '</ul>'; inList = false; }
        bodyHtml += `<h1 class="doc-title">${trimmed}</h1>`;
        continue;
      }

      // Numbered sections like "1. MONITORING RESULTS"
      if (/^\d+\.\s+[A-Z]/.test(trimmed)) {
        if (inList) { bodyHtml += '</ul>'; inList = false; }
        const num = trimmed.match(/^(\d+)\.\s+(.*)/)!;
        bodyHtml += `<h2 class="section-heading"><span class="section-num">${num[1]}</span>${num[2]}</h2>`;
        continue;
      }

      // Sub-sections like "2.1 Site Inspection: ✅ COMPLETED"
      if (/^\d+\.\d+\s+/.test(trimmed)) {
        if (inList) { bodyHtml += '</ul>'; inList = false; }
        const hasCheck = trimmed.includes('✅');
        const cleaned = trimmed.replace('✅', '').trim();
        bodyHtml += `<div class="subsection">${hasCheck ? '<span class="check">✅</span>' : ''}${cleaned}</div>`;
        continue;
      }

      // Boxed content (┌ ─ │ └)
      if (/[┌└│┐┘─]/.test(trimmed)) {
        const inner = trimmed.replace(/[┌└│┐┘─\s]/g, '').trim();
        if (inner) {
          bodyHtml += `<div class="highlight-box">${inner}</div>`;
        }
        continue;
      }

      // Bullet points (• or -)
      if (trimmed.startsWith('•') || trimmed.startsWith('- ')) {
        if (!inList) { bodyHtml += '<ul class="doc-list">'; inList = true; }
        bodyHtml += `<li>${trimmed.replace(/^[•\-]\s*/, '')}</li>`;
        continue;
      }

      // Key-value pairs (Label: Value)
      if (/^[A-Za-z][A-Za-z\s\(\)%]+:\s+/.test(trimmed) && trimmed.length < 120) {
        if (inList) { bodyHtml += '</ul>'; inList = false; }
        const [key, ...valParts] = trimmed.split(':');
        const val = valParts.join(':').trim();
        const hasCheck = val.includes('✅');
        bodyHtml += `<div class="kv-row"><span class="kv-key">${key}:</span><span class="kv-val">${hasCheck ? '<span class="check">✅</span>' : ''}${val.replace('✅', '').trim()}</span></div>`;
        continue;
      }

      // Regular paragraph text
      if (inList) { bodyHtml += '</ul>'; inList = false; }
      bodyHtml += `<p class="body-text">${trimmed}</p>`;
    }
    if (inList) bodyHtml += '</ul>';

    // Extract the doc type from the first meaningful line for the header
    const firstLine = lines.find(l => l.trim().length > 3 && !/^━/.test(l.trim()))?.trim() || title;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #e2e8f0;
      min-height: 100vh;
      padding: 40px 20px;
    }
    .page {
      max-width: 820px;
      margin: 0 auto;
      background: linear-gradient(to bottom, #1e293b, #0f172a);
      border-radius: 16px;
      border: 1px solid rgba(99, 102, 241, 0.2);
      box-shadow: 0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #312e81, #1e1b4b);
      padding: 36px 40px;
      border-bottom: 1px solid rgba(99, 102, 241, 0.3);
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
      border-radius: 50%;
    }
    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 5px 14px;
      border-radius: 20px;
      margin-bottom: 14px;
    }
    .header h1 {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }
    .header p {
      color: #94a3b8;
      font-size: 13px;
      margin-top: 8px;
      font-weight: 400;
    }
    .content {
      padding: 36px 40px;
    }
    .doc-title {
      font-size: 20px;
      font-weight: 700;
      color: #c7d2fe;
      margin: 24px 0 12px;
      letter-spacing: -0.3px;
    }
    .section-heading {
      font-size: 15px;
      font-weight: 700;
      color: #e2e8f0;
      margin: 28px 0 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(99, 102, 241, 0.15);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .subsection {
      font-size: 13px;
      color: #cbd5e1;
      padding: 8px 12px;
      margin: 6px 0 6px 38px;
      background: rgba(30, 41, 59, 0.5);
      border-radius: 8px;
      border-left: 3px solid #4f46e5;
    }
    .check {
      margin-right: 6px;
    }
    .body-text {
      font-size: 13.5px;
      color: #94a3b8;
      line-height: 1.7;
      margin: 4px 0;
      padding-left: 38px;
    }
    .kv-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 14px;
      margin: 3px 0;
      border-radius: 8px;
      background: rgba(30, 41, 59, 0.4);
      font-size: 13px;
    }
    .kv-key {
      color: #64748b;
      font-weight: 500;
    }
    .kv-val {
      color: #e2e8f0;
      font-weight: 600;
      text-align: right;
    }
    .doc-list {
      list-style: none;
      padding-left: 38px;
      margin: 8px 0;
    }
    .doc-list li {
      position: relative;
      padding: 5px 0 5px 20px;
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
    }
    .doc-list li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 12px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #818cf8);
    }
    .highlight-box {
      margin: 16px 0;
      padding: 18px 24px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      color: #34d399;
      text-align: center;
      letter-spacing: -0.3px;
    }
    .spacer { height: 8px; }
    .footer {
      padding: 20px 40px;
      border-top: 1px solid rgba(99, 102, 241, 0.12);
      background: rgba(15, 23, 42, 0.5);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #475569;
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: #6366f1;
    }
    @media print {
      body { background: #fff; color: #1e293b; padding: 0; }
      .page { box-shadow: none; border: none; background: #fff; }
      .header { background: #f1f5f9; }
      .header h1 { color: #1e293b; }
      .section-heading { color: #1e293b; }
      .body-text, .doc-list li { color: #475569; }
      .kv-val { color: #1e293b; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-badge">📄 Official Document</div>
      <h1>${firstLine}</h1>
      <p>${title} — Generated via NeeLedger Carbon Credit Platform</p>
    </div>
    <div class="content">
      ${bodyHtml}
    </div>
    <div class="footer">
      <div class="footer-brand">🌿 NeeLedger</div>
      <span>Document stored on IPFS • Immutable & Verifiable</span>
      <span>${new Date().toLocaleDateString()}</span>
    </div>
  </div>
</body>
</html>`;
};
