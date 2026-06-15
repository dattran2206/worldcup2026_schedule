// CONFIGURATION & MATCH MAPS FOR FIFA WORLD CUP 2026 BRACKET
const BRACKET_MAP = {
  // Left Bracket Columns
  left: {
    r32: [73, 74, 75, 76, 77, 78, 79, 80],
    r16: [89, 90, 91, 92],
    qf: [97, 98],
    sf: [101]
  },
  // Right Bracket Columns
  right: {
    r32: [81, 82, 83, 84, 85, 86, 87, 88],
    r16: [93, 94, 95, 96],
    qf: [99, 100],
    sf: [102]
  },
  // Center Finals
  center: {
    third: 103,
    final: 104
  }
};

// SWITCH VIEW LOGIC
function switchView(viewType) {
  const listBtn = document.getElementById('listViewBtn');
  const bracketBtn = document.getElementById('bracketViewBtn');
  const scheduleContainer = document.getElementById('scheduleContainer');
  const groupsSection = document.getElementById('groupsSection');
  const bracketView = document.getElementById('bracketView');
  const groupPhaseHeader = document.getElementById('groupPhase');
  const knockoutPhaseHeader = document.getElementById('knockoutPhase');

  if (viewType === 'bracket') {
    listBtn.classList.remove('active');
    bracketBtn.classList.add('active');
    scheduleContainer.classList.add('hidden');
    groupsSection.classList.add('hidden');
    if (groupPhaseHeader) groupPhaseHeader.classList.add('hidden');
    if (knockoutPhaseHeader) knockoutPhaseHeader.classList.add('hidden');
    bracketView.classList.remove('hidden');
    
    // Draw tree structure if not drawn
    if (bracketView.innerHTML.trim() === '') {
      renderBracketStructure();
    }
    // Update live data to tree nodes
    syncRealtimeToBracket();
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
    } else {
      groupsSection.classList.remove('hidden');
    }
    
    bracketView.classList.add('hidden');
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

  let html = `<div class="bracket-container">`;

  // Helper to render columns of nodes
  const renderCol = (title, matchNumbers) => {
    let colHtml = `<div class="bracket-column">`;
    colHtml += `<div class="column-title">${title}</div>`;
    matchNumbers.forEach(num => {
      colHtml += `
        <div class="bracket-match-node" data-match-number="${num}" onclick="openMatchDetails(${num})">
          <div class="bracket-match-header">
            <span>Trận</span>
            <span class="match-num">#${num}</span>
          </div>
          <div class="bracket-team-line home">
            <div class="team-info">
              <span class="flag">❓</span>
              <span class="team-name">Chờ xác định</span>
            </div>
            <span class="team-score">-</span>
          </div>
          <div class="bracket-team-line away">
            <div class="team-info">
              <span class="flag">❓</span>
              <span class="team-name">Chờ xác định</span>
            </div>
            <span class="team-score">-</span>
          </div>
        </div>
      `;
    });
    colHtml += `</div>`;
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
  // Final Node
  html += `
    <div class="bracket-match-node" data-match-number="${BRACKET_MAP.center.final}" onclick="openMatchDetails(${BRACKET_MAP.center.final})" style="border: 2px solid var(--gold);">
      <div class="bracket-match-header" style="color:var(--gold)">
        <span>CHUNG KẾT</span>
        <span class="match-num">#${BRACKET_MAP.center.final}</span>
      </div>
      <div class="bracket-team-line home">
        <div class="team-info">
          <span class="flag">🏆</span>
          <span class="team-name">Chờ xác định</span>
        </div>
        <span class="team-score">-</span>
      </div>
      <div class="bracket-team-line away">
        <div class="team-info">
          <span class="flag">🏆</span>
          <span class="team-name">Chờ xác định</span>
        </div>
        <span class="team-score">-</span>
      </div>
    </div>
  `;
  // Third Place Node
  html += `
    <div class="bracket-match-node" data-match-number="${BRACKET_MAP.center.third}" onclick="openMatchDetails(${BRACKET_MAP.center.third})">
      <div class="bracket-match-header">
        <span>TRANH HẠNG BA</span>
        <span class="match-num">#${BRACKET_MAP.center.third}</span>
      </div>
      <div class="bracket-team-line home">
        <div class="team-info">
          <span class="flag">🥉</span>
          <span class="team-name">Chờ xác định</span>
        </div>
        <span class="team-score">-</span>
      </div>
      <div class="bracket-team-line away">
        <div class="team-info">
          <span class="flag">🥉</span>
          <span class="team-name">Chờ xác định</span>
        </div>
        <span class="team-score">-</span>
      </div>
    </div>
  `;
  html += `</div>`;

  // Render right bracket (in reverse column order)
  html += renderCol('Bán kết', BRACKET_MAP.right.sf);
  html += renderCol('Tứ kết', BRACKET_MAP.right.qf);
  html += renderCol('Vòng 16', BRACKET_MAP.right.r16);
  html += renderCol('Vòng 32', BRACKET_MAP.right.r32);

  html += `</div>`;
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

  const homeData = formatTeamName(match.home_team?.country);
  const awayData = formatTeamName(match.away_team?.country);

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
