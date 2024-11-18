import { route } from "jsr:@std/http/unstable-route";
import { serveDir } from "jsr:@std/http/file-server";
import { setCookie, getCookies } from "jsr:@std/http/cookie"
import * as db from "./scripts/database.js";
import { handleLogin } from "./scripts/profile.js";


 await db.addProfile('test', '0', 0)

console.log(db.profiles())


const routes = [
  {
    pattern: new URLPattern({ pathname: "/static/*" }),
    handler: (req) => serveDir(req),
  },
  {
    pattern: new URLPattern({ pathname: "/api/login" }),
    handler: handleLogin,
	method: ['POST'],
  },
];

function defaultHandler(_req) {
  return new Response("Not found", { status: 404 });
}

Deno.serve(route(routes, defaultHandler));
console.log(await db.login('test', '0'));
