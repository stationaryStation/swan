
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function (supabaseJs) {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const supabaseUrl = __api.env.SVELTE_APP_SUPABASE_URL;
    const supabaseAnnonKey = __api.env.SVELTE_APP_SUPABASE_ANON_KEY;

    const supabase = supabaseJs.createClient(supabaseUrl, supabaseAnnonKey);

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const user = writable(false);

    /* node_modules\svelte-feather-icons\src\icons\CalendarIcon.svelte generated by Svelte v3.44.3 */

    const file$8 = "node_modules\\svelte-feather-icons\\src\\icons\\CalendarIcon.svelte";

    function create_fragment$8(ctx) {
    	let svg;
    	let rect;
    	let line0;
    	let line1;
    	let line2;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			rect = svg_element("rect");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			attr_dev(rect, "x", "3");
    			attr_dev(rect, "y", "4");
    			attr_dev(rect, "width", "18");
    			attr_dev(rect, "height", "18");
    			attr_dev(rect, "rx", "2");
    			attr_dev(rect, "ry", "2");
    			add_location(rect, file$8, 13, 245, 531);
    			attr_dev(line0, "x1", "16");
    			attr_dev(line0, "y1", "2");
    			attr_dev(line0, "x2", "16");
    			attr_dev(line0, "y2", "6");
    			add_location(line0, file$8, 13, 307, 593);
    			attr_dev(line1, "x1", "8");
    			attr_dev(line1, "y1", "2");
    			attr_dev(line1, "x2", "8");
    			attr_dev(line1, "y2", "6");
    			add_location(line1, file$8, 13, 350, 636);
    			attr_dev(line2, "x1", "3");
    			attr_dev(line2, "y1", "10");
    			attr_dev(line2, "x2", "21");
    			attr_dev(line2, "y2", "10");
    			add_location(line2, file$8, 13, 391, 677);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", /*size*/ ctx[0]);
    			attr_dev(svg, "height", /*size*/ ctx[0]);
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "stroke-width", /*strokeWidth*/ ctx[1]);
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			attr_dev(svg, "class", svg_class_value = "feather feather-calendar " + /*customClass*/ ctx[2]);
    			add_location(svg, file$8, 13, 0, 286);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, rect);
    			append_dev(svg, line0);
    			append_dev(svg, line1);
    			append_dev(svg, line2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size*/ 1) {
    				attr_dev(svg, "width", /*size*/ ctx[0]);
    			}

    			if (dirty & /*size*/ 1) {
    				attr_dev(svg, "height", /*size*/ ctx[0]);
    			}

    			if (dirty & /*strokeWidth*/ 2) {
    				attr_dev(svg, "stroke-width", /*strokeWidth*/ ctx[1]);
    			}

    			if (dirty & /*customClass*/ 4 && svg_class_value !== (svg_class_value = "feather feather-calendar " + /*customClass*/ ctx[2])) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CalendarIcon', slots, []);
    	let { size = "100%" } = $$props;
    	let { strokeWidth = 2 } = $$props;
    	let { class: customClass = "" } = $$props;

    	if (size !== "100%") {
    		size = size.slice(-1) === 'x'
    		? size.slice(0, size.length - 1) + 'em'
    		: parseInt(size) + 'px';
    	}

    	const writable_props = ['size', 'strokeWidth', 'class'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CalendarIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('strokeWidth' in $$props) $$invalidate(1, strokeWidth = $$props.strokeWidth);
    		if ('class' in $$props) $$invalidate(2, customClass = $$props.class);
    	};

    	$$self.$capture_state = () => ({ size, strokeWidth, customClass });

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('strokeWidth' in $$props) $$invalidate(1, strokeWidth = $$props.strokeWidth);
    		if ('customClass' in $$props) $$invalidate(2, customClass = $$props.customClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size, strokeWidth, customClass];
    }

    class CalendarIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { size: 0, strokeWidth: 1, class: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CalendarIcon",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get size() {
    		throw new Error("<CalendarIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<CalendarIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get strokeWidth() {
    		throw new Error("<CalendarIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set strokeWidth(value) {
    		throw new Error("<CalendarIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<CalendarIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<CalendarIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-feather-icons\src\icons\HomeIcon.svelte generated by Svelte v3.44.3 */

    const file$7 = "node_modules\\svelte-feather-icons\\src\\icons\\HomeIcon.svelte";

    function create_fragment$7(ctx) {
    	let svg;
    	let path;
    	let polyline;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			polyline = svg_element("polyline");
    			attr_dev(path, "d", "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z");
    			add_location(path, file$7, 13, 241, 527);
    			attr_dev(polyline, "points", "9 22 9 12 15 12 15 22");
    			add_location(polyline, file$7, 13, 305, 591);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", /*size*/ ctx[0]);
    			attr_dev(svg, "height", /*size*/ ctx[0]);
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "stroke-width", /*strokeWidth*/ ctx[1]);
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			attr_dev(svg, "class", svg_class_value = "feather feather-home " + /*customClass*/ ctx[2]);
    			add_location(svg, file$7, 13, 0, 286);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    			append_dev(svg, polyline);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size*/ 1) {
    				attr_dev(svg, "width", /*size*/ ctx[0]);
    			}

    			if (dirty & /*size*/ 1) {
    				attr_dev(svg, "height", /*size*/ ctx[0]);
    			}

    			if (dirty & /*strokeWidth*/ 2) {
    				attr_dev(svg, "stroke-width", /*strokeWidth*/ ctx[1]);
    			}

    			if (dirty & /*customClass*/ 4 && svg_class_value !== (svg_class_value = "feather feather-home " + /*customClass*/ ctx[2])) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HomeIcon', slots, []);
    	let { size = "100%" } = $$props;
    	let { strokeWidth = 2 } = $$props;
    	let { class: customClass = "" } = $$props;

    	if (size !== "100%") {
    		size = size.slice(-1) === 'x'
    		? size.slice(0, size.length - 1) + 'em'
    		: parseInt(size) + 'px';
    	}

    	const writable_props = ['size', 'strokeWidth', 'class'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HomeIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('strokeWidth' in $$props) $$invalidate(1, strokeWidth = $$props.strokeWidth);
    		if ('class' in $$props) $$invalidate(2, customClass = $$props.class);
    	};

    	$$self.$capture_state = () => ({ size, strokeWidth, customClass });

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('strokeWidth' in $$props) $$invalidate(1, strokeWidth = $$props.strokeWidth);
    		if ('customClass' in $$props) $$invalidate(2, customClass = $$props.customClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size, strokeWidth, customClass];
    }

    class HomeIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { size: 0, strokeWidth: 1, class: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HomeIcon",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get size() {
    		throw new Error("<HomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<HomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get strokeWidth() {
    		throw new Error("<HomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set strokeWidth(value) {
    		throw new Error("<HomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<HomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<HomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-feather-icons\src\icons\PlusCircleIcon.svelte generated by Svelte v3.44.3 */

    const file$6 = "node_modules\\svelte-feather-icons\\src\\icons\\PlusCircleIcon.svelte";

    function create_fragment$6(ctx) {
    	let svg;
    	let circle;
    	let line0;
    	let line1;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			attr_dev(circle, "cx", "12");
    			attr_dev(circle, "cy", "12");
    			attr_dev(circle, "r", "10");
    			add_location(circle, file$6, 13, 248, 534);
    			attr_dev(line0, "x1", "12");
    			attr_dev(line0, "y1", "8");
    			attr_dev(line0, "x2", "12");
    			attr_dev(line0, "y2", "16");
    			add_location(line0, file$6, 13, 288, 574);
    			attr_dev(line1, "x1", "8");
    			attr_dev(line1, "y1", "12");
    			attr_dev(line1, "x2", "16");
    			attr_dev(line1, "y2", "12");
    			add_location(line1, file$6, 13, 332, 618);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", /*size*/ ctx[0]);
    			attr_dev(svg, "height", /*size*/ ctx[0]);
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "stroke-width", /*strokeWidth*/ ctx[1]);
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			attr_dev(svg, "class", svg_class_value = "feather feather-plus-circle " + /*customClass*/ ctx[2]);
    			add_location(svg, file$6, 13, 0, 286);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, circle);
    			append_dev(svg, line0);
    			append_dev(svg, line1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size*/ 1) {
    				attr_dev(svg, "width", /*size*/ ctx[0]);
    			}

    			if (dirty & /*size*/ 1) {
    				attr_dev(svg, "height", /*size*/ ctx[0]);
    			}

    			if (dirty & /*strokeWidth*/ 2) {
    				attr_dev(svg, "stroke-width", /*strokeWidth*/ ctx[1]);
    			}

    			if (dirty & /*customClass*/ 4 && svg_class_value !== (svg_class_value = "feather feather-plus-circle " + /*customClass*/ ctx[2])) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PlusCircleIcon', slots, []);
    	let { size = "100%" } = $$props;
    	let { strokeWidth = 2 } = $$props;
    	let { class: customClass = "" } = $$props;

    	if (size !== "100%") {
    		size = size.slice(-1) === 'x'
    		? size.slice(0, size.length - 1) + 'em'
    		: parseInt(size) + 'px';
    	}

    	const writable_props = ['size', 'strokeWidth', 'class'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PlusCircleIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('strokeWidth' in $$props) $$invalidate(1, strokeWidth = $$props.strokeWidth);
    		if ('class' in $$props) $$invalidate(2, customClass = $$props.class);
    	};

    	$$self.$capture_state = () => ({ size, strokeWidth, customClass });

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('strokeWidth' in $$props) $$invalidate(1, strokeWidth = $$props.strokeWidth);
    		if ('customClass' in $$props) $$invalidate(2, customClass = $$props.customClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size, strokeWidth, customClass];
    }

    class PlusCircleIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { size: 0, strokeWidth: 1, class: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlusCircleIcon",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get size() {
    		throw new Error("<PlusCircleIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<PlusCircleIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get strokeWidth() {
    		throw new Error("<PlusCircleIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set strokeWidth(value) {
    		throw new Error("<PlusCircleIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<PlusCircleIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<PlusCircleIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-feather-icons\src\icons\UserIcon.svelte generated by Svelte v3.44.3 */

    const file$5 = "node_modules\\svelte-feather-icons\\src\\icons\\UserIcon.svelte";

    function create_fragment$5(ctx) {
    	let svg;
    	let path;
    	let circle;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			circle = svg_element("circle");
    			attr_dev(path, "d", "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2");
    			add_location(path, file$5, 13, 241, 527);
    			attr_dev(circle, "cx", "12");
    			attr_dev(circle, "cy", "7");
    			attr_dev(circle, "r", "4");
    			add_location(circle, file$5, 13, 300, 586);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", /*size*/ ctx[0]);
    			attr_dev(svg, "height", /*size*/ ctx[0]);
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "stroke-width", /*strokeWidth*/ ctx[1]);
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			attr_dev(svg, "class", svg_class_value = "feather feather-user " + /*customClass*/ ctx[2]);
    			add_location(svg, file$5, 13, 0, 286);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    			append_dev(svg, circle);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size*/ 1) {
    				attr_dev(svg, "width", /*size*/ ctx[0]);
    			}

    			if (dirty & /*size*/ 1) {
    				attr_dev(svg, "height", /*size*/ ctx[0]);
    			}

    			if (dirty & /*strokeWidth*/ 2) {
    				attr_dev(svg, "stroke-width", /*strokeWidth*/ ctx[1]);
    			}

    			if (dirty & /*customClass*/ 4 && svg_class_value !== (svg_class_value = "feather feather-user " + /*customClass*/ ctx[2])) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UserIcon', slots, []);
    	let { size = "100%" } = $$props;
    	let { strokeWidth = 2 } = $$props;
    	let { class: customClass = "" } = $$props;

    	if (size !== "100%") {
    		size = size.slice(-1) === 'x'
    		? size.slice(0, size.length - 1) + 'em'
    		: parseInt(size) + 'px';
    	}

    	const writable_props = ['size', 'strokeWidth', 'class'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UserIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('strokeWidth' in $$props) $$invalidate(1, strokeWidth = $$props.strokeWidth);
    		if ('class' in $$props) $$invalidate(2, customClass = $$props.class);
    	};

    	$$self.$capture_state = () => ({ size, strokeWidth, customClass });

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('strokeWidth' in $$props) $$invalidate(1, strokeWidth = $$props.strokeWidth);
    		if ('customClass' in $$props) $$invalidate(2, customClass = $$props.customClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size, strokeWidth, customClass];
    }

    class UserIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { size: 0, strokeWidth: 1, class: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserIcon",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get size() {
    		throw new Error("<UserIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<UserIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get strokeWidth() {
    		throw new Error("<UserIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set strokeWidth(value) {
    		throw new Error("<UserIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<UserIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<UserIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\lib\nav.svelte generated by Svelte v3.44.3 */

    const file$4 = "src\\lib\\nav.svelte";

    function create_fragment$4(ctx) {
    	let nav;
    	let ul;
    	let li0;
    	let h3;
    	let t1;
    	let li1;
    	let a0;
    	let homeicon;
    	let t2;
    	let li2;
    	let a1;
    	let calendaricon;
    	let t3;
    	let li3;
    	let a2;
    	let usericon;
    	let t4;
    	let li4;
    	let a3;
    	let pluscircleicon;
    	let current;

    	homeicon = new HomeIcon({
    			props: { class: "nav-icons", size: "30px" },
    			$$inline: true
    		});

    	calendaricon = new CalendarIcon({
    			props: { class: "nav-icons", size: "30px" },
    			$$inline: true
    		});

    	usericon = new UserIcon({
    			props: { class: "nav-icons", size: "30px" },
    			$$inline: true
    		});

    	pluscircleicon = new PlusCircleIcon({
    			props: {
    				class: "nav-icons-succes nav-icons",
    				size: "30px"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");
    			li0 = element("li");
    			h3 = element("h3");
    			h3.textContent = "Swan";
    			t1 = space();
    			li1 = element("li");
    			a0 = element("a");
    			create_component(homeicon.$$.fragment);
    			t2 = space();
    			li2 = element("li");
    			a1 = element("a");
    			create_component(calendaricon.$$.fragment);
    			t3 = space();
    			li3 = element("li");
    			a2 = element("a");
    			create_component(usericon.$$.fragment);
    			t4 = space();
    			li4 = element("li");
    			a3 = element("a");
    			create_component(pluscircleicon.$$.fragment);
    			attr_dev(h3, "class", "navbar-header navbar-title title");
    			add_location(h3, file$4, 7, 36, 271);
    			attr_dev(li0, "class", "navbar-item");
    			add_location(li0, file$4, 7, 12, 247);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "nav-link");
    			add_location(a0, file$4, 8, 36, 368);
    			attr_dev(li1, "class", "navbar-item");
    			add_location(li1, file$4, 8, 12, 344);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "nav-link");
    			add_location(a1, file$4, 9, 36, 483);
    			attr_dev(li2, "class", "navbar-item");
    			add_location(li2, file$4, 9, 12, 459);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "nav-link");
    			add_location(a2, file$4, 10, 36, 602);
    			attr_dev(li3, "class", "navbar-item");
    			add_location(li3, file$4, 10, 12, 578);
    			attr_dev(a3, "href", "#");
    			attr_dev(a3, "class", "nav-link");
    			add_location(a3, file$4, 11, 35, 716);
    			attr_dev(li4, "class", "nav-bottom");
    			add_location(li4, file$4, 11, 12, 693);
    			attr_dev(ul, "class", "navbar-nav");
    			add_location(ul, file$4, 6, 8, 210);
    			attr_dev(nav, "class", "navbar");
    			add_location(nav, file$4, 5, 4, 180);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, h3);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a0);
    			mount_component(homeicon, a0, null);
    			append_dev(ul, t2);
    			append_dev(ul, li2);
    			append_dev(li2, a1);
    			mount_component(calendaricon, a1, null);
    			append_dev(ul, t3);
    			append_dev(ul, li3);
    			append_dev(li3, a2);
    			mount_component(usericon, a2, null);
    			append_dev(ul, t4);
    			append_dev(ul, li4);
    			append_dev(li4, a3);
    			mount_component(pluscircleicon, a3, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(homeicon.$$.fragment, local);
    			transition_in(calendaricon.$$.fragment, local);
    			transition_in(usericon.$$.fragment, local);
    			transition_in(pluscircleicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(homeicon.$$.fragment, local);
    			transition_out(calendaricon.$$.fragment, local);
    			transition_out(usericon.$$.fragment, local);
    			transition_out(pluscircleicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_component(homeicon);
    			destroy_component(calendaricon);
    			destroy_component(usericon);
    			destroy_component(pluscircleicon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nav', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		HomeIcon,
    		CalendarIcon,
    		UserIcon,
    		PlusCircleIcon
    	});

    	return [];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\pages\dashboard.svelte generated by Svelte v3.44.3 */

    const file$3 = "src\\pages\\dashboard.svelte";

    function create_fragment$3(ctx) {
    	let t0;
    	let h1;
    	let t1;
    	let t2_value = /*data*/ ctx[0].username + "";
    	let t2;
    	let t3;
    	let t4;
    	let p;
    	let t5;
    	let t6_value = /*data*/ ctx[0].color + "";
    	let t6;
    	let t7;
    	let t8;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			t0 = space();
    			h1 = element("h1");
    			t1 = text("Hello, ");
    			t2 = text(t2_value);
    			t3 = text("!");
    			t4 = space();
    			p = element("p");
    			t5 = text("Your favorite color is ");
    			t6 = text(t6_value);
    			t7 = text("!");
    			t8 = space();
    			img = element("img");
    			add_location(h1, file$3, 20, 0, 414);
    			add_location(p, file$3, 21, 0, 448);
    			if (!src_url_equal(img.src, img_src_value = "https://unsplash.com/photos/ZdOW9Qd8mQo/download?ixid=MnwxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNjQwMjc2MTI4&force=true&w=640")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$3, 22, 0, 493);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(h1, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t5);
    			append_dev(p, t6);
    			append_dev(p, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1 && t2_value !== (t2_value = /*data*/ ctx[0].username + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*data*/ 1 && t6_value !== (t6_value = /*data*/ ctx[0].color + "")) set_data_dev(t6, t6_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dashboard', slots, []);
    	var loggedIn = true;

    	var data = {
    		username: "default",
    		isManager: false,
    		isTester: false,
    		isAdmin: false,
    		color: "default"
    	};

    	if (loggedIn) {
    		data.username = "ABCDEF";
    		data.isManager = false;
    		data.isTester = true;
    		data.isAdmin = true;
    		data.color = "pink";
    	} else {
    		data.username = undefined;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dashboard> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ loggedIn, data });

    	$$self.$inject_state = $$props => {
    		if ('loggedIn' in $$props) loggedIn = $$props.loggedIn;
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class Dashboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dashboard",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\pages\login.svelte generated by Svelte v3.44.3 */
    const file$2 = "src\\pages\\login.svelte";

    function create_fragment$2(ctx) {
    	let form;
    	let div2;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div0;
    	let input0;
    	let t4;
    	let div1;
    	let input1;
    	let input1_value_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Login";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Sign in via magic link with your email below";
    			t3 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			input1 = element("input");
    			attr_dev(h1, "class", "header");
    			add_location(h1, file$2, 22, 8, 618);
    			attr_dev(p, "class", "description");
    			add_location(p, file$2, 23, 8, 657);
    			attr_dev(input0, "class", "inputField");
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "placeholder", "Your Email");
    			add_location(input0, file$2, 25, 12, 757);
    			add_location(div0, file$2, 24, 8, 738);
    			attr_dev(input1, "type", "submit");
    			attr_dev(input1, "class", "button block");
    			input1.value = input1_value_value = /*loading*/ ctx[0] ? "loading" : "Send magic link";
    			input1.disabled = /*loading*/ ctx[0];
    			add_location(input1, file$2, 33, 11, 970);
    			add_location(div1, file$2, 32, 7, 952);
    			attr_dev(div2, "class", "col-6 form-widget");
    			add_location(div2, file$2, 21, 4, 577);
    			attr_dev(form, "class", "row flex flex-center");
    			add_location(form, file$2, 20, 0, 497);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, p);
    			append_dev(div2, t3);
    			append_dev(div2, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*email*/ ctx[1]);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, input1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(form, "submit", prevent_default(/*handleLogin*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*email*/ 2 && input0.value !== /*email*/ ctx[1]) {
    				set_input_value(input0, /*email*/ ctx[1]);
    			}

    			if (dirty & /*loading*/ 1 && input1_value_value !== (input1_value_value = /*loading*/ ctx[0] ? "loading" : "Send magic link")) {
    				prop_dev(input1, "value", input1_value_value);
    			}

    			if (dirty & /*loading*/ 1) {
    				prop_dev(input1, "disabled", /*loading*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);
    	let loading = false;
    	let email;

    	const handleLogin = async () => {
    		try {
    			$$invalidate(0, loading = true);
    			const { error } = await supabase.auth.signIn({ email });
    			if (error) throw error;
    			alert('Check your email for the login link!');
    		} catch(error) {
    			alert(error.error_description || error.message);
    		} finally {
    			$$invalidate(0, loading = false);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(1, email);
    	}

    	$$self.$capture_state = () => ({ supabase, loading, email, handleLogin });

    	$$self.$inject_state = $$props => {
    		if ('loading' in $$props) $$invalidate(0, loading = $$props.loading);
    		if ('email' in $$props) $$invalidate(1, email = $$props.email);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [loading, email, handleLogin, input0_input_handler];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\pages\profile.svelte generated by Svelte v3.44.3 */
    const file$1 = "src\\pages\\profile.svelte";

    function create_fragment$1(ctx) {
    	let form;
    	let div0;
    	let label0;
    	let t1;
    	let input0;
    	let input0_value_value;
    	let t2;
    	let div1;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let div2;
    	let label2;
    	let t7;
    	let input2;
    	let t8;
    	let div3;
    	let input3;
    	let input3_value_value;
    	let t9;
    	let div4;
    	let button;
    	let t10;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Email";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Name";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Website";
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			div3 = element("div");
    			input3 = element("input");
    			t9 = space();
    			div4 = element("div");
    			button = element("button");
    			t10 = text("Sign Out");
    			attr_dev(label0, "for", "email");
    			add_location(label0, file$1, 72, 8, 1811);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "email");
    			input0.value = input0_value_value = /*$user*/ ctx[3].email;
    			input0.disabled = true;
    			add_location(input0, file$1, 73, 8, 1853);
    			add_location(div0, file$1, 71, 4, 1796);
    			attr_dev(label1, "for", "username");
    			add_location(label1, file$1, 76, 8, 1947);
    			attr_dev(input1, "id", "username");
    			attr_dev(input1, "type", "text");
    			add_location(input1, file$1, 77, 8, 1991);
    			add_location(div1, file$1, 75, 4, 1932);
    			attr_dev(label2, "for", "website");
    			add_location(label2, file$1, 84, 8, 2133);
    			attr_dev(input2, "id", "website");
    			attr_dev(input2, "type", "website");
    			add_location(input2, file$1, 85, 8, 2179);
    			add_location(div2, file$1, 83, 4, 2118);
    			attr_dev(input3, "type", "submit");
    			attr_dev(input3, "class", "button block primary");
    			input3.value = input3_value_value = /*loading*/ ctx[0] ? 'Loading ...' : 'update';
    			input3.disabled = /*loading*/ ctx[0];
    			add_location(input3, file$1, 93, 8, 2320);
    			add_location(div3, file$1, 92, 4, 2305);
    			attr_dev(button, "class", "button block");
    			button.disabled = /*loading*/ ctx[0];
    			add_location(button, file$1, 97, 8, 2468);
    			add_location(div4, file$1, 96, 4, 2453);
    			attr_dev(form, "class", "form-widget");
    			add_location(form, file$1, 70, 0, 1708);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			append_dev(form, t2);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t4);
    			append_dev(div1, input1);
    			set_input_value(input1, /*username*/ ctx[1]);
    			append_dev(form, t5);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t7);
    			append_dev(div2, input2);
    			set_input_value(input2, /*website*/ ctx[2]);
    			append_dev(form, t8);
    			append_dev(form, div3);
    			append_dev(div3, input3);
    			append_dev(form, t9);
    			append_dev(form, div4);
    			append_dev(div4, button);
    			append_dev(button, t10);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[8]),
    					listen_dev(button, "click", /*signOut*/ ctx[6], false, false, false),
    					action_destroyer(/*getProfile*/ ctx[4].call(null, form)),
    					listen_dev(form, "submit", prevent_default(/*updateProfile*/ ctx[5]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$user*/ 8 && input0_value_value !== (input0_value_value = /*$user*/ ctx[3].email) && input0.value !== input0_value_value) {
    				prop_dev(input0, "value", input0_value_value);
    			}

    			if (dirty & /*username*/ 2 && input1.value !== /*username*/ ctx[1]) {
    				set_input_value(input1, /*username*/ ctx[1]);
    			}

    			if (dirty & /*website*/ 4) {
    				set_input_value(input2, /*website*/ ctx[2]);
    			}

    			if (dirty & /*loading*/ 1 && input3_value_value !== (input3_value_value = /*loading*/ ctx[0] ? 'Loading ...' : 'update')) {
    				prop_dev(input3, "value", input3_value_value);
    			}

    			if (dirty & /*loading*/ 1) {
    				prop_dev(input3, "disabled", /*loading*/ ctx[0]);
    			}

    			if (dirty & /*loading*/ 1) {
    				prop_dev(button, "disabled", /*loading*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $user;
    	validate_store(user, 'user');
    	component_subscribe($$self, user, $$value => $$invalidate(3, $user = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Profile', slots, []);
    	let loading = true;
    	let username = null;
    	let website = null;
    	let avatar_url = null;

    	async function getProfile() {
    		try {
    			$$invalidate(0, loading = true);
    			const user = supabase.auth.user();
    			let { data, error, status } = await supabase.from('profiles').select(`username, website, avatar_url`).eq('id', user.id).single();
    			if (error && status !== 406) throw error;

    			if (data) {
    				$$invalidate(1, username = data.username);
    				$$invalidate(2, website = data.website);
    				avatar_url = data.avatar_url;
    			}
    		} catch(error) {
    			alert(error.message);
    		} finally {
    			$$invalidate(0, loading = false);
    		}
    	}

    	async function updateProfile() {
    		try {
    			$$invalidate(0, loading = true);
    			const user = supabase.auth.user();

    			const updates = {
    				id: user.id,
    				username,
    				website,
    				avatar_url,
    				updated_at: new Date()
    			};

    			let { error } = await supabase.from('profiles').upsert(updates, { returning: 'minimal' });
    			if (error) throw error;
    		} catch(error) {
    			alert(error.message);
    		} finally {
    			$$invalidate(0, loading = false);
    		}
    	}

    	async function signOut() {
    		try {
    			$$invalidate(0, loading = true);
    			let { error } = await supabase.auth.signOut();
    			if (error) throw error;
    		} catch(error) {
    			alert(error.message);
    		} finally {
    			$$invalidate(0, loading = false);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Profile> was created with unknown prop '${key}'`);
    	});

    	function input1_input_handler() {
    		username = this.value;
    		$$invalidate(1, username);
    	}

    	function input2_input_handler() {
    		website = this.value;
    		$$invalidate(2, website);
    	}

    	$$self.$capture_state = () => ({
    		user,
    		supabase,
    		loading,
    		username,
    		website,
    		avatar_url,
    		getProfile,
    		updateProfile,
    		signOut,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ('loading' in $$props) $$invalidate(0, loading = $$props.loading);
    		if ('username' in $$props) $$invalidate(1, username = $$props.username);
    		if ('website' in $$props) $$invalidate(2, website = $$props.website);
    		if ('avatar_url' in $$props) avatar_url = $$props.avatar_url;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		loading,
    		username,
    		website,
    		$user,
    		getProfile,
    		updateProfile,
    		signOut,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class Profile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Profile",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.3 */
    const file = "src\\App.svelte";

    // (17:0) {#if $user}
    function create_if_block_1(ctx) {
    	let nav;
    	let current;
    	nav = new Nav({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(17:0) {#if $user}",
    		ctx
    	});

    	return block;
    }

    // (24:4) {:else}
    function create_else_block(ctx) {
    	let login;
    	let current;
    	login = new Login({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(24:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#if $user}
    function create_if_block(ctx) {
    	let dashboard;
    	let current;
    	dashboard = new Dashboard({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(dashboard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dashboard, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dashboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dashboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dashboard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(22:4) {#if $user}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t;
    	let div;
    	let current_block_type_index;
    	let if_block1;
    	let current;
    	let if_block0 = /*$user*/ ctx[0] && create_if_block_1(ctx);
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$user*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			div = element("div");
    			if_block1.c();
    			attr_dev(div, "class", "content");
    			add_location(div, file, 20, 0, 486);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$user*/ ctx[0]) {
    				if (if_block0) {
    					if (dirty & /*$user*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $user;
    	validate_store(user, 'user');
    	component_subscribe($$self, user, $$value => $$invalidate(0, $user = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { url = '' } = $$props;
    	user.set(supabase.auth.user());

    	supabase.auth.onAuthStateChange((_, session) => {
    		user.set(session.user);
    	});

    	const writable_props = ['url'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('url' in $$props) $$invalidate(1, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		supabase,
    		user,
    		Nav,
    		Dashboard,
    		Login,
    		Profile,
    		url,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ('url' in $$props) $$invalidate(1, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$user, url];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { url: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

})(supabaseJs);
//# sourceMappingURL=bundle.js.map
