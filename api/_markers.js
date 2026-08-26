const ATTR_MARKER_RE = /<!--cms-attr:([a-zA-Z0-9_-]+):([a-zA-Z0-9_-]+):([a-zA-Z0-9_-]+)-->/g;
const TEXT_EL_MARKER_RE = /<!--cms-text:([a-zA-Z0-9_-]+)-->/g;

function escapeRegExpId(id) {
  return id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeAttrValue(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function applyTransform(name, value) {
  switch (name) {
    case 'mailto':
      return `mailto:${value}`;
    case 'tel':
      return `tel:${String(value).replace(/\s+/g, '')}`;
    case 'wa':
      return `https://wa.me/${String(value).replace(/[^\d]/g, '')}`;
    case 'identity':
    default:
      return value;
  }
}

// Extract current values for the given fields (all belonging to one file's content).
function extractFields(content, fields) {
  const out = {};
  for (const f of fields) {
    const textRe = new RegExp(`<!--cms:${escapeRegExpId(f.id)}-->([\\s\\S]*?)<!--cms:\\/${escapeRegExpId(f.id)}-->`);
    const tm = content.match(textRe);
    if (tm) {
      out[f.id] = tm[1].trim();
      continue;
    }
    const markerRe = new RegExp(`<!--cms-attr:${escapeRegExpId(f.id)}:([a-zA-Z0-9_-]+):([a-zA-Z0-9_-]+)-->`);
    const markerMatch = content.match(markerRe);
    if (markerMatch) {
      const attr = markerMatch[1];
      const rest = content.slice(markerMatch.index + markerMatch[0].length);
      const tagAttrRe = new RegExp(`^\\s*<[a-zA-Z0-9]+\\b[^>]*?\\s${escapeRegExpId(attr)}="([^"]*)"`);
      const tm2 = rest.match(tagAttrRe);
      if (tm2) out[f.id] = tm2[1];
      continue;
    }
    // cms-text: for elements like <title> where HTML forbids real comments inside
    // (the parser treats everything up to </title> as literal text), so the
    // marker sits just before the tag instead of wrapping its content.
    const textElRe = new RegExp(`<!--cms-text:${escapeRegExpId(f.id)}-->\\s*<[a-zA-Z0-9]+[^>]*>([\\s\\S]*?)<\\/[a-zA-Z0-9]+>`);
    const tem = content.match(textElRe);
    if (tem) out[f.id] = tem[1].trim();
  }
  return out;
}

// Apply { id: newValue } edits to file content, honoring both text and attribute markers.
function applyFields(content, values) {
  let next = content;

  for (const id of Object.keys(values)) {
    const textRe = new RegExp(`(<!--cms:${escapeRegExpId(id)}-->)([\\s\\S]*?)(<!--cms:\\/${escapeRegExpId(id)}-->)`, 'g');
    if (textRe.test(next)) {
      next = next.replace(textRe, (_m, open, _old, close) => `${open}${values[id]}${close}`);
    }
  }

  const triples = new Set();
  let match;
  ATTR_MARKER_RE.lastIndex = 0;
  while ((match = ATTR_MARKER_RE.exec(next))) {
    triples.add(JSON.stringify([match[1], match[2], match[3]]));
  }
  for (const t of triples) {
    const [id, attr, transformName] = JSON.parse(t);
    if (!(id in values)) continue;
    const transformed = applyTransform(transformName, values[id]);
    const re = new RegExp(
      `(<!--cms-attr:${escapeRegExpId(id)}:${escapeRegExpId(attr)}:${escapeRegExpId(transformName)}-->\\s*<[a-zA-Z0-9]+\\b[^>]*?\\s${escapeRegExpId(attr)}=")([^"]*)("[^>]*>)`,
      'g'
    );
    next = next.replace(re, (_m, pre, _old, post) => `${pre}${escapeAttrValue(transformed)}${post}`);
  }

  const textElIds = new Set();
  TEXT_EL_MARKER_RE.lastIndex = 0;
  while ((match = TEXT_EL_MARKER_RE.exec(next))) {
    textElIds.add(match[1]);
  }
  for (const id of textElIds) {
    if (!(id in values)) continue;
    const re = new RegExp(
      `(<!--cms-text:${escapeRegExpId(id)}-->\\s*<[a-zA-Z0-9]+[^>]*>)([\\s\\S]*?)(<\\/[a-zA-Z0-9]+>)`,
      'g'
    );
    next = next.replace(re, (_m, pre, _old, post) => `${pre}${values[id]}${post}`);
  }

  return next;
}

module.exports = { extractFields, applyFields };
