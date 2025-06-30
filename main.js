import { route } from "jsr:@std/http/unstable-route";
import { serveDir, serveFile } from "jsr:@std/http/file-server";
import * as db from "./scripts/database.js";
import { handleDefaultLogin, handleLogin } from "./scripts/login.js";
import { handleRegister } from './scripts/register.js'
import { handleDataGet, handleDataSet, handleDataInit, handleWho, tokenResponse } from "./scripts/data.js";
import { handleDataAction } from "./scripts/action.js";
import { handleAdmin, handleAdminStats } from "./scripts/admin.js";
import { init } from "./scripts/init.js";
import _c from "./config.json" with {type: "json"};
import { getCookies } from "jsr:@std/http/cookie"


/**
	* @typedef {Object} config config file
	* @property {Object} config.defaultAccount
	* @property {String} config.defaultAccount.name
	* @property {String} config.defaultAccount.password
	*
	* @property {Number} config.port
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
		handler: () => new Response(null, {status: 308, headers: {"Location": "/login"}}),
	},
	{
		pattern: new URLPattern({ pathname: "/login" }),
		handler: req => {

			const token = getCookies(req.headers).token;

			if (!token) {
				return new Response("not found: token", {status: 308, headers: {"Location": "/static/sites/login.html"}})

			}

			const name = db.verifyToken(token)
			if (!name) {
				return new Response("not found: user associated with token", {status: 308, headers: {"Location": "/static/sites/login.html"}})

			}

			return new Response(JSON.stringify({ name }), {status: 308, headers: {"Location": `/u/${name}/habits`, "Content-Type": "application/json"}})
		},
	},
	{
		pattern: new URLPattern({ pathname: "/register" }),
		handler: () => new Response(null, {status: 308, headers: {"Location": "/static/sites/register.html"}}),
	},
	{
		pattern: new URLPattern({ pathname: "/static/*" }),
		handler: req => serveDir(req),
	},
	{
		pattern: new URLPattern({ pathname: "/u/:name/habits" }),
		handler: async (req, _info, params) => {
			const response = await redirectingHandler(req, _info, params, 1)
			if (response !== null) {
				return response
			}
			return serveFile(req, 'dynamic/habits.html')
		},
	},
	{
		pattern: new URLPattern({ pathname: "/u/:name/editor" }),
		handler: async (req, _info, params) => {
			const response = await redirectingHandler(req, _info, params, 1)
			if (response !== null) {
				return response
			}
			return serveFile(req, 'dynamic/editor.html')
		},
	},
	{
		pattern: new URLPattern({ pathname: "/u/:name{/}?" }),
		handler: (_req, _info, params) => new Response(null, {status: 308, headers: {"Location": `/u/${params.pathname.groups.name}/habits`}}),
	},
	{
		pattern: new URLPattern({ pathname: "/me/*" }),
		handler: (req, _info, params) => {
			const token = getCookies(req.headers).token;

			if (!token) {
				return new Response("not found: token", {status: 308, headers: {"Location": "/"}});
			}

			const name = db.verifyToken(token)
			if (!name) {
				return new Response("not found: name for the token", {status: 308, headers: {"Location": "/"}});
			}

			const path = params.pathname.groups[0]

			return new Response(JSON.stringify({ name }), {status: 308, headers: {"Location": `/u/${name}/${path}`, 'Content-Type': 'application/json'}});

		},
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
		pattern: new URLPattern({ pathname: "/api/register" }),
		handler: handleRegister,
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
  return new Response("not found: site", { status: 404 });
}

/**
	* @param {Request} req request from the client
	* @param {*} _info i do not contain the knowledge of this particular parameter
	* @param {*} params i don't know what this is, but it has `pathname.groups` stuff
	* @param {*} permissions needed permission to go to that particular url
	* @returns {Promise<Response | null>} response redirecting to login or null, if the permissions are good
*/
async function redirectingHandler(req, _info, params, permissions) {
	const result = tokenResponse(req, {params, permissions})
	if (result[0]) {
		return new Response(`error response with code ${result[0].status} and body: "${await result[0].text()}"`, {status: 308, headers: {"Location": "/static/sites/login.html"}})
	}
	return null
}

Deno.serve({
	port: CONFIG.port,
}, (...stuff) => {
	// console.log(stuff)
	return route(routes, defaultHandler)(...stuff)
});
