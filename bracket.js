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

// GLOBAL ZOOM & LAYOUT VARIABLES FOR BRACKET
let currentBracketType = 'circular';
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
      resetZoomBracket();
    }
    // Update live data to tree nodes
    syncRealtimeToBracket();
    
    // Draw SVG connector lines after rendering
    if (currentBracketType === 'horizontal') {
      requestAnimationFrame(() => {
        drawConnectorLines();
      });
    }

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

// DRAGGABLE CANVAS MOUSE LOGIC FOR BRACKET VIEW (2D PANNING)
function initDraggableBracket() {
  const slider = document.getElementById('bracketView');
  if (!slider) return;
  
  let isDown = false;
  let startX, startY;
  let scrollLeft, scrollTop;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    startY = e.pageY - slider.offsetTop;
    scrollLeft = slider.scrollLeft;
    scrollTop = slider.scrollTop;
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
    const y = e.pageY - slider.offsetTop;
    const walkX = (x - startX) * 1.5; // scroll speed X
    const walkY = (y - startY) * 1.5; // scroll speed Y
    slider.scrollLeft = scrollLeft - walkX;
    slider.scrollTop = scrollTop - walkY;
  });
}

// RENDER BRACKET COLUMNS DOM SHELL
function renderBracketStructure() {
  if (currentBracketType === 'circular') {
    renderCircularBracketStructure();
  } else {
    renderHorizontalBracketStructure();
  }
}

function switchBracketType(type) {
  currentBracketType = type;
  document.getElementById('bracketTypeHorizontal')?.classList.toggle('active', type === 'horizontal');
  document.getElementById('bracketTypeCircular')?.classList.toggle('active', type === 'circular');
  
  const container = document.getElementById('bracketView');
  if (container) container.innerHTML = '';
  renderBracketStructure();
  
  // Auto-adjust zoom to fit the chosen layout perfectly
  resetZoomBracket();
  
  syncRealtimeToBracket();
  
  if (type === 'horizontal') {
    requestAnimationFrame(() => {
      drawConnectorLines();
    });
  }
}

const leftMatches = [73, 75, 74, 77, 82, 81, 84, 83];
const rightMatches = [76, 78, 79, 80, 85, 87, 88, 86];
const nodeAngles = {};
leftMatches.forEach((m, idx) => {
  nodeAngles[m] = (100 + idx * (160 / 7)) * Math.PI / 180;
});
rightMatches.forEach((m, idx) => {
  nodeAngles[m] = (-80 + idx * (160 / 7)) * Math.PI / 180;
});

nodeAngles[90] = (nodeAngles[73] + nodeAngles[75]) / 2;
nodeAngles[89] = (nodeAngles[74] + nodeAngles[77]) / 2;
nodeAngles[94] = (nodeAngles[82] + nodeAngles[81]) / 2;
nodeAngles[93] = (nodeAngles[84] + nodeAngles[83]) / 2;

nodeAngles[91] = (nodeAngles[76] + nodeAngles[78]) / 2;
nodeAngles[92] = (nodeAngles[79] + nodeAngles[80]) / 2;
nodeAngles[96] = (nodeAngles[85] + nodeAngles[87]) / 2;
nodeAngles[95] = (nodeAngles[88] + nodeAngles[86]) / 2;

nodeAngles[97] = (nodeAngles[90] + nodeAngles[89]) / 2;
nodeAngles[98] = (nodeAngles[94] + nodeAngles[93]) / 2;
nodeAngles[99] = (nodeAngles[91] + nodeAngles[92]) / 2;
nodeAngles[100] = (nodeAngles[96] + nodeAngles[95]) / 2;

nodeAngles[101] = (nodeAngles[97] + nodeAngles[98]) / 2;
nodeAngles[102] = (nodeAngles[99] + nodeAngles[100]) / 2;

function renderCircularBracketStructure() {
  const container = document.getElementById('bracketView');
  if (!container) return;

  const cx = 450, cy = 450;

  let html = `<div class="bracket-scroll-content" style="width: calc(900px * var(--bracket-zoom, 1)); height: calc(900px * var(--bracket-zoom, 1)); margin: 0 auto; overflow: hidden; position: relative;">`;
  html += `<div class="bracket-container" style="width: 900px; height: 900px; position: absolute; top: 0; left: 50%; transform: translate(-50%, 0) scale(var(--bracket-zoom, 1)); transform-origin: top center;">`;
  html += `<svg id="circularBracketSvg" class="circular-bracket-svg" viewBox="0 0 900 900" width="900" height="900">`;

  // 1. Radar background lines
  const rings = [380, 295, 210, 135, 75];
  rings.forEach(r => {
    html += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1" stroke-dasharray="4,4" />`;
  });

  // 2. Helper to get radial Y paths split into Home and Away lines
  const getRadialHalfPaths = (rStart, rEnd, thetaA, thetaB, thetaWin) => {
    const rMid = (rStart + rEnd) / 2;
    const ax = cx + rStart * Math.cos(thetaA);
    const ay = cy + rStart * Math.sin(thetaA);
    const bx = cx + rStart * Math.cos(thetaB);
    const by = cy + rStart * Math.sin(thetaB);
    const amx = cx + rMid * Math.cos(thetaA);
    const amy = cy + rMid * Math.sin(thetaA);
    const bmx = cx + rMid * Math.cos(thetaB);
    const bmy = cy + rMid * Math.sin(thetaB);
    const mx = cx + rMid * Math.cos(thetaWin);
    const my = cy + rMid * Math.sin(thetaWin);
    const cx_child = cx + rEnd * Math.cos(thetaWin);
    const cy_child = cy + rEnd * Math.sin(thetaWin);
    const sweepA = (thetaWin > thetaA) ? 1 : 0;
    const sweepB = (thetaWin > thetaB) ? 1 : 0;
    
    const homePath = `M ${ax} ${ay} L ${amx} ${amy} A ${rMid} ${rMid} 0 0 ${sweepA} ${mx} ${my} L ${cx_child} ${cy_child}`;
    const awayPath = `M ${bx} ${by} L ${bmx} ${bmy} A ${rMid} ${rMid} 0 0 ${sweepB} ${mx} ${my} L ${cx_child} ${cy_child}`;
    return { homePath, awayPath };
  };

  // 3. Connectors
  // R32 -> R16
  const allR32Matches = [...leftMatches, ...rightMatches];
  allR32Matches.forEach(m => {
    const theta = nodeAngles[m];
    const paths = getRadialHalfPaths(380, 295, theta - 0.09, theta + 0.09, theta);
    html += `<path class="circular-connector" id="circular-connector-${m}-home" d="${paths.homePath}" />`;
    html += `<path class="circular-connector" id="circular-connector-${m}-away" d="${paths.awayPath}" />`;
  });

  // R16 -> QF
  const r16Connections = [
    { id: 90, p1: 73, p2: 75 }, { id: 89, p1: 74, p2: 77 }, { id: 94, p1: 82, p2: 81 }, { id: 93, p1: 84, p2: 83 },
    { id: 91, p1: 76, p2: 78 }, { id: 92, p1: 79, p2: 80 }, { id: 96, p1: 85, p2: 87 }, { id: 95, p1: 88, p2: 86 }
  ];
  r16Connections.forEach(c => {
    const paths = getRadialHalfPaths(295, 210, nodeAngles[c.p1], nodeAngles[c.p2], nodeAngles[c.id]);
    html += `<path class="circular-connector" id="circular-connector-${c.id}-home" d="${paths.homePath}" />`;
    html += `<path class="circular-connector" id="circular-connector-${c.id}-away" d="${paths.awayPath}" />`;
  });

  // QF -> SF
  const qfConnections = [
    { id: 97, p1: 90, p2: 89 }, { id: 98, p1: 94, p2: 93 },
    { id: 99, p1: 91, p2: 92 }, { id: 100, p1: 96, p2: 95 }
  ];
  qfConnections.forEach(c => {
    const paths = getRadialHalfPaths(210, 135, nodeAngles[c.p1], nodeAngles[c.p2], nodeAngles[c.id]);
    html += `<path class="circular-connector" id="circular-connector-${c.id}-home" d="${paths.homePath}" />`;
    html += `<path class="circular-connector" id="circular-connector-${c.id}-away" d="${paths.awayPath}" />`;
  });

  // SF -> Finals
  const sfConnections = [
    { id: 101, p1: 97, p2: 98 }, { id: 102, p1: 99, p2: 100 }
  ];
  sfConnections.forEach(c => {
    const paths = getRadialHalfPaths(135, 75, nodeAngles[c.p1], nodeAngles[c.p2], nodeAngles[c.id]);
    html += `<path class="circular-connector" id="circular-connector-${c.id}-home" d="${paths.homePath}" />`;
    html += `<path class="circular-connector" id="circular-connector-${c.id}-away" d="${paths.awayPath}" />`;
  });

  // Final -> Center
  html += `<path class="circular-connector" id="circular-connector-104-home" d="M ${cx + 75 * Math.cos(nodeAngles[101])} ${cy + 75 * Math.sin(nodeAngles[101])} L ${cx} ${cy}" />`;
  html += `<path class="circular-connector" id="circular-connector-104-away" d="M ${cx + 75 * Math.cos(nodeAngles[102])} ${cy + 75 * Math.sin(nodeAngles[102])} L ${cx} ${cy}" />`;

  // 4. Nodes helper
  const makeNodeHtml = (id, r, theta, onClickStr, tooltipText, scoreId, rScore, thetaScore) => {
    const nx = cx + r * Math.cos(theta);
    const ny = cy + r * Math.sin(theta);
    const tScore = thetaScore !== undefined ? thetaScore : theta;
    const sx = cx + rScore * Math.cos(tScore);
    const sy = cy + rScore * Math.sin(tScore);
    const circleRadius = r === 380 ? 16 : r === 295 ? 18 : r === 210 ? 20 : r === 135 ? 22 : 24;
    return `
      <g class="circular-node" id="${id}" transform="translate(${nx}, ${ny})" onclick="${onClickStr}">
        <title>${tooltipText}</title>
        <circle r="${circleRadius}" />
        <text x="0" y="0" dominant-baseline="central" text-anchor="middle" font-size="${circleRadius * 1.25}">❓</text>
      </g>
      <rect id="rect-${scoreId}" class="circular-score-badge" rx="3" ry="3" style="display: none; pointer-events: none;" />
      <text id="${scoreId}" x="${sx}" y="${sy}" class="circular-score-text" style="font-size: 11px; fill: var(--gold); font-weight: bold; display: none;">-</text>
    `;
  };

  // Ring 0 (R32 teams)
  allR32Matches.forEach(m => {
    const theta = nodeAngles[m];
    // Home team (shifted outward to radius 405 to avoid lines entirely)
    html += makeNodeHtml(`circular-node-r32-${m}-home`, 380, theta - 0.09, `openMatchDetails(${m})`, `Trận #${m} - Home Team`, `circular-score-r32-${m}-home`, 405, theta - 0.09);
    // Away team (shifted outward to radius 405 to avoid lines entirely)
    html += makeNodeHtml(`circular-node-r32-${m}-away`, 380, theta + 0.09, `openMatchDetails(${m})`, `Trận #${m} - Away Team`, `circular-score-r32-${m}-away`, 405, theta + 0.09);
  });

  // Ring 1 (R16 nodes - winners of R32)
  allR32Matches.forEach(m => {
    const theta = nodeAngles[m];
    // Placed at the same radius as node (295) but shifted clockwise to sit to the side of the circle
    html += makeNodeHtml(`circular-node-r16-${m}`, 295, theta, `openMatchDetails(${m})`, `Người thắng Trận #${m}`, `circular-score-r16-${m}`, 295, theta + 0.09);
  });

  // Ring 2 (QF nodes - winners of R16)
  const r16Ids = [90, 89, 94, 93, 91, 92, 96, 95];
  r16Ids.forEach(m => {
    const theta = nodeAngles[m];
    // Placed at the same radius as node (210) but shifted clockwise
    html += makeNodeHtml(`circular-node-qf-${m}`, 210, theta, `openMatchDetails(${m})`, `Người thắng Trận #${m}`, `circular-score-qf-${m}`, 210, theta + 0.12);
  });

  // Ring 3 (SF nodes - winners of QF)
  const qfIds = [97, 98, 99, 100];
  qfIds.forEach(m => {
    const theta = nodeAngles[m];
    // Placed at the same radius as node (135) but shifted clockwise
    html += makeNodeHtml(`circular-node-sf-${m}`, 135, theta, `openMatchDetails(${m})`, `Người thắng Trận #${m}`, `circular-score-sf-${m}`, 135, theta + 0.20);
  });

  // Ring 4 (Finalists - winners of SF)
  const sfIds = [101, 102];
  sfIds.forEach(m => {
    const theta = nodeAngles[m];
    // Placed at the same radius as node (75) but shifted clockwise
    html += makeNodeHtml(`circular-node-final-${m}`, 75, theta, `openMatchDetails(${m})`, `Người thắng Trận #${m}`, `circular-score-final-${m}`, 75, theta + 0.35);
  });

  // Center Winner node
  html += `
    <g class="circular-node circular-trophy-node" id="circular-node-winner-104" transform="translate(${cx}, ${cy})" onclick="openMatchDetails(104)">
      <title>Cúp Vàng World Cup 2026 - Click xem chi tiết trận Chung kết</title>
      <circle r="30" style="fill:rgba(201, 168, 76, 0.15); stroke:var(--gold); stroke-width:2px; filter:drop-shadow(0 0 15px rgba(201, 168, 76, 0.4));" />
      <text x="0" y="0" dominant-baseline="central" text-anchor="middle" font-size="34">🏆</text>
    </g>
  `;

  // Third Place Winner node
  html += `
    <g class="circular-node" id="circular-node-winner-103" transform="translate(${cx}, ${cy + 130})" onclick="openMatchDetails(103)">
      <title>Trận Tranh Hạng Ba - Click xem chi tiết</title>
      <circle r="18" style="stroke: #CD7F32; stroke-width: 1.5px;" />
      <text x="0" y="0" dominant-baseline="central" text-anchor="middle" font-size="20">🥉</text>
    </g>
  `;

  html += `</svg></div></div>`;
  container.innerHTML = html;
  initDraggableBracket();
}

function renderHorizontalBracketStructure() {
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
  if (currentBracketType === 'circular') {
    syncCircularBracketData();
  } else {
    cachedMatches.forEach(match => {
      const num = match.match_number;
      if (num >= 73 && num <= 104) {
        updateBracketMatchUI(match);
      }
    });
  }
}

function syncCircularBracketData() {
  if (cachedMatches.length === 0) return;

  const getTeamNameAndFlag = (matchNumber, teamType) => {
    const match = cachedMatches.find(m => m.match_number === matchNumber);
    if (!match) return { vi: "Chờ xác định", flag: "❓" };
    return getKnockoutTeamData(matchNumber, teamType, teamType === 'home' ? match.home_team?.country : match.away_team?.country);
  };

  const updateScoreBadge = (scoreId, text, sx, sy) => {
    const scoreText = document.getElementById(scoreId);
    const scoreRect = document.getElementById(`rect-${scoreId}`);
    
    if (!scoreText) return;
    
    if (text !== null && text !== undefined && text !== '') {
      scoreText.textContent = text;
      scoreText.style.display = 'block';
      
      if (scoreRect) {
        const charCount = String(text).length;
        const width = Math.max(14, charCount * 6 + 6);
        const height = 13;
        scoreRect.setAttribute('width', width);
        scoreRect.setAttribute('height', height);
        scoreRect.setAttribute('x', sx - width / 2);
        scoreRect.setAttribute('y', sy - height / 2);
        scoreRect.style.display = 'block';
      }
    } else {
      scoreText.style.display = 'none';
      if (scoreRect) scoreRect.style.display = 'none';
    }
  };

  // 1. Update R32 team nodes (Ring 0)
  cachedMatches.forEach(match => {
    const m = match.match_number;
    if (m >= 73 && m <= 88) {
      const homeInfo = getTeamNameAndFlag(m, 'home');
      const awayInfo = getTeamNameAndFlag(m, 'away');

      const homeNode = document.getElementById(`circular-node-r32-${m}-home`);
      const awayNode = document.getElementById(`circular-node-r32-${m}-away`);

      if (homeNode) {
        homeNode.querySelector('text').textContent = homeInfo.flag;
        homeNode.querySelector('title').textContent = homeInfo.vi;
      }
      if (awayNode) {
        awayNode.querySelector('text').textContent = awayInfo.flag;
        awayNode.querySelector('title').textContent = awayInfo.vi;
      }

      // Display R32 scores
      const scoreHomeText = document.getElementById(`circular-score-r32-${m}-home`);
      const scoreAwayText = document.getElementById(`circular-score-r32-${m}-away`);

      const isLive = match.status === 'in_progress';
      const isPlayed = match.status === 'completed' || isLive;

      if (scoreHomeText) {
        if (isPlayed) {
          const homeScore = match.home_team?.goals !== null ? match.home_team.goals : '0';
          let homePen = '';
          if (match.home_team?.penalties !== null && match.away_team?.penalties !== null) {
            homePen = `(${match.home_team.penalties})`;
          }
          const textVal = `${homeScore}${homePen}`;
          const sx = parseFloat(scoreHomeText.getAttribute('x'));
          const sy = parseFloat(scoreHomeText.getAttribute('y'));
          updateScoreBadge(`circular-score-r32-${m}-home`, textVal, sx, sy);
        } else {
          updateScoreBadge(`circular-score-r32-${m}-home`, null);
        }
      }
      if (scoreAwayText) {
        if (isPlayed) {
          const awayScore = match.away_team?.goals !== null ? match.away_team.goals : '0';
          let awayPen = '';
          if (match.home_team?.penalties !== null && match.away_team?.penalties !== null) {
            awayPen = `(${match.away_team.penalties})`;
          }
          const textVal = `${awayScore}${awayPen}`;
          const sx = parseFloat(scoreAwayText.getAttribute('x'));
          const sy = parseFloat(scoreAwayText.getAttribute('y'));
          updateScoreBadge(`circular-score-r32-${m}-away`, textVal, sx, sy);
        } else {
          updateScoreBadge(`circular-score-r32-${m}-away`, null);
        }
      }

      // Highlights
      homeNode?.classList.toggle('live', isLive);
      awayNode?.classList.toggle('live', isLive);
      const connHome = document.getElementById(`circular-connector-${m}-home`);
      const connAway = document.getElementById(`circular-connector-${m}-away`);
      if (connHome) connHome.classList.toggle('live', isLive);
      if (connAway) connAway.classList.toggle('live', isLive);

      const homeFav = isFavorite(homeInfo.vi);
      const awayFav = isFavorite(awayInfo.vi);
      homeNode?.classList.toggle('favorite', homeFav);
      awayNode?.classList.toggle('favorite', awayFav);
      
      if (match.status === 'completed' && match.winner) {
        const homeWinner = match.winner === match.home_team?.country;
        homeNode?.classList.toggle('winner', homeWinner);
        awayNode?.classList.toggle('winner', !homeWinner);
        if (connHome) connHome.classList.toggle('active', homeWinner);
        if (connAway) connAway.classList.toggle('active', !homeWinner);
      } else {
        if (connHome) connHome.classList.remove('active');
        if (connAway) connAway.classList.remove('active');
      }
    }
  });

  // 2. Helper to sync inner rings
  const syncInnerWinnerNode = (nodeId, scoreId, connectorId, matchNumber, teamCountry) => {
    const node = document.getElementById(nodeId);
    const scoreText = document.getElementById(scoreId);
    const connector = document.getElementById(connectorId);

    if (!node) return;

    if (!teamCountry || teamCountry.includes('Chờ xác định') || teamCountry.startsWith('Winner') || teamCountry.startsWith('Loser') || teamCountry.startsWith('Thắng') || teamCountry.startsWith('Thua')) {
      node.querySelector('text').textContent = '❓';
      node.querySelector('title').textContent = 'Chờ xác định';
      if (scoreText) {
        updateScoreBadge(scoreId, null);
      }
      if (connector) connector.classList.remove('active');
      return;
    }

    const teamInfo = formatTeamName(teamCountry);
    node.querySelector('text').textContent = teamInfo.flag;
    node.querySelector('title').textContent = teamInfo.vi;

    const isFav = isFavorite(teamInfo.vi);
    node.classList.toggle('favorite', isFav);

    const nextMatch = cachedMatches.find(m => m.match_number === matchNumber);
    if (nextMatch) {
      const isLive = nextMatch.status === 'in_progress';
      const isPlayed = nextMatch.status === 'completed' || isLive;
      node.classList.toggle('live', isLive);

      const isHomeInNext = nextMatch.home_team?.country === teamCountry;
      const side = isHomeInNext ? 'home' : 'away';
      const connElement = document.getElementById(`circular-connector-${matchNumber}-${side}`);

      if (connElement) {
        connElement.classList.toggle('live', isLive);
        
        if (nextMatch.status === 'completed' && nextMatch.winner) {
          const isWinner = nextMatch.winner === teamCountry;
          connElement.classList.toggle('active', isWinner);
        } else {
          connElement.classList.remove('active');
        }
      }

      if (scoreText) {
        if (isPlayed) {
          const isHome = nextMatch.home_team?.country === teamCountry;
          const teamObj = isHome ? nextMatch.home_team : nextMatch.away_team;
          const oppObj = isHome ? nextMatch.away_team : nextMatch.home_team;
          const goals = teamObj?.goals !== null ? teamObj.goals : '0';
          let pen = '';
          if (teamObj?.penalties !== null && oppObj?.penalties !== null) {
            pen = `(${teamObj.penalties})`;
          }
          const textVal = `${goals}${pen}`;
          const sx = parseFloat(scoreText.getAttribute('x'));
          const sy = parseFloat(scoreText.getAttribute('y'));
          updateScoreBadge(scoreId, textVal, sx, sy);
        } else {
          updateScoreBadge(scoreId, null);
        }
      }

      if (nextMatch.status === 'completed' && nextMatch.winner) {
        const isWinner = nextMatch.winner === teamCountry;
        node.classList.toggle('winner', isWinner);
        if (isWinner && connector) {
          connector.classList.add('active');
        } else if (connector) {
          connector.classList.remove('active');
        }
      } else {
        node.classList.remove('winner');
        if (connector) connector.classList.remove('active');
      }
    }
  };

  // Ring 1 (R16 Winners play in 90, 89, 94, 93, 91, 92, 96, 95)
  const ring1Mappings = [
    { m: 73, nextM: 90 }, { m: 75, nextM: 90 },
    { m: 74, nextM: 89 }, { m: 77, nextM: 89 },
    { m: 82, nextM: 94 }, { m: 81, nextM: 94 },
    { m: 84, nextM: 93 }, { m: 83, nextM: 93 },
    { m: 76, nextM: 91 }, { m: 78, nextM: 91 },
    { m: 79, nextM: 92 }, { m: 80, nextM: 92 },
    { m: 85, nextM: 96 }, { m: 87, nextM: 96 },
    { m: 88, nextM: 95 }, { m: 86, nextM: 95 }
  ];

  ring1Mappings.forEach(mapping => {
    const match = cachedMatches.find(m => m.match_number === mapping.m);
    const winnerCountry = (match && match.status === 'completed') ? match.winner : null;
    syncInnerWinnerNode(`circular-node-r16-${mapping.m}`, `circular-score-r16-${mapping.m}`, `circular-connector-${mapping.nextM}`, mapping.nextM, winnerCountry);
  });

  // Ring 2 (QF Winners play in 97, 98, 99, 100)
  const ring2Mappings = [
    { m: 90, nextM: 97 }, { m: 89, nextM: 97 },
    { m: 94, nextM: 98 }, { m: 93, nextM: 98 },
    { m: 91, nextM: 99 }, { m: 92, nextM: 99 },
    { m: 96, nextM: 100 }, { m: 95, nextM: 100 }
  ];

  ring2Mappings.forEach(mapping => {
    const match = cachedMatches.find(m => m.match_number === mapping.m);
    const winnerCountry = (match && match.status === 'completed') ? match.winner : null;
    syncInnerWinnerNode(`circular-node-qf-${mapping.m}`, `circular-score-qf-${mapping.m}`, `circular-connector-${mapping.nextM}`, mapping.nextM, winnerCountry);
  });

  // Ring 3 (SF Winners play in 101, 102)
  const ring3Mappings = [
    { m: 97, nextM: 101 }, { m: 98, nextM: 101 },
    { m: 99, nextM: 102 }, { m: 100, nextM: 102 }
  ];

  ring3Mappings.forEach(mapping => {
    const match = cachedMatches.find(m => m.match_number === mapping.m);
    const winnerCountry = (match && match.status === 'completed') ? match.winner : null;
    syncInnerWinnerNode(`circular-node-sf-${mapping.m}`, `circular-score-sf-${mapping.m}`, `circular-connector-${mapping.nextM}`, mapping.nextM, winnerCountry);
  });

  // Ring 4 (Finalists play in 104)
  const ring4Mappings = [
    { m: 101, nextM: 104 }, { m: 102, nextM: 104 }
  ];

  ring4Mappings.forEach(mapping => {
    const match = cachedMatches.find(m => m.match_number === mapping.m);
    const winnerCountry = (match && match.status === 'completed') ? match.winner : null;
    syncInnerWinnerNode(`circular-node-final-${mapping.m}`, `circular-score-final-${mapping.m}`, `circular-connector-104`, mapping.nextM, winnerCountry);
  });

  // Center Trophy node (Winner of Final: Match 104)
  const finalMatch = cachedMatches.find(m => m.match_number === 104);
  const trophyNode = document.getElementById('circular-node-winner-104');
  const finalHomeConnector = document.getElementById('circular-connector-104-home');
  const finalAwayConnector = document.getElementById('circular-connector-104-away');
  if (trophyNode) {
    const isLive = finalMatch && finalMatch.status === 'in_progress';
    trophyNode.classList.toggle('live', isLive);
    if (finalHomeConnector) finalHomeConnector.classList.toggle('live', isLive);
    if (finalAwayConnector) finalAwayConnector.classList.toggle('live', isLive);
    
    if (finalMatch && finalMatch.status === 'completed' && finalMatch.winner) {
      const isHomeWinner = finalMatch.winner === finalMatch.home_team?.country;
      if (finalHomeConnector) finalHomeConnector.classList.toggle('active', isHomeWinner);
      if (finalAwayConnector) finalAwayConnector.classList.toggle('active', !isHomeWinner);
      
      const winnerInfo = formatTeamName(finalMatch.winner);
      trophyNode.querySelector('text').textContent = winnerInfo.flag;
      trophyNode.querySelector('title').textContent = `🏆 VÔ ĐỊCH: ${winnerInfo.vi} (Click xem chi tiết trận Chung kết)`;
      trophyNode.querySelector('circle').style.fill = 'rgba(42, 245, 152, 0.15)';
      trophyNode.querySelector('circle').style.stroke = 'var(--accent2)';
    } else {
      if (finalHomeConnector) finalHomeConnector.classList.remove('active');
      if (finalAwayConnector) finalAwayConnector.classList.remove('active');
      trophyNode.querySelector('text').textContent = '🏆';
      trophyNode.querySelector('title').textContent = 'Cúp Vàng World Cup 2026 - Click xem chi tiết trận Chung kết';
      trophyNode.querySelector('circle').style.fill = 'rgba(201, 168, 76, 0.15)';
      trophyNode.querySelector('circle').style.stroke = 'var(--gold)';
    }
  }

  // Third Place Winner node (Winner of Match 103)
  const thirdMatch = cachedMatches.find(m => m.match_number === 103);
  const thirdNode = document.getElementById('circular-node-winner-103');
  if (thirdNode) {
    const isLive = thirdMatch && thirdMatch.status === 'in_progress';
    thirdNode.classList.toggle('live', isLive);
    
    if (thirdMatch && thirdMatch.status === 'completed' && thirdMatch.winner) {
      const thirdInfo = formatTeamName(thirdMatch.winner);
      thirdNode.querySelector('text').textContent = thirdInfo.flag;
      thirdNode.querySelector('title').textContent = `🥉 Hạng Ba: ${thirdInfo.vi} (Click xem chi tiết)`;
      thirdNode.querySelector('circle').style.stroke = '#CD7F32';
      thirdNode.classList.add('winner');
    } else {
      thirdNode.querySelector('text').textContent = '🥉';
      thirdNode.querySelector('title').textContent = 'Trận Tranh Hạng Ba - Click xem chi tiết';
      thirdNode.querySelector('circle').style.stroke = '#CD7F32';
      thirdNode.classList.remove('winner');
    }
  }
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
      match.away_team?.penalties !== null && match.away_team?.penalties !== undefined) {
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
  if (bracketWrapper && !bracketWrapper.classList.contains('hidden') && currentBracketType === 'horizontal') {
    drawConnectorLines();
  }
});

// ZOOM CONTROL FUNCTIONS
function zoomBracket(amount) {
  setZoomLevel(currentZoom + amount);
}

function resetZoomBracket() {
  let defaultZoom;
  if (currentBracketType === 'circular') {
    const viewWidth = window.innerWidth;
    if (viewWidth <= 768) {
      // Automatically fit the circular diagram within the screen width
      defaultZoom = Math.max(0.3, Math.min(1.0, (viewWidth - 20) / 900));
    } else {
      defaultZoom = 0.9;
    }
  } else {
    defaultZoom = window.innerWidth <= 768 ? 0.4 : 1.0;
  }
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
