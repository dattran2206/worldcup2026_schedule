// DỮ LIỆU ĐẠI DIỆN (PLACEHOLDERS) CHO CÁC TRẬN ĐẤU LOẠI TRỰC TIẾP & SƠ ĐỒ NHÁNH ĐẤU GIẢI ĐẤU
const KNOCKOUT_PLACEHOLDERS = {
  73: { home: "Nhì Bảng A", away: "Nhì Bảng B" },
  74: { home: "Nhất Bảng E", away: "Ba Bảng A/B/C/D/F" },
  75: { home: "Nhất Bảng F", away: "Nhì Bảng C" },
  76: { home: "Nhất Bảng C", away: "Nhì Bảng F" },
  77: { home: "Nhất Bảng I", away: "Ba Bảng C/D/F/G/H" },
  78: { home: "Nhì Bảng E", away: "Nhì Bảng I" },
  79: { home: "Nhất Bảng A", away: "Ba Bảng C/E/F/H/I" },
  80: { home: "Nhất Bảng L", away: "Ba Bảng E/H/I/J/K" },
  81: { home: "Nhất Bảng D", away: "Ba Bảng B/E/F/I/J" },
  82: { home: "Nhất Bảng G", away: "Ba Bảng A/E/H/I/J" },
  83: { home: "Nhì Bảng K", away: "Nhì Bảng L" },
  84: { home: "Nhất Bảng H", away: "Nhì Bảng J" },
  85: { home: "Nhất Bảng B", away: "Ba Bảng E/F/G/I/J" },
  86: { home: "Nhất Bảng J", away: "Nhì Bảng H" },
  87: { home: "Nhất Bảng K", away: "Ba Bảng D/E/I/J/L" },
  88: { home: "Nhì Bảng D", away: "Nhì Bảng G" },

  89: { home: "Thắng Trận 74", away: "Thắng Trận 77" },
  90: { home: "Thắng Trận 73", away: "Thắng Trận 75" },
  91: { home: "Thắng Trận 76", away: "Thắng Trận 78" },
  92: { home: "Thắng Trận 79", away: "Thắng Trận 80" },
  93: { home: "Thắng Trận 83", away: "Thắng Trận 84" },
  94: { home: "Thắng Trận 81", away: "Thắng Trận 82" },
  95: { home: "Thắng Trận 86", away: "Thắng Trận 88" },
  96: { home: "Thắng Trận 85", away: "Thắng Trận 87" },

  97: { home: "Thắng Trận 89", away: "Thắng Trận 90" },
  98: { home: "Thắng Trận 93", away: "Thắng Trận 94" },
  99: { home: "Thắng Trận 91", away: "Thắng Trận 92" },
  100: { home: "Thắng Trận 95", away: "Thắng Trận 96" },

  101: { home: "Thắng Trận 97", away: "Thắng Trận 98" },
  102: { home: "Thắng Trận 99", away: "Thắng Trận 100" },

  103: { home: "Thua Trận 101", away: "Thua Trận 102" },
  104: { home: "Thắng Trận 101", away: "Thắng Trận 102" }
};

function isGroupFinished(groupLetter) {
  if (!cachedMatches || cachedMatches.length === 0) return false;
  const groupMatches = cachedMatches.filter(m => m.match_number <= 72 && m.group === groupLetter);
  if (groupMatches.length < 6) return false;
  return groupMatches.every(m => m.status === 'completed');
}

function getGroupPositionTeam(groupLetter, positionNum) {
  const groupTeams = [];
  for (let key in teamsData) {
    if (teamsData[key].groupLetter === groupLetter) {
      groupTeams.push(teamsData[key]);
    }
  }
  if (groupTeams.length === 0) return null;
  sortGroupTeams(groupTeams, cachedMatches);
  return groupTeams[positionNum - 1] || null;
}

function resolveKnockoutPlaceholder(nameStr) {
  if (!nameStr) return null;

  // 1. Nhất/Nhì Bảng
  let groupLetter = null;
  let positionNum = null;

  const groupMatchVi = nameStr.match(/^(Nhất|Nhì)\s+Bảng\s+([A-L])$/i);
  if (groupMatchVi) {
    positionNum = groupMatchVi[1].toLowerCase() === "nhất" ? 1 : 2;
    groupLetter = groupMatchVi[2].toUpperCase();
  } else {
    const groupMatchEn1 = nameStr.match(/^Winner\s+Group\s+([A-L])$/i);
    if (groupMatchEn1) {
      positionNum = 1;
      groupLetter = groupMatchEn1[1].toUpperCase();
    } else {
      const groupMatchEn2 = nameStr.match(/^Runner-up\s+Group\s+([A-L])$/i);
      if (groupMatchEn2) {
        positionNum = 2;
        groupLetter = groupMatchEn2[1].toUpperCase();
      }
    }
  }

  if (groupLetter && positionNum) {
    if (isGroupFinished(groupLetter)) {
      const teamObj = getGroupPositionTeam(groupLetter, positionNum);
      if (teamObj) {
        return { vi: teamObj.nameVi, flag: teamObj.flag };
      }
    }
  }

  // 2. Thắng Trận
  let winMatchNum = null;
  const winMatchVi = nameStr.match(/^Thắng\s+Trận\s+(\d+)$/i);
  if (winMatchVi) {
    winMatchNum = parseInt(winMatchVi[1]);
  } else {
    const winMatchEn = nameStr.match(/^Winner\s+Match\s+(\d+)$/i);
    if (winMatchEn) {
      winMatchNum = parseInt(winMatchEn[1]);
    }
  }

  if (winMatchNum) {
    const targetMatch = cachedMatches.find(m => m.match_number === winMatchNum);
    if (targetMatch && targetMatch.status === 'completed') {
      let winnerCountry = null;
      if (targetMatch.winner && targetMatch.winner !== 'Draw') {
        winnerCountry = targetMatch.winner;
      } else {
        const homeG = targetMatch.home_team?.goals || 0;
        const awayG = targetMatch.away_team?.goals || 0;
        const homeP = targetMatch.home_team?.penalties || 0;
        const awayP = targetMatch.away_team?.penalties || 0;
        if (homeG + homeP > awayG + awayP) {
          winnerCountry = targetMatch.home_team?.country;
        } else if (awayG + awayP > homeG + homeP) {
          winnerCountry = targetMatch.away_team?.country;
        }
      }
      if (winnerCountry) {
        return formatTeamName(winnerCountry);
      }
    }
  }

  // 3. Thua Trận
  let loseMatchNum = null;
  const loseMatchVi = nameStr.match(/^Thua\s+Trận\s+(\d+)$/i);
  if (loseMatchVi) {
    loseMatchNum = parseInt(loseMatchVi[1]);
  } else {
    const loseMatchEn = nameStr.match(/^Loser\s+Match\s+(\d+)$/i);
    if (loseMatchEn) {
      loseMatchNum = parseInt(loseMatchEn[1]);
    }
  }

  if (loseMatchNum) {
    const targetMatch = cachedMatches.find(m => m.match_number === loseMatchNum);
    if (targetMatch && targetMatch.status === 'completed') {
      let winnerCountry = null;
      if (targetMatch.winner && targetMatch.winner !== 'Draw') {
        winnerCountry = targetMatch.winner;
      } else {
        const homeG = targetMatch.home_team?.goals || 0;
        const awayG = targetMatch.away_team?.goals || 0;
        const homeP = targetMatch.home_team?.penalties || 0;
        const awayP = targetMatch.away_team?.penalties || 0;
        if (homeG + homeP > awayG + awayP) {
          winnerCountry = targetMatch.home_team?.country;
        } else if (awayG + awayP > homeG + homeP) {
          winnerCountry = targetMatch.away_team?.country;
        }
      }
      if (winnerCountry) {
        const homeCountry = targetMatch.home_team?.country;
        const awayCountry = targetMatch.away_team?.country;
        const loserCountry = (winnerCountry === homeCountry) ? awayCountry : homeCountry;
        if (loserCountry) {
          return formatTeamName(loserCountry);
        }
      }
    }
  }

  return null;
}

function getKnockoutTeamData(matchNumber, position, countryName) {
  const formatted = formatTeamName(countryName);
  const isPlaceholder = !countryName ||
    formatted.vi === "Chờ xác định" ||
    formatted.vi.startsWith("Thắng Trận") ||
    formatted.vi.startsWith("Thua Trận") ||
    formatted.vi.startsWith("Nhất Bảng") ||
    formatted.vi.startsWith("Nhì Bảng");

  if (isPlaceholder) {
    // Thử lấy label trực tiếp từ API match object trong cachedMatches trước
    const apiMatch = cachedMatches.find(m => m.match_number === matchNumber);
    if (apiMatch) {
      const apiTeam = position === 'home' ? apiMatch.home_team : apiMatch.away_team;
      if (apiTeam && apiTeam.label) {
        const formattedLabel = formatTeamName(apiTeam.label);
        const resolved = resolveKnockoutPlaceholder(formattedLabel.vi);
        if (resolved) {
          return resolved;
        }
      }
    }

    // Fallback 1: nếu countryName là placeholder, thử giải quyết trực tiếp
    if (countryName) {
      const resolved = resolveKnockoutPlaceholder(formatted.vi);
      if (resolved) {
        return resolved;
      }
    }

    // Fallback 2: nếu không giải quyết được, dùng default từ KNOCKOUT_PLACEHOLDERS
    const defaults = KNOCKOUT_PLACEHOLDERS[matchNumber];
    if (defaults) {
      const defaultName = position === 'home' ? defaults.home : defaults.away;

      const resolvedDefault = resolveKnockoutPlaceholder(defaultName);
      if (resolvedDefault) {
        return resolvedDefault;
      }

      let defaultFlag = "❓";
      if (defaultName.startsWith("Nhất Bảng")) defaultFlag = "🥇";
      else if (defaultName.startsWith("Nhì Bảng")) defaultFlag = "🥈";
      else if (defaultName.startsWith("Ba Bảng")) defaultFlag = "🥉";
      else if (defaultName.startsWith("Thắng Trận")) defaultFlag = "🏆";
      else if (defaultName.startsWith("Thua Trận")) defaultFlag = "🥉";

      return { vi: defaultName, flag: defaultFlag };
    }
  }
  return formatted;
}

// BỘ NHỚ ĐỆM TOÀN CỤC LƯU TRỮ DANH SÁCH CÁC TRẬN ĐẤU (Dùng cho Modal chi tiết trận đấu)
let cachedMatches = [];

// HỆ THỐNG QUẢN LÝ ĐỘI TUYỂN YÊU THÍCH (Lưu trữ trong localStorage của trình duyệt)
let favoriteTeams = JSON.parse(localStorage.getItem('favTeams') || '[]');

function updateFavCount() {
  const badge = document.getElementById('favCount');
  if (badge) {
    badge.innerText = favoriteTeams.length > 0 ? favoriteTeams.length : '';
  }
}

function isFavorite(teamName) {
  return favoriteTeams.includes(cleanTeamName(teamName));
}

function toggleFavorite(teamName, event) {
  if (event) {
    event.stopPropagation();
    const star = event.currentTarget;
    star.classList.add('pop');
    setTimeout(() => star.classList.remove('pop'), 400);
  }

  const name = cleanTeamName(teamName);
  if (!name || name.includes("Chờ xác định") || name.includes("Thắng Trận") || name.includes("Thua Trận") || name.includes("Nhất Bảng") || name.includes("Nhì Bảng")) return;

  const index = favoriteTeams.indexOf(name);
  if (index > -1) {
    favoriteTeams.splice(index, 1);
  } else {
    favoriteTeams.push(name);
  }

  localStorage.setItem('favTeams', JSON.stringify(favoriteTeams));
  updateFavCount();
  updateStars();

  const activeBtn = document.querySelector('.filter-btn.active');
  if (activeBtn && activeBtn.id === 'favFilterBtn') {
    const searchInput = document.getElementById('searchInput');
    searchTeam(searchInput ? searchInput.value : '');
  }
}

function updateStars() {
  document.querySelectorAll('.fav-star').forEach(star => {
    const teamName = star.dataset.team;
    if (teamName) {
      const isFav = isFavorite(teamName);
      star.classList.toggle('active', isFav);
      star.innerText = isFav ? '★' : '☆';
    }
  });

  // Làm nổi bật (highlight) thẻ trận đấu của các đội tuyển nằm trong danh sách yêu thích
  document.querySelectorAll('.match-card, .ko-match').forEach(card => {
    const hasFavStar = card.querySelector('.fav-star.active') !== null;
    card.classList.toggle('favorite-highlight', hasFavStar);
  });
}

// BỘ ĐIỀU KHIỂN HIỂN THỊ DANH SÁCH VUA PHÁ LƯỚI
function toggleScorers() {
  openScorersModal();
}

function renderScorers() {
  const content = document.getElementById('scorersContent');
  if (!content) return;

  if (topScorers.length === 0) {
    content.innerHTML = `
        <div class="no-data-msg">
          <span class="icon">🏆</span>
          <strong>Chưa có dữ liệu bàn thắng cho giải đấu 2026.</strong>
          <p style="margin-top:8px; font-size:12px; color:var(--text-muted);">Số liệu thống kê bàn thắng sẽ tự động cập nhật ngay khi các trận đấu chính thức diễn ra và có bàn thắng được ghi!</p>
        </div>
      `;
    return;
  }

  let html = `<div class="scorers-grid">`;
  const displayed = topScorers.slice(0, 24);
  let currentRank = 0;
  let previousGoals = -1;
  displayed.forEach((s, idx) => {
    if (s.goals !== previousGoals) {
      currentRank++;
      previousGoals = s.goals;
    }
    const rankClass = currentRank === 1 ? 'top-1' : currentRank === 2 ? 'top-2' : currentRank === 3 ? 'top-3' : '';

    html += `
        <div class="scorer-card ${rankClass}">
          <div class="scorer-rank">#${currentRank}</div>
          <div class="scorer-avatar" style="background: radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(0, 0, 0, 0.4) 100%); display: flex; align-items: center; justify-content: center; user-select: none;">
            ${s.flag || '⚽'}
          </div>
          <div class="scorer-info">
            <div class="scorer-name">${s.name}</div>
            <div class="scorer-team">${s.flag || '⚽'} ${s.teamVi}</div>
          </div>
          <div class="scorer-stats">
            <div class="scorer-goals">${s.goals}</div>
            <div class="scorer-goals-label">Bàn thắng</div>
          </div>
        </div>
      `;
  });
  html += `</div>`;
  content.innerHTML = html;
}

// BẢNG XẾP HẠNG ĐỘNG CỦA 12 BẢNG ĐẤU WORLD CUP 2026
let teamsData = {};
let topScorers = [];

function initialize2026Teams() {
  teamsData = {};
  document.querySelectorAll('.group-card').forEach(card => {
    const h3 = card.querySelector('h3');
    if (!h3) return;
    const groupLetter = h3.innerText.replace('BẢNG', '').trim();

    card.querySelectorAll('li').forEach(li => {
      const flagSpan = li.querySelector('.flag');
      const nameSpan = li.querySelector('span:not(.flag)');
      if (nameSpan) {
        const teamVi = nameSpan.innerText.trim();
        const teamFlag = flagSpan ? flagSpan.innerText.trim() : '';
        teamsData[teamVi.toLowerCase()] = {
          nameVi: teamVi,
          flag: teamFlag,
          groupLetter: groupLetter,
          games_played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goals_for: 0,
          goals_against: 0,
          goal_differential: 0,
          group_points: 0
        };
      }
    });
  });
}

function calculate2026StandingsAndScorers(matches) {
  // Khởi tạo lại tất cả thông số thống kê về 0 trước khi tính toán lại
  for (let key in teamsData) {
    const t = teamsData[key];
    t.games_played = 0;
    t.wins = 0;
    t.draws = 0;
    t.losses = 0;
    t.goals_for = 0;
    t.goals_against = 0;
    t.goal_differential = 0;
    t.group_points = 0;
  }

  const scorerMap = {};

  matches.forEach(match => {
    const isGroupMatch = match.match_number <= 72;
    const homeCountry = match.home_team?.country;
    const awayCountry = match.away_team?.country;

    if (!homeCountry || !awayCountry) return;

    const homeNameData = formatTeamName(homeCountry);
    const awayNameData = formatTeamName(awayCountry);

    const homeKey = homeNameData.vi.toLowerCase();
    const awayKey = awayNameData.vi.toLowerCase();

    const homeTeam = teamsData[homeKey];
    const awayTeam = teamsData[awayKey];

    if (match.status !== 'future_scheduled' && match.status !== 'future') {
      const homeGoals = match.home_team.goals !== null ? parseInt(match.home_team.goals) : 0;
      const awayGoals = match.away_team.goals !== null ? parseInt(match.away_team.goals) : 0;

      if (isGroupMatch) {
        if (homeTeam) {
          homeTeam.games_played += 1;
          homeTeam.goals_for += homeGoals;
          homeTeam.goals_against += awayGoals;
          homeTeam.goal_differential = homeTeam.goals_for - homeTeam.goals_against;
        }
        if (awayTeam) {
          awayTeam.games_played += 1;
          awayTeam.goals_for += awayGoals;
          awayTeam.goals_against += homeGoals;
          awayTeam.goal_differential = awayTeam.goals_for - awayTeam.goals_against;
        }

        if (homeGoals > awayGoals) {
          if (homeTeam) { homeTeam.wins += 1; homeTeam.group_points += 3; }
          if (awayTeam) { awayTeam.losses += 1; }
        } else if (homeGoals < awayGoals) {
          if (awayTeam) { awayTeam.wins += 1; awayTeam.group_points += 3; }
          if (homeTeam) { homeTeam.losses += 1; }
        } else {
          if (homeTeam) { homeTeam.draws += 1; homeTeam.group_points += 1; }
          if (awayTeam) { awayTeam.draws += 1; awayTeam.group_points += 1; }
        }
      }

      const parseEvents = (events, teamVi, flag) => {
        if (!events) return;
        events.forEach(e => {
          if (e.type_of_event === 'goal' || e.type_of_event === 'goal-penalty') {
            const player = e.player || 'Vô danh';
            if (!scorerMap[player]) {
              scorerMap[player] = { name: player, teamVi: teamVi, flag: flag, goals: 0 };
            }
            scorerMap[player].goals += 1;
          }
        });
      };

      parseEvents(match.home_team_events, homeNameData.vi, homeNameData.flag);
      parseEvents(match.away_team_events, awayNameData.vi, awayNameData.flag);
    }
  });

  topScorers = Object.values(scorerMap);
  topScorers.sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    return a.name.localeCompare(b.name, 'vi');
  });
}

function getH2HStats(tiedTeamKeys, matches) {
  const h2h = {};
  tiedTeamKeys.forEach(key => {
    h2h[key] = { points: 0, gd: 0, gs: 0 };
  });

  if (!matches || matches.length === 0) return h2h;

  matches.forEach(match => {
    const isGroupMatch = match.match_number <= 72;
    if (!isGroupMatch || match.status === 'future' || match.status === 'future_scheduled') return;

    const homeCountry = match.home_team?.country;
    const awayCountry = match.away_team?.country;
    if (!homeCountry || !awayCountry) return;

    const homeKey = formatTeamName(homeCountry).vi.toLowerCase();
    const awayKey = formatTeamName(awayCountry).vi.toLowerCase();

    if (tiedTeamKeys.includes(homeKey) && tiedTeamKeys.includes(awayKey)) {
      const homeGoals = match.home_team.goals !== null ? parseInt(match.home_team.goals) : 0;
      const awayGoals = match.away_team.goals !== null ? parseInt(match.away_team.goals) : 0;

      h2h[homeKey].gs += homeGoals;
      h2h[awayKey].gs += awayGoals;

      h2h[homeKey].gd += (homeGoals - awayGoals);
      h2h[awayKey].gd += (awayGoals - homeGoals);

      if (homeGoals > awayGoals) {
        h2h[homeKey].points += 3;
      } else if (homeGoals < awayGoals) {
        h2h[awayKey].points += 3;
      } else {
        h2h[homeKey].points += 1;
        h2h[awayKey].points += 1;
      }
    }
  });

  return h2h;
}

function sortGroupTeams(teams, matches) {
  teams.sort((a, b) => {
    // 1. So sánh Điểm số
    if (b.group_points !== a.group_points) {
      return b.group_points - a.group_points;
    }

    // 2, 3, 4: Chỉ số Đối đầu trực tiếp (Head-to-Head) đối với các đội bằng điểm
    const tiedTeams = teams.filter(t => t.group_points === a.group_points);
    if (tiedTeams.length > 1 && matches && matches.length > 0) {
      const h2h = getH2HStats(tiedTeams.map(t => t.nameVi.toLowerCase()), matches);
      const keyA = a.nameVi.toLowerCase();
      const keyB = b.nameVi.toLowerCase();

      // So sánh điểm đối đầu trực tiếp
      const ptsA = h2h[keyA]?.points || 0;
      const ptsB = h2h[keyB]?.points || 0;
      if (ptsB !== ptsA) return ptsB - ptsA;

      // So sánh hiệu số bàn thắng bại đối đầu trực tiếp
      const gdA = h2h[keyA]?.gd || 0;
      const gdB = h2h[keyB]?.gd || 0;
      if (gdB !== gdA) return gdB - gdA;

      // So sánh số bàn ghi được trong đối đầu trực tiếp
      const gsA = h2h[keyA]?.gs || 0;
      const gsB = h2h[keyB]?.gs || 0;
      if (gsB !== gsA) return gsB - gsA;
    }

    // 5. So sánh Hiệu số bàn thắng bại tổng thể trong bảng đấu
    if (b.goal_differential !== a.goal_differential) {
      return b.goal_differential - a.goal_differential;
    }

    // 6. So sánh Tổng số bàn thắng ghi được trong bảng đấu
    if (b.goals_for !== a.goals_for) {
      return b.goals_for - a.goals_for;
    }

    // 7. Sắp xếp theo Thứ tự bảng chữ cái tiếng Việt của tên đội tuyển
    return a.nameVi.localeCompare(b.nameVi, 'vi');
  });
}

function compareThirdPlaceRecords(r1, r2) {
  if (r1.points !== r2.points) {
    return r2.points - r1.points;
  }
  if (r1.gd !== r2.gd) {
    return r2.gd - r1.gd;
  }
  if (r1.gs !== r2.gs) {
    return r2.gs - r1.gs;
  }
  return r1.nameVi.localeCompare(r2.nameVi, 'vi');
}

function getSimulatedH2HPoints(keys, matches) {
  const h2h = {};
  keys.forEach(k => h2h[k] = 0);
  matches.forEach(m => {
    const homeName = formatTeamName(m.home_team?.country).vi;
    const awayName = formatTeamName(m.away_team?.country).vi;
    if (!homeName || !awayName) return;
    const hKey = homeName.toLowerCase();
    const aKey = awayName.toLowerCase();
    if (keys.includes(hKey) && keys.includes(aKey)) {
      if (m.status !== 'future_scheduled' && m.status !== 'future' && m.status !== 'simulated') {
        const hGoals = m.home_team.goals !== null ? parseInt(m.home_team.goals) : 0;
        const aGoals = m.away_team.goals !== null ? parseInt(m.away_team.goals) : 0;
        if (hGoals > aGoals) h2h[hKey] += 3;
        else if (hGoals < aGoals) h2h[aKey] += 3;
        else { h2h[hKey] += 1; h2h[aKey] += 1; }
      } else if (m.status === 'simulated') {
        if (m.simulatedOutcome === 0) h2h[hKey] += 3;
        else if (m.simulatedOutcome === 2) h2h[aKey] += 3;
        else { h2h[hKey] += 1; h2h[aKey] += 1; }
      }
    }
  });
  return h2h;
}

function resolveTies(tiedTeams, simulatedMatches, targetTeamVi) {
  if (tiedTeams.length <= 1) return tiedTeams;

  const keys = tiedTeams.map(t => t.nameVi.toLowerCase());
  const h2hPoints = getSimulatedH2HPoints(keys, simulatedMatches);

  const uniqueH2HPts = new Set(tiedTeams.map(t => h2hPoints[t.nameVi.toLowerCase()]));
  if (uniqueH2HPts.size > 1) {
    const grouped = {};
    tiedTeams.forEach(t => {
      const pts = h2hPoints[t.nameVi.toLowerCase()];
      if (!grouped[pts]) grouped[pts] = [];
      grouped[pts].push(t);
    });
    const sortedPts = Object.keys(grouped).map(Number).sort((a, b) => b - a);
    let result = [];
    sortedPts.forEach(pts => {
      result = result.concat(resolveTies(grouped[pts], simulatedMatches, targetTeamVi));
    });
    return result;
  }

  if (targetTeamVi) {
    const targetTeam = tiedTeams.find(t => t.nameVi === targetTeamVi);
    if (targetTeam) {
      const anyHasRemaining = tiedTeams.some(t => t.hasRemaining);
      if (anyHasRemaining) {
        const otherTeams = tiedTeams.filter(t => t.nameVi !== targetTeamVi);
        otherTeams.sort((a, b) => {
          if (b.gd !== a.gd) return b.gd - a.gd;
          if (b.gs !== a.gs) return b.gs - a.gs;
          return a.nameVi.localeCompare(b.nameVi, 'vi');
        });
        return [targetTeam, ...otherTeams];
      }
    }
  }

  tiedTeams.sort((a, b) => {
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gs !== a.gs) return b.gs - a.gs;
    return a.nameVi.localeCompare(b.nameVi, 'vi');
  });
  return tiedTeams;
}

function getStandingsInSimulation(groupTeams, simulatedMatches, targetTeamVi) {
  const grouped = {};
  groupTeams.forEach(t => {
    if (!grouped[t.points]) grouped[t.points] = [];
    grouped[t.points].push(t);
  });
  const sortedPts = Object.keys(grouped).map(Number).sort((a, b) => b - a);
  let standings = [];
  sortedPts.forEach(pts => {
    standings = standings.concat(resolveTies(grouped[pts], simulatedMatches, targetTeamVi));
  });
  return standings;
}

function getStandingsStandard(groupTeams, simulatedMatches) {
  const grouped = {};
  groupTeams.forEach(t => {
    if (!grouped[t.points]) grouped[t.points] = [];
    grouped[t.points].push(t);
  });
  const sortedPts = Object.keys(grouped).map(Number).sort((a, b) => b - a);
  let standings = [];
  sortedPts.forEach(pts => {
    standings = standings.concat(resolveTies(grouped[pts], simulatedMatches, null));
  });
  return standings;
}

function renderAllStandingsTables() {
  const groups = {};
  for (let key in teamsData) {
    const t = teamsData[key];
    if (!groups[t.groupLetter]) {
      groups[t.groupLetter] = [];
    }
    groups[t.groupLetter].push(t);
  }

  // Đầu tiên, sắp xếp các đội tuyển trong từng bảng đấu theo các tiêu chí xếp hạng chính thức của FIFA
  for (let letter in groups) {
    sortGroupTeams(groups[letter], cachedMatches);
  }

  // Kiểm tra xem đã có trận đấu nào trong giải đấu được diễn ra hay chưa
  const anyMatchPlayed = Object.values(teamsData).some(t => t.games_played > 0);

  // Thu thập danh sách các đội xếp thứ 3 ở tất cả 12 bảng đấu để tiến hành xếp hạng so sánh toàn cục
  const thirdPlacedTeams = [];
  for (let letter in groups) {
    const teamsInGroup = groups[letter];
    if (teamsInGroup.length >= 3) {
      thirdPlacedTeams.push(teamsInGroup[2]);
    }
  }

  // Sắp xếp các đội đứng thứ 3 dựa trên tiêu chí so sánh (Điểm số, Hiệu số, Số bàn thắng ghi được)
  thirdPlacedTeams.sort((a, b) => {
    if (b.group_points !== a.group_points) return b.group_points - a.group_points;
    if (b.goal_differential !== a.goal_differential) return b.goal_differential - a.goal_differential;
    if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
    return a.nameVi.localeCompare(b.nameVi, 'vi');
  });

  const qualifyingThirdNames = new Set(
    thirdPlacedTeams.slice(0, 8).map(t => t.nameVi.toLowerCase())
  );

  const eliminatedTeamNames = new Set();

  if (anyMatchPlayed) {
    const teamsHasRemaining = {};
    for (let key in teamsData) {
      const t = teamsData[key];
      const teamVi = t.nameVi;
      teamsHasRemaining[teamVi] = cachedMatches.some(m =>
        m.match_number <= 72 &&
        (m.status === 'future_scheduled' || m.status === 'future') &&
        (formatTeamName(m.home_team?.country).vi === teamVi || formatTeamName(m.away_team?.country).vi === teamVi)
      );
    }

    const groupMatchesMap = {};
    for (let letter in groups) {
      groupMatchesMap[letter] = [];
    }
    cachedMatches.forEach(match => {
      if (match.match_number <= 72) {
        const homeName = formatTeamName(match.home_team?.country).vi;
        const tObj = teamsData[homeName.toLowerCase()];
        if (tObj) {
          groupMatchesMap[tObj.groupLetter].push(match);
        }
      }
    });

    const worstThirdRecordOfGroup = {};
    const targetTeamBestRank = {};
    const targetTeamBestThird = {};

    function generateScenarios(u) {
      const results = [];
      function recurse(current, depth) {
        if (depth === u) {
          results.push([...current]);
          return;
        }
        for (let i = 0; i < 3; i++) {
          current.push(i);
          recurse(current, depth + 1);
          current.pop();
        }
      }
      recurse([], 0);
      return results;
    }

    for (let letter in groups) {
      const teamsInGroup = groups[letter];
      const matchesInGroup = groupMatchesMap[letter];
      const unplayed = matchesInGroup.filter(m => m.status === 'future_scheduled' || m.status === 'future');

      const groupTeamsBase = teamsInGroup.map(t => ({
        nameVi: t.nameVi,
        group_points: t.group_points,
        goal_differential: t.goal_differential,
        goals_for: t.goals_for,
        hasRemaining: teamsHasRemaining[t.nameVi] || false
      }));

      if (unplayed.length === 0) {
        const simulatedTeams = groupTeamsBase.map(t => ({
          nameVi: t.nameVi,
          points: t.group_points,
          gd: t.goal_differential,
          gs: t.goals_for,
          hasRemaining: false
        }));
        const stdStandings = getStandingsStandard(simulatedTeams, matchesInGroup);
        const thirdTeam = stdStandings[2];
        worstThirdRecordOfGroup[letter] = {
          points: thirdTeam.points,
          gd: thirdTeam.gd,
          gs: thirdTeam.gs,
          nameVi: thirdTeam.nameVi
        };
        groupTeamsBase.forEach(t => {
          const tKey = t.nameVi;
          const targetStandings = getStandingsInSimulation(simulatedTeams, matchesInGroup, tKey);
          const rank = targetStandings.findIndex(st => st.nameVi === tKey);
          targetTeamBestRank[tKey] = rank;
          if (rank === 2) {
            targetTeamBestThird[tKey] = {
              points: targetStandings[rank].points,
              gd: targetStandings[rank].gd,
              gs: targetStandings[rank].gs,
              nameVi: tKey
            };
          }
        });
      } else {
        const scenarios = generateScenarios(unplayed.length);
        let worstThirdRecord = null;

        scenarios.forEach(scenario => {
          const simTeamsMap = {};
          groupTeamsBase.forEach(t => {
            simTeamsMap[t.nameVi.toLowerCase()] = {
              nameVi: t.nameVi,
              points: t.group_points,
              gd: t.goal_differential,
              gs: t.goals_for,
              hasRemaining: t.hasRemaining
            };
          });

          const groupMatchesWithOutcomes = matchesInGroup.map(m => {
            const unplayedIdx = unplayed.indexOf(m);
            if (unplayedIdx !== -1) {
              return {
                ...m,
                status: 'simulated',
                simulatedOutcome: scenario[unplayedIdx]
              };
            }
            return m;
          });

          unplayed.forEach((match, idx) => {
            const outcome = scenario[idx];
            const hKey = formatTeamName(match.home_team?.country).vi.toLowerCase();
            const aKey = formatTeamName(match.away_team?.country).vi.toLowerCase();
            const hTeam = simTeamsMap[hKey];
            const aTeam = simTeamsMap[aKey];

            if (outcome === 0) {
              hTeam.points += 3;
              hTeam.gd += 1;
              hTeam.gs += 1;
              aTeam.gd -= 1;
            } else if (outcome === 2) {
              aTeam.points += 3;
              aTeam.gd += 1;
              aTeam.gs += 1;
              hTeam.gd -= 1;
            } else {
              hTeam.points += 1;
              aTeam.points += 1;
            }
          });

          const simTeamsList = Object.values(simTeamsMap);

          const stdStandings = getStandingsStandard(simTeamsList, groupMatchesWithOutcomes);
          const thirdTeamStd = stdStandings[2];
          const thirdRecordStd = {
            points: thirdTeamStd.points,
            gd: thirdTeamStd.hasRemaining ? -100 : thirdTeamStd.gd,
            gs: thirdTeamStd.hasRemaining ? 0 : thirdTeamStd.gs,
            nameVi: thirdTeamStd.nameVi
          };
          if (!worstThirdRecord || compareThirdPlaceRecords(thirdRecordStd, worstThirdRecord) > 0) {
            worstThirdRecord = thirdRecordStd;
          }

          groupTeamsBase.forEach(targetTeam => {
            const tKey = targetTeam.nameVi;
            const targetStandings = getStandingsInSimulation(simTeamsList, groupMatchesWithOutcomes, tKey);
            const rank = targetStandings.findIndex(st => st.nameVi === tKey);

            targetTeamBestRank[tKey] = Math.min(targetTeamBestRank[tKey] !== undefined ? targetTeamBestRank[tKey] : 4, rank);
            if (rank === 2) {
              const teamInfo = targetStandings[rank];
              const record = {
                points: teamInfo.points,
                gd: teamInfo.hasRemaining ? 100 : teamInfo.gd,
                gs: teamInfo.hasRemaining ? 100 : teamInfo.gs,
                nameVi: tKey
              };
              if (!targetTeamBestThird[tKey] || compareThirdPlaceRecords(record, targetTeamBestThird[tKey]) < 0) {
                targetTeamBestThird[tKey] = record;
              }
            }
          });
        });

        worstThirdRecordOfGroup[letter] = worstThirdRecord;
      }
    }

    for (let key in teamsData) {
      const t = teamsData[key];
      const teamVi = t.nameVi;
      const bestRank = targetTeamBestRank[teamVi];

      if (bestRank === undefined || bestRank === 3) {
        eliminatedTeamNames.add(teamVi.toLowerCase());
      } else if (bestRank === 2) {
        const bestThird = targetTeamBestThird[teamVi];
        let countBetterOrEqual = 0;
        for (let letter in worstThirdRecordOfGroup) {
          if (letter === t.groupLetter) continue;
          const otherWorst = worstThirdRecordOfGroup[letter];
          if (compareThirdPlaceRecords(bestThird, otherWorst) <= 0) {
            countBetterOrEqual++;
          }
        }
        if (countBetterOrEqual < 4) {
          eliminatedTeamNames.add(teamVi.toLowerCase());
        }
      }
    }
  }

  for (let letter in groups) {
    const teamsInGroup = groups[letter];
    const card = Array.from(document.querySelectorAll('.group-card')).find(c => {
      const h3 = c.querySelector('h3');
      return h3 && h3.innerText.includes(`BẢNG ${letter}`);
    });
    if (!card) continue;

    let html = `
        <h3>BẢNG ${letter}</h3>
        <table>
          <thead>
            <tr>
              <th class="team-col">Đội</th>
              <th>Tr</th>
              <th>H/S</th>
              <th class="pts-col">Đ</th>
            </tr>
          </thead>
          <tbody>
      `;

    teamsInGroup.forEach((t, i) => {
      const teamVi = t.nameVi;
      const teamFlag = t.flag;
      const isFav = isFavorite(teamVi);

      let rowClass = '';
      if (eliminatedTeamNames.has(teamVi.toLowerCase())) {
        rowClass = 'eliminated';
      } else if (i < 2) {
        rowClass = 'qualify';
      } else if (i === 2) {
        if (anyMatchPlayed) {
          rowClass = qualifyingThirdNames.has(teamVi.toLowerCase()) ? 'qualify-3rd' : '';
        } else {
          rowClass = ''; // neutral before tournament starts
        }
      } else {
        rowClass = '';
      }

      html += `
          <tr class="${rowClass}">
            <td class="team-col" onclick="clickTeam('${teamVi}')" style="cursor:pointer;">
              <span class="fav-star ${isFav ? 'active' : ''}" data-team="${teamVi}" onclick="toggleFavorite('${teamVi}', event)">${isFav ? '★' : '☆'}</span>
              <span class="flag">${teamFlag}</span>
              <span class="team-name" title="${teamVi}">${teamVi}</span>
            </td>
            <td>${t.games_played}</td>
            <td>${t.goal_differential > 0 ? '+' : ''}${t.goal_differential}</td>
            <td class="pts-cell">${t.group_points}</td>
          </tr>
        `;
    });

    html += `
          </tbody>
        </table>
      `;
    card.innerHTML = html;
  }
}

function fetchStandings() {
  // initialize from the HTML static lists first (with all 0 stats)
  initialize2026Teams();
  renderAllStandingsTables();
}

// FILTERING LOGIC
function filterPhase(phase) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));

  if (window.event && window.event.currentTarget) {
    window.event.currentTarget.classList.add('active');
  } else if (window.event && window.event.target) {
    const btn = window.event.target.closest('.filter-btn');
    if (btn) btn.classList.add('active');
  }

  const groupPhase = document.getElementById('groupPhase');
  const knockoutPhase = document.getElementById('knockoutPhase');

  if (phase === 'group') {
    groupPhase.classList.remove('hidden');
    knockoutPhase.classList.add('hidden');
  } else if (phase === 'knockout' || phase.startsWith('ko-')) {
    groupPhase.classList.add('hidden');
    knockoutPhase.classList.remove('hidden');
  } else if (phase === 'favorites') {
    groupPhase.classList.add('hidden');
    knockoutPhase.classList.add('hidden');
  } else {
    groupPhase.classList.remove('hidden');
    knockoutPhase.classList.remove('hidden');
  }

  const searchInput = document.getElementById('searchInput');
  searchTeam(searchInput ? searchInput.value : '');
}

function searchTeam(val) {
  const q = val.toLowerCase().trim();

  const wrap = document.querySelector('.search-wrap');
  if (wrap) {
    wrap.classList.toggle('has-input', q.length > 0);
  }

  const filterStatus = document.getElementById('filterStatus');
  const filterTeamName = document.getElementById('filterTeamName');
  if (filterStatus && filterTeamName) {
    if (q.length > 0) {
      let displayName = val;
      const upper = val.toUpperCase();
      if (countryMap[upper]) {
        displayName = `${countryMap[upper].flag} ${countryMap[upper].vi}`;
      } else {
        const found = Object.values(countryMap).find(t => t.vi.toLowerCase() === q);
        if (found) {
          displayName = `${found.flag} ${found.vi}`;
        }
      }
      filterTeamName.innerHTML = displayName;
      filterStatus.classList.remove('hidden');
    } else {
      filterStatus.classList.add('hidden');
    }
  }

  const activeBtn = document.querySelector('.filter-btn.active');
  let currentPhase = 'all';
  if (activeBtn) {
    const clickAttr = activeBtn.getAttribute('onclick') || '';
    const match = clickAttr.match(/'([^']+)'/);
    if (match) currentPhase = match[1];
    else if (activeBtn.id === 'favFilterBtn') currentPhase = 'favorites';
  }

  // 1. Lọc các trận đấu vòng bảng (.match-card)
  document.querySelectorAll('.match-card').forEach(card => {
    const teams = card.dataset.teams || '';
    const text = card.innerText.toLowerCase();
    const matchSearch = q.length === 0 || teams.includes(q) || text.includes(q);

    let matchPhase = true;
    if (currentPhase === 'group') {
      // Ok
    } else if (currentPhase !== 'all' && currentPhase !== 'favorites') {
      matchPhase = false;
    }

    const teamElements = card.querySelectorAll('.team-name-sc, .team-name');
    const playingTeams = Array.from(teamElements).map(el => cleanTeamName(el.innerText).toLowerCase());
    const matchFav = currentPhase !== 'favorites' || favoriteTeams.some(fav => playingTeams.includes(fav.toLowerCase()));

    card.classList.toggle('hidden', !matchSearch || !matchPhase || !matchFav);
  });

  // 2. Lọc các trận đấu loại trực tiếp (.ko-match)
  document.querySelectorAll('.ko-match').forEach(card => {
    const text = card.innerText.toLowerCase();
    const matchSearch = q.length === 0 || text.includes(q);

    let matchPhase = true;
    if (currentPhase === 'group') {
      matchPhase = false;
    }

    const teamElements = card.querySelectorAll('.team-name-sc, .team-name');
    const playingTeams = Array.from(teamElements).map(el => cleanTeamName(el.innerText).toLowerCase());
    const matchFav = currentPhase !== 'favorites' || favoriteTeams.some(fav => playingTeams.includes(fav.toLowerCase()));

    card.classList.toggle('hidden', !matchSearch || !matchPhase || !matchFav);
  });

  // 3. Ẩn/hiển thị day-block vòng bảng
  document.querySelectorAll('.day-block').forEach(block => {
    const cards = block.querySelectorAll('.match-card');
    const anyVisible = Array.from(cards).some(c => !c.classList.contains('hidden'));

    let matchPhase = true;
    if (currentPhase === 'group') {
      // Ok
    } else if (currentPhase !== 'all' && currentPhase !== 'favorites') {
      matchPhase = false;
    }

    block.classList.toggle('hidden', !anyVisible || !matchPhase);
  });

  // 4. Ẩn/hiển thị knockout-block
  document.querySelectorAll('.knockout-block').forEach(block => {
    const cards = block.querySelectorAll('.ko-match');
    const anyVisible = Array.from(cards).some(c => !c.classList.contains('hidden'));

    let matchPhase = true;
    if (currentPhase === 'knockout') {
      // Hiển thị tất cả knockout
    } else if (currentPhase.startsWith('ko-')) {
      matchPhase = block.dataset.subphase === currentPhase;
    } else if (currentPhase === 'group') {
      matchPhase = false;
    }

    block.classList.toggle('hidden', !anyVisible || !matchPhase);
  });
}

function clearFilter() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = '';
    searchTeam('');
  }
}

// Danh mục ánh xạ tên của 48 đội tuyển tham gia (bao gồm tên tiếng Anh, tên chuẩn hóa, và mã viết tắt 3 ký tự của FIFA)
const countryMap = {
  // Bảng A
  "Mexico": { vi: "Mexico", flag: "🇲🇽" },
  "MEX": { vi: "Mexico", flag: "🇲🇽" },
  "South Africa": { vi: "Nam Phi", flag: "🇿🇦" },
  "RSA": { vi: "Nam Phi", flag: "🇿🇦" },
  "South Korea": { vi: "Hàn Quốc", flag: "🇰🇷" },
  "KOR": { vi: "Hàn Quốc", flag: "🇰🇷" },
  "Czech Republic": { vi: "Séc", flag: "🇨🇿" },
  "Czechia": { vi: "Séc", flag: "🇨🇿" },
  "CZE": { vi: "Séc", flag: "🇨🇿" },
  // Bảng B
  "Canada": { vi: "Canada", flag: "🇨🇦" },
  "CAN": { vi: "Canada", flag: "🇨🇦" },
  "Bosnia and Herzegovina": { vi: "Bosnia", flag: "🇧🇦" },
  "Bosnia-Herzegovina": { vi: "Bosnia", flag: "🇧🇦" },
  "Bosnia": { vi: "Bosnia", flag: "🇧🇦" },
  "BIH": { vi: "Bosnia", flag: "🇧🇦" },
  "Qatar": { vi: "Qatar", flag: "🇶🇦" },
  "QAT": { vi: "Qatar", flag: "🇶🇦" },
  "Switzerland": { vi: "Thụy Sĩ", flag: "🇨🇭" },
  "SUI": { vi: "Thụy Sĩ", flag: "🇨🇭" },
  // Bảng C
  "Brazil": { vi: "Brazil", flag: "🇧🇷" },
  "BRA": { vi: "Brazil", flag: "🇧🇷" },
  "Morocco": { vi: "Maroc", flag: "🇲🇦" },
  "MAR": { vi: "Maroc", flag: "🇲🇦" },
  "Haiti": { vi: "Haiti", flag: "🇭🇹" },
  "HAI": { vi: "Haiti", flag: "🇭🇹" },
  "Scotland": { vi: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  "SCO": { vi: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  // Bảng D
  "United States": { vi: "Mỹ", flag: "🇺🇸" },
  "USA": { vi: "Mỹ", flag: "🇺🇸" },
  "Paraguay": { vi: "Paraguay", flag: "🇵🇾" },
  "PAR": { vi: "Paraguay", flag: "🇵🇾" },
  "Australia": { vi: "Australia", flag: "🇦🇺" },
  "AUS": { vi: "Australia", flag: "🇦🇺" },
  "Turkey": { vi: "Thổ Nhĩ Kỳ", flag: "🇹🇷" },
  "Turkiye": { vi: "Thổ Nhĩ Kỳ", flag: "🇹🇷" },
  "TUR": { vi: "Thổ Nhĩ Kỳ", flag: "🇹🇷" },
  // Bảng E
  "Germany": { vi: "Đức", flag: "🇩🇪" },
  "GER": { vi: "Đức", flag: "🇩🇪" },
  "Curacao": { vi: "Curaçao", flag: "🇨🇼" },
  "Curaçao": { vi: "Curaçao", flag: "🇨🇼" },
  "CUW": { vi: "Curaçao", flag: "🇨🇼" },
  "CUR": { vi: "Curaçao", flag: "🇨🇼" },
  "Ivory Coast": { vi: "Bờ Biển Ngà", flag: "🇨🇮" },
  "Côte d'Ivoire": { vi: "Bờ Biển Ngà", flag: "🇨🇮" },
  "CIV": { vi: "Bờ Biển Ngà", flag: "🇨🇮" },
  "Ecuador": { vi: "Ecuador", flag: "🇪🇨" },
  "ECU": { vi: "Ecuador", flag: "🇪🇨" },
  // Bảng F
  "Netherlands": { vi: "Hà Lan", flag: "🇳🇱" },
  "NED": { vi: "Hà Lan", flag: "🇳🇱" },
  "Japan": { vi: "Nhật Bản", flag: "🇯🇵" },
  "JPN": { vi: "Nhật Bản", flag: "🇯🇵" },
  "Sweden": { vi: "Thụy Điển", flag: "🇸🇪" },
  "SWE": { vi: "Thụy Điển", flag: "🇸🇪" },
  "Tunisia": { vi: "Tunisia", flag: "🇹🇳" },
  "TUN": { vi: "Tunisia", flag: "🇹🇳" },
  // Bảng G
  "Belgium": { vi: "Bỉ", flag: "🇧🇪" },
  "BEL": { vi: "Bỉ", flag: "🇧🇪" },
  "Egypt": { vi: "Ai Cập", flag: "🇪🇬" },
  "EGY": { vi: "Ai Cập", flag: "🇪🇬" },
  "Iran": { vi: "Iran", flag: "🇮🇷" },
  "IRN": { vi: "Iran", flag: "🇮🇷" },
  "IRI": { vi: "Iran", flag: "🇮🇷" },
  "New Zealand": { vi: "New Zealand", flag: "🇳🇿" },
  "NZL": { vi: "New Zealand", flag: "🇳🇿" },
  // Bảng H
  "Spain": { vi: "Tây Ban Nha", flag: "🇪🇸" },
  "ESP": { vi: "Tây Ban Nha", flag: "🇪🇸" },
  "Cape Verde": { vi: "Cape Verde", flag: "🇨🇻" },
  "CPV": { vi: "Cape Verde", flag: "🇨🇻" },
  "Saudi Arabia": { vi: "Saudi Arabia", flag: "🇸🇦" },
  "KSA": { vi: "Saudi Arabia", flag: "🇸🇦" },
  "Uruguay": { vi: "Uruguay", flag: "🇺🇾" },
  "URU": { vi: "Uruguay", flag: "🇺🇾" },
  // Bảng I
  "France": { vi: "Pháp", flag: "🇫🇷" },
  "FRA": { vi: "Pháp", flag: "🇫🇷" },
  "Senegal": { vi: "Senegal", flag: "🇸🇳" },
  "SEN": { vi: "Senegal", flag: "🇸🇳" },
  "Iraq": { vi: "Iraq", flag: "🇮🇶" },
  "IRQ": { vi: "Iraq", flag: "🇮🇶" },
  "Norway": { vi: "Na Uy", flag: "🇳🇴" },
  "NOR": { vi: "Na Uy", flag: "🇳🇴" },
  // Bảng J
  "Argentina": { vi: "Argentina", flag: "🇦🇷" },
  "ARG": { vi: "Argentina", flag: "🇦🇷" },
  "Algeria": { vi: "Algeria", flag: "🇩🇿" },
  "ALG": { vi: "Algeria", flag: "🇩🇿" },
  "Austria": { vi: "Áo", flag: "🇦🇹" },
  "AUT": { vi: "Áo", flag: "🇦🇹" },
  "Jordan": { vi: "Jordan", flag: "🇯🇴" },
  "JOR": { vi: "Jordan", flag: "🇯🇴" },
  // Bảng K
  "Portugal": { vi: "Bồ Đào Nha", flag: "🇵🇹" },
  "POR": { vi: "Bồ Đào Nha", flag: "🇵🇹" },
  "DR Congo": { vi: "DR Congo", flag: "🇨🇩" },
  "Congo DR": { vi: "DR Congo", flag: "🇨🇩" },
  "COD": { vi: "DR Congo", flag: "🇨🇩" },
  "Democratic Republic of the Congo": { vi: "DR Congo", flag: "🇨🇩" },
  "Democratic Republic of Congo": { vi: "DR Congo", flag: "🇨🇩" },
  "Uzbekistan": { vi: "Uzbekistan", flag: "🇺🇿" },
  "UZB": { vi: "Uzbekistan", flag: "🇺🇿" },
  "Colombia": { vi: "Colombia", flag: "🇨🇴" },
  "COL": { vi: "Colombia", flag: "🇨🇴" },
  // Bảng L
  "England": { vi: "Anh", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "ENG": { vi: "Anh", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Croatia": { vi: "Croatia", flag: "🇭🇷" },
  "CRO": { vi: "Croatia", flag: "🇭🇷" },
  "Ghana": { vi: "Ghana", flag: "🇬🇭" },
  "GHA": { vi: "Ghana", flag: "🇬🇭" },
  "Panama": { vi: "Panama", flag: "🇵🇦" },
  "PAN": { vi: "Panama", flag: "🇵🇦" }
};

const apiToDataTeamsMap = {
  "mex": "mexico", "mexico": "mexico",
  "rsa": "south africa", "south africa": "south africa",
  "kor": "south korea", "south korea": "south korea",
  "cze": "czechia", "czechia": "czechia", "czech republic": "czechia", "czech": "czechia",
  "can": "canada", "canada": "canada",
  "bih": "bosnia", "bosnia": "bosnia", "bosnia and herzegovina": "bosnia",
  "qat": "qatar", "qatar": "qatar",
  "sui": "switzerland", "switzerland": "switzerland",
  "bra": "brazil", "brazil": "brazil",
  "mar": "morocco", "morocco": "morocco",
  "hai": "haiti", "haiti": "haiti",
  "sco": "scotland", "scotland": "scotland",
  "usa": "usa", "united states": "usa",
  "par": "paraguay", "paraguay": "paraguay",
  "aus": "australia", "australia": "australia",
  "tur": "turkey", "turkey": "turkey", "türkiye": "turkey", "turkiye": "turkey",
  "ger": "germany", "germany": "germany",
  "cuw": "curacao", "curacao": "curacao", "curaçao": "curacao", "cur": "curacao",
  "civ": "ivory coast", "ivory coast": "ivory coast", "ivory": "ivory coast", "côte d'ivoire": "ivory coast", "cote d'ivoire": "ivory coast",
  "ecu": "ecuador", "ecuador": "ecuador",
  "ned": "netherlands", "netherlands": "netherlands",
  "jpn": "japan", "japan": "japan",
  "swe": "sweden", "sweden": "sweden",
  "tun": "tunisia", "tunisia": "tunisia",
  "bel": "belgium", "belgium": "belgium",
  "egy": "egypt", "egypt": "egypt",
  "irn": "iran", "iran": "iran", "iri": "iran",
  "nzl": "new zealand", "new zealand": "new zealand",
  "esp": "spain", "spain": "spain",
  "cpv": "cape verde", "cape verde": "cape verde",
  "ksa": "saudi arabia", "saudi arabia": "saudi arabia", "saudi": "saudi arabia",
  "uru": "uruguay", "uruguay": "uruguay",
  "fra": "france", "france": "france",
  "sen": "senegal", "senegal": "senegal",
  "irq": "iraq", "iraq": "iraq",
  "nor": "norway", "norway": "norway",
  "arg": "argentina", "argentina": "argentina",
  "alg": "algeria", "algeria": "algeria",
  "aut": "austria", "austria": "austria",
  "jor": "jordan", "jordan": "jordan",
  "por": "portugal", "portugal": "portugal",
  "cod": "dr congo", "dr congo": "dr congo", "congo dr": "dr congo", "congo": "dr congo", "democratic republic of the congo": "dr congo", "democratic republic of congo": "dr congo",
  "uzb": "uzbekistan", "uzbekistan": "uzbekistan",
  "col": "colombia", "colombia": "colombia",
  "eng": "england", "england": "england",
  "cro": "croatia", "croatia": "croatia",
  "gha": "ghana", "ghana": "ghana",
  "pan": "panama", "panama": "panama"
};

function getEnglishKey(country) {
  if (!country) return '';
  const c = country.toLowerCase().trim();
  if (apiToDataTeamsMap[c]) return apiToDataTeamsMap[c];

  // Cơ chế dự phòng để khớp tên đội tuyển khi không tìm thấy trong danh mục map
  if (c.includes('south africa')) return 'south africa';
  if (c.includes('south korea')) return 'south korea';
  if (c.includes('czech')) return 'czechia';
  if (c.includes('bosnia')) return 'bosnia';
  if (c.includes('ivory coast') || c.includes('côte d') || c.includes('cote d')) return 'ivory coast';
  if (c.includes('turkey') || c.includes('türkiye') || c.includes('turkiye')) return 'turkey';
  if (c.includes('curacao') || c.includes('curaçao')) return 'curacao';
  if (c.includes('new zealand')) return 'new zealand';
  if (c.includes('saudi')) return 'saudi arabia';
  if (c.includes('cape verde')) return 'cape verde';
  if (c.includes('congo') || c.includes('dr congo') || c.includes('congo dr')) return 'dr congo';
  return c;
}

function formatTeamName(apiName) {
  if (!apiName) return { vi: "Chờ xác định", flag: "❓" };
  const name = apiName.trim();
  if (countryMap[name]) return countryMap[name];

  // Thử tìm theo chữ hoa (đề phòng API trả về mã CODE dạng chữ thường/hoa lẫn lộn)
  const upperName = name.toUpperCase();
  if (countryMap[upperName]) return countryMap[upperName];

  let translated = name;
  let flag = "❓";
  if (name.includes("Winner Group")) {
    const group = name.replace("Winner Group", "").trim();
    translated = `Nhất Bảng ${group}`;
    flag = "🥇";
  } else if (name.includes("Runner-up Group")) {
    const group = name.replace("Runner-up Group", "").trim();
    translated = `Nhì Bảng ${group}`;
    flag = "🥈";
  } else if (name.includes("Winner Match")) {
    const matchNum = name.replace("Winner Match", "").trim();
    translated = `Thắng Trận ${matchNum}`;
    flag = "🏆";
  } else if (name.includes("Loser Match")) {
    const matchNum = name.replace("Loser Match", "").trim();
    translated = `Thua Trận ${matchNum}`;
    flag = "🥉";
  }
  return { vi: translated, flag: flag };
}

function initializeKnockoutMatches() {
  const blocks = document.querySelectorAll('.knockout-block');
  let currentMatchNum = 73;

  blocks.forEach(block => {
    const matches = block.querySelectorAll('.ko-match');
    matches.forEach(matchEl => {
      const timeEl = matchEl.querySelector('.ko-time');
      const timeText = timeEl ? timeEl.innerText : '';
      const infoSpan = matchEl.querySelector('span:not(.ko-time)');
      const infoText = infoSpan ? infoSpan.innerText : '';

      let date = '';
      let time = '';
      if (timeText.includes('–')) {
        const parts = timeText.split('–');
        date = parts[0].trim();
        time = parts[1].trim();
      } else {
        date = timeText;
      }

      let matchLabel = '';
      let venue = '';
      if (infoText.includes('–')) {
        const parts = infoText.split('–');
        matchLabel = parts[0].trim();
        venue = parts[1].trim();
      } else {
        matchLabel = infoText;
      }

      const extraVenueEl = matchEl.querySelector('.ko-venue');
      if (extraVenueEl) {
        venue += ` (${extraVenueEl.innerText})`;
      }

      let matchNum = matchEl.getAttribute('data-match-number');
      if (matchNum) {
        matchNum = parseInt(matchNum);
      } else {
        matchNum = currentMatchNum++;
        matchEl.setAttribute('data-match-number', matchNum);
      }

      const defaults = KNOCKOUT_PLACEHOLDERS[matchNum] || { home: "Chờ xác định", away: "Chờ xác định" };
      let homeFlag = "❓";
      let awayFlag = "❓";
      if (defaults.home.startsWith("Nhất Bảng")) homeFlag = "🥇";
      else if (defaults.home.startsWith("Nhì Bảng")) homeFlag = "🥈";
      else if (defaults.home.startsWith("Ba Bảng")) homeFlag = "🥉";
      else if (defaults.home.startsWith("Thắng Trận")) homeFlag = "🏆";
      else if (defaults.home.startsWith("Thua Trận")) homeFlag = "🥉";

      if (defaults.away.startsWith("Nhất Bảng")) awayFlag = "🥇";
      else if (defaults.away.startsWith("Nhì Bảng")) awayFlag = "🥈";
      else if (defaults.away.startsWith("Ba Bảng")) awayFlag = "🥉";
      else if (defaults.away.startsWith("Thắng Trận")) awayFlag = "🏆";
      else if (defaults.away.startsWith("Thua Trận")) awayFlag = "🥉";

      matchEl.innerHTML = `
          <div class="ko-time">
            <span>${date}</span>
            <small>${time}</small>
          </div>
          <div class="ko-pairing">
            <div class="ko-teams-row">
              <div class="ko-team home">
                <span class="flag">${homeFlag}</span>
                <span class="team-name">${defaults.home}</span>
                <span class="score">-</span>
              </div>
              <div class="ko-vs">vs</div>
              <div class="ko-team away">
                <span class="score">-</span>
                <span class="team-name">${defaults.away}</span>
                <span class="flag">${awayFlag}</span>
              </div>
            </div>
          </div>
          <div class="ko-status-badge future">Sắp diễn ra</div>
          <div class="ko-venue">${matchLabel}<br><small>${venue}</small></div>
        `;
    });
  });
}

function updateKnockoutMatchUI(match) {
  const el = document.querySelector(`.ko-match[data-match-number="${match.match_number}"]`);
  if (!el) return;

  // Tự động kiểm tra theo giờ hệ thống nếu API phản hồi chậm
  let isLiveByTime = false;
  let isPostMatchPending = false;
  let calculatedMinute = null;
  const timeSpan = el.querySelector('.ko-time');
  if (timeSpan) {
    const spanEl = timeSpan.querySelector('span');
    const smallEl = timeSpan.querySelector('small:not(.local-time)');
    const dateText = spanEl ? spanEl.innerText : timeSpan.innerText;
    const timeText = smallEl ? smallEl.innerText : timeSpan.innerText;
    const dateMatch = dateText.match(/(\d{2})\/(\d{2})/);
    const timeMatch = timeText.match(/(\d{2}):(\d{2})/);
    if (dateMatch && timeMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1;
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const year = 2026;

      // Khởi tạo thời gian trận đấu độc lập với múi giờ của client (quy chuẩn theo GMT+7)
      const mmStr = String(month + 1).padStart(2, '0');
      const ddStr = String(day).padStart(2, '0');
      const hhStr = String(hours).padStart(2, '0');
      const minStr = String(minutes).padStart(2, '0');
      const matchStart = new Date(`${year}-${mmStr}-${ddStr}T${hhStr}:${minStr}:00+07:00`);
      const now = new Date();
      const diffMinutes = (now - matchStart) / 1000 / 60;
      if (diffMinutes >= 0 && diffMinutes <= 115) {
        isLiveByTime = true;
        calculatedMinute = Math.floor(diffMinutes);
      } else if (diffMinutes > 115 && match.status === 'future_scheduled') {
        isPostMatchPending = true;
      }
    }
  }

  const isLive = match.status === 'in_progress' || isLiveByTime;
  el.classList.toggle('live-highlight', isLive);

  const homeData = getKnockoutTeamData(match.match_number, 'home', match.home_team?.country);
  const awayData = getKnockoutTeamData(match.match_number, 'away', match.away_team?.country);

  const homeScore = match.home_team?.goals !== null ? match.home_team.goals : (isLive ? '0' : '-');
  const awayScore = match.away_team?.goals !== null ? match.away_team.goals : (isLive ? '0' : '-');

  let homePenHtml = '';
  let awayPenHtml = '';
  if (match.home_team?.penalties !== null && match.home_team?.penalties !== undefined &&
    match.away_team?.penalties !== null && match.away_team?.penalties !== undefined &&
    (match.home_team.penalties > 0 || match.away_team.penalties > 0)) {
    homePenHtml = `<span class="penalty">(${match.home_team.penalties})</span>`;
    awayPenHtml = `<span class="penalty">(${match.away_team.penalties})</span>`;
  }

  let statusClass = 'future';
  let statusText = 'Sắp diễn ra';
  if (isLive) {
    statusClass = 'live';
    statusText = 'Trực tiếp';
    if (match.status === 'in_progress' && match.time_elapsed === 'halftime') {
      statusText = 'Trực tiếp · Hết H1';
    }
  } else if (match.status === 'completed') {
    statusClass = 'completed';
    statusText = 'Kết thúc';
  } else if (isPostMatchPending) {
    statusClass = 'completed';
    statusText = 'Hết giờ (Chờ tỷ số)';
  }

  const homeWinnerClass = (match.winner === match.home_team?.country && match.status === 'completed') ? 'winner' : '';
  const awayWinnerClass = (match.winner === match.away_team?.country && match.status === 'completed') ? 'winner' : '';

  const timeSpanEl = el.querySelector('.ko-time');
  const venueSpan = el.querySelector('.ko-venue');

  // Dọn dẹp thẻ hiển thị giờ địa phương cũ nếu có để tránh trùng lặp
  const oldLocalTime = timeSpanEl.querySelector('.local-time');
  if (oldLocalTime) oldLocalTime.remove();

  let localTimeHtml = '';
  if (match.local_date) {
    const parts = match.local_date.split(' ');
    if (parts.length === 2) {
      const dateParts = parts[0].split('/');
      const timePart = parts[1];
      if (dateParts.length === 3) {
        const localFormatted = `${timePart} · ${dateParts[1]}/${dateParts[0]}`;
        localTimeHtml = `<small class="local-time" style="color:var(--text-muted); font-size:9px; margin-top:2px; font-weight:400; display:block;">${localFormatted} (Địa phương)</small>`;
      }
    }
  }

  const homeFav = isFavorite(homeData.vi);
  const awayFav = isFavorite(awayData.vi);

  const homeStar = homeData.vi.includes("Chờ xác định") ? "" : `<span class="fav-star ${homeFav ? 'active' : ''}" data-team="${homeData.vi}" onclick="toggleFavorite('${homeData.vi}', event)" style="margin-right:6px; cursor:pointer;">${homeFav ? '★' : '☆'}</span>`;
  const awayStar = awayData.vi.includes("Chờ xác định") ? "" : `<span class="fav-star ${awayFav ? 'active' : ''}" data-team="${awayData.vi}" onclick="toggleFavorite('${awayData.vi}', event)" style="margin-right:6px; cursor:pointer;">${awayFav ? '★' : '☆'}</span>`;

  const homeScorersList = match.home_team_events ? match.home_team_events.map(e => e.raw).join(', ') : '';
  const awayScorersList = match.away_team_events ? match.away_team_events.map(e => e.raw).join(', ') : '';
  let scorersHtml = '';
  if (homeScorersList || awayScorersList) {
    scorersHtml = `
          <div class="match-scorers-list" style="font-size: 11px; font-weight: normal; color: var(--text-muted); margin-top: 4px; line-height: 1.3; width: 100%; display: flex;">
            <div style="text-align: left; width: 48%;">${homeScorersList ? `⚽ ${homeScorersList}` : ''}</div>
            <div style="width: 4%;"></div>
            <div style="text-align: right; width: 48%;">${awayScorersList ? `${awayScorersList} ⚽` : ''}</div>
          </div>
        `;
  }

  el.innerHTML = `
        <div class="ko-time">
          ${timeSpanEl.innerHTML}
          ${localTimeHtml}
        </div>
        <div class="ko-pairing">
          <div class="ko-teams-row">
            <div class="ko-team home ${homeWinnerClass}" onclick="clickTeam('${homeData.vi}', event);">
              ${homeStar}
              <span class="flag">${homeData.flag}</span>
              <span class="team-name">${homeData.vi}</span>
              <span class="score">${homeScore}${homePenHtml}</span>
            </div>
            <div class="ko-vs">vs</div>
            <div class="ko-team away ${awayWinnerClass}" onclick="clickTeam('${awayData.vi}', event);">
              <span class="score">${awayScore}${awayPenHtml}</span>
              <span class="team-name">${awayData.vi}</span>
              <span class="flag">${awayData.flag}</span>
              ${awayStar}
            </div>
          </div>
          ${scorersHtml}
        </div>
        <div class="ko-status-badge ${statusClass}">${statusText}</div>
        <div class="ko-venue">${venueSpan.innerHTML}</div>
      `;

  el.style.cursor = 'pointer';
  el.onclick = () => openMatchDetails(match.match_number);
}

function updateGroupMatchUI(match) {
  if (!match.home_team?.country || !match.away_team?.country) return;

  const homeCode = getEnglishKey(match.home_team.country);
  const awayCode = getEnglishKey(match.away_team.country);

  let card = Array.from(document.querySelectorAll('.match-card')).find(c => {
    const teamsAttr = c.dataset.teams || '';
    return teamsAttr.includes(homeCode) && teamsAttr.includes(awayCode);
  });
  if (!card) return;

  // Tự động kiểm tra theo giờ hệ thống nếu API phản hồi chậm
  let isLiveByTime = false;
  let isPostMatchPending = false;
  let calculatedMinute = null;
  const timeEl = card.querySelector('.match-time');
  if (timeEl) {
    const smallEl = timeEl.querySelector('small:not(.local-time)');
    const timeText = timeEl.firstChild ? timeEl.firstChild.textContent.trim() : '';
    const dateText = smallEl ? smallEl.innerText : '';
    const timeMatch = timeText.match(/(\d{2}):(\d{2})/);
    const dateMatch = dateText.match(/(\d{2})\/(\d{2})/);
    if (timeMatch && dateMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1;
      const year = 2026;

      // Khởi tạo thời gian trận đấu độc lập với múi giờ của client (quy chuẩn theo GMT+7)
      const mmStr = String(month + 1).padStart(2, '0');
      const ddStr = String(day).padStart(2, '0');
      const hhStr = String(hours).padStart(2, '0');
      const minStr = String(minutes).padStart(2, '0');
      const matchStart = new Date(`${year}-${mmStr}-${ddStr}T${hhStr}:${minStr}:00+07:00`);
      const now = new Date();
      const diffMinutes = (now - matchStart) / 1000 / 60;

      // Trận đấu diễn ra trong khoảng 115 phút
      if (diffMinutes >= 0 && diffMinutes <= 115) {
        isLiveByTime = true;
        calculatedMinute = Math.floor(diffMinutes);
      } else if (diffMinutes > 115 && match.status === 'future_scheduled') {
        isPostMatchPending = true;
      }
    }
  }

  // Cập nhật giờ thi đấu địa phương ở cột thời gian thực tế của trận đấu
  if (match.local_date && timeEl) {
    const parts = match.local_date.split(' ');
    if (parts.length === 2) {
      const dateParts = parts[0].split('/');
      const timePart = parts[1];
      if (dateParts.length === 3) {
        const localFormatted = `${timePart} · ${dateParts[1]}/${dateParts[0]}`;
        let localSmall = timeEl.querySelector('.local-time');
        if (!localSmall) {
          localSmall = document.createElement('small');
          localSmall.className = 'local-time';
          localSmall.style.color = 'var(--text-muted)';
          localSmall.style.fontSize = '9px';
          localSmall.style.marginTop = '2px';
          localSmall.style.fontWeight = '400';
          localSmall.style.letterSpacing = '0';
          localSmall.style.display = 'block';
          timeEl.appendChild(localSmall);
        }
        localSmall.innerText = `${localFormatted} (Địa phương)`;
      }
    }
  }

  const isLive = match.status === 'in_progress' || isLiveByTime;
  card.classList.toggle('live-highlight', isLive);

  const homeData = formatTeamName(match.home_team.country);
  const awayData = formatTeamName(match.away_team.country);
  const homeFav = isFavorite(homeData.vi);
  const awayFav = isFavorite(awayData.vi);

  const homeStar = `<span class="fav-star ${homeFav ? 'active' : ''}" data-team="${homeData.vi}" onclick="toggleFavorite('${homeData.vi}', event)" style="margin-right:6px; cursor:pointer;">${homeFav ? '★' : '☆'}</span>`;
  const awayStar = `<span class="fav-star ${awayFav ? 'active' : ''}" data-team="${awayData.vi}" onclick="toggleFavorite('${awayData.vi}', event)" style="margin-right:6px; cursor:pointer;">${awayFav ? '★' : '☆'}</span>`;

  const isFinished = match.status === 'completed' || isPostMatchPending;

  if (isLive || isFinished) {
    const homeScore = match.home_team.goals !== null ? match.home_team.goals : (isLive ? '0' : '-');
    const awayScore = match.away_team.goals !== null ? match.away_team.goals : (isLive ? '0' : '-');

    let penaltiesText = '';
    if (match.home_team.penalties || match.away_team.penalties) {
      penaltiesText = ` <small style="color:var(--text-muted)">(${match.home_team.penalties}-${match.away_team.penalties} Pen)</small>`;
    }

    const teamsContainer = card.querySelector('.match-teams');

    let liveIndicator = '';
    if (isLive) {
      let timeLabel = 'TRỰC TIẾP';
      if (match.status === 'in_progress' && match.time_elapsed === 'halftime') {
        timeLabel = 'TRỰC TIẾP · HẾT HIỆP 1';
      }
      liveIndicator = ` <span class="group-pill knockout" style="margin-left: 10px; font-size: 10px; padding: 2px 6px; animation: pulse 1.5s infinite alternate;">${timeLabel}</span>`;
    } else if (isPostMatchPending) {
      liveIndicator = ` <span class="group-pill" style="margin-left: 10px; font-size: 10px; padding: 2px 6px; background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid var(--border); animation: none;">HẾT GIỜ (CHỜ TỶ SỐ)</span>`;
    }

    const homeScorersList = match.home_team_events ? match.home_team_events.map(e => e.raw).join(', ') : '';
    const awayScorersList = match.away_team_events ? match.away_team_events.map(e => e.raw).join(', ') : '';
    let scorersHtml = '';
    if (homeScorersList || awayScorersList) {
      scorersHtml = `
            <div class="match-scorers-list">
              ${homeScorersList ? `<div class="scorer-row home-scorer">⚽ ${homeScorersList}</div>` : ''}
              ${awayScorersList ? `<div class="scorer-row away-scorer">⚽ ${awayScorersList}</div>` : ''}
            </div>
          `;
    }

    teamsContainer.innerHTML = `
          <div class="match-score-wrap">
            <div class="match-score-team home-team">
              ${homeStar}
              <span class="flag">${homeData.flag}</span>
              <span class="clickable-team team-name-sc" onclick="clickTeam('${homeData.vi}', event);">${homeData.vi}</span>
            </div>
            <span class="team-score home-score">${homeScore}</span>
            <span class="score-sep">&ndash;</span>
            <span class="team-score away-score">${awayScore}</span>
            <div class="match-score-team away-team">
              <span class="clickable-team team-name-sc" onclick="clickTeam('${awayData.vi}', event);">${awayData.vi}</span>
              <span class="flag">${awayData.flag}</span>
              ${awayStar}
            </div>
            <div class="score-break"></div>
          </div>
          ${(penaltiesText || liveIndicator) ? `<div class="score-meta">${penaltiesText}${liveIndicator}</div>` : ''}
          ${scorersHtml}
        `;
  } else {
    // Trận đấu sắp diễn ra - áp dụng cấu trúc .match-score-wrap tương tự để đảm bảo hiển thị Responsive đồng bộ
    const teamsContainer = card.querySelector('.match-teams');
    if (teamsContainer) {
      teamsContainer.innerHTML = `
            <div class="match-score-wrap">
              <div class="match-score-team home-team">
                ${homeStar}
                <span class="flag">${homeData.flag}</span>
                <span class="clickable-team team-name-sc" onclick="clickTeam('${homeData.vi}', event);">${homeData.vi}</span>
              </div>
              <span class="score-sep">vs</span>
              <div class="match-score-team away-team">
                <span class="clickable-team team-name-sc" onclick="clickTeam('${awayData.vi}', event);">${awayData.vi}</span>
                <span class="flag">${awayData.flag}</span>
                ${awayStar}
              </div>
              <div class="score-break"></div>
            </div>
          `;
    }
  }

  card.setAttribute('data-match-number', match.match_number);
  card.style.cursor = 'pointer';
  card.onclick = () => openMatchDetails(match.match_number);
}

function sanitizePlayerName(name) {
  if (!name) return "";
  const lower = name.toLowerCase().trim();
  const map = {
    // Messi
    'livnl msi': 'Lionel Messi',
    'livnl messi': 'Lionel Messi',
    'l. messi': 'Lionel Messi',
    'messi': 'Lionel Messi',

    // Ronaldo
    'kristianv rvnaldv': 'Cristiano Ronaldo',
    'kristiano ronaldo': 'Cristiano Ronaldo',
    'rvnaldv': 'Ronaldo',
    'c. ronaldo': 'Cristiano Ronaldo',
    'cristiano ronaldo': 'Cristiano Ronaldo',

    // Mbappé
    'kylian mbaph': 'Kylian Mbappé',
    'kylian mbappe': 'Kylian Mbappé',
    'mbaph': 'Kylian Mbappé',
    'k. mbappé': 'Kylian Mbappé',
    'k. mbappe': 'Kylian Mbappé',
    'mbappé': 'Kylian Mbappé',
    'mbappe': 'Kylian Mbappé',

    // Neymar
    'nimar': 'Neymar',

    // Bellingham
    'jvd blyngham': 'Jude Bellingham',
    'jvd bellingham': 'Jude Bellingham',

    // Kane
    'hri kyn': 'Harry Kane',
    'hri kane': 'Harry Kane',

    // Modric
    'lvka mvdrych': 'Luka Modrić',
    'lvka modric': 'Luka Modrić',
    'mvdrych': 'Modrić',

    // Fernandes
    'brvnv frnandz': 'Bruno Fernandes',
    'brvnv fernandes': 'Bruno Fernandes',

    // Griezmann
    'antvan gryzman': 'Antoine Griezmann',
    'antvan griezmann': 'Antoine Griezmann',

    // Lukaku
    'rvmlv lvkakv': 'Romelu Lukaku',
    'rvmlv lukaku': 'Romelu Lukaku',

    // Saka
    'bvkayv saka': 'Bukayo Saka',

    // Haaland
    'arling halnd': 'Erling Haaland',
    'arling haaland': 'Erling Haaland',

    // Lewandowski
    'robert lvandvfsky': 'Robert Lewandowski',
    'robert lewandowski': 'Robert Lewandowski',

    // Martinez
    'lawtarv martynz': 'Lautaro Martínez',
    'lawtarv martinez': 'Lautaro Martínez',

    // Di Maria
    'ankhl dy marya': 'Ángel Di María',
    'ankhl di maria': 'Ángel Di María',

    // Salah
    'mhmd slah': 'Mohamed Salah',
    'mohamed salah': 'Mohamed Salah',

    // Benzema
    'krym bnzma': 'Karim Benzema',
    'karim benzema': 'Karim Benzema',

    // Son Heung-min
    'svn hyvng myn': 'Son Heung-min',
    'son heung-min': 'Son Heung-min',

    // Vinicius Jr
    'vynysyvs jvnyvr': 'Vinícius Júnior',
    'vynysyvs junior': 'Vinícius Júnior',

    // Rodrygo
    'rvdrygv': 'Rodrygo',

    // De Bruyne
    'kvin dy brynh': 'Kevin De Bruyne',
    'kvin de bruyne': 'Kevin De Bruyne',

    // Foden
    'fyl fvdn': 'Phil Foden',
    'phil foden': 'Phil Foden',

    // Musiala
    'jmal mvsyala': 'Jamal Musiala',
    'jamal musiala': 'Jamal Musiala',

    // Wirtz
    'flvryan vyrtz': 'Florian Wirtz',
    'florian wirtz': 'Florian Wirtz',

    // Alvarez
    'khvlyan alvartz': 'Julián Álvarez',
    'khvlyan alvarz': 'Julián Álvarez',

    // Mac Allister
    'alksys mk alystr': 'Alexis Mac Allister',

    // Enzo Fernandez
    'anzv frnandz': 'Enzo Fernández',

    // Nuno Mendes
    'nvnv mndz': 'Nuno Mendes',
    'nvnv mendes': 'Nuno Mendes',
    'nuno mendes': 'Nuno Mendes',

    // E. Martinez
    'amylyanv martynz': 'Emiliano Martínez',

    // Pulisic
    'krystyn pvlyshych': 'Christian Pulisic',

    // Davies
    'alfvnsv dyvys': 'Alphonso Davies',

    // Hakimi
    'ashrf hkymy': 'Achraf Hakimi',

    // Mane
    'sadyv manh': 'Sadio Mané',

    // Osimhen
    'vyktvr awsymhn': 'Victor Osimhen',

    // Mitoma
    'ka\'vrv mytvma': 'Kaoru Mitoma',

    // Kubo
    'takfvsa kvbv': 'Takefusa Kubo',

    // Nematov
    'abdalvhid namtvf': 'Abduvohid Nematov',
    'abduvohid nematov': 'Abduvohid Nematov',

    // Ueda
    'aiash ivida': 'Ayase Ueda',
    'ayase ueda': 'Ayase Ueda',

    // Muñoz
    'dnil mvnvz': 'Daniel Muñoz',
    'daniel muñoz': 'Daniel Muñoz',

    // Undav
    'dniz avndav': 'Deniz Undav',
    'deniz undav': 'Deniz Undav',

    // Manzambi
    'jvhan mnzambi': 'Johan Manzambi',
    'johan manzambi': 'Johan Manzambi',

    // Gakpo
    'kvdi khakpv': 'Cody Gakpo',
    'cody gakpo': 'Cody Gakpo',

    // Fayzullaev
    'abas bk fiz allh af': 'Abbosbek Fayzullaev',
    'abbosbek fayzullaev': 'Abbosbek Fayzullaev'
  };
  return map[lower] || name;
}

function parseScoreAndPenalty(scoreStr) {
  if (scoreStr === null || scoreStr === undefined || scoreStr === 'null') {
    return { goals: null, penalties: null };
  }
  const str = String(scoreStr).trim();
  const match = str.match(/^(\d+)\s*[\(\[]\s*(\d+)\s*[\)\]]$/);
  if (match) {
    return {
      goals: parseInt(match[1]),
      penalties: parseInt(match[2])
    };
  }
  const val = parseInt(str);
  return {
    goals: isNaN(val) ? null : val,
    penalties: null
  };
}

function normalizeGame(game) {
  const match_number = parseInt(game.id);

  let status = 'future_scheduled';
  if (String(game.finished).toUpperCase() === 'TRUE') {
    status = 'completed';
  } else if (game.time_elapsed && game.time_elapsed !== 'notstarted') {
    status = 'in_progress';
  }

  const homeParsed = parseScoreAndPenalty(game.home_score);
  const awayParsed = parseScoreAndPenalty(game.away_score);

  const homeGoals = homeParsed.goals;
  const awayGoals = awayParsed.goals;

  const home_team = {
    country: game.home_team_name_en,
    label: game.home_team_label,
    goals: status !== 'future_scheduled' ? homeGoals : null,
    penalties: status !== 'future_scheduled' ? homeParsed.penalties : null
  };

  const away_team = {
    country: game.away_team_name_en,
    label: game.away_team_label,
    goals: status !== 'future_scheduled' ? awayGoals : null,
    penalties: status !== 'future_scheduled' ? awayParsed.penalties : null
  };

  const playerNationalities = {
    'mohamed hany': 'egypt',
    'mohamed hani': 'egypt',
    'lionel messi': 'argentina',
    'livnl msi': 'argentina',
    'livnl messi': 'argentina',
    'cristiano ronaldo': 'portugal',
    'kristianv rvnaldv': 'portugal',
    'rvnaldv': 'portugal',
    'abduvohid nematov': 'uzbekistan',
    'abdalvhid namtvf': 'uzbekistan',
    'ayase ueda': 'japan',
    'aiash ivida': 'japan',
    'daniel muñoz': 'colombia',
    'dnil mvnvz': 'colombia',
    'deniz undav': 'germany',
    'dniz avndav': 'germany',
    'johan manzambi': 'switzerland',
    'jvhan mnzambi': 'switzerland',
    'cody gakpo': 'netherlands',
    'kvdi khakpv': 'netherlands',
    'abbosbek fayzullaev': 'uzbekistan',
    'abas bk fiz allh af': 'uzbekistan'
  };

  const parseScorersStr = (scorersStr, scoringTeamCountryEn) => {
    if (!scorersStr || scorersStr === 'null') return [];
    const cleaned = scorersStr.replace(/[{}]/g, '').replace(/[\u201C\u201D“”"]/g, '');
    const parts = cleaned.split(',');
    return parts.map(part => {
      const nameAndMin = part.trim();

      let type_of_event = 'goal';
      let workingStr = nameAndMin;

      // Hỗ trợ cả ký hiệu tiếng Anh (OG) và tiếng Ba Tư (گل به خودy) cho bàn phản lưới
      if (/\(OG\)/i.test(workingStr) || /گل\s*به\s*خودی/i.test(workingStr) || /گل‌به‌خودی/i.test(workingStr)) {
        type_of_event = 'own-goal';
        workingStr = workingStr.replace(/\(OG\)/i, '')
          .replace(/\(?گل\s*به\s*خودی\)?/g, '')
          .replace(/\(?گل‌به‌خودی\)?/g, '')
          .trim();
        // Hỗ trợ ký hiệu phạt đền tiếng Anh (p/pen) và tiếng Ba Tư (پنالتی)
      } else if (/\((p|pen|penalty)\)/i.test(workingStr) || /پنالتی/i.test(workingStr)) {
        type_of_event = 'goal-penalty';
        workingStr = workingStr.replace(/\((p|pen|penalty)\)/i, '')
          .replace(/\(?پنالتی\)?/g, '')
          .trim();
      }

      const minRegex = /\s+\d+['’]?(?:\+\d+['’]?)?$/;
      const match = workingStr.match(minRegex);
      let player = workingStr;
      if (match) {
        player = workingStr.substring(0, match.index).trim();
      }
      const sanitizedPlayer = sanitizePlayerName(player);

      // Tự động phát hiện phản lưới nhà dựa trên quốc tịch của cầu thủ so với đội được tính bàn thắng
      if (type_of_event === 'goal' && scoringTeamCountryEn) {
        const playerKey = sanitizedPlayer.toLowerCase().trim();
        const playerCountry = playerNationalities[playerKey];
        if (playerCountry) {
          const scoringCountryKey = getEnglishKey(scoringTeamCountryEn);
          const playerCountryKey = getEnglishKey(playerCountry);
          if (scoringCountryKey && playerCountryKey && scoringCountryKey !== playerCountryKey) {
            type_of_event = 'own-goal';
          }
        }
      }

      let raw = nameAndMin;
      if (type_of_event === 'goal-penalty') {
        const min = match ? match[0].trim() : "";
        raw = `${sanitizedPlayer} ${min} (Penalty)`.trim();
      } else if (type_of_event === 'own-goal') {
        const min = match ? match[0].trim() : "";
        raw = `${sanitizedPlayer} ${min} (Phản lưới nhà)`.trim();
      } else if (sanitizedPlayer !== player) {
        raw = nameAndMin.replace(player, sanitizedPlayer);
      }

      return {
        type_of_event,
        player: sanitizedPlayer,
        raw: raw
      };
    }).filter(p => p.player);
  };

  const home_team_events = parseScorersStr(game.home_scorers, game.home_team_name_en);
  const away_team_events = parseScorersStr(game.away_scorers, game.away_team_name_en);

  let winner = null;
  if (status === 'completed') {
    if (homeGoals > awayGoals) {
      winner = game.home_team_name_en;
    } else if (awayGoals > homeGoals) {
      winner = game.away_team_name_en;
    } else {
      const homePen = homeParsed.penalties || 0;
      const awayPen = awayParsed.penalties || 0;
      if (homePen > awayPen) {
        winner = game.home_team_name_en;
      } else if (awayPen > homePen) {
        winner = game.away_team_name_en;
      } else {
        winner = 'Draw';
      }
    }
  }

  return {
    match_number,
    status,
    home_team,
    away_team,
    home_team_events,
    away_team_events,
    winner,
    time_elapsed: game.time_elapsed,
    local_date: game.local_date,
    stadium_id: game.stadium_id,
    group: game.group,
    matchday: game.matchday
  };
}

async function fetchRealtimeSchedule() {
  const badge = document.getElementById('realtimeBadge');
  if (badge) {
    badge.className = 'realtime-badge loading';
    badge.querySelector('.text').innerText = 'Đang tải...';
  }

  const url = 'https://worldcup26.ir/get/games';
  const cacheBustUrl = `${url}?_=${Date.now()}`;
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(cacheBustUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(cacheBustUrl)}`
  ];

  let success = false;
  let data = null;

  // Thử fetch trực tiếp trước để ưu tiên cấu hình localhost/hosts redirect cục bộ
  try {
    const res = await fetch(cacheBustUrl);
    if (res.ok) {
      data = await res.json();
      success = true;
    }
  } catch (err) {
    console.warn('Fetch trực tiếp thất bại, thử qua proxy...', err);
  }

  // Nếu trực tiếp thất bại mới thử qua proxy
  if (!success) {
    for (let proxyUrl of proxies) {
      try {
        const res = await fetch(proxyUrl);
        if (res.ok) {
          data = await res.json();
          success = true;
          break;
        }
      } catch (err) {
        console.warn(`Fetch qua proxy thất bại: ${proxyUrl}`, err);
      }
    }
  }

  if (success && data && data.games) {
    const matches = data.games.map(normalizeGame);
    cachedMatches = matches; // Cache matches globally for modal use

    calculate2026StandingsAndScorers(matches);
    renderAllStandingsTables();
    renderScorers();
    updateStars();

    matches.forEach(match => {
      const matchNum = match.match_number;
      if (matchNum >= 73 && matchNum <= 104) {
        updateKnockoutMatchUI(match);
      } else {
        updateGroupMatchUI(match);
      }
    });

    // ĐỒNG BỘ DỮ LIỆU SƠ ĐỒ NHÁNH ĐẤU
    if (typeof syncRealtimeToBracket === 'function') {
      syncRealtimeToBracket();
    }

    if (badge) {
      badge.className = 'realtime-badge';
      badge.querySelector('.text').innerText = 'Realtime: Đã cập nhật';
    }
  } else {
    if (badge) {
      badge.className = 'realtime-badge error';
      badge.querySelector('.text').innerText = 'Lỗi kết nối';
    }
  }

  highlightToday();
}

// Loại bỏ tất cả emoji để lấy tên đội thuần túy
function cleanTeamName(text) {
  return text.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]|\p{Emoji_Presentation}|\p{Emoji}/gu, '').replace(/\s+/g, ' ').trim();
}

// Xử lý khi click vào tên/cờ đội tuyển
function clickTeam(teamName, event) {
  if (window.innerWidth <= 640) {
    // Trên mobile, không thực hiện filter, để sự kiện nổi lên thẻ cha (mở Modal chi tiết)
    return;
  }
  if (event) {
    event.stopPropagation();
  }
  if (!teamName) return;
  const name = cleanTeamName(teamName);
  if (name.includes("Chờ xác định") || name.includes("Thắng Trận") || name.includes("Thua Trận") || name.includes("Nhất Bảng") || name.includes("Nhì Bảng")) return;

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    if (searchInput.value.toLowerCase().trim() === name.toLowerCase()) {
      searchInput.value = '';
    } else {
      searchInput.value = name;
    }
    searchTeam(searchInput.value);

    const controls = document.querySelector('.controls');
    if (controls) {
      controls.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function makeStaticTeamsClickable() {
  document.querySelectorAll('.match-card').forEach(card => {
    const teamsContainer = card.querySelector('.match-teams');
    if (!teamsContainer || teamsContainer.querySelector('.fav-star')) return;

    const parts = teamsContainer.innerText.split(/\s+vs\s+|\s+-\s+/);
    if (parts.length === 2) {
      const t1 = parts[0].trim();
      const t2 = parts[1].trim();

      const emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF]|\p{Emoji_Presentation}|\p{Emoji}/gu;
      const f1Match = t1.match(emojiRegex);
      const flag1 = f1Match ? f1Match.join('') : '';
      const f2Match = t2.match(emojiRegex);
      const flag2 = f2Match ? f2Match.join('') : '';

      const name1 = cleanTeamName(t1);
      const name2 = cleanTeamName(t2);

      const homeFav = isFavorite(name1);
      const awayFav = isFavorite(name2);

      const homeStar = `<span class="fav-star ${homeFav ? 'active' : ''}" data-team="${name1}" onclick="toggleFavorite('${name1}', event)" style="margin-right:6px; cursor:pointer;">${homeFav ? '★' : '☆'}</span>`;
      const awayStar = `<span class="fav-star ${awayFav ? 'active' : ''}" data-team="${name2}" onclick="toggleFavorite('${name2}', event)" style="margin-right:6px; cursor:pointer;">${awayFav ? '★' : '☆'}</span>`;

      // Sử dụng cấu trúc .match-score-wrap: ngang trên desktop và xếp dọc trên mobile thông qua CSS
      teamsContainer.innerHTML = `
            <div class="match-score-wrap">
              <div class="match-score-team home-team">
                ${homeStar}
                <span class="flag">${flag1}</span>
                <span class="clickable-team team-name-sc" onclick="clickTeam('${name1}', event);">${name1}</span>
              </div>
              <span class="score-sep">vs</span>
              <div class="match-score-team away-team">
                <span class="clickable-team team-name-sc" onclick="clickTeam('${name2}', event);">${name2}</span>
                <span class="flag">${flag2}</span>
                ${awayStar}
              </div>
              <div class="score-break"></div>
            </div>
          `;
    }
  });
}

// Biến danh sách các đội trong phần "Bảng Đấu" (Group Cards) ở trên cùng thành clickable
function makeGroupTeamsClickable() {
  document.querySelectorAll('.group-card li').forEach(li => {
    const span = li.querySelector('span:not(.flag)');
    if (span) {
      const teamName = span.innerText.trim();
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        clickTeam(teamName);
      });
      li.classList.add('clickable-team-li');
    }
  });
}

function toggleGroups() {
  openGroupsModal();
}

// ── CÁC THAO TÁC VÀ DỮ LIỆU CỦA MODAL CHI TIẾT TRẬN ĐẤU ──
const stadiumsMap = {
  "1": { name: "Estadio Azteca", city: "Mexico City, Mexico", capacity: "83,000", desc: "Sân vận động huyền thoại đã từng tổ chức 2 trận chung kết World Cup 1970 và 1986." },
  "2": { name: "Estadio Guadalajara (Akron)", city: "Zapopan, Mexico", capacity: "48,000", desc: "Một trong những sân vận động hiện đại nhất Mexico, nổi tiếng với thiết kế như một ngọn núi lửa." },
  "3": { name: "Estadio Monterrey (BBVA)", city: "Guadalupe, Mexico", capacity: "53,500", desc: "Nổi tiếng với góc nhìn hướng thẳng ra ngọn núi Cerro de la Silla hùng vĩ." },
  "4": { name: "AT&T Stadium (Dallas Stadium)", city: "Arlington, USA", capacity: "94,000", desc: "Một trong những sân vận động có mái vòm đóng mở và màn hình treo lớn nhất thế giới." },
  "5": { name: "NRG Stadium (Houston Stadium)", city: "Houston, USA", capacity: "72,000", desc: "Sân vận động đầu tiên tại giải NFL được thiết kế có mái che di động kéo thả." },
  "6": { name: "Arrowhead Stadium (Kansas City Stadium)", city: "Kansas City, USA", capacity: "73,000", desc: "Nơi nắm giữ kỷ lục Guinness về sân vận động ngoài trời có độ ồn lớn nhất thế giới." },
  "7": { name: "Mercedes-Benz Stadium (Atlanta Stadium)", city: "Atlanta, USA", capacity: "75,000", desc: "Kỳ quan kiến trúc với mái vòm xếp đóng mở độc đáo kiểu khẩu độ camera và màn hình halo khổng lồ 360 độ." },
  "8": { name: "Hard Rock Stadium (Miami Stadium)", city: "Miami Gardens, USA", capacity: "65,000", desc: "Sân vận động đa năng, địa điểm quen thuộc tổ chức Super Bowl và giải quần vợt Miami Open." },
  "9": { name: "Gillette Stadium (Boston Stadium)", city: "Foxborough, USA", capacity: "65,000", desc: "Thành trì giàu truyền thống thể thao vùng Boston, bang Massachusetts." },
  "10": { name: "Lincoln Financial Field (Philadelphia Stadium)", city: "Philadelphia, USA", capacity: "69,000", desc: "Còn được gọi thân thương là 'The Linc', tọa lạc tại thành phố lịch sử Philadelphia." },
  "11": { name: "MetLife Stadium (New York New Jersey Stadium)", city: "East Rutherford, USA", capacity: "82,500", desc: "Nơi sẽ diễn ra trận Chung kết World Cup 2026 lịch sử." },
  "12": { name: "Toronto Stadium (BMO Field)", city: "Toronto, Canada", capacity: "45,000", desc: "Sân nhà của CLB Toronto FC và Đội tuyển quốc gia Canada." },
  "13": { name: "BC Place (Vancouver Stadium)", city: "Vancouver, Canada", capacity: "54,000", desc: "Sân vận động mái vòm lớn nhất Tây Canada, vừa được nâng cấp mặt cỏ đạt chuẩn FIFA." },
  "14": { name: "Lumen Field (Seattle Stadium)", city: "Seattle, USA", capacity: "69,000", desc: "Nổi tiếng với thiết kế khuếch đại tiếng ồn của khán giả, tạo nên bầu không khí vô cùng cuồng nhiệt." },
  "15": { name: "Levi's Stadium (San Francisco Bay Area Stadium)", city: "Santa Clara, USA", capacity: "71,000", desc: "Sân vận động xanh đạt chứng chỉ LEED Gold, nằm tại Thung lũng Silicon." },
  "16": { name: "SoFi Stadium (Los Angeles Stadium)", city: "Inglewood, USA", capacity: "70,000", desc: "Sân vận động đắt giá nhất hành tinh với chi phí xây dựng hơn 5 tỷ USD." }
};

function openMatchDetails(matchNum) {
  const match = cachedMatches.find(m => m.match_number === matchNum);
  if (!match) return;

  const homeData = formatTeamName(match.home_team?.country);
  const awayData = formatTeamName(match.away_team?.country);

  // Trích xuất ngày và giờ thi đấu cho thời gian địa phương
  let localTimeText = 'Chưa cập nhật';
  if (match.local_date) {
    const parts = match.local_date.split(' ');
    if (parts.length === 2) {
      const dateParts = parts[0].split('/');
      localTimeText = `${parts[1]} ngày ${dateParts[1]}/${dateParts[0]}`;
    }
  }

  // Kiểm tra trạng thái trực tiếp của trận đấu
  let isLiveByTime = false;
  let calculatedMinute = null;
  let dateText = '';
  let timeText = '';

  // Tự tìm thẻ tương ứng trên giao diện để lấy giờ hiển thị
  const matchCard = document.querySelector(`.match-card[data-match-number="${matchNum}"]`) ||
    document.querySelector(`.ko-match[data-match-number="${matchNum}"]`);

  if (matchCard) {
    const timeEl = matchCard.querySelector('.match-time') || matchCard.querySelector('.ko-time');
    if (timeEl) {
      let dateMatch = null;
      let timeMatch = null;
      if (timeEl.classList.contains('ko-time')) {
        const spanEl = timeEl.querySelector('span');
        const smallEl = timeEl.querySelector('small:not(.local-time)');
        const dateText = spanEl ? spanEl.innerText : '';
        const timeText = smallEl ? smallEl.innerText : '';
        dateMatch = dateText.match(/(\d{2})\/(\d{2})/);
        timeMatch = timeText.match(/(\d{2}):(\d{2})/);
      } else {
        const smallEl = timeEl.querySelector('small:not(.local-time)');
        const timeText = timeEl.firstChild ? timeEl.firstChild.textContent.trim() : '';
        const dateText = smallEl ? smallEl.innerText : '';
        dateMatch = dateText.match(/(\d{2})\/(\d{2})/);
        timeMatch = timeText.match(/(\d{2}):(\d{2})/);
      }
      if (dateMatch && timeMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]) - 1;
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);

        // Khởi tạo thời gian trận đấu độc lập với múi giờ của client (quy chuẩn theo GMT+7)
        const mmStr = String(month + 1).padStart(2, '0');
        const ddStr = String(day).padStart(2, '0');
        const hhStr = String(hours).padStart(2, '0');
        const minStr = String(minutes).padStart(2, '0');
        const matchStart = new Date(`2026-${mmStr}-${ddStr}T${hhStr}:${minStr}:00+07:00`);
        const now = new Date();
        const diffMinutes = (now - matchStart) / 1000 / 60;
        if (diffMinutes >= 0 && diffMinutes <= 115) {
          isLiveByTime = true;
          calculatedMinute = Math.floor(diffMinutes);
        }
      }
      dateText = timeEl.querySelector('span')?.innerText || timeEl.innerText.split('\n')[0] || '';
      timeText = timeEl.querySelector('small')?.innerText || timeEl.innerText.split('\n')[1] || '';
    }
  }

  const isLive = match.status === 'in_progress' || isLiveByTime;
  const isFinished = match.status === 'completed';

  const homeScore = match.home_team?.goals !== null ? match.home_team.goals : (isLive ? '0' : '-');
  const awayScore = match.away_team?.goals !== null ? match.away_team.goals : (isLive ? '0' : '-');

  // Xác định nhãn của vòng đấu và bảng đấu
  let matchStage = `Trận ${match.match_number}`;
  if (match.match_number <= 72) {
    matchStage += ` · Vòng Bảng (Bảng ${match.group || '?'}) ${match.matchday ? `· Lượt trận ${match.matchday}` : ''}`;
  } else if (match.match_number <= 88) {
    matchStage += ` · Vòng 32 Đội`;
  } else if (match.match_number <= 96) {
    matchStage += ` · Vòng 16 Đội`;
  } else if (match.match_number <= 100) {
    matchStage += ` · Vòng Tứ Kết`;
  } else if (match.match_number <= 102) {
    matchStage += ` · Vòng Bán Kết`;
  } else if (match.match_number === 103) {
    matchStage += ` · Tranh Hạng Ba`;
  } else {
    matchStage += ` · CHUNG KẾT`;
  }

  // Ánh xạ dữ liệu sân vận động
  const stadium = stadiumsMap[match.stadium_id] || { name: "Sân vận động đang cập nhật", city: "Đang cập nhật", capacity: "Đang cập nhật", desc: "Địa điểm thi đấu chính thức của World Cup 2026." };

  // Dòng thời gian sự kiện (Bàn thắng, thẻ phạt...)
  const extractMinute = (rawStr) => {
    const m = rawStr.match(/(\d+)['’]?/);
    return m ? m[1] + "'" : "";
  };

  let eventsHtml = '';
  const allEvents = [];
  if (match.home_team_events) {
    match.home_team_events.forEach(e => {
      allEvents.push({
        team: 'home',
        player: e.player,
        minute: extractMinute(e.raw),
        type: e.type_of_event
      });
    });
  }
  if (match.away_team_events) {
    match.away_team_events.forEach(e => {
      allEvents.push({
        team: 'away',
        player: e.player,
        minute: extractMinute(e.raw),
        type: e.type_of_event
      });
    });
  }

  // Sắp xếp các sự kiện theo số phút của trận đấu
  allEvents.sort((a, b) => parseInt(a.minute) - parseInt(b.minute));

  if (allEvents.length > 0) {
    eventsHtml = `<div class="timeline-container">`;
    allEvents.forEach(e => {
      const itemClass = e.type === 'own-goal' ? 'own-goal' : e.type === 'goal-penalty' ? 'penalty' : '';
      const isOwnGoal = e.type === 'own-goal';
      const teamNameStr = isOwnGoal
        ? (e.team === 'home' ? awayData.vi : homeData.vi)
        : (e.team === 'home' ? homeData.vi : awayData.vi);
      const flagStr = isOwnGoal
        ? (e.team === 'home' ? awayData.flag : homeData.flag)
        : (e.team === 'home' ? homeData.flag : awayData.flag);
      const goalDetail = isOwnGoal ? ' (Phản lưới nhà)' : e.type === 'goal-penalty' ? ' (Penalty)' : '';

      eventsHtml += `
            <div class="timeline-item ${itemClass}">
              <div class="timeline-time">${e.minute}</div>
              <div class="timeline-player">${e.player}${goalDetail} <span style="font-size:11px; color:var(--text-muted); font-weight:normal;">(${flagStr} ${teamNameStr})</span></div>
            </div>
          `;
    });
    eventsHtml += `</div>`;
  } else {
    eventsHtml = `<div class="no-events-placeholder">Chưa có sự kiện ghi bàn diễn ra trong trận đấu này.</div>`;
  }

  const container = document.getElementById('modalDataContainer');
  container.innerHTML = `
        <div class="modal-match-header">
          <div class="modal-match-meta">${matchStage}</div>
          <div class="modal-score-board">
            <div class="modal-team-block">
              <span class="flag">${homeData.flag}</span>
              <span class="modal-team-name">${homeData.vi}</span>
            </div>
            <span class="modal-score-number">${homeScore}</span>
            <span class="modal-score-vs">vs</span>
            <span class="modal-score-number">${awayScore}</span>
            <div class="modal-team-block">
              <span class="flag">${awayData.flag}</span>
              <span class="modal-team-name">${awayData.vi}</span>
            </div>
          </div>
          <div class="modal-time-detail">
            <strong>Giờ địa phương:</strong> ${localTimeText} <br>
            <strong>Múi giờ VN (GMT+7):</strong> ${dateText} ${timeText ? `· ${timeText}` : ''}
          </div>
        </div>

        <div class="modal-panel active" style="margin-top: 20px;">
          <div class="modal-section-title" style="font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; font-size: 16px; color: var(--gold); border-left: 3px solid var(--gold); padding-left: 10px; margin-bottom: 15px; font-weight: 700; letter-spacing: 1px;">Sự kiện ghi bàn</div>
          ${eventsHtml}
          
          <div class="modal-section-title" style="font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; font-size: 16px; color: var(--gold); border-left: 3px solid var(--gold); padding-left: 10px; margin-top: 30px; margin-bottom: 15px; font-weight: 700; letter-spacing: 1px;">Thông tin sân vận động</div>
          <div class="stadium-card">
            <div class="stadium-icon">🏟️</div>
            <div class="stadium-info-content">
              <h4>${stadium.name}</h4>
              <p>
                <strong>Thành phố:</strong> ${stadium.city} <br>
                <strong>Sức chứa:</strong> ${stadium.capacity} chỗ ngồi <br>
                <em>${stadium.desc}</em>
              </p>
            </div>
          </div>
        </div>
      `;

  // Hiển thị Modal chi tiết trận đấu
  const modal = document.getElementById('matchModal');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden'; // Vô hiệu hóa cuộn trang chính
}

function closeMatchModal() {
  const modal = document.getElementById('matchModal');
  modal.classList.remove('show');
  document.body.style.overflow = ''; // Cho phép cuộn lại trang chính
}

// Highlight và cuộn tới trận đấu diễn ra ngày hôm nay
function highlightToday() {
  // Xóa highlight cũ
  document.querySelectorAll('.today-highlight').forEach(el => {
    el.classList.remove('today-highlight');
  });

  // Lấy ngày hôm nay theo múi giờ Việt Nam (GMT+7)
  const options = { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(new Date());
  const dd = parts.find(p => p.type === 'day').value;
  const mm = parts.find(p => p.type === 'month').value;
  const yyyy = parts.find(p => p.type === 'year').value;
  const todayStr = `${dd}/${mm}/${yyyy}`; // e.g. "12/06/2026"
  const todayStrShort = `${dd}/${mm}`; // e.g. "12/06"

  let highlightedElement = null;

  // 1. Kiểm tra vòng bảng
  const dayBlocks = document.querySelectorAll('.day-block');
  for (let block of dayBlocks) {
    const dateEl = block.querySelector('.day-date');
    if (dateEl && dateEl.innerText.includes(todayStr)) {
      block.classList.add('today-highlight');
      highlightedElement = block;
      break;
    }
  }

  // 2. Kiểm tra các trận đấu knockout
  if (!highlightedElement) {
    const koMatches = document.querySelectorAll('.ko-match');
    for (let match of koMatches) {
      const timeEl = match.querySelector('.ko-time span');
      if (timeEl && timeEl.innerText.trim().includes(todayStrShort)) {
        match.classList.add('today-highlight');
        highlightedElement = match;
        break;
      }
    }
  }

  // 3. Cuộn màn hình đến phần tử đó
  if (highlightedElement) {
    setTimeout(() => {
      highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }
}

// Khởi động khi tải xong trang
document.addEventListener('DOMContentLoaded', () => {
  initializeKnockoutMatches();
  makeStaticTeamsClickable();
  makeGroupTeamsClickable();
  updateStars();

  // Tự động thay thế 'Múi giờ VN' bằng 'GMT+7' cho các match card tĩnh ban đầu
  document.querySelectorAll('.match-card .match-time small').forEach(small => {
    if (small.innerHTML.includes('Múi giờ VN')) {
      small.innerHTML = small.innerHTML.replace('Múi giờ VN', 'GMT+7');
    }
  });

  fetchRealtimeSchedule();
  fetchStandings();
  updateFavCount();
  renderScorers();
  // Tự động làm mới mỗi 60 giây
  setInterval(fetchRealtimeSchedule, 60000);
});

// CÁC THAO TÁC HIỂN THỊ VÀ ẨN MODAL BẢNG XẾP HẠNG & VUA PHÁ LƯỚI
function openGroupsModal() {
  const modal = document.getElementById('groupsModal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeGroupsModal() {
  const modal = document.getElementById('groupsModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function openScorersModal() {
  const modal = document.getElementById('scorersModal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeScorersModal() {
  const modal = document.getElementById('scorersModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// Cuộn màn hình tới phần lịch thi đấu (ưu tiên trận đấu ngày hôm nay hoặc đầu lịch)
function scrollToSchedule() {
  const todayMatch = document.querySelector('.today-highlight, .match-card.today-highlight, .ko-match.today-highlight');
  let target = todayMatch;

  if (!target) {
    target = document.getElementById('scheduleContainer') || document.querySelector('.controls');
  }

  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Cuộn mượt màn hình lên đầu trang
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Bộ xử lý ẩn/hiện thanh điều hướng nhanh nổi (quick-nav-dock) khi người dùng cuộn trang
window.addEventListener('scroll', () => {
  const dock = document.querySelector('.quick-nav-dock');
  if (dock) {
    if (window.scrollY > 200) {
      dock.classList.add('visible');
    } else {
      dock.classList.remove('visible');
    }
  }
});

// Bộ lắng nghe sự kiện bấm phím Escape (Esc) để tự động đóng các cửa sổ Modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeGroupsModal();
    closeScorersModal();
    if (typeof closeMatchModal === 'function') {
      closeMatchModal();
    }
  }
});
