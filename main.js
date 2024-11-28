import { route } from "jsr:@std/http/unstable-route";
import { serveDir } from "jsr:@std/http/file-server";
import * as db from "./scripts/database.js";
import { handleLogin } from "./scripts/login.js";
import { handleDataGet, handleDataSet, handleDefaultGet, handleDefaultSet } from "./scripts/data.js";


await db.addProfile('test', '0', 0)

console.log(db.profiles())



const routes = [
  {
    pattern: new URLPattern({ pathname: "/" }),
    handler: _ => new Response(null, { status: 308, headers: {"Location": "/static/sites/login.html"}}),
  },
  {
    pattern: new URLPattern({ pathname: "/static/*" }),
    handler: req => serveDir(req),
  },
  {
    pattern: new URLPattern({ pathname: "/api/login" }),
    handler: handleLogin,
	method: ['POST'],
  },
  {
	pattern: new URLPattern({ pathname: "/api/data/:name/get" }),
    handler: handleDataGet,
  },
  {
	pattern: new URLPattern({ pathname: "/api/data/:name/set" }),
    handler: handleDataSet,
  },
  {
	pattern: new URLPattern({ pathname: "/api/me/get" }),
    handler: handleDefaultGet,
  },
  {
	pattern: new URLPattern({ pathname: "/api/me/set" }),
    handler: handleDefaultSet,
  },
];

function defaultHandler(_req) {
  return new Response("not found", { status: 404 });
}

Deno.serve({
	port: 80,
}, route(routes, defaultHandler));
console.log(await db.login('test', '0'));

// console.log(await decrypt(await encrypt('Hello', nameToIV('test'), await hashToKey(db.profile('test').password)), nameToIV('test'), await hashToKey(db.profile('test').password)))
