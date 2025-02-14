import { route } from "jsr:@std/http/unstable-route";
import { serveDir, serveFile } from "jsr:@std/http/file-server";
import * as db from "./scripts/database.js";
import { handleDefaultLogin, handleLogin } from "./scripts/login.js";
import { handleDataGet, handleDataSet, handleDataInit, handleWho, tokenResponse } from "./scripts/data.js";
import { handleDataAction } from "./scripts/action.js";
import { handleAdmin, handleAdminStats } from "./scripts/admin.js";
import { init } from "./scripts/init.js";
import _c from "./config.json" with {type: "json"};


/**
	* @typedef {Object} config
	* @property {Object} config.defaultAccount
	* @property {String} config.defaultAccount.name
	* @property {String} config.defaultAccount.password
*/

/** @type {config} */
const CONFIG = _c
export {CONFIG}


init()



await db.addUser('test', '0', 1)




/**
	* @type {{pattern: URLPattern, handler: (req: Request, _info: *, params: *) => Response, method: String[]?}[]}
*/
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
		pattern: new URLPattern({ pathname: "/u/:name/habits" }),
		handler: (req, _info, params) => {
			const result = tokenResponse(req, {params, permissions: 1})
			if (result[0]) {
				return result[0]
			}
			return serveFile(req, 'dynamic/habits.html')
		},
	},
	{
		pattern: new URLPattern({ pathname: "/u/:name/editor" }),
		handler: (req, _info, params) => {
			const result = tokenResponse(req, {params, permissions: 1})
			if (result[0]) {
				return result[0]
			}
			return serveFile(req, 'dynamic/editor.html')
		},
	},
	{
		pattern: new URLPattern({ pathname: "/u/:name" }),
		handler: (_req, _info, params) => new Response(null, { status: 308, headers: {"Location": `/u/${params.pathname.groups.name}/habits`}}),
	},
	{
		pattern: new URLPattern({ pathname: "/admin" }),
		handler: handleAdmin,
	},
	{
		pattern: new URLPattern({ pathname: "/api/login" }),
		handler: handleLogin,
		method: ['POST'],
	},
	{
		pattern: new URLPattern({ pathname: "/api/login/default" }),
		handler: handleDefaultLogin,
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
		handler: (req, _info, params) => handleDataInit(req, false, params),
	},
	{
		pattern: new URLPattern({ pathname: "/api/data/:name/init/force" }),
		handler: (req, _info, params) => handleDataInit(req, true, params),
	},
	{
		pattern: new URLPattern({ pathname: "/api/data/:name/action" }),
		handler: handleDataAction,
		method: ['POST'],
	},
	{
		pattern: new URLPattern({ pathname: "/api/who" }),
		handler: handleWho,
	},
	{
		pattern: new URLPattern({ pathname: "/api/admin/stats" }), // TODO: probably delete this particular route and compute stats on client side
		handler: handleAdminStats,
	},
];


/**
	* @param {Request} _req - request from the client, does not change the outcome of the function
	* @returns {Response} defaultResponse - `status: 404, body: not found`
*/
function defaultHandler(_req) {
  return new Response("not found", { status: 404 });
}

Deno.serve({
	port: 8000,
}, (...stuff) => {
	// console.log(stuff)
	return route(routes, defaultHandler)(...stuff)
});
