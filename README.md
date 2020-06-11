# HTML

This library is a utility for writing HTML easier.

## Install

Simpily run:

```bash
npm install --save @implode-nz/html
```

## Loading

Once this library is installed, load the file using a script or requirejs.

Script loading:

```html
<script src="path/to/HTML/index.min.js"></script>
```

Requirejs loading:

```js
requirejs(['path/to/HTML/index.min.js'], HTML => {
    /* Do stuff with HTML */
});
```

If requirejs is loaded before the HTML script, then HTML is exported:

```js
requirejs(['HTML'], HTML => {
    /* Do stuff with HTML */
});
```

## Usage

The full usage is one of these options (with the obvious generalizations):

```js
HTML.element.class1.class2(id, options)([...inner]);
HTML.element.class()(inner);
HTML.element(options, ...inner);
HTML.element(options, inner);
```

Creating a div:

```js
HTML.div()();
```

```js
HTML.div([]);
```

Creating a div with settings:

```js
HTML.div(
    {
        contentEditable: 'true',
        onclick: () => console.log('Clicked')
    },
    []
);
```

Creating a div with interior elements, class `class1`, and id `element`:

```js
HTML.div.class1('element', HTML.span([]));
```
