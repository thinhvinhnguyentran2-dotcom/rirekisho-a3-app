'use strict';

const APP_VERSION = '2.8.3';
const STORAGE_KEY = 'rirekisho-a3-documents-v21';
const ACTIVE_KEY = 'rirekisho-a3-active-v21';
const SETTINGS_KEY = 'rirekisho-a3-settings-v21';
const LEGACY_STORAGE_KEYS = ['rirekisho-a3-documents-v2'];
const LAYOUT_LIMITS = { left: [14, 18], right: [6, 10], license: [3, 10], customTables: [0, 3] };
const FIXED_MOTIVATION_LABEL = '志望の動機、特技、好きな学科、アピールポイントなど';
const FIXED_REQUESTS_LABEL = '本人希望記入欄（特に給料・職種・勤務時間・勤務地・その他についての希望などがあれば記入）';
const FIXED_INFO_LABELS = ['通勤時間', '扶養家族数（配偶者を除く）'];
const A3_MM = { width: 420, height: 297 };
const HISTORY_BALANCE_RATIO = 0.72;
const LEFT_FOOTER_HEIGHT_MM = 12;
const LEFT_SECTION_GAP_MM = 2.4;
const SAFE_ROW_HEIGHT_MIN_MM = 6.8;
const SAFE_ROW_HEIGHT_MAX_MM = 8.8;
const AUTO_RATIO_BASE_TOTAL = 23;
const AUTO_RATIO_BASE_LICENSE = 6;
const AUTO_RATIO_BASE_VALUE = 62;
const AUTO_RATIO_PER_HISTORY_ROW = 1.2;
const AUTO_RATIO_PER_LICENSE_ROW = 1.5;
const TEXT_RATIO_MIN = 5;
const TEXT_RATIO_MAX = 95;
const REQUEST_HEIGHT_MIN_MM = 12;
const INFO_BOX_MIN_HEIGHT_MM = 12;
const ZIPCLOUD_API_URL = 'https://zipcloud.ibsnet.co.jp/api/search';
const INSTALL_DONE_KEY = 'rirekisho-a3-install-done';
const MOBILE_HEADER_REVEAL_DELAY_MS = 3000;
const APP_PUBLIC_URL = 'https://thinhvinhnguyentran2-dotcom.github.io/rirekisho-a3-app/';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const makeId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
const deepClone = (value) => JSON.parse(JSON.stringify(value));
const todayISO = () => new Date().toISOString().slice(0, 10);

function defaultDocument() {
  const id = makeId();
  return {
    schemaVersion: 8,
    id,
    title: '新しい履歴書',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    yearMode: 'western',
    asOfDate: todayISO(),
    birthDate: '',
    gender: '男',
    nameKana: '',
    name: '',
    addressKana: '',
    postalCode: '',
    address: '',
    postalAddressBase: '',
    postalKanaBase: '',
    phone: '',
    email: '',
    contactKana: '',
    contactAddress: '',
    contactPhone: '',
    photo: '',
    history: [
      { id: makeId(), year: '', month: '', text: '学　歴', kind: 'section' },
      { id: makeId(), year: '', month: '', text: '', kind: 'education' },
      { id: makeId(), year: '', month: '', text: '', kind: 'education' },
      { id: makeId(), year: '', month: '', text: '職　歴', kind: 'section' },
      { id: makeId(), year: '', month: '', text: '', kind: 'work' },
      { id: makeId(), year: '', month: '', text: '以　上', kind: 'end' }
    ],
    licenses: [
      { id: makeId(), year: '', month: '', text: '' },
      { id: makeId(), year: '', month: '', text: '以　上', kind: 'end' }
    ],
    motivationLabel: FIXED_MOTIVATION_LABEL,
    motivation: '',
    motivationFont: 100,
    requestsLabel: FIXED_REQUESTS_LABEL,
    requests: '貴社の規定に従います。',
    requestsFont: 100,
    infoBoxes: [
      { id: makeId(), label: FIXED_INFO_LABELS[0], value: '', fixed: true },
      { id: makeId(), label: FIXED_INFO_LABELS[1], value: '', fixed: true }
    ],
    layout: {
      historyLeftSlots: 15,
      historyRightSlots: 8,
      licenseSlots: 6,
      textSectionRatio: 62,
      requestSectionHeight: 38,
      autoTextSectionRatio: true,
      printMargins: { top: 10, bottom: 10, left: 10, right: 10, header: 8, footer: 8 }
    }
  };
}

let state = defaultDocument();
let documents = {};
let selectedRow = null;
let selectedInfoBoxId = null;
let toastTimer = null;
let autosaveTimer = null;
let snapshotTimer = null;
let deferredInstallPrompt = null;
let undoStack = [];
let undoIndex = -1;
let pdfOperationActive = false;
let busyWatchdogTimer = null;
let postalLookupTimer = null;
let postalLookupRequestId = 0;
let postalLookupResults = [];
let mobileEditorScrollY = 0;
let mobilePreviewScrollY = 0;
let lastMobileEditorControlId = '';
let mobileHeaderRevealTimer = null;
let mobileScrollRaf = 0;
let mobileResizeTimer = null;
let lastTrackedScrollY = window.scrollY || 0;
let mobileViewportState = window.matchMedia('(max-width: 980px)').matches;
let photoEditor = {
  image: null,
  source: '',
  zoom: 1,
  rotation: 0,
  x: 0,
  y: 0,
  dragging: false,
  dragStartX: 0,
  dragStartY: 0,
  originX: 0,
  originY: 0,
  baseScale: 1
};

const memoryStorageMap = new Map();
const storage = (() => {
  try {
    const probe = '__rirekisho_storage_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return {
      getItem(key) { return memoryStorageMap.has(String(key)) ? memoryStorageMap.get(String(key)) : null; },
      setItem(key, value) { memoryStorageMap.set(String(key), String(value)); },
      removeItem(key) { memoryStorageMap.delete(String(key)); },
      clear() { memoryStorageMap.clear(); }
    };
  }
})();

const editableFields = [
  'nameKana', 'name', 'addressKana', 'postalCode', 'address', 'phone', 'email',
  'contactKana', 'contactAddress', 'contactPhone', 'motivation', 'requests'
];


function forceCloseBusyOverlay() {
  const overlay = $('#busyOverlay');
  if (!overlay) return;
  overlay.hidden = true;
  overlay.style.setProperty('display', 'none', 'important');
  overlay.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('is-busy');
}

function showToast(message, duration = 2600) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

function setBusy(isBusy, text = '処理しています…') {
  // v2.3.1: 画面全体を覆うローディング表示は使用しない。
  // PDF処理が失敗しても編集画面を操作不能にしないため、ヘッダーの状態表示だけを更新する。
  forceCloseBusyOverlay();
  clearTimeout(busyWatchdogTimer);

  const status = $('#operationStatus');
  if (status) {
    status.textContent = isBusy ? text : '';
    status.hidden = !isBusy;
  }

  ['pdfBtn', 'shareBtn', 'printBtn'].forEach(id => {
    const button = $(`#${id}`);
    if (button) button.disabled = Boolean(isBusy);
  });
}

function withTimeout(promise, timeoutMs, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message || '処理がタイムアウトしました。')), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function sanitizeFileName(value) {
  return String(value || 'rirekisho')
    .trim()
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 80) || 'rirekisho';
}

function safeParseJSON(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function clampNumber(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}

function setControlValue(selector, value) {
  const element = $(selector);
  if (!element) return;
  if (element.type === 'checkbox') {
    element.checked = Boolean(value);
    return;
  }
  if (element.value !== String(value ?? '')) element.value = String(value ?? '');
}

function loadStorage() {
  documents = safeParseJSON(storage.getItem(STORAGE_KEY), null);
  if (!documents || !Object.keys(documents).length) {
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacy = safeParseJSON(storage.getItem(legacyKey), null);
      if (legacy && Object.keys(legacy).length) {
        documents = legacy;
        break;
      }
    }
  }
  documents = documents || {};
  let activeId = storage.getItem(ACTIVE_KEY) || storage.getItem('rirekisho-a3-active-v2');
  if (activeId && documents[activeId]) {
    state = migrateDocument(documents[activeId]);
  } else {
    const latest = Object.values(documents).sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0];
    if (latest) state = migrateDocument(latest);
    else {
      state = defaultDocument();
      documents[state.id] = deepClone(state);
    }
  }
  documents[state.id] = deepClone(state);
  persistDocuments(false);
}


function migrateDocument(input) {
  const base = defaultDocument();
  const source = deepClone(input || {});
  const doc = { ...base, ...source };
  doc.id = doc.id || makeId();
  const previousSchemaVersion = Number(source.schemaVersion || 0);
  doc.schemaVersion = 8;
  doc.postalAddressBase = String(doc.postalAddressBase || '');
  doc.postalKanaBase = String(doc.postalKanaBase || '');
  doc.motivationFont = clampNumber(doc.motivationFont, 75, 140, 100);
  doc.requestsFont = clampNumber(doc.requestsFont, 75, 140, 100);
  doc.motivationLabel = FIXED_MOTIVATION_LABEL;
  doc.requestsLabel = FIXED_REQUESTS_LABEL;
  if (doc.requests === undefined || doc.requests === null) doc.requests = base.requests;
  doc.history = Array.isArray(doc.history)
    ? doc.history.map(row => ({ id: row.id || makeId(), year: row.year ?? '', month: row.month ?? '', text: row.text ?? '', kind: row.kind || '' }))
    : base.history;
  doc.licenses = Array.isArray(doc.licenses)
    ? doc.licenses.map(row => ({ id: row.id || makeId(), year: row.year ?? '', month: row.month ?? '', text: row.text ?? '', kind: row.kind || '' }))
    : base.licenses;

  const previousLayout = source.layout || {};
  const previousMargins = previousLayout.printMargins || {};
  doc.layout = {
    ...base.layout,
    ...previousLayout,
    historyLeftSlots: Math.round(clampNumber(previousLayout.historyLeftSlots, ...LAYOUT_LIMITS.left, base.layout.historyLeftSlots)),
    historyRightSlots: Math.round(clampNumber(previousLayout.historyRightSlots, ...LAYOUT_LIMITS.right, base.layout.historyRightSlots)),
    licenseSlots: Math.round(clampNumber(previousLayout.licenseSlots, ...LAYOUT_LIMITS.license, base.layout.licenseSlots)),
    textSectionRatio: clampNumber(previousLayout.textSectionRatio, TEXT_RATIO_MIN, TEXT_RATIO_MAX, base.layout.textSectionRatio),
    requestSectionHeight: clampNumber(previousLayout.requestSectionHeight, REQUEST_HEIGHT_MIN_MM, 120, base.layout.requestSectionHeight),
    autoTextSectionRatio: previousLayout.autoTextSectionRatio !== false,
    printMargins: {
      top: previousSchemaVersion < 8 ? 10 : clampNumber(previousMargins.top, 0, 40, 10),
      bottom: previousSchemaVersion < 8 ? 10 : clampNumber(previousMargins.bottom, 0, 40, 10),
      left: previousSchemaVersion < 8 ? 10 : clampNumber(previousMargins.left, 0, 40, 10),
      right: previousSchemaVersion < 8 ? 10 : clampNumber(previousMargins.right, 0, 40, 10),
      header: clampNumber(previousMargins.header, 0, 30, 8),
      footer: clampNumber(previousMargins.footer, 0, 30, 8)
    }
  };

  const sourceBoxes = Array.isArray(source.infoBoxes) ? source.infoBoxes : [];
  const commuteSource = sourceBoxes.find(box => String(box.label || '') === FIXED_INFO_LABELS[0]) || sourceBoxes[0];
  const dependentsSource = sourceBoxes.find(box => String(box.label || '') === FIXED_INFO_LABELS[1]) || sourceBoxes[1];
  const customSources = sourceBoxes.filter((box, index) => {
    const label = String(box.label || '');
    return index > 1 && !FIXED_INFO_LABELS.includes(label) || (index <= 1 && !FIXED_INFO_LABELS.includes(label));
  }).slice(0, LAYOUT_LIMITS.customTables[1]);
  doc.infoBoxes = [
    { id: commuteSource?.id || makeId(), label: FIXED_INFO_LABELS[0], value: String(commuteSource?.value ?? source.commuteTime ?? ''), fixed: true },
    { id: dependentsSource?.id || makeId(), label: FIXED_INFO_LABELS[1], value: String(dependentsSource?.value ?? source.dependents ?? ''), fixed: true },
    ...customSources.map(box => ({ id: box.id || makeId(), label: String(box.label || 'その他のスキル'), value: String(box.value || ''), fixed: false }))
  ];
  normalizeLayoutCapacity(doc);
  return doc;
}


function persistDocuments(showMessage = false) {
  state.updatedAt = new Date().toISOString();
  documents[state.id] = deepClone(state);
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(documents));
    storage.setItem(ACTIVE_KEY, state.id);
    updateSaveStatus(true);
    refreshDocumentSelect();
    if (showMessage) showToast('端末に保存しました。');
  } catch (error) {
    console.error(error);
    updateSaveStatus(false);
    showToast('保存容量が不足しています。写真サイズを小さくするか、不要な書類を削除してください。', 5000);
  }
}

function scheduleAutosave() {
  updateSaveStatus(false);
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => persistDocuments(false), 700);
}

function updateSaveStatus(saved) {
  $('#saveStatus').textContent = saved ? '保存済み' : '編集中';
  $('#updatedAt').textContent = state.updatedAt ? formatTimestamp(state.updatedAt) : '';
}

function formatTimestamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function refreshDocumentSelect() {
  const select = $('#documentSelect');
  const list = Object.values(documents).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  select.innerHTML = '';
  for (const doc of list) {
    const option = document.createElement('option');
    option.value = doc.id;
    option.textContent = `${doc.title || '無題'} — ${formatTimestamp(doc.updatedAt)}`;
    option.selected = doc.id === state.id;
    select.appendChild(option);
  }
}

function pushSnapshot(force = false) {
  clearTimeout(snapshotTimer);
  const take = () => {
    const serialized = JSON.stringify(state);
    if (!force && undoIndex >= 0 && undoStack[undoIndex] === serialized) return;
    undoStack = undoStack.slice(0, undoIndex + 1);
    undoStack.push(serialized);
    if (undoStack.length > 60) undoStack.shift();
    undoIndex = undoStack.length - 1;
    updateUndoButtons();
  };
  if (force) take(); else snapshotTimer = setTimeout(take, 450);
}

function resetUndo() {
  undoStack = [];
  undoIndex = -1;
  pushSnapshot(true);
}

function undo() {
  if (undoIndex <= 0) return;
  undoIndex -= 1;
  state = migrateDocument(JSON.parse(undoStack[undoIndex]));
  selectedRow = null;
  renderAll();
  scheduleAutosave();
  updateUndoButtons();
}

function redo() {
  if (undoIndex >= undoStack.length - 1) return;
  undoIndex += 1;
  state = migrateDocument(JSON.parse(undoStack[undoIndex]));
  selectedRow = null;
  renderAll();
  scheduleAutosave();
  updateUndoButtons();
}

function updateUndoButtons() {
  $('#undoBtn').disabled = undoIndex <= 0;
  $('#redoBtn').disabled = undoIndex >= undoStack.length - 1;
}

function markChanged() {
  scheduleAutosave();
  pushSnapshot(false);
}

function toDateParts(iso) {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

const ERAS = [
  { name: '令和', start: [2019, 5, 1] },
  { name: '平成', start: [1989, 1, 8] },
  { name: '昭和', start: [1926, 12, 25] },
  { name: '大正', start: [1912, 7, 30] },
  { name: '明治', start: [1868, 1, 25] }
];

function compareYMD(a, b) {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

function japaneseEra(year, month = 7, day = 1) {
  const ymd = [Number(year), Number(month) || 7, Number(day) || 1];
  const era = ERAS.find(item => compareYMD(ymd, item.start) >= 0);
  if (!era) return String(year || '');
  const eraYear = ymd[0] - era.start[0] + 1;
  return `${era.name}${eraYear === 1 ? '元' : eraYear}`;
}

function formatYear(value, month = '') {
  const numeric = Number(String(value).trim());
  if (!Number.isInteger(numeric) || numeric < 1868 || numeric > 2200) return String(value || '');
  return state.yearMode === 'japanese' ? japaneseEra(numeric, Number(month) || 7, 1) : String(numeric);
}

function parseYearInput(raw) {
  const value = String(raw || '').trim().replace(/\s/g, '');
  if (!value) return '';
  if (/^\d{4}$/.test(value)) return value;
  const shorthand = /^(R|H|S|T|M)(元|\d{1,2})$/i.exec(value);
  const full = /^(令和|平成|昭和|大正|明治)(元|\d{1,2})年?$/.exec(value);
  const map = { R: 2018, H: 1988, S: 1925, T: 1911, M: 1867, 令和: 2018, 平成: 1988, 昭和: 1925, 大正: 1911, 明治: 1867 };
  const match = shorthand || full;
  if (match) {
    const base = map[match[1].toUpperCase ? match[1].toUpperCase() : match[1]] ?? map[match[1]];
    const n = match[2] === '元' ? 1 : Number(match[2]);
    return String(base + n);
  }
  return value;
}

function formatAsOfDate() {
  const parts = toDateParts(state.asOfDate);
  if (!parts) return '';
  if (state.yearMode === 'japanese') return `${japaneseEra(parts.year, parts.month, parts.day)} 年 ${parts.month} 月 ${parts.day} 日現在`;
  return `${parts.year} 年 ${parts.month} 月 ${parts.day} 日現在`;
}

function calculateAge(birthISO, asOfISO) {
  const birth = toDateParts(birthISO);
  const asOf = toDateParts(asOfISO);
  if (!birth || !asOf) return '';
  let age = asOf.year - birth.year;
  if (asOf.month < birth.month || (asOf.month === birth.month && asOf.day < birth.day)) age -= 1;
  return age >= 0 && age < 150 ? age : '';
}

function formatBirthText() {
  const parts = toDateParts(state.birthDate);
  if (!parts) return '　　　 年　 月　 日生　（満　 歳）';
  const year = state.yearMode === 'japanese' ? japaneseEra(parts.year, parts.month, parts.day) : parts.year;
  const age = calculateAge(state.birthDate, state.asOfDate);
  return `${year} 年 ${parts.month} 月 ${parts.day} 日生　（満 ${age} 歳）`;
}


function normalizePostalCode(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 7);
}

function formatPostalCode(value) {
  const digits = normalizePostalCode(value);
  return digits.length > 3 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits;
}

function kanaToHiragana(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[ァ-ヶ]/g, char => String.fromCharCode(char.charCodeAt(0) - 0x60));
}

function setPostalLookupStatus(message, type = '') {
  const status = $('#postalLookupStatus');
  if (!status) return;
  status.textContent = message;
  status.classList.remove('is-loading', 'is-success', 'is-error');
  if (type) status.classList.add(`is-${type}`);
}

function renderPostalCandidates(results = postalLookupResults) {
  const wrap = $('#postalResultWrap');
  const select = $('#postalResultSelect');
  const reapply = $('#reapplyPostalResultBtn');
  if (!wrap || !select || !reapply) return;
  select.innerHTML = '';
  results.forEach((result, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${result.address1 || ''}${result.address2 || ''}${result.address3 || ''}`;
    select.appendChild(option);
  });
  wrap.hidden = results.length <= 1;
  reapply.disabled = results.length === 0;
}

function applyPostalResult(result, { preserveSuffix = true } = {}) {
  if (!result) return;
  const kanjiBase = `${result.address1 || ''}${result.address2 || ''}${result.address3 || ''}`;
  const kanaBase = kanaToHiragana(`${result.kana1 || ''}${result.kana2 || ''}${result.kana3 || ''}`);

  let kanjiSuffix = '';
  let kanaSuffix = '';
  if (preserveSuffix && state.postalAddressBase && String(state.address || '').startsWith(state.postalAddressBase)) {
    kanjiSuffix = String(state.address || '').slice(state.postalAddressBase.length);
  }
  if (preserveSuffix && state.postalKanaBase && String(state.addressKana || '').startsWith(state.postalKanaBase)) {
    kanaSuffix = String(state.addressKana || '').slice(state.postalKanaBase.length);
  }

  state.postalCode = formatPostalCode(result.zipcode || state.postalCode);
  state.postalAddressBase = kanjiBase;
  state.postalKanaBase = kanaBase;
  state.address = `${kanjiBase}${kanjiSuffix}`;
  state.addressKana = `${kanaBase}${kanaSuffix}`;

  bindControlValues();
  renderTextFields();
  fitAllText();
  markChanged();
  setPostalLookupStatus('住所とふりがなを自動入力しました。番地・建物名を追記してください。', 'success');
}

function requestPostalCodeJSONP(postalCode) {
  const requestId = ++postalLookupRequestId;
  return new Promise((resolve, reject) => {
    const callbackName = `__rirekishoPostalCallback_${Date.now()}_${requestId}`;
    const script = document.createElement('script');
    let settled = false;
    const cleanup = () => {
      if (script.parentNode) script.remove();
      try { delete window[callbackName]; } catch { window[callbackName] = undefined; }
    };
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('住所検索がタイムアウトしました。'));
    }, 12000);

    window[callbackName] = payload => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      resolve(payload);
    };
    script.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      reject(new Error('住所検索サービスへ接続できませんでした。'));
    };
    script.src = `${ZIPCLOUD_API_URL}?zipcode=${encodeURIComponent(postalCode)}&limit=20&callback=${encodeURIComponent(callbackName)}`;
    script.async = true;
    document.head.appendChild(script);
  });
}

async function lookupPostalCode(rawValue, { silentIncomplete = false } = {}) {
  const digits = normalizePostalCode(rawValue);
  state.postalCode = formatPostalCode(digits);
  setControlValue('#postalLookupInput', state.postalCode);
  const previewPostal = $('[data-field="postalCode"]');
  if (previewPostal) previewPostal.textContent = state.postalCode;
  markChanged();

  if (digits.length !== 7) {
    postalLookupResults = [];
    renderPostalCandidates([]);
    if (!silentIncomplete) setPostalLookupStatus('郵便番号を7桁で入力してください。', 'error');
    else setPostalLookupStatus('7桁を入力すると住所を自動検索します。');
    return;
  }

  setPostalLookupStatus('郵便番号から住所を検索しています…', 'loading');
  const requestAtStart = postalLookupRequestId + 1;
  try {
    const payload = await requestPostalCodeJSONP(digits);
    if (requestAtStart !== postalLookupRequestId) return;
    if (!payload || Number(payload.status) !== 200) throw new Error(payload?.message || '住所検索でエラーが発生しました。');
    postalLookupResults = Array.isArray(payload.results) ? payload.results : [];
    renderPostalCandidates(postalLookupResults);
    if (!postalLookupResults.length) {
      setPostalLookupStatus('該当する住所が見つかりませんでした。郵便番号を確認してください。', 'error');
      return;
    }
    applyPostalResult(postalLookupResults[0]);
    if (postalLookupResults.length > 1) {
      setPostalLookupStatus(`住所候補が${postalLookupResults.length}件あります。候補を選択できます。`, 'success');
    }
  } catch (error) {
    console.error('Postal code lookup failed', error);
    postalLookupResults = [];
    renderPostalCandidates([]);
    setPostalLookupStatus(`${error?.message || '住所を検索できませんでした。'} 手入力も可能です。`, 'error');
  }
}

function schedulePostalLookup(rawValue) {
  clearTimeout(postalLookupTimer);
  const digits = normalizePostalCode(rawValue);
  state.postalCode = formatPostalCode(digits);
  setControlValue('#postalLookupInput', state.postalCode);
  if (digits.length !== 7) {
    postalLookupResults = [];
    renderPostalCandidates([]);
    setPostalLookupStatus('7桁を入力すると住所を自動検索します。');
    return;
  }
  postalLookupTimer = setTimeout(() => lookupPostalCode(digits, { silentIncomplete: true }), 450);
}

function syncQuickEntryControls() {
  setControlValue('#quickNameKanaInput', state.nameKana || '');
  setControlValue('#quickNameInput', state.name || '');
  setControlValue('#quickPhoneInput', state.phone || '');
  setControlValue('#quickEmailInput', state.email || '');
  setControlValue('#quickContactKanaInput', state.contactKana || '');
  setControlValue('#quickContactAddressInput', state.contactAddress || '');
  setControlValue('#quickContactPhoneInput', state.contactPhone || '');
  setControlValue('#quickMotivationInput', state.motivation || '');
  setControlValue('#quickRequestsInput', state.requests || '');
}

function bindControlValues() {
  setControlValue('#documentTitle', state.title || '');
  setControlValue('#asOfDate', state.asOfDate || '');
  setControlValue('#birthDate', state.birthDate || '');
  setControlValue('#genderSelect', state.gender || '');
  setControlValue('#postalLookupInput', formatPostalCode(state.postalCode || ''));
  setControlValue('#addressKanjiInput', state.address || '');
  setControlValue('#addressKanaInput', state.addressKana || '');
  $$('[data-year-mode]').forEach(btn => btn.classList.toggle('active', btn.dataset.yearMode === state.yearMode));
  $('#editPhotoBtn').disabled = !state.photo;
  $('#removePhotoBtn').disabled = !state.photo;

  setControlValue('#motivationInput', state.motivation || '');
  setControlValue('#requestsInput', state.requests || '');
  setControlValue('#motivationFontSize', state.motivationFont || 100);
  setControlValue('#requestsFontSize', state.requestsFont || 100);
  $('#motivationFontValue').textContent = `${state.motivationFont || 100}%`;
  $('#requestsFontValue').textContent = `${state.requestsFont || 100}%`;
  setControlValue('#commuteValueInput', state.infoBoxes?.[0]?.value || '');
  setControlValue('#dependentsValueInput', state.infoBoxes?.[1]?.value || '');

  const totalHistorySlots = state.layout.historyLeftSlots + state.layout.historyRightSlots;
  setControlValue('#historyTotalSlots', totalHistorySlots);
  setControlValue('#historyLeftSlots', state.layout.historyLeftSlots);
  setControlValue('#historyRightSlots', state.layout.historyRightSlots);
  const safeLimits = getSafeRowControlLimits();
  const splitLimits = getHistorySplitLimits(totalHistorySlots, safeLimits);
  setControlValue('#licenseSlots', state.layout.licenseSlots);
  $('#historyTotalSlots').min = String(safeLimits.total[0]);
  $('#historyTotalSlots').max = String(safeLimits.total[1]);
  $('#historyLeftSlots').min = String(splitLimits.left[0]);
  $('#historyLeftSlots').max = String(splitLimits.left[1]);
  $('#historyRightSlots').min = String(splitLimits.right[0]);
  $('#historyRightSlots').max = String(splitLimits.right[1]);
  $('#licenseSlots').min = String(safeLimits.license[0]);
  $('#licenseSlots').max = String(safeLimits.license[1]);
  $('#historyTotalSlots').title = `推奨範囲 ${safeLimits.total[0]}〜${safeLimits.total[1]} 行`;
  $('#historyLeftSlots').title = `現在の合計${totalHistorySlots}行では ${splitLimits.left[0]}〜${splitLimits.left[1]} 行`;
  $('#historyRightSlots').title = `現在の合計${totalHistorySlots}行では ${splitLimits.right[0]}〜${splitLimits.right[1]} 行`;
  $('#licenseSlots').title = `選択範囲 ${safeLimits.license[0]}〜${safeLimits.license[1]} 行`;
  const splitInfo = $('#historySplitLiveInfo');
  if (splitInfo) {
    const overflowToRight = Math.max(0, state.history.length - state.layout.historyLeftSlots);
    splitInfo.textContent = overflowToRight > 0
      ? `現在の配分：左側を優先して ${state.layout.historyLeftSlots} 行まで表示し、超えた ${overflowToRight} 行は右側へ続けて表示（右枠 ${state.layout.historyRightSlots} 行）`
      : `現在の配分：左側優先 ${state.layout.historyLeftSlots} 行 ＋ 右側 ${state.layout.historyRightSlots} 行 ＝ 合計 ${totalHistorySlots} 行`;
  }
  setControlValue('#autoTextSectionRatio', state.layout.autoTextSectionRatio !== false);
  const textMetrics = calculateLayoutMetrics();
  setControlValue('#textSectionRatio', state.layout.textSectionRatio);
  $('#textSectionRatio').min = String(textMetrics.ratioMin);
  $('#textSectionRatio').max = String(textMetrics.ratioMax);
  $('#textSectionRatioValue').textContent = `上段 ${state.layout.textSectionRatio}% / 下段 ${100 - state.layout.textSectionRatio}%`;
  setControlValue('#requestSectionHeight', Math.round(textMetrics.requestHeight));
  $('#requestSectionHeight').min = String(Math.ceil(textMetrics.requestMinHeight));
  $('#requestSectionHeight').max = String(Math.floor(textMetrics.requestMaxHeight));
  $('#requestSectionHeightValue').textContent = `${textMetrics.requestHeight.toFixed(0)} mm`;
  syncQuickEntryControls();

  const margins = state.layout.printMargins;
  setControlValue('#printMarginTop', margins.top);
  setControlValue('#printMarginBottom', margins.bottom);
  setControlValue('#printMarginLeft', margins.left);
  setControlValue('#printMarginRight', margins.right);
  setControlValue('#printHeader', margins.header);
  setControlValue('#printFooter', margins.footer);
}


function applyCustomFieldSizing() {
  const motivationEl = $('[data-field="motivation"]');
  const requestsEl = $('[data-field="requests"]');
  if (motivationEl) motivationEl.dataset.baseFontSize = `${12 * (Number(state.motivationFont || 100) / 100)}px`;
  if (requestsEl) requestsEl.dataset.baseFontSize = `${12 * (Number(state.requestsFont || 100) / 100)}px`;
}

function renderTextFields() {
  for (const field of editableFields) {
    const element = $(`[data-field="${field}"]`);
    if (element && element.textContent !== (state[field] || '')) element.textContent = state[field] || '';
  }
  $('#asOfText').textContent = formatAsOfDate();
  $('#birthText').textContent = formatBirthText();
  $('#genderText').textContent = state.gender || '';
  applyCustomFieldSizing();
  renderInfoBoxes();
  const photo = $('#photoPreview');
  const selectedPhotoCard = $('#selectedPhotoCard');
  const selectedPhotoThumb = $('#selectedPhotoThumb');
  if (state.photo) {
    photo.src = state.photo;
    photo.hidden = false;
    $('#photoPlaceholder').hidden = true;
    if (selectedPhotoThumb) selectedPhotoThumb.src = state.photo;
    if (selectedPhotoCard) selectedPhotoCard.hidden = false;
  } else {
    photo.removeAttribute('src');
    photo.hidden = true;
    $('#photoPlaceholder').hidden = false;
    if (selectedPhotoThumb) selectedPhotoThumb.removeAttribute('src');
    if (selectedPhotoCard) selectedPhotoCard.hidden = true;
  }
  syncQuickEntryControls();
}


function clampInteger(value, min, max, fallback) {
  const num = Math.round(Number(value));
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function getSafeRowControlLimits(target = state) {
  const margins = (target.layout && target.layout.printMargins) || state.layout.printMargins || defaultDocument().layout.printMargins;
  const contentHeight = Math.max(225, A3_MM.height - clampNumber(margins.top, 0, 40, 19) - clampNumber(margins.bottom, 0, 40, 19));
  const leftFixedWithoutRows = 13 + 31 + 56 + 9 + LEFT_FOOTER_HEIGHT_MM + (LEFT_SECTION_GAP_MM * 4);
  const rightMinimumText = 58;
  const rightFixed = 18 + 10 + rightMinimumText;

  const dynamicLeftMax = Math.max(LAYOUT_LIMITS.left[0], Math.min(LAYOUT_LIMITS.left[1], Math.floor((contentHeight - leftFixedWithoutRows) / SAFE_ROW_HEIGHT_MIN_MM)));
  const dynamicCombinedRightMax = Math.max(LAYOUT_LIMITS.right[0] + LAYOUT_LIMITS.license[0], Math.floor((contentHeight - rightFixed) / SAFE_ROW_HEIGHT_MIN_MM));
  const dynamicLicenseMax = Math.max(LAYOUT_LIMITS.license[0], Math.min(LAYOUT_LIMITS.license[1], dynamicCombinedRightMax - LAYOUT_LIMITS.right[0]));
  const currentLicense = clampInteger((target.layout && target.layout.licenseSlots) || 6, LAYOUT_LIMITS.license[0], dynamicLicenseMax, 6);
  const dynamicRightMax = Math.max(LAYOUT_LIMITS.right[0], Math.min(LAYOUT_LIMITS.right[1], dynamicCombinedRightMax - currentLicense));
  const minTotal = LAYOUT_LIMITS.left[0] + LAYOUT_LIMITS.right[0];
  const maxTotal = Math.max(minTotal, Math.min(dynamicLeftMax + dynamicRightMax, LAYOUT_LIMITS.left[1] + LAYOUT_LIMITS.right[1]));
  return {
    left: [LAYOUT_LIMITS.left[0], dynamicLeftMax],
    right: [LAYOUT_LIMITS.right[0], dynamicRightMax],
    license: [LAYOUT_LIMITS.license[0], dynamicLicenseMax],
    total: [minTotal, maxTotal]
  };
}

function getHistorySplitLimits(totalSlots, limits = getSafeRowControlLimits()) {
  const total = clampInteger(totalSlots, limits.total[0], limits.total[1], limits.total[0]);
  const leftMin = Math.max(limits.left[0], total - limits.right[1]);
  const leftMax = Math.min(limits.left[1], total - limits.right[0]);
  const rightMin = Math.max(limits.right[0], total - limits.left[1]);
  const rightMax = Math.min(limits.right[1], total - limits.left[0]);
  return {
    left: [Math.min(leftMin, leftMax), Math.max(leftMin, leftMax)],
    right: [Math.min(rightMin, rightMax), Math.max(rightMin, rightMax)]
  };
}

function calculateAutoTextSectionRatio(totalHistorySlots = state.layout.historyLeftSlots + state.layout.historyRightSlots, licenseSlots = state.layout.licenseSlots) {
  const historyDelta = AUTO_RATIO_BASE_TOTAL - Number(totalHistorySlots || AUTO_RATIO_BASE_TOTAL);
  const licenseDelta = AUTO_RATIO_BASE_LICENSE - Number(licenseSlots || AUTO_RATIO_BASE_LICENSE);
  return Math.round(clampNumber(
    AUTO_RATIO_BASE_VALUE + historyDelta * AUTO_RATIO_PER_HISTORY_ROW + licenseDelta * AUTO_RATIO_PER_LICENSE_ROW,
    TEXT_RATIO_MIN,
    TEXT_RATIO_MAX,
    AUTO_RATIO_BASE_VALUE
  ));
}

function syncTextSectionRatioAfterRowChange() {
  if (state.layout.autoTextSectionRatio !== false) {
    const totalHistorySlots = state.layout.historyLeftSlots + state.layout.historyRightSlots;
    const autoRatio = calculateAutoTextSectionRatio(totalHistorySlots, state.layout.licenseSlots);
    const metrics = calculateLayoutMetrics();
    state.layout.textSectionRatio = autoRatio;
    state.layout.requestSectionHeight = clampNumber(
      metrics.availableTextHeight * (100 - autoRatio) / 100,
      metrics.requestMinHeight,
      metrics.requestMaxHeight,
      metrics.requestHeight
    );
  }
  return calculateLayoutMetrics();
}

function getRequiredHistorySlotCount(target = state) {
  const rows = Array.isArray(target.history) ? target.history : [];
  let lastRequiredIndex = -1;
  rows.forEach((row, index) => {
    if (!row) return;
    const hasContent = String(row.year || '').trim()
      || String(row.month || '').trim()
      || String(row.text || '').trim()
      || row.kind === 'section'
      || row.kind === 'end';
    if (hasContent) lastRequiredIndex = index;
  });
  const limits = getSafeRowControlLimits(target);
  return Math.max(limits.total[0], lastRequiredIndex + 1);
}

function getAutoLicenseSlotCount(target = state) {
  const items = Array.isArray(target.licenses) ? target.licenses.length : 0;
  return clampInteger(Math.max(LAYOUT_LIMITS.license[0], items), LAYOUT_LIMITS.license[0], LAYOUT_LIMITS.license[1], LAYOUT_LIMITS.license[0]);
}

function reduceBlankHistoryRowsForLicenseIncrease(previousLicenseSlots, nextLicenseSlots) {
  const increase = Math.max(0, Number(nextLicenseSlots) - Number(previousLicenseSlots));
  if (!increase) return 0;

  const currentTotal = state.layout.historyLeftSlots + state.layout.historyRightSlots;
  const requiredTotal = getRequiredHistorySlotCount(state);
  const removableBlankRows = Math.max(0, currentTotal - requiredTotal);
  const rowsToRemove = Math.min(increase, removableBlankRows);
  if (!rowsToRemove) return 0;

  const safeLimits = getSafeRowControlLimits();
  const targetTotal = clampInteger(currentTotal - rowsToRemove, safeLimits.total[0], safeLimits.total[1], currentTotal);
  const balanced = rebalanceHistorySlots(targetTotal, {}, safeLimits);
  state.layout.historyLeftSlots = balanced.left;
  state.layout.historyRightSlots = balanced.right;
  return currentTotal - balanced.total;
}

function applyHistorySplitFromSide(side, rawValue) {
  const safeLimits = getSafeRowControlLimits();
  const total = state.layout.historyLeftSlots + state.layout.historyRightSlots;
  const splitLimits = getHistorySplitLimits(total, safeLimits);
  if (side === 'left') {
    const left = clampInteger(rawValue, splitLimits.left[0], splitLimits.left[1], state.layout.historyLeftSlots);
    state.layout.historyLeftSlots = left;
    state.layout.historyRightSlots = total - left;
  } else {
    const right = clampInteger(rawValue, splitLimits.right[0], splitLimits.right[1], state.layout.historyRightSlots);
    state.layout.historyRightSlots = right;
    state.layout.historyLeftSlots = total - right;
  }
  syncTextSectionRatioAfterRowChange();
}

function rebalanceHistorySlots(totalSlots, preference = {}, limits = getSafeRowControlLimits()) {
  const leftLimits = limits.left;
  const rightLimits = limits.right;
  const minTotal = limits.total[0];
  const maxTotal = limits.total[1];
  const total = clampInteger(totalSlots, minTotal, maxTotal, minTotal);
  const fallbackLeft = Math.round(total * HISTORY_BALANCE_RATIO);
  const preferredLeftFill = Math.min(leftLimits[1], Math.max(leftLimits[0], total - rightLimits[0]));
  let left;
  if (preference.left != null) {
    left = clampInteger(preference.left, leftLimits[0], leftLimits[1], preferredLeftFill);
  } else if (preference.right != null) {
    const rightPreferred = clampInteger(preference.right, rightLimits[0], rightLimits[1], total - preferredLeftFill);
    left = total - rightPreferred;
  } else {
    left = preferredLeftFill;
  }

  left = clampInteger(left, leftLimits[0], leftLimits[1], preferredLeftFill || fallbackLeft);
  let right = total - left;

  if (right < rightLimits[0]) {
    right = rightLimits[0];
    left = total - right;
  }
  if (right > rightLimits[1]) {
    right = rightLimits[1];
    left = total - right;
  }

  left = clampInteger(left, leftLimits[0], leftLimits[1], left);
  right = clampInteger(total - left, rightLimits[0], rightLimits[1], right);

  let diff = total - (left + right);
  while (diff > 0) {
    if (left < leftLimits[1]) { left += 1; diff -= 1; continue; }
    if (right < rightLimits[1]) { right += 1; diff -= 1; continue; }
    break;
  }
  while (diff < 0) {
    if (right > rightLimits[0]) { right -= 1; diff += 1; continue; }
    if (left > leftLimits[0]) { left -= 1; diff += 1; continue; }
    break;
  }
  return { left, right, total: left + right };
}

function normalizeLayoutCapacity(target = state, preferredSide = null, totalOverride = null) {
  const layout = target.layout || (target.layout = deepClone(defaultDocument().layout));
  const safeLimits = getSafeRowControlLimits(target);
  layout.historyLeftSlots = clampInteger(layout.historyLeftSlots, safeLimits.left[0], safeLimits.left[1], 17);
  layout.historyRightSlots = clampInteger(layout.historyRightSlots, safeLimits.right[0], safeLimits.right[1], 11);
  layout.licenseSlots = clampInteger(layout.licenseSlots, safeLimits.license[0], safeLimits.license[1], 6);
  layout.textSectionRatio = clampInteger(layout.textSectionRatio, TEXT_RATIO_MIN, TEXT_RATIO_MAX, 62);
  layout.requestSectionHeight = clampNumber(layout.requestSectionHeight, REQUEST_HEIGHT_MIN_MM, 120, 38);
  layout.autoTextSectionRatio = layout.autoTextSectionRatio !== false;

  const requiredHistory = Array.isArray(target.history) ? target.history.length : 0;
  const requestedTotal = Math.max(requiredHistory, totalOverride == null ? layout.historyLeftSlots + layout.historyRightSlots : totalOverride, safeLimits.total[0]);
  const preference = preferredSide === 'left'
    ? { left: layout.historyLeftSlots }
    : preferredSide === 'right'
      ? { right: layout.historyRightSlots }
      : {};
  const balanced = rebalanceHistorySlots(Math.min(requestedTotal, safeLimits.total[1]), preference, safeLimits);
  layout.historyLeftSlots = balanced.left;
  layout.historyRightSlots = balanced.right;

  layout.licenseSlots = clampInteger(Math.max(layout.licenseSlots, Array.isArray(target.licenses) ? target.licenses.length : 0), safeLimits.license[0], safeLimits.license[1], layout.licenseSlots);
}


function calculateLayoutMetrics() {
  normalizeLayoutCapacity();
  const leftSlots = state.layout.historyLeftSlots;
  const rightSlots = state.layout.historyRightSlots;
  const licenseSlots = clampInteger(Math.max(state.layout.licenseSlots, state.licenses.length), LAYOUT_LIMITS.license[0], LAYOUT_LIMITS.license[1], state.layout.licenseSlots);
  const margins = state.layout.printMargins || {};
  const contentHeight = Math.max(225, A3_MM.height - clampNumber(margins.top, 0, 40, 19) - clampNumber(margins.bottom, 0, 40, 19));
  const leftFixedWithoutRows = 13 + 31 + 56 + 9 + LEFT_FOOTER_HEIGHT_MM + (LEFT_SECTION_GAP_MM * 4);
  const leftBased = (contentHeight - leftFixedWithoutRows) / Math.max(1, leftSlots);
  const rightMinimumText = 58;
  const rightSectionGap = 3;
  const rightGapTotal = rightSectionGap * 3;
  const rightFixed = 20 + rightMinimumText + rightGapTotal;
  const rightBased = (contentHeight - rightFixed) / Math.max(1, rightSlots + licenseSlots);
  const rowHeight = clampNumber(Math.min(leftBased, rightBased), SAFE_ROW_HEIGHT_MIN_MM, SAFE_ROW_HEIGHT_MAX_MM, 8.0);
  const headerHeight = 10;
  const leftHistoryHeight = headerHeight + leftSlots * rowHeight;
  const rightHistoryHeight = headerHeight + rightSlots * rowHeight;
  const licenseHeight = headerHeight + licenseSlots * rowHeight;
  const availableTextHeight = Math.max(48, contentHeight - rightHistoryHeight - licenseHeight - rightGapTotal);
  const customInfoCount = Math.max(0, (Array.isArray(state.infoBoxes) ? state.infoBoxes.length : 2) - 2);
  const motivationMinHeight = Math.min(
    Math.max(INFO_BOX_MIN_HEIGHT_MM * 2 + customInfoCount * 10, 24),
    Math.max(24, availableTextHeight - REQUEST_HEIGHT_MIN_MM)
  );
  const requestMinHeight = REQUEST_HEIGHT_MIN_MM;
  const requestMaxHeight = Math.max(requestMinHeight, availableTextHeight - motivationMinHeight);
  const motivationMaxHeight = Math.max(motivationMinHeight, availableTextHeight - requestMinHeight);
  const ratioMin = Math.max(TEXT_RATIO_MIN, Math.ceil((motivationMinHeight / availableTextHeight) * 100));
  const ratioMax = Math.min(TEXT_RATIO_MAX, Math.floor((motivationMaxHeight / availableTextHeight) * 100));
  const ratioFallback = clampNumber(state.layout.textSectionRatio, ratioMin, ratioMax, 62);
  const fallbackRequestHeight = availableTextHeight * (100 - ratioFallback) / 100;
  let requestHeight = clampNumber(state.layout.requestSectionHeight, requestMinHeight, requestMaxHeight, fallbackRequestHeight);
  let motivationHeight = availableTextHeight - requestHeight;
  if (motivationHeight > motivationMaxHeight) {
    motivationHeight = motivationMaxHeight;
    requestHeight = availableTextHeight - motivationHeight;
  }
  if (motivationHeight < motivationMinHeight) {
    motivationHeight = motivationMinHeight;
    requestHeight = availableTextHeight - motivationHeight;
  }
  state.layout.requestSectionHeight = requestHeight;
  state.layout.textSectionRatio = Math.round((motivationHeight / availableTextHeight) * 100);
  return {
    leftSlots, rightSlots, licenseSlots, rowHeight, contentHeight,
    leftHistoryHeight, rightHistoryHeight, licenseHeight,
    motivationHeight, requestHeight, availableTextHeight, requestMinHeight, requestMaxHeight, motivationMinHeight, motivationMaxHeight, ratioMin, ratioMax
  };
}

function applyTableLayout(metrics = calculateLayoutMetrics()) {
  const leftHalf = $('.left-half');
  const rightHalf = $('.right-half');
  leftHalf.style.setProperty('--left-history-height', `${metrics.leftHistoryHeight.toFixed(3)}mm`);
  leftHalf.style.setProperty('--left-footer-height', `${LEFT_FOOTER_HEIGHT_MM}mm`);
  leftHalf.style.setProperty('--left-section-gap', `${LEFT_SECTION_GAP_MM}mm`);
  rightHalf.style.setProperty('--right-history-height', `${metrics.rightHistoryHeight.toFixed(3)}mm`);
  rightHalf.style.setProperty('--license-height', `${metrics.licenseHeight.toFixed(3)}mm`);
  rightHalf.style.setProperty('--motivation-height', `${metrics.motivationHeight.toFixed(3)}mm`);
  rightHalf.style.setProperty('--request-height', `${metrics.requestHeight.toFixed(3)}mm`);
  const safeLimits = getSafeRowControlLimits();
  const metricText = `標準レイアウト：行高 ${metrics.rowHeight.toFixed(1)} mm・学歴職歴 左${metrics.leftSlots}行／右${metrics.rightSlots}行・資格 ${metrics.licenseSlots}行・固定2枠を保持`; 
  const metricElement = $('#sharedRowHeightInfo');
  if (metricElement) metricElement.textContent = metricText;
  return metrics;
}

function historySplit(metrics = calculateLayoutMetrics()) {
  return {
    leftCount: Math.min(state.history.length, metrics.leftSlots),
    leftSlots: metrics.leftSlots,
    rightSlots: metrics.rightSlots
  };
}


function createRowElement(row, type) {
  const line = document.createElement('div');
  line.className = `${type === 'history' ? 'history-line' : 'license-line'}`;
  line.dataset.id = row.id;
  line.dataset.type = type;
  if (row.kind === 'section') line.classList.add('section-row');
  if (row.kind === 'end') line.classList.add('end-row');
  if (selectedRow?.id === row.id && selectedRow?.type === type) line.classList.add('selected');

  const year = document.createElement('div');
  year.className = 'row-cell year fit-text';
  year.contentEditable = 'true';
  year.spellcheck = false;
  year.dataset.key = 'year';
  year.textContent = formatYear(row.year, row.month);
  year.addEventListener('focus', () => {
    selectRow(type, row.id);
    year.textContent = row.year || '';
    requestAnimationFrame(() => selectAllText(year));
  });
  year.addEventListener('blur', () => {
    row.year = parseYearInput(year.textContent);
    year.textContent = formatYear(row.year, row.month);
    markChanged();
    fitAllText();
  });

  const month = document.createElement('div');
  month.className = 'row-cell month fit-text';
  month.contentEditable = 'true';
  month.spellcheck = false;
  month.dataset.key = 'month';
  month.textContent = row.month || '';
  month.addEventListener('focus', () => selectRow(type, row.id));
  month.addEventListener('input', () => {
    row.month = month.textContent.trim().slice(0, 2);
    markChanged();
  });
  month.addEventListener('blur', () => {
    const num = Number(row.month);
    if (Number.isFinite(num) && num >= 1 && num <= 12) row.month = String(num);
    month.textContent = row.month || '';
    markChanged();
  });

  const text = document.createElement('div');
  text.className = 'row-cell text fit-text';
  text.contentEditable = 'true';
  text.spellcheck = false;
  text.dataset.key = 'text';
  text.textContent = row.text || '';
  text.addEventListener('focus', () => selectRow(type, row.id));
  text.addEventListener('input', () => {
    row.text = text.textContent.replace(/\n/g, ' ');
    markChanged();
    fitElement(text);
  });
  text.addEventListener('blur', () => {
    text.textContent = row.text || '';
    markChanged();
  });

  line.addEventListener('click', () => selectRow(type, row.id));
  line.append(year, month, text);
  return line;
}

function createEmptyRow(type) {
  const line = document.createElement('div');
  line.className = `${type === 'history' ? 'history-line' : 'license-line'} empty-row`;
  line.dataset.empty = 'true';
  for (const className of ['year', 'month', 'text']) {
    const cell = document.createElement('div');
    cell.className = `row-cell ${className}`;
    cell.innerHTML = '&nbsp;';
    line.appendChild(cell);
  }
  return line;
}

function renderRows() {
  const metrics = applyTableLayout();
  const split = historySplit(metrics);
  const leftRows = state.history.slice(0, metrics.leftSlots);
  const rightRows = state.history.slice(metrics.leftSlots, metrics.leftSlots + metrics.rightSlots);
  renderRowContainer($('#leftHistoryRows'), leftRows, metrics.leftSlots, 'history', metrics.rowHeight);
  renderRowContainer($('#rightHistoryRows'), rightRows, metrics.rightSlots, 'history', metrics.rowHeight);
  renderRowContainer($('#licenseRows'), state.licenses.slice(0, metrics.licenseSlots), metrics.licenseSlots, 'license', metrics.rowHeight);
  updateRowCountInfo(split, metrics);
  refreshRowEditorSelectors();
}


function renderRowContainer(container, rows, slots, type, rowHeight) {
  container.innerHTML = '';
  const rowsHeight = rowHeight.toFixed(3);
  container.style.gridTemplateRows = `repeat(${slots}, ${rowsHeight}mm)`;
  container.style.height = `${(slots * rowHeight).toFixed(3)}mm`;
  container.style.minHeight = `${(slots * rowHeight).toFixed(3)}mm`;
  rows.forEach(row => {
    const el = createRowElement(row, type);
    el.style.height = `${rowsHeight}mm`;
    el.style.minHeight = `${rowsHeight}mm`;
    el.style.maxHeight = `${rowsHeight}mm`;
    container.appendChild(el);
  });
  for (let i = rows.length; i < slots; i += 1) {
    const el = createEmptyRow(type);
    el.style.height = `${rowsHeight}mm`;
    el.style.minHeight = `${rowsHeight}mm`;
    el.style.maxHeight = `${rowsHeight}mm`;
    container.appendChild(el);
  }
}


function updateRowCountInfo(split = historySplit(), metrics = calculateLayoutMetrics()) {
  const info = $('#rowCountInfo');
  const capacity = metrics.leftSlots + metrics.rightSlots;
  const historyOverflow = state.history.length > capacity;
  const licenseOverflow = state.licenses.length > metrics.licenseSlots;
  const crowded = metrics.rowHeight < 6.5 || historyOverflow || licenseOverflow;
  info.classList.toggle('warn', crowded);
  const safeLimitsInfo = getSafeRowControlLimits();
  info.textContent = `学歴・職歴：内容${state.history.length}行 / 枠${capacity}行（左${metrics.leftSlots}・右${metrics.rightSlots}・合計${capacity}行）、資格：内容${state.licenses.length}行 / 枠${metrics.licenseSlots}行。共通行高 ${metrics.rowHeight.toFixed(1)}mm。推奨範囲：合計${safeLimitsInfo.total[0]}〜${safeLimitsInfo.total[1]}、左${safeLimitsInfo.left[0]}〜${safeLimitsInfo.left[1]}、右${safeLimitsInfo.right[0]}〜${safeLimitsInfo.right[1]}、資格${safeLimitsInfo.license[0]}〜${safeLimitsInfo.license[1]}。${crowded ? ' 行数が多い場合は自動で上限に合わせます。' : ' 標準の行高を保ち、余白や罫線が崩れない範囲で調整しています。'}`;
  $('#pageFitStatus').textContent = `共通行高 ${metrics.rowHeight.toFixed(1)}mm・A3中央配置`;
}


function selectRow(type, id) {
  selectedRow = { type, id };
  $$('.history-line.selected, .license-line.selected').forEach(el => el.classList.remove('selected'));
  const line = $(`[data-type="${type}"][data-id="${id}"]`);
  if (line) line.classList.add('selected');
  refreshRowEditorSelectors();
  syncRowEditorValues(type);
}


function selectAllText(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function insertRow(type, row) {
  const list = type === 'license' ? state.licenses : state.history;
  let index = list.length;
  if (selectedRow?.type === type) {
    const found = list.findIndex(item => item.id === selectedRow.id);
    if (found >= 0) index = found + 1;
  } else {
    const endIndex = list.findIndex(item => item.kind === 'end');
    if (endIndex >= 0) index = endIndex;
  }
  list.splice(index, 0, row);
  selectedRow = { type, id: row.id };
  normalizeLayoutCapacity();
  renderRows();
  bindControlValues();
  markChanged();
  requestAnimationFrame(() => {
    const mobileEditor = document.body.classList.contains('mobile-editor');
    const target = mobileEditor
      ? (type === 'license' ? $('#licenseEditorText') : $('#historyEditorText'))
      : $(`[data-type="${type}"][data-id="${row.id}"] .row-cell.text`);
    target?.focus();
  });
}


function moveSelected(direction) {
  if (!selectedRow) return showToast('先に表の行を選択してください。');
  const list = selectedRow.type === 'license' ? state.licenses : state.history;
  const index = list.findIndex(row => row.id === selectedRow.id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target], list[index]];
  renderRows();
  markChanged();
}


function duplicateSelectedRow() {
  if (!selectedRow) return showToast('先に表の行を選択してください。');
  const list = selectedRow.type === 'license' ? state.licenses : state.history;
  const index = list.findIndex(row => row.id === selectedRow.id);
  if (index < 0) return;
  const copy = { ...deepClone(list[index]), id: makeId() };
  list.splice(index + 1, 0, copy);
  selectedRow = { ...selectedRow, id: copy.id };
  normalizeLayoutCapacity();
  renderRows();
  bindControlValues();
  markChanged();
}


function deleteSelectedRow() {
  if (!selectedRow) return showToast('先に表の行を選択してください。');
  const list = selectedRow.type === 'license' ? state.licenses : state.history;
  const index = list.findIndex(row => row.id === selectedRow.id);
  if (index < 0) return;
  list.splice(index, 1);
  selectedRow = null;
  renderRows();
  markChanged();
}


function rowOptionText(row, index) {
  const content = String(row.text || '').trim().replace(/\s+/g, ' ');
  return `${index + 1}行目：${content || '（空欄）'}`;
}

function refreshRowEditorSelectors() {
  const configs = [
    { type: 'history', selector: '#historyRowSelect', list: state.history },
    { type: 'license', selector: '#licenseRowSelect', list: state.licenses }
  ];
  for (const config of configs) {
    const select = $(config.selector);
    if (!select) continue;
    const previous = selectedRow?.type === config.type ? selectedRow.id : select.value;
    select.innerHTML = '';
    config.list.forEach((row, index) => {
      const option = document.createElement('option');
      option.value = row.id;
      option.textContent = rowOptionText(row, index);
      select.appendChild(option);
    });
    if (config.list.some(row => row.id === previous)) select.value = previous;
    else if (config.list[0]) select.value = config.list[0].id;
  }
  syncRowEditorValues('history');
  syncRowEditorValues('license');
}

function getEditorRow(type) {
  const select = type === 'license' ? $('#licenseRowSelect') : $('#historyRowSelect');
  const list = type === 'license' ? state.licenses : state.history;
  return list.find(row => row.id === select?.value) || null;
}

function syncRowEditorValues(type) {
  const row = getEditorRow(type);
  const prefix = type === 'license' ? 'licenseEditor' : 'historyEditor';
  setControlValue(`#${prefix}Year`, row?.year || '');
  setControlValue(`#${prefix}Month`, row?.month || '');
  setControlValue(`#${prefix}Text`, row?.text || '');
}

function updateRowFromEditor(type, key, value) {
  const row = getEditorRow(type);
  if (!row) return;
  if (key === 'year') row.year = String(value || '');
  else if (key === 'month') row.month = String(value || '').slice(0, 2);
  else row.text = String(value || '').replace(/\r?\n/g, ' ');
  selectedRow = { type, id: row.id };
  renderRows();
  markChanged();
}

function appendHistoryAction() {
  const row = getEditorRow('history');
  const action = $('#historyActionSelect').value;
  if (!row) return showToast('学歴・職歴の行を選択してください。');
  if (!action) return showToast('追加する定型語を選択してください。');
  const base = String(row.text || '').trimEnd();
  row.text = base ? `${base}　${action}` : action;
  selectedRow = { type: 'history', id: row.id };
  renderRows();
  syncRowEditorValues('history');
  markChanged();
}

function getCustomInfoBoxes() {
  return state.infoBoxes.filter(box => !box.fixed);
}

function renderInfoBoxes() {
  const container = $('#infoBoxes');
  if (!container) return;
  if (!Array.isArray(state.infoBoxes) || state.infoBoxes.length < 2) {
    state.infoBoxes = deepClone(defaultDocument().infoBoxes);
  }
  state.infoBoxes[0].label = FIXED_INFO_LABELS[0];
  state.infoBoxes[0].fixed = true;
  state.infoBoxes[1].label = FIXED_INFO_LABELS[1];
  state.infoBoxes[1].fixed = true;
  const customBoxes = getCustomInfoBoxes();
  if (selectedInfoBoxId && !customBoxes.some(box => box.id === selectedInfoBoxId)) selectedInfoBoxId = customBoxes[0]?.id || null;
  container.innerHTML = '';
  container.classList.toggle('has-custom-info', customBoxes.length > 0);
  container.style.gridTemplateRows = customBoxes.length
    ? `repeat(2, minmax(26mm, 1fr)) repeat(${customBoxes.length}, minmax(18mm, auto))`
    : 'repeat(2, minmax(0, 1fr))';
  state.infoBoxes.forEach(box => {
    const wrapper = document.createElement('div');
    wrapper.className = `side-box dynamic-side-box ${box.fixed ? 'fixed-info-box' : 'custom-info-box'}`;
    wrapper.dataset.infoId = box.id;
    if (!box.fixed && box.id === selectedInfoBoxId) wrapper.classList.add('selected-info');

    const label = document.createElement('div');
    label.className = 'section-caption fit-text';
    label.textContent = box.label || '';
    if (!box.fixed) {
      label.classList.add('editable-caption');
      label.contentEditable = 'true';
      label.spellcheck = false;
      label.addEventListener('focus', () => selectInfoBox(box.id));
      label.addEventListener('input', () => {
        box.label = label.textContent.replace(/\r?\n/g, ' ');
        syncInfoBoxEditor();
        fitElement(label, 7);
        markChanged();
      });
    }

    const value = document.createElement('div');
    value.className = 'editable center multiline fit-text';
    value.contentEditable = 'true';
    value.spellcheck = false;
    value.textContent = box.value || '';
    value.dataset.placeholder = box.fixed ? '入力' : '内容を入力';
    value.addEventListener('focus', () => { if (!box.fixed) selectInfoBox(box.id); });
    value.addEventListener('input', () => {
      box.value = value.textContent.replace(/\r/g, '');
      if (box.fixed) bindControlValues(); else syncInfoBoxEditor();
      fitElement(value, 7);
      markChanged();
    });
    if (!box.fixed) wrapper.addEventListener('click', () => selectInfoBox(box.id));
    wrapper.append(label, value);
    container.appendChild(wrapper);
  });
  refreshInfoBoxEditor();
}

function selectInfoBox(id) {
  const customBoxes = getCustomInfoBoxes();
  if (!customBoxes.some(box => box.id === id)) return;
  selectedInfoBoxId = id;
  $$('.custom-info-box').forEach(element => element.classList.toggle('selected-info', element.dataset.infoId === id));
  refreshInfoBoxEditor();
}

function getSelectedInfoBox() {
  return getCustomInfoBoxes().find(box => box.id === selectedInfoBoxId) || null;
}

function refreshInfoBoxEditor() {
  const select = $('#infoBoxSelect');
  if (!select) return;
  const customBoxes = getCustomInfoBoxes();
  select.innerHTML = '';
  if (!customBoxes.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '追加テーブルはありません';
    select.appendChild(option);
    selectedInfoBoxId = null;
  } else {
    if (!customBoxes.some(box => box.id === selectedInfoBoxId)) selectedInfoBoxId = customBoxes[0].id;
    customBoxes.forEach((box, index) => {
      const option = document.createElement('option');
      option.value = box.id;
      option.textContent = `${index + 1}. ${box.label || '名称未設定'}`;
      option.selected = box.id === selectedInfoBoxId;
      select.appendChild(option);
    });
  }
  syncInfoBoxEditor();
  const hasSelection = Boolean(getSelectedInfoBox());
  $('#infoLabelInput').disabled = !hasSelection;
  $('#infoValueInput').disabled = !hasSelection;
  $('#infoLabelPreset').disabled = !hasSelection;
  $('#deleteInfoBoxBtn').disabled = !hasSelection;
  $('#moveInfoBoxUpBtn').disabled = !hasSelection || customBoxes.length < 2;
  $('#moveInfoBoxDownBtn').disabled = !hasSelection || customBoxes.length < 2;
  $('#addInfoBoxBtn').disabled = customBoxes.length >= LAYOUT_LIMITS.customTables[1];
}

function syncInfoBoxEditor() {
  const box = getSelectedInfoBox();
  setControlValue('#infoLabelInput', box?.label || '');
  setControlValue('#infoValueInput', box?.value || '');
}

function addInfoBox() {
  const customBoxes = getCustomInfoBoxes();
  if (customBoxes.length >= LAYOUT_LIMITS.customTables[1]) return showToast('追加テーブルは3個までです。');
  const box = { id: makeId(), label: 'その他のスキル', value: '', fixed: false };
  state.infoBoxes.push(box);
  selectedInfoBoxId = box.id;
  renderInfoBoxes();
  fitAllText();
  markChanged();
}

function deleteInfoBox() {
  const box = getSelectedInfoBox();
  if (!box) return showToast('削除する追加テーブルを選択してください。');
  const customBoxes = getCustomInfoBoxes();
  const customIndex = customBoxes.findIndex(item => item.id === box.id);
  const stateIndex = state.infoBoxes.findIndex(item => item.id === box.id);
  state.infoBoxes.splice(stateIndex, 1);
  const remaining = getCustomInfoBoxes();
  selectedInfoBoxId = remaining[Math.min(customIndex, remaining.length - 1)]?.id || null;
  renderInfoBoxes();
  markChanged();
}

function moveInfoBox(direction) {
  const box = getSelectedInfoBox();
  if (!box) return;
  const custom = getCustomInfoBoxes();
  const index = custom.findIndex(item => item.id === box.id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= custom.length) return;
  [custom[index], custom[target]] = [custom[target], custom[index]];
  state.infoBoxes = [...state.infoBoxes.filter(item => item.fixed), ...custom];
  renderInfoBoxes();
  markChanged();
}

function applyPrintSettings() {
  const margins = state.layout.printMargins;
  const top = clampNumber(margins.top, 0, 40, 10);
  const bottom = clampNumber(margins.bottom, 0, 40, 10);
  const left = clampNumber(margins.left, 0, 40, 10);
  const right = clampNumber(margins.right, 0, 40, 10);
  const contentWidth = Math.max(300, A3_MM.width - left - right);
  const contentHeight = Math.max(210, A3_MM.height - top - bottom);
  document.documentElement.style.setProperty('--page-margin-top', `${top}mm`);
  document.documentElement.style.setProperty('--page-margin-bottom', `${bottom}mm`);
  document.documentElement.style.setProperty('--page-margin-left', `${left}mm`);
  document.documentElement.style.setProperty('--page-margin-right', `${right}mm`);
  document.documentElement.style.setProperty('--page-header-offset', `${clampNumber(margins.header, 0, 30, 8)}mm`);
  document.documentElement.style.setProperty('--page-footer-offset', `${clampNumber(margins.footer, 0, 30, 8)}mm`);
  let pageStyle = $('#dynamicPrintPageStyle');
  if (!pageStyle) {
    pageStyle = document.createElement('style');
    pageStyle.id = 'dynamicPrintPageStyle';
    document.head.appendChild(pageStyle);
  }
  pageStyle.textContent = '@page { size: A3 landscape; margin: 0; }';
  const info = $('#printScaleInfo');
  if (info) info.textContent = `A3用紙内：上${top} / 下${bottom} / 左${left} / 右${right} mm・本文領域 ${contentWidth.toFixed(1)} × ${contentHeight.toFixed(1)} mm・中央折り安全余白あり`;
  requestAnimationFrame(() => { applyTableLayout(); applyPreviewScale(); });
}

function elementOverflows(element) {
  return element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1;
}

function getTypographyLimits(element, fallbackMin = 9, fallbackMax = 11) {
  if (element.matches('.name-value')) return { min: 14, max: 16.5 };
  if (element.matches('.name-kana-value')) return { min: 10.5, max: 12 };
  if (element.matches('.row-cell.year, .row-cell.month')) return { min: 9.4, max: 10.6 };
  if (element.matches('.row-cell.text')) return { min: 9.4, max: 10.8 };
  if (element.matches('.section-caption')) return { min: 8.5, max: 9.6 };
  if (element.matches('[data-field="addressKana"], [data-field="address"], [data-field="contactKana"], [data-field="contactAddress"]')) return { min: 9.2, max: 10.5 };
  if (element.matches('[data-field="phone"], [data-field="email"], [data-field="contactPhone"], #birthText')) return { min: 9.2, max: 10.5 };
  if (element.matches('.side-box > .editable')) return { min: 9.3, max: 10.6 };
  return { min: fallbackMin, max: fallbackMax };
}

function fitElement(element, minPx = null, maxPx = null) {
  if (!element || !element.isConnected) return;
  const limits = getTypographyLimits(element);
  const dataBase = parseFloat(element.dataset.baseFontSize || '');
  const computedBase = parseFloat(getComputedStyle(element).fontSize) || limits.max;
  const upper = Number.isFinite(maxPx) ? maxPx : (Number.isFinite(dataBase) ? dataBase : Math.min(computedBase, limits.max));
  const lower = Number.isFinite(minPx) ? minPx : limits.min;
  let size = Math.max(lower, upper);
  element.style.fontSize = `${size}px`;
  let guard = 0;
  while (elementOverflows(element) && size > lower && guard < 40) {
    size = Math.max(lower, size - 0.25);
    element.style.fontSize = `${size}px`;
    guard += 1;
  }
}

function fitUniformGroup(selector, minPx, maxPx, handled) {
  const elements = $$(selector).filter(el => el.isConnected && !el.matches('[data-field="motivation"], [data-field="requests"]'));
  if (!elements.length) return;
  let size = maxPx;
  for (const element of elements) element.style.fontSize = `${size}px`;
  let guard = 0;
  while (elements.some(elementOverflows) && size > minPx && guard < 40) {
    size = Math.max(minPx, size - 0.25);
    for (const element of elements) element.style.fontSize = `${size}px`;
    guard += 1;
  }
  elements.forEach(el => handled.add(el));
}

function fitAllText() {
  requestAnimationFrame(() => {
    const handled = new Set();
    fitUniformGroup('.history-line .row-cell.year, .license-line .row-cell.year', 9.4, 10.6, handled);
    fitUniformGroup('.history-line .row-cell.month, .license-line .row-cell.month', 9.4, 10.6, handled);
    fitUniformGroup('.history-line .row-cell.text, .license-line .row-cell.text', 9.4, 10.8, handled);
    fitUniformGroup('.section-caption.fit-text', 8.5, 9.6, handled);
    fitUniformGroup('[data-field="addressKana"], [data-field="address"], [data-field="contactKana"], [data-field="contactAddress"]', 9.2, 10.5, handled);
    fitUniformGroup('[data-field="phone"], [data-field="email"], [data-field="contactPhone"], #birthText', 9.2, 10.5, handled);
    $$('.fit-text').forEach(element => {
      if (!handled.has(element)) fitElement(element);
    });
  });
}

function renderAll() {
  bindControlValues();
  renderTextFields();
  renderRows();
  refreshInfoBoxEditor();
  refreshDocumentSelect();
  updateSaveStatus(true);
  applyPrintSettings();
  fitAllText();
  applyPreviewScale();
}


function applyPreviewScale() {
  const stage = $('#scaleStage');
  const page = $('#pageCanvas');
  const autoControl = $('#autoZoom');
  const auto = autoControl ? autoControl.checked : true;
  let scale = Number($('#previewZoom')?.value || 55) / 100;
  if (!stage || !page) return;
  if (auto) {
    const shell = $('.preview-shell');
    const toolbar = $('.preview-toolbar');
    const isMobileWidthPreview = window.matchMedia('(max-width: 980px)').matches && document.body.classList.contains('mobile-preview');
    const availableWidth = Math.max(240, shell.clientWidth - (isMobileWidthPreview ? 8 : 40));
    const availableHeight = Math.max(240, shell.clientHeight - (toolbar?.offsetHeight || 0) - 42);
    const pageWidth = page.offsetWidth || 1587;
    const pageHeight = page.offsetHeight || 1123;
    scale = isMobileWidthPreview
      ? Math.min(1, availableWidth / pageWidth)
      : Math.min(1, availableWidth / pageWidth, availableHeight / pageHeight);
    $('#previewZoomLabel').textContent = isMobileWidthPreview
      ? `${Math.round(scale * 100)}%（画面幅）`
      : `${Math.round(scale * 100)}%（A3全体）`;
  } else {
    $('#previewZoomLabel').textContent = `${Math.round(scale * 100)}%`;
  }
  page.style.transform = `scale(${scale})`;
  page.style.transformOrigin = 'top left';
  stage.style.transform = 'none';
  stage.style.width = `${page.offsetWidth * scale}px`;
  stage.style.height = `${page.offsetHeight * scale}px`;
}

function currentDocumentScrollY() {
  return Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
}

function rememberMobileScrollPosition() {
  if (!window.matchMedia('(max-width: 980px)').matches) return;
  const y = currentDocumentScrollY();
  if (document.body.classList.contains('mobile-preview')) mobilePreviewScrollY = y;
  else if (document.body.classList.contains('mobile-editor')) mobileEditorScrollY = y;
}

function revealMobileHeader(delay = 0) {
  clearTimeout(mobileHeaderRevealTimer);
  const reveal = () => {
    document.body.classList.remove('mobile-header-hidden');
    document.body.classList.add('mobile-header-settling');
    setTimeout(() => document.body.classList.remove('mobile-header-settling'), 150);
  };
  if (delay > 0) mobileHeaderRevealTimer = setTimeout(reveal, delay);
  else reveal();
}

function handleMobileWindowScroll() {
  if (!window.matchMedia('(max-width: 980px)').matches) return;
  if (mobileScrollRaf) return;
  mobileScrollRaf = requestAnimationFrame(() => {
    mobileScrollRaf = 0;
    const y = currentDocumentScrollY();
    const moved = Math.abs(y - lastTrackedScrollY);
    rememberMobileScrollPosition();
    if (moved > 1.5 && y > 12) {
      document.body.classList.add('mobile-header-hidden');
      clearTimeout(mobileHeaderRevealTimer);
      mobileHeaderRevealTimer = setTimeout(() => revealMobileHeader(), MOBILE_HEADER_REVEAL_DELAY_MS);
    } else if (y <= 12) {
      revealMobileHeader();
    }
    lastTrackedScrollY = y;
  });
}

function handleViewportResizeStable() {
  clearTimeout(mobileResizeTimer);
  mobileResizeTimer = setTimeout(() => {
    const isMobileNow = window.matchMedia('(max-width: 980px)').matches;
    const previousMobileState = mobileViewportState;
    mobileViewportState = isMobileNow;

    if (isMobileNow !== previousMobileState) {
      if (isMobileNow) {
        if (!document.body.classList.contains('mobile-preview') && !document.body.classList.contains('mobile-editor')) {
          document.body.classList.add('mobile-editor');
          $('#mobileEditViewBtn')?.classList.add('active');
          $('#mobilePreviewViewBtn')?.classList.remove('active');
        }
      } else {
        rememberMobileScrollPosition();
        document.body.classList.remove('mobile-editor', 'mobile-preview', 'mobile-header-hidden', 'mobile-header-settling');
      }
    }

    if (!isMobileNow || document.body.classList.contains('mobile-preview')) applyPreviewScale();
    fitAllText();
    updateInstallPromotion();
  }, 140);
}

function setMobileView(view) {
  const isMobile = window.matchMedia('(max-width: 980px)').matches;
  const wasPreview = document.body.classList.contains('mobile-preview');
  const wasEditor = document.body.classList.contains('mobile-editor');
  if (!isMobile) {
    document.body.classList.remove('mobile-editor', 'mobile-preview', 'mobile-header-hidden');
    return;
  }

  const currentY = currentDocumentScrollY();
  if (wasPreview) mobilePreviewScrollY = currentY;
  if (wasEditor) mobileEditorScrollY = currentY;

  const showPreview = view === 'preview';
  document.body.classList.remove('mobile-editor', 'mobile-preview');
  document.body.classList.add(showPreview ? 'mobile-preview' : 'mobile-editor');
  $('#mobileEditViewBtn')?.classList.toggle('active', !showPreview);
  $('#mobilePreviewViewBtn')?.classList.toggle('active', showPreview);
  revealMobileHeader();

  const targetY = showPreview ? mobilePreviewScrollY : mobileEditorScrollY;
  requestAnimationFrame(() => {
    if (showPreview) {
      applyPreviewScale();
      fitAllText();
    }
    requestAnimationFrame(() => {
      window.scrollTo({ top: Math.max(0, targetY), left: 0, behavior: 'auto' });
      lastTrackedScrollY = Math.max(0, targetY);
      if (!showPreview) {
        const previousControl = lastMobileEditorControlId ? document.getElementById(lastMobileEditorControlId) : null;
        if (previousControl && !previousControl.closest('details:not([open])')) {
          previousControl.classList.add('resume-edit-return');
          setTimeout(() => previousControl.classList.remove('resume-edit-return'), 900);
        }
      }
    });
  });
}


function createNewDocument() {
  if (!confirm('新しい履歴書を作成しますか？現在の内容は自動保存されています。')) return;
  persistDocuments(false);
  state = defaultDocument();
  documents[state.id] = deepClone(state);
  selectedRow = null;
  persistDocuments(false);
  resetUndo();
  renderAll();
  showToast('新しい履歴書を作成しました。');
}

function loadSelectedDocument() {
  const id = $('#documentSelect').value;
  if (!id || !documents[id]) return;
  persistDocuments(false);
  state = migrateDocument(documents[id]);
  selectedRow = null;
  storage.setItem(ACTIVE_KEY, state.id);
  resetUndo();
  renderAll();
  showToast('保存済みの履歴書を開きました。');
}

function duplicateDocument() {
  persistDocuments(false);
  const copy = migrateDocument(deepClone(state));
  copy.id = makeId();
  copy.title = `${state.title || '履歴書'} のコピー`;
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = copy.createdAt;
  state = copy;
  documents[copy.id] = deepClone(copy);
  persistDocuments(false);
  resetUndo();
  renderAll();
  showToast('履歴書を複製しました。');
}

function deleteCurrentDocument() {
  if (!confirm(`「${state.title || '無題'}」を端末から削除しますか？`)) return;
  delete documents[state.id];
  const next = Object.values(documents).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0];
  state = next ? migrateDocument(next) : defaultDocument();
  documents[state.id] = deepClone(state);
  persistDocuments(false);
  selectedRow = null;
  resetUndo();
  renderAll();
  showToast('削除しました。');
}

function clearAllDocuments() {
  if (!confirm('端末内に保存したすべての履歴書を削除します。この操作は元に戻せません。')) return;
  documents = {};
  state = defaultDocument();
  documents[state.id] = deepClone(state);
  persistDocuments(false);
  selectedRow = null;
  resetUndo();
  renderAll();
  showToast('すべての保存データを削除しました。');
}

function exportJSON() {
  persistDocuments(false);
  const payload = {
    app: '履歴書 A3 作成アプリ',
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    document: state
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${sanitizeFileName(state.title)}.json`);
  showToast('JSONバックアップを書き出しました。');
}

async function importJSON(file) {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const imported = migrateDocument(parsed.document || parsed);
    imported.id = makeId();
    imported.title = imported.title ? `${imported.title}（読込）` : '読み込んだ履歴書';
    imported.createdAt = new Date().toISOString();
    imported.updatedAt = imported.createdAt;
    state = imported;
    documents[state.id] = deepClone(state);
    persistDocuments(false);
    selectedRow = null;
    resetUndo();
    renderAll();
    showToast('JSONデータを読み込みました。');
  } catch (error) {
    console.error(error);
    showToast('JSONファイルを読み込めませんでした。', 4000);
  }
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function validateDocument() {
  const issues = [];
  if (!state.name.trim()) issues.push('氏名が未入力です。');
  if (!state.nameKana.trim()) issues.push('ふりがなが未入力です。');
  if (!state.birthDate) issues.push('生年月日が未入力です。');
  if (!state.address.trim()) issues.push('現住所が未入力です。');
  if (!state.phone.trim()) issues.push('電話番号が未入力です。');
  if (!state.photo) issues.push('証明写真が未設定です。');
  const historyBlank = state.history.filter(row => !row.text.trim() && !row.year && !row.month).length;
  if (historyBlank > 2) issues.push(`学歴・職歴に空行が${historyBlank}行あります。`);
  const title = issues.length ? '入力内容の確認' : '入力内容は良好です';
  const html = issues.length
    ? `<p>次の項目を確認してください。</p><ul>${issues.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    : '<p>主要項目が入力されています。PDF保存前に年月と表記を目視確認してください。</p>';
  showMessage(title, html);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function showMessage(title, html) {
  $('#messageTitle').textContent = title;
  $('#messageContent').innerHTML = html;
  $('#messageDialog').showModal();
}

function openPhotoFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  if (file.size > 15 * 1024 * 1024) return showToast('15MB以下の画像を選択してください。', 4000);
  const reader = new FileReader();
  reader.onload = () => openPhotoEditor(String(reader.result));
  reader.onerror = () => showToast('画像を読み込めませんでした。');
  reader.readAsDataURL(file);
}

function openPhotoEditor(source = state.photo) {
  if (!source) {
    $('#photoInput').click();
    return;
  }
  const image = new Image();
  image.onload = () => {
    photoEditor.image = image;
    photoEditor.source = source;
    photoEditor.zoom = 1;
    photoEditor.rotation = 0;
    photoEditor.x = 0;
    photoEditor.y = 0;
    calculatePhotoBaseScale();
    syncPhotoControls();
    drawPhotoEditor();
    $('#photoDialog').showModal();
  };
  image.onerror = () => showToast('画像を開けませんでした。');
  image.src = source;
}

function calculatePhotoBaseScale() {
  const canvas = $('#photoCanvas');
  const image = photoEditor.image;
  if (!image) return;
  photoEditor.baseScale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
}

function syncPhotoControls() {
  $('#photoZoom').value = String(Math.round(photoEditor.zoom * 100));
  $('#photoRotation').value = String(Math.round(photoEditor.rotation));
  $('#zoomValue').textContent = `${Math.round(photoEditor.zoom * 100)}%`;
  $('#rotationValue').textContent = `${Math.round(photoEditor.rotation)}°`;
}

function drawPhotoEditor() {
  const canvas = $('#photoCanvas');
  const ctx = canvas.getContext('2d');
  const image = photoEditor.image;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!image) return;
  const scale = photoEditor.baseScale * photoEditor.zoom;
  ctx.save();
  ctx.translate(canvas.width / 2 + photoEditor.x, canvas.height / 2 + photoEditor.y);
  ctx.rotate(photoEditor.rotation * Math.PI / 180);
  ctx.scale(scale, scale);
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  ctx.restore();
}

function applyPhoto() {
  const sourceCanvas = $('#photoCanvas');
  const output = document.createElement('canvas');
  output.width = 900;
  output.height = 1200;
  const ctx = output.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceCanvas, 0, 0, output.width, output.height);
  state.photo = output.toDataURL('image/jpeg', 0.9);
  $('#photoDialog').close();
  renderTextFields();
  bindControlValues();
  markChanged();
  showToast('証明写真を適用しました。');
}

function attachPhotoPointerEvents() {
  const stage = $('#cropStage');
  stage.addEventListener('pointerdown', event => {
    photoEditor.dragging = true;
    photoEditor.dragStartX = event.clientX;
    photoEditor.dragStartY = event.clientY;
    photoEditor.originX = photoEditor.x;
    photoEditor.originY = photoEditor.y;
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (!photoEditor.dragging) return;
    const rect = stage.getBoundingClientRect();
    const factorX = $('#photoCanvas').width / rect.width;
    const factorY = $('#photoCanvas').height / rect.height;
    photoEditor.x = photoEditor.originX + (event.clientX - photoEditor.dragStartX) * factorX;
    photoEditor.y = photoEditor.originY + (event.clientY - photoEditor.dragStartY) * factorY;
    drawPhotoEditor();
  });
  const stop = event => {
    photoEditor.dragging = false;
    try { stage.releasePointerCapture(event.pointerId); } catch {}
  };
  stage.addEventListener('pointerup', stop);
  stage.addEventListener('pointercancel', stop);
  stage.addEventListener('wheel', event => {
    event.preventDefault();
    photoEditor.zoom = Math.min(4, Math.max(1, photoEditor.zoom + (event.deltaY < 0 ? .08 : -.08)));
    syncPhotoControls();
    drawPhotoEditor();
  }, { passive: false });
}

async function prepareSheetForExport() {
  persistDocuments(false);
  applyPrintSettings();
  document.activeElement?.blur();
  selectedRow = null;
  $$('.selected').forEach(el => el.classList.remove('selected'));
  fitAllText();
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

async function ensureHtml2Canvas() {
  if (typeof window.html2canvas === 'function') return window.html2canvas;

  const sources = [
    'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js'
  ];

  for (const source of sources) {
    try {
      await withTimeout(new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-html2canvas-source="${source}"]`);
        if (existing) {
          if (typeof window.html2canvas === 'function') return resolve();
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
          return;
        }
        const script = document.createElement('script');
        script.src = source;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.dataset.html2canvasSource = source;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`html2canvas load failed: ${source}`));
        document.head.appendChild(script);
      }), 12000, 'PDF作成ライブラリの読み込みがタイムアウトしました。');
      if (typeof window.html2canvas === 'function') return window.html2canvas;
    } catch (error) {
      console.warn('html2canvas source failed', source, error);
    }
  }

  throw new Error('PDF作成ライブラリを読み込めませんでした。インターネット接続を確認し、もう一度お試しください。');
}

function isSafeCanvasImageSource(source) {
  if (!source) return true;
  if (/^(data:|blob:)/i.test(source)) return true;
  try {
    return new URL(source, location.href).origin === location.origin;
  } catch {
    return false;
  }
}

async function waitForExportImages(root, timeoutMs = 12000) {
  const images = [...root.querySelectorAll('img')].filter(image => !image.hidden && image.getAttribute('src'));
  if (!images.length) return;
  await withTimeout(Promise.all(images.map(image => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    return new Promise(resolve => {
      const finish = () => resolve();
      image.addEventListener('load', finish, { once: true });
      image.addEventListener('error', finish, { once: true });
    });
  })), timeoutMs, 'PDF用画像の読み込みがタイムアウトしました。');
}

async function captureSheetCanvas(dpi) {
  await prepareSheetForExport();
  const html2canvasRenderer = await ensureHtml2Canvas();
  const sheet = $('#pageCanvas');
  if (!sheet) throw new Error('A3用紙を見つけられませんでした。');

  if (document.fonts?.ready) {
    try { await withTimeout(document.fonts.ready, 5000, 'フォント待機を終了しました。'); } catch {}
  }
  await waitForExportImages(sheet);

  const sourceWidth = Math.round(A3_MM.width * 96 / 25.4);
  const sourceHeight = Math.round(A3_MM.height * 96 / 25.4);
  const scale = Math.max(2, dpi / 96);
  const original = {
    transform: sheet.style.transform,
    transformOrigin: sheet.style.transformOrigin,
    margin: sheet.style.margin,
    boxShadow: sheet.style.boxShadow
  };

  try {
    // 画面プレビュー用の縮小 transform を一時的に外し、A3実寸を直接描画する。
    sheet.style.transform = 'none';
    sheet.style.transformOrigin = 'top left';
    sheet.style.margin = '0';
    sheet.style.boxShadow = 'none';
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const canvas = await html2canvasRenderer(sheet, {
      backgroundColor: '#ffffff',
      scale,
      useCORS: true,
      allowTaint: false,
      foreignObjectRendering: false,
      logging: false,
      imageTimeout: 15000,
      removeContainer: true,
      width: sourceWidth,
      height: sourceHeight,
      windowWidth: Math.max(sourceWidth, document.documentElement.clientWidth),
      windowHeight: Math.max(sourceHeight, document.documentElement.clientHeight),
      scrollX: 0,
      scrollY: 0,
      onclone: clonedDocument => {
        const clonedSheet = clonedDocument.querySelector('#pageCanvas');
        if (!clonedSheet) return;
        clonedSheet.style.transform = 'none';
        clonedSheet.style.transformOrigin = 'top left';
        clonedSheet.style.margin = '0';
        clonedSheet.style.boxShadow = 'none';
        clonedSheet.querySelectorAll('[contenteditable]').forEach(element => element.removeAttribute('contenteditable'));
        clonedSheet.querySelectorAll('.selected').forEach(element => element.classList.remove('selected'));
        clonedSheet.querySelectorAll('[data-placeholder]').forEach(element => element.removeAttribute('data-placeholder'));

        // v2.5.5: the official 履歴書 footer is mandatory and must never be clipped in PDF export.
        const clonedLeftHalf = clonedSheet.querySelector('.left-half');
        if (clonedLeftHalf) {
          clonedLeftHalf.style.setProperty('grid-template-rows', '13mm 31mm 56mm minmax(0, 1fr) 12mm', 'important');
        }
        const clonedFooter = clonedSheet.querySelector('[data-export-essential="footer-instructions"]');
        if (clonedFooter) {
          clonedFooter.style.setProperty('display', 'block', 'important');
                    clonedFooter.style.setProperty('height', '12mm', 'important');
          clonedFooter.style.setProperty('min-height', '12mm', 'important');
          clonedFooter.style.setProperty('overflow', 'visible', 'important');
          clonedFooter.style.setProperty('visibility', 'visible', 'important');
          clonedFooter.style.setProperty('opacity', '1', 'important');
          clonedFooter.style.setProperty('font-size', '2mm', 'important');
          clonedFooter.style.setProperty('line-height', '1.30', 'important');
          clonedFooter.style.setProperty('white-space', 'normal', 'important');
          clonedFooter.style.setProperty('color', '#000', 'important');
          clonedFooter.style.setProperty('background', '#fff', 'important');
          clonedFooter.querySelectorAll('.instruction-line').forEach(line => {
            line.style.setProperty('display', 'block', 'important');
            line.style.setProperty('white-space', 'normal', 'important');
            line.style.setProperty('overflow', 'visible', 'important');
          });
        }

        clonedSheet.querySelectorAll('img').forEach(image => {
          const source = image.currentSrc || image.getAttribute('src') || '';
          if (!isSafeCanvasImageSource(source)) {
            image.removeAttribute('src');
            image.hidden = true;
          }
        });
      }
    });

    // ここで一度だけ読み出し可否を確認し、tainted canvas を後工程へ渡さない。
    enhanceCanvasForSharpPrint(canvas);
    await canvasToBlob(canvas, 'image/jpeg', 1.0);
    return canvas;
  } catch (error) {
    if (/taint|SecurityError|origin-clean/i.test(String(error?.message || error))) {
      throw new Error('証明写真または外部画像を安全に処理できませんでした。写真を選び直してから再試行してください。');
    }
    throw error;
  } finally {
    sheet.style.transform = original.transform;
    sheet.style.transformOrigin = original.transformOrigin;
    sheet.style.margin = original.margin;
    sheet.style.boxShadow = original.boxShadow;
  }
}

function enhanceCanvasForSharpPrint(canvas) {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return canvas;
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a === 0) continue;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (lum >= 250) {
      data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
      continue;
    }
    if (lum <= 215) {
      data[i] = 0; data[i + 1] = 0; data[i + 2] = 0;
      continue;
    }
    const boosted = Math.max(0, Math.min(255, 255 - (255 - lum) * 2.15));
    const v = Math.round(boosted);
    data[i] = v; data[i + 1] = v; data[i + 2] = v;
  }
  context.putImageData(imageData, 0, 0);
  return canvas;
}


function loadImage(url, timeoutMs = 20000) {
  return withTimeout(new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('PDF用画像を読み込めませんでした。'));
    image.src = url;
  }), timeoutMs, 'PDF用画像の作成に時間がかかりすぎています。');
}

function canvasToBlob(canvas, type, quality) {
  return withTimeout(
    new Promise((resolve, reject) => canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Canvas export failed')),
      type,
      quality
    )),
    30000,
    'PDF画像の変換に時間がかかりすぎています。'
  );
}

function concatBytes(chunks) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  chunks.forEach(chunk => { output.set(chunk, offset); offset += chunk.length; });
  return output;
}

function textBytes(text) {
  return new TextEncoder().encode(text);
}

async function jpegToA3Pdf(jpegBlob, imageWidth, imageHeight) {
  const jpeg = new Uint8Array(await jpegBlob.arrayBuffer());
  const chunks = [];
  const offsets = [0];
  let length = 0;
  const add = chunk => { chunks.push(chunk); length += chunk.length; };
  const addText = text => add(textBytes(text));
  addText('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  const object = (id, bodyChunks) => {
    offsets[id] = length;
    addText(`${id} 0 obj\n`);
    bodyChunks.forEach(add);
    addText('\nendobj\n');
  };
  object(1, [textBytes('<< /Type /Catalog /Pages 2 0 R >>')]);
  object(2, [textBytes('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')]);
  object(3, [textBytes('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 1190.551 841.890] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>')]);
  object(4, [
    textBytes(`<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`),
    jpeg,
    textBytes('\nendstream')
  ]);
  const content = textBytes('q\n1190.551 0 0 841.890 0 0 cm\n/Im0 Do\nQ');
  object(5, [textBytes(`<< /Length ${content.length} >>\nstream\n`), content, textBytes('\nendstream')]);
  const xrefOffset = length;
  addText('xref\n0 6\n0000000000 65535 f \n');
  for (let id = 1; id <= 5; id += 1) addText(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
  addText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return new Blob([concatBytes(chunks)], { type: 'application/pdf' });
}

async function createPdfAtDpi(dpi) {
  setBusy(true, `A3レイアウトを準備しています…（${dpi} dpi）`);
  const canvas = await withTimeout(
    captureSheetCanvas(dpi),
    25000,
    `A3画像の作成がタイムアウトしました（${dpi} dpi）。`
  );
  setBusy(true, `PDF画像へ変換しています…（${dpi} dpi）`);
  const jpeg = await canvasToBlob(canvas, 'image/jpeg', dpi >= 450 ? 1.0 : dpi >= 300 ? 0.99 : 0.97);
  setBusy(true, 'PDFファイルを仕上げています…');
  return withTimeout(
    jpegToA3Pdf(jpeg, canvas.width, canvas.height),
    12000,
    'PDFファイルの作成がタイムアウトしました。'
  );
}



async function createPdfBlob() {
  const requestedDpi = Number($('#pdfQuality').value) || 300;
  try {
    return await createPdfAtDpi(requestedDpi);
  } catch (firstError) {
    console.warn('PDF generation retry at 200 dpi', firstError);
    if (requestedDpi <= 200) throw firstError;
    showToast('最高画質で共有用PDFを作成できなかったため、200 dpiで自動再試行します。', 4500);
    return createPdfAtDpi(200);
  }
}

function printResumeNow() {
  try {
    persistDocuments(false);
    applyPrintSettings();
    document.activeElement?.blur();
    selectedRow = null;
    $$('.selected').forEach(element => element.classList.remove('selected'));
    fitAllText();
    applyTableLayout();
    showToast('A3横・倍率100%で印刷してください。v2.8.3では全内容を用紙内に固定し、中央折り余白を保ったまま欠けとぼけを防ぎます。', 7600);
    if (typeof window.print !== 'function') throw new Error('このブラウザは印刷機能に対応していません。');
    window.print();
  } catch (error) {
    console.error(error);
    showToast(`印刷画面を開けませんでした：${error?.message || '不明なエラー'}`, 7000);
  }
}

async function downloadPDF() {
  if (pdfOperationActive) return;
  pdfOperationActive = true;
  setBusy(true, 'PDF保存画面を準備しています…');
  try {
    await prepareSheetForExport();
    showToast('印刷画面の「送信先」で「PDFに保存」を選択してください。A3・横向き・倍率100%を推奨します。', 8000);
    // Chrome/Edgeの標準印刷を利用するため、巨大Canvas生成で固まらない。
    await new Promise(resolve => setTimeout(resolve, 80));
    window.print();
  } catch (error) {
    console.error(error);
    showToast(`PDF保存画面を開けませんでした：${error?.message || '不明なエラー'}`, 7000);
  } finally {
    pdfOperationActive = false;
    setBusy(false);
  }
}

function isMobileShareDevice() {
  if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
    return navigator.userAgentData.mobile;
  }
  const ua = String(navigator.userAgent || '');
  if (/Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua)) return true;
  return window.matchMedia?.('(pointer: coarse)').matches === true && Math.min(window.innerWidth, window.innerHeight) <= 1024;
}

function openLocalPdfPreview(pdfBlob) {
  const localUrl = URL.createObjectURL(pdfBlob);
  const opened = window.open(localUrl, '_blank', 'noopener');
  // Blob URLは現在のブラウザ内だけで有効。十分な閲覧時間を確保してから解放する。
  setTimeout(() => URL.revokeObjectURL(localUrl), 10 * 60 * 1000);
  return Boolean(opened);
}

async function sharePdfOnDesktop() {
  pdfOperationActive = true;
  setBusy(true, 'パソコン用PDFを作成しています…');
  try {
    const pdf = await createPdfBlob();
    const name = `${sanitizeFileName(state.title || state.name || 'rirekisho')}_A3.pdf`;
    const file = new File([pdf], name, { type: 'application/pdf' });

    // パソコンでは必ずDownloadsへ保存する。
    downloadBlob(pdf, name);

    // 対応ブラウザでは、保存したPDFそのものをOSの共有画面へ渡す。
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      try {
        await navigator.share({
          title: state.title || state.name || '履歴書PDF',
          text: '履歴書PDF',
          files: [file]
        });
        showToast('PDFをパソコンに保存し、ファイル共有画面を開きました。', 6500);
        return;
      } catch (error) {
        if (error?.name !== 'AbortError') console.warn('Desktop file sharing failed', error);
      }
    }

    const opened = openLocalPdfPreview(pdf);
    showToast(
      opened
        ? 'PDFをパソコンに保存し、同じパソコンで使える一時プレビューを開きました。他の人へ送る場合は保存済みPDFを添付してください。'
        : 'PDFをパソコンに保存しました。他の人へ送る場合はDownloads内のPDFを添付してください。',
      9000
    );
  } catch (error) {
    console.error(error);
    showToast(`パソコンへのPDF保存に失敗しました：${error?.message || '不明なエラー'}`, 8000);
  } finally {
    pdfOperationActive = false;
    setBusy(false);
  }
}

async function sharePdfOnMobile() {
  pdfOperationActive = true;
  setBusy(true, 'スマートフォン用PDFを作成しています…');
  try {
    const pdf = await createPdfBlob();
    const name = `${sanitizeFileName(state.title || state.name || 'rirekisho')}_A3.pdf`;
    const file = new File([pdf], name, { type: 'application/pdf' });

    // クラウドへは送信せず、端末のダウンロード保存を開始する。
    downloadBlob(pdf, name);

    // 対応端末では生成したPDFファイルそのものを共有シートへ渡す。
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      try {
        await navigator.share({
          title: state.title || state.name || '履歴書PDF',
          text: '履歴書PDF',
          files: [file]
        });
        showToast('PDFを端末へ保存し、ファイル共有画面を開きました。クラウドにはアップロードしていません。', 7500);
        return;
      } catch (error) {
        if (error?.name !== 'AbortError') console.warn('Mobile file sharing failed', error);
      }
    }

    showToast('PDFを端末へ保存しました。DownloadsまたはファイルアプリからPDFを選んで送信してください。', 9000);
  } catch (error) {
    console.error(error);
    showToast(`スマートフォンへのPDF保存に失敗しました：${error?.message || '不明なエラー'}`, 8000);
  } finally {
    pdfOperationActive = false;
    setBusy(false);
  }
}

async function sharePDF() {
  if (pdfOperationActive) return;
  if (isMobileShareDevice()) {
    await sharePdfOnMobile();
  } else {
    await sharePdfOnDesktop();
  }
}

function bindEvents() {
  editableFields.forEach(field => {
    const element = $(`[data-field="${field}"]`);
    if (!element) return;
    element.addEventListener('input', () => {
      state[field] = element.textContent.replace(/\r/g, '');
      if (field === 'motivation') setControlValue('#motivationInput', state[field]);
      if (field === 'requests') setControlValue('#requestsInput', state[field]);
      if (field === 'address') setControlValue('#addressKanjiInput', state[field]);
      if (field === 'addressKana') setControlValue('#addressKanaInput', state[field]);
      if (field === 'postalCode') schedulePostalLookup(state[field]);
      syncQuickEntryControls();
      fitElement(element);
      markChanged();
    });
    element.addEventListener('paste', event => {
      event.preventDefault();
      const pastedText = event.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, pastedText);
    });
  });

  const quickFieldMap = {
    quickNameKanaInput: 'nameKana',
    quickNameInput: 'name',
    quickPhoneInput: 'phone',
    quickEmailInput: 'email',
    quickContactKanaInput: 'contactKana',
    quickContactAddressInput: 'contactAddress',
    quickContactPhoneInput: 'contactPhone',
    quickMotivationInput: 'motivation',
    quickRequestsInput: 'requests'
  };
  Object.entries(quickFieldMap).forEach(([controlId, field]) => {
    const control = $(`#${controlId}`);
    if (!control) return;
    control.addEventListener('input', event => {
      state[field] = String(event.target.value || '').replace(/\r/g, '');
      if (field === 'motivation') setControlValue('#motivationInput', state[field]);
      if (field === 'requests') setControlValue('#requestsInput', state[field]);
      renderTextFields();
      fitAllText();
      markChanged();
    });
  });

  $('#documentTitle').addEventListener('input', event => {
    state.title = event.target.value;
    markChanged();
    refreshDocumentSelect();
  });
  $('#postalLookupInput').addEventListener('input', event => {
    const formatted = formatPostalCode(event.target.value);
    event.target.value = formatted;
    state.postalCode = formatted;
    const previewPostal = $('[data-field="postalCode"]');
    if (previewPostal) previewPostal.textContent = formatted;
    schedulePostalLookup(formatted);
    markChanged();
  });
  $('#postalLookupInput').addEventListener('blur', event => {
    event.target.value = formatPostalCode(event.target.value);
    state.postalCode = event.target.value;
    markChanged();
  });
  $('#postalLookupBtn').addEventListener('click', () => lookupPostalCode($('#postalLookupInput').value));
  $('#postalResultSelect').addEventListener('change', event => {
    const result = postalLookupResults[Number(event.target.value)];
    if (result) applyPostalResult(result);
  });
  $('#reapplyPostalResultBtn').addEventListener('click', () => {
    const index = Number($('#postalResultSelect').value || 0);
    const result = postalLookupResults[index] || postalLookupResults[0];
    if (result) applyPostalResult(result);
  });
  $('#addressKanjiInput').addEventListener('input', event => {
    state.address = event.target.value.replace(/\r/g, '');
    renderTextFields(); fitAllText(); markChanged();
  });
  $('#addressKanaInput').addEventListener('input', event => {
    state.addressKana = event.target.value.replace(/\r/g, '');
    renderTextFields(); fitAllText(); markChanged();
  });
  $('#clearAddressBtn').addEventListener('click', () => {
    state.postalCode = '';
    state.address = '';
    state.addressKana = '';
    state.postalAddressBase = '';
    state.postalKanaBase = '';
    postalLookupResults = [];
    renderPostalCandidates([]);
    bindControlValues(); renderTextFields(); fitAllText(); markChanged();
    setPostalLookupStatus('住所をクリアしました。');
  });
  $('#motivationInput').addEventListener('input', event => {
    state.motivation = event.target.value.replace(/\r/g, '');
    renderTextFields(); fitAllText(); markChanged();
  });
  $('#requestsInput').addEventListener('input', event => {
    state.requests = event.target.value.replace(/\r/g, '');
    renderTextFields(); fitAllText(); markChanged();
  });
  $('#motivationFontSize').addEventListener('input', event => {
    state.motivationFont = Number(event.target.value) || 100;
    $('#motivationFontValue').textContent = `${state.motivationFont}%`;
    renderTextFields(); fitAllText(); markChanged();
  });
  $('#requestsFontSize').addEventListener('input', event => {
    state.requestsFont = Number(event.target.value) || 100;
    $('#requestsFontValue').textContent = `${state.requestsFont}%`;
    renderTextFields(); fitAllText(); markChanged();
  });
  $('#applyCompanyRuleBtn').addEventListener('click', () => {
    state.requests = '貴社の規定に従います。';
    renderTextFields(); bindControlValues(); fitAllText(); markChanged();
  });
  $('#clearRequestsBtn').addEventListener('click', () => {
    state.requests = '';
    renderTextFields(); bindControlValues(); fitAllText(); markChanged();
  });
  $('#autoTextSectionRatio').addEventListener('change', event => {
    state.layout.autoTextSectionRatio = event.target.checked;
    if (state.layout.autoTextSectionRatio) syncTextSectionRatioAfterRowChange();
    renderRows(); bindControlValues(); fitAllText(); markChanged();
  });

  $('#textSectionRatio').addEventListener('input', event => {
    const metrics = calculateLayoutMetrics();
    const ratio = clampNumber(event.target.value, metrics.ratioMin, metrics.ratioMax, state.layout.textSectionRatio);
    state.layout.autoTextSectionRatio = false;
    state.layout.textSectionRatio = ratio;
    state.layout.requestSectionHeight = clampNumber(
      metrics.availableTextHeight * (100 - ratio) / 100,
      metrics.requestMinHeight,
      metrics.requestMaxHeight,
      metrics.requestHeight
    );
    renderRows(); bindControlValues(); fitAllText(); markChanged();
  });

  $('#requestSectionHeight').addEventListener('input', event => {
    const metrics = calculateLayoutMetrics();
    state.layout.autoTextSectionRatio = false;
    state.layout.requestSectionHeight = clampNumber(
      event.target.value,
      metrics.requestMinHeight,
      metrics.requestMaxHeight,
      metrics.requestHeight
    );
    state.layout.textSectionRatio = Math.round(
      ((metrics.availableTextHeight - state.layout.requestSectionHeight) / metrics.availableTextHeight) * 100
    );
    renderRows(); bindControlValues(); fitAllText(); markChanged();
  });

  $('#asOfDate').addEventListener('change', event => { state.asOfDate = event.target.value; renderTextFields(); renderRows(); markChanged(); });
  $('#birthDate').addEventListener('change', event => { state.birthDate = event.target.value; renderTextFields(); markChanged(); });
  $('#genderSelect').addEventListener('change', event => { state.gender = event.target.value; renderTextFields(); markChanged(); });
  $$('[data-year-mode]').forEach(btn => btn.addEventListener('click', () => {
    state.yearMode = btn.dataset.yearMode;
    bindControlValues(); renderTextFields(); renderRows(); markChanged();
  }));

  const applyTotalHistoryRows = event => {
    const safeLimits = getSafeRowControlLimits();
    const minTotal = safeLimits.total[0];
    const maxTotal = safeLimits.total[1];
    const requestedTotal = Math.max(state.history.length, clampInteger(event.target.value, minTotal, maxTotal, state.layout.historyLeftSlots + state.layout.historyRightSlots));
    const balanced = rebalanceHistorySlots(requestedTotal, {}, safeLimits);
    state.layout.historyLeftSlots = balanced.left;
    state.layout.historyRightSlots = balanced.right;
    syncTextSectionRatioAfterRowChange();
    renderRows(); bindControlValues(); fitAllText(); markChanged();
  };
  $('#historyTotalSlots').addEventListener('input', applyTotalHistoryRows);
  $('#historyTotalSlots').addEventListener('change', applyTotalHistoryRows);

  const applyLeftRows = event => {
    applyHistorySplitFromSide('left', event.target.value);
    renderRows(); bindControlValues(); fitAllText(); markChanged();
  };
  const applyRightRows = event => {
    applyHistorySplitFromSide('right', event.target.value);
    renderRows(); bindControlValues(); fitAllText(); markChanged();
  };
  $('#historyLeftSlots').addEventListener('input', applyLeftRows);
  $('#historyLeftSlots').addEventListener('change', applyLeftRows);
  $('#historyRightSlots').addEventListener('input', applyRightRows);
  $('#historyRightSlots').addEventListener('change', applyRightRows);

  const applyLicenseRows = event => {
    const safeLimits = getSafeRowControlLimits();
    state.layout.licenseSlots = clampInteger(
      event.target.value,
      safeLimits.license[0],
      safeLimits.license[1],
      state.layout.licenseSlots
    );
    syncTextSectionRatioAfterRowChange();
    renderRows(); bindControlValues(); fitAllText(); markChanged();
  };
  $('#licenseSlots').addEventListener('input', applyLicenseRows);
  $('#licenseSlots').addEventListener('change', applyLicenseRows);

  $('#historyRowSelect').addEventListener('change', event => { selectRow('history', event.target.value); syncRowEditorValues('history'); });
  $('#licenseRowSelect').addEventListener('change', event => { selectRow('license', event.target.value); syncRowEditorValues('license'); });
  $('#historyEditorYear').addEventListener('input', event => updateRowFromEditor('history', 'year', event.target.value));
  $('#historyEditorMonth').addEventListener('input', event => updateRowFromEditor('history', 'month', event.target.value));
  $('#historyEditorText').addEventListener('input', event => updateRowFromEditor('history', 'text', event.target.value));
  $('#historyEditorYear').addEventListener('blur', event => { event.target.value = parseYearInput(event.target.value); updateRowFromEditor('history', 'year', event.target.value); });
  $('#licenseEditorYear').addEventListener('input', event => updateRowFromEditor('license', 'year', event.target.value));
  $('#licenseEditorMonth').addEventListener('input', event => updateRowFromEditor('license', 'month', event.target.value));
  $('#licenseEditorText').addEventListener('input', event => updateRowFromEditor('license', 'text', event.target.value));
  $('#licenseEditorYear').addEventListener('blur', event => { event.target.value = parseYearInput(event.target.value); updateRowFromEditor('license', 'year', event.target.value); });
  $('#appendHistoryActionBtn').addEventListener('click', appendHistoryAction);

  $('#commuteValueInput').addEventListener('input', event => {
    state.infoBoxes[0].value = event.target.value;
    renderInfoBoxes(); fitAllText(); markChanged();
  });
  $('#dependentsValueInput').addEventListener('input', event => {
    state.infoBoxes[1].value = event.target.value;
    renderInfoBoxes(); fitAllText(); markChanged();
  });

  $('#infoBoxSelect').addEventListener('change', event => selectInfoBox(event.target.value));
  $('#infoLabelPreset').addEventListener('change', event => {
    if (!event.target.value) return;
    const box = getSelectedInfoBox();
    if (!box) return;
    box.label = event.target.value;
    renderInfoBoxes(); fitAllText(); markChanged();
  });
  $('#infoLabelInput').addEventListener('input', event => {
    const box = getSelectedInfoBox(); if (!box) return;
    box.label = event.target.value; renderInfoBoxes(); fitAllText(); markChanged();
  });
  $('#infoValueInput').addEventListener('input', event => {
    const box = getSelectedInfoBox(); if (!box) return;
    box.value = event.target.value.replace(/\r/g, ''); renderInfoBoxes(); fitAllText(); markChanged();
  });
  $('#addInfoBoxBtn').addEventListener('click', addInfoBox);
  $('#deleteInfoBoxBtn').addEventListener('click', deleteInfoBox);
  $('#moveInfoBoxUpBtn').addEventListener('click', () => moveInfoBox(-1));
  $('#moveInfoBoxDownBtn').addEventListener('click', () => moveInfoBox(1));

  ['printMarginTop', 'printMarginBottom', 'printMarginLeft', 'printMarginRight', 'printHeader', 'printFooter'].forEach(id => {
    $(`#${id}`).addEventListener('change', event => {
      const keyMap = {
        printMarginTop: 'top', printMarginBottom: 'bottom', printMarginLeft: 'left',
        printMarginRight: 'right', printHeader: 'header', printFooter: 'footer'
      };
      const key = keyMap[id];
      state.layout.printMargins[key] = clampNumber(event.target.value, 0, key === 'header' || key === 'footer' ? 30 : 40, state.layout.printMargins[key]);
      bindControlValues(); applyPrintSettings(); markChanged();
    });
  });

  $('#saveBtn').addEventListener('click', () => persistDocuments(true));
  $('#newBtn').addEventListener('click', createNewDocument);
  $('#loadBtn').addEventListener('click', loadSelectedDocument);
  $('#duplicateBtn').addEventListener('click', duplicateDocument);
  $('#deleteDocumentBtn').addEventListener('click', deleteCurrentDocument);
  $('#clearAllBtn').addEventListener('click', clearAllDocuments);
  $('#undoBtn').addEventListener('click', undo);
  $('#redoBtn').addEventListener('click', redo);

  $('#addEducationBtn').addEventListener('click', () => insertRow('history', { id: makeId(), year: '', month: '', text: '', kind: 'education' }));
  $('#addWorkBtn').addEventListener('click', () => insertRow('history', { id: makeId(), year: '', month: '', text: '', kind: 'work' }));
  $('#addHistorySectionBtn').addEventListener('click', () => insertRow('history', { id: makeId(), year: '', month: '', text: '見　出　し', kind: 'section' }));
  $('#addLicenseBtn').addEventListener('click', () => insertRow('license', { id: makeId(), year: '', month: '', text: '', kind: '' }));
  $('#moveUpBtn').addEventListener('click', () => moveSelected(-1));
  $('#moveDownBtn').addEventListener('click', () => moveSelected(1));
  $('#duplicateRowBtn').addEventListener('click', duplicateSelectedRow);
  $('#deleteRowBtn').addEventListener('click', deleteSelectedRow);

  $('#photoInput').addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (file) openPhotoFile(file);
    event.target.value = '';
  });
  $('#photoBox').addEventListener('click', () => state.photo ? openPhotoEditor(state.photo) : $('#photoInput').click());
  $('#editPhotoBtn').addEventListener('click', () => openPhotoEditor(state.photo));
  $('#selectedPhotoCard')?.addEventListener('click', () => { if (state.photo) openPhotoEditor(state.photo); });
  $('#removePhotoBtn').addEventListener('click', () => {
    if (!state.photo || !confirm('証明写真を削除しますか？')) return;
    state.photo = ''; renderTextFields(); bindControlValues(); markChanged();
  });
  $('#photoZoom').addEventListener('input', event => { photoEditor.zoom = Number(event.target.value) / 100; syncPhotoControls(); drawPhotoEditor(); });
  $('#photoRotation').addEventListener('input', event => { photoEditor.rotation = Number(event.target.value); syncPhotoControls(); drawPhotoEditor(); });
  $('#rotateLeftBtn').addEventListener('click', () => { photoEditor.rotation -= 90; if (photoEditor.rotation < -180) photoEditor.rotation += 360; syncPhotoControls(); drawPhotoEditor(); });
  $('#rotateRightBtn').addEventListener('click', () => { photoEditor.rotation += 90; if (photoEditor.rotation > 180) photoEditor.rotation -= 360; syncPhotoControls(); drawPhotoEditor(); });
  $('#centerPhotoBtn').addEventListener('click', () => { photoEditor.x = 0; photoEditor.y = 0; drawPhotoEditor(); });
  $('#fitPhotoBtn').addEventListener('click', () => { photoEditor.zoom = 1; photoEditor.rotation = 0; photoEditor.x = 0; photoEditor.y = 0; calculatePhotoBaseScale(); syncPhotoControls(); drawPhotoEditor(); });
  $('#applyPhotoBtn').addEventListener('click', applyPhoto);
  $('#cancelPhotoBtn').addEventListener('click', () => $('#photoDialog').close());
  $('#closePhotoDialog').addEventListener('click', () => $('#photoDialog').close());
  attachPhotoPointerEvents();

  $('#exportBtn').addEventListener('click', exportJSON);
  $('#importInput').addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (file) importJSON(file);
    event.target.value = '';
  });
  $('#validateBtn').addEventListener('click', validateDocument);
  $('#printBtn').addEventListener('click', printResumeNow);
  $('#pdfBtn').addEventListener('click', downloadPDF);
  $('#shareBtn').addEventListener('click', sharePDF);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && pdfOperationActive) {
      pdfOperationActive = false; setBusy(false);
      showToast('PDF処理画面を閉じました。必要に応じてもう一度お試しください。', 4000);
    }
  });
  document.addEventListener('focusin', event => {
    const target = event.target;
    if (window.matchMedia('(max-width: 980px)').matches && target instanceof HTMLElement && target.id && target.closest('.control-panel')) {
      lastMobileEditorControlId = target.id;
    }
  });
  $('#mobileEditViewBtn')?.addEventListener('click', () => setMobileView('editor'));
  $('#mobilePreviewViewBtn')?.addEventListener('click', () => setMobileView('preview'));
  $('#previewZoom').addEventListener('input', () => { if (!$('#autoZoom').checked) applyPreviewScale(); });
  $('#autoZoom').addEventListener('change', applyPreviewScale);
  window.addEventListener('beforeprint', applyPrintSettings);
  window.addEventListener('resize', handleViewportResizeStable, { passive: true });
  window.addEventListener('orientationchange', handleViewportResizeStable, { passive: true });
  window.addEventListener('scroll', handleMobileWindowScroll, { passive: true });
  window.addEventListener('beforeunload', () => persistDocuments(false));

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallPromotion();
  });
  window.addEventListener('appinstalled', () => {
    storage.setItem(INSTALL_DONE_KEY, '1');
    deferredInstallPrompt = null;
    updateInstallPromotion();
    showToast('アプリをホーム画面に追加しました。次回からこの案内は表示されません。', 4200);
  });
  $('#installBtn').addEventListener('click', handleInstallPrompt);
  $('#mobileInstallBtn')?.addEventListener('click', handleInstallPrompt);
}



function isStandaloneApp() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function updateInstallPromotion() {
  const installBtn = $('#installBtn');
  const mobileHelper = $('#mobileInstallHelper');
  const mobileBtn = $('#mobileInstallBtn');
  if (!installBtn) return;
  const installed = isStandaloneApp() || storage.getItem(INSTALL_DONE_KEY) === '1';
  const mobile = window.matchMedia('(max-width: 980px)').matches;
  installBtn.hidden = installed || mobile || !deferredInstallPrompt;
  if (mobileHelper) {
    mobileHelper.hidden = installed || !mobile;
  }
  if (mobileBtn) {
    mobileBtn.textContent = 'Cài đặt ứng dụng';
  }
}

async function handleInstallPrompt() {
  if (isStandaloneApp()) {
    storage.setItem(INSTALL_DONE_KEY, '1');
    updateInstallPromotion();
    return;
  }
  if (!deferredInstallPrompt) {
    showInstallGuide();
    return;
  }
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice.catch(() => null);
  if (choice && choice.outcome === 'accepted') {
    storage.setItem(INSTALL_DONE_KEY, '1');
  }
  deferredInstallPrompt = null;
  updateInstallPromotion();
}

function getInstallShareUrl() {
  if (/\.github\.io$/i.test(location.hostname)) {
    return `${location.origin}${location.pathname}`.replace(/\/index\.html$/i, '/');
  }
  return APP_PUBLIC_URL;
}

async function copyInstallLink() {
  const url = getInstallShareUrl();
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      if (!document.execCommand('copy')) throw new Error('copy failed');
      textarea.remove();
    }
    showToast('Đã sao chép liên kết. Hãy mở liên kết bằng Chrome trên Android hoặc Safari trên iPhone.', 5200);
    const button = $('#copyInstallLinkBtn');
    if (button) {
      const oldText = button.textContent;
      button.textContent = 'Đã sao chép';
      button.disabled = true;
      setTimeout(() => {
        if (button.isConnected) {
          button.textContent = oldText;
          button.disabled = false;
        }
      }, 1800);
    }
  } catch (error) {
    console.error(error);
    showToast(`Không thể tự động sao chép. Liên kết: ${url}`, 8000);
  }
}

function showInstallGuide() {
  const installUrl = escapeHtml(getInstallShareUrl());
  showMessage('Cài đặt ứng dụng vào màn hình chính', `
    <p><strong>Android / Chrome</strong>: mở liên kết bằng Chrome, sau đó bấm <em>Cài đặt ứng dụng</em>. Trường hợp chưa xuất hiện, mở menu <em>⋮</em> → <em>Install app / Add to Home screen</em>.</p>
    <p><strong>iPhone / iPad</strong>: mở liên kết bằng Safari, bấm nút <em>Chia sẻ</em> → <em>Add to Home Screen / Thêm vào Màn hình chính</em>.</p>
    <p><strong>Đang mở bằng trình duyệt khác?</strong> Sao chép liên kết dưới đây, sau đó dán vào Chrome trên Android hoặc Safari trên iPhone.</p>
    <div class="install-guide-link-row">
      <input aria-label="Liên kết ứng dụng" id="installGuideUrl" readonly value="${installUrl}">
      <button id="copyInstallLinkBtn" type="button">Sao chép liên kết</button>
    </div>
    <p>Sau khi đã cài xong, lần mở sau phần nhắc cài đặt sẽ tự động ẩn.</p>
  `);
  $('#copyInstallLinkBtn')?.addEventListener('click', copyInstallLink);
  $('#installGuideUrl')?.addEventListener('click', event => event.currentTarget.select());
}


function ensureOfficialFooter() {
  const leftHalf = document.querySelector('.left-half');
  if (!leftHalf) return;

  let footer = leftHalf.querySelector('[data-export-essential="footer-instructions"]');
  if (!footer) {
    footer = document.createElement('div');
    footer.className = 'instructions resume-footer-notes';
    footer.setAttribute('role', 'note');
    footer.setAttribute('aria-label', '記入上の注意');
    footer.setAttribute('data-export-essential', 'footer-instructions');
    leftHalf.appendChild(footer);
  }

  footer.hidden = false;
  footer.removeAttribute('hidden');
  footer.innerHTML = `
    <div class="resume-footer-content">
      <span class="instruction-line"><strong>記入上の注意</strong>　1．鉛筆以外の黒又は青の筆記具で記入。</span>
      <span class="instruction-line">2．数字はアラビア数字で、文字はくずさず正確に書く。</span>
      <span class="instruction-line">3．※印のところは、該当するものを○で囲む。</span>
    </div>`;
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
  if (isLocal) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
      console.info('Local development mode: Service Worker cache disabled.');
    } catch (error) {
      console.warn('Local cache reset failed', error);
    }
    return;
  }
  try { await navigator.serviceWorker.register('./service-worker.js?v=2.8.3'); } catch (error) { console.warn('Service worker registration failed', error); }
}

function init() {
  // 古いキャッシュや途中終了したPDF処理のオーバーレイを最優先で解除する。
  forceCloseBusyOverlay();
  pdfOperationActive = false;
  window.addEventListener('error', () => { pdfOperationActive = false; forceCloseBusyOverlay(); });
  window.addEventListener('unhandledrejection', () => { pdfOperationActive = false; forceCloseBusyOverlay(); });

  ensureOfficialFooter();
  loadStorage();
  bindEvents();
  resetUndo();
  renderAll();
  setMobileView('editor');
  lastTrackedScrollY = currentDocumentScrollY();
  revealMobileHeader();
  updateInstallPromotion();
  registerServiceWorker();
  requestAnimationFrame(() => forceCloseBusyOverlay());
  setTimeout(() => { if (!pdfOperationActive) forceCloseBusyOverlay(); }, 800);
  console.info(`履歴書 A3 作成アプリ v${APP_VERSION}`);
}

document.addEventListener('DOMContentLoaded', init);
