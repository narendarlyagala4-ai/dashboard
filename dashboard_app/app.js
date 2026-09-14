/**
 * E-Commerce Business Intelligence & Customer Analytics Dashboard Engine
 * Implements real-time in-browser multi-dimensional filtering, DAX-equivalent calculations,
 * Chart.js rendering, drill-down, drill-through, and RFM segment evaluation.
 */

// Global State
let rawData = { metadata: {}, orders: [], customers: [], products: [] };
let filteredOrders = [];
let chartInstances = {};

// Slicer Filters State
const currentFilters = {
  year: 'ALL',
  region: 'ALL',
  category: 'ALL',
  segment: 'ALL'
};

// Drilldown State for Page 2
const salesDrilldownState = {
  level: 'category', // 'category' | 'sub_category' | 'product'
  category: null,
  sub_category: null
};

// Toggle for Page 2 Top/Bottom 10
let showTop10Sales = true;

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupThemeToggle();
  setupFilterListeners();
  setupModal();
  await loadData();
});

// Load Dataset
async function loadData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Failed to load data.json');
    rawData = await response.json();
    applyFilters();
  } catch (err) {
    console.error('Error initializing dashboard:', err);
    alert('Failed to load data.json. Ensure the dashboard is served via local web server.');
  }
}

// Setup Page Navigation
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      navItems.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetPageId = btn.getAttribute('data-page');
      document.querySelectorAll('.dashboard-page').forEach(page => {
        page.classList.remove('active');
      });
      const targetPage = document.getElementById(targetPageId);
      if (targetPage) targetPage.classList.add('active');

      updateDynamicTitle(targetPageId);
      renderActivePage(targetPageId);
    });
  });
}

// Setup Theme Toggle
function setupThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const body = document.body;

  toggleBtn.addEventListener('click', () => {
    if (body.classList.contains('theme-light')) {
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
      toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
      toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
    // Re-render charts for dark/light grid lines
    reRenderAllCharts();
  });
}

// Setup Filter Listeners
function setupFilterListeners() {
  document.getElementById('filter-year').addEventListener('change', e => {
    currentFilters.year = e.target.value;
    applyFilters();
  });

  document.getElementById('filter-region').addEventListener('change', e => {
    currentFilters.region = e.target.value;
    applyFilters();
  });

  document.getElementById('filter-category').addEventListener('change', e => {
    currentFilters.category = e.target.value;
    // Reset drilldown if category changed from global filter
    salesDrilldownState.level = 'category';
    salesDrilldownState.category = null;
    salesDrilldownState.sub_category = null;
    applyFilters();
  });

  document.getElementById('filter-segment').addEventListener('change', e => {
    currentFilters.segment = e.target.value;
    applyFilters();
  });

  document.getElementById('btn-reset-filters').addEventListener('click', () => {
    currentFilters.year = 'ALL';
    currentFilters.region = 'ALL';
    currentFilters.category = 'ALL';
    currentFilters.segment = 'ALL';

    document.getElementById('filter-year').value = 'ALL';
    document.getElementById('filter-region').value = 'ALL';
    document.getElementById('filter-category').value = 'ALL';
    document.getElementById('filter-segment').value = 'ALL';

    salesDrilldownState.level = 'category';
    salesDrilldownState.category = null;
    salesDrilldownState.sub_category = null;

    applyFilters();
  });

  // Top / Bottom 10 Toggle
  document.getElementById('btn-show-top10').addEventListener('click', () => {
    showTop10Sales = true;
    document.getElementById('btn-show-top10').classList.add('active');
    document.getElementById('btn-show-bottom10').classList.remove('active');
    document.getElementById('top-bottom-table-title').innerText = 'Top 10 Products by Sales';
    renderTopBottomProductsTable();
  });

  document.getElementById('btn-show-bottom10').addEventListener('click', () => {
    showTop10Sales = false;
    document.getElementById('btn-show-bottom10').classList.add('active');
    document.getElementById('btn-show-top10').classList.remove('active');
    document.getElementById('top-bottom-table-title').innerText = 'Bottom 10 Products by Sales';
    renderTopBottomProductsTable();
  });

  // Product Matrix Search
  const searchInput = document.getElementById('product-matrix-search');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      renderProductMatrixTable(e.target.value.toLowerCase());
    });
  }

  // Export Summary CSV Button
  document.getElementById('btn-export-summary').addEventListener('click', exportSummaryCSV);
}

// Apply Filters to Dataset
function applyFilters() {
  filteredOrders = rawData.orders.filter(ord => {
    if (currentFilters.year !== 'ALL' && ord.year.toString() !== currentFilters.year) return false;
    if (currentFilters.region !== 'ALL' && ord.region !== currentFilters.region) return false;
    if (currentFilters.category !== 'ALL' && ord.category !== currentFilters.category) return false;
    if (currentFilters.segment !== 'ALL' && ord.segment !== currentFilters.segment) return false;
    return true;
  });

  renderActiveFilterTags();
  updateExecutiveKPIs();
  
  // Get active page
  const activeNav = document.querySelector('.nav-item.active');
  const activePageId = activeNav ? activeNav.getAttribute('data-page') : 'page-executive';
  updateDynamicTitle(activePageId);
  renderActivePage(activePageId);
}

// Render Filter Badges
function renderActiveFilterTags() {
  const container = document.getElementById('active-filter-tags');
  container.innerHTML = '';

  const activeFilters = [];
  if (currentFilters.year !== 'ALL') activeFilters.push(`Year: ${currentFilters.year}`);
  if (currentFilters.region !== 'ALL') activeFilters.push(`Region: ${currentFilters.region}`);
  if (currentFilters.category !== 'ALL') activeFilters.push(`Category: ${currentFilters.category}`);
  if (currentFilters.segment !== 'ALL') activeFilters.push(`Segment: ${currentFilters.segment}`);

  if (activeFilters.length === 0) {
    container.innerHTML = '<span class="filter-tag"><i class="fa-solid fa-filter"></i> Viewing All Data (Unfiltered)</span>';
  } else {
    activeFilters.forEach(f => {
      const tag = document.createElement('span');
      tag.className = 'filter-tag';
      tag.innerHTML = `<i class="fa-solid fa-check"></i> ${f}`;
      container.appendChild(tag);
    });
  }
}

// Dynamic Title Generation
function updateDynamicTitle(pageId) {
  const titleEl = document.getElementById('dynamic-dashboard-title');
  const subtitleEl = document.getElementById('dynamic-subtitle');

  const yr = currentFilters.year === 'ALL' ? 'All Time' : currentFilters.year;
  const reg = currentFilters.region === 'ALL' ? 'All Regions' : currentFilters.region;
  const cat = currentFilters.category === 'ALL' ? 'All Categories' : currentFilters.category;

  const pageNames = {
    'page-executive': 'Executive Performance Overview',
    'page-sales': 'Sales Performance & Growth Analysis',
    'page-profit': 'Profitability & Margin Elasticity Analysis',
    'page-customer': 'Customer Intelligence & RFM Segmentation',
    'page-product': 'Product Performance & Return Matrix',
    'page-regional': 'Regional & Geospatial Analytics',
    'page-insights': 'Executive Memo & Strategic Recommendations'
  };

  titleEl.innerText = `${pageNames[pageId] || 'Business Intelligence Dashboard'} | ${yr}`;
  subtitleEl.innerText = `Context: Filtered by [${reg}] Territory, [${cat}] Catalog | ${filteredOrders.length.toLocaleString()} matching transactions`;
}

// Calculate and Update Executive KPIs
function updateExecutiveKPIs() {
  const totalSales = filteredOrders.reduce((sum, r) => sum + r.sales, 0);
  const totalProfit = filteredOrders.reduce((sum, r) => sum + r.profit, 0);
  const totalOrders = filteredOrders.length;
  const uniqueCustomers = new Set(filteredOrders.map(r => r.customer_id)).size;
  const totalUnits = filteredOrders.reduce((sum, r) => sum + r.quantity, 0);
  const totalReturns = filteredOrders.reduce((sum, r) => sum + r.is_returned, 0);

  const marginPct = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
  const aov = totalOrders > 0 ? totalSales / totalOrders : 0;
  const returnRatePct = totalOrders > 0 ? (totalReturns / totalOrders) * 100 : 0;

  // Format and assign to DOM
  document.getElementById('kpi-total-sales').innerText = `$${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('kpi-total-profit').innerText = `$${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('kpi-profit-margin').innerText = `${marginPct.toFixed(1)}% Margin`;
  document.getElementById('kpi-total-orders').innerText = totalOrders.toLocaleString();
  document.getElementById('kpi-aov').innerText = `AOV: $${aov.toFixed(2)}`;
  document.getElementById('kpi-total-customers').innerText = uniqueCustomers.toLocaleString();
  document.getElementById('kpi-total-units').innerText = totalUnits.toLocaleString();
  document.getElementById('kpi-return-rate').innerText = `${returnRatePct.toFixed(1)}% Return Rate`;

  // Profit Page KPIs
  const profitMarginEl = document.getElementById('profit-kpi-margin');
  if (profitMarginEl) profitMarginEl.innerText = `${marginPct.toFixed(1)}%`;

  const discountedCount = filteredOrders.filter(r => r.discount > 0).length;
  const discRatio = totalOrders > 0 ? (discountedCount / totalOrders) * 100 : 0;
  const discRatioEl = document.getElementById('profit-kpi-discount-ratio');
  if (discRatioEl) discRatioEl.innerText = `${discRatio.toFixed(1)}%`;

  const lossCount = filteredOrders.filter(r => r.profit < 0).length;
  const lossOrdersEl = document.getElementById('profit-kpi-loss-orders');
  if (lossOrdersEl) lossOrdersEl.innerText = `${lossCount} Orders`;
}

// Render Active Page
function renderActivePage(pageId) {
  switch (pageId) {
    case 'page-executive':
      renderPage1Executive();
      break;
    case 'page-sales':
      renderPage2Sales();
      break;
    case 'page-profit':
      renderPage3Profit();
      break;
    case 'page-customer':
      renderPage4Customer();
      break;
    case 'page-product':
      renderPage5Product();
      break;
    case 'page-regional':
      renderPage6Regional();
      break;
    case 'page-insights':
      // Static + dynamic summaries
      break;
  }
}

// Helper: Get Chart Text and Grid Colors
function getChartColors() {
  const isDark = document.body.classList.contains('theme-dark');
  return {
    textColor: isDark ? '#cbd5e1' : '#475569',
    gridColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  };
}

// Helper: Safely destroy and recreate Chart.js instance
function createChart(canvasId, config) {
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  chartInstances[canvasId] = new Chart(ctx, config);
  return chartInstances[canvasId];
}

function reRenderAllCharts() {
  const activeNav = document.querySelector('.nav-item.active');
  const activePageId = activeNav ? activeNav.getAttribute('data-page') : 'page-executive';
  renderActivePage(activePageId);
}

// =============================================================================
// PAGE 1: EXECUTIVE OVERVIEW
// =============================================================================
function renderPage1Executive() {
  const { textColor, gridColor } = getChartColors();

  // 1. Monthly Revenue & Profit Combo Chart
  const monthlyAgg = {};
  filteredOrders.forEach(r => {
    const key = `${r.year}-${String(r.month).padStart(2, '0')} (${r.month_name} ${r.year})`;
    if (!monthlyAgg[key]) {
      monthlyAgg[key] = { label: `${r.month_name} ${r.year}`, orderKey: `${r.year}-${String(r.month).padStart(2, '0')}`, sales: 0, profit: 0 };
    }
    monthlyAgg[key].sales += r.sales;
    monthlyAgg[key].profit += r.profit;
  });

  const sortedMonths = Object.values(monthlyAgg).sort((a, b) => a.orderKey.localeCompare(b.orderKey));
  const monthLabels = sortedMonths.map(m => m.label);
  const salesData = sortedMonths.map(m => Math.round(m.sales));
  const profitData = sortedMonths.map(m => Math.round(m.profit));

  createChart('chart-exec-monthly-trend', {
    type: 'line',
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: 'Sales ($)',
          data: salesData,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 3
        },
        {
          label: 'Profit ($)',
          data: profitData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: $${ctx.raw.toLocaleString()}`
          }
        }
      },
      scales: {
        x: { ticks: { color: textColor, maxTicksLimit: 12 }, grid: { color: gridColor } },
        y: { ticks: { color: textColor, callback: v => `$${(v/1000).toFixed(0)}k` }, grid: { color: gridColor } }
      }
    }
  });

  // 2. Sales by Category Donut
  const catAgg = {};
  filteredOrders.forEach(r => {
    catAgg[r.category] = (catAgg[r.category] || 0) + r.sales;
  });

  createChart('chart-exec-category-donut', {
    type: 'doughnut',
    data: {
      labels: Object.keys(catAgg),
      datasets: [{
        data: Object.values(catAgg).map(v => Math.round(v)),
        backgroundColor: ['#2563eb', '#f59e0b', '#10b981'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor, boxWidth: 12, padding: 12 } }
      },
      cutout: '68%'
    }
  });

  // 3. Profit by Region Bar
  const regionAgg = {};
  filteredOrders.forEach(r => {
    regionAgg[r.region] = (regionAgg[r.region] || 0) + r.profit;
  });

  createChart('chart-exec-region-bar', {
    type: 'bar',
    data: {
      labels: Object.keys(regionAgg),
      datasets: [{
        label: 'Profit ($)',
        data: Object.values(regionAgg).map(v => Math.round(v)),
        backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor, callback: v => `$${(v/1000).toFixed(0)}k` }, grid: { color: gridColor } }
      }
    }
  });

  // 4. Segment Donut
  const segAgg = {};
  filteredOrders.forEach(r => {
    segAgg[r.segment] = (segAgg[r.segment] || 0) + r.sales;
  });

  createChart('chart-exec-segment-donut', {
    type: 'doughnut',
    data: {
      labels: Object.keys(segAgg),
      datasets: [{
        data: Object.values(segAgg).map(v => Math.round(v)),
        backgroundColor: ['#8b5cf6', '#0d9488', '#f97316'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor, boxWidth: 12, padding: 12 } }
      },
      cutout: '68%'
    }
  });

  // 5. Top 5 Products Horizontal Bar
  const prodSalesAgg = {};
  filteredOrders.forEach(r => {
    prodSalesAgg[r.product_name] = (prodSalesAgg[r.product_name] || 0) + r.sales;
  });

  const top5Prods = Object.entries(prodSalesAgg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  createChart('chart-exec-top-products', {
    type: 'bar',
    data: {
      labels: top5Prods.map(p => p[0].length > 25 ? p[0].substring(0, 25) + '...' : p[0]),
      datasets: [{
        label: 'Sales ($)',
        data: top5Prods.map(p => Math.round(p[1])),
        backgroundColor: '#2563eb',
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColor, callback: v => `$${(v/1000).toFixed(0)}k` }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { display: false } }
      }
    }
  });
}

// =============================================================================
// PAGE 2: SALES PERFORMANCE & DRILLDOWN
// =============================================================================
function renderPage2Sales() {
  const { textColor, gridColor } = getChartColors();
  renderSalesDrilldownChart();
  renderQuarterlySalesChart();
  renderTopBottomProductsTable();
}

function renderSalesDrilldownChart() {
  const { textColor, gridColor } = getChartColors();
  const breadcrumbContainer = document.getElementById('sales-drilldown-crumbs');
  const subtitleEl = document.getElementById('drilldown-subtitle');

  let labels = [];
  let salesData = [];
  let profitData = [];

  // Update Breadcrumb Buttons
  breadcrumbContainer.innerHTML = '';
  const rootBtn = document.createElement('button');
  rootBtn.className = `crumb ${salesDrilldownState.level === 'category' ? 'active' : ''}`;
  rootBtn.innerHTML = '<i class="fa-solid fa-house"></i> All Categories';
  rootBtn.onclick = () => {
    salesDrilldownState.level = 'category';
    salesDrilldownState.category = null;
    salesDrilldownState.sub_category = null;
    renderSalesDrilldownChart();
  };
  breadcrumbContainer.appendChild(rootBtn);

  if (salesDrilldownState.level === 'sub_category' || salesDrilldownState.level === 'product') {
    const catBtn = document.createElement('button');
    catBtn.className = `crumb ${salesDrilldownState.level === 'sub_category' ? 'active' : ''}`;
    catBtn.innerText = `Category: ${salesDrilldownState.category}`;
    catBtn.onclick = () => {
      salesDrilldownState.level = 'sub_category';
      salesDrilldownState.sub_category = null;
      renderSalesDrilldownChart();
    };
    breadcrumbContainer.appendChild(catBtn);
  }

  if (salesDrilldownState.level === 'product') {
    const subcatBtn = document.createElement('button');
    subcatBtn.className = 'crumb active';
    subcatBtn.innerText = `Sub-Category: ${salesDrilldownState.sub_category}`;
    breadcrumbContainer.appendChild(subcatBtn);
  }

  // Aggregate based on level
  if (salesDrilldownState.level === 'category') {
    subtitleEl.innerText = 'Click any Category bar to drill down into Sub-Categories';
    const agg = {};
    filteredOrders.forEach(r => {
      if (!agg[r.category]) agg[r.category] = { sales: 0, profit: 0 };
      agg[r.category].sales += r.sales;
      agg[r.category].profit += r.profit;
    });
    labels = Object.keys(agg);
    salesData = labels.map(l => Math.round(agg[l].sales));
    profitData = labels.map(l => Math.round(agg[l].profit));
  } else if (salesDrilldownState.level === 'sub_category') {
    subtitleEl.innerText = `Category [${salesDrilldownState.category}] - Click a Sub-Category to drill down to Products`;
    const agg = {};
    filteredOrders.filter(r => r.category === salesDrilldownState.category).forEach(r => {
      if (!agg[r.sub_category]) agg[r.sub_category] = { sales: 0, profit: 0 };
      agg[r.sub_category].sales += r.sales;
      agg[r.sub_category].profit += r.profit;
    });
    labels = Object.keys(agg);
    salesData = labels.map(l => Math.round(agg[l].sales));
    profitData = labels.map(l => Math.round(agg[l].profit));
  } else if (salesDrilldownState.level === 'product') {
    subtitleEl.innerText = `Sub-Category [${salesDrilldownState.sub_category}] - Product level performance`;
    const agg = {};
    filteredOrders.filter(r => r.category === salesDrilldownState.category && r.sub_category === salesDrilldownState.sub_category).forEach(r => {
      if (!agg[r.product_name]) agg[r.product_name] = { sales: 0, profit: 0 };
      agg[r.product_name].sales += r.sales;
      agg[r.product_name].profit += r.profit;
    });
    labels = Object.keys(agg);
    salesData = labels.map(l => Math.round(agg[l].sales));
    profitData = labels.map(l => Math.round(agg[l].profit));
  }

  const chart = createChart('chart-sales-drilldown', {
    type: 'bar',
    data: {
      labels: labels.map(l => l.length > 22 ? l.substring(0, 22) + '...' : l),
      datasets: [
        {
          label: 'Sales ($)',
          data: salesData,
          backgroundColor: '#2563eb',
          borderRadius: 4
        },
        {
          label: 'Profit ($)',
          data: profitData,
          backgroundColor: '#10b981',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (e, activeEls) => {
        if (activeEls.length > 0) {
          const index = activeEls[0].index;
          const selectedLabel = labels[index];
          if (salesDrilldownState.level === 'category') {
            salesDrilldownState.level = 'sub_category';
            salesDrilldownState.category = selectedLabel;
            renderSalesDrilldownChart();
          } else if (salesDrilldownState.level === 'sub_category') {
            salesDrilldownState.level = 'product';
            salesDrilldownState.sub_category = selectedLabel;
            renderSalesDrilldownChart();
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: $${ctx.raw.toLocaleString()}`
          }
        }
      },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor, callback: v => `$${(v/1000).toFixed(0)}k` }, grid: { color: gridColor } }
      }
    }
  });
}

function renderQuarterlySalesChart() {
  const { textColor, gridColor } = getChartColors();
  const qtrAgg = {};
  filteredOrders.forEach(r => {
    const key = `${r.year} ${r.quarter}`;
    qtrAgg[key] = (qtrAgg[key] || 0) + r.sales;
  });

  const sortedQtrs = Object.keys(qtrAgg).sort();
  createChart('chart-sales-quarterly', {
    type: 'bar',
    data: {
      labels: sortedQtrs,
      datasets: [{
        label: 'Quarterly Sales ($)',
        data: sortedQtrs.map(k => Math.round(qtrAgg[k])),
        backgroundColor: '#8b5cf6',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor, callback: v => `$${(v/1000).toFixed(0)}k` }, grid: { color: gridColor } }
      }
    }
  });
}

function renderTopBottomProductsTable() {
  const tbody = document.querySelector('#table-top-bottom-products tbody');
  tbody.innerHTML = '';

  const prodAgg = {};
  filteredOrders.forEach(r => {
    if (!prodAgg[r.product_id]) {
      prodAgg[r.product_id] = {
        name: r.product_name,
        category: r.category,
        units: 0,
        sales: 0,
        profit: 0
      };
    }
    prodAgg[r.product_id].units += r.quantity;
    prodAgg[r.product_id].sales += r.sales;
    prodAgg[r.product_id].profit += r.profit;
  });

  const sorted = Object.values(prodAgg).sort((a, b) => showTop10Sales ? b.sales - a.sales : a.sales - b.sales).slice(0, 10);

  sorted.forEach(p => {
    const margin = p.sales > 0 ? (p.profit / p.sales) * 100 : 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.name}</strong></td>
      <td><span class="badge neutral">${p.category}</span></td>
      <td>${p.units}</td>
      <td>$${p.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td class="${p.profit < 0 ? 'negative-loss' : 'positive-profit'}">$${p.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td><strong>${margin.toFixed(1)}%</strong></td>
    `;
    tbody.appendChild(tr);
  });
}

// =============================================================================
// PAGE 3: PROFITABILITY ANALYSIS & SCATTER PLOT
// =============================================================================
function renderPage3Profit() {
  const { textColor, gridColor } = getChartColors();

  // 1. Discount vs Profit Bubble Scatter Plot
  const samplePoints = filteredOrders.map(r => ({
    x: Math.round(r.discount * 100), // Discount %
    y: Math.round(r.profit),         // Profit $
    r: Math.max(3, Math.min(18, Math.sqrt(r.sales) / 5)), // Bubble Size based on Sales
    category: r.category,
    product: r.product_name,
    sales: r.sales,
    orderId: r.order_id
  }));

  const catColors = {
    'Technology': '#2563eb',
    'Furniture': '#ef4444',
    'Office Supplies': '#10b981'
  };

  createChart('chart-profit-scatter', {
    type: 'bubble',
    data: {
      datasets: ['Technology', 'Furniture', 'Office Supplies'].map(cat => ({
        label: cat,
        data: samplePoints.filter(p => p.category === cat),
        backgroundColor: (catColors[cat] || '#8b5cf6') + '99',
        borderColor: catColors[cat] || '#8b5cf6',
        borderWidth: 1.2
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { color: textColor } },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const p = ctx.raw;
              return `${p.product} | Disc: ${p.x}% | Profit: $${p.y} | Sales: $${p.sales}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Discount Applied (%)', color: textColor },
          ticks: { color: textColor, callback: v => `${v}%` },
          grid: { color: gridColor }
        },
        y: {
          title: { display: true, text: 'Net Profit ($)', color: textColor },
          ticks: { color: textColor, callback: v => `$${v}` },
          grid: { color: gridColor }
        }
      }
    }
  });

  // 2. Sub-Category Profit Bar
  const subcatProfit = {};
  filteredOrders.forEach(r => {
    subcatProfit[r.sub_category] = (subcatProfit[r.sub_category] || 0) + r.profit;
  });

  const sortedSubcats = Object.entries(subcatProfit).sort((a, b) => b[1] - a[1]);
  createChart('chart-profit-subcat-bar', {
    type: 'bar',
    data: {
      labels: sortedSubcats.map(s => s[0]),
      datasets: [{
        label: 'Net Profit ($)',
        data: sortedSubcats.map(s => Math.round(s[1])),
        backgroundColor: sortedSubcats.map(s => s[1] < 0 ? '#ef4444' : '#10b981'),
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor, callback: v => `$${(v/1000).toFixed(0)}k` }, grid: { color: gridColor } }
      }
    }
  });

  // 3. Loss-Making Orders Table
  const tbody = document.querySelector('#table-loss-orders tbody');
  tbody.innerHTML = '';

  const lossOrders = filteredOrders.filter(r => r.profit < 0).sort((a, b) => a.profit - b.profit).slice(0, 10);
  lossOrders.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code>${r.order_id}</code></td>
      <td><strong>${r.product_name}</strong></td>
      <td><span class="badge neutral">${r.category}</span></td>
      <td><span class="badge negative">${Math.round(r.discount * 100)}%</span></td>
      <td>$${r.sales.toFixed(2)}</td>
      <td class="negative-loss">$${r.profit.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// =============================================================================
// PAGE 4: CUSTOMER ANALYTICS & RFM SEGMENTATION
// =============================================================================
function renderPage4Customer() {
  const { textColor, gridColor } = getChartColors();

  // Aggregate RFM Segments
  const segmentStats = {};
  rawData.customers.forEach(c => {
    const seg = c['RFM Segment'] || 'New Customers';
    if (!segmentStats[seg]) {
      segmentStats[seg] = { count: 0, revenue: 0, profit: 0 };
    }
    segmentStats[seg].count += 1;
    segmentStats[seg].revenue += (c['Monetary'] || 0);
    segmentStats[seg].profit += (c['Total_Profit'] || 0);
  });

  const rfmOrder = ['Champions', 'Loyal Customers', 'Potential Loyalists', 'New Customers', 'At-Risk Customers', 'Low-Value Customers'];
  const rfmColors = ['#10b981', '#3b82f6', '#8b5cf6', '#0d9488', '#f59e0b', '#ef4444'];

  // 1. RFM Distribution Bar
  createChart('chart-rfm-distribution', {
    type: 'bar',
    data: {
      labels: rfmOrder,
      datasets: [{
        label: 'Customer Count',
        data: rfmOrder.map(seg => segmentStats[seg] ? segmentStats[seg].count : 0),
        backgroundColor: rfmColors,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } }
      }
    }
  });

  // 2. RFM Revenue Contribution
  createChart('chart-rfm-revenue', {
    type: 'doughnut',
    data: {
      labels: rfmOrder,
      datasets: [{
        data: rfmOrder.map(seg => segmentStats[seg] ? Math.round(segmentStats[seg].revenue) : 0),
        backgroundColor: rfmColors,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: textColor, boxWidth: 12, padding: 10 } }
      },
      cutout: '65%'
    }
  });

  // 3. Top 10 Champions Table
  const tbody = document.querySelector('#table-top-customers tbody');
  tbody.innerHTML = '';

  const topCusts = [...rawData.customers].sort((a, b) => (b['Monetary'] || 0) - (a['Monetary'] || 0)).slice(0, 10);
  topCusts.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code>${c['Customer ID']}</code></td>
      <td><strong>${c['Customer Name']}</strong></td>
      <td><span class="badge neutral">${c['Segment']}</span></td>
      <td>${c['City']}, ${c['State']}</td>
      <td><span class="badge positive">${c['RFM Segment']}</span></td>
      <td>${c['Frequency']}</td>
      <td><strong>$${(c['Monetary'] || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
      <td class="positive-profit">$${(c['Total_Profit'] || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td>$${(c['Average Order Value'] || 0).toFixed(2)}</td>
      <td>${c['Recency']} days</td>
    `;
    tbody.appendChild(tr);
  });
}

// =============================================================================
// PAGE 5: PRODUCT PERFORMANCE MATRIX
// =============================================================================
function renderPage5Product() {
  const { textColor, gridColor } = getChartColors();
  renderProductMatrixTable();

  // 1. Return Reasons Bar
  const returnReasons = {};
  filteredOrders.filter(r => r.is_returned === 1).forEach(r => {
    returnReasons[r.return_reason] = (returnReasons[r.return_reason] || 0) + 1;
  });

  const sortedReasons = Object.entries(returnReasons).sort((a, b) => b[1] - a[1]);
  createChart('chart-product-return-reasons', {
    type: 'bar',
    data: {
      labels: sortedReasons.map(r => r[0]),
      datasets: [{
        label: 'Return Count',
        data: sortedReasons.map(r => r[1]),
        backgroundColor: '#ef4444',
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { display: false } }
      }
    }
  });

  // 2. Return Rate by Category
  const catReturns = {};
  const catTotals = {};
  filteredOrders.forEach(r => {
    catTotals[r.category] = (catTotals[r.category] || 0) + 1;
    if (r.is_returned === 1) {
      catReturns[r.category] = (catReturns[r.category] || 0) + 1;
    }
  });

  const catLabels = Object.keys(catTotals);
  const catReturnRates = catLabels.map(cat => {
    const total = catTotals[cat] || 1;
    const ret = catReturns[cat] || 0;
    return ((ret / total) * 100).toFixed(1);
  });

  createChart('chart-product-return-by-cat', {
    type: 'bar',
    data: {
      labels: catLabels,
      datasets: [{
        label: 'Return Rate (%)',
        data: catReturnRates,
        backgroundColor: ['#2563eb', '#f59e0b', '#10b981'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor, callback: v => `${v}%` }, grid: { color: gridColor } }
      }
    }
  });
}

function renderProductMatrixTable(searchTerm = '') {
  const tbody = document.querySelector('#table-product-matrix tbody');
  tbody.innerHTML = '';

  const tierBadges = {
    'Excellent': '<span class="badge positive">🌟 Excellent</span>',
    'Good': '<span class="badge positive">🟢 Good</span>',
    'Average': '<span class="badge neutral">🟡 Average</span>',
    'Risk': '<span class="badge warning">⚠️ Risk</span>',
    'Poor': '<span class="badge negative">🔴 Poor</span>'
  };

  const filtered = rawData.products.filter(p => {
    if (!searchTerm) return true;
    return p['Product Name'].toLowerCase().includes(searchTerm) || p['Category'].toLowerCase().includes(searchTerm);
  });

  filtered.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p['Product Name']}</strong></td>
      <td><span class="badge neutral">${p['Category']}</span></td>
      <td>${p['Sub-Category']}</td>
      <td>$${p['Selling Price'].toFixed(2)}</td>
      <td>${p['Total_Units']}</td>
      <td>$${p['Total_Sales'].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td class="${p['Total_Profit'] < 0 ? 'negative-loss' : 'positive-profit'}">$${p['Total_Profit'].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td><strong>${p['Profit Margin %'].toFixed(1)}%</strong></td>
      <td>${p['Return Rate %'].toFixed(1)}%</td>
      <td>${tierBadges[p['Performance Category']] || p['Performance Category']}</td>
    `;
    tbody.appendChild(tr);
  });
}

// =============================================================================
// PAGE 6: REGIONAL & GEOSPATIAL ANALYSIS
// =============================================================================
function renderPage6Regional() {
  const { textColor, gridColor } = getChartColors();

  // 1. Regional KPI Summary Tiles
  const regionalContainer = document.getElementById('regional-cards-container');
  regionalContainer.innerHTML = '';

  const regAgg = {};
  filteredOrders.forEach(r => {
    if (!regAgg[r.region]) {
      regAgg[r.region] = { sales: 0, profit: 0, orders: 0, customers: new Set() };
    }
    regAgg[r.region].sales += r.sales;
    regAgg[r.region].profit += r.profit;
    regAgg[r.region].orders += 1;
    regAgg[r.region].customers.add(r.customer_id);
  });

  Object.entries(regAgg).forEach(([region, stat]) => {
    const margin = stat.sales > 0 ? (stat.profit / stat.sales) * 100 : 0;
    const tile = document.createElement('div');
    tile.className = 'region-tile';
    tile.innerHTML = `
      <div class="region-tile-header">
        <span class="region-name">${region} Region</span>
        <span class="badge positive">${margin.toFixed(1)}% Margin</span>
      </div>
      <div style="font-size: 1.4rem; font-weight: 800; margin: 0.25rem 0;">$${stat.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      <div style="font-size: 0.78rem; color: var(--text-muted);">
        Profit: <strong class="positive-profit">$${stat.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> | ${stat.orders} Orders
      </div>
    `;
    tile.onclick = () => {
      currentFilters.region = region;
      document.getElementById('filter-region').value = region;
      applyFilters();
    };
    regionalContainer.appendChild(tile);
  });

  // 2. Sales by Top States Bar
  const stateAgg = {};
  filteredOrders.forEach(r => {
    if (!stateAgg[r.state]) stateAgg[r.state] = { sales: 0, profit: 0 };
    stateAgg[r.state].sales += r.sales;
    stateAgg[r.state].profit += r.profit;
  });

  const sortedStates = Object.entries(stateAgg).sort((a, b) => b[1].sales - a[1].sales).slice(0, 10);
  createChart('chart-regional-states-bar', {
    type: 'bar',
    data: {
      labels: sortedStates.map(s => s[0]),
      datasets: [
        {
          label: 'Sales ($)',
          data: sortedStates.map(s => Math.round(s[1].sales)),
          backgroundColor: '#2563eb',
          borderRadius: 4
        },
        {
          label: 'Profit ($)',
          data: sortedStates.map(s => Math.round(s[1].profit)),
          backgroundColor: '#10b981',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor, callback: v => `$${(v/1000).toFixed(0)}k` }, grid: { color: gridColor } }
      }
    }
  });

  // 3. City Profitability Ranking Table
  const cityAgg = {};
  filteredOrders.forEach(r => {
    const key = `${r.city}, ${r.state}`;
    if (!cityAgg[key]) {
      cityAgg[key] = { city: r.city, state: r.state, region: r.region, sales: 0, profit: 0, orders: 0 };
    }
    cityAgg[key].sales += r.sales;
    cityAgg[key].profit += r.profit;
    cityAgg[key].orders += 1;
  });

  const tbody = document.querySelector('#table-city-ranking tbody');
  tbody.innerHTML = '';
  const sortedCities = Object.values(cityAgg).sort((a, b) => b.profit - a.profit).slice(0, 10);

  sortedCities.forEach(c => {
    const margin = c.sales > 0 ? (c.profit / c.sales) * 100 : 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${c.city}</strong></td>
      <td>${c.state}</td>
      <td><span class="badge neutral">${c.region}</span></td>
      <td>${c.orders}</td>
      <td>$${c.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td class="positive-profit">$${c.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td><strong>${margin.toFixed(1)}%</strong></td>
    `;
    tbody.appendChild(tr);
  });

  // 4. Drillthrough Chips
  const chipContainer = document.getElementById('state-drill-chips');
  chipContainer.innerHTML = '';
  const uniqueStates = [...new Set(filteredOrders.map(r => r.state))].sort();

  uniqueStates.forEach(st => {
    const chip = document.createElement('button');
    chip.className = 'state-chip';
    chip.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${st}`;
    chip.onclick = () => openDrillthroughModal('State', st);
    chipContainer.appendChild(chip);
  });
}

// =============================================================================
// DRILL-THROUGH MODAL
// =============================================================================
function setupModal() {
  const modal = document.getElementById('drillthrough-modal');
  const closeBtn = document.getElementById('modal-close');

  closeBtn.onclick = () => modal.classList.add('hidden');
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  };
}

function openDrillthroughModal(filterType, filterVal) {
  const modal = document.getElementById('drillthrough-modal');
  const title = document.getElementById('modal-title');
  const subtitle = document.getElementById('modal-subtitle');
  const tbody = document.querySelector('#modal-orders-table tbody');

  title.innerText = `Line-Item Order Details for ${filterType}: ${filterVal}`;
  
  const orders = filteredOrders.filter(r => r.state === filterVal || r.city === filterVal || r.region === filterVal);
  subtitle.innerText = `Showing all ${orders.length} transaction records`;

  tbody.innerHTML = '';
  orders.slice(0, 50).forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code>${r.order_id}</code></td>
      <td>${r.order_date}</td>
      <td>${r.customer_name}</td>
      <td><strong>${r.product_name}</strong></td>
      <td><span class="badge neutral">${r.category}</span></td>
      <td>$${r.sales.toFixed(2)}</td>
      <td>${r.quantity}</td>
      <td>${Math.round(r.discount * 100)}%</td>
      <td class="${r.profit < 0 ? 'negative-loss' : 'positive-profit'}">$${r.profit.toFixed(2)}</td>
      <td>${r.is_returned ? '<span class="badge negative">Returned</span>' : '<span class="badge positive">Completed</span>'}</td>
    `;
    tbody.appendChild(tr);
  });

  modal.classList.remove('hidden');
}

// Export Summary CSV
function exportSummaryCSV() {
  const rows = [
    ['Order ID', 'Order Date', 'Customer Name', 'Category', 'Sub-Category', 'Region', 'State', 'City', 'Sales', 'Quantity', 'Discount', 'Profit', 'Is Returned']
  ];

  filteredOrders.forEach(r => {
    rows.push([
      r.order_id,
      r.order_date,
      `"${r.customer_name}"`,
      r.category,
      r.sub_category,
      r.region,
      r.state,
      r.city,
      r.sales,
      r.quantity,
      r.discount,
      r.profit,
      r.is_returned
    ]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ecommerce_bi_summary_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
