const api = {
  async list(status) {
    const res = await fetch(`/api/qrs${status && status !== 'all' ? `?status=${status}` : ''}`);
    return res.json();
  },
  async stats() {
    const res = await fetch('/api/stats');
    return res.json();
  },
  async create(payload) {
    const res = await fetch('/api/qrs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  async update(id, payload) {
    const res = await fetch(`/api/qrs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  async toggle(id, next) {
    const res = await fetch(`/api/qrs/${id}/${next === 'active' ? 'activate' : 'deactivate'}`, {
      method: 'POST',
    });
    return res.json();
  },
  async get(id) {
    const res = await fetch(`/api/qrs/${id}`);
    return res.json();
  },
};

const state = {
  filter: 'all',
  items: [],
  selected: null,
};

const drawer = document.getElementById('drawer');
const backdrop = document.getElementById('backdrop');
const previewCanvas = document.getElementById('previewCanvas');

function openDrawer() {
  drawer.classList.add('open');
  backdrop.classList.add('show');
}

function closeDrawer() {
  drawer.classList.remove('open');
  backdrop.classList.remove('show');
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString();
}

function badge(status) {
  const cls = status === 'active' ? 'success' : 'muted';
  return `<span class="badge ${cls}">${status}</span>`;
}

function renderStats(data) {
  const container = document.getElementById('stats');
  const cards = [
    { label: 'Total QR Codes', value: data.total || 0 },
    { label: 'Active', value: data.active || 0 },
    { label: 'Inactive', value: data.inactive || 0 },
  ]
    .map(
      (card) => `
      <div class="stat-card">
        <small>${card.label}</small>
        <strong>${card.value}</strong>
      </div>`
    )
    .join('');
  container.innerHTML = cards;
}

function renderTable(items) {
  const tbody = document.getElementById('qrTable');
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="5">No QR codes found.</td></tr>`;
    return;
  }

  tbody.innerHTML = items
    .map(
      (row) => `
      <tr data-id="${row.id}">
        <td>${row.name}</td>
        <td class="muted">${row.data}</td>
        <td>${badge(row.status)}</td>
        <td>${formatDate(row.created_at)}</td>
        <td class="table-actions">
          <button data-action="view" data-id="${row.id}">View</button>
          <button data-action="toggle" data-id="${row.id}">${row.status === 'active' ? 'Deactivate' : 'Activate'}</button>
          <button data-action="download" data-id="${row.id}">Download</button>
        </td>
      </tr>`
    )
    .join('');
}

function createQrCanvas(text, size = 256) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const canvas = document.createElement('canvas');
  const cellSize = size / count;
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000';
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(Math.round(col * cellSize), Math.round(row * cellSize), Math.ceil(cellSize), Math.ceil(cellSize));
      }
    }
  }
  return canvas;
}

function createSvg(text, size = 256) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const cell = size / count;
  const svgTag = qr.createSvgTag(cell, 0);
  return svgTag.replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`);
}

function renderPreview(targetEl, text) {
  targetEl.innerHTML = '';
  if (!text) {
    targetEl.innerHTML = '<p class="muted">Enter data to preview.</p>';
    return;
  }
  const canvas = createQrCanvas(text, 200);
  targetEl.appendChild(canvas);
}

function downloadQR(item, type, size) {
  const filename = `${item.name || 'qr'}-${type}${size ? '-' + size : ''}.${type === 'svg' ? 'svg' : 'png'}`;
  if (type === 'svg') {
    const svg = createSvg(item.data, size || 256);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const canvas = createQrCanvas(item.data, size);
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = filename;
  a.click();
}

function renderDetail(item) {
  const container = document.getElementById('detail');
  if (!item) {
    container.innerHTML = `<div class="detail-empty">Select a QR to view details.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="detail-header">
      <div>
        <h3>${item.name}</h3>
        <p class="muted">${item.data}</p>
      </div>
      ${badge(item.status)}
    </div>
    <div class="preview-box" id="detailPreview"></div>
    <div class="detail-grid">
      <div>
        <small class="muted">Created</small>
        <div>${formatDate(item.created_at)}</div>
      </div>
      <div>
        <small class="muted">Updated</small>
        <div>${formatDate(item.updated_at)}</div>
      </div>
    </div>
    <div class="form" id="editForm">
      <label>
        Name
        <input name="name" value="${item.name}" />
      </label>
      <label>
        Data / URL
        <input name="data" value="${item.data}" />
      </label>
      <label>
        Status
        <select name="status">
          <option value="active" ${item.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${item.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </label>
      <div class="inline-actions">
        <button type="button" class="primary" data-action="save" data-id="${item.id}">Save Changes</button>
        <button type="button" data-action="toggle" data-id="${item.id}">${item.status === 'active' ? 'Deactivate' : 'Activate'}</button>
        <button type="button" data-action="download" data-id="${item.id}">Download</button>
      </div>
      <div class="inline-actions">
        <button type="button" class="ghost" data-download="256">PNG 256</button>
        <button type="button" class="ghost" data-download="512">PNG 512</button>
        <button type="button" class="ghost" data-download="1024">PNG 1024</button>
        <button type="button" class="ghost" data-download="svg">SVG</button>
      </div>
      <p class="muted">Redirect preview: <code>https://myapp.com/r/${item.id}</code></p>
    </div>
  `;

  const preview = document.getElementById('detailPreview');
  const canvas = createQrCanvas(`https://myapp.com/r/${item.id}`, 220);
  preview.innerHTML = '';
  preview.appendChild(canvas);

  container.querySelectorAll('[data-download]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.download === 'svg' ? 'svg' : 'png';
      const size = btn.dataset.download === 'svg' ? 512 : parseInt(btn.dataset.download, 10);
      downloadQR(item, type, size);
    });
  });

  container.querySelector('[data-action="download"]').addEventListener('click', () => {
    downloadQR(item, 'png', 512);
  });

  container.querySelector('[data-action="toggle"]').addEventListener('click', async () => {
    const next = item.status === 'active' ? 'inactive' : 'active';
    const updated = await api.toggle(item.id, next);
    await refresh();
    state.selected = updated;
    renderDetail(updated);
  });

  container.querySelector('[data-action="save"]').addEventListener('click', async () => {
    const formEl = document.getElementById('editForm');
    const payload = {
      name: formEl.querySelector('input[name="name"]').value,
      data: formEl.querySelector('input[name="data"]').value,
      status: formEl.querySelector('select[name="status"]').value,
    };
    const updated = await api.update(item.id, payload);
    await refresh();
    state.selected = updated;
    renderDetail(updated);
  });
}

async function refresh() {
  const [items, stats] = await Promise.all([api.list(state.filter), api.stats()]);
  state.items = items;
  renderTable(items);
  renderStats(stats);
}

function filterAndSearch() {
  const term = document.getElementById('search').value.toLowerCase();
  const filtered = state.items.filter((item) =>
    item.name.toLowerCase().includes(term) || item.data.toLowerCase().includes(term)
  );
  renderTable(filtered);
}

function bindTableEvents() {
  document.getElementById('qrTable').addEventListener('click', async (e) => {
    const action = e.target.dataset.action;
    const id = e.target.dataset.id;
    if (!action) return;
    const item = state.items.find((q) => q.id === id);
    if (!item) return;
    if (action === 'view') {
      state.selected = item;
      renderDetail(item);
    } else if (action === 'toggle') {
      const next = item.status === 'active' ? 'inactive' : 'active';
      const updated = await api.toggle(id, next);
      await refresh();
      state.selected = updated;
      renderDetail(updated);
    } else if (action === 'download') {
      downloadQR(item, 'png', 512);
    }
  });
}

function bindFilters() {
  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', async () => {
      document.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      state.filter = chip.dataset.filter;
      await refresh();
      renderDetail(null);
    });
  });
}

function bindDrawer() {
  document.getElementById('newQrBtn').addEventListener('click', openDrawer);
  document.getElementById('closeDrawer').addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
}

function bindCreateForm() {
  const form = document.getElementById('createForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const created = await api.create(payload);
    form.reset();
    renderPreview(previewCanvas, '');
    closeDrawer();
    await refresh();
    state.selected = created;
    renderDetail(created);
  });

  document.getElementById('clearForm').addEventListener('click', () => {
    form.reset();
    renderPreview(previewCanvas, '');
  });

  ['name', 'data'].forEach((field) => {
    form.querySelector(`input[name="${field}"]`).addEventListener('input', () => {
      const text = form.querySelector('input[name="data"]').value;
      renderPreview(previewCanvas, text);
    });
  });
}

async function bootstrap() {
  bindFilters();
  bindTableEvents();
  bindDrawer();
  bindCreateForm();
  document.getElementById('search').addEventListener('input', filterAndSearch);
  await refresh();
  renderDetail(null);
}

bootstrap();
