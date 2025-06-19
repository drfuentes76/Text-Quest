
const KEY='tq7_save';
function defState(){return{name:'Hero',cls:'warrior',zone:'Gate',hp:40,maxHp:40,mp:20,maxMp:20,atk:5,def:0,luck:0,gold:30,xp:0,lvl:1,turn:0,inv:['Potion'],spells:{},bossDefeated:{}};}
function load(){return JSON.parse(localStorage[KEY]||'null')||setup();}
function setup(){const sData=localStorage.tq7_setup?JSON.parse(localStorage.tq7_setup):{name:'Hero',cls:'warrior'};localStorage.removeItem('tq7_setup');const s=defState();s.name=sData.name;s.cls=sData.cls;if(s.cls==='thief')s.luck=3;save(s);return s;}
function save(x){localStorage[KEY]=JSON.stringify(x);}
let S=load();

const DATA={zones:{Gate:{d:'Gate',ex:{e:'Hills'},n:['Guard']},Hills:{d:'Hills',ex:{w:'Gate'},n:['Wolf','Wolf']}},npcs:{Guard:{n:'Guard',hp:20,atk:4,gold:5,loot:['Iron Ingot']},Wolf:{n:'Wolf',hp:15,atk:3,gold:2,loot:['Potion']}},items:{Potion:{price:10},'Iron Ingot':{price:6},Sword:{price:30}},shop:['Potion','Sword']};

/* HUD */
function hud(){const h=document.getElementById('hud');if(h)h.textContent=`${S.name} ${S.cls} HP${S.hp}/${S.maxHp} MP${S.mp}/${S.maxMp} Gold${S.gold}`;}

/* Charm */
let charmTurns=0;
function castCharm(){if(S.mp<6)return alert('MP');S.mp-=6;charmTurns=3;save(S);alert('Shopkeepers charmed!');}
function adjBuy(p){return charmTurns?Math.floor(p*0.7):p;}
function adjSell(p){return charmTurns?Math.floor(p*1.5):Math.floor(p/2);}

/* Cheats */
function cheatsExec(c){if(c==='duplicate'){openDupUI();return;}if(c==='charm'){castCharm();return;}}

/* Duplicate UI */
function openDupUI(){const w=document.createElement('div');w.style.cssText='position:fixed;inset:0;background:#000c;color:#fff;display:flex;flex-direction:column;align-items:center;overflow:auto;z-index:9999;padding:1rem';w.innerHTML='<h3>Duplicate</h3>';const f=document.createElement('form');const uniq=[...new Set(S.inv)];uniq.forEach(id=>{const row=document.createElement('label');row.innerHTML=`${id}<input type=number min=0 max=99 value=0>`;f.appendChild(row);});const ok=document.createElement('button');ok.textContent='OK';ok.type='submit';f.appendChild(ok);w.appendChild(f);document.body.appendChild(w);f.onsubmit=e=>{e.preventDefault();[...f.querySelectorAll('input')].forEach((inp,i)=>{for(let k=0;k<parseInt(inp.value||0);k++)S.inv.push(uniq[i]);});save(S);alert('done');w.remove();};}

/* Shop page */
function initShop(){hud();document.getElementById('charmNote').textContent=charmTurns?'Charm active!':'';
 const buy=document.getElementById('buy'),sell=document.getElementById('sell');
 DATA.shop.forEach(id=>{const d=document.createElement('div');d.textContent=`${id} ${adjBuy(DATA.items[id].price)}g`;const b=document.createElement('button');b.textContent='Buy';b.onclick=()=>{const cost=adjBuy(DATA.items[id].price);if(S.gold<cost)return alert('gold');S.gold-=cost;S.inv.push(id);save(S);hud();};d.appendChild(b);buy.appendChild(d);});
 [...new Set(S.inv)].forEach(id=>{const d=document.createElement('div');d.textContent=`${id}`;const b=document.createElement('button');b.textContent='Sell';b.onclick=()=>{S.gold+=adjSell(DATA.items[id]?.price||2);S.inv.splice(S.inv.indexOf(id),1);save(S);location.reload();};d.appendChild(b);sell.appendChild(d);});
 if(charmTurns)charmTurns--;save(S);}

/* World look */
function look(){const z=DATA.zones[S.zone];document.getElementById('desc').textContent=z.d;const np=document.getElementById('npcs');np.innerHTML='';z.n.forEach(e=>{const b=document.createElement('button');b.textContent=e;b.onclick=()=>alert('battle placeholder');np.appendChild(b);});}

document.addEventListener('DOMContentLoaded',()=>{
 const page=document.body.dataset.page;hud();
 if(page==='world'){look();['n','s','e','w'].forEach(d=>{const btn=document.getElementById(d);if(btn)btn.onclick=()=>{const dest=DATA.zones[S.zone].ex[d];if(dest){S.zone=dest;save(S);look();}};});}
 if(page==='shop'){initShop();}
});
