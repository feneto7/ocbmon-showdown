function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _wrapNativeSuper(t){var r="function"==typeof Map?new Map():void 0;return _wrapNativeSuper=function(t){if(null===t||!_isNativeFunction(t))return t;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==r){if(r.has(t))return r.get(t);r.set(t,Wrapper);}function Wrapper(){return _construct(t,arguments,_getPrototypeOf(this).constructor);}return Wrapper.prototype=Object.create(t.prototype,{constructor:{value:Wrapper,enumerable:!1,writable:!0,configurable:!0}}),_setPrototypeOf(Wrapper,t);},_wrapNativeSuper(t);}function _construct(t,e,r){if(_isNativeReflectConstruct())return Reflect.construct.apply(null,arguments);var o=[null];o.push.apply(o,e);var p=new(t.bind.apply(t,o))();return r&&_setPrototypeOf(p,r.prototype),p;}function _isNativeReflectConstruct(){try{var t=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));}catch(t){}return(_isNativeReflectConstruct=function(){return!!t;})();}function _isNativeFunction(t){try{return-1!==Function.toString.call(t).indexOf("[native code]");}catch(n){return"function"==typeof t;}}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}function _getPrototypeOf(t){return _getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t);},_getPrototypeOf(t);}/**
 * Connection library
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */var



PSConnection=function(){



function PSConnection(){this.socket=null;this.connected=false;this.queue=[];
this.connect();
}var _proto=PSConnection.prototype;_proto.
connect=function connect(){var _this=this;
var server=PS.server;
// Usa flag https para definir o protocolo e evitar portas incorretas
var protocol = (server && server.https) ? 'https' : 'http';
var port = (protocol === 'https' ? ':' + server.port : ':' + server.httpport);
var url=protocol+'://'+server.host+port+server.prefix;
var socket=this.socket=new SockJS(url,[],{timeout:5*60*1000});
socket.onopen=function(){
console.log("\u2705 (CONNECTED)");
_this.connected=true;
PS.connected=true;for(var _i2=0,_this$queue2=
_this.queue;_i2<_this$queue2.length;_i2++){var msg=_this$queue2[_i2];socket.send(msg);}
_this.queue=[];
PS.update();
};
socket.onmessage=function(e){
PS.receive(''+e.data);
};
socket.onclose=function(){
console.log("\u2705 (DISCONNECTED)");
_this.connected=false;
PS.connected=false;
PS.isOffline=true;
for(var roomid in PS.rooms){
PS.rooms[roomid].connected=false;
}
_this.socket=null;
PS.update();
};
};_proto.
disconnect=function disconnect(){
this.socket.close();
PS.connection=null;
};_proto.
send=function send(msg){
if(!this.connected){
this.queue.push(msg);
return;
}
this.socket.send(msg);
};return PSConnection;}();


PS.connection=new PSConnection();

var PSLoginServer=new(function(){function _class(){}var _proto2=_class.prototype;_proto2.
query=function query(data){
var url='/~~'+PS.server.id+'/action.php';
if(location.pathname.endsWith('.html')){
url=Config.routes.clientProtocol+'://'+Config.routes.client+url;

if(typeof POKEMON_SHOWDOWN_TESTCLIENT_KEY==='string'){

data.sid=POKEMON_SHOWDOWN_TESTCLIENT_KEY.replace(/\%2C/g,',');
}
}
return Net(url).get({method:data?'POST':'GET',body:data}).then(
function(res){return res?JSON.parse(res.slice(1)):null;}
)["catch"](
function(){return null;}
);
};return _class;}())(
);var









HttpError=function(_Error){


function HttpError(message,statusCode,body){var _this2;
_this2=_Error.call(this,message)||this;_this2.statusCode=void 0;_this2.body=void 0;
_this2.name='HttpError';
_this2.statusCode=statusCode;
_this2.body=body;
try{
Error.captureStackTrace(_this2,HttpError);
}catch(err){}return _this2;
}_inheritsLoose(HttpError,_Error);return HttpError;}(_wrapNativeSuper(Error));var

NetRequest=function(){

function NetRequest(uri){this.uri=void 0;
this.uri=uri;
}var _proto3=NetRequest.prototype;_proto3.









get=function get(){var _this3=this;var opts=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};
return new Promise(function(resolve,reject){
var xhr=new XMLHttpRequest();
var uri=_this3.uri;
if(opts.query){
uri+=(uri.includes('?')?'&':'?')+Net.encodeQuery(opts.query);
}
xhr.open(opts.method||'GET',uri);
xhr.onreadystatechange=function(){
var DONE=4;
if(xhr.readyState===DONE){
if(xhr.status===200){
resolve(xhr.responseText||'');
return;
}
var err=new HttpError(xhr.statusText||"Connection error",xhr.status,xhr.responseText);
reject(err);
}
};
if(opts.body){
xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
xhr.send(Net.encodeQuery(opts.body));
}else{
xhr.send();
}
});
};_proto3.












post=function post(){var opts=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};var body=arguments.length>1?arguments[1]:undefined;
if(!body)body=opts.body;
return this.get(Object.assign({},
opts,{
method:'POST',
body:body})
);
};return NetRequest;}();


function Net(uri){
return new NetRequest(uri);
}

Net.encodeQuery=function(data){
if(typeof data==='string')return data;
var urlencodedData='';
for(var _key in data){
if(urlencodedData)urlencodedData+='&';
urlencodedData+=encodeURIComponent(_key)+'='+encodeURIComponent(data[_key]);
}
return urlencodedData;
};
//# sourceMappingURL=client-connection.js.map