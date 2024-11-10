import { route } from "jsr:@std/http/unstable-route";
import { serveDir } from "jsr:@std/http/file-server";
import * as db from "./scripts/database.js";

await db.addProfile('test', '0', 0)

console.log(db.profiles())


const routes = [
  {
    pattern: new URLPattern({ pathname: "/static/*" }),
    handler: (req) => serveDir(req)
  },
];

function defaultHandler(_req) {
  return new Response("Not found", { status: 404 });
}

Deno.serve(route(routes, defaultHandler));
