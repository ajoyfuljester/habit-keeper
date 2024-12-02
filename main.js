import { route } from "jsr:@std/http/unstable-route";
import { serveDir, serveFile } from "jsr:@std/http/file-server";
import * as db from "./scripts/database.js";
import { handleLogin } from "./scripts/login.js";
import { handleDataGet, handleDataSet, handleDataInit, handleDefaultGet, handleDefaultSet, handleDefaultInit, handleWho } from "./scripts/data.js";


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
	pattern: new URLPattern({ pathname: "/profile/:name/habits" }),
	handler: req => serveFile(req, 'dynamic/habits.html'),
  },
  {
	pattern: new URLPattern({ pathname: "/profile/:name" }),
	handler: (_req, _info, params) => new Response(null, { status: 308, headers: {"Location": `/profile/${params.pathname.groups.name}/habits`}}),
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
	pattern: new URLPattern({ pathname: "/api/data/:name/init" }),
	handler: handleDataInit,
  },
  { // possibly deprecated, but it will be convinient, so i might leave it as is
	pattern: new URLPattern({ pathname: "/api/me/get" }),
	handler: handleDefaultGet,
  },
  {
	pattern: new URLPattern({ pathname: "/api/me/set" }),
	handler: handleDefaultSet,
  },
  {
	pattern: new URLPattern({ pathname: "/api/me/init" }),
	handler: handleDefaultInit,
  },
  {
	pattern: new URLPattern({ pathname: "/api/who" }),
	handler: handleWho,
  },
];

function defaultHandler(_req) {
  return new Response("not found", { status: 404 });
}

Deno.serve({
	port: 80,
}, route(routes, defaultHandler));
console.log(await db.login('test', '0'));
