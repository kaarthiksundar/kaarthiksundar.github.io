/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/mithril/api/mount-redraw.js":
/*!**************************************************!*\
  !*** ./node_modules/mithril/api/mount-redraw.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Vnode = __webpack_require__(/*! ../render/vnode */ "./node_modules/mithril/render/vnode.js")

module.exports = function(render, schedule, console) {
	var subscriptions = []
	var pending = false
	var offset = -1

	function sync() {
		for (offset = 0; offset < subscriptions.length; offset += 2) {
			try { render(subscriptions[offset], Vnode(subscriptions[offset + 1]), redraw) }
			catch (e) { console.error(e) }
		}
		offset = -1
	}

	function redraw() {
		if (!pending) {
			pending = true
			schedule(function() {
				pending = false
				sync()
			})
		}
	}

	redraw.sync = sync

	function mount(root, component) {
		if (component != null && component.view == null && typeof component !== "function") {
			throw new TypeError("m.mount expects a component, not a vnode.")
		}

		var index = subscriptions.indexOf(root)
		if (index >= 0) {
			subscriptions.splice(index, 2)
			if (index <= offset) offset -= 2
			render(root, [])
		}

		if (component != null) {
			subscriptions.push(root, component)
			render(root, Vnode(component), redraw)
		}
	}

	return {mount: mount, redraw: redraw}
}


/***/ }),

/***/ "./node_modules/mithril/api/router.js":
/*!********************************************!*\
  !*** ./node_modules/mithril/api/router.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Vnode = __webpack_require__(/*! ../render/vnode */ "./node_modules/mithril/render/vnode.js")
var m = __webpack_require__(/*! ../render/hyperscript */ "./node_modules/mithril/render/hyperscript.js")
var Promise = __webpack_require__(/*! ../promise/promise */ "./node_modules/mithril/promise/promise.js")

var buildPathname = __webpack_require__(/*! ../pathname/build */ "./node_modules/mithril/pathname/build.js")
var parsePathname = __webpack_require__(/*! ../pathname/parse */ "./node_modules/mithril/pathname/parse.js")
var compileTemplate = __webpack_require__(/*! ../pathname/compileTemplate */ "./node_modules/mithril/pathname/compileTemplate.js")
var assign = __webpack_require__(/*! ../util/assign */ "./node_modules/mithril/util/assign.js")
var censor = __webpack_require__(/*! ../util/censor */ "./node_modules/mithril/util/censor.js")

var sentinel = {}

function decodeURIComponentSave(component) {
	try {
		return decodeURIComponent(component)
	} catch(e) {
		return component
	}
}

module.exports = function($window, mountRedraw) {
	var callAsync = $window == null
		// In case Mithril.js' loaded globally without the DOM, let's not break
		? null
		: typeof $window.setImmediate === "function" ? $window.setImmediate : $window.setTimeout
	var p = Promise.resolve()

	var scheduled = false

	// state === 0: init
	// state === 1: scheduled
	// state === 2: done
	var ready = false
	var state = 0

	var compiled, fallbackRoute

	var currentResolver = sentinel, component, attrs, currentPath, lastUpdate

	var RouterRoot = {
		onbeforeupdate: function() {
			state = state ? 2 : 1
			return !(!state || sentinel === currentResolver)
		},
		onremove: function() {
			$window.removeEventListener("popstate", fireAsync, false)
			$window.removeEventListener("hashchange", resolveRoute, false)
		},
		view: function() {
			if (!state || sentinel === currentResolver) return
			// Wrap in a fragment to preserve existing key semantics
			var vnode = [Vnode(component, attrs.key, attrs)]
			if (currentResolver) vnode = currentResolver.render(vnode[0])
			return vnode
		},
	}

	var SKIP = route.SKIP = {}

	function resolveRoute() {
		scheduled = false
		// Consider the pathname holistically. The prefix might even be invalid,
		// but that's not our problem.
		var prefix = $window.location.hash
		if (route.prefix[0] !== "#") {
			prefix = $window.location.search + prefix
			if (route.prefix[0] !== "?") {
				prefix = $window.location.pathname + prefix
				if (prefix[0] !== "/") prefix = "/" + prefix
			}
		}
		// This seemingly useless `.concat()` speeds up the tests quite a bit,
		// since the representation is consistently a relatively poorly
		// optimized cons string.
		var path = prefix.concat()
			.replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponentSave)
			.slice(route.prefix.length)
		var data = parsePathname(path)

		assign(data.params, $window.history.state)

		function reject(e) {
			console.error(e)
			setPath(fallbackRoute, null, {replace: true})
		}

		loop(0)
		function loop(i) {
			// state === 0: init
			// state === 1: scheduled
			// state === 2: done
			for (; i < compiled.length; i++) {
				if (compiled[i].check(data)) {
					var payload = compiled[i].component
					var matchedRoute = compiled[i].route
					var localComp = payload
					var update = lastUpdate = function(comp) {
						if (update !== lastUpdate) return
						if (comp === SKIP) return loop(i + 1)
						component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div"
						attrs = data.params, currentPath = path, lastUpdate = null
						currentResolver = payload.render ? payload : null
						if (state === 2) mountRedraw.redraw()
						else {
							state = 2
							mountRedraw.redraw.sync()
						}
					}
					// There's no understating how much I *wish* I could
					// use `async`/`await` here...
					if (payload.view || typeof payload === "function") {
						payload = {}
						update(localComp)
					}
					else if (payload.onmatch) {
						p.then(function () {
							return payload.onmatch(data.params, path, matchedRoute)
						}).then(update, path === fallbackRoute ? null : reject)
					}
					else update("div")
					return
				}
			}

			if (path === fallbackRoute) {
				throw new Error("Could not resolve default route " + fallbackRoute + ".")
			}
			setPath(fallbackRoute, null, {replace: true})
		}
	}

	// Set it unconditionally so `m.route.set` and `m.route.Link` both work,
	// even if neither `pushState` nor `hashchange` are supported. It's
	// cleared if `hashchange` is used, since that makes it automatically
	// async.
	function fireAsync() {
		if (!scheduled) {
			scheduled = true
			// TODO: just do `mountRedraw.redraw()` here and elide the timer
			// dependency. Note that this will muck with tests a *lot*, so it's
			// not as easy of a change as it sounds.
			callAsync(resolveRoute)
		}
	}

	function setPath(path, data, options) {
		path = buildPathname(path, data)
		if (ready) {
			fireAsync()
			var state = options ? options.state : null
			var title = options ? options.title : null
			if (options && options.replace) $window.history.replaceState(state, title, route.prefix + path)
			else $window.history.pushState(state, title, route.prefix + path)
		}
		else {
			$window.location.href = route.prefix + path
		}
	}

	function route(root, defaultRoute, routes) {
		if (!root) throw new TypeError("DOM element being rendered to does not exist.")

		compiled = Object.keys(routes).map(function(route) {
			if (route[0] !== "/") throw new SyntaxError("Routes must start with a '/'.")
			if ((/:([^\/\.-]+)(\.{3})?:/).test(route)) {
				throw new SyntaxError("Route parameter names must be separated with either '/', '.', or '-'.")
			}
			return {
				route: route,
				component: routes[route],
				check: compileTemplate(route),
			}
		})
		fallbackRoute = defaultRoute
		if (defaultRoute != null) {
			var defaultData = parsePathname(defaultRoute)

			if (!compiled.some(function (i) { return i.check(defaultData) })) {
				throw new ReferenceError("Default route doesn't match any known routes.")
			}
		}

		if (typeof $window.history.pushState === "function") {
			$window.addEventListener("popstate", fireAsync, false)
		} else if (route.prefix[0] === "#") {
			$window.addEventListener("hashchange", resolveRoute, false)
		}

		ready = true
		mountRedraw.mount(root, RouterRoot)
		resolveRoute()
	}
	route.set = function(path, data, options) {
		if (lastUpdate != null) {
			options = options || {}
			options.replace = true
		}
		lastUpdate = null
		setPath(path, data, options)
	}
	route.get = function() {return currentPath}
	route.prefix = "#!"
	route.Link = {
		view: function(vnode) {
			// Omit the used parameters from the rendered element - they are
			// internal. Also, censor the various lifecycle methods.
			//
			// We don't strip the other parameters because for convenience we
			// let them be specified in the selector as well.
			var child = m(
				vnode.attrs.selector || "a",
				censor(vnode.attrs, ["options", "params", "selector", "onclick"]),
				vnode.children
			)
			var options, onclick, href

			// Let's provide a *right* way to disable a route link, rather than
			// letting people screw up accessibility on accident.
			//
			// The attribute is coerced so users don't get surprised over
			// `disabled: 0` resulting in a button that's somehow routable
			// despite being visibly disabled.
			if (child.attrs.disabled = Boolean(child.attrs.disabled)) {
				child.attrs.href = null
				child.attrs["aria-disabled"] = "true"
				// If you *really* do want add `onclick` on a disabled link, use
				// an `oncreate` hook to add it.
			} else {
				options = vnode.attrs.options
				onclick = vnode.attrs.onclick
				// Easier to build it now to keep it isomorphic.
				href = buildPathname(child.attrs.href, vnode.attrs.params)
				child.attrs.href = route.prefix + href
				child.attrs.onclick = function(e) {
					var result
					if (typeof onclick === "function") {
						result = onclick.call(e.currentTarget, e)
					} else if (onclick == null || typeof onclick !== "object") {
						// do nothing
					} else if (typeof onclick.handleEvent === "function") {
						onclick.handleEvent(e)
					}

					// Adapted from React Router's implementation:
					// https://github.com/ReactTraining/react-router/blob/520a0acd48ae1b066eb0b07d6d4d1790a1d02482/packages/react-router-dom/modules/Link.js
					//
					// Try to be flexible and intuitive in how we handle links.
					// Fun fact: links aren't as obvious to get right as you
					// would expect. There's a lot more valid ways to click a
					// link than this, and one might want to not simply click a
					// link, but right click or command-click it to copy the
					// link target, etc. Nope, this isn't just for blind people.
					if (
						// Skip if `onclick` prevented default
						result !== false && !e.defaultPrevented &&
						// Ignore everything but left clicks
						(e.button === 0 || e.which === 0 || e.which === 1) &&
						// Let the browser handle `target=_blank`, etc.
						(!e.currentTarget.target || e.currentTarget.target === "_self") &&
						// No modifier keys
						!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
					) {
						e.preventDefault()
						e.redraw = false
						route.set(href, null, options)
					}
				}
			}
			return child
		},
	}
	route.param = function(key) {
		return attrs && key != null ? attrs[key] : attrs
	}

	return route
}


/***/ }),

/***/ "./node_modules/mithril/hyperscript.js":
/*!*********************************************!*\
  !*** ./node_modules/mithril/hyperscript.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var hyperscript = __webpack_require__(/*! ./render/hyperscript */ "./node_modules/mithril/render/hyperscript.js")

hyperscript.trust = __webpack_require__(/*! ./render/trust */ "./node_modules/mithril/render/trust.js")
hyperscript.fragment = __webpack_require__(/*! ./render/fragment */ "./node_modules/mithril/render/fragment.js")

module.exports = hyperscript


/***/ }),

/***/ "./node_modules/mithril/index.js":
/*!***************************************!*\
  !*** ./node_modules/mithril/index.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var hyperscript = __webpack_require__(/*! ./hyperscript */ "./node_modules/mithril/hyperscript.js")
var request = __webpack_require__(/*! ./request */ "./node_modules/mithril/request.js")
var mountRedraw = __webpack_require__(/*! ./mount-redraw */ "./node_modules/mithril/mount-redraw.js")

var m = function m() { return hyperscript.apply(this, arguments) }
m.m = hyperscript
m.trust = hyperscript.trust
m.fragment = hyperscript.fragment
m.Fragment = "["
m.mount = mountRedraw.mount
m.route = __webpack_require__(/*! ./route */ "./node_modules/mithril/route.js")
m.render = __webpack_require__(/*! ./render */ "./node_modules/mithril/render.js")
m.redraw = mountRedraw.redraw
m.request = request.request
m.jsonp = request.jsonp
m.parseQueryString = __webpack_require__(/*! ./querystring/parse */ "./node_modules/mithril/querystring/parse.js")
m.buildQueryString = __webpack_require__(/*! ./querystring/build */ "./node_modules/mithril/querystring/build.js")
m.parsePathname = __webpack_require__(/*! ./pathname/parse */ "./node_modules/mithril/pathname/parse.js")
m.buildPathname = __webpack_require__(/*! ./pathname/build */ "./node_modules/mithril/pathname/build.js")
m.vnode = __webpack_require__(/*! ./render/vnode */ "./node_modules/mithril/render/vnode.js")
m.PromisePolyfill = __webpack_require__(/*! ./promise/polyfill */ "./node_modules/mithril/promise/polyfill.js")
m.censor = __webpack_require__(/*! ./util/censor */ "./node_modules/mithril/util/censor.js")

module.exports = m


/***/ }),

/***/ "./node_modules/mithril/mount-redraw.js":
/*!**********************************************!*\
  !*** ./node_modules/mithril/mount-redraw.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var render = __webpack_require__(/*! ./render */ "./node_modules/mithril/render.js")

module.exports = __webpack_require__(/*! ./api/mount-redraw */ "./node_modules/mithril/api/mount-redraw.js")(render, typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : null, typeof console !== "undefined" ? console : null)


/***/ }),

/***/ "./node_modules/mithril/pathname/build.js":
/*!************************************************!*\
  !*** ./node_modules/mithril/pathname/build.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var buildQueryString = __webpack_require__(/*! ../querystring/build */ "./node_modules/mithril/querystring/build.js")
var assign = __webpack_require__(/*! ../util/assign */ "./node_modules/mithril/util/assign.js")

// Returns `path` from `template` + `params`
module.exports = function(template, params) {
	if ((/:([^\/\.-]+)(\.{3})?:/).test(template)) {
		throw new SyntaxError("Template parameter names must be separated by either a '/', '-', or '.'.")
	}
	if (params == null) return template
	var queryIndex = template.indexOf("?")
	var hashIndex = template.indexOf("#")
	var queryEnd = hashIndex < 0 ? template.length : hashIndex
	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	var path = template.slice(0, pathEnd)
	var query = {}

	assign(query, params)

	var resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m, key, variadic) {
		delete query[key]
		// If no such parameter exists, don't interpolate it.
		if (params[key] == null) return m
		// Escape normal parameters, but not variadic ones.
		return variadic ? params[key] : encodeURIComponent(String(params[key]))
	})

	// In case the template substitution adds new query/hash parameters.
	var newQueryIndex = resolved.indexOf("?")
	var newHashIndex = resolved.indexOf("#")
	var newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex
	var newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex
	var result = resolved.slice(0, newPathEnd)

	if (queryIndex >= 0) result += template.slice(queryIndex, queryEnd)
	if (newQueryIndex >= 0) result += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd)
	var querystring = buildQueryString(query)
	if (querystring) result += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring
	if (hashIndex >= 0) result += template.slice(hashIndex)
	if (newHashIndex >= 0) result += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex)
	return result
}


/***/ }),

/***/ "./node_modules/mithril/pathname/compileTemplate.js":
/*!**********************************************************!*\
  !*** ./node_modules/mithril/pathname/compileTemplate.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var parsePathname = __webpack_require__(/*! ./parse */ "./node_modules/mithril/pathname/parse.js")

// Compiles a template into a function that takes a resolved path (without query
// strings) and returns an object containing the template parameters with their
// parsed values. This expects the input of the compiled template to be the
// output of `parsePathname`. Note that it does *not* remove query parameters
// specified in the template.
module.exports = function(template) {
	var templateData = parsePathname(template)
	var templateKeys = Object.keys(templateData.params)
	var keys = []
	var regexp = new RegExp("^" + templateData.path.replace(
		// I escape literal text so people can use things like `:file.:ext` or
		// `:lang-:locale` in routes. This is all merged into one pass so I
		// don't also accidentally escape `-` and make it harder to detect it to
		// ban it from template parameters.
		/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,
		function(m, key, extra) {
			if (key == null) return "\\" + m
			keys.push({k: key, r: extra === "..."})
			if (extra === "...") return "(.*)"
			if (extra === ".") return "([^/]+)\\."
			return "([^/]+)" + (extra || "")
		}
	) + "$")
	return function(data) {
		// First, check the params. Usually, there isn't any, and it's just
		// checking a static set.
		for (var i = 0; i < templateKeys.length; i++) {
			if (templateData.params[templateKeys[i]] !== data.params[templateKeys[i]]) return false
		}
		// If no interpolations exist, let's skip all the ceremony
		if (!keys.length) return regexp.test(data.path)
		var values = regexp.exec(data.path)
		if (values == null) return false
		for (var i = 0; i < keys.length; i++) {
			data.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1])
		}
		return true
	}
}


/***/ }),

/***/ "./node_modules/mithril/pathname/parse.js":
/*!************************************************!*\
  !*** ./node_modules/mithril/pathname/parse.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var parseQueryString = __webpack_require__(/*! ../querystring/parse */ "./node_modules/mithril/querystring/parse.js")

// Returns `{path, params}` from `url`
module.exports = function(url) {
	var queryIndex = url.indexOf("?")
	var hashIndex = url.indexOf("#")
	var queryEnd = hashIndex < 0 ? url.length : hashIndex
	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	var path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/")

	if (!path) path = "/"
	else {
		if (path[0] !== "/") path = "/" + path
		if (path.length > 1 && path[path.length - 1] === "/") path = path.slice(0, -1)
	}
	return {
		path: path,
		params: queryIndex < 0
			? {}
			: parseQueryString(url.slice(queryIndex + 1, queryEnd)),
	}
}


/***/ }),

/***/ "./node_modules/mithril/promise/polyfill.js":
/*!**************************************************!*\
  !*** ./node_modules/mithril/promise/polyfill.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";

/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with 'new'.")
	if (typeof executor !== "function") throw new TypeError("executor must be a function.")

	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false)
	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors}
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			var then
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) throw new TypeError("Promise can't be resolved with itself.")
					executeOnce(then.bind(value))
				}
				else {
					callAsync(function() {
						if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value)
						for (var i = 0; i < list.length; i++) list[i](value)
						resolvers.length = 0, rejectors.length = 0
						instance.state = shouldAbsorb
						instance.retry = function() {execute(value)}
					})
				}
			}
			catch (e) {
				rejectCurrent(e)
			}
		}
	}
	function executeOnce(then) {
		var runs = 0
		function run(fn) {
			return function(value) {
				if (runs++ > 0) return
				fn(value)
			}
		}
		var onerror = run(rejectCurrent)
		try {then(run(resolveCurrent), onerror)} catch (e) {onerror(e)}
	}

	executeOnce(executor)
}
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	var self = this, instance = self._instance
	function handle(callback, list, next, state) {
		list.push(function(value) {
			if (typeof callback !== "function") next(value)
			else try {resolveNext(callback(value))} catch (e) {if (rejectNext) rejectNext(e)}
		})
		if (typeof instance.retry === "function" && state === instance.state) instance.retry()
	}
	var resolveNext, rejectNext
	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject})
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false)
	return promise
}
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection)
}
PromisePolyfill.prototype.finally = function(callback) {
	return this.then(
		function(value) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return value
			})
		},
		function(reason) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return PromisePolyfill.reject(reason);
			})
		}
	)
}
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) return value
	return new PromisePolyfill(function(resolve) {resolve(value)})
}
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill(function(resolve, reject) {reject(value)})
}
PromisePolyfill.all = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		var total = list.length, count = 0, values = []
		if (list.length === 0) resolve([])
		else for (var i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++
					values[i] = value
					if (count === total) resolve(values)
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject)
				}
				else consume(list[i])
			})(i)
		}
	})
}
PromisePolyfill.race = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		for (var i = 0; i < list.length; i++) {
			list[i].then(resolve, reject)
		}
	})
}

module.exports = PromisePolyfill


/***/ }),

/***/ "./node_modules/mithril/promise/promise.js":
/*!*************************************************!*\
  !*** ./node_modules/mithril/promise/promise.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* global window */


var PromisePolyfill = __webpack_require__(/*! ./polyfill */ "./node_modules/mithril/promise/polyfill.js")

if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") {
		window.Promise = PromisePolyfill
	} else if (!window.Promise.prototype.finally) {
		window.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	module.exports = window.Promise
} else if (typeof __webpack_require__.g !== "undefined") {
	if (typeof __webpack_require__.g.Promise === "undefined") {
		__webpack_require__.g.Promise = PromisePolyfill
	} else if (!__webpack_require__.g.Promise.prototype.finally) {
		__webpack_require__.g.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	module.exports = __webpack_require__.g.Promise
} else {
	module.exports = PromisePolyfill
}


/***/ }),

/***/ "./node_modules/mithril/querystring/build.js":
/*!***************************************************!*\
  !*** ./node_modules/mithril/querystring/build.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") return ""

	var args = []
	for (var key in object) {
		destructure(key, object[key])
	}

	return args.join("&")

	function destructure(key, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
	}
}


/***/ }),

/***/ "./node_modules/mithril/querystring/parse.js":
/*!***************************************************!*\
  !*** ./node_modules/mithril/querystring/parse.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


function decodeURIComponentSave(str) {
	try {
		return decodeURIComponent(str)
	} catch(err) {
		return str
	}
}

module.exports = function(string) {
	if (string === "" || string == null) return {}
	if (string.charAt(0) === "?") string = string.slice(1)

	var entries = string.split("&"), counters = {}, data = {}
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=")
		var key = decodeURIComponentSave(entry[0])
		var value = entry.length === 2 ? decodeURIComponentSave(entry[1]) : ""

		if (value === "true") value = true
		else if (value === "false") value = false

		var levels = key.split(/\]\[?|\[/)
		var cursor = data
		if (key.indexOf("[") > -1) levels.pop()
		for (var j = 0; j < levels.length; j++) {
			var level = levels[j], nextLevel = levels[j + 1]
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
			if (level === "") {
				var key = levels.slice(0, j).join()
				if (counters[key] == null) {
					counters[key] = Array.isArray(cursor) ? cursor.length : 0
				}
				level = counters[key]++
			}
			// Disallow direct prototype pollution
			else if (level === "__proto__") break
			if (j === levels.length - 1) cursor[level] = value
			else {
				// Read own properties exclusively to disallow indirect
				// prototype pollution
				var desc = Object.getOwnPropertyDescriptor(cursor, level)
				if (desc != null) desc = desc.value
				if (desc == null) cursor[level] = desc = isNumber ? [] : {}
				cursor = desc
			}
		}
	}
	return data
}


/***/ }),

/***/ "./node_modules/mithril/render.js":
/*!****************************************!*\
  !*** ./node_modules/mithril/render.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(/*! ./render/render */ "./node_modules/mithril/render/render.js")(typeof window !== "undefined" ? window : null)


/***/ }),

/***/ "./node_modules/mithril/render/fragment.js":
/*!*************************************************!*\
  !*** ./node_modules/mithril/render/fragment.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Vnode = __webpack_require__(/*! ../render/vnode */ "./node_modules/mithril/render/vnode.js")
var hyperscriptVnode = __webpack_require__(/*! ./hyperscriptVnode */ "./node_modules/mithril/render/hyperscriptVnode.js")

module.exports = function() {
	var vnode = hyperscriptVnode.apply(0, arguments)

	vnode.tag = "["
	vnode.children = Vnode.normalizeChildren(vnode.children)
	return vnode
}


/***/ }),

/***/ "./node_modules/mithril/render/hyperscript.js":
/*!****************************************************!*\
  !*** ./node_modules/mithril/render/hyperscript.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Vnode = __webpack_require__(/*! ../render/vnode */ "./node_modules/mithril/render/vnode.js")
var hyperscriptVnode = __webpack_require__(/*! ./hyperscriptVnode */ "./node_modules/mithril/render/hyperscriptVnode.js")
var hasOwn = __webpack_require__(/*! ../util/hasOwn */ "./node_modules/mithril/util/hasOwn.js")

var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
var selectorCache = {}

function isEmpty(object) {
	for (var key in object) if (hasOwn.call(object, key)) return false
	return true
}

function compileSelector(selector) {
	var match, tag = "div", classes = [], attrs = {}
	while (match = selectorParser.exec(selector)) {
		var type = match[1], value = match[2]
		if (type === "" && value !== "") tag = value
		else if (type === "#") attrs.id = value
		else if (type === ".") classes.push(value)
		else if (match[3][0] === "[") {
			var attrValue = match[6]
			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
			if (match[4] === "class") classes.push(attrValue)
			else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true
		}
	}
	if (classes.length > 0) attrs.className = classes.join(" ")
	return selectorCache[selector] = {tag: tag, attrs: attrs}
}

function execSelector(state, vnode) {
	var attrs = vnode.attrs
	var hasClass = hasOwn.call(attrs, "class")
	var className = hasClass ? attrs.class : attrs.className

	vnode.tag = state.tag
	vnode.attrs = {}

	if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
		var newAttrs = {}

		for (var key in attrs) {
			if (hasOwn.call(attrs, key)) newAttrs[key] = attrs[key]
		}

		attrs = newAttrs
	}

	for (var key in state.attrs) {
		if (hasOwn.call(state.attrs, key) && key !== "className" && !hasOwn.call(attrs, key)){
			attrs[key] = state.attrs[key]
		}
	}
	if (className != null || state.attrs.className != null) attrs.className =
		className != null
			? state.attrs.className != null
				? String(state.attrs.className) + " " + String(className)
				: className
			: state.attrs.className != null
				? state.attrs.className
				: null

	if (hasClass) attrs.class = null

	for (var key in attrs) {
		if (hasOwn.call(attrs, key) && key !== "key") {
			vnode.attrs = attrs
			break
		}
	}

	return vnode
}

function hyperscript(selector) {
	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}

	var vnode = hyperscriptVnode.apply(1, arguments)

	if (typeof selector === "string") {
		vnode.children = Vnode.normalizeChildren(vnode.children)
		if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode)
	}

	vnode.tag = selector
	return vnode
}

module.exports = hyperscript


/***/ }),

/***/ "./node_modules/mithril/render/hyperscriptVnode.js":
/*!*********************************************************!*\
  !*** ./node_modules/mithril/render/hyperscriptVnode.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Vnode = __webpack_require__(/*! ../render/vnode */ "./node_modules/mithril/render/vnode.js")

// Call via `hyperscriptVnode.apply(startOffset, arguments)`
//
// The reason I do it this way, forwarding the arguments and passing the start
// offset in `this`, is so I don't have to create a temporary array in a
// performance-critical path.
//
// In native ES6, I'd instead add a final `...args` parameter to the
// `hyperscript` and `fragment` factories and define this as
// `hyperscriptVnode(...args)`, since modern engines do optimize that away. But
// ES5 (what Mithril.js requires thanks to IE support) doesn't give me that luxury,
// and engines aren't nearly intelligent enough to do either of these:
//
// 1. Elide the allocation for `[].slice.call(arguments, 1)` when it's passed to
//    another function only to be indexed.
// 2. Elide an `arguments` allocation when it's passed to any function other
//    than `Function.prototype.apply` or `Reflect.apply`.
//
// In ES6, it'd probably look closer to this (I'd need to profile it, though):
// module.exports = function(attrs, ...children) {
//     if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
//         if (children.length === 1 && Array.isArray(children[0])) children = children[0]
//     } else {
//         children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children]
//         attrs = undefined
//     }
//
//     if (attrs == null) attrs = {}
//     return Vnode("", attrs.key, attrs, children)
// }
module.exports = function() {
	var attrs = arguments[this], start = this + 1, children

	if (attrs == null) {
		attrs = {}
	} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
		attrs = {}
		start = this
	}

	if (arguments.length === start + 1) {
		children = arguments[start]
		if (!Array.isArray(children)) children = [children]
	} else {
		children = []
		while (start < arguments.length) children.push(arguments[start++])
	}

	return Vnode("", attrs.key, attrs, children)
}


/***/ }),

/***/ "./node_modules/mithril/render/render.js":
/*!***********************************************!*\
  !*** ./node_modules/mithril/render/render.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Vnode = __webpack_require__(/*! ../render/vnode */ "./node_modules/mithril/render/vnode.js")

module.exports = function($window) {
	var $doc = $window && $window.document
	var currentRedraw

	var nameSpace = {
		svg: "http://www.w3.org/2000/svg",
		math: "http://www.w3.org/1998/Math/MathML"
	}

	function getNameSpace(vnode) {
		return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
	}

	//sanity check to discourage people from doing `vnode.state = ...`
	function checkState(vnode, original) {
		if (vnode.state !== original) throw new Error("'vnode.state' must not be modified.")
	}

	//Note: the hook is passed as the `this` argument to allow proxying the
	//arguments without requiring a full array allocation to do so. It also
	//takes advantage of the fact the current `vnode` is the first argument in
	//all lifecycle methods.
	function callHook(vnode) {
		var original = vnode.state
		try {
			return this.apply(original, arguments)
		} finally {
			checkState(vnode, original)
		}
	}

	// IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
	// inside an iframe. Catch and swallow this error, and heavy-handidly return null.
	function activeElement() {
		try {
			return $doc.activeElement
		} catch (e) {
			return null
		}
	}
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				createNode(parent, vnode, hooks, ns, nextSibling)
			}
		}
	}
	function createNode(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		if (typeof tag === "string") {
			vnode.state = {}
			if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
			switch (tag) {
				case "#": createText(parent, vnode, nextSibling); break
				case "<": createHTML(parent, vnode, ns, nextSibling); break
				case "[": createFragment(parent, vnode, hooks, ns, nextSibling); break
				default: createElement(parent, vnode, hooks, ns, nextSibling)
			}
		}
		else createComponent(parent, vnode, hooks, ns, nextSibling)
	}
	function createText(parent, vnode, nextSibling) {
		vnode.dom = $doc.createTextNode(vnode.children)
		insertNode(parent, vnode.dom, nextSibling)
	}
	var possibleParents = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}
	function createHTML(parent, vnode, ns, nextSibling) {
		var match = vnode.children.match(/^\s*?<(\w+)/im) || []
		// not using the proper parent makes the child element(s) vanish.
		//     var div = document.createElement("div")
		//     div.innerHTML = "<td>i</td><td>j</td>"
		//     console.log(div.innerHTML)
		// --> "ij", no <td> in sight.
		var temp = $doc.createElement(possibleParents[match[1]] || "div")
		if (ns === "http://www.w3.org/2000/svg") {
			temp.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + vnode.children + "</svg>"
			temp = temp.firstChild
		} else {
			temp.innerHTML = vnode.children
		}
		vnode.dom = temp.firstChild
		vnode.domSize = temp.childNodes.length
		// Capture nodes to remove, so we don't confuse them.
		vnode.instance = []
		var fragment = $doc.createDocumentFragment()
		var child
		while (child = temp.firstChild) {
			vnode.instance.push(child)
			fragment.appendChild(child)
		}
		insertNode(parent, fragment, nextSibling)
	}
	function createFragment(parent, vnode, hooks, ns, nextSibling) {
		var fragment = $doc.createDocumentFragment()
		if (vnode.children != null) {
			var children = vnode.children
			createNodes(fragment, children, 0, children.length, hooks, null, ns)
		}
		vnode.dom = fragment.firstChild
		vnode.domSize = fragment.childNodes.length
		insertNode(parent, fragment, nextSibling)
	}
	function createElement(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		var attrs = vnode.attrs
		var is = attrs && attrs.is

		ns = getNameSpace(vnode) || ns

		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag)
		vnode.dom = element

		if (attrs != null) {
			setAttrs(vnode, attrs, ns)
		}

		insertNode(parent, element, nextSibling)

		if (!maybeSetContentEditable(vnode)) {
			if (vnode.children != null) {
				var children = vnode.children
				createNodes(element, children, 0, children.length, hooks, null, ns)
				if (vnode.tag === "select" && attrs != null) setLateSelectAttrs(vnode, attrs)
			}
		}
	}
	function initComponent(vnode, hooks) {
		var sentinel
		if (typeof vnode.tag.view === "function") {
			vnode.state = Object.create(vnode.tag)
			sentinel = vnode.state.view
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
		} else {
			vnode.state = void 0
			sentinel = vnode.tag
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
			vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode)
		}
		initLifecycle(vnode.state, vnode, hooks)
		if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
		vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		sentinel.$$reentrantLock$$ = null
	}
	function createComponent(parent, vnode, hooks, ns, nextSibling) {
		initComponent(vnode, hooks)
		if (vnode.instance != null) {
			createNode(parent, vnode.instance, hooks, ns, nextSibling)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0
		}
		else {
			vnode.domSize = 0
		}
	}

	//update
	/**
	 * @param {Element|Fragment} parent - the parent element
	 * @param {Vnode[] | null} old - the list of vnodes of the last `render()` call for
	 *                               this part of the tree
	 * @param {Vnode[] | null} vnodes - as above, but for the current `render()` call.
	 * @param {Function[]} hooks - an accumulator of post-render hooks (oncreate/onupdate)
	 * @param {Element | null} nextSibling - the next DOM node if we're dealing with a
	 *                                       fragment that is not the last item in its
	 *                                       parent
	 * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
	 * @returns void
	 */
	// This function diffs and patches lists of vnodes, both keyed and unkeyed.
	//
	// We will:
	//
	// 1. describe its general structure
	// 2. focus on the diff algorithm optimizations
	// 3. discuss DOM node operations.

	// ## Overview:
	//
	// The updateNodes() function:
	// - deals with trivial cases
	// - determines whether the lists are keyed or unkeyed based on the first non-null node
	//   of each list.
	// - diffs them and patches the DOM if needed (that's the brunt of the code)
	// - manages the leftovers: after diffing, are there:
	//   - old nodes left to remove?
	// 	 - new nodes to insert?
	// 	 deal with them!
	//
	// The lists are only iterated over once, with an exception for the nodes in `old` that
	// are visited in the fourth part of the diff and in the `removeNodes` loop.

	// ## Diffing
	//
	// Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
	// may be good for context on longest increasing subsequence-based logic for moving nodes.
	//
	// In order to diff keyed lists, one has to
	//
	// 1) match nodes in both lists, per key, and update them accordingly
	// 2) create the nodes present in the new list, but absent in the old one
	// 3) remove the nodes present in the old list, but absent in the new one
	// 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
	//
	// To achieve 1) one can create a dictionary of keys => index (for the old list), then iterate
	// over the new list and for each new vnode, find the corresponding vnode in the old list using
	// the map.
	// 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
	// and must be created.
	// For the removals, we actually remove the nodes that have been updated from the old list.
	// The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
	// The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
	// algorithm.
	//
	// the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
	// from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
	// corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
	//  match the above lists, for example).
	//
	// In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
	// can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
	//
	// @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
	// the longest increasing subsequence *of old nodes still present in the new list*).
	//
	// It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
	// and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
	// the `LIS` and a temporary one to create the LIS).
	//
	// So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
	// the LIS and can be updated without moving them.
	//
	// If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
	// the exception of the last node if the list is fully reversed).
	//
	// ## Finding the next sibling.
	//
	// `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
	// When the list is being traversed top-down, at any index, the DOM nodes up to the previous
	// vnode reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
	// list. The next sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
	//
	// In the other scenarios (swaps, upwards traversal, map-based diff),
	// the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
	// bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
	// as the next sibling (cached in the `nextSibling` variable).


	// ## DOM node moves
	//
	// In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
	// this is not the case if the node moved (second and fourth part of the diff algo). We move
	// the old DOM nodes before updateNode runs because it enables us to use the cached `nextSibling`
	// variable rather than fetching it using `getNextSibling()`.
	//
	// The fourth part of the diff currently inserts nodes unconditionally, leading to issues
	// like #1791 and #1999. We need to be smarter about those situations where adjascent old
	// nodes remain together in the new list in a way that isn't covered by parts one and
	// three of the diff algo.

	function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) return
		else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns)
		else if (vnodes == null || vnodes.length === 0) removeNodes(parent, old, 0, old.length)
		else {
			var isOldKeyed = old[0] != null && old[0].key != null
			var isKeyed = vnodes[0] != null && vnodes[0].key != null
			var start = 0, oldStart = 0
			if (!isOldKeyed) while (oldStart < old.length && old[oldStart] == null) oldStart++
			if (!isKeyed) while (start < vnodes.length && vnodes[start] == null) start++
			if (isOldKeyed !== isKeyed) {
				removeNodes(parent, old, oldStart, old.length)
				createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else if (!isKeyed) {
				// Don't index past the end of either list (causes deopts).
				var commonLength = old.length < vnodes.length ? old.length : vnodes.length
				// Rewind if necessary to the first non-null index on either side.
				// We could alternatively either explicitly create or remove nodes when `start !== oldStart`
				// but that would be optimizing for sparse lists which are more rare than dense ones.
				start = start < oldStart ? start : oldStart
				for (; start < commonLength; start++) {
					o = old[start]
					v = vnodes[start]
					if (o === v || o == null && v == null) continue
					else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling))
					else if (v == null) removeNode(parent, o)
					else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns)
				}
				if (old.length > commonLength) removeNodes(parent, old, start, old.length)
				if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else {
				// keyed diff
				var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling

				// bottom-up
				while (oldEnd >= oldStart && end >= start) {
					oe = old[oldEnd]
					ve = vnodes[end]
					if (oe.key !== ve.key) break
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldEnd--, end--
				}
				// top-down
				while (oldEnd >= oldStart && end >= start) {
					o = old[oldStart]
					v = vnodes[start]
					if (o.key !== v.key) break
					oldStart++, start++
					if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns)
				}
				// swaps and list reversals
				while (oldEnd >= oldStart && end >= start) {
					if (start === end) break
					if (o.key !== ve.key || oe.key !== v.key) break
					topSibling = getNextSibling(old, oldStart, nextSibling)
					moveNodes(parent, oe, topSibling)
					if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns)
					if (++start <= --end) moveNodes(parent, o, nextSibling)
					if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldStart++; oldEnd--
					oe = old[oldEnd]
					ve = vnodes[end]
					o = old[oldStart]
					v = vnodes[start]
				}
				// bottom up once again
				while (oldEnd >= oldStart && end >= start) {
					if (oe.key !== ve.key) break
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldEnd--, end--
					oe = old[oldEnd]
					ve = vnodes[end]
				}
				if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1)
				else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
				else {
					// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
					var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices
					for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1
					for (i = end; i >= start; i--) {
						if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1)
						ve = vnodes[i]
						var oldIndex = map[ve.key]
						if (oldIndex != null) {
							pos = (oldIndex < pos) ? oldIndex : -1 // becomes -1 if nodes were re-ordered
							oldIndices[i-start] = oldIndex
							oe = old[oldIndex]
							old[oldIndex] = null
							if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
							if (ve.dom != null) nextSibling = ve.dom
							matched++
						}
					}
					nextSibling = originalNextSibling
					if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1)
					if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
					else {
						if (pos === -1) {
							// the indices of the indices of the items that are part of the
							// longest increasing subsequence in the oldIndices list
							lisIndices = makeLisIndices(oldIndices)
							li = lisIndices.length - 1
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								else {
									if (lisIndices[li] === i - start) li--
									else moveNodes(parent, v, nextSibling)
								}
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						} else {
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						}
					}
				}
			}
		}
	}
	function updateNode(parent, old, vnode, hooks, nextSibling, ns) {
		var oldTag = old.tag, tag = vnode.tag
		if (oldTag === tag) {
			vnode.state = old.state
			vnode.events = old.events
			if (shouldNotUpdate(vnode, old)) return
			if (typeof oldTag === "string") {
				if (vnode.attrs != null) {
					updateLifecycle(vnode.attrs, vnode, hooks)
				}
				switch (oldTag) {
					case "#": updateText(old, vnode); break
					case "<": updateHTML(parent, old, vnode, ns, nextSibling); break
					case "[": updateFragment(parent, old, vnode, hooks, nextSibling, ns); break
					default: updateElement(old, vnode, hooks, ns)
				}
			}
			else updateComponent(parent, old, vnode, hooks, nextSibling, ns)
		}
		else {
			removeNode(parent, old)
			createNode(parent, vnode, hooks, ns, nextSibling)
		}
	}
	function updateText(old, vnode) {
		if (old.children.toString() !== vnode.children.toString()) {
			old.dom.nodeValue = vnode.children
		}
		vnode.dom = old.dom
	}
	function updateHTML(parent, old, vnode, ns, nextSibling) {
		if (old.children !== vnode.children) {
			removeHTML(parent, old)
			createHTML(parent, vnode, ns, nextSibling)
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
			vnode.instance = old.instance
		}
	}
	function updateFragment(parent, old, vnode, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns)
		var domSize = 0, children = vnode.children
		vnode.dom = null
		if (children != null) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i]
				if (child != null && child.dom != null) {
					if (vnode.dom == null) vnode.dom = child.dom
					domSize += child.domSize || 1
				}
			}
			if (domSize !== 1) vnode.domSize = domSize
		}
	}
	function updateElement(old, vnode, hooks, ns) {
		var element = vnode.dom = old.dom
		ns = getNameSpace(vnode) || ns

		if (vnode.tag === "textarea") {
			if (vnode.attrs == null) vnode.attrs = {}
		}
		updateAttrs(vnode, old.attrs, vnode.attrs, ns)
		if (!maybeSetContentEditable(vnode)) {
			updateNodes(element, old.children, vnode.children, hooks, null, ns)
		}
	}
	function updateComponent(parent, old, vnode, hooks, nextSibling, ns) {
		vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		updateLifecycle(vnode.state, vnode, hooks)
		if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
		if (vnode.instance != null) {
			if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling)
			else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, ns)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.instance.domSize
		}
		else if (old.instance != null) {
			removeNode(parent, old.instance)
			vnode.dom = undefined
			vnode.domSize = 0
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
		}
	}
	function getKeyMap(vnodes, start, end) {
		var map = Object.create(null)
		for (; start < end; start++) {
			var vnode = vnodes[start]
			if (vnode != null) {
				var key = vnode.key
				if (key != null) map[key] = start
			}
		}
		return map
	}
	// Lifted from ivi https://github.com/ivijs/ivi/
	// takes a list of unique numbers (-1 is special and can
	// occur multiple times) and returns an array with the indices
	// of the items that are part of the longest increasing
	// subsequence
	var lisTemp = []
	function makeLisIndices(a) {
		var result = [0]
		var u = 0, v = 0, i = 0
		var il = lisTemp.length = a.length
		for (var i = 0; i < il; i++) lisTemp[i] = a[i]
		for (var i = 0; i < il; ++i) {
			if (a[i] === -1) continue
			var j = result[result.length - 1]
			if (a[j] < a[i]) {
				lisTemp[i] = j
				result.push(i)
				continue
			}
			u = 0
			v = result.length - 1
			while (u < v) {
				// Fast integer average without overflow.
				// eslint-disable-next-line no-bitwise
				var c = (u >>> 1) + (v >>> 1) + (u & v & 1)
				if (a[result[c]] < a[i]) {
					u = c + 1
				}
				else {
					v = c
				}
			}
			if (a[i] < a[result[u]]) {
				if (u > 0) lisTemp[i] = result[u - 1]
				result[u] = i
			}
		}
		u = result.length
		v = result[u - 1]
		while (u-- > 0) {
			result[u] = v
			v = lisTemp[v]
		}
		lisTemp.length = 0
		return result
	}

	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
		}
		return nextSibling
	}

	// This covers a really specific edge case:
	// - Parent node is keyed and contains child
	// - Child is removed, returns unresolved promise in `onbeforeremove`
	// - Parent node is moved in keyed diff
	// - Remaining children still need moved appropriately
	//
	// Ideally, I'd track removed nodes as well, but that introduces a lot more
	// complexity and I'm not exactly interested in doing that.
	function moveNodes(parent, vnode, nextSibling) {
		var frag = $doc.createDocumentFragment()
		moveChildToFrag(parent, frag, vnode)
		insertNode(parent, frag, nextSibling)
	}
	function moveChildToFrag(parent, frag, vnode) {
		// Dodge the recursion overhead in a few of the most common cases.
		while (vnode.dom != null && vnode.dom.parentNode === parent) {
			if (typeof vnode.tag !== "string") {
				vnode = vnode.instance
				if (vnode != null) continue
			} else if (vnode.tag === "<") {
				for (var i = 0; i < vnode.instance.length; i++) {
					frag.appendChild(vnode.instance[i])
				}
			} else if (vnode.tag !== "[") {
				// Don't recurse for text nodes *or* elements, just fragments
				frag.appendChild(vnode.dom)
			} else if (vnode.children.length === 1) {
				vnode = vnode.children[0]
				if (vnode != null) continue
			} else {
				for (var i = 0; i < vnode.children.length; i++) {
					var child = vnode.children[i]
					if (child != null) moveChildToFrag(parent, frag, child)
				}
			}
			break
		}
	}

	function insertNode(parent, dom, nextSibling) {
		if (nextSibling != null) parent.insertBefore(dom, nextSibling)
		else parent.appendChild(dom)
	}

	function maybeSetContentEditable(vnode) {
		if (vnode.attrs == null || (
			vnode.attrs.contenteditable == null && // attribute
			vnode.attrs.contentEditable == null // property
		)) return false
		var children = vnode.children
		if (children != null && children.length === 1 && children[0].tag === "<") {
			var content = children[0].children
			if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content
		}
		else if (children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted.")
		return true
	}

	//remove
	function removeNodes(parent, vnodes, start, end) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) removeNode(parent, vnode)
		}
	}
	function removeNode(parent, vnode) {
		var mask = 0
		var original = vnode.state
		var stateResult, attrsResult
		if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeremove === "function") {
			var result = callHook.call(vnode.state.onbeforeremove, vnode)
			if (result != null && typeof result.then === "function") {
				mask = 1
				stateResult = result
			}
		}
		if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
			var result = callHook.call(vnode.attrs.onbeforeremove, vnode)
			if (result != null && typeof result.then === "function") {
				// eslint-disable-next-line no-bitwise
				mask |= 2
				attrsResult = result
			}
		}
		checkState(vnode, original)

		// If we can, try to fast-path it and avoid all the overhead of awaiting
		if (!mask) {
			onremove(vnode)
			removeChild(parent, vnode)
		} else {
			if (stateResult != null) {
				var next = function () {
					// eslint-disable-next-line no-bitwise
					if (mask & 1) { mask &= 2; if (!mask) reallyRemove() }
				}
				stateResult.then(next, next)
			}
			if (attrsResult != null) {
				var next = function () {
					// eslint-disable-next-line no-bitwise
					if (mask & 2) { mask &= 1; if (!mask) reallyRemove() }
				}
				attrsResult.then(next, next)
			}
		}

		function reallyRemove() {
			checkState(vnode, original)
			onremove(vnode)
			removeChild(parent, vnode)
		}
	}
	function removeHTML(parent, vnode) {
		for (var i = 0; i < vnode.instance.length; i++) {
			parent.removeChild(vnode.instance[i])
		}
	}
	function removeChild(parent, vnode) {
		// Dodge the recursion overhead in a few of the most common cases.
		while (vnode.dom != null && vnode.dom.parentNode === parent) {
			if (typeof vnode.tag !== "string") {
				vnode = vnode.instance
				if (vnode != null) continue
			} else if (vnode.tag === "<") {
				removeHTML(parent, vnode)
			} else {
				if (vnode.tag !== "[") {
					parent.removeChild(vnode.dom)
					if (!Array.isArray(vnode.children)) break
				}
				if (vnode.children.length === 1) {
					vnode = vnode.children[0]
					if (vnode != null) continue
				} else {
					for (var i = 0; i < vnode.children.length; i++) {
						var child = vnode.children[i]
						if (child != null) removeChild(parent, child)
					}
				}
			}
			break
		}
	}
	function onremove(vnode) {
		if (typeof vnode.tag !== "string" && typeof vnode.state.onremove === "function") callHook.call(vnode.state.onremove, vnode)
		if (vnode.attrs && typeof vnode.attrs.onremove === "function") callHook.call(vnode.attrs.onremove, vnode)
		if (typeof vnode.tag !== "string") {
			if (vnode.instance != null) onremove(vnode.instance)
		} else {
			var children = vnode.children
			if (Array.isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i]
					if (child != null) onremove(child)
				}
			}
		}
	}

	//attrs
	function setAttrs(vnode, attrs, ns) {
		// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
		//
		// Also, the DOM does things to inputs based on the value, so it needs set first.
		// See: https://github.com/MithrilJS/mithril.js/issues/2622
		if (vnode.tag === "input" && attrs.type != null) vnode.dom.setAttribute("type", attrs.type)
		var isFileInput = attrs != null && vnode.tag === "input" && attrs.type === "file"
		for (var key in attrs) {
			setAttr(vnode, key, null, attrs[key], ns, isFileInput)
		}
	}
	function setAttr(vnode, key, old, value, ns, isFileInput) {
		if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode, key)) && typeof value !== "object" || key === "type" && vnode.tag === "input") return
		if (key[0] === "o" && key[1] === "n") return updateEvent(vnode, key, value)
		if (key.slice(0, 6) === "xlink:") vnode.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value)
		else if (key === "style") updateStyle(vnode.dom, old, value)
		else if (hasPropertyKey(vnode, key, ns)) {
			if (key === "value") {
				// Only do the coercion if we're actually going to check the value.
				/* eslint-disable no-implicit-coercion */
				//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
				//setting input[type=file][value] to same value causes an error to be generated if it's non-empty
				if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === "" + value && (isFileInput || vnode.dom === activeElement())) return
				//setting select[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "select" && old !== null && vnode.dom.value === "" + value) return
				//setting option[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "option" && old !== null && vnode.dom.value === "" + value) return
				//setting input[type=file][value] to different value is an error if it's non-empty
				// Not ideal, but it at least works around the most common source of uncaught exceptions for now.
				if (isFileInput && "" + value !== "") { console.error("`value` is read-only on file inputs!"); return }
				/* eslint-enable no-implicit-coercion */
			}
			vnode.dom[key] = value
		} else {
			if (typeof value === "boolean") {
				if (value) vnode.dom.setAttribute(key, "")
				else vnode.dom.removeAttribute(key)
			}
			else vnode.dom.setAttribute(key === "className" ? "class" : key, value)
		}
	}
	function removeAttr(vnode, key, old, ns) {
		if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return
		if (key[0] === "o" && key[1] === "n") updateEvent(vnode, key, undefined)
		else if (key === "style") updateStyle(vnode.dom, old, null)
		else if (
			hasPropertyKey(vnode, key, ns)
			&& key !== "className"
			&& key !== "title" // creates "null" as title
			&& !(key === "value" && (
				vnode.tag === "option"
				|| vnode.tag === "select" && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement()
			))
			&& !(vnode.tag === "input" && key === "type")
		) {
			vnode.dom[key] = null
		} else {
			var nsLastIndex = key.indexOf(":")
			if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1)
			if (old !== false) vnode.dom.removeAttribute(key === "className" ? "class" : key)
		}
	}
	function setLateSelectAttrs(vnode, attrs) {
		if ("value" in attrs) {
			if(attrs.value === null) {
				if (vnode.dom.selectedIndex !== -1) vnode.dom.value = null
			} else {
				var normalized = "" + attrs.value // eslint-disable-line no-implicit-coercion
				if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
					vnode.dom.value = normalized
				}
			}
		}
		if ("selectedIndex" in attrs) setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, undefined)
	}
	function updateAttrs(vnode, old, attrs, ns) {
		if (old && old === attrs) {
			console.warn("Don't reuse attrs object, use new object for every redraw, this will throw in next major")
		}
		if (attrs != null) {
			// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
			//
			// Also, the DOM does things to inputs based on the value, so it needs set first.
			// See: https://github.com/MithrilJS/mithril.js/issues/2622
			if (vnode.tag === "input" && attrs.type != null) vnode.dom.setAttribute("type", attrs.type)
			var isFileInput = vnode.tag === "input" && attrs.type === "file"
			for (var key in attrs) {
				setAttr(vnode, key, old && old[key], attrs[key], ns, isFileInput)
			}
		}
		var val
		if (old != null) {
			for (var key in old) {
				if (((val = old[key]) != null) && (attrs == null || attrs[key] == null)) {
					removeAttr(vnode, key, val, ns)
				}
			}
		}
	}
	function isFormAttribute(vnode, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === activeElement() || vnode.tag === "option" && vnode.dom.parentNode === $doc.activeElement
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
	}
	function hasPropertyKey(vnode, key, ns) {
		// Filter out namespaced keys
		return ns === undefined && (
			// If it's a custom element, just keep it.
			vnode.tag.indexOf("-") > -1 || vnode.attrs != null && vnode.attrs.is ||
			// If it's a normal element, let's try to avoid a few browser bugs.
			key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height"// && key !== "type"
			// Defer the property check until *after* we check everything.
		) && key in vnode.dom
	}

	//style
	var uppercaseRegex = /[A-Z]/g
	function toLowerCase(capital) { return "-" + capital.toLowerCase() }
	function normalizeKey(key) {
		return key[0] === "-" && key[1] === "-" ? key :
			key === "cssFloat" ? "float" :
				key.replace(uppercaseRegex, toLowerCase)
	}
	function updateStyle(element, old, style) {
		if (old === style) {
			// Styles are equivalent, do nothing.
		} else if (style == null) {
			// New style is missing, just clear it.
			element.style.cssText = ""
		} else if (typeof style !== "object") {
			// New style is a string, let engine deal with patching.
			element.style.cssText = style
		} else if (old == null || typeof old !== "object") {
			// `old` is missing or a string, `style` is an object.
			element.style.cssText = ""
			// Add new style properties
			for (var key in style) {
				var value = style[key]
				if (value != null) element.style.setProperty(normalizeKey(key), String(value))
			}
		} else {
			// Both old & new are (different) objects.
			// Update style properties that have changed
			for (var key in style) {
				var value = style[key]
				if (value != null && (value = String(value)) !== String(old[key])) {
					element.style.setProperty(normalizeKey(key), value)
				}
			}
			// Remove style properties that no longer exist
			for (var key in old) {
				if (old[key] != null && style[key] == null) {
					element.style.removeProperty(normalizeKey(key))
				}
			}
		}
	}

	// Here's an explanation of how this works:
	// 1. The event names are always (by design) prefixed by `on`.
	// 2. The EventListener interface accepts either a function or an object
	//    with a `handleEvent` method.
	// 3. The object does not inherit from `Object.prototype`, to avoid
	//    any potential interference with that (e.g. setters).
	// 4. The event name is remapped to the handler before calling it.
	// 5. In function-based event handlers, `ev.target === this`. We replicate
	//    that below.
	// 6. In function-based event handlers, `return false` prevents the default
	//    action and stops event propagation. We replicate that below.
	function EventDict() {
		// Save this, so the current redraw is correctly tracked.
		this._ = currentRedraw
	}
	EventDict.prototype = Object.create(null)
	EventDict.prototype.handleEvent = function (ev) {
		var handler = this["on" + ev.type]
		var result
		if (typeof handler === "function") result = handler.call(ev.currentTarget, ev)
		else if (typeof handler.handleEvent === "function") handler.handleEvent(ev)
		if (this._ && ev.redraw !== false) (0, this._)()
		if (result === false) {
			ev.preventDefault()
			ev.stopPropagation()
		}
	}

	//event
	function updateEvent(vnode, key, value) {
		if (vnode.events != null) {
			vnode.events._ = currentRedraw
			if (vnode.events[key] === value) return
			if (value != null && (typeof value === "function" || typeof value === "object")) {
				if (vnode.events[key] == null) vnode.dom.addEventListener(key.slice(2), vnode.events, false)
				vnode.events[key] = value
			} else {
				if (vnode.events[key] != null) vnode.dom.removeEventListener(key.slice(2), vnode.events, false)
				vnode.events[key] = undefined
			}
		} else if (value != null && (typeof value === "function" || typeof value === "object")) {
			vnode.events = new EventDict()
			vnode.dom.addEventListener(key.slice(2), vnode.events, false)
			vnode.events[key] = value
		}
	}

	//lifecycle
	function initLifecycle(source, vnode, hooks) {
		if (typeof source.oninit === "function") callHook.call(source.oninit, vnode)
		if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode))
	}
	function updateLifecycle(source, vnode, hooks) {
		if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode))
	}
	function shouldNotUpdate(vnode, old) {
		do {
			if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") {
				var force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old)
				if (force !== undefined && !force) break
			}
			if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeupdate === "function") {
				var force = callHook.call(vnode.state.onbeforeupdate, vnode, old)
				if (force !== undefined && !force) break
			}
			return false
		} while (false); // eslint-disable-line no-constant-condition
		vnode.dom = old.dom
		vnode.domSize = old.domSize
		vnode.instance = old.instance
		// One would think having the actual latest attributes would be ideal,
		// but it doesn't let us properly diff based on our current internal
		// representation. We have to save not only the old DOM info, but also
		// the attributes used to create it, as we diff *that*, not against the
		// DOM directly (with a few exceptions in `setAttr`). And, of course, we
		// need to save the children and text as they are conceptually not
		// unlike special "attributes" internally.
		vnode.attrs = old.attrs
		vnode.children = old.children
		vnode.text = old.text
		return true
	}

	var currentDOM

	return function(dom, vnodes, redraw) {
		if (!dom) throw new TypeError("DOM element being rendered to does not exist.")
		if (currentDOM != null && dom.contains(currentDOM)) {
			throw new TypeError("Node is currently being rendered to and thus is locked.")
		}
		var prevRedraw = currentRedraw
		var prevDOM = currentDOM
		var hooks = []
		var active = activeElement()
		var namespace = dom.namespaceURI

		currentDOM = dom
		currentRedraw = typeof redraw === "function" ? redraw : undefined
		try {
			// First time rendering into a node clears it out
			if (dom.vnodes == null) dom.textContent = ""
			vnodes = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes])
			updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace)
			dom.vnodes = vnodes
			// `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
			if (active != null && activeElement() !== active && typeof active.focus === "function") active.focus()
			for (var i = 0; i < hooks.length; i++) hooks[i]()
		} finally {
			currentRedraw = prevRedraw
			currentDOM = prevDOM
		}
	}
}


/***/ }),

/***/ "./node_modules/mithril/render/trust.js":
/*!**********************************************!*\
  !*** ./node_modules/mithril/render/trust.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Vnode = __webpack_require__(/*! ../render/vnode */ "./node_modules/mithril/render/vnode.js")

module.exports = function(html) {
	if (html == null) html = ""
	return Vnode("<", undefined, undefined, html, undefined, undefined)
}


/***/ }),

/***/ "./node_modules/mithril/render/vnode.js":
/*!**********************************************!*\
  !*** ./node_modules/mithril/render/vnode.js ***!
  \**********************************************/
/***/ ((module) => {

"use strict";


function Vnode(tag, key, attrs, children, text, dom) {
	return {tag: tag, key: key, attrs: attrs, children: children, text: text, dom: dom, domSize: undefined, state: undefined, events: undefined, instance: undefined}
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
	if (node == null || typeof node === "boolean") return null
	if (typeof node === "object") return node
	return Vnode("#", undefined, undefined, String(node), undefined, undefined)
}
Vnode.normalizeChildren = function(input) {
	var children = []
	if (input.length) {
		var isKeyed = input[0] != null && input[0].key != null
		// Note: this is a *very* perf-sensitive check.
		// Fun fact: merging the loop like this is somehow faster than splitting
		// it, noticeably so.
		for (var i = 1; i < input.length; i++) {
			if ((input[i] != null && input[i].key != null) !== isKeyed) {
				throw new TypeError(
					isKeyed && (input[i] != null || typeof input[i] === "boolean")
						? "In fragments, vnodes must either all have keys or none have keys. You may wish to consider using an explicit keyed empty fragment, m.fragment({key: ...}), instead of a hole."
						: "In fragments, vnodes must either all have keys or none have keys."
				)
			}
		}
		for (var i = 0; i < input.length; i++) {
			children[i] = Vnode.normalize(input[i])
		}
	}
	return children
}

module.exports = Vnode


/***/ }),

/***/ "./node_modules/mithril/request.js":
/*!*****************************************!*\
  !*** ./node_modules/mithril/request.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var PromisePolyfill = __webpack_require__(/*! ./promise/promise */ "./node_modules/mithril/promise/promise.js")
var mountRedraw = __webpack_require__(/*! ./mount-redraw */ "./node_modules/mithril/mount-redraw.js")

module.exports = __webpack_require__(/*! ./request/request */ "./node_modules/mithril/request/request.js")(typeof window !== "undefined" ? window : null, PromisePolyfill, mountRedraw.redraw)


/***/ }),

/***/ "./node_modules/mithril/request/request.js":
/*!*************************************************!*\
  !*** ./node_modules/mithril/request/request.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var buildPathname = __webpack_require__(/*! ../pathname/build */ "./node_modules/mithril/pathname/build.js")
var hasOwn = __webpack_require__(/*! ../util/hasOwn */ "./node_modules/mithril/util/hasOwn.js")

module.exports = function($window, Promise, oncompletion) {
	var callbackCount = 0

	function PromiseProxy(executor) {
		return new Promise(executor)
	}

	// In case the global Promise is some userland library's where they rely on
	// `foo instanceof this.constructor`, `this.constructor.resolve(value)`, or
	// similar. Let's *not* break them.
	PromiseProxy.prototype = Promise.prototype
	PromiseProxy.__proto__ = Promise // eslint-disable-line no-proto

	function makeRequest(factory) {
		return function(url, args) {
			if (typeof url !== "string") { args = url; url = url.url }
			else if (args == null) args = {}
			var promise = new Promise(function(resolve, reject) {
				factory(buildPathname(url, args.params), args, function (data) {
					if (typeof args.type === "function") {
						if (Array.isArray(data)) {
							for (var i = 0; i < data.length; i++) {
								data[i] = new args.type(data[i])
							}
						}
						else data = new args.type(data)
					}
					resolve(data)
				}, reject)
			})
			if (args.background === true) return promise
			var count = 0
			function complete() {
				if (--count === 0 && typeof oncompletion === "function") oncompletion()
			}

			return wrap(promise)

			function wrap(promise) {
				var then = promise.then
				// Set the constructor, so engines know to not await or resolve
				// this as a native promise. At the time of writing, this is
				// only necessary for V8, but their behavior is the correct
				// behavior per spec. See this spec issue for more details:
				// https://github.com/tc39/ecma262/issues/1577. Also, see the
				// corresponding comment in `request/tests/test-request.js` for
				// a bit more background on the issue at hand.
				promise.constructor = PromiseProxy
				promise.then = function() {
					count++
					var next = then.apply(promise, arguments)
					next.then(complete, function(e) {
						complete()
						if (count === 0) throw e
					})
					return wrap(next)
				}
				return promise
			}
		}
	}

	function hasHeader(args, name) {
		for (var key in args.headers) {
			if (hasOwn.call(args.headers, key) && key.toLowerCase() === name) return true
		}
		return false
	}

	return {
		request: makeRequest(function(url, args, resolve, reject) {
			var method = args.method != null ? args.method.toUpperCase() : "GET"
			var body = args.body
			var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(body instanceof $window.FormData || body instanceof $window.URLSearchParams)
			var responseType = args.responseType || (typeof args.extract === "function" ? "" : "json")

			var xhr = new $window.XMLHttpRequest(), aborted = false, isTimeout = false
			var original = xhr, replacedAbort
			var abort = xhr.abort

			xhr.abort = function() {
				aborted = true
				abort.call(this)
			}

			xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)

			if (assumeJSON && body != null && !hasHeader(args, "content-type")) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
			}
			if (typeof args.deserialize !== "function" && !hasHeader(args, "accept")) {
				xhr.setRequestHeader("Accept", "application/json, text/*")
			}
			if (args.withCredentials) xhr.withCredentials = args.withCredentials
			if (args.timeout) xhr.timeout = args.timeout
			xhr.responseType = responseType

			for (var key in args.headers) {
				if (hasOwn.call(args.headers, key)) {
					xhr.setRequestHeader(key, args.headers[key])
				}
			}

			xhr.onreadystatechange = function(ev) {
				// Don't throw errors on xhr.abort().
				if (aborted) return

				if (ev.target.readyState === 4) {
					try {
						var success = (ev.target.status >= 200 && ev.target.status < 300) || ev.target.status === 304 || (/^file:\/\//i).test(url)
						// When the response type isn't "" or "text",
						// `xhr.responseText` is the wrong thing to use.
						// Browsers do the right thing and throw here, and we
						// should honor that and do the right thing by
						// preferring `xhr.response` where possible/practical.
						var response = ev.target.response, message

						if (responseType === "json") {
							// For IE and Edge, which don't implement
							// `responseType: "json"`.
							if (!ev.target.responseType && typeof args.extract !== "function") {
								// Handle no-content which will not parse.
								try { response = JSON.parse(ev.target.responseText) }
								catch (e) { response = null }
							}
						} else if (!responseType || responseType === "text") {
							// Only use this default if it's text. If a parsed
							// document is needed on old IE and friends (all
							// unsupported), the user should use a custom
							// `config` instead. They're already using this at
							// their own risk.
							if (response == null) response = ev.target.responseText
						}

						if (typeof args.extract === "function") {
							response = args.extract(ev.target, args)
							success = true
						} else if (typeof args.deserialize === "function") {
							response = args.deserialize(response)
						}
						if (success) resolve(response)
						else {
							var completeErrorResponse = function() {
								try { message = ev.target.responseText }
								catch (e) { message = response }
								var error = new Error(message)
								error.code = ev.target.status
								error.response = response
								reject(error)
							}

							if (xhr.status === 0) {
								// Use setTimeout to push this code block onto the event queue
								// This allows `xhr.ontimeout` to run in the case that there is a timeout
								// Without this setTimeout, `xhr.ontimeout` doesn't have a chance to reject
								// as `xhr.onreadystatechange` will run before it
								setTimeout(function() {
									if (isTimeout) return
									completeErrorResponse()
								})
							} else completeErrorResponse()
						}
					}
					catch (e) {
						reject(e)
					}
				}
			}

			xhr.ontimeout = function (ev) {
				isTimeout = true
				var error = new Error("Request timed out")
				error.code = ev.target.status
				reject(error)
			}

			if (typeof args.config === "function") {
				xhr = args.config(xhr, args, url) || xhr

				// Propagate the `abort` to any replacement XHR as well.
				if (xhr !== original) {
					replacedAbort = xhr.abort
					xhr.abort = function() {
						aborted = true
						replacedAbort.call(this)
					}
				}
			}

			if (body == null) xhr.send()
			else if (typeof args.serialize === "function") xhr.send(args.serialize(body))
			else if (body instanceof $window.FormData || body instanceof $window.URLSearchParams) xhr.send(body)
			else xhr.send(JSON.stringify(body))
		}),
		jsonp: makeRequest(function(url, args, resolve, reject) {
			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
			var script = $window.document.createElement("script")
			$window[callbackName] = function(data) {
				delete $window[callbackName]
				script.parentNode.removeChild(script)
				resolve(data)
			}
			script.onerror = function() {
				delete $window[callbackName]
				script.parentNode.removeChild(script)
				reject(new Error("JSONP request failed"))
			}
			script.src = url + (url.indexOf("?") < 0 ? "?" : "&") +
				encodeURIComponent(args.callbackKey || "callback") + "=" +
				encodeURIComponent(callbackName)
			$window.document.documentElement.appendChild(script)
		}),
	}
}


/***/ }),

/***/ "./node_modules/mithril/route.js":
/*!***************************************!*\
  !*** ./node_modules/mithril/route.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var mountRedraw = __webpack_require__(/*! ./mount-redraw */ "./node_modules/mithril/mount-redraw.js")

module.exports = __webpack_require__(/*! ./api/router */ "./node_modules/mithril/api/router.js")(typeof window !== "undefined" ? window : null, mountRedraw)


/***/ }),

/***/ "./node_modules/mithril/util/assign.js":
/*!*********************************************!*\
  !*** ./node_modules/mithril/util/assign.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// This exists so I'm only saving it once.


var hasOwn = __webpack_require__(/*! ./hasOwn */ "./node_modules/mithril/util/hasOwn.js")

module.exports = Object.assign || function(target, source) {
	for (var key in source) {
		if (hasOwn.call(source, key)) target[key] = source[key]
	}
}


/***/ }),

/***/ "./node_modules/mithril/util/censor.js":
/*!*********************************************!*\
  !*** ./node_modules/mithril/util/censor.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


// Note: this is mildly perf-sensitive.
//
// It does *not* use `delete` - dynamic `delete`s usually cause objects to bail
// out into dictionary mode and just generally cause a bunch of optimization
// issues within engines.
//
// Ideally, I would've preferred to do this, if it weren't for the optimization
// issues:
//
// ```js
// const hasOwn = require("./hasOwn")
// const magic = [
//     "key", "oninit", "oncreate", "onbeforeupdate", "onupdate",
//     "onbeforeremove", "onremove",
// ]
// module.exports = (attrs, extras) => {
//     const result = Object.assign(Object.create(null), attrs)
//     for (const key of magic) delete result[key]
//     if (extras != null) for (const key of extras) delete result[key]
//     return result
// }
// ```

var hasOwn = __webpack_require__(/*! ./hasOwn */ "./node_modules/mithril/util/hasOwn.js")
// Words in RegExp literals are sometimes mangled incorrectly by the internal bundler, so use RegExp().
var magic = new RegExp("^(?:key|oninit|oncreate|onbeforeupdate|onupdate|onbeforeremove|onremove)$")

module.exports = function(attrs, extras) {
	var result = {}

	if (extras != null) {
		for (var key in attrs) {
			if (hasOwn.call(attrs, key) && !magic.test(key) && extras.indexOf(key) < 0) {
				result[key] = attrs[key]
			}
		}
	} else {
		for (var key in attrs) {
			if (hasOwn.call(attrs, key) && !magic.test(key)) {
				result[key] = attrs[key]
			}
		}
	}

	return result
}


/***/ }),

/***/ "./node_modules/mithril/util/hasOwn.js":
/*!*********************************************!*\
  !*** ./node_modules/mithril/util/hasOwn.js ***!
  \*********************************************/
/***/ ((module) => {

"use strict";
// This exists so I'm only saving it once.


module.exports = {}.hasOwnProperty


/***/ }),

/***/ "./src/models/Bio.js":
/*!***************************!*\
  !*** ./src/models/Bio.js ***!
  \***************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var m = __webpack_require__(/*! mithril */ "./node_modules/mithril/index.js")

var Bio = {
    pic: '../assets/profile-pic.jpg',

    biography: [
        'Kaarthik is a scientst in the',
        ' Information Systems and Modeling',
        ' at Los Alamos National Laboratory (LANL)',
        '. At LANL, he is also a part of the ',
        m('a', { href: 'https://lanl-ansi.github.io', 
        class: 'link dark-gray hover-blue',
        target: "_blank", rel: "noopener noreferrer"}, 
        'Advanced Network Science Initiative'), 
        '.',
    ],
    
    research: [
        'His research interests lie at the intersection of optimization,',
        ' control, and machine learning applied to complex systems. In particular,',
        ' his expertise lies in the areas of mathematical programming, large scale', 
        ' deterministic and stochastic optimization, optimal control, heuristics,', 
        ' approximation algorithms and reinforcement learning. He applies these',
        ' techniques to solve problems that arise in the domains of pipeline', 
        ' infrastucture systems transportation systems, decarbonization of', 
        ' energy infrastucture systems, improving the resiliency of infrastucture',
        ' systems in the face of climate impacts, robotics, and autonomous systems. '
    ],

    cv: '../assets/kaarthik-sundar-cv.pdf',
       
    email: 'mailto:kaarthik@lanl.gov',

    github: 'https://github.com/kaarthiksundar',

    scholar: 'https://scholar.google.com/citations?user=jAAj8DAAAAAJ&hl=en',

    linkedin: 'https://www.linkedin.com/in/kaarthiksundar/',
    
    theoryInterests: [
        'Mathematical Programming',
        'Global Optimization',
        'Optimal Control Theory',
        'Dynamics and Control',
        'Approximation Algorithms', 
        'Reinforcement Learning'
    ],

    appliedInterests: [
        'Autonomous Systems',
        'Pipeline Infrastructure Systems',
        'Transportation Systems',
        'Interdependent Energy Infrastructure Systems',
        'Supply Chain Systems',
        'Decarbonization Planning'
    ],

    softwares: [
        'He also loves to write production-quality code, even for his research work.', 
        ' He writes production code in C++, Kotlin, Python and Julia.',
        ' He extensively uses gnuplot for plotting.',
        ' He has written code in C, C++, Java, Julia, Kotlin, and Python for his ',
        'research work. Furthermore, he also maintains and/or develops a number of Julia packages.', 
        ' Some of them are ',
        m('a', { href: 'https://github.com/kaarthiksundar/Dubins.jl', class: 'link dark-gray hover-dark-blue',
        target: "_blank", rel: "noopener noreferrer"}, 'Dubins.jl'), ' and ',
        m('a', { href: 'https://github.com/sujeevraja/PolyhedralRelaxations.jl', class: 'link dark-gray hover-dark-blue', target: "_blank", rel: "noopener noreferrer"}, 
        'PolyhedralRelaxations.jl'), '.'
    ]
}

module.exports = Bio

/***/ }),

/***/ "./src/models/Education.js":
/*!*********************************!*\
  !*** ./src/models/Education.js ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var m = __webpack_require__(/*! mithril */ "./node_modules/mithril/index.js")

var Education = {
    list: [],
    loaded: false,
    loadList: async function () {
        console.log("Education.loadList starting...")
        const result = await m.request({
            method: "GET",
            url: "../assets/education.json",
        })
        Education.list = result
        Education.loaded = true
        console.log("Education.loadList completed.")
    }
}

module.exports = Education

/***/ }),

/***/ "./src/models/Experience.js":
/*!**********************************!*\
  !*** ./src/models/Experience.js ***!
  \**********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var m = __webpack_require__(/*! mithril */ "./node_modules/mithril/index.js")

var Experience = {
    list: [],
    loaded: false,
    loadList: async function () {
        console.log("Experience.loadList starting...")
        const result = await m.request({
            method: "GET",
            url: "../assets/experience.json",
        })
        Experience.list = result
        Experience.loaded = true
        console.log("Experience.loadList completed.")
    }
}

module.exports = Experience


/***/ }),

/***/ "./src/models/Publications.js":
/*!************************************!*\
  !*** ./src/models/Publications.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var m = __webpack_require__(/*! mithril */ "./node_modules/mithril/index.js")

var Publication = {
    list: [],
    loaded: false,
    loadList: async function () {
        console.log("Publication.loadList starting...")
        Publication.list = await m.request({
            method: "GET",
            url: "../assets/pubs.json",
        })
        // Publication.list = result
        Publication.loaded = true
        console.log("Publication.loadList completed.")
    },
    getYears: function () {
        return Array.from(new Set(Publication.list.map( function(o) {
            return o['year'];
        }).sort().reverse()));
    }, 
    selectedYearValue: 1,
    searchString: '',
    getPubs: function(year) {
        if (year == 'All') {
            conferences = Publication.list.filter( function (pub) {
                return (pub.type == "conference")
            });
            journals = Publication.list.filter( function (pub) {
                return (pub.type == "journal")
            });
            preprints = Publication.list.filter( function (pub) {
                return (pub.type == "preprint")
            });
            conferences.sort((a, b) => (a.year > b.year) ? -1 : 1)
            journals.sort((a, b) => (a.year > b.year) ? -1 : 1)
            preprints.sort((a, b) => (a.year > b.year) ? -1 : 1)
    
            return [conferences, journals, preprints]
        }
        conferences = Publication.list.filter( function (pub) {
            return (pub.type == "conference" && pub.year == year)
        });
        journals = Publication.list.filter( function (pub) {
            return (pub.type == "journal" && pub.year == year)
        });
        preprints = Publication.list.filter( function (pub) {
            return (pub.type == "preprint" && pub.year == year)
        });
        return [conferences, journals, preprints]
    }
}

module.exports = Publication

/***/ }),

/***/ "./src/models/Students.js":
/*!********************************!*\
  !*** ./src/models/Students.js ***!
  \********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var m = __webpack_require__(/*! mithril */ "./node_modules/mithril/index.js")

var Student = {
    list: [],
    loaded: false,
    loadList: async function () {
        console.log("Students.loadList starting...")
        Student.list = await m.request({
            method: "GET",
            url: "../assets/students.json",
        })
        Student.loaded = true
        console.log("Students.loadList completed.")
    },
    getStudents: function() {
        summer = Student.list.filter( function (it) {
            return (it.type == "summer")
        });
    
        pd = Student.list.filter( function (it) {
            return (it.type == "postdoc")
        });
    
        summer.sort((a, b) => (a.start > b.start) ? -1 : 1)
        pd.sort((a, b) => (a.start > b.start) ? -1 : 1)
        
        return [summer, pd]
    }
}

module.exports = Student

/***/ }),

/***/ "./src/views/Content.js":
/*!******************************!*\
  !*** ./src/views/Content.js ***!
  \******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var m = __webpack_require__(/*! mithril */ "./node_modules/mithril/index.js")

module.exports = {
    view: function (vnode) {
        return m('div', {class: 'pa3 ph5-ns w-100 pt6 pt7-ns', 
            id: 'content'},
            [vnode.children]);
    }
}

/***/ }),

/***/ "./src/views/ExperienceBox.js":
/*!************************************!*\
  !*** ./src/views/ExperienceBox.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var m = __webpack_require__(/*! mithril */ "./node_modules/mithril/index.js")
var Experience = __webpack_require__(/*! ../models/Experience */ "./src/models/Experience.js")

const icons = {
    'work': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`
}
  
const Icon = {
    view: (v) => {
        if (v.attrs.name in icons) {
            let cssClass = v.attrs.class || ''
            return m.trust(icons[v.attrs.name](cssClass))
        }
        return ''
    }
}


var experienceView = function (ex) {
        // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
        var icon = m('span', { class: 'left--2 absolute w2 tc' },
            m(Icon, { name: 'work'}))
    
        var children = [
        icon, 
        m('span', {class: 'f6 ttu black b'}, ex.role),
        m('br'),
        m('span', {class: 'black-90'}, ex.group), 
        m('br'), m('span', {class: 'black-60'}, ex.organization),
        m('br'), ex.location,
        m('br'),
        ex.start, ' — ', ex.end]
    return m('li', { class: 'f6 f5-ns pa2 lh-copy'}, children)
}

module.exports = {
    oninit: function() {
        if (!Experience.loaded) Experience.loadList()
    },
    view: function () {
        // 'fa-ul' replaced by 'list pl0 ml2 relative'
        return m('ul', {class: 'list pl2 ml4 relative nt6-ns nt2'}, 
            Experience.list.map(experienceView));
    }
}

/***/ }),

/***/ "./src/views/Footer.js":
/*!*****************************!*\
  !*** ./src/views/Footer.js ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var m = __webpack_require__(/*! mithril */ "./node_modules/mithril/index.js")

module.exports = {
    view: function() {
        return m('footer',
            { class: 'fixed tc left-0 bottom-0 right-0 bg-near-white dark-gray pa2 f7' },
            [
            'Built with ',
            m('a', { href: 'http://tachyons.io/' }, 'Tachyons'),
            ' & ',
            m('a', { href: 'https://mithril.js.org/' }, 'MithrilJS'),
            '. © Kaarthik Sundar'
            ]
        )
    }
}

/***/ }),

/***/ "./src/views/Header.js":
/*!*****************************!*\
  !*** ./src/views/Header.js ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var m = __webpack_require__(/*! mithril */ "./node_modules/mithril/index.js")
var Navmenu = __webpack_require__(/*! ./Navmenu */ "./src/views/Navmenu.js")

module.exports = {
    view: function() {
        var logo = m('div', {class: 'db v-mid tl w-100'},
            m('a', {href: '/', class: 'f5 f4-ns fw6 link dim white'},
                'KAARTHIK SUNDAR'
            )
        );

        var topbar = m('div', {class: 'pa3 ph5-ns bg-near-black'}, logo);

        return m('header', {class: 'w-100 fixed z-3', id: 'header'}, 
            [topbar, m(Navmenu)])
    }
}

/***/ }),

/***/ "./src/views/Home.js":
/*!***************************!*\
  !*** ./src/views/Home.js ***!
  \***************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var m = __webpack_require__(/*! mithril */ "./node_modules/mithril/index.js")
var Bio = __webpack_require__(/*! ../models/Bio */ "./src/models/Bio.js")
var Education = __webpack_require__(/*! ../models/Education */ "./src/models/Education.js")

const icons = {
    'linkedin': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
    'github': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
    'email': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    'grad': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 16 16"><path style=" stroke:none;fill-rule:nonzero;fill:currentColor;fill-opacity:1;" d="M 16 5.652344 L 16 13.332031 C 16 13.703125 15.703125 14 15.332031 14 C 14.964844 14 14.667969 13.703125 14.667969 13.332031 L 14.667969 7.835938 L 9.734375 10.191406 C 9.214844 10.5 8.621094 10.660156 8.015625 10.65625 C 7.382812 10.65625 6.761719 10.484375 6.214844 10.160156 L 1.296875 7.820312 C 0.507812 7.394531 0.0117188 6.578125 0 5.683594 C -0.0117188 4.789062 0.464844 3.960938 1.238281 3.515625 C 1.257812 3.507812 1.277344 3.496094 1.296875 3.488281 L 6.265625 1.113281 C 7.359375 0.488281 8.707031 0.5 9.789062 1.144531 L 14.703125 3.488281 C 15.496094 3.921875 15.988281 4.75 16 5.652344 Z M 8.015625 11.988281 C 7.160156 11.988281 6.324219 11.765625 5.585938 11.339844 L 2.667969 9.945312 L 2.667969 11.746094 C 2.667969 13.207031 3.617188 14.496094 5.011719 14.929688 C 5.984375 15.210938 6.988281 15.34375 8 15.332031 C 9.011719 15.34375 10.015625 15.207031 10.988281 14.929688 C 12.382812 14.496094 13.332031 13.203125 13.332031 11.742188 L 13.332031 9.949219 L 10.359375 11.371094 C 9.648438 11.777344 8.835938 11.992188 8.015625 11.988281 Z M 8.015625 11.988281 "/></svg>`,
}
  
const Icon = {
    view: (v) => {
        if (v.attrs.name in icons) {
            let cssClass = v.attrs.class || ''
            return m.trust(icons[v.attrs.name](cssClass))
        }
        return ''
    }
}

var educationView = function (ed) {
    // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
    var icon = m('span', { class: 'left--2 absolute w2 tc' },
        m(Icon, { name: 'grad'}))

    university = m('a', {
        href: ed.link, 
        class: 'link dark-gray hover-blue', 
        target: '_blank', rel: 'noopener noreferrer'
    }, ed.university)

    var children = [
        icon,
        m('span', {class: 'black'}, ed.degree), ' in ', ed.department, ', ', ed.year,
        m('br'), m('div', {class: 'dark-gray f7 f6-ns'}, university)]

    return m('li', { class: 'pa1 f6 f5-ns lh-copy'}, children)
}

module.exports = {
    oninit: function() {
        if (!Education.loaded) Education.loadList()
    },
    view: function () {
        var img = m('img', {
            src: Bio.pic, 
            class: 'br-100 shadow-2 o-90 h5-ns w5-ns h4 w4 dib ba b--transparent', 
            title: 'Kaarthik Sundar'
        });

        var title = m('h2', {class: 'f3-ns f4 mb3 black'}, 'Staff Scientist')
        
        var lanl = m('a', {
            href: 'https://www.lanl.gov/', 
            class: 'link dark-gray hover-blue', 
            target: '_blank', rel: 'noopener noreferrer'
        }, 'Los Alamos National Laboratory')

        var group = m('a', {
            href: 'https://organizations.lanl.gov/a-1/',
            class: 'link dark-gray hover-blue', 
            target: '_blank', rel: 'noopener noreferrer'
        }, 'Information Systems and Modeling')

        var subTitle = m('h2', {class: 'f5-ns f6 fw4 dark-gray mt1'}, [
            group, m('br'), m('br'), lanl])

        var pic = m('div', {class: 'tc'}, [img, title, subTitle]);

        var scholar = m('a', {
            href: Bio.scholar, 
            target: '_blank', 
            rel: 'noopener noreferrer',
            title: 'Google Scholar' 
            },
            m('i', {
                class: 'ai ai-google-scholar ai-2x black-70 hover-blue grow'
            })
        );

        var github = m('a', {
            href: Bio.github, 
            target: '_blank', 
            rel: 'noopener noreferrer',
            title: 'GitHub', 
            class: 'no-underline'
            },
            m(Icon, {name: 'github', class: 'black-70 hover-blue grow'})
        );

        var cv = m('a', {
            href: Bio.cv, 
            target: '_blank', 
            rel: 'noopener noreferrer',
            title: 'Curriculum Vitae'
            },
            m('i', {class: 'ai ai-cv ai-2x black-70 hover-blue grow'})
        );

        var email = m('a', {
            href: Bio.email, 
            target: '_blank', 
            rel: 'noopener noreferrer',
            title: 'email',
            class: 'no-underline'
            },
            m(Icon, {name: 'email', class: 'black-70 hover-blue grow'})
        );

        var linkedin = m('a', {
            href: Bio.linkedin, 
            target: '_blank', 
            rel: 'noopener noreferrer',
            title: 'LinkedIn',
            class: 'no-underline' 
            },
            m(Icon, {name: 'linkedin', class: 'black-70 hover-blue grow'})
        );
{/* <ion-icon name="logo-linkedin"></ion-icon> */}

        var icons = m('div', {class: 'tc'}, [ m('br'),
            m('span', {class: 'pr3'}, email),
            m('span', {class: 'pr3'}, github),
            m('span', {class: 'pr3'}, cv),
            m('span', {class: 'pr3'}, scholar), 
            m('span', {class: 'pr3'}, linkedin), 
        ]);

        var card = m('article', {class: 'w-50-ns w-100-m mw6 bg-white br3 pa2 mv3'}, 
            [pic, icons]
        );


        var education = m('ul', { class: 'list pl0 ml4 relative f6 f5-ns' }, Education.list.map(educationView))
        var edTitle = m('h4', {class: 'f5-ns f6 ttu tracked mb2 black'}, 'EDUCATION')
        var edRow = m('div', {class: 'dt-row'}, [edTitle, education])
        
        var desc = m('p', {class: 'measure-wide w-50-ns w-100-m f6 f5-ns lh-copy pa2 tl'}, [
            Bio.biography, ' ', 
            Bio.research, //' ', 
            // Bio.softwares,
            edRow
        ]);

        var home = m('div', {class: 'flex flex-column flex-row-l cf-ns nl2 nr2 nt6-ns justify-center items-center-m'}, [card, desc])

        return home
    }
}

/***/ }),

/***/ "./src/views/Layout.js":
/*!*****************************!*\
  !*** ./src/views/Layout.js ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var m = __webpack_require__(/*! mithril */ "./node_modules/mithril/index.js");
var Header = __webpack_require__(/*! ./Header */ "./src/views/Header.js");
var Footer = __webpack_require__(/*! ./Footer */ "./src/views/Footer.js");
var Content = __webpack_require__(/*! ./Content */ "./src/views/Content.js");

// For further details about this design, 
// especially the use of "vnode", check
// the "Wrapping a layout component" section in the following link:
// https://mithril.js.org/route.html#advanced-component-resolution

var view = function (vnode) {
    // m(component) consumes the component to generate a view.
    var content = m(Content, vnode.children)

    var body = m('div',
        { class: 'bg-white black-70' },
        [content]);

    return m('div',
        { class: 'firasans' },
        [m(Header), body, m(Footer)]
        );
};

module.exports = {
    view: view
};

/***/ }),

/***/ "./src/views/Navmenu.js":
/*!******************************!*\
  !*** ./src/views/Navmenu.js ***!
  \******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var m = __webpack_require__(/*! mithril */ "./node_modules/mithril/index.js")

class Link {
    constructor(name, route) {
        this.name = name;
        this.route = route;
    }
};

module.exports = {
    view: function() {
        var links = [
            new Link('Home', '/#!'),
            new Link('Research', '/#!/research'),
            // new Link('Experience', '/#!/experience'),
            new Link('Publications', '/#!/publications'),
            new Link('Students', '/#!/students')
        ];

        var items = links.map( function(item) {
            return m('a', {href: item.route, 
                class: 'pv1-ns f6 fw6 dim link black mr3 mr3-m mr4-l dib'},
                item.name)
        });
        
        var nav = m('div', {class: 'nowrap left'}, items);
        
        return m('nav', 
            {class: 'ph3 ph5-ns w-100 bg-near-white pv3 mb3 mb5-ns bt bb b--black-10 overflow-auto'}, 
            nav
        ); 
    }
}

/***/ }),

/***/ "./src/views/PublicationBox.js":
/*!*************************************!*\
  !*** ./src/views/PublicationBox.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var m = __webpack_require__(/*! mithril */ "./node_modules/mithril/index.js");
var Publication = __webpack_require__(/*! ../models/Publications */ "./src/models/Publications.js");
var runSearch = __webpack_require__(/*! ./PublicationSearch */ "./src/views/PublicationSearch.js")

const icons = {
    'search': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    'file': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
}
  
const Icon = {
    view: (v) => {
        if (v.attrs.name in icons) {
            let cssClass = v.attrs.class || ''
            return m.trust(icons[v.attrs.name](cssClass))
        }
        return ''
    }
}

var JView = function (paper) {
    // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
    var icon = m('span', { class: 'left--2 absolute w2 tc' },
        m(Icon, { name: 'file', class: 'light-red'}));

    var children = [
        icon,
        m('span', {class: 'black'}, paper.paperTitle), m('br'),
        '   ', paper.authors, m('br'),
        '   ', paper.JCTitle, ', ', paper.year, m('br')
    ]
    if (paper.doi != "") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib light-red', 
            href: 'https://www.doi.org/' + paper.doi}, 'DOI'));
    }
    if (paper.arxiv != "") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib light-red', 
            href: 'https://arxiv.org/abs/' + paper.arxiv}, 'arXiv'));
    }
    children.push(' ');
    var btn = m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib light-red', href: 'javascript:void(0)',
        onclick: function() {
            const dummy = document.createElement('textarea');
            dummy.value = paper.cite;
            document.body.appendChild(dummy);
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
        }
    }, 'Copy BibTeX');
    children.push(btn);

    return m('li', { class: 'pa2 lh-copy'}, children)
};

var CView = function (paper) {
    // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
    var icon = m('span', { class: 'left--2 absolute w2 tc' },
        m(Icon, { name: 'file', class: 'green'}));

    var children = [
        icon,
        m('span', {class: 'black'}, paper.paperTitle), m('br'),
        '   ', paper.authors, m('br'),
        '   ', paper.JCTitle, ', ', paper.year, m('br')
    ]
    if (paper.doi != "") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib green', 
            href: 'https://www.doi.org/' + paper.doi}, 'DOI'));
    }
    if (paper.arxiv != "") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib green', 
            href: 'https://arxiv.org/abs/' + paper.arxiv}, 'arXiv'));
    }
    children.push(' ');
    var btn = m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib green', href: 'javascript:void(0)',
        onclick: function() {
            const dummy = document.createElement('textarea');
            dummy.value = paper.cite;
            document.body.appendChild(dummy);
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
        }
    }, 'Copy BibTeX');
    children.push(btn);

    return m('li', { class: 'pa2 lh-copy'}, children)
};

var PreprintView = function (paper) {
    // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
    var icon = m('span', { class: 'left--2 absolute w2 tc' },
        m(Icon, { name: 'file', class: 'blue'}));

    var children = [
        icon,
        m('span', {class: 'black'}, paper.paperTitle), m('br'),
        '   ', paper.authors, '. ', paper.year, m('br')
    ]
    if (paper.arxiv != "") {
        children.push('  ');
        children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib blue', 
            href: 'https://arxiv.org/abs/' + paper.arxiv}, 'arXiv'));
    }
    children.push(' ');
    var btn = m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib blue', href: 'javascript:void(0)',
    onclick: function() {
        const dummy = document.createElement('textarea');
        dummy.value = paper.cite;
        document.body.appendChild(dummy);
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
    }
}, 'Copy BibTeX');
    children.push(btn);

    return m('li', { class: 'pa2 lh-copy'}, children)
}

module.exports = {
    oninit: function() {
        if (!Publication.loaded) Publication.loadList()
        Publication.selectedYearValue = 1;
        Publication.searchString = '';
    },
    view: function () {
        var allYears = Publication.getYears();
        allYears.unshift('All');
        
        var options = allYears.map(function (item, index) {
            return {value: index + 1, name: item}
        });

        var dropdown = m('select', { id: 'year',
            onchange: function(ev) { Publication.selectedYearValue = parseInt(ev.target.value); } 
            },
            options.map((row) => {
                return m('option', {
                    value: row.value, selected: row.value == Publication.selectedYearValue
                }, row.name)
            })
        );

        var searchbox =  m('input', {
            placeholder: 'Type to search...',
            oninput: function() { 
                Publication.searchString = this.value
            } 
        });

        var searchdiv = m('div', {class: 'f6 dib ml4 mb4'}, [
            m(Icon, {name: 'search'}), 
            m('span', {class: 'f6 f5-ns pr2'}, ' '), 
            searchbox
        ])
        var dddiv = m('div', {class: 'f6 dib ml4 mb4'}, [m('span', {class: 'f6 f5-ns pr2'}, 'Select year :'), dropdown])
        
        var chosenYear = options.filter( (item) => (parseInt(item.value) == Publication.selectedYearValue))[0].name;

        var papers = Publication.getPubs(chosenYear);
        var conferences = papers[0];
        var journals = papers[1];
        var preprints = papers[2];

        if (Publication.searchString != '') {
            conferences = runSearch(Publication.searchString, conferences);
            journals = runSearch(Publication.searchString, journals);
            preprints = runSearch(Publication.searchString, preprints);
        }

        var conftitle = m('h3', {class: 'f6 ttu tracked nt2 green'}, 'CONFERENCE PROCEEDINGS');
        // 'fa-ul' replaced by 'list pl0 ml4 relative'
        var conflist = m('ul', { class: 'list pl0 ml4 relative f6 f5-ns' }, conferences.map(CView));
        var confdiv = m('div', {id: 'conference', class: 'pa3 ph5-ns w-100' }, [conftitle, conflist]);

        var journaltitle = m('h3', {class: 'f6 ttu tracked nt2 light-red'}, 'JOURNAL ARTICLES');
        // 'fa-ul' replaced by 'list pl0 ml4 relative'
        var journallist = m('ul', { class: 'list pl0 ml4 relative f6 f5-ns' }, journals.map(JView));
        var journaldiv = m('div', {id: 'journal', class: 'pa3 ph5-ns w-100' }, [journaltitle, journallist]);

        var preprinttitle = m('h3', {class: 'f6 ttu tracked nt2 blue'}, 'PREPRINTS');
        // 'fa-ul' replaced by 'list pl0 ml4 relative'
        var preprintlist = m('ul', {class: 'list pl0 ml4 relative f6 f5-ns' }, preprints.map(PreprintView))
        var preprintdiv = m('div', {id: 'preprint', class: 'pa3 ph5-ns w-100' }, [preprinttitle, preprintlist])

        var paperdiv = []
        if (preprints.length != 0) 
            paperdiv.push(preprintdiv)
        if (journals.length != 0)
            paperdiv.push(journaldiv)
        if (conferences.length != 0)
            paperdiv.push(confdiv)

        var numentries = preprints.length + journals.length + conferences.length
        console.log(numentries)
        var numentriesdiv = m('div', {class: 'f6 dib ml4 mb4'}, 
            m('span', {class: 'f6 f5-ns pr2'}, 'Number of entries : ' + numentries))
        
        return m('div', {class: 'pb3 nt5-ns'}, [dddiv, searchdiv, numentriesdiv, paperdiv])
    }
}

/***/ }),

/***/ "./src/views/PublicationSearch.js":
/*!****************************************!*\
  !*** ./src/views/PublicationSearch.js ***!
  \****************************************/
/***/ ((module) => {

function getPubString(pub) {
    var pubString = '';
    for(var key in pub) {
        var fields = ["type", "paperTitle", 
            "JCTitle", "year", "authors", "fullAuthors"];
        if (fields.includes(key)) {
            if(pub.hasOwnProperty(key) && pub[key] !== '') 
                pubString += pub[key].toString().toLowerCase().trim() + ' ';
        }
    }
    return pubString;
}

var runSearch = function(searchValue, publist) {
    // Get the search terms from the input field
    if (searchValue == '') 
        return []
    var searchTerm = searchValue;
    // Tokenize the search terms and remove empty spaces
    var tokens = searchTerm
                  .toLowerCase()
                  .split(' ')
                  .filter(function(token){
                    return token.trim() !== '';
                  });
   if (tokens.length) {
        //  Create a regular expression of all the search terms
        var searchTermRegex = new RegExp(tokens.join('|'), 'gim');
        var filteredList = publist.filter(function(pub) {
        // Create a string of all object values
        var pubString = getPubString(pub);
        // Return pub objects where a match with the search regex if found
        return pubString.match(searchTermRegex);
    });
    // return search results
    return filteredList;
   }
   return []
};

module.exports = runSearch;


/***/ }),

/***/ "./src/views/ResearchBox.js":
/*!**********************************!*\
  !*** ./src/views/ResearchBox.js ***!
  \**********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var m = __webpack_require__(/*! mithril */ "./node_modules/mithril/index.js")
var Bio = __webpack_require__(/*! ../models/Bio */ "./src/models/Bio.js")

const icons = {
    'research': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 16 16"><path style=" stroke:none;fill-rule:nonzero;fill:currentColor;fill-opacity:1;" d="M 10.667969 4 C 11.035156 4 11.332031 4.296875 11.332031 4.667969 C 11.332031 5.035156 11.035156 5.332031 10.667969 5.332031 L 5.332031 5.332031 C 4.964844 5.332031 4.667969 5.035156 4.667969 4.667969 C 4.667969 4.296875 4.964844 4 5.332031 4 Z M 15.804688 15.804688 C 15.542969 16.066406 15.121094 16.066406 14.863281 15.804688 L 13.257812 14.199219 C 12.78125 14.503906 12.230469 14.664062 11.667969 14.667969 C 10.011719 14.667969 8.667969 13.324219 8.667969 11.667969 C 8.667969 10.011719 10.011719 8.667969 11.667969 8.667969 C 13.324219 8.667969 14.667969 10.011719 14.667969 11.667969 C 14.664062 12.230469 14.503906 12.78125 14.199219 13.257812 L 15.804688 14.863281 C 16.066406 15.121094 16.066406 15.542969 15.804688 15.804688 Z M 11.667969 13.332031 C 12.585938 13.332031 13.332031 12.585938 13.332031 11.667969 C 13.332031 10.746094 12.585938 10 11.667969 10 C 10.746094 10 10 10.746094 10 11.667969 C 10 12.585938 10.746094 13.332031 11.667969 13.332031 Z M 8.667969 14.667969 L 4.667969 14.667969 C 3.5625 14.667969 2.667969 13.769531 2.667969 12.667969 L 2.667969 3.332031 C 2.667969 2.230469 3.5625 1.332031 4.667969 1.332031 L 12.667969 1.332031 C 13.035156 1.332031 13.332031 1.632812 13.332031 2 L 13.332031 7.332031 C 13.332031 7.703125 13.632812 8 14 8 C 14.367188 8 14.667969 7.703125 14.667969 7.332031 L 14.667969 2 C 14.667969 0.894531 13.769531 0 12.667969 0 L 4.667969 0 C 2.828125 0.00390625 1.335938 1.492188 1.332031 3.332031 L 1.332031 12.667969 C 1.335938 14.507812 2.828125 15.996094 4.667969 16 L 8.667969 16 C 9.035156 16 9.332031 15.703125 9.332031 15.332031 C 9.332031 14.964844 9.035156 14.667969 8.667969 14.667969 Z M 8.667969 14.667969 "/></svg>`
}

// 'fa-li' is replaced by 'left--2 absolute w2 tc' 
const Icon = {
    view: (v) => {
        if (v.attrs.name in icons) {
            let cssClass = v.attrs.class || ''
            return m.trust(icons[v.attrs.name](cssClass))
        }
        return ''
    }
}

module.exports = {
    view: function () {
        var icon = m('span', { class: 'left--2 absolute w2 tc' }, m(Icon, { name: 'research'}))

        var theoryTitle = m('h3', {class: 'f6 ttu tracked nt2 black'}, 'THEORY');
        var appliedTitle = m('h3', {class: 'f6 ttu tracked nt2 black'}, 'APPLICATION DOMAINS');


        var theoryItems = Bio.theoryInterests.map(function(item) {
            return m('li', {class: 'pa2 lh-copy'}, [icon, item])
        });
        var theorylist = m('ul', {class: 'list pl0 ml4 relative f6 f5-ns' }, theoryItems);
        var theorydiv = m('div', {id: 'theory', class: 'fl pa2 ph5-l' }, [theoryTitle, theorylist]);

        var appliedItems = Bio.appliedInterests.map(function(item) {
            return m('li', {class: 'pa2 lh-copy'}, [icon, item])
        });
        var appliedlist = m('ul', { class: 'list pl0 ml4 relative f6 f5-ns' }, appliedItems);
        var applieddiv = m('div', {id: 'applied', class: 'fl pa2 ph5-l' }, [appliedTitle, appliedlist]);

        return m('div', {class: 'flex flex-column items-start nt6-ns nt3 cf-ns nl2 nr2  pt4 pl3'}, [theorydiv, applieddiv]);
    }
}

/***/ }),

/***/ "./src/views/StudentBox.js":
/*!*********************************!*\
  !*** ./src/views/StudentBox.js ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var m = __webpack_require__(/*! mithril */ "./node_modules/mithril/index.js");
var Student = __webpack_require__(/*! ../models/Students */ "./src/models/Students.js");

const icons = {
    'user': (cssClass) => `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
}
  
const Icon = {
    view: (v) => {
        if (v.attrs.name in icons) {
            let cssClass = v.attrs.class || ''
            return m.trust(icons[v.attrs.name](cssClass))
        }
        return ''
    }
}

var SummerStudentView = function (student) {
    // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
    var icon = m('span', { class: 'left--2 absolute w2 tc' },
        m(Icon, { name: 'user', class: 'light-red'}));

    var name; 
    if (student.linkedin) {
        name = m('a', {
            class: 'link black hover-blue',
            href: student.linkedin, 
            target: "_blank", 
            rel: "noopener noreferrer"
            }, student.name
        ) 
    }
    else name = student.name

    var children = [
        icon, m('span', {class: 'black'}, name), ', ', 
        student.start, m('br'), '   ', student.research, m('br')
    ]

    // if (student.linkedin != "") {
    //     children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib light-red', 
    //         href: student.linkedin}, 'LinkedIn'));
    // }
    
    return m('li', { class: 'pa2 lh-copy'}, children)
};

var PostdocView = function (student) {
    // 'fa-li' is replaced by 'left--2 absolute w2 tc' 
    var icon = m('span', { class: 'left--2 absolute w2 tc' },
        m(Icon, { name: 'user', class: 'green'}));

    var name; 
    if (student.linkedin) {
        name = m('a', {
            class: 'link black hover-blue',
            href: student.linkedin, 
            target: "_blank", 
            rel: "noopener noreferrer"
            }, student.name
        ) 
    }
    else name = student.name

    var children = [
        icon, m('span', {class: 'black'}, name), ', ', 
        student.start, ' — ', student.end, 
        m('br'), '   ', student.research, m('br')
    ]

    // if (student.linkedin != "") {
    //     children.push(m('a', {class: 'f7 link dim br2 ba ph1 mb2 dib green', 
    //         href: student.linkedin}, 'LinkedIn'));
    // }
    
    return m('li', { class: 'pa2 lh-copy'}, children)
};


module.exports = {
    oninit: function() {
        if (!Student.loaded) Student.loadList()
    },
    view: function () {
        var students = Student.getStudents();
        var summer = students[0];
        var pd = students[1];
    
        var desc = m('div', {class: 'lh-copy f6 f5-ns pa3 ph5-ns'}, 'At LANL, Kaarthik has had the pleasure of mentoring an excellent set of graduate research assistants and post-doctoral researchers whose list is given below:')

        var pdtitle = m('h3', {class: 'f6 ttu tracked nt2 green'}, 'POST-DOCTORAL RESEARCHERS');
        // 'fa-ul' replaced by 'list pl0 ml4 relative'
        var pdlist = m('ul', { class: 'list pl0 ml4 relative f6 f5-ns' }, pd.map(PostdocView));
        var pddiv = m('div', {id: 'pd', class: 'pa3 ph5-ns w-100' }, [pdtitle, pdlist]);

        var summertitle = m('h3', {class: 'f6 ttu tracked nt2 light-red'}, 'GRADUATE RESEARCH ASSISTANTS');
        // 'fa-ul' replaced by 'list pl0 ml4 relative'
        var summerlist = m('ul', { class: 'list pl0 ml4 relative f6 f5-ns' }, summer.map(SummerStudentView));
        var summerdiv = m('div', {id: 'journal', class: 'pa3 ph5-ns w-100' }, [summertitle, summerlist]);
        
        return m('div', {class: 'pb3 nt3 nt6-ns'}, [desc, pddiv, summerdiv])
    }
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
var m = __webpack_require__(/*! mithril */ "./node_modules/mithril/index.js");
var Layout = __webpack_require__(/*! ./views/Layout */ "./src/views/Layout.js");
const Home = __webpack_require__(/*! ./views/Home */ "./src/views/Home.js")
const PublicationBox = __webpack_require__(/*! ./views/PublicationBox */ "./src/views/PublicationBox.js");
const ExperienceBox = __webpack_require__(/*! ./views/ExperienceBox */ "./src/views/ExperienceBox.js");
const ResearchBox = __webpack_require__(/*! ./views/ResearchBox */ "./src/views/ResearchBox.js");
const StudentBox = __webpack_require__(/*! ./views/StudentBox */ "./src/views/StudentBox.js");

// Details on how the following route is designed can be founde at:
// https://mithril.js.org/route.html#advanced-component-resolution
function buildRouteResolver(component) {
    return {
        render: function () {
            return m(Layout, m(component))
        }
    }
};

m.route(document.body, "/", {
    "/": buildRouteResolver(Home),
    "/research": buildRouteResolver(ResearchBox),
    "/experience": buildRouteResolver(ExperienceBox),
    "/publications": buildRouteResolver(PublicationBox),
    "/students": buildRouteResolver(StudentBox)
});



})();

/******/ })()
;
//# sourceMappingURL=app.js.map