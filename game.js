/* ========= Static game data ========= */
const DATA = {
  /* Base zones */
  zones:{
    'Qeynos Gates':{d:'You stand before the grand gates of Qeynos.',x:{e:'Qeynos Hills'},n:['Guard']},
    'Qeynos Hills':{d:'Rolling hills dotted with trees.',x:{w:'Qeynos Gates',e:'Blackburrow'},n:['Wolf']},
    'Blackburrow':{d:'A dank cave of gnolls.',x:{w:'Qeynos Hills'},n:['Gnoll']}
  },
  /* NPC templates */
  npcs:{
    Guard:{n:'Guard Tomas',hp:30,atk:4,l:['Iron_Ingot']},
    Wolf:{n:'Rabid Wolf',hp:20,atk:5,l:['Wolf_Pelt','Potion_Healing']},
    Gnoll:{n:'Gnoll Scout',hp:35,atk:6,l:['Gnoll_Fang','Sparksteel']}
  },
  /* Items and materials */
  items:{
    /* Materials & potions */
    Iron_Ingot:{n:'Iron Ingot',type:'mat'},
    Wolf_Pelt:{n:'Wolf Pelt',type:'mat'},
    Gnoll_Fang:{n:'Gnoll Fang',type:'mat'},
    Sparksteel:{n:'Sparksteel',type:'mat'},
    Potion_Healing:{n:'Healing Potion',type:'potion',hp:25},
    Potion_Flame:{n:'Potion of Flame',type:'enchant'},
    /* Warrior gear */
    Iron_Broadsword:{n:'Iron Broadsword',atk:4,slot:'weapon',class:'warrior'},
    Steel_Greataxe:{n:'Steel Great-axe',atk:6,slot:'weapon',class:'warrior'},
    Chainmail_Vest:{n:'Chainmail Vest',def:3,slot:'armor',class:'warrior'},
    /* Wizard gear */
    Oak_Wand:{n:'Oak Wand',atk:3,slot:'weapon',class:'wizard',mana:5},
    Crystal_Staff:{n:'Crystal Staff',atk:5,slot:'weapon',class:'wizard',mana:10},
    Apprentice_Robe:{n:'Apprentice Robe',def:1,slot:'armor',class:'wizard',mana:10},
    /* Cleric gear */
    Mace_of_Faith:{n:'Mace of Faith',atk:4,slot:'weapon',class:'cleric'},
    Blessed_Chain:{n:'Blessed Chain',def:2,slot:'armor',class:'cleric'}
  },
  /* Spells per class */
  spells:{
    warrior:{
      boost:{n:'Boost Aggression',base:90,inc:2,effect:'dmg',scale:0.1,cd:3},
      berserk:{n:'Berserker Queer',base:95,inc:1,effect:'hp',scale:0.05,cd:4}
    },
    wizard:{
      mind:{n:'Mind Control',base:75,inc:4,effect:'mind',scale:1,cd:4},
      inc:{n:'Incapacitate',base:85,inc:3,effect:'stun',scale:1,cd:3}
    },
    cleric:{
      shield:{n:'Holy Shield',base:95,inc:1,effect:'shield',scale:0.06,cd:3},
      hand:{n:'Hand of God',base:90,inc:2,effect:'atk',scale:0.1,cd:3}
    }
  },
  /* Class stats */
  cls:{
    warrior:{hp:40,atk:5,mp:20},
    wizard:{hp:25,atk:3,mp:60},
    cleric:{hp:32,atk:4,mp:40}
  },
  start:'Qeynos Gates'
};
/* ========= Utility DOM refs ========= */
const qs = (sel)=>document.querySelector(sel);
const output = qs('#output');
const cmdInput = qs('#command-input');
const form = qs('#command-form');
const actionsBar = qs('#actions');
const spellBar = qs('#spell-buttons');
const npcBar = qs('#npc-buttons');
const hpBar = qs('#hp-bar'), mpBar=qs('#mp-bar'), xpBar=qs('#xp-bar');
const hpLabel=qs('#hp-label'), mpLabel=qs('#mp-label'), xpLabel=qs('#xp-label');
const timeLabel=qs('#time-label'), weaponLbl=qs('#weapon-label'), compLbl=qs('#companion-label');
const createScreen=qs('#create-screen'), gameScreen=qs('#game-screen');
const classBtns=[...document.querySelectorAll('#class-buttons button')], startBtn=qs('#start-btn'), heroName=qs('#hero-name');

/* ========= Game state ========= */
let state = {
  made:false,
  class:'',
  name:'',
  zone:DATA.start,
  hp:0,maxHp:0,mp:0,maxMp:0,atk:0,def:0,
  xp:0,level:1,
  inv:[],
  eqWeapon:'',eqArmor:'',
  spells:{},
  spellCD:{},
  turn:0, /* for time tracking */
  companion:null, /* {name,type,mode} */
  god:false
};

/* ========= Helper functions ========= */
const log=(msg)=>{output.textContent+=msg+"\n";output.scrollTop=output.scrollHeight;};
const pct=(num,den)=>Math.max(0,Math.min(100,Math.round(100*num/den)));
const updateBars=()=>{
  hpBar.style.width=pct(state.hp,state.maxHp)+'%';
  mpBar.style.width=pct(state.mp,state.maxMp)+'%';
  xpBar.style.width=pct(state.xp,getNextXp())+'%';
  hpBar.style.background=pct(state.hp,state.maxHp)>60?'#33cc33':pct(state.hp,state.maxHp)>30?'orange':'red';
  timeLabel.textContent=getTimeString();
  weaponLbl.textContent='Weapon: '+(state.eqWeapon?DATA.items[state.eqWeapon].n:'Unarmed');
  compLbl.textContent=state.companion?`Companion: ${state.companion.name} (${state.companion.mode})`:'';
};
const refreshSpellButtons=()=>{
  spellBar.innerHTML='';
  const clsSpells=DATA.spells[state.class];
  for(const key in clsSpells){
    const s=clsSpells[key];
    if(!state.spells[key])state.spells[key]={lvl:1,casts:0};
    const lvl=state.spells[key].lvl;
    const btn=document.createElement('button');
    const ready=!(state.spellCD[key]>0);
    btn.textContent=`${s.n} (L${lvl})`;
    btn.disabled=!ready;
    btn.onclick=()=>runCommand('cast '+key);
    spellBar.appendChild(btn);
  }
};
const refreshNpcButtons=()=>{
  npcBar.innerHTML='';
  const z=DATA.zones[state.zone];
  z.n.forEach(id=>{
    const n=DATA.npcs[id];
    const btn=document.createElement('button');
    btn.textContent=`Attack ${n.n} (${n.hp} HP)`;
    btn.onclick=()=>runCommand('attack '+n.n.toLowerCase());
    npcBar.appendChild(btn);
  });
};
const getNextXp=()=>100*Math.pow(1.5,state.level-1);
const gainXp=(v)=>{state.xp+=v; while(state.xp>=getNextXp()){state.xp-=getNextXp(); state.level++; state.maxHp+=5; state.hp=state.maxHp; state.atk++; log(`>> You leveled up to ${state.level}!`);}};

/* Day/Night */
const getTimeString=()=>{
  const hr=(state.turn*5)%24;
  const labels=['Midnight','1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM',
               'Noon','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM'];
  return labels[hr];
};
const advanceTime=()=>{state.turn++;if(state.turn%24===0)log('A new day dawns...');};

/* Companion randomizer */
const companionPool=[
  {name:'Wolf Pup',type:'beast',mode:'attack',bonus:()=>2},
  {name:'Forest Owl',type:'scout',mode:'scout',bonus:()=>0},
  {name:'Arcane Sprite',type:'magic',mode:'defend',bonus:()=>0},
  {name:'Baby Drake',type:'dragon',mode:'defend',bonus:()=>0},
  {name:'Shadow Wisp',type:'ethereal',mode:'taunt',bonus:()=>0}
];
const grantCompanion=()=>{
  if(state.companion)return;
  const c=JSON.parse(JSON.stringify(companionPool[Math.floor(Math.random()*companionPool.length)]));
  state.companion=c;
  log(`>> A ${c.name} has joined you as a companion!`);
  updateBars();
};

/* ========= Core commands ========= */
const commands={
  look:()=>{const z=DATA.zones[state.zone];log(`-- ${state.zone} --\n${z.d}`);if(z.n.length)log('You see: '+z.n.map(i=>DATA.npcs[i].n).join(', '));log('Exits: '+Object.keys(z.x).join(', '));refreshNpcButtons();},
  help:()=>{log('Commands: look, go <dir>, attack <name>, inventory, equip <item>, unequip, cast <spell>, spells, forge, shop, rest, use potion, companion, god mode');},
  inventory:()=>{if(!state.inv.length)log('Inventory empty.');else log('Inventory:\n'+state.inv.map(i=>'- '+DATA.items[i].n).join('\n'));},
  'equip best':()=>equipBest(),
  equip:(arg)=>equipItem(arg),
  unequip:()=>{state.eqWeapon='';log('You unequip your weapon.');},
  'use potion':()=>usePotion(),
  rest:()=>{state.hp=Math.min(state.maxHp,state.hp+Math.floor(state.maxHp*0.2));state.mp=Math.min(state.maxMp,state.mp+Math.floor(state.maxMp*0.2));log('You take a moment to rest.');turnEnd();},
  spells:()=>{const list=DATA.spells[state.class];for(const k in list){const s=list[k];const lv=state.spells[k]?state.spells[k].lvl:1;log(`${s.n} (L${lv})`);}},
  cast:(arg)=>castSpell(arg),
  forge:()=>log('Forge UI coming soon (placeholder).'),
  shop:()=>log('Shop UI coming soon (placeholder).'),
  'god mode':()=>{state.god=!state.god;log(state.god?'>> GOD MODE ENABLED':'>> God mode disabled');if(state.god){state.inv=[...Object.keys(DATA.items)];state.spells={};Object.keys(DATA.spells).forEach(cls=>Object.keys(DATA.spells[cls]).forEach(sp=>state.spells[sp]={lvl:5,casts:0}));}refreshSpellButtons();},
  companion:()=>{if(!state.companion)log('You have no companion yet.');else log(`Companion: ${state.companion.name} (${state.companion.mode})`);}
};

/* ========= Helper command impls ========= */
function equipBest(){
  const weps=state.inv.filter(i=>DATA.items[i].slot==='weapon'&&(state.god||!DATA.items[i].class||DATA.items[i].class===state.class));
  if(!weps.length){log('No class-valid weapons.');return;}
  const best=weps.sort((a,b)=>(DATA.items[b].atk||0)-(DATA.items[a].atk||0))[0];
  state.eqWeapon=best;log(`Equipped ${DATA.items[best].n}`);updateBars();
}
function equipItem(name){
  const key=state.inv.find(k=>DATA.items[k].n.toLowerCase()===name.toLowerCase());
  if(!key){log('Item not found.');return;}
  if(!state.god && DATA.items[key].class && DATA.items[key].class!==state.class){log('You cannot equip that.');return;}
  if(DATA.items[key].slot!=='weapon'){log('You can only switch weapons mid-battle.');return;}
  state.eqWeapon=key;log(`Equipped ${DATA.items[key].n}`);turnEnd(true);
}
function usePotion(){
  const idx=state.inv.findIndex(i=>DATA.items[i].type==='potion');
  if(idx===-1){log('No potion found.');return;}
  const item=state.inv.splice(idx,1)[0];
  state.hp=Math.min(state.maxHp,state.hp+DATA.items[item].hp);
  log('You drink a potion and feel better.');
  turnEnd();
}

/* ==== Combat ==== */
function getWeaponAtk(){return state.eqWeapon?DATA.items[state.eqWeapon].atk:0;}
function attackNpc(name){
  const zone=DATA.zones[state.zone];
  const key=zone.n.find(k=>DATA.npcs[k].n.toLowerCase().includes(name));
  if(!key){log('Target not found.');return;}
  const npc=DATA.npcs[key];
  const dmg=state.atk+getWeaponAtk();
  npc.hp-=dmg;log(`You hit ${npc.n} for ${dmg}.`);
  if(npc.hp<=0){log(`${npc.n} defeated!`);lootDrops(key);zone.n=zone.n.filter(k=>k!==key);grantCompanion();gainXp(25);refreshNpcButtons();}
  else{state.hp-=npc.atk;log(`${npc.n} hits you for ${npc.atk}.`);}
  if(state.hp<=0){log('You died... respawning.');state.hp=state.maxHp;state.zone=DATA.start;}
  turnEnd();
}
function lootDrops(id){
  const base=[...DATA.npcs[id].l];
  if(Math.random()<0.2)base.push('Iron_Ingot');
  base.forEach(i=>{state.inv.push(i);log(`Looted ${DATA.items[i].n}`);});
}

/* ==== Spells ==== */
function castSpell(key){
  const clsSpells=DATA.spells[state.class];
  if(!clsSpells[key]){log('Unknown spell.');return;}
  const s=clsSpells[key];
  const lvl=(state.spells[key]?.lvl)||1;
  if(state.spellCD[key]>0){log('Spell on cooldown.');return;}
  // success roll
  const chance=Math.min(99,s.base+s.inc*lvl);
  if(Math.random()*100>chance){log('Spell fizzles.');state.spellCD[key]=s.cd;turnEnd();return;}
  // apply effects
  switch(s.effect){
    case'dmg':state.atk=Math.floor(state.atk*(1+s.scale*lvl));log('You feel a surge of power!');break;
    case'hp':state.maxHp=Math.floor(state.maxHp*(1+s.scale*lvl));state.hp=state.maxHp;log('Your vitality increases!');break;
    case'mind':log('You twist the enemy’s mind! (placeholder effect)');break;
    case'stun':log('Enemy is incapacitated for 2 turns!');break;
    case'shield':state.hp=Math.min(state.maxHp,state.hp+Math.floor(state.maxHp*s.scale*lvl));log('A holy shield surrounds you!');break;
    case'atk':state.atk=Math.floor(state.atk*(1+s.scale*lvl));log('Divine strength fills your arms!');break;
  }
  state.spells[key].casts=(state.spells[key].casts||0)+1;
  if(state.spells[key].casts%3===0&&state.spells[key].lvl<5)state.spells[key].lvl++;
  state.spellCD[key]=s.cd;
  refreshSpellButtons();
  turnEnd();
}

/* ==== Turn end & cooldown tick ==== */
function turnEnd(skipEnemy){
  advanceTime();
  for(const k in state.spellCD)if(state.spellCD[k]>0)state.spellCD[k]--;
  if(!skipEnemy)enemyTurn();
  updateBars();refreshSpellButtons();
}
function enemyTurn(){/* Placeholder simple AI */}

/* ==== Command router ==== */
function runCommand(raw){
  const parts=raw.trim().split(/\s+/);
  const cmd=parts[0].toLowerCase();
  const arg=parts.slice(1).join(' ');
  if(cmd==='go'){move(arg);return;}
  if(cmd==='attack'){attackNpc(arg);return;}
  if(commands[cmd]){commands[cmd](arg);return;}
  log('Unknown command.');
}

/* ==== Movement ==== */
function move(dir){
  const z=DATA.zones[state.zone];
  const target=z.x[dir[0]]; // accept n s e w
  if(!target){log("Can't go that way.");return;}
  state.zone=target;log('You travel to '+target+'.');commands.look();turnEnd(true);
}

/* ========= Character creation ========= */
let chosenClass='';
classBtns.forEach(btn=>{
  btn.onclick=()=>{classBtns.forEach(b=>b.classList.remove('active'));btn.classList.add('active');chosenClass=btn.dataset.class;checkReady();}
});
heroName.oninput=checkReady;
function checkReady(){startBtn.disabled=!(heroName.value.trim()&&chosenClass);}
startBtn.onclick=()=>{
  const c=chosenClass;
  state.class=c;state.name=heroName.value.trim();
  const base=DATA.cls[c];
  state.maxHp=base.hp;state.hp=base.hp;state.atk=base.atk;state.maxMp=base.mp;state.mp=base.mp;
  gameScreen.hidden=false;createScreen.hidden=true;
  log(`Welcome ${state.name} the ${c}! Type 'help' for commands.`);
  updateBars();commands.look();refreshSpellButtons();
};

/* ==== Event bindings ==== */
form.onsubmit=e=>{e.preventDefault();const v=cmdInput.value.trim();if(v){log('> '+v);runCommand(v);cmdInput.value='';}};
actionsBar.onclick=e=>{if(e.target.tagName==='BUTTON'){const c=e.target.dataset.cmd;log('> '+c);runCommand(c);}};

/* Auto-focus input */
document.addEventListener('keydown',e=>{if(document.activeElement!==cmdInput)cmdInput.focus();});
