import { route } from "jsr:@std/http/unstable-route";
import { serveDir } from "jsr:@std/http/file-server";

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
