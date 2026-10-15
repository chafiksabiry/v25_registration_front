import { readFileSync, writeFileSync } from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

function joinParts(parts) {
  let text = '';
  for (let i = 0; i < parts.length; i += 1) {
    if (i > 0) {
      const prev = parts[i - 1];
      const gap = parts[i].x - (prev.x + (prev.width || 0));
      if (gap > 1.1) text += ' ';
    }
    text += parts[i].str;
  }
  return text.replace(/\s+/g, ' ').trim();
}

function splitCells(parts) {
  const groups = [];
  let current = [];
  for (const part of parts) {
    const prev = current[current.length - 1];
    const gap = prev ? part.x - prev.x : 0;
    if (prev && gap > 50) {
      groups.push(current);
      current = [part];
    } else {
      current.push(part);
    }
  }
  if (current.length) groups.push(current);
  let cells = groups
    .map((group) => ({ x: group[0].x, text: joinParts(group) }))
    .filter((cell) => cell.text);
  if (cells[0] && (cells[0].text === '•' || cells[0].text === '·')) {
    cells = [{
      x: cells[1]?.x ?? cells[0].x,
      text: cells.slice(1).map((cell) => cell.text).join(' '),
      bullet: true,
    }];
  }
  return cells;
}

async function pageLines(pdf, pageNumber) {
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  const buckets = [];
  for (const item of content.items) {
    if (!item.str || !item.str.trim()) continue;
    const y = item.transform[5];
    const x = item.transform[4];
    const size = Math.round(item.height || Math.abs(item.transform[3]) || 10);
    let bucket = buckets.find((entry) => Math.abs(entry.y - y) < 2.2);
    if (!bucket) {
      bucket = { y, parts: [] };
      buckets.push(bucket);
    }
    bucket.parts.push({ x, width: item.width || 0, str: item.str, size });
  }
  return buckets
    .sort((a, b) => b.y - a.y)
    .map((bucket) => {
      bucket.parts.sort((a, b) => a.x - b.x);
      const size = Math.max(...bucket.parts.map((part) => part.size));
      return { size, cells: splitCells(bucket.parts) };
    })
    .filter((line) => line.cells.length && line.cells[0].text);
}

function isPageChrome(line) {
  const text = line.cells.map((cell) => cell.text).join(' ');
  if (line.size <= 8) return true;
  if (/^\d+\s*\/\s*\d+$/.test(text)) return true;
  return false;
}

function cellAt(line, index) {
  return line.cells.find((cell) => {
    if (index === 0) return cell.x < 120;
    if (index === 1) return cell.x >= 120 && cell.x < 220;
    return cell.x >= 220;
  });
}

function appendWrapped(target, extra) {
  if (!target) return extra;
  if (target.endsWith('-')) {
    const stub = target.slice(0, -1).split(' ').pop() || '';
    if (stub.length >= 4 && /^[a-zà-ÿ(]/.test(extra)) return `${target.slice(0, -1)}${extra}`;
  }
  return `${target} ${extra}`.replace(/\s+/g, ' ').trim();
}

function parseCover(lines) {
  const texts = lines.filter((line) => line.size < 36).map((line) => ({
    size: line.size,
    text: line.cells.map((cell) => cell.text).join(' '),
  }));
  const company = texts.find((line) => line.size === 14)?.text || '';
  const title = texts.find((line) => line.size >= 20)?.text || '';
  const subtitle = texts.find((line) => line.size === 13)?.text || '';
  const documents = texts.filter((line) => line.size === 11 && /^\d+\./.test(line.text)).map((line) => line.text);
  const documentsLabel = texts.find((line) => line.size === 11 && !/^\d+\./.test(line.text))?.text || '';
  const foot = texts.filter((line) => line.size === 10).map((line) => line.text);
  return {
    company,
    title,
    subtitle,
    documentsLabel,
    documents,
    version: foot[0] || '',
    address: foot[1] || '',
  };
}

function parseParts(pages) {
  const parts = [];
  let part = null;
  let paragraph = '';
  let bullets = null;
  let table = null;

  const flushParagraph = () => {
    if (!paragraph || !part) return;
    if (paragraph.includes('•') || paragraph.includes('·')) {
      const [intro, ...items] = paragraph.split(/\s*[•·]\s*/);
      if (intro.trim()) part.blocks.push({ type: 'paragraph', text: intro.trim() });
      const cleaned = items.map((item) => item.trim()).filter(Boolean);
      if (cleaned.length) part.blocks.push({ type: 'bullets', items: cleaned });
    } else {
      part.blocks.push({ type: 'paragraph', text: paragraph });
    }
    paragraph = '';
  };
  const flushBullets = () => {
    if (!bullets || !part) return;
    part.blocks.push({ type: 'bullets', items: bullets });
    bullets = null;
  };
  const flushTable = () => {
    if (!table || !part) {
      table = null;
      return;
    }
    if (table.kind === 'definitions') {
      const rows = table.rows.filter((row) => row.term || row.definition);
      const prev = part.blocks[part.blocks.length - 1];
      if (prev && prev.type === 'definitions') prev.rows.push(...rows);
      else part.blocks.push({ type: 'definitions', rows });
    } else {
      const rows = table.rows.filter((row) => row.some(Boolean));
      const prev = part.blocks[part.blocks.length - 1];
      if (prev && prev.type === 'table' && prev.headers.join('|') === table.headers.join('|')) prev.rows.push(...rows);
      else part.blocks.push({ type: 'table', headers: table.headers, rows });
    }
    table = null;
  };
  const flushAll = () => {
    flushParagraph();
    flushBullets();
    flushTable();
  };
  const addTableText = (row, index, extra) => {
    row[index] = appendWrapped(row[index] || '', extra);
  };

  for (const line of pages) {
    if (isPageChrome(line)) continue;
    const text = line.cells.map((cell) => cell.text).join(' ').trim();
    if (!text) continue;
    const bullet = line.cells[0]?.bullet;

    if (line.size >= 18) {
      flushAll();
      part = { title: text, blocks: [] };
      parts.push(part);
      continue;
    }
    if (!part) continue;

    if (line.size >= 15) {
      flushAll();
      part.blocks.push({ type: 'subheading', text });
      continue;
    }

    if (line.size >= 11) {
      flushAll();
      part.blocks.push({ type: 'heading', text });
      continue;
    }

    const left = cellAt(line, 0)?.text || '';
    const middle = cellAt(line, 1)?.text || '';
    const right = cellAt(line, 2)?.text || '';
    const header = `${left} ${middle} ${right}`.toLowerCase();
    if (line.size <= 9 && /^(terme|term)\b/.test(left.toLowerCase()) && /définition|definition/.test(header)) {
      flushParagraph();
      flushBullets();
      flushTable();
      table = { kind: 'definitions', rows: [] };
      continue;
    }
    if (line.size <= 9 && /^(prestataire|provider)\b/.test(left.toLowerCase()) && right) {
      flushParagraph();
      flushBullets();
      flushTable();
      table = { kind: 'columns', headers: [left, middle, right], rows: [] };
      continue;
    }
    if (table && line.size <= 9) {
      if (table.kind === 'definitions') {
        if (left && middle) table.rows.push({ term: left, definition: middle });
        else if (middle && table.rows.length) addTableText(table.rows[table.rows.length - 1], 'definition', middle);
        else if (left && table.rows.length) addTableText(table.rows[table.rows.length - 1], 'term', left);
      } else if (right) {
        table.rows.push([left, middle, right]);
      } else if (table.rows.length) {
        const row = table.rows[table.rows.length - 1];
        if (left) addTableText(row, 0, left);
        if (middle) addTableText(row, 1, middle);
        if (right) addTableText(row, 2, right);
      }
      continue;
    }

    if (bullet) {
      flushParagraph();
      flushTable();
      if (!bullets) bullets = [];
      bullets.push(line.cells[0].text);
      continue;
    }

    if (bullets && /^[a-zà-ÿ(]/.test(text)) {
      const last = bullets.length - 1;
      bullets[last] = appendWrapped(bullets[last], text);
      continue;
    }

    flushBullets();
    flushTable();

    if (/^(version\b|version\b)/i.test(text) && !paragraph) {
      part.blocks.push({ type: 'meta', text });
      continue;
    }

    if (/^\d+\.\d+\./.test(text) || (paragraph && /^\d+\.\s/.test(text))) {
      flushParagraph();
    }
    paragraph = appendWrapped(paragraph, text);
  }
  flushAll();
  return parts;
}

const input = process.argv[2];
const output = process.argv[3];
const data = new Uint8Array(readFileSync(input));
const pdf = await getDocument({ data, disableWorker: true }).promise;
const first = await pageLines(pdf, 1);
const rest = [];
for (let n = 2; n <= pdf.numPages; n += 1) {
  rest.push(...(await pageLines(pdf, n)));
}
const pack = { cover: parseCover(first), parts: parseParts(rest) };
writeFileSync(output, `${JSON.stringify(pack, null, 2)}\n`);
console.log(output, pack.parts.map((part) => `${part.title} (${part.blocks.length})`).join(' | '));
