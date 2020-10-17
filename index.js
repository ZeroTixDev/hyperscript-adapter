/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
/* global define */

(function (root, factory) {
    const f = () => factory();
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('hyperscript-adapter', f);

        try {
            define(f);
        } catch (e) {}
    } else if (
        typeof exports === 'object' &&
        typeof exports.nodeName !== 'string'
    ) {
        // CommonJS
        if (typeof module === 'object' && typeof module.exports === 'object')
            exports = module.exports = f();
    } else {
        // Browser globals
        root.HTML = f();
    }
})(typeof self !== 'undefined' ? self : this, function factory(_settings = {}) {
    function withDefaults(obj, def) {
        return new Proxy(obj, {
            get(_, prop) {
                const val = obj[prop];
                const defval = def[prop];
                if (val === undefined) {
                    return defval;
                } else if (typeof val === 'object') {
                    return withDefaults(val, defval);
                } else {
                    return val;
                }
            },
        });
    }

    const s = withDefaults(_settings, {
        hyphenate: {
            // Which properties to convert from camelCase to kebab-case.
            style: true, // Includes 'custom-vars-only' to only escape __fooBar as --foo-bar.
            classes: true,
            tag: true, // Due to web components, document.createElement requires the hyphen.
            id: true,
            data: true, // Hyphenate dataFoo to data-foo.
            custom: () => {}, // First argument is the input, second is the toKebabCase function.
        },
        textConvert: (x) => document.createTextNode(`${x}`), // The function that is called when an element is a test. Can be false to use the identity function (x => x).
        combineId: false, // Whether to combine the id with the tag (tag#foo)
        combineClasses: false,
        fixArrays: true,
        bundleIntoArray: false,
        h: (tag, attrs, ...elements) => {
            const element = document.createElement(tag);
            for (const [k, v] of Object.entries(attrs)) {
                if (k === 'style') {
                    const style = element.style;
                    if (typeof v === 'string') {
                        style.cssText = v;
                    } else {
                        for (const [sk, sv] of Object.entries(v)) {
                            style.setProperty(sk, `${sv}`);
                        }
                    }
                } else if (k.startsWith('data-')) {
                    element.setAttribute(k, `${v}`);
                } else element[k] = v;
            }
            elements.forEach((a) => element.appendChild(a)); // This property is adjusted.
            return element;
        },
    });

    function toKebabCase(x) {
        return x
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/_/g, '-')
            .toLowerCase();
    }

    function createHTMLElement(tag, classes, id, attrs = {}, ...elements) {
        // Attrs are passed without modification, so no need to hyphenate those. (Also it screws up `for`)
        if (Object.getPrototypeOf(attrs) !== Object.prototype) {
            // It's not a normal object.
            elements.unshift(attrs);
            attrs = {};
        }
        let combined = tag;
        if (id !== '') {
            if (s.combineId) {
                combined += `#${id}`;
            } else {
                attrs.id = id;
            }
        }
        if (s.combineClasses) {
            combined += classes.map((x) => `.${x}`).join('');
        } else if (classes.length !== 0) {
            attrs.className = classes.join(' ');
        }
        function hyphenateStyles(path) {
            if (typeof path === 'object') {
                for (const [k, v] of Object.entries(path)) {
                    if (
                        s.hyphenate.style !== 'custom-vars-only' ||
                        k.startsWith('__')
                    ) {
                        delete path[k];
                        path[toKebabCase(k)] = v;
                    }
                    hyphenateStyles(v);
                }
            }
        }
        // !== false due to it being 'custom-vars-only'.
        if ('style' in attrs && s.hyphenate.style !== false) {
            hyphenateStyles(attrs.style);
        }
        if (s.hyphenate.data) {
            for (const [k, v] of Object.entries(attrs)) {
                if (k.startsWith('data')) {
                    delete attrs[k];
                    attrs[toKebabCase(k)] = v;
                }
            }
        }
        function fixupNode(x) {
            return typeof x === 'object' ? x : s.textConvert(x);
        }
        s.hyphenate.custom(attrs, toKebabCase);
        const elems = elements.flatMap((x) =>
            Array.isArray(x) && s.fixArrays ? x.map(fixupNode) : [fixupNode(x)]
        );
        return s.h(combined, attrs, ...(s.bundleIntoArray ? [elems] : elems));
    }

    function parseString(str) {
        const regex = /(^\w+)|(\.)(\w+)|(\$)(\w+)/gy;
        let tag = 'div';
        const classes = [];
        let id = '';
        [...str.matchAll(regex)].forEach((x) => {
            x.shift();
            const a = x.filter((a) => a !== undefined);
            a.reverse();
            switch (a[1]) {
                case '.':
                    classes.push(a[0]);
                    break;
                case '$':
                    id = a[0];
                    break;
                default:
                    tag = a[0];
            }
        });
        return [
            tag === '_' ? 'div' : s.hyphenate.tag ? toKebabCase(tag) : tag,
            s.hyphenate.classes ? classes.map(toKebabCase) : classes,
            s.hyphenate.id ? toKebabCase(id) : id,
        ];
    }

    function createTag(str) {
        return new Proxy(() => {}, {
            apply(_, __, args) {
                return createHTMLElement(...parseString(str), ...args);
            },
            get(_, prop) {
                return createTag(str + '.' + prop);
            },
        });
    }

    return new Proxy(() => {}, {
        get(_, tag) {
            return createTag(tag);
        },
        apply(_, __, args) {
            return factory(...args);
        },
    });
});
