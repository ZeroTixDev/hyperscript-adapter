<!-- markdownlint-disable no-inline-html no-bare-urls line-length no-trailing-punctuation -->

# Hyperscript-Adapter

This library is a utility for writing HTML in JavaScript in a short syntax. It supports web frameworks that define a `h` or a `createElement` function, such as React.

## Install

Simpily run:

```bash
npm install --save hyperscript-adapter
```

## Loading

Once this library is installed, load the file using a script or requirejs.

Script loading:

```html
<script src="path/to/hyperscript-adapter/index.min.js"></script>
```

Requirejs loading:

```js
requirejs(['path/to/hyperscript-adapter/index.min.js'], HTML => {
    /* Do stuff with HTML */
});
```

If requirejs is loaded before the HTML script, then HTML is exported:

```js
requirejs(['hyperscript-adapter'], HTML => {
    /* Do stuff with HTML */
});
```

## Settings

**Important: Do not override these settings unless you define a custom `h`.**

```js
{
    hyphenate: {
        // Which properties to convert from camelCase to kebab-case.
        style: true, // Includes 'custom-vars-only' to only escape __fooBar as --foo-bar.
        classes: true, // Hyphenate classes. See hyphenate ids below.
        tag: true, // Hyphenate tags. In most cases this should be true for compatibility with web components.
        id: true, // Hyphenate ids: HTML._$fooBar() would be equal to HTML["_$foo-bar"]()
        data: true, // Hyphenate dataFoo to data-foo.
        custom: () => {}, // First argument is the input, second is the toKebabCase function. This allows for custom middleware that gets executed before the call to h.
    },
    textConvert: (x) => document.createTextNode(`${x}`), // The function that is called when an element is text.
    combineId: false, // Whether to call h with the id being combined (tag#foo)
    combineClasses: false, // Whether to call h with the classes being combined (tag.foo.bar)
    fixArrays: true, // Whether to flatten the second argument: HTML._({}, [elem, otherelem]) would be equivalent as HTML._({}, elem, otherelem)
    h: (tag, attrs, ...elements) => {
        // This is the function called at the end.
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
    resolvers: {
        // Functions that resolve names such as the tag name.
        // The second argument is the toKebabCase function, and the third is the entire settings passed in.
        tagResolver: (tag, toKebabCase, opt) =>
            opt.hyphenate.tag ? toKebabCase(tag) : tag,
        idResolver: (id, toKebabCase, opt) =>
            opt.hyphenate.id ? toKebabCase(id) : id,
        classResolver: (cl, toKebabCase, opt) =>
            opt.hyphenate.classes ? toKebabCase(cl) : cl,
    },
}
```

## Usage

It is highly suggested to alias HTML to a shorter variable such as `h`. This is not provided by default as in browsers it may override the normal hyperscript that would be passed into settings.

```js
// Creates a div.
HTML.div()
// Creates a div, with id "foo-bar".
HTML.div$fooBar()
// Creates a div, with classes "foo-bar" and "qux".
HTML.div.fooBar.qux()
// Both at once.
HTML.div$fooBar.bazQux()
// Div shorthand
HTML._()
// Default tag is div: This outputs a div with id "foo-bar" and classes "qux"
HTML.$fooBar.qux()
// Some settings.
HTML.img({
    width: 100,
    style: {
        borderTopWidth: '100px',
    },
})
// Data properties and custom css variables.
HTML.img({
    dataFoo: 'bar',
    style: {
        __customProperty: '100px',
    },
})
// Children
HTML.div(
    HTML.div(),
    HTML.div(),
)
// Children (in array). This is exactly identical to the previous one.
HTML.div([
    HTML.div(),
    HTML.div(),
])
// Custom settings.
const BetterHTML = HTML({
    h: (...args) => args,
    fixArrays: false,
    bundleIntoArray: true,
    textConvert: (x) => ['text', `${x}`],
    hyphenate: {
        style: 'custom-vars-only',
        classes: false,
        tag: false,
        id: false,
        data: false,
    },
});
```

The full usage can be seen in `tests.js`.
