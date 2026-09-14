// Tests deny outbound network; loopback is reserved for existing local HTTP fixtures.
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import {syncBuiltinESMExports} from 'node:module';
function allowed(host) { return ['localhost','127.0.0.1','::1','[::1]'].includes(host); }
const originalFetch=globalThis.fetch;
globalThis.fetch=(input,...args)=> { const url=new URL(input instanceof Request?input.url:String(input));if(!allowed(url.hostname))throw Error('External network blocked by local telemetry tests');return originalFetch(input,...args); };
for(const api of [http,https])for(const key of ['request','get']){const original=api[key];api[key]=function(input,...args){const host=typeof input==='string'||input instanceof URL?new URL(input).hostname:input.hostname||input.host||'localhost';if(!allowed(host))throw Error('External network blocked by local telemetry tests');return original.call(this,input,...args);};}
const connect=net.Socket.prototype.connect;
net.Socket.prototype.connect=function(...args){const a=Array.isArray(args[0])?args[0]:args;const first=a[0];const host=typeof first==='object'?(first.host||'localhost'):typeof a[1]==='string'?a[1]:'localhost';if(!allowed(host))throw Error('External network blocked by local telemetry tests');return connect.apply(this,args);};
syncBuiltinESMExports();
