import { route } from "jsr:@std/http/unstable-route";
import { serveDir } from "jsr:@std/http/file-server";
import * as db from "./scripts/database.js";
import { handleLogin } from "./scripts/login.js";
import { handleData } from "./scripts/data.js";


 await db.addProfile('test', '0', 0)

console.log(db.profiles())


const routes = [
  {
    pattern: new URLPattern({ pathname: "/" }),
    handler: _ => new Response(null, { status: 308, headers: {"Location": "/static/login.html"}}),
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
    pattern: new URLPattern({ pathname: "/api/data" }),
    handler: handleData,
  },
];

function defaultHandler(_req) {
  return new Response("Not found", { status: 404 });
}

Deno.serve(route(routes, defaultHandler));
console.log(await db.login('test', '0'));
