/* global HTML */
// HTML has already been loaded.

// Assert dom element has string representation
function domEq(str, x) {
    if (str !== x.outerHTML) {
        throw new Error(
            'Invalid Assertion: ' + str + ' is not equal to ' + x.outerHTML
        );
    }
}
// Assert two structures are equal.
function deepEq(a, b) {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
        throw new Error(
            'Invalid Assertion: ' +
                JSON.stringify(a, undefined, 4) +
                ' is not equal to ' +
                JSON.stringify(b, undefined, 4)
        );
    }
}

// Simple syntax testing.
domEq('<div></div>', HTML.div());
domEq('<a id="foo"></a>', HTML.a$foo());
domEq('<div class="foo bar"></div>', HTML.div.foo.bar());
domEq('<div id="bar" class="foo"></div>', HTML._.foo$bar());
domEq('<div id="foo"></div>', HTML._$foo());
domEq('<div id="foo"></div>', HTML.$foo());
// Properties.
domEq(
    '<img width="100">',
    HTML.img({
        width: 100,
    })
);
domEq(
    '<div style="border-top-width: 10px;" id="foo"></div>',
    HTML._$foo({
        style: {
            borderTopWidth: '10px',
        },
    })
);
domEq(
    '<div style="border-top-width: 10px;" id="foo"></div>',
    HTML.$foo({
        style: {
            borderTopWidth: '10px',
        },
    })
);
domEq(
    '<div style="left: 100px;"></div>',
    HTML._({
        style: 'left: 100px',
    })
);
domEq(
    '<div data-foo="bar" data-baz="10"></div>',
    HTML._({
        dataFoo: 'bar',
        dataBaz: 10,
    })
);
// Interior elements.
domEq('<div><div></div><p></p></div>', HTML._({}, HTML._(), HTML.p()));
domEq('<div><div></div><p></p></div>', HTML._(HTML._(), HTML.p()));
domEq('<div><div></div><p></p></div>', HTML._({}, [HTML._(), HTML.p()]));
domEq('<div><div></div><p></p></div>', HTML._([HTML._(), HTML.p()]));
// Kebab casing
domEq(
    '<div style="--custom-prop:&quot;custom&quot;;"></div>',
    HTML._({
        style: {
            __customProp: '"custom"',
        },
    })
);
domEq('<div class="foo-bar"></div>', HTML._.fooBar());
domEq('<div id="foo-bar"></div>', HTML._$fooBar());
domEq('<foo-bar></foo-bar>', HTML.fooBar());
// Settings
function fakeH(...args) {
    return args;
}
// Fake h
const FH1 = HTML({
    h: fakeH,
    fixArrays: false,
});
deepEq(['div', {}], FH1._());
deepEq(['div', {}, ['div', {}]], FH1._(FH1._()));
// Combine ids and classes
const FH2 = HTML({
    h: fakeH,
    combineId: true,
    combineClasses: true,
    fixArrays: false,
});
deepEq(['div#a.b.c', {}], FH2._$a.b.c());
// Don't hyphenate; custom text conversion function.
let calledCustom;
const FH3 = HTML({
    h: fakeH,
    fixArrays: false,
    bundleIntoArray: true,
    textConvert: (x) => ['text', `${x}`],
    hyphenate: {
        style: 'custom-vars-only',
        classes: false,
        tag: false,
        id: false,
        data: false,
        custom: (a, b) => (calledCustom = [a, b]),
    },
});
deepEq(
    [
        'fooBar',
        {
            style: { borderTopWidth: '100px', '--custom-prop': 10 },
            dataFoo: 10,
            'data-foo': 13,
            id: 'Placeholder',
            className: 'bazQux',
        },
        [['text', 'abcd']],
    ],
    FH3.fooBar.bazQux$Placeholder(
        {
            style: {
                borderTopWidth: '100px',
                __customProp: 10,
            },
            dataFoo: 10,
            'data-foo': 13,
        },
        'abcd'
    )
);
if (typeof calledCustom[1] !== 'function')
    throw new Error('Invalid toKebabCase.');
deepEq(
    {
        style: { borderTopWidth: '100px', '--custom-prop': 10 },
        dataFoo: 10,
        'data-foo': 13,
        id: 'Placeholder',
        className: 'bazQux',
    },
    calledCustom[0]
);
