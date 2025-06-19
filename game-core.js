/* TextQuest v7+ full game logic */
const KEY='tq7_save';
function baseState(extra){
 return Object.assign({
  zone:'Gate',hp:40,maxHp:40,mp:20,maxMp:20,atk:5,def:0,gold:30,
  xp:0,lvl:1,turn:0,inv:['Potion'],quests:{},companion:null,
  spells:{boost:{lvl:1,cd:0,casts:0},fire:{lvl:1,cd:0,casts:0},shield:{lvl:1,cd:0,casts:0}}
 },extra);
}

function firstLoad(){
 let premade=localStorage.tq7_setup?JSON.parse(localStorage.tq7_setup):null;
 if(!premade) location.href='create.html';
 localStorage.removeItem('tq7_setup');
 return baseState(premade);
}

function load(){if(!localStorage[KEY]) return firstLoad(); return JSON.parse(localStorage[KEY]);}
function save(s){localStorage[KEY]=JSON.stringify(s);}
let S=load();

const DATA={
 zones:{
   Gate:{d:'You stand at the city gate.',ex:{e:'Hills'},n:['Guard']},
   Hills:{d:'Green hills with critters.',ex:{w:'Gate'},n:['Wolf','Wolf']}
 },
 npcs:{
   Guard:{n:'City Guard',hp:25,atk:4,gold:6,loot:['Iron Ingot']},
   Wolf:{n:'Rabid Wolf',hp:18,atk:3,gold:3,loot:['Potion']}
 },
 items:{
   Potion:{t:'potion',hp:15,price:10},
   'Iron Ingot':{t:'mat',price:6},
   Sword:{t:'weapon',atk:6,price:35},
   Shield:{t:'armor',def:2,price:25}
 },
 shop:['Potion','Sword','Shield'],
 spells:{
   boost:{n:'Boost',cost:5,base:85,inc:3,cd:3,e:l=>S.atk+=2*l},
   fire :{n:'Fireball',cost:8,base:80,inc:4,cd:2,e:l=>{winStack.dmg+=5*l}},
   shield:{n:'Holy Shield',cost:6,base:90,inc:2,cd:4,e:l=>S.def+=1*l}
 },
 classes:{warrior:{atk:2,def:1},cleric:{mp:5},wizard:{mp:10}},
 companionPool:[{name:'Wolf Pup',hp:15,atk:2},{name:'Forest Owl',hp:12,atk:1}]
};

if(DATA.classes[S.cls]){Object.assign(S,DATA.classes[S.cls]);save(S);}

const $=q=>document.querySelector(q);
function hud(){const h=$("#hud");if(h)h.textContent=`${S.name} the ${S.cls} | HP ${S.hp}/${S.maxHp} MP ${S.mp}/${S.maxMp} XP ${S.xp} Gold ${S.gold}`;}
function rand(n){return Math.floor(Math.random()*n);}
function addItem(i){S.inv.push(i);}
function hasItem(i){return S.inv.includes(i);}
function remItem(i){let idx=S.inv.indexOf(i);if(idx>-1)S.inv.splice(idx,1);}
function gainXP(x){S.xp+=x;if(S.xp>=50+S.lvl*25){S.xp=0;S.lvl++;S.maxHp+=5;S.atk++;S.hp=S.maxHp;}}
function tick(){S.turn++;Object.values(S.spells).forEach(s=>{if(s.cd)s.cd--});save(S);}

/* Navigation */
function look(){const z=DATA.zones[S.zone];$("#desc").textContent=`${z.d}`;const list=$("#npcs");list.innerHTML='';z.n.forEach((k,i)=>{const b=document.createElement('button');b.textContent=`${DATA.npcs[k].n} (${DATA.npcs[k].hp} HP)`;b.onclick=()=>{location.href='battle.html?enemy='+k;};list.appendChild(b);});}
function move(dir){const dest=DATA.zones[S.zone].ex[dir];if(dest){S.zone=dest;save(S);look();}else alert("Can't go");}

/* spells */
let winStack={dmg:0};
function cast(key){
 const spec=DATA.spells[key], st=S.spells[key];if(st.cd){alert("CD");return;}
 if(S.mp<spec.cost){alert("MP!");return;}
 let chance=spec.base+spec.inc*st.lvl;if(Math.random()*100>chance){alert("Fizzle");st.cd=1;return;}
 S.mp-=spec.cost;spec.e(st.lvl);st.casts++;if(st.casts%3===0&&st.lvl<5)st.lvl++;st.cd=spec.cd;tick();hud();alert(spec.n+"!");}

/* shop page builder */
function initShop(){
 hud();const buy=$("#buy"),sell=$("#sell");
 DATA.shop.forEach(id=>{const it=DATA.items[id],d=document.createElement('div');d.textContent=`${id} ${it.price}g`;const b=document.createElement('button');b.textContent='Buy';b.onclick=()=>{if(S.gold<it.price)return alert("gold");S.gold-=it.price;addItem(id);save(S);hud();};d.appendChild(b);buy.appendChild(d);});
 [...new Set(S.inv)].forEach(id=>{const cnt=S.inv.filter(x=>x===id).length,d=document.createElement('div');d.textContent=`${id} x${cnt}`;const b=document.createElement('button');b.textContent='Sell';b.onclick=()=>{S.gold+=Math.floor((DATA.items[id]?.price||2)/2);remItem(id);save(S);location.reload();};d.appendChild(b);sell.appendChild(d);});
}

/* battle page */
function battleInit(){
 const url=new URL(location.href);const enemyKey=url.searchParams.get('enemy')||'Wolf';
 let foes=DATA.zones[S.zone].n.map(k=>JSON.parse(JSON.stringify(DATA.npcs[k])));
 let log=$("#log");hud();draw();
 $("#atk").onclick=playerTurn;$("#spell").onclick=()=>{cast('fire');playerTurn();}
 function draw(){log.textContent='Enemies:\n'+foes.map((f,i)=>`${i+1}.${f.n} ${f.hp}HP`).join('\n');hud();}
 function playerTurn(){foes[0].hp-=S.atk+winStack.dmg;winStack.dmg=0;if(foes[0].hp<=0){foes.shift();if(!foes.length)return victory();}enemyTurn();}
 function enemyTurn(){foes.forEach(f=>{S.hp-=f.atk;});if(S.hp<=0)return defeat();tick();draw();}
 function victory(){alert("win");DATA.zones[S.zone].n=[];gainXP(15);save(S);location.href='index.html';}
 function defeat(){alert("dead");localStorage.clear();location.href='create.html';}
}

/* forge page */
function forgeInit(){hud();$("#forgeSword").onclick=()=>{if(!hasItem('Iron Ingot'))return alert('need ingot');remItem('Iron Ingot');addItem('Sword');save(S);alert('forged');};}

/* inv page */function invInit(){hud();const ul=$("#inv");S.inv.forEach(i=>{const li=document.createElement('li');li.textContent=i;ul.appendChild(li);});}

/* companion page */
function compInit(){hud();const c=$("#comp");if(!S.companion){const b=document.createElement('button');b.textContent='Adopt Pet';b.onclick=()=>{S.companion=JSON.parse(JSON.stringify(DATA.companionPool[rand(DATA.companionPool.length)]));save(S);location.reload();};c.appendChild(b);return;}c.textContent=`${S.companion.name}`;}

/* quests */
function qInit(){hud();const d=$("#qlist");Object.entries(DATA.quests).forEach(([id,q])=>{const st=S.quests[id]||{stage:0,done:false};const div=document.createElement('div');div.textContent=`${q.n} ${st.done?'✓':st.stage+'/'+q.goal}`;const btn=document.createElement('button');btn.textContent=st.stage? 'Progress':'Accept';btn.onclick=()=>{if(!st.stage)S.quests[id]={stage:0,done:false};else if(st.stage>=q.goal-1){S.quests[id].done=true;gainXP(q.reward.xp);S.gold+=q.reward.gold;}else S.quests[id].stage++;save(S);location.reload();};if(st.done)btn.disabled=true;div.appendChild(btn);d.appendChild(div);});}

/* global page attach */
document.addEventListener('DOMContentLoaded',()=>{
 const p=document.body.dataset.page;hud();
 if(p==='world'){look();['n','s','e','w'].forEach(dir=>{$('#'+dir)?.addEventListener('click',()=>move(dir));});}
 if(p==='shop')initShop();
 if(p==='battle')battleInit();
 if(p==='forge')forgeInit();
 if(p==='inv')invInit();
 if(p==='comp')compInit();
 if(p==='quests')qInit();
});
