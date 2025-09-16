/**
 * Text parser
 *
 * No dependencies
 * Optional dependency: BattleText
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */var







BattleTextParser=function(){










function BattleTextParser(){var perspective=arguments.length>0&&arguments[0]!==undefined?arguments[0]:'p1';this.p1="Player 1";this.p2="Player 2";this.p3="Player 3";this.p4="Player 4";this.perspective=void 0;this.gen=9;this.turn=0;this.curLineSection='break';this.lowercaseRegExp=undefined;this.
















































































































































































































pokemonName=function(pokemon){
if(!pokemon)return'';
if(!pokemon.startsWith('p'))return"???pokemon:"+pokemon+"???";
if(pokemon.charAt(3)===':')return pokemon.slice(4).trim();else
if(pokemon.charAt(2)===':')return pokemon.slice(3).trim();
return"???pokemon:"+pokemon+"???";
};this.perspective=perspective;}BattleTextParser.parseLine=function parseLine(line,noDefault){if(!line.startsWith('|')){return['',line];}if(line==='|'){return['done'];}var index=line.indexOf('|',1);var cmd=line.slice(1,index);switch(cmd){case'chatmsg':case'chatmsg-raw':case'raw':case'error':case'html':case'inactive':case'inactiveoff':case'warning':case'fieldhtml':case'controlshtml':case'bigerror':case'debug':case'tier':case'challstr':case'popup':case'':return[cmd,line.slice(index+1)];case'c':case'chat':case'uhtml':case'uhtmlchange':case'queryresponse':var index2a=line.indexOf('|',index+1);return[cmd,line.slice(index+1,index2a),line.slice(index2a+1)];case'c:':case'pm':var index2b=line.indexOf('|',index+1);var index3b=line.indexOf('|',index2b+1);return[cmd,line.slice(index+1,index2b),line.slice(index2b+1,index3b),line.slice(index3b+1)];}if(noDefault)return null;return line.slice(1).split('|');};BattleTextParser.parseBattleLine=function parseBattleLine(line){var args=this.parseLine(line,true);if(args)return{args:args,kwArgs:{}};args=line.slice(1).split('|');var kwArgs={};while(args.length>1){var lastArg=args[args.length-1];if(lastArg.charAt(0)!=='[')break;var bracketPos=lastArg.indexOf(']');if(bracketPos<=0)break;kwArgs[lastArg.slice(1,bracketPos)]=lastArg.slice(bracketPos+1).trim()||'.';args.pop();}return BattleTextParser.upgradeArgs({args:args,kwArgs:kwArgs});};BattleTextParser.parseNameParts=function parseNameParts(text){var group='';if(!/[A-Za-z0-9]/.test(text.charAt(0))){group=text.charAt(0);text=text.slice(1);}var name=text;var atIndex=text.indexOf('@');var status='';var away=false;if(atIndex>0){name=text.slice(0,atIndex);status=text.slice(atIndex+1);if(status.startsWith('!')){away=true;status=status.slice(1);}}return{group:group,name:name,away:away,status:status};};BattleTextParser.upgradeArgs=function upgradeArgs(_ref){var args=_ref.args,kwArgs=_ref.kwArgs;switch(args[0]){case'-activate':{if(kwArgs.item||kwArgs.move||kwArgs.number||kwArgs.ability)return{args:args,kwArgs:kwArgs};var _args=args,pokemon=_args[1],effect=_args[2],arg3=_args[3],arg4=_args[4];var target=kwArgs.of;var id=BattleTextParser.effectId(effect);if(kwArgs.block)return{args:['-fail',pokemon],kwArgs:kwArgs};if(id==='wonderguard')return{args:['-immune',pokemon],kwArgs:{from:'ability:Wonder Guard'}};if(id==='beatup'&&kwArgs.of)return{args:args,kwArgs:{name:kwArgs.of}};if(['ingrain','quickguard','wideguard','craftyshield','matblock','protect','mist','safeguard','electricterrain','mistyterrain','psychicterrain','telepathy','stickyhold','suctioncups','aromaveil','flowerveil','sweetveil','disguise','safetygoggles','protectivepads'].includes(id)){if(target){kwArgs.of=pokemon;return{args:['-block',target,effect,arg3],kwArgs:kwArgs};}return{args:['-block',pokemon,effect,arg3],kwArgs:kwArgs};}if(id==='charge'){return{args:['-singlemove',pokemon,effect],kwArgs:{of:target}};}if(['bind','wrap','clamp','whirlpool','firespin','magmastorm','sandtomb','infestation','snaptrap','thundercage','trapped'].includes(id)){return{args:['-start',pokemon,effect],kwArgs:{of:target}};}if(id==='fairylock'){return{args:['-fieldactivate',effect],kwArgs:{}};}if(id==='symbiosis'||id==='poltergeist'){kwArgs.item=arg3;}else if(id==='magnitude'){kwArgs.number=arg3;}else if(id==='skillswap'||id==='mummy'||id==='lingeringaroma'||id==='wanderingspirit'){kwArgs.ability=arg3;kwArgs.ability2=arg4;}else if(['eeriespell','gmaxdepletion','spite','grudge','forewarn','sketch','leppaberry','mysteryberry','dispenser','drinkpotion','fourwarn'].includes(id)){kwArgs.move=arg3;kwArgs.number=arg4;}args=['-activate',pokemon,effect,target||''];break;}case'-fail':{if(kwArgs.from==='ability: Flower Veil'){return{args:['-block',kwArgs.of,'ability: Flower Veil'],kwArgs:{of:args[1]}};}break;}case'-start':{if(kwArgs.from==='Protean'||kwArgs.from==='Color Change')kwArgs.from='ability:'+kwArgs.from;break;}case'move':{if(kwArgs.from==='Magic Bounce')kwArgs.from='ability:Magic Bounce';break;}case'cant':{var _args2=args,_pokemon2=_args2[1],_effect2=_args2[2],move=_args2[3];if(['ability: Damp','ability: Dazzling','ability: Queenly Majesty','ability: Armor Tail','ability: Supportive'].includes(_effect2)){args[0]='-block';return{args:['-block',_pokemon2,_effect2,move,kwArgs.of],kwArgs:{}};}break;}case'-heal':{var _id=BattleTextParser.effectId(kwArgs.from);if(['dryskin','eartheater','voltabsorb','waterabsorb'].includes(_id))kwArgs.of='';break;}case'-nothing':return{args:['-activate','','move:Splash'],kwArgs:kwArgs};}return{args:args,kwArgs:kwArgs};};var _proto=BattleTextParser.prototype;_proto.extractMessage=function extractMessage(buf){var out='';for(var _i2=0,_buf$split2=buf.split('\n');_i2<_buf$split2.length;_i2++){var _line=_buf$split2[_i2];var _BattleTextParser$par=BattleTextParser.parseBattleLine(_line),args=_BattleTextParser$par.args,kwArgs=_BattleTextParser$par.kwArgs;out+=this.parseArgs(args,kwArgs)||'';}return out;};_proto.fixLowercase=function fixLowercase(input){if(this.lowercaseRegExp===undefined){var prefixes=['pokemon','opposingPokemon','team','opposingTeam','party','opposingParty'].map(function(templateId){var template=BattleText["default"][templateId];if(template.charAt(0)===template.charAt(0).toUpperCase())return'';var bracketIndex=template.indexOf('[');if(bracketIndex>=0)return template.slice(0,bracketIndex);return template;}).filter(function(prefix){return prefix;});if(prefixes.length){var buf="((?:^|\n)(?:  |  \\(|\\[)?)("+prefixes.map(BattleTextParser.escapeRegExp).join('|')+")";this.lowercaseRegExp=new RegExp(buf,'g');}else{this.lowercaseRegExp=null;}}if(!this.lowercaseRegExp)return input;return input.replace(this.lowercaseRegExp,function(match,p1,p2){return p1+p2.charAt(0).toUpperCase()+p2.slice(1);});};BattleTextParser.escapeRegExp=function escapeRegExp(input){return input.replace(/[\\^$.*+?()[\]{}|]/g,'\\$&');};_proto.

pokemon=function pokemon(_pokemon){
if(!_pokemon)return'';
var side=_pokemon.slice(0,2);
if(!['p1','p2','p3','p4'].includes(side))return"???pokemon:"+_pokemon+"???";
var name=this.pokemonName(_pokemon);
var isNear=side===this.perspective||side===BattleTextParser.allyID(side);
var template=BattleText["default"][isNear?'pokemon':'opposingPokemon'];
return template.replace('[NICKNAME]',name);
};_proto.

pokemonFull=function pokemonFull(pokemon,details){
var nickname=this.pokemonName(pokemon);

var species=details.split(',')[0];
if(nickname===species)return[pokemon.slice(0,2),"**"+species+"**"];
return[pokemon.slice(0,2),nickname+" (**"+species+"**)"];
};_proto.

trainer=function trainer(side){
side=side.slice(0,2);
if(side==='p1')return this.p1;
if(side==='p2')return this.p2;
if(side==='p3')return this.p3;
if(side==='p4')return this.p4;
return"???side:"+side+"???";
};BattleTextParser.

allyID=function allyID(sideid){
if(sideid==='p1')return'p3';
if(sideid==='p2')return'p4';
if(sideid==='p3')return'p1';
if(sideid==='p4')return'p2';
return'';
};_proto.

team=function team(side){var isFar=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;
side=side.slice(0,2);
if(side===this.perspective||side===BattleTextParser.allyID(side)){
return!isFar?BattleText["default"].team:BattleText["default"].opposingTeam;
}
return isFar?BattleText["default"].team:BattleText["default"].opposingTeam;
};_proto.

own=function own(side){
side=side.slice(0,2);
if(side===this.perspective){
return'OWN';
}
return'';
};_proto.

party=function party(side){
side=side.slice(0,2);
if(side===this.perspective||side===BattleTextParser.allyID(side)){
return BattleText["default"].party;
}
return BattleText["default"].opposingParty;
};BattleTextParser.

effectId=function effectId(effect){
if(!effect)return'';
if(effect.startsWith('item:')||effect.startsWith('move:')){
effect=effect.slice(5);
}else if(effect.startsWith('ability:')){
effect=effect.slice(8);
}
return toID(effect);
};_proto.

effect=function effect(_effect){
if(!_effect)return'';
if(_effect.startsWith('item:')||_effect.startsWith('move:')){
_effect=_effect.slice(5);
}else if(_effect.startsWith('ability:')){
_effect=_effect.slice(8);
}
return _effect.trim();
};_proto.

template=function template(type){for(var _len=arguments.length,namespaces=new Array(_len>1?_len-1:0),_key=1;_key<_len;_key++){namespaces[_key-1]=arguments[_key];}for(var _i4=0;_i4<
namespaces.length;_i4++){var namespace=namespaces[_i4];
if(!namespace)continue;
if(namespace==='OWN'){
return BattleText["default"][type+'Own']+'\n';
}
if(namespace==='NODEFAULT'){
return'';
}
var id=BattleTextParser.effectId(namespace);
if(BattleText[id]&&type in BattleText[id]){
if(BattleText[id][type].charAt(1)==='.')type=BattleText[id][type].slice(2);
if(BattleText[id][type].charAt(0)==='#')id=BattleText[id][type].slice(1);
if(!BattleText[id][type])return'';
return BattleText[id][type]+'\n';
}
}
if(!BattleText["default"][type])return'';
return BattleText["default"][type]+'\n';
};_proto.

maybeAbility=function maybeAbility(effect,holder){
if(!effect)return'';
if(!effect.startsWith('ability:'))return'';
return this.ability(effect.slice(8).trim(),holder);
};_proto.

ability=function ability(name,holder){
if(!name)return'';
return BattleText["default"].abilityActivation.replace('[POKEMON]',this.pokemon(holder)).replace('[ABILITY]',this.effect(name))+'\n';
};BattleTextParser.

stat=function stat(_stat){
var entry=BattleText[_stat||"stats"];
if(!entry||!entry.statName)return"???stat:"+_stat+"???";
return entry.statName;
};_proto.

lineSection=function lineSection(args,kwArgs){
var cmd=args[0];
switch(cmd){
case'done':case'turn':
return'break';
case'move':case'cant':case'switch':case'drag':case'upkeep':case'start':
case'-mega':case'-candynamax':case'-terastallize':
return'major';
case'switchout':case'faint':
return'preMajor';
case'-zpower':
return'postMajor';
case'-damage':{
var id=BattleTextParser.effectId(kwArgs.from);
if(id==='confusion')return'major';
return'postMajor';
}
case'-curestatus':{
var _id2=BattleTextParser.effectId(kwArgs.from);
if(_id2==='naturalcure')return'preMajor';
return'postMajor';
}
case'-start':{
var _id3=BattleTextParser.effectId(kwArgs.from);
if(_id3==='protean')return'preMajor';
return'postMajor';
}
case'-activate':{
var _id4=BattleTextParser.effectId(args[2]);
if(_id4==='confusion'||_id4==='attract')return'preMajor';
return'postMajor';
}
}
return cmd.charAt(0)==='-'?'postMajor':'';
};_proto.

sectionBreak=function sectionBreak(args,kwArgs){
var prevSection=this.curLineSection;
var curSection=this.lineSection(args,kwArgs);
if(!curSection)return false;
this.curLineSection=curSection;
switch(curSection){
case'break':
if(prevSection!=='break')return true;
return false;
case'preMajor':
case'major':
if(prevSection==='postMajor'||prevSection==='major')return true;
return false;
case'postMajor':
return false;
}
};_proto.

parseArgs=function parseArgs(args,kwArgs,noSectionBreak){
var buf=!noSectionBreak&&this.sectionBreak(args,kwArgs)?'\n':'';
return buf+this.fixLowercase(this.parseArgsInner(args,kwArgs)||'');
};_proto.

parseArgsInner=function parseArgsInner(args,kwArgs){
var cmd=args[0];
switch(cmd){
case'player':{
var side=args[1],name=args[2];
if(side==='p1'&&name){
this.p1=name;
}else if(side==='p2'&&name){
this.p2=name;
}else if(side==='p3'&&name){
this.p3=name;
}else if(side==='p4'&&name){
this.p4=name;
}
return'';
}

case'gen':{
var num=args[1];
this.gen=parseInt(num,10);
return'';
}

case'turn':{
var _num=args[1];
this.turn=Number.parseInt(_num,10);
return this.template('turn').replace('[NUMBER]',_num)+'\n';
}

case'start':{
return this.template('startBattle').replace('[TRAINER]',this.p1).replace('[TRAINER]',this.p2);
}

case'win':case'tie':{
var _name=args[1];
if(cmd==='tie'||!_name){
return this.template('tieBattle').replace('[TRAINER]',this.p1).replace('[TRAINER]',this.p2);
}
return this.template('winBattle').replace('[TRAINER]',_name);
}

case'switch':{
var pokemon=args[1],details=args[2];
var _this$pokemonFull=this.pokemonFull(pokemon,details),_side=_this$pokemonFull[0],fullname=_this$pokemonFull[1];
var template=this.template('switchIn',this.own(_side));
return template.replace('[TRAINER]',this.trainer(_side)).replace('[FULLNAME]',fullname);
}

case'drag':{
var _pokemon3=args[1],_details=args[2];
var _this$pokemonFull2=this.pokemonFull(_pokemon3,_details),_side2=_this$pokemonFull2[0],_fullname=_this$pokemonFull2[1];
var _template=this.template('drag');
return _template.replace('[TRAINER]',this.trainer(_side2)).replace('[FULLNAME]',_fullname);
}

case'detailschange':case'-transform':case'-formechange':{
var _pokemon4=args[1],arg2=args[2],arg3=args[3];
var newSpecies='';
switch(cmd){
case'detailschange':newSpecies=arg2.split(',')[0].trim();break;
case'-transform':newSpecies=arg3;break;
case'-formechange':newSpecies=arg2;break;
}
var newSpeciesId=toID(newSpecies);
var id='';
var templateName='transform';
if(cmd!=='-transform'){
switch(newSpeciesId){
case'greninjaash':id='battlebond';break;
case'mimikyubusted':id='disguise';break;
case'zygardecomplete':id='powerconstruct';break;
case'necrozmaultra':id='ultranecroziumz';break;
case'darmanitanzen':id='zenmode';break;
case'darmanitan':id='zenmode';templateName='transformEnd';break;
case'darmanitangalarzen':id='zenmode';break;
case'darmanitangalar':id='zenmode';templateName='transformEnd';break;
case'aegislashblade':id='stancechange';break;
case'aegislash':id='stancechange';templateName='transformEnd';break;
case'wishiwashischool':id='schooling';break;
case'wishiwashi':id='schooling';templateName='transformEnd';break;
case'miniormeteor':id='shieldsdown';break;
case'minior':id='shieldsdown';templateName='transformEnd';break;
case'eiscuenoice':id='iceface';break;
case'eiscue':id='iceface';templateName='transformEnd';break;
case'blobbosadventurerlegendary':id='onaquest';break;
}
}else if(newSpecies){
id='transform';
}
var _template2=this.template(templateName,id,kwArgs.msg?'':'NODEFAULT');
var line1=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon4);
return line1+_template2.replace('[POKEMON]',this.pokemon(_pokemon4)).replace('[SPECIES]',newSpecies);
}

case'switchout':{
var _pokemon5=args[1];
var _side3=_pokemon5.slice(0,2);
var _template3=this.template('switchOut',kwArgs.from,this.own(_side3));
return _template3.replace('[TRAINER]',this.trainer(_side3)).replace('[NICKNAME]',this.pokemonName(_pokemon5)).replace('[POKEMON]',this.pokemon(_pokemon5));
}

case'faint':{
var _pokemon6=args[1];
var _template4=this.template('faint');
return _template4.replace('[POKEMON]',this.pokemon(_pokemon6));
}

case'swap':{
var _pokemon7=args[1],target=args[2];
if(!target||!isNaN(Number(target))){
var _template5=this.template('swapCenter');
return _template5.replace('[POKEMON]',this.pokemon(_pokemon7));
}
var _template6=this.template('swap');
return _template6.replace('[POKEMON]',this.pokemon(_pokemon7)).replace('[TARGET]',this.pokemon(target));
}

case'move':{
var _pokemon8=args[1],move=args[2];
var _line2=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon8);
if(kwArgs.zeffect){
_line2=this.template('zEffect').replace('[POKEMON]',this.pokemon(_pokemon8));
}
var _template7=this.template('move',kwArgs.from);
return _line2+_template7.replace('[POKEMON]',this.pokemon(_pokemon8)).replace('[MOVE]',move);
}

case'cant':{
var _pokemon9=args[1],effect=args[2],_move=args[3];
var _template8=this.template('cant',effect,'NODEFAULT')||
this.template(_move?'cant':'cantNoMove');
var _line3=this.maybeAbility(effect,kwArgs.of||_pokemon9);
return _line3+_template8.replace('[POKEMON]',this.pokemon(_pokemon9)).replace('[MOVE]',_move);
}

case'-candynamax':{
var _side4=args[1];
var own=this.own(_side4);
var _template9='';
if(this.turn===1){
if(own)_template9=this.template('canDynamax',own);
}else{
_template9=this.template('canDynamax',own);
}
return _template9.replace('[TRAINER]',this.trainer(_side4));
}

case'message':{
var message=args[1];
return''+message+'\n';
}

case'-start':{var _kwArgs$from;
var _pokemon0=args[1],_effect3=args[2],_arg=args[3];
var _line4=this.maybeAbility(_effect3,_pokemon0)||this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon0);
var _id5=BattleTextParser.effectId(_effect3);
if(_id5==='typechange'){
var _template0=this.template('typeChange',kwArgs.from);
return _line4+_template0.replace('[POKEMON]',this.pokemon(_pokemon0)).replace('[TYPE]',_arg).replace('[SOURCE]',this.pokemon(kwArgs.of));
}
if(_id5==='typeadd'){
var _template1=this.template('typeAdd',kwArgs.from);
return _line4+_template1.replace('[POKEMON]',this.pokemon(_pokemon0)).replace('[TYPE]',_arg);
}
if(_id5==='typereset'){
var _template10=this.template('typeReset',kwArgs.from);
return _line4+_template10.replace('[POKEMON]',this.pokemon(_pokemon0));
}
if(_id5.startsWith('stockpile')){
var _num2=_id5.slice(9);
var _template11=this.template('start','stockpile');
return _line4+_template11.replace('[POKEMON]',this.pokemon(_pokemon0)).replace('[NUMBER]',_num2);
}
if(_id5.startsWith('sharpen')){
var _num3=_id5.slice(9);
var _template12=this.template('start','sharpen');
return _line4+_template12.replace('[POKEMON]',this.pokemon(_pokemon0)).replace('[NUMBER]',_num3);
}
if(_id5.startsWith('perish')){
var _num4=_id5.slice(6);
var _template13=this.template('activate','perishsong');
return _line4+_template13.replace('[POKEMON]',this.pokemon(_pokemon0)).replace('[NUMBER]',_num4);
}
if(_id5.startsWith('protosynthesis')||_id5.startsWith('quarkdrive')){
var stat=_id5.slice(-3);
var _template14=this.template('start',_id5.slice(0,_id5.length-3));
return _line4+_template14.replace('[POKEMON]',this.pokemon(_pokemon0)).replace('[STAT]',BattleTextParser.stat(stat));
}
if(_id5==='onaquest'){
var _template15=this.template('start','onaquest');
return _line4+_template15.
replace('[POKEMON]',this.pokemon(_pokemon0)).
replace('[QUESTNAME]',kwArgs.questname).
replace('[QUESTTEXT]',kwArgs.questtext);
}
if(_id5==='taskoriented'){
var _template16=this.template('start','taskoriented');
return _line4+_template16.
replace('[POKEMON]',this.pokemon(_pokemon0)).
replace('[TASKNAME]',kwArgs.taskname).
replace('[TASKTEXT]',kwArgs.tasktext);
}
var templateId='start';
if(kwArgs.already)templateId='alreadyStarted';
if(kwArgs.fatigue)templateId='startFromFatigue';
if(kwArgs.zeffect)templateId='startFromZEffect';
if(kwArgs.damage)templateId='activate';
if(kwArgs.block)templateId='block';
if(kwArgs.upkeep)templateId='upkeep';
if(_id5==='mist'&&this.gen<=2)templateId='startGen'+this.gen;
if(_id5==='reflect'||_id5==='lightscreen')templateId='startGen1';
if(templateId==='start'&&(_kwArgs$from=kwArgs.from)!=null&&_kwArgs$from.startsWith('item:')){
templateId+='FromItem';
}
var _template17=this.template(templateId,kwArgs.from,_effect3);
return _line4+_template17.replace('[POKEMON]',this.pokemon(_pokemon0)).replace('[EFFECT]',this.effect(_effect3)).replace('[MOVE]',_arg).replace('[SOURCE]',this.pokemon(kwArgs.of)).replace('[ITEM]',this.effect(kwArgs.from));
}

case'-end':{var _kwArgs$from2;
var _pokemon1=args[1],_effect4=args[2];
var _line5=this.maybeAbility(_effect4,_pokemon1)||this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon1);
var _id6=BattleTextParser.effectId(_effect4);
if(_id6==='doomdesire'||_id6==='futuresight'||_id6==='finalhour'){
var _template18=this.template('activate',_effect4);
return _line5+_template18.replace('[TARGET]',this.pokemon(_pokemon1));
}
if(_id6==='onaquest'){
var _template19=this.template('end','onaquest');
return _line5+_template19.
replace('[POKEMON]',this.pokemon(_pokemon1)).
replace('[QUESTNAME]',kwArgs.questname);
}
if(_id6==='taskoriented'){
var _template20=this.template('end','taskoriented');
return _line5+_template20.
replace('[POKEMON]',this.pokemon(_pokemon1));
}
var _templateId='end';
var _template21='';
if((_kwArgs$from2=kwArgs.from)!=null&&_kwArgs$from2.startsWith('item:')){
_template21=this.template('endFromItem',_effect4);
}
if(!_template21)_template21=this.template(_templateId,_effect4);
return _line5+_template21.replace('[POKEMON]',this.pokemon(_pokemon1)).replace('[EFFECT]',this.effect(_effect4)).replace('[SOURCE]',this.pokemon(kwArgs.of)).replace('[ITEM]',this.effect(kwArgs.from));
}

case'-ability':{
var _pokemon10=args[1],ability=args[2],oldAbility=args[3],arg4=args[4];
var _line6='';
if(oldAbility&&(oldAbility.startsWith('p1')||oldAbility.startsWith('p2')||oldAbility==='boost')){
arg4=oldAbility;
oldAbility='';
}
if(oldAbility)_line6+=this.ability(oldAbility,_pokemon10);
_line6+=this.ability(ability,_pokemon10);
if(kwArgs.fail){
var _template22=this.template('block',kwArgs.from);
return _line6+_template22;
}
if(kwArgs.from){
_line6=this.maybeAbility(kwArgs.from,_pokemon10)+_line6;
var _template23=this.template('changeAbility',kwArgs.from);
return _line6+_template23.replace('[POKEMON]',this.pokemon(_pokemon10)).replace('[ABILITY]',this.effect(ability)).replace('[SOURCE]',this.pokemon(kwArgs.of));
}
var _id7=BattleTextParser.effectId(ability);
if(_id7==='unnerve'){
var _template24=this.template('start',ability);
return _line6+_template24.replace('[TEAM]',this.team(_pokemon10.slice(0,2),true));
}
var _templateId2='start';
if(_id7==='anticipation'||_id7==='sturdy')_templateId2='activate';
var _template25=this.template(_templateId2,ability,'NODEFAULT');
return _line6+_template25.replace('[POKEMON]',this.pokemon(_pokemon10));
}

case'-endability':{
var _pokemon11=args[1],_ability=args[2];
if(_ability)return this.ability(_ability,_pokemon11);
var _line7=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon11);
var _template26=this.template('start','Gastro Acid');
return _line7+_template26.replace('[POKEMON]',this.pokemon(_pokemon11));
}

case'-item':{
var _pokemon12=args[1],item=args[2];
var _id8=BattleTextParser.effectId(kwArgs.from);
var _target='';
if(['magician','pickpocket'].includes(_id8)){var _ref2=
[kwArgs.of,''];_target=_ref2[0];kwArgs.of=_ref2[1];
}
var _line8=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon12);
if(['thief','covet','bestow','magician','pickpocket'].includes(_id8)){
var _template27=this.template('takeItem',kwArgs.from);
return _line8+_template27.replace('[POKEMON]',this.pokemon(_pokemon12)).replace('[ITEM]',this.effect(item)).replace('[SOURCE]',this.pokemon(_target||kwArgs.of));
}
if(_id8==='frisk'){
var hasTarget=kwArgs.of&&_pokemon12&&kwArgs.of!==_pokemon12;
var _template28=this.template(hasTarget?'activate':'activateNoTarget',"Frisk");
return _line8+_template28.replace('[POKEMON]',this.pokemon(kwArgs.of)).replace('[ITEM]',this.effect(item)).replace('[TARGET]',this.pokemon(_pokemon12));
}
if(kwArgs.from){
var _template29=this.template('addItem',kwArgs.from);
return _line8+_template29.replace('[POKEMON]',this.pokemon(_pokemon12)).replace('[ITEM]',this.effect(item));
}
var _template30=this.template('start',item,'NODEFAULT');
return _line8+_template30.replace('[POKEMON]',this.pokemon(_pokemon12));
}

case'-enditem':{
var _pokemon13=args[1],_item=args[2];
var _line9=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon13);
if(kwArgs.eat){
var _template31=this.template('eatItem',kwArgs.from);
return _line9+_template31.replace('[POKEMON]',this.pokemon(_pokemon13)).replace('[ITEM]',this.effect(_item));
}
var _id9=BattleTextParser.effectId(kwArgs.from);
if(_id9==='gem'){
var _template32=this.template('useGem',_item);
return _line9+_template32.replace('[POKEMON]',this.pokemon(_pokemon13)).replace('[ITEM]',this.effect(_item)).replace('[MOVE]',kwArgs.move);
}
if(_id9==='stealeat'){
var _template33=this.template('removeItem',"Bug Bite");
return _line9+_template33.replace('[SOURCE]',this.pokemon(kwArgs.of)).replace('[ITEM]',this.effect(_item));
}
if(kwArgs.from){
var _template34=this.template('removeItem',kwArgs.from);
return _line9+_template34.replace('[POKEMON]',this.pokemon(_pokemon13)).replace('[ITEM]',this.effect(_item)).replace('[SOURCE]',this.pokemon(kwArgs.of));
}
if(kwArgs.weaken){
var _template35=this.template('activateWeaken');
return _line9+_template35.replace('[POKEMON]',this.pokemon(_pokemon13)).replace('[ITEM]',this.effect(_item));
}
var _template36=this.template('end',_item,'NODEFAULT');
if(!_template36)_template36=this.template('activateItem').replace('[ITEM]',this.effect(_item));
return _line9+_template36.replace('[POKEMON]',this.pokemon(_pokemon13)).replace('[TARGET]',this.pokemon(kwArgs.of));
}

case'-status':{
var _pokemon14=args[1],status=args[2];
var _line0=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon14);
if(BattleTextParser.effectId(kwArgs.from)==='rest'){
var _template37=this.template('startFromRest',status);
return _line0+_template37.replace('[POKEMON]',this.pokemon(_pokemon14));
}
var _template38=this.template('start',status);
return _line0+_template38.replace('[POKEMON]',this.pokemon(_pokemon14));
}

case'-curestatus':{var _kwArgs$from3;
var _pokemon15=args[1],_status=args[2];
if(BattleTextParser.effectId(kwArgs.from)==='naturalcure'){
var _template39=this.template('activate',kwArgs.from);
return _template39.replace('[POKEMON]',this.pokemon(_pokemon15));
}
var _line1=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon15);
if((_kwArgs$from3=kwArgs.from)!=null&&_kwArgs$from3.startsWith('item:')){
var _template40=this.template('endFromItem',_status);
return _line1+_template40.replace('[POKEMON]',this.pokemon(_pokemon15)).replace('[ITEM]',this.effect(kwArgs.from));
}
if(kwArgs.thaw){
var _template41=this.template('endFromMove',_status);
return _line1+_template41.replace('[POKEMON]',this.pokemon(_pokemon15)).replace('[MOVE]',this.effect(kwArgs.from));
}
var _template42=this.template('end',_status,'NODEFAULT');
if(!_template42)_template42=this.template('end').replace('[EFFECT]',_status);
return _line1+_template42.replace('[POKEMON]',this.pokemon(_pokemon15));
}

case'-cureteam':{
return this.template('activate',kwArgs.from);
}

case'-singleturn':case'-singlemove':{
var _pokemon16=args[1],_effect5=args[2];
var _line10=this.maybeAbility(_effect5,kwArgs.of||_pokemon16)||
this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon16);
var _id0=BattleTextParser.effectId(_effect5);
if(_id0==='instruct'){
var _template43=this.template('activate',_effect5);
return _line10+_template43.replace('[POKEMON]',this.pokemon(kwArgs.of)).replace('[TARGET]',this.pokemon(_pokemon16));
}
var _template44=this.template('start',_effect5,'NODEFAULT');
if(!_template44)_template44=this.template('start').replace('[EFFECT]',this.effect(_effect5));
return _line10+_template44.replace('[POKEMON]',this.pokemon(_pokemon16)).replace('[SOURCE]',this.pokemon(kwArgs.of)).replace('[TEAM]',this.team(_pokemon16.slice(0,2)));
}

case'-sidestart':{
var _side5=args[1],_effect6=args[2];
var _template45=this.template('start',_effect6,'NODEFAULT');
if(!_template45)_template45=this.template('startTeamEffect').replace('[EFFECT]',this.effect(_effect6));
return _template45.replace('[TEAM]',this.team(_side5)).replace('[PARTY]',this.party(_side5));
}

case'-sideend':{
var _side6=args[1],_effect7=args[2];
var _template46=this.template('end',_effect7,'NODEFAULT');
if(!_template46)_template46=this.template('endTeamEffect').replace('[EFFECT]',this.effect(_effect7));
return _template46.replace('[TEAM]',this.team(_side6)).replace('[PARTY]',this.party(_side6));
}

case'-weather':{
var weather=args[1];
if(!weather||weather==='none'){
var _template47=this.template('end',kwArgs.from,'NODEFAULT');
if(!_template47)return this.template('endFieldEffect').replace('[EFFECT]',this.effect(weather));
return _template47;
}
if(kwArgs.upkeep){
return this.template('upkeep',weather,'NODEFAULT');
}
var _line11=this.maybeAbility(kwArgs.from,kwArgs.of);
var _template48=this.template('start',weather,'NODEFAULT');
if(!_template48)_template48=this.template('startFieldEffect').replace('[EFFECT]',this.effect(weather));
return _line11+_template48;
}

case'-fieldstart':case'-fieldactivate':{
var _effect8=args[1];
var _line12=this.maybeAbility(kwArgs.from,kwArgs.of);
if(BattleTextParser.effectId(kwArgs.from)==='hadronengine'){
return _line12+this.template('start','hadronengine').replace('[POKEMON]',this.pokemon(kwArgs.of));
}
var _templateId3=cmd.slice(6);
if(BattleTextParser.effectId(_effect8)==='perishsong')_templateId3='start';
var _template49=this.template(_templateId3,_effect8,'NODEFAULT');
if(!_template49)_template49=this.template('startFieldEffect').replace('[EFFECT]',this.effect(_effect8));
return _line12+_template49.replace('[POKEMON]',this.pokemon(kwArgs.of));
}

case'-fieldend':{
var _effect9=args[1];
var _template50=this.template('end',_effect9,'NODEFAULT');
if(!_template50)_template50=this.template('endFieldEffect').replace('[EFFECT]',this.effect(_effect9));
return _template50;
}

case'-sethp':{
var _effect0=kwArgs.from;
return this.template('activate',_effect0);
}

case'-message':{
var _message=args[1];
return'  '+_message+'\n';
}

case'-hint':{
var _message2=args[1];
return'  ('+_message2+')\n';
}

case'-activate':{
var _pokemon17=args[1],_effect1=args[2],_target2=args[3];
var _id1=BattleTextParser.effectId(_effect1);
if(_id1==='celebrate'){
return this.template('activate','celebrate').replace('[TRAINER]',this.trainer(_pokemon17.slice(0,2)));
}
if(!_target2&&
['hyperdrill','hyperspacefury','hyperspacehole','phantomforce','shadowforce','feint'].includes(_id1)){var _ref3=
[kwArgs.of,_pokemon17];_pokemon17=_ref3[0];_target2=_ref3[1];
if(!_pokemon17)_pokemon17=_target2;
}
if(!_target2)_target2=kwArgs.of||_pokemon17;

var _line13=this.maybeAbility(_effect1,_pokemon17);

if(_id1==='lockon'||_id1==='mindreader'){
var _template51=this.template('start',_effect1);
return _line13+_template51.replace('[POKEMON]',this.pokemon(kwArgs.of)).replace('[SOURCE]',this.pokemon(_pokemon17));
}

if((_id1==='mummy'||_id1==='lingeringaroma')&&kwArgs.ability){
_line13+=this.ability(kwArgs.ability,_target2);
_line13+=this.ability(_id1==='mummy'?'Mummy':'Lingering Aroma',_target2);
var _template52=this.template('changeAbility',_id1);
return _line13+_template52.replace('[TARGET]',this.pokemon(_target2));
}

if(_id1==='commander'){


if(_target2===_pokemon17)return _line13;
var _template53=this.template('activate',_id1);
return _line13+_template53.replace('[POKEMON]',this.pokemon(_pokemon17)).replace(/\[TARGET\]/g,this.pokemon(_target2));
}

if(_id1==='dispenser'){
var _template54=this.template('activate',_effect1);
return _template54.replace('[SOURCE]',this.pokemon(kwArgs.of)).replace('[TARGET]',this.pokemon(_pokemon17)).replace('[MOVE]',kwArgs.move);
}

if(_id1==='onaquest'){
var _template55=this.template('activate','onaquest');
return _line13+_template55.
replace('[POKEMON]',this.pokemon(_pokemon17)).
replace('[QUESTNAME]',kwArgs.questname).
replace('[QUESTPROGRESS]',kwArgs.questprogress).
replace('[QUESTREQUIREMENT]',kwArgs.questrequirement).
replace('[QUESTPROGRESSTEXT]',kwArgs.questprogresstext);
}
if(_id1==='taskoriented'){
var _template56=this.template('activate','taskoriented');
return _line13+_template56.
replace('[POKEMON]',this.pokemon(_pokemon17)).
replace('[TASKNAME]',kwArgs.taskname).
replace('[TASKPROGRESS]',kwArgs.taskprogress).
replace('[TASKREQUIREMENT]',kwArgs.taskrequirement).
replace('[TASKPROGRESSTEXT]',kwArgs.taskprogresstext);
}

var _templateId4='activate';
if(_id1==='forewarn'&&_pokemon17===_target2){
_templateId4='activateNoTarget';
}
if(_id1==='fourwarn'&&_pokemon17===_target2){
_templateId4='activateNoTarget';
}
if((_id1==='protosynthesis'||_id1==='quarkdrive')&&kwArgs.fromitem){
_templateId4='activateFromItem';
}
if(_id1==='orichalcumpulse'&&kwArgs.source){
_templateId4='start';
}
var _template57=this.template(_templateId4,_effect1,'NODEFAULT');
if(!_template57){
if(_line13)return _line13;
_template57=this.template('activate');
return _line13+_template57.replace('[EFFECT]',this.effect(_effect1));
}

if(_id1==='brickbreak'){
_template57=_template57.replace('[TEAM]',this.team(_target2.slice(0,2)));
}
if(kwArgs.ability){
_line13+=this.ability(kwArgs.ability,_pokemon17);
}
if(kwArgs.ability2){
_line13+=this.ability(kwArgs.ability2,_target2);
}
if(kwArgs.move||kwArgs.number||kwArgs.item||kwArgs.name){
_template57=_template57.replace('[MOVE]',kwArgs.move).replace('[NUMBER]',kwArgs.number).replace('[ITEM]',kwArgs.item).replace('[NAME]',kwArgs.name);
}
return _line13+_template57.replace('[POKEMON]',this.pokemon(_pokemon17)).replace('[TARGET]',this.pokemon(_target2)).replace('[SOURCE]',this.pokemon(kwArgs.of));
}

case'-prepare':{
var _pokemon18=args[1],_effect10=args[2],_target3=args[3];
var _template58=this.template('prepare',_effect10);
return _template58.replace('[POKEMON]',this.pokemon(_pokemon18)).replace('[TARGET]',this.pokemon(_target3));
}

case'-damage':{
var _pokemon19=args[1],percentage=args[3];
var _template59=this.template('damage',kwArgs.from,'NODEFAULT');
var _line14=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon19);
var _id10=BattleTextParser.effectId(kwArgs.from);
if(_template59){
return _line14+_template59.replace('[POKEMON]',this.pokemon(_pokemon19));
}

if(!kwArgs.from){
_template59=this.template(percentage?'damagePercentage':'damage');
return _line14+_template59.replace('[POKEMON]',this.pokemon(_pokemon19)).replace('[PERCENTAGE]',percentage);
}
if(kwArgs.from.startsWith('item:')){
_template59=this.template(kwArgs.of?'damageFromPokemon':'damageFromItem');
return _line14+_template59.replace('[POKEMON]',this.pokemon(_pokemon19)).replace('[ITEM]',this.effect(kwArgs.from)).replace('[SOURCE]',this.pokemon(kwArgs.of));
}
if(kwArgs.partiallytrapped||_id10==='bind'||_id10==='wrap'){
_template59=this.template('damageFromPartialTrapping');
return _line14+_template59.replace('[POKEMON]',this.pokemon(_pokemon19)).replace('[MOVE]',this.effect(kwArgs.from));
}

_template59=this.template('damage');
return _line14+_template59.replace('[POKEMON]',this.pokemon(_pokemon19));
}

case'-heal':{
var _pokemon20=args[1];
var _template60=this.template('heal',kwArgs.from,'NODEFAULT');
var _line15=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon20);
if(_template60){
return _line15+_template60.replace('[POKEMON]',this.pokemon(_pokemon20)).replace('[SOURCE]',this.pokemon(kwArgs.of)).replace('[NICKNAME]',kwArgs.wisher);
}

if(kwArgs.from&&!kwArgs.from.startsWith('ability:')){
_template60=this.template('healFromEffect');
return _line15+_template60.replace('[POKEMON]',this.pokemon(_pokemon20)).replace('[EFFECT]',this.effect(kwArgs.from));
}

_template60=this.template('heal');
return _line15+_template60.replace('[POKEMON]',this.pokemon(_pokemon20));
}

case'-boost':case'-unboost':{var _kwArgs$from4;
var _pokemon21=args[1],_stat2=args[2],_num5=args[3];
if(_stat2==='spa'&&this.gen===1)_stat2='spc';
var amount=parseInt(_num5,10);
var _line16=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon21);
var _templateId5=cmd.slice(1);
if(amount>=3)_templateId5+='3';else
if(amount>=2)_templateId5+='2';else
if(amount===0)_templateId5+='0';
if(amount&&kwArgs.zeffect){
_templateId5+=kwArgs.multiple?'MultipleFromZEffect':'FromZEffect';
}else if(amount&&(_kwArgs$from4=kwArgs.from)!=null&&_kwArgs$from4.startsWith('item:')){
var _template61=this.template(_templateId5+'FromItem',kwArgs.from);
return _line16+_template61.replace('[POKEMON]',this.pokemon(_pokemon21)).replace('[STAT]',BattleTextParser.stat(_stat2)).replace('[ITEM]',this.effect(kwArgs.from));
}
var _template62=this.template(_templateId5,kwArgs.from);
return _line16+_template62.replace(/\[POKEMON\]/g,this.pokemon(_pokemon21)).replace('[STAT]',BattleTextParser.stat(_stat2));
}

case'-setboost':{
var _pokemon22=args[1];
var _effect11=kwArgs.from;
var _line17=this.maybeAbility(_effect11,kwArgs.of||_pokemon22);
var _template63=this.template('boost',_effect11);
return _line17+_template63.replace('[POKEMON]',this.pokemon(_pokemon22));
}

case'-swapboost':{
var _pokemon23=args[1],_target4=args[2];
var _line18=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon23);
var _id11=BattleTextParser.effectId(kwArgs.from);
var _templateId6='swapBoost';
if(_id11==='guardswap')_templateId6='swapDefensiveBoost';
if(_id11==='powerswap')_templateId6='swapOffensiveBoost';
var _template64=this.template(_templateId6,kwArgs.from);
return _line18+_template64.replace('[POKEMON]',this.pokemon(_pokemon23)).replace('[TARGET]',this.pokemon(_target4));
}

case'-copyboost':{
var _pokemon24=args[1],_target5=args[2];
var _line19=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon24);
var _template65=this.template('copyBoost',kwArgs.from);
return _line19+_template65.replace('[POKEMON]',this.pokemon(_pokemon24)).replace('[TARGET]',this.pokemon(_target5));
}

case'-clearboost':case'-clearpositiveboost':case'-clearnegativeboost':{
var _pokemon25=args[1],source=args[2];
var _line20=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon25);
var _templateId7='clearBoost';
if(kwArgs.zeffect)_templateId7='clearBoostFromZEffect';
var _template66=this.template(_templateId7,kwArgs.from);
return _line20+_template66.replace('[POKEMON]',this.pokemon(_pokemon25)).replace('[SOURCE]',this.pokemon(source));
}

case'-invertboost':{
var _pokemon26=args[1];
var _line21=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon26);
var _template67=this.template('invertBoost',kwArgs.from);
return _line21+_template67.replace('[POKEMON]',this.pokemon(_pokemon26));
}

case'-clearallboost':{
return this.template('clearAllBoost',kwArgs.from);
}

case'-crit':case'-supereffective':case'-resisted':{
var _pokemon27=args[1];
var _templateId8=cmd.slice(1);
if(_templateId8==='supereffective')_templateId8='superEffective';
if(kwArgs.spread)_templateId8+='Spread';
var _template68=this.template(_templateId8);
return _template68.replace('[POKEMON]',this.pokemon(_pokemon27));
}

case'-block':{
var _pokemon28=args[1],_effect12=args[2],_move2=args[3],attacker=args[4];
var _line22=this.maybeAbility(_effect12,kwArgs.of||_pokemon28);
var _id12=BattleTextParser.effectId(_effect12);
var _templateId9='block';
if(_id12==='mist'&&this.gen<=2)_templateId9='blockGen'+this.gen;
var _template69=this.template(_templateId9,_effect12);
return _line22+_template69.replace('[POKEMON]',this.pokemon(_pokemon28)).replace('[SOURCE]',this.pokemon(attacker||kwArgs.of)).replace('[MOVE]',_move2);
}

case'-fail':{
var _pokemon29=args[1],_effect13=args[2],_stat3=args[3];
var _id13=BattleTextParser.effectId(_effect13);
var blocker=BattleTextParser.effectId(kwArgs.from);
var _line23=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon29);
var _templateId0='block';
if(['desolateland','primordialsea'].includes(blocker)&&
!['sunnyday','raindance','sandstorm','hail','snowscape','chillyreception'].includes(_id13)){
_templateId0='blockMove';
}else if(blocker==='uproar'&&kwArgs.msg){
_templateId0='blockSelf';
}
var _template70=this.template(_templateId0,kwArgs.from);
if(_template70){
return _line23+_template70.replace('[POKEMON]',this.pokemon(_pokemon29));
}

if(_id13==='unboost'){
_template70=this.template(_stat3?'failSingular':'fail','unboost');
return _line23+_template70.replace('[POKEMON]',this.pokemon(_pokemon29)).replace('[STAT]',_stat3);
}

_templateId0='fail';
if(['brn','frz','par','psn','slp','substitute','shedtail'].includes(_id13)){
_templateId0='alreadyStarted';
}
if(kwArgs.heavy)_templateId0='failTooHeavy';
if(kwArgs.weak)_templateId0='fail';
if(kwArgs.forme)_templateId0='failWrongForme';
_template70=this.template(_templateId0,_id13);
return _line23+_template70.replace('[POKEMON]',this.pokemon(_pokemon29));
}

case'-immune':{
var _pokemon30=args[1];
var _line24=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon30);
var _template71=this.template('block',kwArgs.from);
if(!_template71){
var _templateId1=kwArgs.ohko?'immuneOHKO':'immune';
_template71=this.template(_pokemon30?_templateId1:'immuneNoPokemon',kwArgs.from);
}
return _line24+_template71.replace('[POKEMON]',this.pokemon(_pokemon30));
}

case'-miss':{
var _source=args[1],_pokemon31=args[2];
var _line25=this.maybeAbility(kwArgs.from,kwArgs.of||_pokemon31);
if(!_pokemon31){
var _template72=this.template('missNoPokemon');
return _line25+_template72.replace('[SOURCE]',this.pokemon(_source));
}
var _template73=this.template('miss');
return _line25+_template73.replace('[POKEMON]',this.pokemon(_pokemon31));
}

case'-center':case'-ohko':case'-combine':{
return this.template(cmd.slice(1));
}

case'-notarget':{
return this.template('noTarget');
}

case'-mega':case'-primal':{
var _pokemon32=args[1],species=args[2],_item2=args[3];
var _id14='';
var _templateId10=cmd.slice(1);
if(species==='Rayquaza'){
_id14='dragonascent';
_templateId10='megaNoItem';
}
if(!_id14&&cmd==='-mega'&&this.gen<7)_templateId10='megaGen6';
if(!_item2&&cmd==='-mega')_templateId10='megaNoItem';
var _template74=this.template(_templateId10,_id14);
var _side7=_pokemon32.slice(0,2);
var pokemonName=this.pokemon(_pokemon32);
if(cmd==='-mega'){
var template2=this.template('transformMega');
_template74+=template2.replace('[POKEMON]',pokemonName).replace('[SPECIES]',species);
}
return _template74.replace('[POKEMON]',pokemonName).replace('[ITEM]',_item2).replace('[TRAINER]',this.trainer(_side7));
}

case'-terastallize':{
var _pokemon33=args[1],type=args[2];
var _id15='';
var _templateId11=cmd.slice(1);
var _template75=this.template(_templateId11,_id15);
var _pokemonName=this.pokemon(_pokemon33);
return _template75.replace('[POKEMON]',_pokemonName).replace('[TYPE]',type);
}

case'-zpower':{
var _pokemon34=args[1];
var _template76=this.template('zPower');
return _template76.replace('[POKEMON]',this.pokemon(_pokemon34));
}

case'-burst':{
var _pokemon35=args[1];
var _template77=this.template('activate',"Ultranecrozium Z");
return _template77.replace('[POKEMON]',this.pokemon(_pokemon35));
}

case'-zbroken':{
var _pokemon36=args[1];
var _template78=this.template('zBroken');
return _template78.replace('[POKEMON]',this.pokemon(_pokemon36));
}

case'-hitcount':{
var _num6=args[2];
if(_num6==='1'){
return this.template('hitCountSingular');
}
return this.template('hitCount').replace('[NUMBER]',_num6);
}

case'-waiting':{
var _pokemon37=args[1],_target6=args[2];
var _template79=this.template('activate',"Water Pledge");
return _template79.replace('[POKEMON]',this.pokemon(_pokemon37)).replace('[TARGET]',this.pokemon(_target6));
}

case'-anim':{
return'';
}

default:{
return null;
}
}
};return BattleTextParser;}();


if(typeof require==='function'){

global.BattleTextParser=BattleTextParser;
}
//# sourceMappingURL=battle-text-parser.js.map