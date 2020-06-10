/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
/* global define */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        const f = () => {
            const exports = Object.create(null);
            factory(exports);
            return exports;
        };

        define('HTML', f);

        try {
            define(f);
        } catch (e) {}
    } else if (
        typeof exports === 'object' &&
        typeof exports.nodeName !== 'string'
    ) {
        // CommonJS
        if (typeof module === 'object' && typeof module.exports === 'object')
            exports = module.exports = Object.create(null);
        factory(exports);
    } else {
        // Browser globals
        factory((root.HTML = Object.create(null)));
    }
})(typeof self !== 'undefined' ? self : this, function(exports) {
    const htmlTags = [
        'html',
        'base',
        'head',
        'link',
        'meta',
        'style',
        'title',
        'body',
        'address',
        'article',
        'aside',
        'footer',
        'header',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'hgroup',
        'main',
        'nav',
        'section',
        'blockquote',
        'dd',
        'div',
        'dl',
        'dt',
        'figcaption',
        'figure',
        'hr',
        'li',
        'ol',
        'p',
        'pre',
        'ul',
        'a',
        'abbr',
        'b',
        'bdi',
        'bdo',
        'br',
        'cite',
        'code',
        'data',
        'dfn',
        'em',
        'i',
        'kbd',
        'mark',
        'q',
        'rb',
        'rp',
        'rt',
        'rtc',
        'ruby',
        's',
        'samp',
        'small',
        'span',
        'strong',
        'sub',
        'sup',
        'time',
        'u',
        'var',
        'wbr',
        'area',
        'audio',
        'img',
        'map',
        'track',
        'video',
        'embed',
        'iframe',
        'object',
        'param',
        'picture',
        'source',
        'canvas',
        'noscript',
        'script',
        'del',
        'ins',
        'caption',
        'col',
        'colgroup',
        'table',
        'tbody',
        'td',
        'tfoot',
        'th',
        'thead',
        'tr',
        'button',
        'datalist',
        'fieldset',
        'form',
        'input',
        'label',
        'legend',
        'meter',
        'optgroup',
        'option',
        'output',
        'progress',
        'select',
        'textarea',
        'details',
        'dialog',
        'menu',
        'summary',
        'slot',
        'template'
    ];

    function createHTMLElement(tag, classes, ...args) {
        let id;
        let settingsList;
        if (typeof args[0] === 'string') {
            id = args.shift();
        }
        if (Object.prototype.toString.apply(args[0]) === '[object Object]')
            settingsList = args.shift();
        else settingsList = {};
        const functionResult = interior => {
            const element = document.createElement(tag);
            if (id != null) {
                element.id = id;
            }
            classes.forEach(x => element.classList.add(x));
            for (const x in settingsList) {
                if (Object.prototype.hasOwnProperty.call(settingsList, x)) {
                    const current = settingsList[x];
                    if (x === 'style' && typeof current === 'object') {
                        for (const a in current) {
                            if (
                                Object.prototype.hasOwnProperty.call(current, a)
                            ) {
                                element.style[a] = current[a];
                            }
                        }
                    } else element[x] = current;
                }
            }
            for (const x of interior) {
                if (typeof x === 'string') {
                    element.appendChild(document.createTextNode(x));
                } else {
                    element.appendChild(x);
                }
            }
            return element;
        };
        if (args[0] != null) {
            if (Array.isArray(args[0])) return functionResult(args[0]);
            return functionResult(args);
        }
        return functionResult;
    }

    function createTag(tag, ...classes) {
        return new Proxy(() => {}, {
            apply(_, __, args) {
                return createHTMLElement(tag, classes, ...args);
            },
            get(_, prop) {
                return createTag(tag, prop, ...classes);
            }
        });
    }

    for (const x of htmlTags) {
        exports[x] = createTag(x);
    }
});
