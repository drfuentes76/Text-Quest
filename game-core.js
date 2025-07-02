const zones={Gate:{d:'You are at the main gate.',ex:{e:'Hills'}},
Hills:{d:'You stand in grassy hills.',ex:{w:'Gate'},shop:true}};
let S={name:'Hero',cls:'warrior',zone:'Gate',gold:50,inv:['Potion']};
function save(){localStorage.S=JSON.stringify(S);}
function load(){S=JSON.parse(localStorage.S||JSON.stringify(S));}
load();
function look(){
 document.getElementById('hud').textContent=`${S.name} the ${S.cls} - ${S.zone}`;
 document.getElementById('desc').textContent=zones[S.zone].d;
}
document.addEventListener('DOMContentLoaded',()=>{
 const page=document.body.dataset.page;
 if(page==='shop'){let d=document.getElementById('buy');
 d.innerHTML='';['Sword','Potion'].forEach(i=>{
  let b=document.createElement('button');
  b.textContent='Buy '+i;b.onclick=()=>{S.inv.push(i);S.gold-=10;save();alert('Bought '+i);};
  d.appendChild(b);});}
});
