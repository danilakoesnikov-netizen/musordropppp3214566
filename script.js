// Состояние приложения
let state = {
  balance: 1000,
  inventory: [],
  selectedCase: null,
  minigame: {
    level: 1,
    currentHp: 100,
    maxHp: 100,
    damage: 10,
    autoDmg: 0,
    dmgCost: 50,
    autoCost: 150
  }
};

// База данных скинов
const SKINS_DB = [
  { id: 1, name: "P250 | Мусорный Плавник", price: 15, rarity: "mil-spec", color: "var(--rarity-milspec)", icon: "🔫" },
  { id: 2, name: "AK-47 | Ржавый Забор", price: 80, rarity: "restricted", color: "var(--rarity-restricted)", icon: "🔫" },
  { id: 3, name: "AWP | Старый Матрас", price: 250, rarity: "classified", color: "var(--rarity-classified)", icon: "︻╦╤─" },
  { id: 4, name: "M4A4 | Неоновый Мусор", price: 600, rarity: "covert", color: "var(--rarity-covert)", icon: "🔫" },
  { id: 5, name: "Нож-Бабочка | Мусорный Барон", price: 2500, rarity: "covert", color: "var(--rarity-covert)", icon: "🔪" },
  { id: 6, name: "Glock-18 | Пластиковый Пакет", price: 10, rarity: "mil-spec", color: "var(--rarity-milspec)", icon: "🔫" },
  { id: 7, name: "USP-S | Грязная Вода", price: 45, rarity: "restricted", color: "var(--rarity-restricted)", icon: "🔫" },
  { id: 8, name: "Desert Eagle | Картонный Кожух", price: 150, rarity: "classified", color: "var(--rarity-classified)", icon: "🔫" }
];

// База данных кейсов
const CASES_DB = [
  { id: 1, name: "Бомж Кейс", price: 30, icon: "📦" },
  { id: 2, name: "Мусорка Элиты", price: 100, icon: "🧰" },
  { id: 3, name: "Неоновый Взрыв", price: 300, icon: "💼" },
  { id: 4, name: "Secret DUMP", price: 800, icon: "🗄️" }
];

// Названия и иконки врагов
const ENEMIES = [
  { name: "Terrorist Bot", icon: "😈" },
  { name: "Heavy Trooper", icon: "🤖" },
  { name: "Trash Boss", icon: "👹" },
  { name: "Cyber Mutant", icon: "👽" }
];

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  renderCases();
  renderSkins(SKINS_DB);
  startLiveFeed();
  startAutoAttack();
});

// Навигация
function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  document.getElementById(pageId).classList.add('active');
  event.target.classList.add('active');
  
  if (pageId === 'profile') renderInventory();
}

// Рендер кейсов
function renderCases() {
  const container = document.getElementById('casesGrid');
  const homeContainer = document.getElementById('homeCasesGrid');
  
  const html = CASES_DB.map(c => `
    <div class="case-card" onclick="openRouletteModal(${c.id})">
      <div style="font-size: 50px;">${c.icon}</div>
      <h4>${c.name}</h4>
      <div class="price-tag">${c.price} ₽</div>
    </div>
  `).join('');

  container.innerHTML = html;
  homeContainer.innerHTML = html;
}

// Модалка Рулетки
function openRouletteModal(caseId) {
  state.selectedCase = CASES_DB.find(c => c.id === caseId);
  document.getElementById('modalCaseTitle').innerText = state.selectedCase.name;
  document.getElementById('casePrice').innerText = state.selectedCase.price;
  document.getElementById('dropResult').style.display = 'none';
  document.getElementById('openBtn').style.display = 'inline-block';
  
  const track = document.getElementById('rouletteTrack');
  track.style.transition = 'none';
  track.style.transform = 'translateX(0)';
  
  // Предзаполнение рулетки
  track.innerHTML = '';
  for(let i = 0; i < 30; i++) {
    const randomSkin = SKINS_DB[Math.floor(Math.random() * SKINS_DB.length)];
    track.appendChild(createRouletteItem(randomSkin));
  }

  document.getElementById('rouletteModal').style.display = 'flex';
}

function createRouletteItem(skin) {
  const el = document.createElement('div');
  el.className = 'roulette-item';
  el.style.borderBottom = `3px solid ${skin.color}`;
  el.innerHTML = `
    <div style="font-size:24px;">${skin.icon}</div>
    <div style="text-align:center; padding:0 2px;">${skin.name}</div>
  `;
  return el;
}

function closeRoulette() {
  document.getElementById('rouletteModal').style.display = 'none';
}

// Кручение кейса
function spinCase() {
  if (state.balance < state.selectedCase.price) {
    alert('Недостаточно средств на балансе!');
    return;
  }

  updateBalance(-state.selectedCase.price);
  document.getElementById('openBtn').style.display = 'none';

  const track = document.getElementById('rouletteTrack');
  const winningSkin = SKINS_DB[Math.floor(Math.random() * SKINS_DB.length)];
  
  // Добавляем победный скин на 24-ю позицию
  const items = track.children;
  items[23].innerHTML = createRouletteItem(winningSkin).innerHTML;
  items[23].style.borderBottom = `3px solid ${winningSkin.color}`;

  // Анимация
  const offset = 23 * 110 - 250; // Расчет смещения
  track.style.transition = 'transform 5s cubic-bezier(0.1, 1, 0.1, 1)';
  track.style.transform = `translateX(-${offset}px)`;

  setTimeout(() => {
    // Выпал скин
    state.inventory.push(winningSkin);
    showResult(winningSkin);
    addLiveFeedItem(winningSkin);
  }, 5200);
}

function showResult(skin) {
  const resContainer = document.getElementById('dropResult');
  const card = document.getElementById('resultCard');
  
  card.style.borderColor = skin.color;
  card.innerHTML = `
    <div style="font-size: 50px;">${skin.icon}</div>
    <h4>${skin.name}</h4>
    <div class="price-tag">${skin.price} ₽</div>
  `;
  
  resContainer.style.display = 'block';
}

// Рендер скинов в магазине
function renderSkins(skins) {
  const container = document.getElementById('skinsGrid');
  container.innerHTML = skins.map(s => `
    <div class="skin-card" style="border-bottom: 3px solid ${s.color}">
      <div style="font-size: 40px;">${s.icon}</div>
      <h4>${s.name}</h4>
      <div class="price-tag">${s.price} ₽</div>
      <button class="nav-btn" style="margin-top:10px; width:100%;" onclick="buySkin(${s.id})">Купить</button>
    </div>
  `).join('');
}

function filterSkins(rarity) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  if(rarity === 'all') {
    renderSkins(SKINS_DB);
  } else {
    renderSkins(SKINS_DB.filter(s => s.rarity === rarity));
  }
}

function buySkin(skinId) {
  const skin = SKINS_DB.find(s => s.id === skinId);
  if (state.balance >= skin.price) {
    updateBalance(-skin.price);
    state.inventory.push(skin);
    alert(`Вы успешно купили ${skin.name}!`);
  } else {
    alert('Недостаточно баланса!');
  }
}

// Профиль и Инвентарь
function renderInventory() {
  const container = document.getElementById('inventoryGrid');
  document.getElementById('invCount').innerText = state.inventory.length;

  if (state.inventory.length === 0) {
    container.innerHTML = `<p class="empty-msg">Ваш инвентарь пуст. Открывайте кейсы или покупайте скины!</p>`;
    return;
  }

  container.innerHTML = state.inventory.map((item, index) => `
    <div class="skin-card" style="border-bottom: 3px solid ${item.color}">
      <div style="font-size: 40px;">${item.icon}</div>
      <h4>${item.name}</h4>
      <div class="price-tag">${item.price} ₽</div>
      <button class="nav-btn" style="margin-top:10px; width:100%; background:#ef4444;" onclick="sellSkin(${index})">Продать</button>
    </div>
  `).join('');
}

function sellSkin(index) {
  const item = state.inventory[index];
  updateBalance(item.price);
  state.inventory.splice(index, 1);
  renderInventory();
}

// Баланс
function updateBalance(amount) {
  state.balance += amount;
  document.getElementById('balance').innerText = state.balance;
}

// МИНИ-ИГРА (Атака врагов)
function attackEnemy(e) {
  const g = state.minigame;
  g.currentHp -= g.damage;
  
  createFloatingDmg(e.clientX, e.clientY, `-${g.damage}`);

  if (g.currentHp <= 0) {
    // Победа над врагом
    updateBalance(g.level * 15);
    g.level++;
    g.maxHp = Math.floor(g.maxHp * 1.3);
    g.currentHp = g.maxHp;
    
    // Смена врага
    const enemyType = ENEMIES[(g.level - 1) % ENEMIES.length];
    document.getElementById('enemyName').innerText = `${enemyType.name} (Lvl ${g.level})`;
    document.getElementById('enemyAvatar').innerText = enemyType.icon;
  }

  updateGameUI();
}

function createFloatingDmg(x, y, text) {
  const el = document.createElement('div');
  el.className = 'floating-dmg';
  el.innerText = text;
  el.style.left = `${x - 10}px`;
  el.style.top = `${y - 20}px`;
  document.body.appendChild(el);

  setTimeout(() => el.remove(), 800);
}

function updateGameUI() {
  const g = state.minigame;
  document.getElementById('gameLevel').innerText = g.level;
  document.getElementById('gameDmg').innerText = g.damage;
  document.getElementById('currentHp').innerText = g.currentHp;
  document.getElementById('maxHp').innerText = g.maxHp;
  
  const hpPercent = Math.max(0, (g.currentHp / g.maxHp) * 100);
  document.getElementById('hpBar').style.width = `${hpPercent}%`;
}

function buyUpgrade(type) {
  const g = state.minigame;
  if (type === 'dmg' && state.balance >= g.dmgCost) {
    updateBalance(-g.dmgCost);
    g.damage += 5;
    g.dmgCost = Math.floor(g.dmgCost * 1.5);
    document.getElementById('upgDmgCost').innerText = g.dmgCost;
  } else if (type === 'auto' && state.balance >= g.autoCost) {
    updateBalance(-g.autoCost);
    g.autoDmg += 10;
    g.autoCost = Math.floor(g.autoCost * 1.6);
    document.getElementById('upgAutoCost').innerText = g.autoCost;
  }
  updateGameUI();
}

function startAutoAttack() {
  setInterval(() => {
    if (state.minigame.autoDmg > 0) {
      const g = state.minigame;
      g.currentHp -= g.autoDmg;
      if (g.currentHp <= 0) {
        updateBalance(g.level * 15);
        g.level++;
        g.maxHp = Math.floor(g.maxHp * 1.3);
        g.currentHp = g.maxHp;
      }
      updateGameUI();
    }
  }, 1000);
}

// Live Feed генератор
function startLiveFeed() {
  const track = document.getElementById('liveTrack');
  setInterval(() => {
    const randomSkin = SKINS_DB[Math.floor(Math.random() * SKINS_DB.length)];
    addLiveFeedItem(randomSkin);
  }, 3500);
}

function addLiveFeedItem(skin) {
  const track = document.getElementById('liveTrack');
  const item = document.createElement('div');
  item.className = 'live-item';
  item.style.borderBottomColor = skin.color;
  item.innerHTML = `${skin.icon} ${skin.name}`;
  
  track.insertBefore(item, track.firstChild);
  if (track.children.length > 8) {
    track.removeChild(track.lastChild);
  }
}