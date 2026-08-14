const principalInput = document.getElementById('principal');
const rateInput = document.getElementById('rate');
const tenureInput = document.getElementById('tenure');

const principalValue = document.getElementById('principalValue');
const rateValue = document.getElementById('rateValue');
const tenureValue = document.getElementById('tenureValue');

const emiFigure = document.getElementById('emiFigure');
const statPrincipal = document.getElementById('statPrincipal');
const statInterest = document.getElementById('statInterest');
const statTotal = document.getElementById('statTotal');
const houseViz = document.getElementById('houseViz');
const scheduleChart = document.getElementById('scheduleChart');

const inr = (n) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(n);

const inrShort = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return inr(n);
};

function setSliderFill(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty('--fill', `${pct}%`);
}

function buildHouse(principalRatio) {
  const cols = 10, rows = 6;
  const wallX = 30, wallY = 95, wallW = 140, wallH = 75;
  const cellW = wallW / cols, cellH = wallH / rows;
  const total = cols * rows;
  const principalCount = Math.round(total * principalRatio);

  let bricks = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const color = idx < principalCount ? 'var(--brick)' : 'var(--brass)';
      const x = wallX + c * cellW + 1;
      const y = wallY + wallH - (r + 1) * cellH + 1;
      const w = cellW - 2;
      const h = cellH - 2;
      bricks += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="1" fill="${color}"/>`;
    }
  }

  const svg = `
    <svg viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <polygon points="100,15 180,95 20,95" fill="var(--blueprint)"/>
      <rect x="94" y="55" width="12" height="20" fill="var(--paper)"/>
      ${bricks}
      <rect x="24" y="170" width="152" height="6" fill="var(--ink)"/>
    </svg>`;
  houseViz.innerHTML = svg;
}

function buildScheduleChart(schedule) {
  if (!schedule || schedule.length === 0) {
    scheduleChart.innerHTML = '';
    return;
  }
  const maxTotal = Math.max(...schedule.map(y => y.principal + y.interest));
  const labelEvery = schedule.length > 15 ? 5 : 1;

  let html = '';
  schedule.forEach((y, i) => {
    const total = y.principal + y.interest;
    const barHeightPct = (total / maxTotal) * 100;
    const principalPct = (y.principal / total) * 100;
    const interestPct = (y.interest / total) * 100;
    const showLabel = (i % labelEvery === 0) || i === schedule.length - 1;
    html += `
      <div class="year-col">
        <div class="year-bar" style="height:${barHeightPct}%">
          <div class="seg-interest" style="height:${interestPct}%"></div>
          <div class="seg-principal" style="height:${principalPct}%"></div>
        </div>
        <span class="year-label">${showLabel ? 'Y' + y.year : ''}</span>
      </div>`;
  });
  scheduleChart.innerHTML = html;
}

let debounceTimer = null;

async function recalculate() {
  const principal = Number(principalInput.value);
  const rate = Number(rateInput.value);
  const tenure = Number(tenureInput.value);

  principalValue.textContent = inrShort(principal);
  rateValue.textContent = `${rate}%`;
  tenureValue.textContent = `${tenure} yrs`;

  setSliderFill(principalInput);
  setSliderFill(rateInput);
  setSliderFill(tenureInput);

  try {
    const res = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ principal, rate, tenure }),
    });
    if (!res.ok) throw new Error('calc failed');
    const data = await res.json();

    emiFigure.textContent = inr(data.emi);
    statPrincipal.textContent = inrShort(data.principal);
    statInterest.textContent = inrShort(data.total_interest);
    statTotal.textContent = inrShort(data.total_payment);

    const principalRatio = data.principal / data.total_payment;
    buildHouse(principalRatio);
    buildScheduleChart(data.schedule);
  } catch (err) {
    console.error(err);
  }
}

function debouncedRecalculate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(recalculate, 120);
}

[principalInput, rateInput, tenureInput].forEach(input => {
  input.addEventListener('input', debouncedRecalculate);
});

recalculate();
