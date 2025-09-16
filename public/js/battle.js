/**
 * Pokemon Showdown Battle
 *
 * This is the main file for handling battle animations
 *
 * Licensing note: PS's client has complicated licensing:
 * - The client as a whole is AGPLv3
 * - The battle replay/animation engine (battle-*.ts) by itself is MIT
 *
 * Layout:
 *
 * - Battle
 *   - Side
 *     - Pokemon
 *   - BattleScene
 *     - BattleLog
 *       - BattleTextParser
 *
 * When a Battle receives a message, it splits the message into tokens
 * and parses what happens, updating its own state, and then telling
 * BattleScene to do any relevant animations. The tokens then get
 * passed directly into BattleLog. If the message is an in-battle
 * message, it'll be extracted by BattleTextParser, which adds it to
 * both the battle log itself, as well as the messagebar.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */var











Pokemon=function(){






































































function Pokemon(data,side){this.name='';this.speciesForme='';this.ident='';this.details='';this.searchid='';this.side=void 0;this.slot=0;this.fainted=false;this.hp=0;this.maxhp=1000;this.level=100;this.gender='N';this.shiny=false;this.hpcolor='g';this.moves=[];this.ability='';this.baseAbility='';this.item='';this.itemEffect='';this.prevItem='';this.prevItemEffect='';this.terastallized='';this.teraType='';this.boosts={};this.status='';this.statusStage=0;this.volatiles={};this.turnstatuses={};this.movestatuses={};this.lastMove='';this.moveTrack=[];this.statusData={sleepTurns:0,toxicTurns:0};this.timesAttacked=0;this.sprite=void 0;
this.side=side;
this.speciesForme=data.speciesForme;

this.details=data.details;
this.name=data.name;
this.level=data.level;
this.shiny=data.shiny;
this.gender=data.gender||'N';
this.ident=data.ident;
this.terastallized=data.terastallized||'';
this.searchid=data.searchid;

this.sprite=side.battle.scene.addPokemonSprite(this);
}var _proto=Pokemon.prototype;_proto.

isActive=function isActive(){
return this.side.active.includes(this);
};_proto.


getHPColor=function getHPColor(){
if(this.hpcolor)return this.hpcolor;
var ratio=this.hp/this.maxhp;
if(ratio>0.5)return'g';
if(ratio>0.2)return'y';
return'r';
};_proto.

getHPColorClass=function getHPColorClass(){
switch(this.getHPColor()){
case'y':return'hpbar hpbar-yellow';
case'r':return'hpbar hpbar-red';
}
return'hpbar';
};Pokemon.
getPixelRange=function getPixelRange(pixels,color){
var epsilon=0.5/714;

if(pixels===0)return[0,0];
if(pixels===1)return[0+epsilon,2/48-epsilon];
if(pixels===9){
if(color==='y'){
return[0.2+epsilon,10/48-epsilon];
}else{
return[9/48,0.2];
}
}
if(pixels===24){
if(color==='g'){
return[0.5+epsilon,25/48-epsilon];
}else{
return[0.5,0.5];
}
}
if(pixels===48)return[1,1];

return[pixels/48,(pixels+1)/48-epsilon];
};Pokemon.
getFormattedRange=function getFormattedRange(range,precision,separator){
if(range[0]===range[1]){
var percentage=Math.abs(range[0]*100);
if(Math.floor(percentage)===percentage){
return percentage+'%';
}
return percentage.toFixed(precision)+'%';
}
var lower;
var upper;
if(precision===0){
lower=Math.floor(range[0]*100);
upper=Math.ceil(range[1]*100);
}else{
lower=(range[0]*100).toFixed(precision);
upper=(range[1]*100).toFixed(precision);
}
return''+lower+separator+upper+'%';
};_proto.

getDamageRange=function getDamageRange(damage){
if(damage[1]!==48){
var ratio=damage[0]/damage[1];
return[ratio,ratio];
}else if(damage.length===undefined){


return[damage[2]/100,damage[2]/100];
}

var oldrange=Pokemon.getPixelRange(damage[3],damage[4]);
var newrange=Pokemon.getPixelRange(damage[3]+damage[0],this.hpcolor);
if(damage[0]===0){

return[0,newrange[1]-newrange[0]];
}
if(oldrange[0]<newrange[0]){
var r=oldrange;
oldrange=newrange;
newrange=r;
}
return[oldrange[0]-newrange[1],oldrange[1]-newrange[0]];
};_proto.
healthParse=function healthParse(hpstring,parsedamage,heal)
{

if(!hpstring||!hpstring.length)return null;
var parenIndex=hpstring.lastIndexOf('(');
if(parenIndex>=0){

if(parsedamage){
var damage=parseFloat(hpstring);

if(isNaN(damage))damage=50;
if(heal){
this.hp+=this.maxhp*damage/100;
if(this.hp>this.maxhp)this.hp=this.maxhp;
}else{
this.hp-=this.maxhp*damage/100;
}

var ret=this.healthParse(hpstring);
if(ret&&ret[1]===100){

return[damage,100,damage];
}

var percent=Math.round(Math.ceil(damage*48/100)/48*100);
var pixels=Math.ceil(damage*48/100);
return[pixels,48,percent];
}
if(hpstring.substr(hpstring.length-1)!==')'){
return null;
}
hpstring=hpstring.substr(parenIndex+1,hpstring.length-parenIndex-2);
}

var oldhp=this.fainted?0:this.hp||1;
var oldmaxhp=this.maxhp;
var oldwidth=this.hpWidth(100);
var oldcolor=this.hpcolor;

this.side.battle.parseHealth(hpstring,this);
if(oldmaxhp===0){
oldmaxhp=oldhp=this.maxhp;
}

var oldnum=oldhp?Math.floor(this.maxhp*oldhp/oldmaxhp)||1:0;
var delta=this.hp-oldnum;
var deltawidth=this.hpWidth(100)-oldwidth;
return[delta,this.maxhp,deltawidth,oldnum,oldcolor];
};_proto.
checkDetails=function checkDetails(details){
if(!details)return false;
if(details===this.details)return true;
if(this.searchid)return false;
if(details.indexOf(', shiny')>=0){
if(this.checkDetails(details.replace(', shiny','')))return true;
}

details=details.replace(/(-[A-Za-z0-9-]+)?(, |$)/,'-*$2');
return details===this.details;
};_proto.
getIdent=function getIdent(){
var slots=['a','b','c','d','e','f'];
return this.ident.substr(0,2)+slots[this.slot]+this.ident.substr(2);
};_proto.
removeVolatile=function removeVolatile(volatile){
this.side.battle.scene.removeEffect(this,volatile);
if(!this.hasVolatile(volatile))return;
delete this.volatiles[volatile];
};_proto.
addVolatile=function addVolatile(volatile){for(var _len=arguments.length,args=new Array(_len>1?_len-1:0),_key=1;_key<_len;_key++){args[_key-1]=arguments[_key];}
if(this.hasVolatile(volatile)&&!args.length)return;
this.volatiles[volatile]=[volatile].concat(args);
this.side.battle.scene.addEffect(this,volatile);
};_proto.
hasVolatile=function hasVolatile(volatile){
return!!this.volatiles[volatile];
};_proto.
removeTurnstatus=function removeTurnstatus(volatile){
this.side.battle.scene.removeEffect(this,volatile);
if(!this.hasTurnstatus(volatile))return;
delete this.turnstatuses[volatile];
};_proto.
addTurnstatus=function addTurnstatus(volatile){
volatile=toID(volatile);
this.side.battle.scene.addEffect(this,volatile);
if(this.hasTurnstatus(volatile))return;
this.turnstatuses[volatile]=[volatile];
};_proto.
hasTurnstatus=function hasTurnstatus(volatile){
return!!this.turnstatuses[volatile];
};_proto.
clearTurnstatuses=function clearTurnstatuses(){
for(var id in this.turnstatuses){
this.removeTurnstatus(id);
}
this.turnstatuses={};
this.side.battle.scene.updateStatbar(this);
};_proto.
removeMovestatus=function removeMovestatus(volatile){
this.side.battle.scene.removeEffect(this,volatile);
if(!this.hasMovestatus(volatile))return;
delete this.movestatuses[volatile];
};_proto.
addMovestatus=function addMovestatus(volatile){
volatile=toID(volatile);
if(this.hasMovestatus(volatile))return;
this.movestatuses[volatile]=[volatile];
this.side.battle.scene.addEffect(this,volatile);
};_proto.
hasMovestatus=function hasMovestatus(volatile){
return!!this.movestatuses[volatile];
};_proto.
clearMovestatuses=function clearMovestatuses(){
for(var id in this.movestatuses){
this.removeMovestatus(id);
}
this.movestatuses={};
};_proto.
clearVolatiles=function clearVolatiles(){
this.volatiles={};
this.clearTurnstatuses();
this.clearMovestatuses();
this.side.battle.scene.clearEffects(this);
};_proto.
rememberMove=function rememberMove(moveName){var pp=arguments.length>1&&arguments[1]!==undefined?arguments[1]:1;var recursionSource=arguments.length>2?arguments[2]:undefined;
if(recursionSource===this.ident)return;
moveName=Dex.moves.get(moveName).name;
if(moveName.charAt(0)==='*')return;
if(moveName==='Struggle')return;
if(this.volatiles.transform){

if(!recursionSource)recursionSource=this.ident;
this.volatiles.transform[1].rememberMove(moveName,0,recursionSource);
moveName='*'+moveName;
}for(var _i2=0,_this$moveTrack2=
this.moveTrack;_i2<_this$moveTrack2.length;_i2++){var entry=_this$moveTrack2[_i2];
if(moveName===entry[0]){
entry[1]+=pp;
if(entry[1]<0)entry[1]=0;
return;
}
}
this.moveTrack.push([moveName,pp]);
};_proto.
rememberAbility=function rememberAbility(ability,isNotBase){
ability=Dex.abilities.get(ability).name;
this.ability=ability;
if(!this.baseAbility&&!isNotBase){
this.baseAbility=ability;
}
};_proto.
getBoost=function getBoost(boostStat){
var boostStatTable={
atk:'Atk',
def:'Def',
spa:'SpA',
spd:'SpD',
spe:'Spe',
accuracy:'Accuracy',
evasion:'Evasion',
spc:'Spc'
};
if(!this.boosts[boostStat]){
return'1&times;&nbsp;'+boostStatTable[boostStat];
}
if(this.boosts[boostStat]>6)this.boosts[boostStat]=6;
if(this.boosts[boostStat]<-6)this.boosts[boostStat]=-6;
var isRBY=this.side.battle.gen<=1&&!this.side.battle.tier.includes('Stadium');
if(!isRBY&&(boostStat==='accuracy'||boostStat==='evasion')){
if(this.boosts[boostStat]>0){
var goodBoostTable=[
'1&times;','1.33&times;','1.67&times;','2&times;','2.33&times;','2.67&times;','3&times;'];


return''+goodBoostTable[this.boosts[boostStat]]+'&nbsp;'+boostStatTable[boostStat];
}
var _badBoostTable=[
'1&times;','0.75&times;','0.6&times;','0.5&times;','0.43&times;','0.38&times;','0.33&times;'];


return''+_badBoostTable[-this.boosts[boostStat]]+'&nbsp;'+boostStatTable[boostStat];
}
if(this.boosts[boostStat]>0){
var _goodBoostTable=[
'1&times;','1.5&times;','2&times;','2.5&times;','3&times;','3.5&times;','4&times;'];


return''+_goodBoostTable[this.boosts[boostStat]]+'&nbsp;'+boostStatTable[boostStat];
}
var badBoostTable=[
'1&times;','0.67&times;','0.5&times;','0.4&times;','0.33&times;','0.29&times;','0.25&times;'];


return''+badBoostTable[-this.boosts[boostStat]]+'&nbsp;'+boostStatTable[boostStat];
};_proto.
getWeightKg=function getWeightKg(serverPokemon){var _this$volatiles$autot;
var autotomizeFactor=((_this$volatiles$autot=this.volatiles.autotomize)==null?void 0:_this$volatiles$autot[1])*100||0;
return Math.max(this.getSpecies(serverPokemon).weightkg-autotomizeFactor,0.1);
};_proto.
getBoostType=function getBoostType(boostStat){
if(!this.boosts[boostStat])return'neutral';
if(this.boosts[boostStat]>0)return'good';
return'bad';
};_proto.
clearVolatile=function clearVolatile(){
this.ability=this.baseAbility;
this.boosts={};
this.clearVolatiles();
for(var i=0;i<this.moveTrack.length;i++){
if(this.moveTrack[i][0].charAt(0)==='*'){
this.moveTrack.splice(i,1);
i--;
}
}

this.statusStage=0;
this.statusData.toxicTurns=0;
if(this.side.battle.gen===5)this.statusData.sleepTurns=0;
};_proto.





copyVolatileFrom=function copyVolatileFrom(pokemon,copySource){
this.boosts=pokemon.boosts;
this.volatiles=pokemon.volatiles;

if(!copySource){
var volatilesToRemove=[
'airballoon','attract','autotomize','disable','encore','foresight','gmaxchistrike','imprison','laserfocus','mimic','miracleeye','nightmare','saltcure','smackdown','stockpile1','stockpile2','stockpile3','syrupbomb','torment','typeadd','typechange','yawn','sharpen1','sharpen2','sharpen3'];for(var _i4=0,_Dex$statNamesExceptH2=

Dex.statNamesExceptHP;_i4<_Dex$statNamesExceptH2.length;_i4++){var statName=_Dex$statNamesExceptH2[_i4];
volatilesToRemove.push('protosynthesis'+statName);
volatilesToRemove.push('quarkdrive'+statName);
}for(var _i6=0;_i6<
volatilesToRemove.length;_i6++){var volatile=volatilesToRemove[_i6];
delete this.volatiles[volatile];
}
}
if(copySource==='shedtail'){
for(var i in this.volatiles){
if(i==='substitute')continue;
delete this.volatiles[i];
}
this.boosts={};
}
delete this.volatiles['transform'];
delete this.volatiles['formechange'];

pokemon.boosts={};
pokemon.volatiles={};
pokemon.side.battle.scene.removeTransform(pokemon);
pokemon.statusStage=0;
};_proto.
copyTypesFrom=function copyTypesFrom(pokemon){var preterastallized=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;
var _pokemon$getTypes=pokemon.getTypes(undefined,preterastallized),types=_pokemon$getTypes[0],addedType=_pokemon$getTypes[1];
this.addVolatile('typechange',types.join('/'));
if(addedType){
this.addVolatile('typeadd',addedType);
}else{
this.removeVolatile('typeadd');
}
};_proto.
getTypes=function getTypes(serverPokemon){var preterastallized=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;
var types;
if(this.terastallized&&!preterastallized){
types=[this.terastallized];
}else if(this.volatiles.typechange){
types=this.volatiles.typechange[1].split('/');
}else{
types=this.getSpecies(serverPokemon).types;
}
if(this.hasTurnstatus('roost')&&types.includes('Flying')){
types=types.filter(function(typeName){return typeName!=='Flying';});
if(!types.length)types=['Normal'];
}
var addedType=this.volatiles.typeadd?this.volatiles.typeadd[1]:'';
return[types,addedType];
};_proto.
isGrounded=function isGrounded(serverPokemon){
var battle=this.side.battle;
if(battle.hasPseudoWeather('Gravity')){
return true;
}else if(this.volatiles['ingrain']&&battle.gen>=4){
return true;
}else if(this.volatiles['smackdown']){
return true;
}

var item=toID(serverPokemon?serverPokemon.item:this.item);
var ability=toID(this.effectiveAbility(serverPokemon));
if(battle.hasPseudoWeather('Magic Room')||this.volatiles['embargo']||ability==='klutz'){
item='';
}

if(item==='ironball'){
return true;
}
if(ability==='levitate'){
return false;
}
if(this.volatiles['magnetrise']||this.volatiles['telekinesis']){
return false;
}
if(item==='airballoon'){
return false;
}
return!this.getTypeList(serverPokemon).includes('Flying');
};_proto.
effectiveAbility=function effectiveAbility(serverPokemon){
if(this.fainted||this.volatiles['gastroacid'])return'';
var ability=this.side.battle.dex.abilities.get(
(serverPokemon==null?void 0:serverPokemon.ability)||this.ability||(serverPokemon==null?void 0:serverPokemon.baseAbility)||''
);
if(this.side.battle.ngasActive()&&!ability.isPermanent){
return'';
}
return ability.name;
};_proto.
getTypeList=function getTypeList(serverPokemon){var preterastallized=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;
var _this$getTypes=this.getTypes(serverPokemon,preterastallized),types=_this$getTypes[0],addedType=_this$getTypes[1];
return addedType?types.concat(addedType):types;
};_proto.
getSpeciesForme=function getSpeciesForme(serverPokemon){
return this.volatiles.formechange?this.volatiles.formechange[1]:
serverPokemon?serverPokemon.speciesForme:this.speciesForme;
};_proto.
getSpecies=function getSpecies(serverPokemon){
return this.side.battle.dex.species.get(this.getSpeciesForme(serverPokemon));
};_proto.
getBaseSpecies=function getBaseSpecies(){
return this.side.battle.dex.species.get(this.speciesForme);
};_proto.
reset=function reset(){
this.clearVolatile();
this.hp=this.maxhp;
this.fainted=false;
this.status='';
this.moveTrack=[];
this.name=this.name||this.speciesForme;
};_proto.






hpWidth=function hpWidth(maxWidth){
if(this.fainted||!this.hp)return 0;


if(this.hp===1&&this.maxhp>45)return 1;

if(this.maxhp===48){



var range=Pokemon.getPixelRange(this.hp,this.hpcolor);
var ratio=(range[0]+range[1])/2;
return Math.round(maxWidth*ratio)||1;
}
var percentage=Math.ceil(100*this.hp/this.maxhp);
if(percentage===100&&this.hp<this.maxhp){
percentage=99;
}
return percentage*maxWidth/100;
};_proto.
getHPText=function getHPText(){var precision=arguments.length>0&&arguments[0]!==undefined?arguments[0]:1;
return Pokemon.getHPText(this,precision);
};Pokemon.
getHPText=function getHPText(pokemon){var precision=arguments.length>1&&arguments[1]!==undefined?arguments[1]:1;
if(pokemon.maxhp===100)return pokemon.hp+'%';
if(pokemon.maxhp!==48)return(100*pokemon.hp/pokemon.maxhp).toFixed(precision)+'%';
var range=Pokemon.getPixelRange(pokemon.hp,pokemon.hpcolor);
return Pokemon.getFormattedRange(range,precision,'–');
};_proto.
destroy=function destroy(){
if(this.sprite)this.sprite.destroy();
this.sprite=null;
this.side=null;
};return Pokemon;}();var


Side=function(){



























function Side(battle,n){this.battle=void 0;this.name='';this.id='';this.sideid=void 0;this.n=void 0;this.isFar=void 0;this.foe=null;this.ally=null;this.avatar='unknown';this.rating='';this.badges=[];this.totalPokemon=6;this.x=0;this.y=0;this.z=0;this.missedPokemon=null;this.wisher=null;this.active=[null];this.lastPokemon=null;this.pokemon=[];this.sideConditions={};this.faintCounter=0;
this.battle=battle;
this.n=n;
this.sideid=['p1','p2','p3','p4'][n];
this.isFar=!!(n%2);
}var _proto2=Side.prototype;_proto2.

rollTrainerSprites=function rollTrainerSprites(){
var sprites=['lucas','dawn','ethan','lyra','hilbert','hilda'];
this.avatar=sprites[Math.floor(Math.random()*sprites.length)];
};_proto2.

behindx=function behindx(offset){
return this.x+(!this.isFar?-1:1)*offset;
};_proto2.
behindy=function behindy(offset){
return this.y+(!this.isFar?1:-1)*offset;
};_proto2.
leftof=function leftof(offset){
return(!this.isFar?-1:1)*offset;
};_proto2.
behind=function behind(offset){
return this.z+(!this.isFar?-1:1)*offset;
};_proto2.

clearPokemon=function clearPokemon(){for(var _i8=0,_this$pokemon2=
this.pokemon;_i8<_this$pokemon2.length;_i8++){var pokemon=_this$pokemon2[_i8];pokemon.destroy();}
this.pokemon=[];
for(var i=0;i<this.active.length;i++)this.active[i]=null;
this.lastPokemon=null;
};_proto2.
reset=function reset(){
this.clearPokemon();
this.sideConditions={};
this.faintCounter=0;
};_proto2.
setAvatar=function setAvatar(avatar){
this.avatar=avatar;
};_proto2.
setName=function setName(name,avatar){
if(name)this.name=name;
this.id=toID(this.name);
if(avatar){
this.setAvatar(avatar);
}else{
this.rollTrainerSprites();
if(this.foe&&this.avatar===this.foe.avatar)this.rollTrainerSprites();
}
};_proto2.
addSideCondition=function addSideCondition(effect,persist){
var condition=effect.id;
if(this.sideConditions[condition]){
if(condition==='spikes'||condition==='toxicspikes'||condition==='luckyroll'){
this.sideConditions[condition][1]++;
}
this.battle.scene.addSideCondition(this.n,condition);
return;
}

switch(condition){
case'auroraveil':
this.sideConditions[condition]=[effect.name,1,5,8];
break;
case'reflect':
this.sideConditions[condition]=[effect.name,1,5,this.battle.gen>=4?8:0];
break;
case'safeguard':
this.sideConditions[condition]=[effect.name,1,persist?7:5,0];
break;
case'lightscreen':
this.sideConditions[condition]=[effect.name,1,5,this.battle.gen>=4?8:0];
break;
case'mist':
this.sideConditions[condition]=[effect.name,1,5,0];
break;
case'tailwind':
this.sideConditions[condition]=[effect.name,1,this.battle.gen>=5?persist?6:4:persist?5:3,0];
break;
case'backdraft':
this.sideConditions[condition]=[effect.name,1,2,0];
break;
case'luckychant':
this.sideConditions[condition]=[effect.name,1,5,0];
break;
case'maplewarrior':
case'haste':
case'combatorders':
case'sharpeyes':
this.sideConditions[condition]=[effect.name,1,4,0];
break;
case'runeofluck0':
this.sideConditions[condition]=['Rune of Luck (0/3)',1,0,0];
break;
case'runeofluck1':
this.sideConditions[condition]=['Rune of Luck (1/3)',1,0,0];
break;
case'runeofluck2':
this.sideConditions[condition]=['Rune of Luck (2/3)',1,0,0];
break;
case'runeofluck3':
this.sideConditions[condition]=['Rune of Luck (3/3)',1,0,0];
break;
case'runeofprotection0':
this.sideConditions[condition]=['Rune of Protection (0/3)',1,0,0];
break;
case'runeofprotection1':
this.sideConditions[condition]=['Rune of Protection (1/3)',1,0,0];
break;
case'runeofprotection2':
this.sideConditions[condition]=['Rune of Protection (2/3)',1,0,0];
break;
case'runeofprotection3':
this.sideConditions[condition]=['Rune of Protection (3/3)',1,0,0];
break;
case'runeofmending0':
this.sideConditions[condition]=['Rune of Mending (0/3)',1,0,0];
break;
case'runeofmending1':
this.sideConditions[condition]=['Rune of Mending (1/3)',1,0,0];
break;
case'runeofmending2':
this.sideConditions[condition]=['Rune of Mending (2/3)',1,0,0];
break;
case'runeofmending3':
this.sideConditions[condition]=['Rune of Mending (3/3)',1,0,0];
break;
case'stealthrock':
case'spikes':
case'toxicspikes':
case'stickyweb':
case'sleazyspores':
case'pleasedontdothat':
case'landmind':
case'luckyroll':
this.sideConditions[condition]=[effect.name,1,0,0];
break;
case'gmaxwildfire':
case'gmaxvolcalith':
case'gmaxvinelash':
case'gmaxcannonade':
this.sideConditions[condition]=[effect.name,1,4,0];
break;
case'grasspledge':
this.sideConditions[condition]=['Swamp',1,4,0];
break;
case'waterpledge':
this.sideConditions[condition]=['Rainbow',1,4,0];
break;
case'firepledge':
this.sideConditions[condition]=['Sea of Fire',1,4,0];
break;
case'densefog':
this.sideConditions[condition]=[effect.name,1,5,5];
default:
this.sideConditions[condition]=[effect.name,1,0,0];
break;
}
this.battle.scene.addSideCondition(this.n,condition);
};_proto2.
removeSideCondition=function removeSideCondition(condition){
var id=toID(condition);
if(!this.sideConditions[id])return;
delete this.sideConditions[id];
this.battle.scene.removeSideCondition(this.n,id);
};_proto2.
addPokemon=function addPokemon(name,ident,details){var replaceSlot=arguments.length>3&&arguments[3]!==undefined?arguments[3]:-1;
var oldItem=replaceSlot>=0?this.pokemon[replaceSlot].item:undefined;

var data=this.battle.parseDetails(name,ident,details);
var poke=new Pokemon(data,this);
if(oldItem)poke.item=oldItem;

if(!poke.ability&&poke.baseAbility)poke.ability=poke.baseAbility;
poke.reset();

if(replaceSlot>=0){
this.pokemon[replaceSlot]=poke;
}else{
this.pokemon.push(poke);
}
if(this.pokemon.length>this.totalPokemon||this.battle.speciesClause){

var existingTable={};
var toRemove=-1;
for(var poke1i=0;poke1i<this.pokemon.length;poke1i++){
var poke1=this.pokemon[poke1i];
if(!poke1.searchid)continue;
if(poke1.searchid in existingTable){
var poke2i=existingTable[poke1.searchid];
var poke2=this.pokemon[poke2i];
if(poke===poke1){
toRemove=poke2i;
}else if(poke===poke2){
toRemove=poke1i;
}else if(this.active.indexOf(poke1)>=0){
toRemove=poke2i;
}else if(this.active.indexOf(poke2)>=0){
toRemove=poke1i;
}else if(poke1.fainted&&!poke2.fainted){
toRemove=poke2i;
}else{
toRemove=poke1i;
}
break;
}
existingTable[poke1.searchid]=poke1i;
}
if(toRemove>=0){
if(this.pokemon[toRemove].fainted){

var illusionFound=null;for(var _i0=0,_this$pokemon4=
this.pokemon;_i0<_this$pokemon4.length;_i0++){var curPoke=_this$pokemon4[_i0];
if(curPoke===poke)continue;
if(curPoke.fainted)continue;
if(this.active.indexOf(curPoke)>=0)continue;
if(curPoke.speciesForme==='Zoroark'||curPoke.speciesForme==='Zorua'||curPoke.ability==='Illusion'){
illusionFound=curPoke;
break;
}
}
if(!illusionFound){for(var _i10=0,_this$pokemon6=




this.pokemon;_i10<_this$pokemon6.length;_i10++){var _curPoke=_this$pokemon6[_i10];
if(_curPoke===poke)continue;
if(_curPoke.fainted)continue;
if(this.active.indexOf(_curPoke)>=0)continue;
illusionFound=_curPoke;
break;
}
}
if(illusionFound){
illusionFound.fainted=true;
illusionFound.hp=0;
illusionFound.status='';
}
}
this.pokemon.splice(toRemove,1);
}
}
this.battle.scene.updateSidebar(this);

return poke;
};_proto2.

switchIn=function switchIn(pokemon,kwArgs){var slot=arguments.length>2&&arguments[2]!==undefined?arguments[2]:pokemon.slot;
this.active[slot]=pokemon;
pokemon.slot=slot;
pokemon.clearVolatile();
pokemon.lastMove='';
this.battle.lastMove='switch-in';
var effect=Dex.getEffect(kwArgs.from);
if(['batonpass','zbatonpass','shedtail'].includes(effect.id)){
pokemon.copyVolatileFrom(this.lastPokemon,effect.id==='shedtail'?'shedtail':false);
}

this.battle.scene.animSummon(pokemon,slot);
};_proto2.
dragIn=function dragIn(pokemon){var slot=arguments.length>1&&arguments[1]!==undefined?arguments[1]:pokemon.slot;
var oldpokemon=this.active[slot];
if(oldpokemon===pokemon)return;
this.lastPokemon=oldpokemon;
if(oldpokemon){
this.battle.scene.animDragOut(oldpokemon);
oldpokemon.clearVolatile();
}
pokemon.clearVolatile();
pokemon.lastMove='';
this.battle.lastMove='switch-in';
this.active[slot]=pokemon;
pokemon.slot=slot;

this.battle.scene.animDragIn(pokemon,slot);
};_proto2.
replace=function replace(pokemon){var slot=arguments.length>1&&arguments[1]!==undefined?arguments[1]:pokemon.slot;
var oldpokemon=this.active[slot];
if(pokemon===oldpokemon)return;
this.lastPokemon=oldpokemon;
pokemon.clearVolatile();
if(oldpokemon){
pokemon.lastMove=oldpokemon.lastMove;
pokemon.hp=oldpokemon.hp;
pokemon.maxhp=oldpokemon.maxhp;
pokemon.hpcolor=oldpokemon.hpcolor;
pokemon.status=oldpokemon.status;
pokemon.copyVolatileFrom(oldpokemon,true);
pokemon.statusData=Object.assign({},oldpokemon.statusData);
if(oldpokemon.terastallized){
pokemon.terastallized=oldpokemon.terastallized;
pokemon.teraType=oldpokemon.terastallized;
oldpokemon.terastallized='';
oldpokemon.teraType='';
}


oldpokemon.fainted=false;
oldpokemon.hp=oldpokemon.maxhp;
oldpokemon.status='???';
}
this.active[slot]=pokemon;
pokemon.slot=slot;

if(oldpokemon){
this.battle.scene.animUnsummon(oldpokemon,true);
}
this.battle.scene.animSummon(pokemon,slot,true);
};_proto2.
switchOut=function switchOut(pokemon,kwArgs){var slot=arguments.length>2&&arguments[2]!==undefined?arguments[2]:pokemon.slot;
var effect=Dex.getEffect(kwArgs.from);
if(!['batonpass','zbatonpass','shedtail'].includes(effect.id)){
pokemon.clearVolatile();
}else{
pokemon.removeVolatile('transform');
pokemon.removeVolatile('formechange');
}
if(!['batonpass','zbatonpass','shedtail','teleport'].includes(effect.id)){
this.battle.log(['switchout',pokemon.ident],{from:effect.id});
}
pokemon.statusData.toxicTurns=0;
if(this.battle.gen===5)pokemon.statusData.sleepTurns=0;
this.lastPokemon=pokemon;
this.active[slot]=null;

this.battle.scene.animUnsummon(pokemon);
};_proto2.
swapTo=function swapTo(pokemon,slot){
if(pokemon.slot===slot)return;
var target=this.active[slot];

var oslot=pokemon.slot;

pokemon.slot=slot;
if(target)target.slot=oslot;

this.active[slot]=pokemon;
this.active[oslot]=target;

this.battle.scene.animUnsummon(pokemon,true);
if(target)this.battle.scene.animUnsummon(target,true);

this.battle.scene.animSummon(pokemon,slot,true);
if(target)this.battle.scene.animSummon(target,oslot,true);
};_proto2.
swapWith=function swapWith(pokemon,target,kwArgs){

if(pokemon===target)return;

var oslot=pokemon.slot;
var nslot=target.slot;

pokemon.slot=nslot;
target.slot=oslot;
this.active[nslot]=pokemon;
this.active[oslot]=target;

this.battle.scene.animUnsummon(pokemon,true);
this.battle.scene.animUnsummon(target,true);

this.battle.scene.animSummon(pokemon,nslot,true);
this.battle.scene.animSummon(target,oslot,true);
};_proto2.
faint=function faint(pokemon){var slot=arguments.length>1&&arguments[1]!==undefined?arguments[1]:pokemon.slot;
pokemon.clearVolatile();
this.lastPokemon=pokemon;
this.active[slot]=null;

pokemon.fainted=true;
pokemon.hp=0;
pokemon.terastallized='';
pokemon.details=pokemon.details.replace(/, tera:[a-z]+/i,'');
pokemon.searchid=pokemon.searchid.replace(/, tera:[a-z]+/i,'');
if(pokemon.side.faintCounter<100)pokemon.side.faintCounter++;

this.battle.scene.animFaint(pokemon);
};_proto2.
destroy=function destroy(){
this.clearPokemon();
this.battle=null;
this.foe=null;
};return Side;}();var



















































Battle=function(){
















































































































function Battle()










{var _this=this;var options=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};this.scene=void 0;this.sidesSwitched=false;this.stepQueue=void 0;this.preemptStepQueue=[];this.waitForAnimations=true;this.currentStep=0;this.seeking=null;this.activeMoveIsSpread=null;this.subscription=void 0;this.mute=false;this.messageFadeTime=300;this.messageShownTime=1;this.turnsSinceMoved=0;this.turn=-1;this.atQueueEnd=false;this.started=false;this.ended=false;this.isReplay=false;this.usesUpkeep=false;this.weather='';this.pseudoWeather=[];this.weatherTimeLeft=0;this.weatherMinTimeLeft=0;this.mySide=null;this.nearSide=null;this.farSide=null;this.p1=null;this.p2=null;this.p3=null;this.p4=null;this.pokemonControlled=0;this.sides=null;this.myPokemon=null;this.myAllyPokemon=null;this.lastMove='';this.gen=8;this.modName=void 0;this.dex=Dex;this.teamPreviewCount=0;this.speciesClause=false;this.tier='';this.gameType='singles';this.rated=false;this.rules={};this.isBlitz=false;this.endLastTurnPending=false;this.totalTimeLeft=0;this.graceTimeLeft=0;this.kickingInactive=false;this.id='';this.roomid='';this.hardcoreMode=false;this.ignoreNicks=!!Dex.prefs('ignorenicks');this.ignoreOpponent=!!Dex.prefs('ignoreopp');this.ignoreSpects=!!Dex.prefs('ignorespects');this.debug=void 0;this.joinButtons=false;this.autoresize=void 0;this.paused=void 0;this.











































onResize=function(){
var width=$(window).width();
if(width<950||_this.hardcoreMode){
_this.messageShownTime=500;
}else{
_this.messageShownTime=1;
}
if(width&&width<640){var _this$scene$$frame,_this$scene$$frame2;
var scale=width/640;
(_this$scene$$frame=_this.scene.$frame)==null||_this$scene$$frame.css('transform','scale('+scale+')');
(_this$scene$$frame2=_this.scene.$frame)==null||_this$scene$$frame2.css('transform-origin','top left');

}else{var _this$scene$$frame3;
(_this$scene$$frame3=_this.scene.$frame)==null||_this$scene$$frame3.css('transform','none');

}
};this.id=options.id||'';var modMatch=this.id.match(/^battle-gen(\d+)([a-z]+)(only|nationaldex)/);if(modMatch){var genNumber=modMatch[1],modName=modMatch[2],modified=modMatch[3];if(!Number.isNaN(parseInt(genNumber,10))){this.gen=parseInt(genNumber,10);}this.modName=""+modName+(modified==='only'?'only':'natdex');this.dex=Dex.mod(this.gen,this.modName);}if(options.$frame&&options.$logFrame){this.scene=new BattleScene(this,options.$frame,options.$logFrame);}else if(!options.$frame&&!options.$logFrame){this.scene=new BattleSceneStub();}else{throw new Error("You must specify $frame and $logFrame simultaneously");}this.paused=!!options.paused;this.started=!this.paused;this.debug=!!options.debug;if(typeof options.log==='string')options.log=options.log.split('\n');this.stepQueue=options.log||[];this.subscription=options.subscription||null;this.autoresize=!!options.autoresize;this.p1=new Side(this,0);this.p2=new Side(this,1);this.sides=[this.p1,this.p2];this.p2.foe=this.p1;this.p1.foe=this.p2;this.nearSide=this.mySide=this.p1;this.farSide=this.p2;this.resetStep();if(this.autoresize){window.addEventListener('resize',this.onResize);this.onResize();}}var _proto3=Battle.prototype;_proto3.

subscribe=function subscribe(listener){
this.subscription=listener;
};_proto3.

removePseudoWeather=function removePseudoWeather(weather){
for(var i=0;i<this.pseudoWeather.length;i++){
if(this.pseudoWeather[i][0]===weather){
this.pseudoWeather.splice(i,1);
this.scene.updateWeather();
return;
}
}
};_proto3.
addPseudoWeather=function addPseudoWeather(weather,minTimeLeft,timeLeft){
this.pseudoWeather.push([weather,minTimeLeft,timeLeft]);
this.scene.updateWeather();
};_proto3.
hasPseudoWeather=function hasPseudoWeather(weather){for(var _i12=0,_this$pseudoWeather2=
this.pseudoWeather;_i12<_this$pseudoWeather2.length;_i12++){var _ref=_this$pseudoWeather2[_i12];var pseudoWeatherName=_ref[0];
if(weather===pseudoWeatherName){
return true;
}
}
return false;
};_proto3.
getAllActive=function getAllActive(){
var pokemonList=[];

for(var i=0;i<2;i++){
var side=this.sides[i];for(var _i14=0,_side$active2=
side.active;_i14<_side$active2.length;_i14++){var active=_side$active2[_i14];
if(active&&!active.fainted){
pokemonList.push(active);
}
}
}
return pokemonList;
};_proto3.
ngasActive=function ngasActive(){for(var _i16=0,_this$getAllActive2=
this.getAllActive();_i16<_this$getAllActive2.length;_i16++){var active=_this$getAllActive2[_i16];
if(active.ability==='Neutralizing Gas'&&!active.volatiles['gastroacid']){
return true;
}
}
return false;
};_proto3.
abilityActive=function abilityActive(abilities){var _this2=this;
if(typeof abilities==='string')abilities=[abilities];
if(this.ngasActive()){
abilities=abilities.filter(function(a){return _this2.dex.abilities.get(a).isPermanent;});
if(!abilities.length)return false;
}for(var _i18=0,_this$getAllActive4=
this.getAllActive();_i18<_this$getAllActive4.length;_i18++){var active=_this$getAllActive4[_i18];
if(abilities.includes(active.ability)&&!active.volatiles['gastroacid']){
return true;
}
}
return false;
};_proto3.
reset=function reset(){var _this$subscription;
this.paused=true;
this.scene.pause();
this.resetStep();
(_this$subscription=this.subscription)==null||_this$subscription.call(this,'paused');
};_proto3.
resetStep=function resetStep(){

this.turn=-1;
this.started=!this.paused;
this.ended=false;
this.atQueueEnd=false;
this.weather='';
this.weatherTimeLeft=0;
this.weatherMinTimeLeft=0;
this.pseudoWeather=[];
this.lastMove='';for(var _i20=0,_this$sides2=

this.sides;_i20<_this$sides2.length;_i20++){var side=_this$sides2[_i20];
if(side)side.reset();
}
this.myPokemon=null;
this.myAllyPokemon=null;


this.scene.reset();


this.activeMoveIsSpread=null;
this.currentStep=0;
this.resetTurnsSinceMoved();
this.nextStep();
};_proto3.
destroy=function destroy(){
if(this.autoresize){
window.removeEventListener('resize',this.onResize);
}
this.scene.destroy();

for(var i=0;i<this.sides.length;i++){
if(this.sides[i])this.sides[i].destroy();
this.sides[i]=null;
}
this.mySide=null;
this.nearSide=null;
this.farSide=null;
this.p1=null;
this.p2=null;
this.p3=null;
this.p4=null;
};_proto3.

log=function log(args,kwArgs,preempt){
this.scene.log.add(args,kwArgs,preempt);
};_proto3.

resetToCurrentTurn=function resetToCurrentTurn(){
this.seekTurn(this.ended?Infinity:this.turn,true);
};_proto3.
switchSides=function switchSides(){
this.setPerspective(this.sidesSwitched?'p1':'p2');
};_proto3.
setPerspective=function setPerspective(sideid){
if(this.mySide.sideid===sideid)return;
if(sideid.length!==2||!sideid.startsWith('p'))return;
var side=this[sideid];
if(!side)return;
this.mySide=side;

if(side.n%2===this.p1.n){
this.sidesSwitched=false;
this.nearSide=this.p1;
this.farSide=this.p2;
}else{
this.sidesSwitched=true;
this.nearSide=this.p2;
this.farSide=this.p1;
}
this.nearSide.isFar=false;
this.farSide.isFar=true;
if(this.sides.length>2){
this.sides[this.nearSide.n+2].isFar=false;
this.sides[this.farSide.n+2].isFar=true;
}

this.resetToCurrentTurn();
};_proto3.




start=function start(){
this.log(['start']);
this.resetTurnsSinceMoved();
};_proto3.
winner=function winner(_winner){var _this$subscription2;
this.log(['win',_winner||'']);
this.ended=true;
(_this$subscription2=this.subscription)==null||_this$subscription2.call(this,'ended');
};_proto3.
prematureEnd=function prematureEnd(){var _this$subscription3;
this.log(['message','This replay ends here.']);
this.ended=true;
(_this$subscription3=this.subscription)==null||_this$subscription3.call(this,'ended');
};_proto3.
endLastTurn=function endLastTurn(){
if(this.endLastTurnPending){
this.endLastTurnPending=false;
this.scene.updateStatbars();
}
};_proto3.
setHardcoreMode=function setHardcoreMode(mode){
this.hardcoreMode=mode;
this.scene.updateSidebars();
this.scene.updateWeather(true);
};_proto3.
setTurn=function setTurn(turnNum){
if(turnNum===this.turn+1){
this.endLastTurnPending=true;
}
if(this.turn&&!this.usesUpkeep)this.updateTurnCounters();
this.turn=turnNum;
this.started=true;

if(this.seeking===null)this.turnsSinceMoved++;

this.scene.incrementTurn();

if(this.seeking!==null){
if(turnNum>=this.seeking){
this.stopSeeking();
}
}else{var _this$subscription4;
(_this$subscription4=this.subscription)==null||_this$subscription4.call(this,'turn');
}
};_proto3.
resetTurnsSinceMoved=function resetTurnsSinceMoved(){
this.turnsSinceMoved=0;
this.scene.updateAcceleration();
};_proto3.
changeWeather=function changeWeather(weatherName,poke,isUpkeep,ability){
var weather=toID(weatherName);
if(!weather||weather==='none'){
weather='';
}
if(isUpkeep){
if(this.weather&&this.weatherTimeLeft){
this.weatherTimeLeft--;
if(this.weatherMinTimeLeft!==0)this.weatherMinTimeLeft--;
}
if(this.seeking===null){
this.scene.upkeepWeather();
}
return;
}
if(weather){
var isExtremeWeather=weather==='deltastream'||weather==='desolateland'||weather==='primordialsea';
var isCapsule=false;
if(poke){
if(ability){
this.activateAbility(poke,ability.name);
if(ability.effectType==="Item"){
var capsules=['acidycapsule','murkycapsule','rainycapsule','sandycapsule','snowycapsule','sunnycapsule'].includes(ability.id);
if(capsules){
isCapsule=true;
}
}
}
if(!isCapsule){
this.weatherTimeLeft=this.gen<=5||isExtremeWeather?0:8;
this.weatherMinTimeLeft=this.gen<=5||isExtremeWeather?0:5;
}else{
this.weatherTimeLeft=4;
this.weatherMinTimeLeft=0;
}
}else if(isExtremeWeather){
this.weatherTimeLeft=0;
this.weatherMinTimeLeft=0;
}else{
this.weatherTimeLeft=this.gen<=3?5:8;
this.weatherMinTimeLeft=this.gen<=3?0:5;
}
if(weather==='timefall'){
this.weatherTimeLeft=5;
this.weatherMinTimeLeft=0;
}
if(weather==='densefog'){
this.weatherTimeLeft=5;
this.weatherMinTimeLeft=0;
}
}
this.weather=weather;
this.scene.updateWeather();
};_proto3.
swapSideConditions=function swapSideConditions(){
var sideConditions=[
'mist','lightscreen','reflect','spikes','safeguard','tailwind','toxicspikes','stealthrock','waterpledge','firepledge','grasspledge','stickyweb','auroraveil','gmaxsteelsurge','gmaxcannonade','gmaxvinelash','gmaxwildfire'];

if(this.gameType==='freeforall'){

return;
}else{
var side1=this.sides[0];
var side2=this.sides[1];for(var _i22=0;_i22<
sideConditions.length;_i22++){var id=sideConditions[_i22];
if(side1.sideConditions[id]&&side2.sideConditions[id]){var _ref2=
[
side2.sideConditions[id],side1.sideConditions[id]];side1.sideConditions[id]=_ref2[0];side2.sideConditions[id]=_ref2[1];

this.scene.addSideCondition(side1.n,id);
this.scene.addSideCondition(side2.n,id);
}else if(side1.sideConditions[id]&&!side2.sideConditions[id]){
side2.sideConditions[id]=side1.sideConditions[id];
this.scene.addSideCondition(side2.n,id);
side1.removeSideCondition(id);
}else if(side2.sideConditions[id]&&!side1.sideConditions[id]){
side1.sideConditions[id]=side2.sideConditions[id];
this.scene.addSideCondition(side1.n,id);
side2.removeSideCondition(id);
}
}
}
};_proto3.
updateTurnCounters=function updateTurnCounters(){for(var _i24=0,_this$pseudoWeather4=
this.pseudoWeather;_i24<_this$pseudoWeather4.length;_i24++){var pWeather=_this$pseudoWeather4[_i24];
if(pWeather[1])pWeather[1]--;
if(pWeather[2])pWeather[2]--;
}for(var _i26=0,_this$sides4=
this.sides;_i26<_this$sides4.length;_i26++){var side=_this$sides4[_i26];
for(var id in side.sideConditions){
var cond=side.sideConditions[id];
if(cond[2])cond[2]--;
if(cond[3])cond[3]--;
}
}for(var _i28=0,_ref4=[].concat(
this.nearSide.active,this.farSide.active);_i28<_ref4.length;_i28++){var poke=_ref4[_i28];
if(poke){
if(poke.status==='tox')poke.statusData.toxicTurns++;
poke.clearTurnstatuses();
}
}
this.scene.updateWeather();
};_proto3.
useMove=function useMove(pokemon,move,target,kwArgs){
var fromeffect=Dex.getEffect(kwArgs.from);
this.activateAbility(pokemon,fromeffect);
pokemon.clearMovestatuses();
if(move.id==='focuspunch'){
pokemon.removeTurnstatus('focuspunch');
}
this.scene.updateStatbar(pokemon);
if(fromeffect.id==='sleeptalk'){
pokemon.rememberMove(move.name,0);
}
var callerMoveForPressure=null;

if(fromeffect.id&&kwArgs.from.startsWith("move:")){
callerMoveForPressure=fromeffect;
}
if(!fromeffect.id||callerMoveForPressure||fromeffect.id==='pursuit'){
var moveName=move.name;
if(!callerMoveForPressure){
if(move.isZ){
pokemon.item=move.isZ;
var item=Dex.items.get(move.isZ);
if(item.zMoveFrom)moveName=item.zMoveFrom;
}else if(move.name.slice(0,2)==='Z-'){
moveName=moveName.slice(2);
move=Dex.moves.get(moveName);
if(window.BattleItems){
for(var _item in BattleItems){
if(BattleItems[_item].zMoveType===move.type)pokemon.item=_item;
}
}
}
}
var pp=1;
if(this.abilityActive('Pressure')&&move.id!=='stickyweb'){
var foeTargets=[];
var moveTarget=move.pressureTarget;

if(
!target&&this.gameType==='singles'&&
!['self','allies','allySide','adjacentAlly','adjacentAllyOrSelf','allyTeam'].includes(moveTarget))
{

foeTargets.push(pokemon.side.foe.active[0]);
}else if(['all','allAdjacent','allAdjacentFoes','foeSide'].includes(moveTarget)){for(var _i30=0,_this$getAllActive6=
this.getAllActive();_i30<_this$getAllActive6.length;_i30++){var active=_this$getAllActive6[_i30];
if(active===pokemon)continue;

if(this.gen<=4||active.side!==pokemon.side&&active.side.ally!==pokemon.side){
foeTargets.push(active);
}
}
}else if(target&&target.side!==pokemon.side){
foeTargets.push(target);
}for(var _i32=0;_i32<

foeTargets.length;_i32++){var foe=foeTargets[_i32];
if(foe&&!foe.fainted&&foe.effectiveAbility()==='Pressure'){
pp+=1;
}
}
}
if(!callerMoveForPressure){
pokemon.rememberMove(moveName,pp);
}else{
pokemon.rememberMove(callerMoveForPressure.name,pp-1);
}
}
pokemon.lastMove=move.id;
this.lastMove=move.id;
if(move.id==='wish'||move.id==='healingwish'){
pokemon.side.wisher=pokemon;
}
};_proto3.
animateMove=function animateMove(pokemon,move,target,kwArgs){
this.activeMoveIsSpread=kwArgs.spread;
if(this.seeking!==null||kwArgs.still)return;

if(!target)target=pokemon.side.foe.active[0];
if(!target)target=pokemon.side.foe.missedPokemon;
if(kwArgs.miss&&target.side){
target=target.side.missedPokemon;
}
if(kwArgs.notarget){
return;
}

if(kwArgs.prepare||kwArgs.anim==='prepare'){
this.scene.runPrepareAnim(move.id,pokemon,target);
return;
}

var usedMove=kwArgs.anim?this.dex.moves.get(kwArgs.anim):move;
if(!kwArgs.spread){
this.scene.runMoveAnim(usedMove.id,[pokemon,target]);
return;
}

var targets=[pokemon];
if(kwArgs.spread==='.'){

targets.push(target.side.missedPokemon);
}else{for(var _i34=0,_kwArgs$spread$split2=
kwArgs.spread.split(',');_i34<_kwArgs$spread$split2.length;_i34++){var hitTarget=_kwArgs$spread$split2[_i34];
var curTarget=this.getPokemon(hitTarget+': ?');
if(!curTarget){
this.log(['error',"Invalid spread move target: \""+hitTarget+"\""]);
continue;
}
targets.push(curTarget);
}
}

this.scene.runMoveAnim(usedMove.id,targets);
};_proto3.
cantUseMove=function cantUseMove(pokemon,effect,move,kwArgs){
pokemon.clearMovestatuses();
this.scene.updateStatbar(pokemon);
if(effect.id in BattleStatusAnims){
this.scene.runStatusAnim(effect.id,[pokemon]);
}
this.activateAbility(pokemon,effect);
if(move.id)pokemon.rememberMove(move.name,0);
switch(effect.id){
case'par':
this.scene.resultAnim(pokemon,'Paralyzed','par');
break;
case'frz':
this.scene.resultAnim(pokemon,'Frozen','frz');
break;
case'slp':
this.scene.resultAnim(pokemon,'Asleep','slp');
pokemon.statusData.sleepTurns++;
break;
case'truant':
this.scene.resultAnim(pokemon,'Loafing around','neutral');
break;
case'recharge':
this.scene.runOtherAnim('selfstatus',[pokemon]);
this.scene.resultAnim(pokemon,'Must recharge','neutral');
break;
case'focuspunch':
this.scene.resultAnim(pokemon,'Lost focus','neutral');
pokemon.removeTurnstatus('focuspunch');
break;
case'shelltrap':
this.scene.resultAnim(pokemon,'Trap failed','neutral');
pokemon.removeTurnstatus('shelltrap');
break;
case'flinch':
this.scene.resultAnim(pokemon,'Flinched','neutral');
pokemon.removeTurnstatus('focuspunch');
break;
case'attract':
this.scene.resultAnim(pokemon,'Immobilized','neutral');
break;
}
this.scene.animReset(pokemon);
};_proto3.

activateAbility=function activateAbility(pokemon,effectOrName,isNotBase){
if(!pokemon||!effectOrName)return;
if(typeof effectOrName!=='string'){
if(effectOrName.effectType!=='Ability')return;
effectOrName=effectOrName.name;
}
this.scene.abilityActivateAnim(pokemon,effectOrName);
pokemon.rememberAbility(effectOrName,isNotBase);
};_proto3.

runMinor=function runMinor(args,kwArgs,nextArgs,nextKwargs){
if(nextArgs&&nextKwargs){
if(args[2]==='Sturdy'&&args[0]==='-activate'){
args[2]='ability: Sturdy';
}
if(['-crit','-supereffective','-resisted'].includes(args[0])||args[2]==='ability: Sturdy'){
kwArgs.then='.';
}
if(args[0]==='-damage'&&!kwArgs.from&&args[1]!==nextArgs[1]&&(
['-crit','-supereffective','-resisted'].includes(nextArgs[0])||
nextArgs[0]==='-damage'&&!nextKwargs.from))
{
kwArgs.then='.';
}
if(args[0]==='-damage'&&nextArgs[0]==='-damage'&&kwArgs.from&&kwArgs.from===nextKwargs.from){
kwArgs.then='.';
}
if(args[0]==='-ability'&&(args[2]==='Intimidate'||args[3]==='boost')){
kwArgs.then='.';
}
if(args[0]==='-unboost'&&nextArgs[0]==='-unboost'){
kwArgs.then='.';
}
if(args[0]==='-boost'&&nextArgs[0]==='-boost'){
kwArgs.then='.';
}
if(args[0]==='-damage'&&kwArgs.from==='Leech Seed'&&nextArgs[0]==='-heal'&&nextKwargs.silent){
kwArgs.then='.';
}
if(args[0]==='detailschange'&&nextArgs[0]==='-mega'){
if(this.scene.closeMessagebar()){
this.currentStep--;
return;
}
kwArgs.simult='.';
}
}
if(kwArgs.then)this.waitForAnimations=false;
if(kwArgs.simult)this.waitForAnimations='simult';

var CONSUMED=['eaten','popped','consumed','held up'];
switch(args[0]){
case'-damage':{
var poke=this.getPokemon(args[1]);
var damage=poke.healthParse(args[2],true);
if(damage===null)break;
var range=poke.getDamageRange(damage);

if(kwArgs.from){
var effect=Dex.getEffect(kwArgs.from);
var ofpoke=this.getPokemon(kwArgs.of);
this.activateAbility(ofpoke,effect);
if(effect.effectType==='Item'){
var itemPoke=ofpoke||poke;
if(itemPoke.prevItem!==effect.name&&!CONSUMED.includes(itemPoke.prevItemEffect)){
itemPoke.item=effect.name;
}
}
switch(effect.id){
case'brn':
this.scene.runStatusAnim('brn',[poke]);
break;
case'psn':
this.scene.runStatusAnim('psn',[poke]);
break;
case'baddreams':
this.scene.runStatusAnim('cursed',[poke]);
break;
case'curse':
this.scene.runStatusAnim('cursed',[poke]);
break;
case'confusion':
this.scene.runStatusAnim('confusedselfhit',[poke]);
break;
case'leechseed':
this.scene.runOtherAnim('leech',[ofpoke,poke]);
break;
case'bind':
case'wrap':
this.scene.runOtherAnim('bound',[poke]);
break;
}
}else{
if(this.dex.moves.get(this.lastMove).category!=='Status'){
poke.timesAttacked++;
}
var damageinfo=''+Pokemon.getFormattedRange(range,damage[1]===100?0:1,"\u2013");
if(damage[1]!==100){
var hover=''+(damage[0]<0?"\u2212":'')+
Math.abs(damage[0])+'/'+damage[1];
if(damage[1]===48){
hover+=' pixels';
}

damageinfo='||'+hover+'||'+damageinfo+'||';
}
args[3]=damageinfo;
}
this.scene.damageAnim(poke,Pokemon.getFormattedRange(range,0,' to '));
this.log(args,kwArgs);
break;
}
case'-heal':{
var _poke=this.getPokemon(args[1],Dex.getEffect(kwArgs.from).id==='revivalblessing');
var _damage=_poke.healthParse(args[2],true,true);
if(_damage===null)break;
var _range=_poke.getDamageRange(_damage);

if(kwArgs.from){
var _effect=Dex.getEffect(kwArgs.from);
var _ofpoke=this.getPokemon(kwArgs.of);
this.activateAbility(_ofpoke||_poke,_effect);
if(_effect.effectType==='Item'&&!CONSUMED.includes(_poke.prevItemEffect)){
if(_poke.prevItem!==_effect.name){
_poke.item=_effect.name;
}
}
switch(_effect.id){
case'lunardance':for(var _i36=0,_poke$moveTrack2=
_poke.moveTrack;_i36<_poke$moveTrack2.length;_i36++){var trackedMove=_poke$moveTrack2[_i36];
trackedMove[1]=0;
}

case'healingwish':
this.lastMove='healing-wish';
this.scene.runResidualAnim('healingwish',_poke);
_poke.side.wisher=null;
_poke.statusData.sleepTurns=0;
_poke.statusData.toxicTurns=0;
break;
case'wish':
this.scene.runResidualAnim('wish',_poke);
break;
case'revivalblessing':
this.scene.runResidualAnim('wish',_poke);
var _this$parsePokemonId=this.parsePokemonId(args[1]),siden=_this$parsePokemonId.siden;
var side=this.sides[siden];
_poke.fainted=false;
_poke.status='';
this.scene.updateSidebar(side);
break;
}
}
this.scene.runOtherAnim('heal',[_poke]);
this.scene.healAnim(_poke,Pokemon.getFormattedRange(_range,0,' to '));
this.log(args,kwArgs);
break;
}
case'-sethp':{
for(var k=0;k<2;k++){
var cpoke=this.getPokemon(args[1+2*k]);
if(cpoke){
var _damage2=cpoke.healthParse(args[2+2*k]);
var _range2=cpoke.getDamageRange(_damage2);
var formattedRange=Pokemon.getFormattedRange(_range2,0,' to ');
var diff=_damage2[0];
if(diff>0){
this.scene.healAnim(cpoke,formattedRange);
}else{
this.scene.damageAnim(cpoke,formattedRange);
}
}
}
this.log(args,kwArgs);
break;
}
case'-boost':{
var _poke2=this.getPokemon(args[1]);
var stat=args[2];
if(this.gen===1&&stat==='spd')break;
if(this.gen===1&&stat==='spa')stat='spc';
var amount=parseInt(args[3],10);
if(amount===0){
this.scene.resultAnim(_poke2,'already '+_poke2.getBoost(stat),'neutral');
this.log(args,kwArgs);
break;
}
if(!_poke2.boosts[stat]){
_poke2.boosts[stat]=0;
}
_poke2.boosts[stat]+=amount;

if(!kwArgs.silent&&kwArgs.from){
var _effect2=Dex.getEffect(kwArgs.from);
var _ofpoke2=this.getPokemon(kwArgs.of);
if(!(_effect2.id==='weakarmor'&&stat==='spe')){
this.activateAbility(_ofpoke2||_poke2,_effect2);
}
}
this.scene.resultAnim(_poke2,_poke2.getBoost(stat),'good');
this.log(args,kwArgs);
break;
}
case'-unboost':{
var _poke3=this.getPokemon(args[1]);
var _stat=args[2];
if(this.gen===1&&_stat==='spd')break;
if(this.gen===1&&_stat==='spa')_stat='spc';
var _amount=parseInt(args[3],10);
if(_amount===0){
this.scene.resultAnim(_poke3,'already '+_poke3.getBoost(_stat),'neutral');
this.log(args,kwArgs);
break;
}
if(!_poke3.boosts[_stat]){
_poke3.boosts[_stat]=0;
}
_poke3.boosts[_stat]-=_amount;

if(!kwArgs.silent&&kwArgs.from){
var _effect3=Dex.getEffect(kwArgs.from);
var _ofpoke3=this.getPokemon(kwArgs.of);
this.activateAbility(_ofpoke3||_poke3,_effect3);
}
this.scene.resultAnim(_poke3,_poke3.getBoost(_stat),'bad');
this.log(args,kwArgs);
break;
}
case'-setboost':{
var _poke4=this.getPokemon(args[1]);
var _stat2=args[2];
var _amount2=parseInt(args[3],10);
_poke4.boosts[_stat2]=_amount2;
this.scene.resultAnim(_poke4,_poke4.getBoost(_stat2),_amount2>0?'good':'bad');
this.log(args,kwArgs);
break;
}
case'-swapboost':{
var _poke5=this.getPokemon(args[1]);
var poke2=this.getPokemon(args[2]);
var stats=args[3]?args[3].split(', '):['atk','def','spa','spd','spe','accuracy','evasion'];for(var _i38=0;_i38<
stats.length;_i38++){var _stat3=stats[_i38];
var tmp=_poke5.boosts[_stat3];
_poke5.boosts[_stat3]=poke2.boosts[_stat3];
if(!_poke5.boosts[_stat3])delete _poke5.boosts[_stat3];
poke2.boosts[_stat3]=tmp;
if(!poke2.boosts[_stat3])delete poke2.boosts[_stat3];
}
this.scene.resultAnim(_poke5,'Stats swapped','neutral');
this.scene.resultAnim(poke2,'Stats swapped','neutral');

this.log(args,kwArgs);
break;
}
case'-clearpositiveboost':{
var _poke6=this.getPokemon(args[1]);
var _ofpoke4=this.getPokemon(args[2]);
var _effect4=Dex.getEffect(args[3]);
for(var _stat4 in _poke6.boosts){
if(_poke6.boosts[_stat4]>0)delete _poke6.boosts[_stat4];
}
this.scene.resultAnim(_poke6,'Boosts lost','bad');

if(_effect4.id){
switch(_effect4.id){
case'spectralthief':

this.scene.runOtherAnim('spectralthiefboost',[_ofpoke4,_poke6]);
break;
}
}
this.log(args,kwArgs);
break;
}
case'-clearnegativeboost':{
var _poke7=this.getPokemon(args[1]);
for(var _stat5 in _poke7.boosts){
if(_poke7.boosts[_stat5]<0)delete _poke7.boosts[_stat5];
}
this.scene.resultAnim(_poke7,'Restored','good');

this.log(args,kwArgs);
break;
}
case'-copyboost':{
var _poke8=this.getPokemon(args[1]);
var frompoke=this.getPokemon(args[2]);
if(!kwArgs.silent&&kwArgs.from){
var _effect5=Dex.getEffect(kwArgs.from);
this.activateAbility(_poke8,_effect5);
}
var _stats=args[3]?args[3].split(', '):['atk','def','spa','spd','spe','accuracy','evasion'];for(var _i40=0;_i40<
_stats.length;_i40++){var _stat6=_stats[_i40];
_poke8.boosts[_stat6]=frompoke.boosts[_stat6];
if(!_poke8.boosts[_stat6])delete _poke8.boosts[_stat6];
}
if(this.gen>=6){
var volatilesToCopy=['focusenergy','gmaxchistrike','laserfocus'];for(var _i42=0;_i42<
volatilesToCopy.length;_i42++){var volatile=volatilesToCopy[_i42];
if(frompoke.volatiles[volatile]){
_poke8.addVolatile(volatile);
}else{
_poke8.removeVolatile(volatile);
}
}
}
this.scene.resultAnim(_poke8,'Stats copied','neutral');

this.log(args,kwArgs);
break;
}
case'-clearboost':{
var _poke9=this.getPokemon(args[1]);
_poke9.boosts={};
if(!kwArgs.silent&&kwArgs.from){
var _effect6=Dex.getEffect(kwArgs.from);
var _ofpoke5=this.getPokemon(kwArgs.of);
this.activateAbility(_ofpoke5||_poke9,_effect6);
}
this.scene.resultAnim(_poke9,'Stats reset','neutral');

this.log(args,kwArgs);
break;
}
case'-invertboost':{
var _poke0=this.getPokemon(args[1]);
for(var _stat7 in _poke0.boosts){
_poke0.boosts[_stat7]=-_poke0.boosts[_stat7];
}
this.scene.resultAnim(_poke0,'Stats inverted','neutral');

this.log(args,kwArgs);
break;
}
case'-clearallboost':{
var timeOffset=this.scene.timeOffset;for(var _i44=0,_this$getAllActive8=
this.getAllActive();_i44<_this$getAllActive8.length;_i44++){var active=_this$getAllActive8[_i44];
active.boosts={};
this.scene.timeOffset=timeOffset;
this.scene.resultAnim(active,'Stats reset','neutral');
}

this.log(args,kwArgs);
break;
}
case'-crit':{
var _poke1=this.getPokemon(args[1]);
if(_poke1)this.scene.resultAnim(_poke1,'Critical hit','bad');
if(this.activeMoveIsSpread)kwArgs.spread='.';
this.log(args,kwArgs);
break;
}
case'-supereffective':{
var _poke10=this.getPokemon(args[1]);
if(_poke10){var _window$Config;
this.scene.resultAnim(_poke10,'Super-effective','bad');
if((_window$Config=window.Config)!=null&&(_window$Config=_window$Config.server)!=null&&_window$Config.afd){
this.scene.runOtherAnim('hitmark',[_poke10]);
}
}
if(this.activeMoveIsSpread)kwArgs.spread='.';
this.log(args,kwArgs);
break;
}
case'-resisted':{
var _poke11=this.getPokemon(args[1]);
if(_poke11)this.scene.resultAnim(_poke11,'Resisted','neutral');
if(this.activeMoveIsSpread)kwArgs.spread='.';
this.log(args,kwArgs);
break;
}
case'-immune':{
var _poke12=this.getPokemon(args[1]);
var fromeffect=Dex.getEffect(kwArgs.from);
this.activateAbility(this.getPokemon(kwArgs.of)||_poke12,fromeffect);
this.log(args,kwArgs);
this.scene.resultAnim(_poke12,'Immune','neutral');
break;
}
case'-miss':{
var target=this.getPokemon(args[2]);
if(target){
this.scene.resultAnim(target,'Missed','neutral');
}
this.log(args,kwArgs);
break;
}
case'-fail':{
var _poke13=this.getPokemon(args[1]);
var _effect7=Dex.getEffect(args[2]);
var _fromeffect=Dex.getEffect(kwArgs.from);
var _ofpoke6=this.getPokemon(kwArgs.of);
if(_fromeffect.id==='clearamulet'){
_ofpoke6.item='Clear Amulet';
}else{
this.activateAbility(_ofpoke6||_poke13,_fromeffect);
}
switch(_effect7.id){
case'brn':
this.scene.resultAnim(_poke13,'Already burned','neutral');
break;
case'tox':
case'psn':
this.scene.resultAnim(_poke13,'Already poisoned','neutral');
break;
case'slp':
if(_fromeffect.id==='uproar'){
this.scene.resultAnim(_poke13,'Failed','neutral');
}else{
this.scene.resultAnim(_poke13,'Already asleep','neutral');
}
break;
case'par':
this.scene.resultAnim(_poke13,'Already paralyzed','neutral');
break;
case'frz':
this.scene.resultAnim(_poke13,'Already frozen','neutral');
break;
case'unboost':
this.scene.resultAnim(_poke13,'Stat drop blocked','neutral');
break;
default:
if(_poke13){
this.scene.resultAnim(_poke13,'Failed','neutral');
}
break;
}
this.scene.animReset(_poke13);
this.log(args,kwArgs);
break;
}
case'-block':{
var _poke14=this.getPokemon(args[1]);
var _ofpoke7=this.getPokemon(kwArgs.of);
var _effect8=Dex.getEffect(args[2]);
this.activateAbility(_ofpoke7||_poke14,_effect8);
switch(_effect8.id){
case'quickguard':
_poke14.addTurnstatus('quickguard');
this.scene.resultAnim(_poke14,'Quick Guard','good');
break;
case'wideguard':
_poke14.addTurnstatus('wideguard');
this.scene.resultAnim(_poke14,'Wide Guard','good');
break;
case'craftyshield':
_poke14.addTurnstatus('craftyshield');
this.scene.resultAnim(_poke14,'Crafty Shield','good');
break;
case'protect':
_poke14.addTurnstatus('protect');
this.scene.resultAnim(_poke14,'Protected','good');
break;

case'safetygoggles':
_poke14.item='Safety Goggles';
break;
case'protectivepads':
_poke14.item='Protective Pads';
break;
case'abilityshield':
_poke14.item='Ability Shield';
break;
}
this.log(args,kwArgs);
break;
}
case'-center':case'-notarget':case'-ohko':
case'-combine':case'-hitcount':case'-waiting':case'-zbroken':{
this.log(args,kwArgs);
break;
}
case'-zpower':{
var _poke15=this.getPokemon(args[1]);
this.scene.runOtherAnim('zpower',[_poke15]);
this.log(args,kwArgs);
break;
}
case'-prepare':{
var _poke16=this.getPokemon(args[1]);
var moveid=toID(args[2]);
var _target=this.getPokemon(args[3])||_poke16.side.foe.active[0]||_poke16;
this.scene.runPrepareAnim(moveid,_poke16,_target);
this.log(args,kwArgs);
break;
}
case'-mustrecharge':{
var _poke17=this.getPokemon(args[1]);
_poke17.addMovestatus('mustrecharge');
this.scene.updateStatbar(_poke17);
break;
}
case'-status':{
var _poke18=this.getPokemon(args[1]);
var _effect9=Dex.getEffect(kwArgs.from);
var _ofpoke8=this.getPokemon(kwArgs.of)||_poke18;
_poke18.status=args[2];
this.activateAbility(_ofpoke8||_poke18,_effect9);
if(_effect9.effectType==='Item'){
_ofpoke8.item=_effect9.name;
}

switch(args[2]){
case'brn':
this.scene.resultAnim(_poke18,'Burned','brn');
this.scene.runStatusAnim('brn',[_poke18]);
break;
case'tox':
this.scene.resultAnim(_poke18,'Toxic poison','psn');
this.scene.runStatusAnim('psn',[_poke18]);
_poke18.statusData.toxicTurns=_effect9.name==="Toxic Orb"?-1:0;
break;
case'psn':
this.scene.resultAnim(_poke18,'Poisoned','psn');
this.scene.runStatusAnim('psn',[_poke18]);
break;
case'slp':
this.scene.resultAnim(_poke18,'Asleep','slp');
if(_effect9.id==='rest'){
_poke18.statusData.sleepTurns=0;
}
break;
case'par':
this.scene.resultAnim(_poke18,'Paralyzed','par');
this.scene.runStatusAnim('par',[_poke18]);
break;
case'frz':
this.scene.resultAnim(_poke18,'Frozen','frz');
this.scene.runStatusAnim('frz',[_poke18]);
break;
default:
this.scene.updateStatbar(_poke18);
break;
}
this.log(args,kwArgs);
break;
}
case'-curestatus':{
var _poke19=this.getPokemon(args[1]);
var _effect0=Dex.getEffect(kwArgs.from);

if(_effect0.id){
switch(_effect0.id){
case'flamewheel':
case'flareblitz':
case'fusionflare':
case'sacredfire':
case'scald':
case'steameruption':
kwArgs.thaw='.';
break;
}
}
if(_poke19){
_poke19.status='';
switch(args[2]){
case'brn':
this.scene.resultAnim(_poke19,'Burn cured','good');
break;
case'tox':
case'psn':
_poke19.statusData.toxicTurns=0;
this.scene.resultAnim(_poke19,'Poison cured','good');
break;
case'slp':
this.scene.resultAnim(_poke19,'Woke up','good');
_poke19.statusData.sleepTurns=0;
break;
case'par':
this.scene.resultAnim(_poke19,'Paralysis cured','good');
break;
case'frz':
this.scene.resultAnim(_poke19,'Thawed','good');
break;
default:
_poke19.removeVolatile('confusion');
this.scene.resultAnim(_poke19,'Cured','good');
}
}
this.log(args,kwArgs);
break;

}
case'-cureteam':{
var _poke20=this.getPokemon(args[1]);for(var _i46=0,_poke20$side$pokemon2=
_poke20.side.pokemon;_i46<_poke20$side$pokemon2.length;_i46++){var _target2=_poke20$side$pokemon2[_i46];
_target2.status='';
this.scene.updateStatbarIfExists(_target2);
}

this.scene.resultAnim(_poke20,'Team Cured','good');
this.log(args,kwArgs);
break;
}
case'-item':{
var _poke21=this.getPokemon(args[1]);
var item=this.dex.items.get(args[2]);
var _effect1=Dex.getEffect(kwArgs.from);
var _ofpoke9=this.getPokemon(kwArgs.of);
_poke21.item=item.name;
_poke21.itemEffect='';
_poke21.removeVolatile('airballoon');
if(item.id==='airballoon')_poke21.addVolatile('airballoon');

if(_effect1.id){
switch(_effect1.id){
case'pickup':
this.activateAbility(_poke21,"Pickup");

case'recycle':
_poke21.itemEffect='found';
this.scene.resultAnim(_poke21,item.name,'neutral');
break;
case'frisk':
this.activateAbility(_ofpoke9,"Frisk");
if(_poke21&&_poke21!==_ofpoke9){
_poke21.itemEffect='frisked';
this.scene.resultAnim(_poke21,item.name,'neutral');
}
break;
case'magician':
case'pickpocket':
this.activateAbility(_poke21,_effect1.name);

case'thief':
case'covet':

_ofpoke9.item='';
_ofpoke9.itemEffect='';
_ofpoke9.prevItem=item.name;
_ofpoke9.prevItemEffect='stolen';
_ofpoke9.addVolatile('itemremoved');
_poke21.itemEffect='stolen';
this.scene.resultAnim(_poke21,item.name,'neutral');
this.scene.resultAnim(_ofpoke9,'Item Stolen','bad');
break;
case'harvest':
_poke21.itemEffect='harvested';
this.activateAbility(_poke21,"Harvest");
this.scene.resultAnim(_poke21,item.name,'neutral');
break;
case'bestow':
_poke21.itemEffect='bestowed';
this.scene.resultAnim(_poke21,item.name,'neutral');
break;
case'switcheroo':
case'trick':
_poke21.itemEffect='tricked';

default:
break;
}
}else{
switch(item.id){
case'airballoon':
this.scene.resultAnim(_poke21,'Balloon','good');
break;
}
}
this.log(args,kwArgs);
break;
}
case'-enditem':{
var _poke22=this.getPokemon(args[1]);
var _item2=this.dex.items.get(args[2]);
var _effect10=Dex.getEffect(kwArgs.from);
if(this.gen>4||_effect10.id!=='knockoff'){
_poke22.item='';
_poke22.itemEffect='';
_poke22.prevItem=_item2.name;
_poke22.prevItemEffect='';
}
_poke22.removeVolatile('airballoon');
_poke22.addVolatile('itemremoved');
if(kwArgs.eat){
_poke22.prevItemEffect='eaten';
this.scene.runOtherAnim('consume',[_poke22]);
this.lastMove=_item2.id;
}else if(kwArgs.weaken){
_poke22.prevItemEffect='eaten';
this.lastMove=_item2.id;
}else if(_effect10.id){
switch(_effect10.id){
case'fling':
_poke22.prevItemEffect='flung';
break;
case'knockoff':
if(this.gen<=4){
_poke22.itemEffect='knocked off';
}else{
_poke22.prevItemEffect='knocked off';
}
this.scene.runOtherAnim('itemoff',[_poke22]);
this.scene.resultAnim(_poke22,'Item knocked off','neutral');
break;
case'stealeat':
_poke22.prevItemEffect='stolen';
break;
case'gem':
_poke22.prevItemEffect='consumed';
break;
case'incinerate':
_poke22.prevItemEffect='incinerated';
break;
}
}else{
switch(_item2.id){
case'airballoon':
_poke22.prevItemEffect='popped';
_poke22.removeVolatile('airballoon');
this.scene.resultAnim(_poke22,'Balloon popped','neutral');
break;
case'focussash':
_poke22.prevItemEffect='consumed';
this.scene.resultAnim(_poke22,'Sash','neutral');
break;
case'focusband':
this.scene.resultAnim(_poke22,'Focus Band','neutral');
break;
case'redcard':
_poke22.prevItemEffect='held up';
break;
default:
_poke22.prevItemEffect='consumed';
break;
}
}
this.log(args,kwArgs);
break;
}
case'-ability':{
var _poke23=this.getPokemon(args[1]);
var ability=this.dex.abilities.get(args[2]);
var _effect11=Dex.getEffect(kwArgs.from);
var _ofpoke0=this.getPokemon(kwArgs.of);
_poke23.rememberAbility(ability.name,_effect11.id&&!kwArgs.fail);

if(kwArgs.silent){

}else if(_effect11.id){
switch(_effect11.id){
case'trace':
this.activateAbility(_poke23,"Trace");
this.scene.wait(500);
this.activateAbility(_poke23,ability.name,true);
_ofpoke0.rememberAbility(ability.name);
break;
case'powerofalchemy':
case'receiver':
case'copypower':
this.activateAbility(_poke23,_effect11.name);
this.scene.wait(500);
this.activateAbility(_poke23,ability.name,true);
_ofpoke0.rememberAbility(ability.name);
break;
case'roleplay':
this.activateAbility(_poke23,ability.name,true);
_ofpoke0.rememberAbility(ability.name);
break;
case'desolateland':
case'primordialsea':
case'deltastream':
if(kwArgs.fail){
this.activateAbility(_poke23,ability.name);
}
break;
default:
this.activateAbility(_poke23,ability.name);
break;
}
}else{
this.activateAbility(_poke23,ability.name);
}
this.scene.updateWeather();
this.log(args,kwArgs);
break;
}
case'-endability':{


var _poke24=this.getPokemon(args[1]);
var _ability=this.dex.abilities.get(args[2]);
_poke24.ability='(suppressed)';

if(_ability.id){
if(!_poke24.baseAbility)_poke24.baseAbility=_ability.name;
}
this.log(args,kwArgs);
break;
}
case'detailschange':{
var _poke25=this.getPokemon(args[1]);
_poke25.removeVolatile('formechange');
_poke25.removeVolatile('typeadd');
_poke25.removeVolatile('typechange');

var newSpeciesForme=args[2];
var commaIndex=newSpeciesForme.indexOf(',');
if(commaIndex!==-1){
var level=newSpeciesForme.substr(commaIndex+1).trim();
if(level.charAt(0)==='L'){
_poke25.level=parseInt(level.substr(1),10);
}
newSpeciesForme=args[2].substr(0,commaIndex);
}
var species=this.dex.species.get(newSpeciesForme);
if(nextArgs){
if(nextArgs[0]==='-mega'){
species=this.dex.species.get(this.dex.items.get(nextArgs[3]).megaStone);
}else if(nextArgs[0]==='-primal'&&nextArgs.length>2){
if(nextArgs[2]==='Red Orb')species=this.dex.species.get('Groudon-Primal');
if(nextArgs[2]==='Blue Orb')species=this.dex.species.get('Kyogre-Primal');
}
}

_poke25.speciesForme=newSpeciesForme;
_poke25.ability=_poke25.baseAbility=species.abilities?species.abilities['0']:'';

_poke25.details=args[2];
_poke25.searchid=args[1].substr(0,2)+args[1].substr(3)+'|'+args[2];

var isCustomAnim=species.id!=='palafinhero';
this.scene.animTransform(_poke25,isCustomAnim,true);
this.log(args,kwArgs);
break;
}
case'-transform':{
var _poke26=this.getPokemon(args[1]);
var tpoke=this.getPokemon(args[2]);
var _effect12=Dex.getEffect(kwArgs.from);
if(_poke26===tpoke)throw new Error("Transforming into self");

if(!kwArgs.silent){
this.activateAbility(_poke26,_effect12);
}

_poke26.boosts=Object.assign({},tpoke.boosts);
_poke26.copyTypesFrom(tpoke,true);
_poke26.ability=tpoke.ability;
_poke26.timesAttacked=tpoke.timesAttacked;
var targetForme=tpoke.volatiles.formechange;
var speciesForme=targetForme&&!targetForme[1].endsWith('-Gmax')?targetForme[1]:tpoke.speciesForme;
var pokemon=tpoke;
var shiny=tpoke.shiny;
var gender=tpoke.gender;
var _level=tpoke.level;
_poke26.addVolatile('transform',pokemon,shiny,gender,_level);
_poke26.addVolatile('formechange',speciesForme);for(var _i48=0,_tpoke$moveTrack2=
tpoke.moveTrack;_i48<_tpoke$moveTrack2.length;_i48++){var _trackedMove=_tpoke$moveTrack2[_i48];
_poke26.rememberMove(_trackedMove[0],0);
}
this.scene.animTransform(_poke26);
this.scene.resultAnim(_poke26,'Transformed','good');
this.log(['-transform',args[1],args[2],tpoke.speciesForme],kwArgs);
break;
}
case'-formechange':{
var _poke27=this.getPokemon(args[1]);
var _species=this.dex.species.get(args[2]);
var _fromeffect2=Dex.getEffect(kwArgs.from);
var _isCustomAnim=_species.name.startsWith('Wishiwashi');
if(!_poke27.getSpeciesForme().endsWith('-Gmax')&&!_species.name.endsWith('-Gmax')){
_poke27.removeVolatile('typeadd');
_poke27.removeVolatile('typechange');
if(this.gen>=6)_poke27.removeVolatile('autotomize');
}

if(!kwArgs.silent){
this.activateAbility(_poke27,_fromeffect2);
}
_poke27.addVolatile('formechange',_species.name);
this.scene.animTransform(_poke27,_isCustomAnim);
this.log(args,kwArgs);
break;
}
case'-mega':{
var _poke28=this.getPokemon(args[1]);
var _item3=this.dex.items.get(args[3]);
if(args[3]){
_poke28.item=_item3.name;
}
this.log(args,kwArgs);
break;
}
case'-primal':case'-burst':{
this.log(args,kwArgs);
break;
}
case'-terastallize':{
var _poke29=this.getPokemon(args[1]);
var type=Dex.types.get(args[2]).name;
_poke29.removeVolatile('typeadd');
_poke29.teraType=type;
_poke29.terastallized=type;
_poke29.details+=", tera:"+type;
_poke29.searchid+=", tera:"+type;
this.scene.animTransform(_poke29,true);
this.scene.resetStatbar(_poke29);
this.log(args,kwArgs);
break;
}
case'-start':{
var _poke30=this.getPokemon(args[1]);
var _effect13=Dex.getEffect(args[2]);
var _ofpoke1=this.getPokemon(kwArgs.of);
var _fromeffect3=Dex.getEffect(kwArgs.from);

this.activateAbility(_poke30,_effect13);
this.activateAbility(_ofpoke1||_poke30,_fromeffect3);
switch(_effect13.id){
case'typechange':
if(_poke30.terastallized)break;
if(_ofpoke1&&_fromeffect3.id==='reflecttype'){
_poke30.copyTypesFrom(_ofpoke1);
}else{
var types=Dex.sanitizeName(args[3]||'???');
_poke30.removeVolatile('typeadd');
_poke30.addVolatile('typechange',types);
if(!kwArgs.silent){
this.scene.typeAnim(_poke30,types);
}
}
this.scene.updateStatbar(_poke30);
break;
case'typeadd':
var _type=Dex.sanitizeName(args[3]);
_poke30.addVolatile('typeadd',_type);
if(kwArgs.silent)break;
this.scene.typeAnim(_poke30,_type);
break;
case'typereset':
_poke30.removeVolatile('typeadd');
_poke30.removeVolatile('typechange');
break;
case'dynamax':
_poke30.addVolatile('dynamax',!!args[3]);
this.scene.animTransform(_poke30,true);
break;
case'powertrick':
this.scene.resultAnim(_poke30,'Power Trick','neutral');
break;
case'foresight':
case'miracleeye':
this.scene.resultAnim(_poke30,'Identified','bad');
break;
case'telekinesis':
this.scene.resultAnim(_poke30,'Telekinesis','neutral');
break;
case'confusion':
if(!kwArgs.already){
this.scene.runStatusAnim('confused',[_poke30]);
this.scene.resultAnim(_poke30,'Confused','bad');
}
break;
case'leechseed':
this.scene.updateStatbar(_poke30);
break;
case'healblock':
this.scene.resultAnim(_poke30,'Heal Block','bad');
break;
case'yawn':
this.scene.resultAnim(_poke30,'Drowsy','slp');
break;
case'taunt':
this.scene.resultAnim(_poke30,'Taunted','bad');
break;
case'imprison':
this.scene.resultAnim(_poke30,'Imprisoning','good');
break;
case'disable':
this.scene.resultAnim(_poke30,'Disabled','bad');
break;
case'embargo':
this.scene.resultAnim(_poke30,'Embargo','bad');
break;
case'torment':
this.scene.resultAnim(_poke30,'Tormented','bad');
break;
case'ingrain':
this.scene.resultAnim(_poke30,'Ingrained','good');
break;
case'aquaring':
this.scene.resultAnim(_poke30,'Aqua Ring','good');
break;
case'stockpile1':
this.scene.resultAnim(_poke30,'Stockpile','good');
break;
case'stockpile2':
_poke30.removeVolatile('stockpile1');
this.scene.resultAnim(_poke30,'Stockpile&times;2','good');
break;
case'stockpile3':
_poke30.removeVolatile('stockpile2');
this.scene.resultAnim(_poke30,'Stockpile&times;3','good');
break;
case'sharpen1':
this.scene.resultAnim(_poke30,'Sharpen','good');
break;
case'sharpen2':
_poke30.removeVolatile('stockpile1');
this.scene.resultAnim(_poke30,'Sharpen&times;2','good');
break;
case'sharpen3':
_poke30.removeVolatile('stockpile2');
this.scene.resultAnim(_poke30,'Sharpen&times;3','good');
break;
case'perish0':
_poke30.removeVolatile('perish1');
break;
case'perish1':
_poke30.removeVolatile('perish2');
this.scene.resultAnim(_poke30,'Perish next turn','bad');
break;
case'perish2':
_poke30.removeVolatile('perish3');
this.scene.resultAnim(_poke30,'Perish in 2','bad');
break;
case'perish3':
if(!kwArgs.silent)this.scene.resultAnim(_poke30,'Perish in 3','bad');
break;
case'encore':
this.scene.resultAnim(_poke30,'Encored','bad');
break;
case'bide':
this.scene.resultAnim(_poke30,'Bide','good');
break;
case'attract':
this.scene.resultAnim(_poke30,'Attracted','bad');
break;
case'autotomize':
this.scene.resultAnim(_poke30,'Lightened','good');
if(_poke30.volatiles.autotomize){
_poke30.volatiles.autotomize[1]++;
}else{
_poke30.addVolatile('autotomize',1);
}
break;
case'focusenergy':
this.scene.resultAnim(_poke30,'+Crit rate','good');
break;
case'curse':
this.scene.resultAnim(_poke30,'Cursed','bad');
break;
case'nightmare':
this.scene.resultAnim(_poke30,'Nightmare','bad');
break;
case'magnetrise':
this.scene.resultAnim(_poke30,'Magnet Rise','good');
break;
case'smackdown':
this.scene.resultAnim(_poke30,'Smacked Down','bad');
_poke30.removeVolatile('magnetrise');
_poke30.removeVolatile('telekinesis');
if(_poke30.lastMove==='fly'||_poke30.lastMove==='bounce')this.scene.animReset(_poke30);
break;
case'substitute':
if(kwArgs.damage){
this.scene.resultAnim(_poke30,'Damage','bad');
}else if(kwArgs.block){
this.scene.resultAnim(_poke30,'Blocked','neutral');
}
break;


case'mist':
this.scene.resultAnim(_poke30,'Mist','good');
break;

case'lightscreen':
this.scene.resultAnim(_poke30,'Light Screen','good');
break;
case'reflect':
this.scene.resultAnim(_poke30,'Reflect','good');
break;
}
if(!(_effect13.id==='typechange'&&_poke30.terastallized)){
_poke30.addVolatile(_effect13.id);
}
this.scene.updateStatbar(_poke30);
this.log(args,kwArgs);
break;
}
case'-end':{
var _poke31=this.getPokemon(args[1]);
var _effect14=Dex.getEffect(args[2]);
var _fromeffect4=Dex.getEffect(kwArgs.from);
_poke31.removeVolatile(_effect14.id);

if(kwArgs.silent){

}else{
switch(_effect14.id){
case'dynamax':
this.scene.animTransform(_poke31);
break;
case'powertrick':
this.scene.resultAnim(_poke31,'Power Trick','neutral');
break;
case'telekinesis':
this.scene.resultAnim(_poke31,'Telekinesis&nbsp;ended','neutral');
break;
case'skydrop':
if(kwArgs.interrupt){
this.scene.anim(_poke31,{time:100});
}
break;
case'confusion':
this.scene.resultAnim(_poke31,'Confusion&nbsp;ended','good');
break;
case'leechseed':
if(_fromeffect4.id==='rapidspin'){
this.scene.resultAnim(_poke31,'De-seeded','good');
}
break;
case'healblock':
this.scene.resultAnim(_poke31,'Heal Block ended','good');
break;
case'attract':
this.scene.resultAnim(_poke31,'Attract&nbsp;ended','good');
break;
case'taunt':
this.scene.resultAnim(_poke31,'Taunt&nbsp;ended','good');
break;
case'disable':
this.scene.resultAnim(_poke31,'Disable&nbsp;ended','good');
break;
case'embargo':
this.scene.resultAnim(_poke31,'Embargo ended','good');
break;
case'torment':
this.scene.resultAnim(_poke31,'Torment&nbsp;ended','good');
break;
case'encore':
this.scene.resultAnim(_poke31,'Encore&nbsp;ended','good');
break;
case'bide':
this.scene.runOtherAnim('bideunleash',[_poke31]);
break;
case'illusion':
this.scene.resultAnim(_poke31,'Illusion ended','bad');
_poke31.rememberAbility('Illusion');
break;
case'slowstart':
this.scene.resultAnim(_poke31,'Slow Start ended','good');
break;
case'perishsong':
_poke31.removeVolatile('perish3');
break;
case'substitute':
this.scene.resultAnim(_poke31,'Faded','bad');
break;
case'stockpile':
_poke31.removeVolatile('stockpile1');
_poke31.removeVolatile('stockpile2');
_poke31.removeVolatile('stockpile3');
break;
case'protosynthesis':
_poke31.removeVolatile('protosynthesisatk');
_poke31.removeVolatile('protosynthesisdef');
_poke31.removeVolatile('protosynthesisspa');
_poke31.removeVolatile('protosynthesisspd');
_poke31.removeVolatile('protosynthesisspe');
break;
case'quarkdrive':
_poke31.removeVolatile('quarkdriveatk');
_poke31.removeVolatile('quarkdrivedef');
_poke31.removeVolatile('quarkdrivespa');
_poke31.removeVolatile('quarkdrivespd');
_poke31.removeVolatile('quarkdrivespe');
break;
default:
if(_effect14.effectType==='Move'){
if(_effect14.name==='Doom Desire'){
this.scene.runOtherAnim('doomdesirehit',[_poke31]);
}
if(_effect14.name==='Future Sight'){
this.scene.runOtherAnim('futuresighthit',[_poke31]);
}
if(_effect14.name==='Final Hour'){
this.scene.runOtherAnim('finalhourhit',[_poke31]);
}
}
}
}
this.scene.updateStatbar(_poke31);
this.log(args,kwArgs);
break;
}
case'-singleturn':{
var _poke32=this.getPokemon(args[1]);
var _effect15=Dex.getEffect(args[2]);
if(_effect15.id==='roost'&&!_poke32.getTypeList().includes('Flying')){
break;
}
_poke32.addTurnstatus(_effect15.id);
switch(_effect15.id){
case'roost':
this.scene.resultAnim(_poke32,'Landed','neutral');
break;
case'quickguard':
this.scene.resultAnim(_poke32,'Quick Guard','good');
break;
case'wideguard':
this.scene.resultAnim(_poke32,'Wide Guard','good');
break;
case'craftyshield':
this.scene.resultAnim(_poke32,'Crafty Shield','good');
break;
case'matblock':
this.scene.resultAnim(_poke32,'Mat Block','good');
break;
case'protect':
this.scene.resultAnim(_poke32,'Protected','good');
break;
case'endure':
this.scene.resultAnim(_poke32,'Enduring','good');
break;
case'helpinghand':
this.scene.resultAnim(_poke32,'Helping Hand','good');
break;
case'focuspunch':
this.scene.resultAnim(_poke32,'Focusing','neutral');
_poke32.rememberMove(_effect15.name,0);
break;
case'shelltrap':
this.scene.resultAnim(_poke32,'Trap set','neutral');
_poke32.rememberMove(_effect15.name,0);
break;
case'beakblast':
this.scene.runOtherAnim('bidecharge',[_poke32]);
this.scene.resultAnim(_poke32,'Beak Blast','neutral');
break;
}
this.scene.updateStatbar(_poke32);
this.log(args,kwArgs);
break;
}
case'-singlemove':{
var _poke33=this.getPokemon(args[1]);
var _effect16=Dex.getEffect(args[2]);
_poke33.addMovestatus(_effect16.id);
switch(_effect16.id){
case'grudge':
this.scene.resultAnim(_poke33,'Grudge','neutral');
break;
case'destinybond':
this.scene.resultAnim(_poke33,'Destiny Bond','neutral');
break;
}
this.scene.updateStatbar(_poke33);
this.log(args,kwArgs);
break;
}
case'-activate':{
var _poke34=this.getPokemon(args[1]);
var _effect17=Dex.getEffect(args[2]);
var _target3=this.getPokemon(args[3]);
this.activateAbility(_poke34,_effect17);
switch(_effect17.id){
case'poltergeist':
_poke34.item=kwArgs.item;
_poke34.itemEffect='disturbed';
break;
case'grudge':
_poke34.rememberMove(kwArgs.move,Infinity);
break;
case'substitute':
if(kwArgs.damage){
this.scene.resultAnim(_poke34,'Damage','bad');
}else if(kwArgs.block){
this.scene.resultAnim(_poke34,'Blocked','neutral');
}
break;
case'attract':
this.scene.runStatusAnim('attracted',[_poke34]);
break;
case'bide':
this.scene.runOtherAnim('bidecharge',[_poke34]);
break;


case'aromatherapy':
this.scene.resultAnim(_poke34,'Team Cured','good');
break;
case'healbell':
this.scene.resultAnim(_poke34,'Team Cured','good');
break;
case'brickbreak':
_target3.side.removeSideCondition('Reflect');
_target3.side.removeSideCondition('LightScreen');
break;
case'hyperdrill':
case'hyperspacefury':
case'hyperspacehole':
case'phantomforce':
case'shadowforce':
case'feint':
this.scene.resultAnim(_poke34,'Protection broken','bad');
_poke34.removeTurnstatus('protect');for(var _i50=0,_poke34$side$pokemon2=
_poke34.side.pokemon;_i50<_poke34$side$pokemon2.length;_i50++){var curTarget=_poke34$side$pokemon2[_i50];
curTarget.removeTurnstatus('wideguard');
curTarget.removeTurnstatus('quickguard');
curTarget.removeTurnstatus('craftyshield');
curTarget.removeTurnstatus('matblock');
this.scene.updateStatbar(curTarget);
}
break;
case'eeriespell':
case'gmaxdepletion':
case'spite':
var move=this.dex.moves.get(kwArgs.move).name;
var pp=Number(kwArgs.number);
if(isNaN(pp))pp=4;
_poke34.rememberMove(move,pp);
break;
case'drinkpotion':
move=this.dex.moves.get(kwArgs.move).name;
pp=Number(kwArgs.number);
if(isNaN(pp))pp=4;
_poke34.rememberMove(move,pp-1);
break;
case'gravity':
_poke34.removeVolatile('magnetrise');
_poke34.removeVolatile('telekinesis');
this.scene.anim(_poke34,{time:100});
break;
case'skillswap':case'wanderingspirit':
if(this.gen<=4)break;
var pokeability=Dex.sanitizeName(kwArgs.ability)||_target3.ability;
var targetability=Dex.sanitizeName(kwArgs.ability2)||_poke34.ability;
if(pokeability){
_poke34.ability=pokeability;
if(!_target3.baseAbility)_target3.baseAbility=pokeability;
}
if(targetability){
_target3.ability=targetability;
if(!_poke34.baseAbility)_poke34.baseAbility=targetability;
}
if(_poke34.side!==_target3.side){
this.activateAbility(_poke34,pokeability,true);
this.activateAbility(_target3,targetability,true);
}
break;


case'electromorphosis':
case'windpower':
_poke34.addMovestatus('charge');
break;
case'fourwarn':
case'forewarn':
if(_target3){
_target3.rememberMove(kwArgs.move,0);
}else{
var foeActive=[];for(var _i52=0,_poke34$side$foe$acti2=
_poke34.side.foe.active;_i52<_poke34$side$foe$acti2.length;_i52++){var maybeTarget=_poke34$side$foe$acti2[_i52];
if(maybeTarget&&!maybeTarget.fainted)foeActive.push(maybeTarget);
}
if(foeActive.length===1){
foeActive[0].rememberMove(kwArgs.move,0);
}
}
break;
case'lingeringaroma':
case'mummy':
case'memetic':
case'infected':
if(!kwArgs.ability)break;
var _ability2=this.dex.abilities.get(kwArgs.ability);
this.activateAbility(_target3,_ability2.name);
this.activateAbility(_poke34,_effect17.name);
this.scene.wait(700);
this.activateAbility(_target3,_effect17.name,true);
break;


case'leppaberry':
case'mysteryberry':
case'dispenser':
var _amount3=_effect17.id==='leppaberry'?-10:_effect17.id==='dispenser'?-1:-5;
_poke34.rememberMove(kwArgs.move,_amount3);
break;
case'focusband':
_poke34.item='Focus Band';
break;
case'quickclaw':
_poke34.item='Quick Claw';
break;
case'abilityshield':
_poke34.item='Ability Shield';
break;
case'allaccordingtokeikakuplan':
this.scene.runOtherAnim('keikaku',[_poke34]);
break;
default:
if(kwArgs.broken){
this.scene.resultAnim(_poke34,'Protection broken','bad');
}
}
this.log(args,kwArgs);
break;
}
case'-sidestart':{
var _side=this.getSide(args[1]);
var _effect18=Dex.getEffect(args[2]);
_side.addSideCondition(_effect18,!!kwArgs.persistent);

switch(_effect18.id){
case'runeofluck0':
_side.removeSideCondition('runeofluck1');
break;
case'runeofluck1':
_side.removeSideCondition('runeofluck2');
break;
case'runeofluck2':
_side.removeSideCondition('runeofluck3');
break;
case'runeofprotection0':
_side.removeSideCondition('runeofprotection1');
break;
case'runeofprotection1':
_side.removeSideCondition('runeofprotection2');
break;
case'runeofprotection2':
_side.removeSideCondition('runeofprotection3');
break;
case'runeofmending0':
_side.removeSideCondition('runeofmending1');
break;
case'runeofmending1':
_side.removeSideCondition('runeofmending2');
break;
case'runeofmending2':
_side.removeSideCondition('runeofmending3');
break;
case'tailwind':
case'backdraft':
case'auroraveil':
case'reflect':
case'lightscreen':
case'safeguard':
case'mist':
case'gmaxwildfire':
case'gmaxvolcalith':
case'gmaxvinelash':
case'gmaxcannonade':
case'grasspledge':
case'firepledge':
case'waterpledge':
this.scene.updateWeather();
break;
}
this.log(args,kwArgs);
break;
}
case'-sideend':{
var _side2=this.getSide(args[1]);
var _effect19=Dex.getEffect(args[2]);


_side2.removeSideCondition(_effect19.name);
this.log(args,kwArgs);
break;
}
case'-swapsideconditions':{
this.swapSideConditions();
this.scene.updateWeather();
this.log(args,kwArgs);
break;
}
case'-weather':{
var _effect20=Dex.getEffect(args[1]);
var _poke35=this.getPokemon(kwArgs.of)||undefined;
var _ability3=Dex.getEffect(kwArgs.from);
if(!_effect20.id||_effect20.id==='none'){
kwArgs.from=this.weather;
}
this.changeWeather(_effect20.name,_poke35,!!kwArgs.upkeep,_ability3);
this.log(args,kwArgs);
break;
}
case'-fieldstart':{
var _effect21=Dex.getEffect(args[1]);
var _poke36=this.getPokemon(kwArgs.of);
var _fromeffect5=Dex.getEffect(kwArgs.from);
this.activateAbility(_poke36,_fromeffect5);
var minTimeLeft=5;
var maxTimeLeft=0;
if(_effect21.id.endsWith('terrain')){
for(var i=this.pseudoWeather.length-1;i>=0;i--){
var pwID=toID(this.pseudoWeather[i][0]);
if(pwID.endsWith('terrain')){
this.pseudoWeather.splice(i,1);
continue;
}
}
if(this.gen>6)maxTimeLeft=8;
}
if(kwArgs.persistent)minTimeLeft+=2;
if(_effect21.id.endsWith('room')){
if(this.gen>=8)maxTimeLeft=7;
}
this.addPseudoWeather(_effect21.name,5,maxTimeLeft);

switch(_effect21.id){
case'gravity':
if(this.seeking!==null)break;for(var _i54=0,_this$getAllActive0=
this.getAllActive();_i54<_this$getAllActive0.length;_i54++){var _active=_this$getAllActive0[_i54];
this.scene.runOtherAnim('gravity',[_active]);
}
break;
}
this.log(args,kwArgs);
break;
}
case'-fieldend':{
var _effect22=Dex.getEffect(args[1]);

this.removePseudoWeather(_effect22.name);
this.log(args,kwArgs);
break;
}
case'-fieldactivate':{
var _effect23=Dex.getEffect(args[1]);
switch(_effect23.id){
case'perishsong':
this.scene.updateStatbars();
break;
}
this.log(args,kwArgs);
break;
}
case'-anim':{
var _poke37=this.getPokemon(args[1]);
var _move=this.dex.moves.get(args[2]);
if(this.checkActive(_poke37))return;
var _poke38=this.getPokemon(args[3]);
this.scene.beforeMove(_poke37);
this.animateMove(_poke37,_move,_poke38,kwArgs);
this.scene.afterMove(_poke37);
break;
}
case'-hint':case'-message':case'-candynamax':{
this.log(args,kwArgs);
break;
}
default:{
throw new Error("Unrecognized minor action: "+args[0]);
break;
}}
};_proto3.





































parseDetails=function parseDetails(name,pokemonid,details){var output=arguments.length>3&&arguments[3]!==undefined?arguments[3]:{};
var isTeamPreview=!name;
output.details=details;
output.name=name;
output.speciesForme=name;
output.level=100;
output.shiny=false;
output.gender='';
output.ident=!isTeamPreview?pokemonid:'';
output.searchid=!isTeamPreview?pokemonid+"|"+details:'';
var splitDetails=details.split(', ');
if(splitDetails[splitDetails.length-1].startsWith('tera:')){
output.terastallized=splitDetails[splitDetails.length-1].slice(5);
splitDetails.pop();
}
if(splitDetails[splitDetails.length-1]==='shiny'){
output.shiny=true;
splitDetails.pop();
}
if(splitDetails[splitDetails.length-1]==='M'||splitDetails[splitDetails.length-1]==='F'){
output.gender=splitDetails[splitDetails.length-1];
splitDetails.pop();
}
if(splitDetails[1]){
output.level=parseInt(splitDetails[1].substr(1),10)||100;
}
if(splitDetails[0]){
output.speciesForme=splitDetails[0];
}
return output;
};_proto3.
parseHealth=function parseHealth(hpstring){var output=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};
var _hpstring$split=hpstring.split(' '),hp=_hpstring$split[0],status=_hpstring$split[1];


output.hpcolor='';
if(hp==='0'||hp==='0.0'){
if(!output.maxhp)output.maxhp=100;
output.hp=0;
}else if(hp.indexOf('/')>0){
var _hp$split=hp.split('/'),curhp=_hp$split[0],maxhp=_hp$split[1];
if(isNaN(parseFloat(curhp))||isNaN(parseFloat(maxhp))){
return null;
}
output.hp=parseFloat(curhp);
output.maxhp=parseFloat(maxhp);
if(output.hp>output.maxhp)output.hp=output.maxhp;
var colorchar=maxhp.slice(-1);
if(colorchar==='y'||colorchar==='g'){
output.hpcolor=colorchar;
}
}else if(!isNaN(parseFloat(hp))){
if(!output.maxhp)output.maxhp=100;
output.hp=output.maxhp*parseFloat(hp)/100;
}


if(!status){
output.status='';
}else if(status==='par'||status==='brn'||status==='slp'||status==='frz'||status==='tox'||status==='radish'){
output.status=status;
}else if(status==='psn'&&output.status!=='tox'){
output.status=status;
}else if(status==='fnt'){
output.hp=0;
output.fainted=true;
}
return output;
};_proto3.
parsePokemonId=function parsePokemonId(pokemonid){
var name=pokemonid;

var siden=-1;
var slot=-1;
if(/^p[1-9]($|: )/.test(name)){
siden=parseInt(name.charAt(1),10)-1;
name=name.slice(4);
}else if(/^p[1-9][a-f]: /.test(name)){
var slotChart={a:0,b:1,c:2,d:3,e:4,f:5};
siden=parseInt(name.charAt(1),10)-1;
slot=slotChart[name.charAt(2)];
name=name.slice(5);
pokemonid="p"+(siden+1)+": "+name;
}
return{name:name,siden:siden,slot:slot,pokemonid:pokemonid};
};_proto3.
getSwitchedPokemon=function getSwitchedPokemon(pokemonid,details){
if(pokemonid==='??')throw new Error("pokemonid not passed");
var _this$parsePokemonId2=this.parsePokemonId(pokemonid),name=_this$parsePokemonId2.name,siden=_this$parsePokemonId2.siden,slot=_this$parsePokemonId2.slot,parsedPokemonid=_this$parsePokemonId2.pokemonid;
pokemonid=parsedPokemonid;

var searchid=pokemonid+"|"+details;
var side=this.sides[siden];


for(var i=0;i<side.pokemon.length;i++){
var _pokemon=side.pokemon[i];
if(_pokemon.fainted)continue;

if(side.active.includes(_pokemon))continue;

if(_pokemon===side.lastPokemon&&!side.active[slot])continue;

if(_pokemon.searchid===searchid){

if(slot>=0)_pokemon.slot=slot;
return _pokemon;
}
if(!_pokemon.searchid&&_pokemon.checkDetails(details)){

_pokemon=side.addPokemon(name,pokemonid,details,i);
if(slot>=0)_pokemon.slot=slot;
return _pokemon;
}
}


var pokemon=side.addPokemon(name,pokemonid,details);
if(slot>=0)pokemon.slot=slot;
return pokemon;
};_proto3.
rememberTeamPreviewPokemon=function rememberTeamPreviewPokemon(sideid,details){
var _this$parsePokemonId3=this.parsePokemonId(sideid),siden=_this$parsePokemonId3.siden;

return this.sides[siden].addPokemon('','',details);
};_proto3.
findCorrespondingPokemon=function findCorrespondingPokemon(serverPokemon){
var _this$parsePokemonId4=this.parsePokemonId(serverPokemon.ident),siden=_this$parsePokemonId4.siden;
var searchid=serverPokemon.ident+"|"+serverPokemon.details;for(var _i56=0,_this$sides$siden$pok2=
this.sides[siden].pokemon;_i56<_this$sides$siden$pok2.length;_i56++){var pokemon=_this$sides$siden$pok2[_i56];
if(pokemon.searchid===searchid){
return pokemon;
}
}
return null;
};_proto3.
getPokemon=function getPokemon(pokemonid){var faintedOnly=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;
if(!pokemonid||pokemonid==='??'||pokemonid==='null'||pokemonid==='false'){
return null;
}
var _this$parsePokemonId5=this.parsePokemonId(pokemonid),siden=_this$parsePokemonId5.siden,slot=_this$parsePokemonId5.slot,parsedPokemonid=_this$parsePokemonId5.pokemonid;
pokemonid=parsedPokemonid;


var isInactive=slot<0;
var side=this.sides[siden];


if(!isInactive&&side.active[slot])return side.active[slot];for(var _i58=0,_side$pokemon2=

side.pokemon;_i58<_side$pokemon2.length;_i58++){var pokemon=_side$pokemon2[_i58];
if(isInactive&&side.active.includes(pokemon))continue;
if(faintedOnly&&pokemon.hp)continue;
if(pokemon.ident===pokemonid){
if(slot>=0)pokemon.slot=slot;
return pokemon;
}
}

return null;
};_proto3.
getSide=function getSide(sidename){
if(sidename==='p1'||sidename.startsWith('p1:'))return this.p1;
if(sidename==='p2'||sidename.startsWith('p2:'))return this.p2;
if((sidename==='p3'||sidename.startsWith('p3:'))&&this.p3)return this.p3;
if((sidename==='p4'||sidename.startsWith('p4:'))&&this.p4)return this.p4;
if(this.nearSide.id===sidename)return this.nearSide;
if(this.farSide.id===sidename)return this.farSide;
if(this.nearSide.name===sidename)return this.nearSide;
if(this.farSide.name===sidename)return this.farSide;
return{
name:sidename,
id:sidename.replace(/ /g,'')
};
};_proto3.

add=function add(command){
if(command)this.stepQueue.push(command);

if(this.atQueueEnd&&this.currentStep<this.stepQueue.length){
this.atQueueEnd=false;
this.nextStep();
}
};_proto3.








instantAdd=function instantAdd(command){
this.run(command,true);
this.preemptStepQueue.push(command);
this.add(command);
};_proto3.
runMajor=function runMajor(args,kwArgs,preempt){
switch(args[0]){
case'start':{
this.nearSide.active[0]=null;
this.farSide.active[0]=null;
this.scene.resetSides();
this.start();
break;
}
case'upkeep':{
this.usesUpkeep=true;
this.updateTurnCounters();
break;
}
case'turn':{
this.setTurn(parseInt(args[1],10));
this.log(args);
break;
}
case'tier':{
this.tier=args[1];
if(this.tier.slice(-13)==='Random Battle'&&!toID(this.tier).startsWith('gen8cloverblobboscap')){
this.speciesClause=true;
}
if(this.tier.slice(-8)===' (Blitz)'){
this.messageFadeTime=40;
this.isBlitz=true;
}
if(this.tier.includes("Let's Go")){
this.dex=Dex.mod(7,'gen7letsgo');
}
this.log(args);
break;
}
case'gametype':{
this.gameType=args[1];
switch(args[1]){
case'multi':
case'freeforall':
this.pokemonControlled=1;
if(!this.p3)this.p3=new Side(this,2);
if(!this.p4)this.p4=new Side(this,3);
this.p3.foe=this.p2;
this.p4.foe=this.p1;

if(args[1]==='multi'){
this.p4.ally=this.p2;
this.p3.ally=this.p1;
this.p1.ally=this.p3;
this.p2.ally=this.p4;
}

this.p3.isFar=this.p1.isFar;
this.p4.isFar=this.p2.isFar;
this.sides=[this.p1,this.p2,this.p3,this.p4];

this.p1.active=this.p3.active=[null,null];
this.p2.active=this.p4.active=[null,null];
break;
case'doubles':
this.nearSide.active=[null,null];
this.farSide.active=[null,null];
break;
case'triples':
case'rotation':
this.nearSide.active=[null,null,null];
this.farSide.active=[null,null,null];
break;
default:for(var _i60=0,_this$sides6=
this.sides;_i60<_this$sides6.length;_i60++){var side=_this$sides6[_i60];side.active=[null];}
break;
}
if(!this.pokemonControlled)this.pokemonControlled=this.nearSide.active.length;
this.scene.updateGen();
this.scene.resetSides();
break;
}
case'rule':{
var ruleName=args[1].split(': ')[0];
if(ruleName==='Species Clause')this.speciesClause=true;
if(ruleName==='Blitz'){
this.messageFadeTime=40;
this.isBlitz=true;
}
this.rules[ruleName]=1;
this.log(args);
break;
}
case'rated':{
this.rated=args[1]||true;
this.scene.updateGen();
this.log(args);
break;
}
case'inactive':{
if(!this.kickingInactive)this.kickingInactive=true;
if(args[1].slice(0,11)==="Time left: "){
var _args$1$split=args[1].split(' | '),time=_args$1$split[0],totalTime=_args$1$split[1],graceTime=_args$1$split[2];
this.kickingInactive=parseInt(time.slice(11),10)||true;
this.totalTimeLeft=parseInt(totalTime,10);
this.graceTimeLeft=parseInt(graceTime||'',10)||0;
if(this.totalTimeLeft===this.kickingInactive)this.totalTimeLeft=0;
return;
}else if(args[1].slice(0,9)==="You have "){



this.kickingInactive=parseInt(args[1].slice(9),10)||true;
return;
}else if(args[1].slice(-14)===' seconds left.'){var _window$app;
var hasIndex=args[1].indexOf(' has ');
var userid=(_window$app=window.app)==null||(_window$app=_window$app.user)==null?void 0:_window$app.get('userid');
if(toID(args[1].slice(0,hasIndex))===userid){
this.kickingInactive=parseInt(args[1].slice(hasIndex+5),10)||true;
}
}else if(args[1].slice(-27)===' 15 seconds left this turn.'){
if(this.isBlitz)return;
}
this.log(args,undefined,preempt);
break;
}
case'inactiveoff':{
this.kickingInactive=false;
this.log(args,undefined,preempt);
break;
}
case'join':case'j':case'J':{
if(this.roomid){
var room=app.rooms[this.roomid];
var user=BattleTextParser.parseNameParts(args[1]);
var _userid=toUserid(user.name);
if(!room.users[_userid])room.userCount.users++;
room.users[_userid]=user;
room.userList.add(_userid);
room.userList.updateUserCount();
room.userList.updateNoUsersOnline();
}
this.log(args,undefined,preempt);
break;
}
case'leave':case'l':case'L':{
if(this.roomid){
var _room=app.rooms[this.roomid];
var _user=args[1];
var _userid2=toUserid(_user);
if(_room.users[_userid2])_room.userCount.users--;
delete _room.users[_userid2];
_room.userList.remove(_userid2);
_room.userList.updateUserCount();
_room.userList.updateNoUsersOnline();
}
this.log(args,undefined,preempt);
break;
}
case'name':case'n':case'N':{
if(this.roomid){
var _room2=app.rooms[this.roomid];
var _user2=BattleTextParser.parseNameParts(args[1]);
var oldid=args[2];
if(toUserid(oldid)===app.user.get('userid')){
app.user.set({
away:_user2.away,
status:_user2.status
});
}
var _userid3=toUserid(_user2.name);
_room2.users[_userid3]=_user2;
_room2.userList.remove(oldid);
_room2.userList.add(_userid3);
}
if(!this.ignoreSpects){
this.log(args,undefined,preempt);
}
break;
}
case'player':{
var _side3=this.getSide(args[1]);
_side3.setName(args[2]);
if(args[3])_side3.setAvatar(args[3]);
if(args[4])_side3.rating=args[4];
if(args[5]){
var misc=JSON.parse(args[5]);
if(misc.badges)_side3.badges=misc.badges;
}
if(this.joinButtons)this.scene.hideJoinButtons();
this.log(args);
this.scene.updateSidebar(_side3);
break;
}
case'teamsize':{
var _side4=this.getSide(args[1]);
_side4.totalPokemon=parseInt(args[2],10);
this.scene.updateSidebar(_side4);
break;
}
case'win':case'tie':{
this.winner(args[0]==='tie'?undefined:args[1]);
break;
}
case'prematureend':{
this.prematureEnd();
break;
}
case'clearpoke':{
this.p1.clearPokemon();
this.p2.clearPokemon();
break;
}
case'poke':{
var pokemon=this.rememberTeamPreviewPokemon(args[1],args[2]);
if(args[3]==='mail'){
pokemon.item='(mail)';
}else if(args[3]==='item'){
pokemon.item='(exists)';
}
break;
}
case'updatepoke':{
var _this$parsePokemonId6=this.parsePokemonId(args[1]),siden=_this$parsePokemonId6.siden;
var _side5=this.sides[siden];
for(var i=0;i<_side5.pokemon.length;i++){
var _pokemon2=_side5.pokemon[i];
if(_pokemon2.details!==args[2]&&_pokemon2.checkDetails(args[2])){
_side5.addPokemon('','',args[2],i);
break;
}
}
break;
}
case'teampreview':{
this.teamPreviewCount=parseInt(args[1],10);
this.scene.teamPreview();
break;
}
case'switch':case'drag':case'replace':{var _args$2$match;
this.endLastTurn();
var poke=this.getSwitchedPokemon(args[1],args[2]);
var slot=poke.slot;
poke.healthParse(args[3]);
poke.removeVolatile('itemremoved');
poke.terastallized=((_args$2$match=args[2].match(/tera:([a-z]+)$/i))==null?void 0:_args$2$match[1])||'';
if(args[0]==='switch'){
if(poke.side.active[slot]){
poke.side.switchOut(poke.side.active[slot],kwArgs);
}
poke.side.switchIn(poke,kwArgs);
}else if(args[0]==='replace'){
poke.side.replace(poke);
}else{
poke.side.dragIn(poke);
}
this.scene.updateWeather();
this.log(args,kwArgs);
break;
}
case'faint':{
var _poke39=this.getPokemon(args[1]);
_poke39.side.faint(_poke39);
this.log(args,kwArgs);
break;
}
case'swap':{
if(isNaN(Number(args[2]))){
var _poke40=this.getPokemon(args[1]);
_poke40.side.swapWith(_poke40,this.getPokemon(args[2]),kwArgs);
}else{
var _poke41=this.getPokemon(args[1]);
var targetIndex=parseInt(args[2],10);
if(kwArgs.from){
var target=_poke41.side.active[targetIndex];
if(target)args[2]=target.ident;
}
_poke41.side.swapTo(_poke41,targetIndex);
}
this.log(args,kwArgs);
break;
}
case'move':{
this.endLastTurn();
this.resetTurnsSinceMoved();
var _poke42=this.getPokemon(args[1]);
var move=this.dex.moves.get(args[2]);
if(this.checkActive(_poke42))return;
var poke2=this.getPokemon(args[3]);
this.scene.beforeMove(_poke42);
this.useMove(_poke42,move,poke2,kwArgs);
this.animateMove(_poke42,move,poke2,kwArgs);
this.log(args,kwArgs);
this.scene.afterMove(_poke42);
break;
}
case'cant':{
this.endLastTurn();
this.resetTurnsSinceMoved();
var _poke43=this.getPokemon(args[1]);
var effect=Dex.getEffect(args[2]);
var _move2=this.dex.moves.get(args[3]);
this.cantUseMove(_poke43,effect,_move2,kwArgs);
this.log(args,kwArgs);
break;
}
case'gen':{
this.gen=parseInt(args[1],10);
this.dex=Dex.mod(this.gen,this.modName);
this.scene.updateGen();
this.log(args);
break;
}
case'callback':{var _this$subscription5;
(_this$subscription5=this.subscription)==null||_this$subscription5.call(this,'callback');
break;
}
case'fieldhtml':{
this.scene.setFrameHTML(BattleLog.sanitizeHTML(args[1]));
break;
}
case'controlshtml':{
this.scene.setControlsHTML(BattleLog.sanitizeHTML(args[1]));
break;
}
default:{
this.log(args,kwArgs,preempt);
break;
}}
};_proto3.

run=function run(str,preempt){
if(!preempt&&this.preemptStepQueue.length&&str===this.preemptStepQueue[0]){
this.preemptStepQueue.shift();
this.scene.preemptCatchup();
return;
}
if(!str)return;
var _BattleTextParser$par=BattleTextParser.parseBattleLine(str),args=_BattleTextParser$par.args,kwArgs=_BattleTextParser$par.kwArgs;

if(this.scene.maybeCloseMessagebar(args,kwArgs)){
this.currentStep--;
this.activeMoveIsSpread=null;
return;
}


var nextArgs=[''];
var nextKwargs={};
var nextLine=this.stepQueue[this.currentStep+1]||'';
if(nextLine.slice(0,2)==='|-'){var _BattleTextParser$par2=
BattleTextParser.parseBattleLine(nextLine);nextArgs=_BattleTextParser$par2.args;nextKwargs=_BattleTextParser$par2.kwArgs;
}

if(this.debug){
if(args[0].charAt(0)==='-'||args[0]==='detailschange'){
this.runMinor(args,kwArgs,nextArgs,nextKwargs);
}else{
this.runMajor(args,kwArgs,preempt);
}
}else{
try{
if(args[0].charAt(0)==='-'||args[0]==='detailschange'){
this.runMinor(args,kwArgs,nextArgs,nextKwargs);
}else{
this.runMajor(args,kwArgs,preempt);
}
}catch(err){var _this$subscription6;
this.log(['majorerror','Error parsing: '+str+' ('+err+')']);
if(err.stack){
var stack=(''+err.stack).split('\n');for(var _i62=0;_i62<
stack.length;_i62++){var line=stack[_i62];
if(/\brun\b/.test(line)){
break;
}
this.log(['error',line]);
}
}
(_this$subscription6=this.subscription)==null||_this$subscription6.call(this,'error');
}
}

if(nextLine.startsWith('|start')||args[0]==='teampreview'){
if(this.turn===-1){
this.turn=0;
this.scene.updateBgm();
}
}
};_proto3.
checkActive=function checkActive(poke){
if(!poke.side.active[poke.slot]){

poke.side.replace(poke);
}
return false;
};_proto3.

pause=function pause(){var _this$subscription7;
this.paused=true;
this.scene.pause();
(_this$subscription7=this.subscription)==null||_this$subscription7.call(this,'paused');
};_proto3.








play=function play(){var _this$subscription8;
this.paused=false;
this.started=true;
this.scene.resume();
this.nextStep();
(_this$subscription8=this.subscription)==null||_this$subscription8.call(this,'playing');
};_proto3.
skipTurn=function skipTurn(){
this.seekBy(1);
};_proto3.
seekBy=function seekBy(deltaTurn){var _this$seeking;
if(this.seeking===Infinity&&deltaTurn<0){
return this.seekTurn(this.turn+1);
}
this.seekTurn(((_this$seeking=this.seeking)!=null?_this$seeking:this.turn)+deltaTurn);
};_proto3.
seekTurn=function seekTurn(turn,forceReset){
if(isNaN(turn))return;
turn=Math.max(Math.floor(turn),0);

if(this.seeking!==null&&turn>this.turn&&!forceReset){
this.seeking=turn;
return;
}

if(turn===0){var _this$subscription9;
this.seeking=null;
this.resetStep();
this.scene.animationOn();
if(this.paused)(_this$subscription9=this.subscription)==null||_this$subscription9.call(this,'paused');
return;
}

this.seeking=turn;

if(turn<=this.turn||forceReset){
this.scene.animationOff();
this.resetStep();
}else if(this.atQueueEnd){
this.scene.animationOn();
this.seeking=null;
}else{
this.scene.animationOff();
this.nextStep();
}
};_proto3.
stopSeeking=function stopSeeking(){var _this$subscription0;
this.seeking=null;
this.scene.animationOn();
(_this$subscription0=this.subscription)==null||_this$subscription0.call(this,this.paused?'paused':'playing');
};_proto3.
shouldStep=function shouldStep(){
if(this.atQueueEnd)return false;
if(this.seeking!==null)return true;
return!(this.paused&&this.turn>=0);
};_proto3.
nextStep=function nextStep(){var _this3=this;
if(!this.shouldStep())return;

var time=Date.now();
this.scene.startAnimations();
var animations=undefined;

var interruptionCount;
do{
this.waitForAnimations=true;
if(this.currentStep>=this.stepQueue.length){var _this$subscription1;
this.atQueueEnd=true;
if(!this.ended&&this.isReplay)this.prematureEnd();
this.stopSeeking();
if(this.ended){
this.scene.updateBgm();
}
(_this$subscription1=this.subscription)==null||_this$subscription1.call(this,'atqueueend');
return;
}

this.run(this.stepQueue[this.currentStep]);
this.currentStep++;
if(this.waitForAnimations===true){
animations=this.scene.finishAnimations();
}else if(this.waitForAnimations==='simult'){
this.scene.timeOffset=0;
}

if(Date.now()-time>300){
interruptionCount=this.scene.interruptionCount;
setTimeout(function(){
if(interruptionCount===_this3.scene.interruptionCount){
_this3.nextStep();
}
},1);
return;
}
}while(!animations&&this.shouldStep());

if(this.paused&&this.turn>=0&&this.seeking===null){

this.scene.pause();
return;
}

if(!animations)return;

interruptionCount=this.scene.interruptionCount;
animations.done(function(){
if(interruptionCount===_this3.scene.interruptionCount){
_this3.nextStep();
}
});
};_proto3.

setQueue=function setQueue(queue){
this.stepQueue=queue;
this.resetStep();
};_proto3.

setMute=function setMute(mute){
this.scene.setMute(mute);
};return Battle;}();


if(typeof require==='function'){

global.Battle=Battle;
global.Pokemon=Pokemon;
}
//# sourceMappingURL=battle.js.map