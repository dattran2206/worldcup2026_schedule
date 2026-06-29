// CONFIGURATION & MATCH MAPS FOR FIFA WORLD CUP 2026 BRACKET
const BRACKET_MAP = {
  // Left Bracket Columns (Left Half of the Tournament)
  left: {
    r32: [73, 75, 74, 77, 82, 81, 84, 83],
    r16: [90, 89, 94, 93],
    qf: [97, 98],
    sf: [101]
  },
  // Right Bracket Columns (Right Half of the Tournament)
  right: {
    r32: [76, 78, 79, 80, 85, 87, 88, 86],
    r16: [91, 92, 96, 95],
    qf: [99, 100],
    sf: [102]
  },
  // Center Finals
  center: {
    third: 103,
    final: 104
  }
};

// GLOBAL ZOOM VARIABLES FOR BRACKET
let currentZoom = window.innerWidth <= 768 ? 0.4 : 1.0;
const MIN_ZOOM = window.innerWidth <= 768 ? 0.25 : 0.5;
const MAX_ZOOM = 2.0;

// SWITCH VIEW LOGIC
function switchView(viewType) {
  const listBtn = document.getElementById('listViewBtn');
  const bracketBtn = document.getElementById('bracketViewBtn');
  const scheduleContainer = document.getElementById('scheduleContainer');
  const bracketView = document.getElementById('bracketView');
  const bracketWrapper = document.getElementById('bracketViewWrapper') || bracketView;
  const groupPhaseHeader = document.getElementById('groupPhase');
  const knockoutPhaseHeader = document.getElementById('knockoutPhase');

  if (viewType === 'bracket') {
    listBtn.classList.remove('active');
    bracketBtn.classList.add('active');
    scheduleContainer.classList.add('hidden');
    if (groupPhaseHeader) groupPhaseHeader.classList.add('hidden');
    if (knockoutPhaseHeader) knockoutPhaseHeader.classList.add('hidden');
    bracketWrapper.classList.remove('hidden');
    
    // Draw tree structure if not drawn
    if (bracketView.innerHTML.trim() === '') {
      renderBracketStructure();
      setZoomLevel(currentZoom);
    }
    // Update live data to tree nodes
    syncRealtimeToBracket();
    
    // Draw SVG connector lines after rendering
    requestAnimationFrame(() => {
      drawConnectorLines();
    });

    // Highlight và focus vào trận đấu của ngày trong sơ đồ nhánh
    if (typeof highlightToday === 'function') {
      highlightToday();
    }
  } else {
    listBtn.classList.add('active');
    bracketBtn.classList.remove('active');
    scheduleContainer.classList.remove('hidden');
    
    // Restore group/knockout filters
    const activeFilter = document.querySelector('.filter-btn.active');
    if (activeFilter) {
      const clickAttr = activeFilter.getAttribute('onclick') || '';
      const match = clickAttr.match(/'([^']+)'/);
      const phase = match ? match[1] : 'all';
      filterPhase(phase);
    }
    
    bracketWrapper.classList.add('hidden');
  }
}

// DRAGGABLE CANVAS MOUSE LOGIC FOR BRACKET VIEW
function initDraggableBracket() {
  const slider = document.getElementById('bracketView');
  if (!slider) return;
  
  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener('mouseleave', () => {
    isDown = false;
  });
  slider.addEventListener('mouseup', () => {
    isDown = false;
  });
  slider.addEventListener('mousemove', (e) => {
    if(!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll speed
    slider.scrollLeft = scrollLeft - walk;
  });
}

// RENDER BRACKET COLUMNS DOM SHELL
function renderBracketStructure() {
  const container = document.getElementById('bracketView');
  if (!container) return;

  let html = `<div class="bracket-scroll-content"><div class="bracket-container">`;

  // Helper to render columns of nodes
  const renderCol = (title, matchNumbers) => {
    let colHtml = `<div class="bracket-column">`;
    colHtml += `<div class="column-title">${title}</div>`;
    colHtml += `<div class="bracket-column-matches">`;
    matchNumbers.forEach(num => {
      const defaultHome = typeof getKnockoutTeamData === 'function' ? getKnockoutTeamData(num, 'home', null) : { vi: "Chờ xác định", flag: "❓" };
      const defaultAway = typeof getKnockoutTeamData === 'function' ? getKnockoutTeamData(num, 'away', null) : { vi: "Chờ xác định", flag: "❓" };
      colHtml += `
        <div class="bracket-match-node" data-match-number="${num}" onclick="openMatchDetails(${num})">
          <div class="bracket-match-header">
            <span>Trận</span>
            <span class="match-num">#${num}</span>
          </div>
          <div class="bracket-team-line home">
            <div class="team-info">
              <span class="flag">${defaultHome.flag}</span>
              <span class="team-name" title="${defaultHome.vi}">${defaultHome.vi}</span>
            </div>
            <span class="team-score">-</span>
          </div>
          <div class="bracket-team-line away">
            <div class="team-info">
              <span class="flag">${defaultAway.flag}</span>
              <span class="team-name" title="${defaultAway.vi}">${defaultAway.vi}</span>
            </div>
            <span class="team-score">-</span>
          </div>
        </div>
      `;
    });
    colHtml += `</div>`; // Close bracket-column-matches
    colHtml += `</div>`; // Close bracket-column
    return colHtml;
  };

  // Render left bracket
  html += renderCol('Vòng 32', BRACKET_MAP.left.r32);
  html += renderCol('Vòng 16', BRACKET_MAP.left.r16);
  html += renderCol('Tứ kết', BRACKET_MAP.left.qf);
  html += renderCol('Bán kết', BRACKET_MAP.left.sf);

  // Render Center Column (Final & Third Place)
  html += `<div class="bracket-column center-column">`;
  html += `<div class="column-title">Chung kết / Hạng ba</div>`;
  html += `<div class="bracket-column-matches">`;
  // Final Node
  const finalNum = BRACKET_MAP.center.final;
  const finalHome = typeof getKnockoutTeamData === 'function' ? getKnockoutTeamData(finalNum, 'home', null) : { vi: "Chờ xác định", flag: "🏆" };
  const finalAway = typeof getKnockoutTeamData === 'function' ? getKnockoutTeamData(finalNum, 'away', null) : { vi: "Chờ xác định", flag: "🏆" };
  html += `
    <div class="bracket-match-node" data-match-number="${finalNum}" onclick="openMatchDetails(${finalNum})" style="border: 2px solid var(--gold);">
      <div class="bracket-match-header" style="color:var(--gold)">
        <span>CHUNG KẾT</span>
        <span class="match-num">#${finalNum}</span>
      </div>
      <div class="bracket-team-line home">
        <div class="team-info">
          <span class="flag">${finalHome.flag}</span>
          <span class="team-name" title="${finalHome.vi}">${finalHome.vi}</span>
        </div>
        <span class="team-score">-</span>
      </div>
      <div class="bracket-team-line away">
        <div class="team-info">
          <span class="flag">${finalAway.flag}</span>
          <span class="team-name" title="${finalAway.vi}">${finalAway.vi}</span>
        </div>
        <span class="team-score">-</span>
      </div>
    </div>
  `;
  // Third Place Node
  const thirdNum = BRACKET_MAP.center.third;
  const thirdHome = typeof getKnockoutTeamData === 'function' ? getKnockoutTeamData(thirdNum, 'home', null) : { vi: "Chờ xác định", flag: "🥉" };
  const thirdAway = typeof getKnockoutTeamData === 'function' ? getKnockoutTeamData(thirdNum, 'away', null) : { vi: "Chờ xác định", flag: "🥉" };
  html += `
    <div class="bracket-match-node" data-match-number="${thirdNum}" onclick="openMatchDetails(${thirdNum})">
      <div class="bracket-match-header">
        <span>TRANH HẠNG BA</span>
        <span class="match-num">#${thirdNum}</span>
      </div>
      <div class="bracket-team-line home">
        <div class="team-info">
          <span class="flag">${thirdHome.flag}</span>
          <span class="team-name" title="${thirdHome.vi}">${thirdHome.vi}</span>
        </div>
        <span class="team-score">-</span>
      </div>
      <div class="bracket-team-line away">
        <div class="team-info">
          <span class="flag">${thirdAway.flag}</span>
          <span class="team-name" title="${thirdAway.vi}">${thirdAway.vi}</span>
        </div>
        <span class="team-score">-</span>
      </div>
    </div>
  `;
  html += `</div>`; // Close bracket-column-matches
  html += `</div>`; // Close bracket-column

  // Render right bracket (in reverse column order)
  html += renderCol('Bán kết', BRACKET_MAP.right.sf);
  html += renderCol('Tứ kết', BRACKET_MAP.right.qf);
  html += renderCol('Vòng 16', BRACKET_MAP.right.r16);
  html += renderCol('Vòng 32', BRACKET_MAP.right.r32);

  html += `</div></div>`;
  container.innerHTML = html;
  initDraggableBracket();
}

// SYNC ALL MATCHES DATA FROM GLOBAL CACHED MATCHES TO BRACKET
function syncRealtimeToBracket() {
  if (cachedMatches.length === 0) return;
  cachedMatches.forEach(match => {
    const num = match.match_number;
    if (num >= 73 && num <= 104) {
      updateBracketMatchUI(match);
    }
  });
}

// UPDATE INDIVIDUAL MATCH NODE DATA
function updateBracketMatchUI(match) {
  const el = document.querySelector(`.bracket-match-node[data-match-number="${match.match_number}"]`);
  if (!el) return;

  const homeData = typeof getKnockoutTeamData === 'function' ? getKnockoutTeamData(match.match_number, 'home', match.home_team?.country) : formatTeamName(match.home_team?.country);
  const awayData = typeof getKnockoutTeamData === 'function' ? getKnockoutTeamData(match.match_number, 'away', match.away_team?.country) : formatTeamName(match.away_team?.country);

  // Determine scores
  const isLive = match.status === 'in_progress';
  const homeScore = match.home_team?.goals !== null ? match.home_team.goals : (isLive ? '0' : '-');
  const awayScore = match.away_team?.goals !== null ? match.away_team.goals : (isLive ? '0' : '-');

  let homePenText = '';
  let awayPenText = '';
  if (match.home_team?.penalties !== null && match.home_team?.penalties !== undefined &&
      match.away_team?.penalties !== null && match.away_team?.penalties !== undefined &&
      (match.home_team.penalties > 0 || match.away_team.penalties > 0)) {
    homePenText = ` (${match.home_team.penalties})`;
    awayPenText = ` (${match.away_team.penalties})`;
  }

  // Update classes
  el.classList.toggle('live-highlight', isLive);
  
  const homeFav = isFavorite(homeData.vi);
  const awayFav = isFavorite(awayData.vi);
  el.classList.toggle('favorite-highlight', homeFav || awayFav);

  const homeWinnerClass = (match.winner === match.home_team?.country && match.status === 'completed') ? 'winner' : '';
  const awayWinnerClass = (match.winner === match.away_team?.country && match.status === 'completed') ? 'winner' : '';

  const homeLine = el.querySelector('.bracket-team-line.home');
  const awayLine = el.querySelector('.bracket-team-line.away');

  if (homeLine) {
    homeLine.className = `bracket-team-line home ${homeWinnerClass}`;
    homeLine.innerHTML = `
      <div class="team-info">
        <span class="flag">${homeData.flag}</span>
        <span class="team-name" title="${homeData.vi}">${homeData.vi}</span>
      </div>
      <span class="team-score">${homeScore}${homePenText}</span>
    `;
  }
  if (awayLine) {
    awayLine.className = `bracket-team-line away ${awayWinnerClass}`;
    awayLine.innerHTML = `
      <div class="team-info">
        <span class="flag">${awayData.flag}</span>
        <span class="team-name" title="${awayData.vi}">${awayData.vi}</span>
      </div>
      <span class="team-score">${awayScore}${awayPenText}</span>
    `;
  }
}

// DRAW SVG CONNECTOR LINES BETWEEN BRACKET NODES
function drawConnectorLines() {
  const container = document.querySelector('.bracket-container');
  if (!container) return;

  let svg = document.getElementById('bracketSvg');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'bracketSvg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '1';
    container.appendChild(svg);
  } else {
    svg.innerHTML = '';
  }

  // Helper to calculate coordinates relative to .bracket-container
  const getRelativeCoords = (el) => {
    let left = 0;
    let top = 0;
    let current = el;
    while (current && current !== container) {
      left += current.offsetLeft;
      top += current.offsetTop;
      current = current.offsetParent;
    }
    return {
      left: left,
      top: top,
      width: el.offsetWidth,
      height: el.offsetHeight
    };
  };

  const drawLink = (srcId, destId, isLeftSide) => {
    const srcEl = container.querySelector(`.bracket-match-node[data-match-number="${srcId}"]`);
    const destEl = container.querySelector(`.bracket-match-node[data-match-number="${destId}"]`);
    if (!srcEl || !destEl) return;

    const src = getRelativeCoords(srcEl);
    const dest = getRelativeCoords(destEl);

    const x1 = isLeftSide ? (src.left + src.width) : src.left;
    const y1 = src.top + src.height / 2;

    const x2 = isLeftSide ? dest.left : (dest.left + dest.width);
    const y2 = dest.top + dest.height / 2;

    // Draw step connector path
    const midX = x1 + (x2 - x1) / 2;
    const pathData = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(201, 168, 76, 0.25)'); // Gold border color with opacity
    path.setAttribute('stroke-width', '1.5');
    svg.appendChild(path);
  };

  // Left side mapping
  const leftLinks = [
    [73, 90], [75, 90], [74, 89], [77, 89], [82, 94], [81, 94], [84, 93], [83, 93],
    [90, 97], [89, 97], [94, 98], [93, 98],
    [97, 101], [98, 101],
    [101, 104]
  ];
  leftLinks.forEach(pair => drawLink(pair[0], pair[1], true));

  // Right side mapping
  const rightLinks = [
    [76, 91], [78, 91], [79, 92], [80, 92], [85, 96], [87, 96], [88, 95], [86, 95],
    [91, 99], [92, 99], [96, 100], [95, 100],
    [99, 102], [100, 102],
    [102, 104]
  ];
  rightLinks.forEach(pair => drawLink(pair[0], pair[1], false));

  // Third place connector
  drawLink(101, 103, true);
  drawLink(102, 103, false);
}

// WINDOW RESIZE RE-DRAW HANDLER
window.addEventListener('resize', () => {
  const bracketWrapper = document.getElementById('bracketViewWrapper') || document.getElementById('bracketView');
  if (bracketWrapper && !bracketWrapper.classList.contains('hidden')) {
    drawConnectorLines();
  }
});

// ZOOM CONTROL FUNCTIONS
function zoomBracket(amount) {
  setZoomLevel(currentZoom + amount);
}

function resetZoomBracket() {
  const defaultZoom = window.innerWidth <= 768 ? 0.4 : 1.0;
  setZoomLevel(defaultZoom);
}

function setZoomLevel(zoom) {
  currentZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
  document.documentElement.style.setProperty('--bracket-zoom', currentZoom);
  const label = document.getElementById('zoomLabel');
  if (label) {
    label.textContent = `${Math.round(currentZoom * 100)}%`;
  }
}
