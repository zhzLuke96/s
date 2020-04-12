const {
    html,
    reactive,
    useState,
    useBoolean,
    useRequest,
    useSize,
    useHover,
    useVisible,
    useMotion,
    useStyle,
    useEffect,
    Card,
    Button,
    Row,
    Col,
    useResponsive,
    Input,
    Icon,
    useStateMachine,
    useHashRouter,
    GetValue,
    Textarea,
    nextTick
} = herb;

const throttle = (fn, time = 500) => {
    let canRun = true;
    return (...arguments) => {
        if (!canRun) return;
        canRun = false;
        setTimeout(() => {
            fn.apply(this, arguments);
            canRun = true;
        }, time);
    };
}

const debounce = (fn, time = 500) => {
    let timeout = null;
    return (...arguments) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn.apply(this, arguments);
        }, time);
    };
}

const $append = (container) => o => {
    try {
        container.appendChild(o)
    } catch (error) {
        try {
            container.appendChild(o())
        } catch (error) {
            console.error(error)
        }
    }
}

const append = $append(root)

const htmlViewer = ({
    innerHTML
} = {}) => {
    let iframe = null
    let iframeDocument = null

    const {
        styleRef
    } = useStyle({
        "padding": "0",
        "display": "block",
        "margin": "0",
        "border": "0",
        "width": "100%",
    })

    const onload = () => {
        if (!iframe) {
            return
        }
        iframeDocument = iframe.contentDocument
        nextTick(() => {
            iframeDocument.body.innerHTML = ''
            iframeDocument.body.appendChild(GetValue(innerHTML))
        })
    }

    return html `<iframe ref=${[elem => iframe = elem,styleRef]} onload=${onload} ></iframe>`
}

const emptyElement = document.createTextNode('')

const componentViewer = ({
    component
}) => {
    let container = null
    const componentRef = elem => {
        container = elem
        nextTick(() => {
            container.innerHTML = ''
            container.appendChild(GetValue(component) || emptyElement)
        })
    }
    return html `<div ref=${[componentRef]}></div>`
}

const codeMirror = (props = {}) => {
    const {
        initCode
    } = props
    const {
        component
    } = props
    let $textarea = null
    let editor = null

    const defaultCode = initCode || `Button({
    icon: 'search',
    shape: 'circle',
    style: {
        margin: '0.5rem 1rem'
    }
})`

    const evalCode = (code) => {
        let result = null
        try {
            result = eval(`()=>(${code})`)
        } catch (error) {
            return
        }
        if (result instanceof Function) {
            component.v = result
        }
    }
    const oninput = (cm) => {
        const code = cm.getValue()
        evalCode(code)
    }

    evalCode(defaultCode)

    const textareaRef = (elem) => {
        $textarea = elem
        $textarea.value = defaultCode
        useEffect(() => {
            editor = CodeMirror.fromTextArea($textarea, {
                lineNumbers: true,
                mode: "javascript",
                matchBrackets: true,
                readOnly: true,
                lineWrapping: true,
                theme: 'darcula'
            });
            editor.on('change', throttle(oninput))
        })
    }

    return html `<textarea ref=${[textareaRef]}></textarea>`
}

const demoEditor = (props = {}) => {
    const {
        initCode
    } = props
    const component = useState(html ``)

    const {
        styleRef
    } = useStyle({
        ".card-cover": {
            "text-align": "center",
            padding: "2rem"
        },
        '.card-content': {
            padding: "0 !important"
        }
    })

    return Card({
        ref: styleRef,
        style: {
            flex: 1,
            'max-width': '640px',
            width: '80vw',
            margin: '2rem auto',
        },
        content: codeMirror({
            component,
            initCode
        }),
        cover: componentViewer({
            component
        })
    })
}

append(demoEditor())
append(demoEditor({
    initCode: "(()=>{\n\
    const loading = useState(false)\n\
    return html`\n\
    <input\n\
        type='checkbox'\n\
        checked=${() => loading.v}\n\
        onclick=${() => loading.v = !loading.v}\n\
        style=${{\n\
            position: 'absolute',\n\
            left: '50%',\n\
            transform: 'translate(-50%, -100%)',\n\
        }}\n\
    />\n\
    ${Button({\n\
        loading: loading,\n\
        text: 'button',\n\
        style: { margin: '0.5rem 1rem' }\n\
    })}`\n\
})()"
}))

append(demoEditor({
    initCode: "(()=>{\n\
    const loading = useState(false)\n\
    return html`\n\
    <input\n\
        type='checkbox'\n\
        checked=${() => loading.v}\n\
        onclick=${() => loading.v = !loading.v}\n\
        style=${ margin: '0.5rem 1rem' }\n\
    />\n\
    ${Button({\n\
        loading: loading,\n\
        icon: 'search',\n\
        text: 'More...',\n\
        shape: 'round',\n\
        type: 'primary',\n\
        style: { margin: '0.5rem 1rem' }\n\
    })}`\n\
})()"
}))
append(demoEditor({
    initCode: `Input({
    placeholder: 'Group',
    prefix: Icon({ name: 'sentiment_satisfied_alt' }),
    suffix: Icon({
        name: 'search',
        style: { cursor: 'pointer' },
    }),
    style: { margin: '0.5rem 1rem' },
})`
}))
append(demoEditor({
    initCode: "()=>{\n\
    const disabled = useState(true)\n\
    return html`\n\
    <input\n\
        type='checkbox'\n\
        checked=${() => disabled.v}\n\
        onclick=${() => disabled.v = !disabled.v}\n\
    />\n\
    ${Input({\n\
        prefix: '￥',\n\
        suffix: 'RMB',\n\
        type: 'number',\n\
        value: '15.5',\n\
        step: '0.5',\n\
        oninput: e => Number(e.target.value) < 0 ? e.target.value = 0 : void(0),\n\
        style: { margin: '0.5rem 1rem' },\n\
        disabled\n\
    })}`\n\
}"
}))
append(demoEditor({
    initCode: `(() => {
    const visibility = useState(false)
    const {
        styleRef
    } = useStyle({
        opacity: 0.5,
        transition: 'all 0.3s',
        '&:hover': { opacity: 1 }
    })
    return Input({
        placeholder: 'Password',
        type: () => !visibility.v ? 'password' : 'text',
        suffix: () => Icon({
            ref: [styleRef],
            style: { cursor: 'pointer' },
            onclick: () => visibility.v = !visibility.v,
            name: visibility.v ? 'visibility' : 'visibility_off'
        }),
        style: { margin: '0.5rem 1rem' },
    })
})()`
}))