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
    useResponsive,
    useStateMachine,
    useHashRouter,
    GetValue,
    nextTick,
    useValue,
    css,
    useMouse,
} = herb;

const Empty = () => html `<div></div>`

const AppMobile = (content = '', {
    style
} = {}) => {
    const {
        styleRef
    } = useStyle(css `
        display: grid;
        overflow: auto;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(7, 1fr);
        box-sizing: border-box;
        width: 360px;
        height: 640px;
        padding: 1rem;
        margin: 1rem;
        background-color: transparent;
        border-radius: 0.5rem;
        box-shadow: 20px 20px 25px rgba(0, 0, 0, 0.1);
        position: relative;
    `)
    return html `<div ref=${[styleRef]} style=${style}>${content}</div>`
}

const AdjustImage = (src) => {
    return html `<div style=${css`
        width: 100%;
        height: 100%;
        background-image: url(${src});
        background-size: cover;
    `}></div>`
}

const Iframe = (src = '#') => {
    const {
        styleRef
    } = useStyle(css `
        transform: scale(0.5) translate(-50%, -50%);
        height: 200%;
        width: 200%;
    `)
    return html `<iframe src=${src} ref=${styleRef} scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>`
}

const Mobile1 = () => {
    return AppMobile([
        Button('💖', true),
        Empty(),
        Empty(),
        Button('✨', true),
        Span({
            col: 4
        }, Card(Iframe('//player.bilibili.com/player.html?aid=840045372&bvid=BV1P54y1d7oD&cid=171550909&page=1'), {
            style: css `
                height: 400px;
            `,
            border: true
        })),
        Button(html `<span class="material-icons">thumb_up</span>`),
        Button(html `<span class="material-icons">thumb_down</span>`),
        Button(html `<span class="material-icons">thumbs_up_down</span>`),
        Button('硬币'),
        Empty(),
        Empty(),
        Empty(),
        Button('❤'),
    ], {
        style: {
            'background-color': '#f2f3f7'
        }
    })
}


const useRandomUpOrDownNumber = (initial = 10, config = {}) => {
    const {
        max = 100, min = 0
    } = config
    const number = useState(initial)

    let timer = null;
    const nextNumber = () => {
        const base = Math.random() > 0.5 ? -1 : 1;
        const n = Math.floor(Math.random() * 10);
        const next = number.v + (base * n)
        number.v = Math.max(Math.min(next, max), min)

        timer = setTimeout(() => {
            nextNumber()
        }, 300)
    }
    const start = () => {
        nextNumber()
    }
    const stop = () => {
        clearTimeout(timer)
    }
    return {
        number,
        start,
        stop
    }
}

const useAutoIncNumber = (initial = 0) => {
    const number = useState(initial)

    let timer = null;
    const start = () => {
        timer = setInterval(() => {
            number.v += 1
        }, 10)
    }
    const stop = () => {
        clearInterval(timer)
    }
    return {
        number,
        start,
        stop
    }
}

const secondsToHHMMSS = (seconds) => {
    var sec_num = seconds
    if (typeof seconds === 'string') {
        sec_num = parseInt(seconds, 10);
    }
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = Math.floor(sec_num - (hours * 3600) - (minutes * 60));

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    if (hours == 0 || hours == '00') {
        return minutes + ':' + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
}

const useAutoIncTime = (initial = 0) => {
    const {
        number,
        start,
        stop
    } = useAutoIncNumber(initial)
    const time = useState('00:00')
    useEffect(() => {
        time.v = secondsToHHMMSS(number.v)
    })
    return {
        time,
        start,
        stop,
        reset() {
            number.v = 0
        }
    }
}

const rInterval = (callback, delay) => {
    let dateNow = Date.now,
        requestAnimation = window.requestAnimationFrame,
        start = dateNow(),
        stop,
        intervalFunc = () => {
            dateNow() - start < delay || (start += delay, callback());
            stop || requestAnimation(intervalFunc);
        }
    requestAnimation(intervalFunc);
    return () => stop = 1;
}

const useSmoothCounter = (number) => {
    let target = GetValue(number);
    const counter = useState(target);

    let stop = null
    const start = () => {
        if (stop) {
            return;
        }
        const step = (target - counter.v) / 30
        stop = rInterval(() => {
            if (step === 0) {
                stop && stop();
                stop = null;
                return;
            }
            if (step > 0) {
                if (counter.v >= target) {
                    stop && stop();
                    stop = null;
                    return;
                }
            } else {
                if (counter.v <= target) {
                    stop && stop();
                    stop = null;
                    return;
                }
            }
            counter.v += step;
        }, 16)
    }
    useEffect(() => {
        target = GetValue(number)
        start();
    })
    return useValue(counter, count => Math.round(count));
}

const useRandomUpOrDownSmoothCounter = (...args) => {
    const {
        number,
        start,
        stop
    } = useRandomUpOrDownNumber(...args)
    const counter = useSmoothCounter(number)
    return {
        counter,
        start,
        stop
    }
}

const NumberViewer = (icon = 'arrow_back_ios', number = 0, unit = '%', desc = '') => {
    const {
        styleRef
    } = useStyle({
        ...css `
        font-size: 3rem;
        font-weight: 100;
        margin-left: 2rem;
    `,
        '.desc': css `
        font-size: 1rem;
        padding-left: 4rem;
        color: rgba(45, 48, 53, 0.5);
    `,
        '.number': css `
        font-feature-settings: 'tnum';
    `,
        '.material-icons': css `
        width: 3rem;
        font-size: 3rem;
        vertical-align: bottom;
    `
    })
    return html `<div ref=${[styleRef]}>
        <span class="material-icons secondary">
            ${() => icon}
        </span>
        <span class="number">${()=>GetValue(number)}</span>
        <span class="unit">${()=>unit}</span>
        <p class="desc">${()=>desc}</p>
    </div>`
}

/**
 * design: 
 *  https://dribbble.com/shots/10076595-Kettle-App-Concept
 */
const Mobile2 = () => {
    const {
        styleRef: backDiv
    } = useStyle({
        ...css `
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 2rem;
        color: #2d3035;
        background-color: #ecf0f3;
    `,
        '.secondary': css `
            color: #bdbec1;
        `,
        '.main-btn': css `
            width: 200px;
            height: 200px;
            margin: 2rem auto;
            user-select: none;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 200px;
            cursor: pointer;
            box-sizing: border-box;
            transition: box-shadow 0.5s ease;
            box-shadow:  25px 25px 35px #cecfd2, 
                -25px -25px 35px #ffffff;
        `,
        '.main-btn:active': css `
            box-shadow:  0px 0px 0px #cecfd2, 
                -0px -0px 0px #ffffff,
                inset 5px 5px 19px #cecfd2, 
                inset -5px -5px 19px #ffffff;
        `,
        '.main-btn>span': css `
            font-size: 3rem;
            color: #bdbec1;
            transition: transform 0.5s ease, color 0.5s ease;
        `,
        '.main-btn:active>span': css `
            transform: scale(0.9);
            color: #59d9e6;
        `,
        '.message': css `
            margin-top: 2rem;
            width: 100%;
            text-align: center;
            font-weight: 600;
            font-feature-settings: 'tnum';
        `
    })
    const message = useState('Ready!')

    const {
        counter: temperature,
        start: tempStart,
        stop: tempStop
    } = useRandomUpOrDownSmoothCounter(24, {
        max: 99,
        min: 10
    })
    const {
        counter: water,
        start: waterStart,
        stop: waterStop
    } = useRandomUpOrDownSmoothCounter(16, {
        max: 99,
        min: 10
    })
    const waterWarpper = useValue(water, w => (w / 10).toFixed(1), w => Number(w) * 10)

    const {
        time,
        start: timerStart,
        stop: timerStop,
        reset: timerReset
    } = useAutoIncTime()

    return AppMobile(html `<div ref=${[backDiv]}>
        <span class="material-icons secondary" >
            arrow_back_ios
        </span>
        <h1>Kettle</h1>
        ${NumberViewer('ac_unit', temperature, '℃', 'current temp.')}
        ${NumberViewer('waves', waterWarpper, 'L', 'water volume.')}

        <div class='main-btn' onmousedown=${() => {
            tempStart();
            waterStart();
            timerStart();
        }} onmouseup=${() => {
            tempStop();
            waterStop();

            timerStop();
            timerReset();
        }} onmouseleave=${()=>{
            tempStop();
            waterStop();

            timerStop();
            timerReset();
        }}>
            <span class="material-icons">
                power_settings_new
            </span>
        </div>

        <div class="message secondary" style=${() => ({
            color: time.v !== '00:00' ? '#bdbec1' : '#59d9e6'
        })}>${()=> time.v === '00:00' ? message.v : time.v}</div>
    </div>`)
}

const Mobile3 = () => {
    const {
        styleRef: backDiv
    } = useStyle({
        ...css `
        position: absolute;
        overflow: hidden;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 2rem;
        color: #2d3035;
        background-color: #ecf0f3;
        font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;
    `,
        '.secondary,small': css `
        font-weight: 100;
        color: #bdbec1;
    `,
        '> *': css `
        margin-bottom: 2rem;
    `
    }, )

    const soft1 = () => {
        return html `<div style=${css `
    width: 150px;
    height: 150px;
    border-radius: 30px;
    box-shadow:  18px 18px 30px #d1d9e6, 
                -18px -18px 30px #ffffff;
    color: #2d3035;
    background-color: #ecf0f3;
`}></div>`
    }

    const soft2 = () => {
        return html `<div style=${css `
    width: 150px;
    height: 150px;
    border-radius: 30px;
    box-shadow: inset 18px 18px 30px #d1d9e6, 
                inset -18px -18px 30px #ffffff;
    color: #2d3035;
    background-color: #ecf0f3;
`}></div>`
    }

    const attrs2 = Object.entries({
        blur: '30px',
        'X and Y': '18px',
        opacity: '100%',
        color: '#D1D9E6',
    }).map(([k, v]) =>
        html `<span>${k}</span>: <b>${v}</b><br/>`)

    const soft3 = () => {
        return html `<div style=${css `
            width: 150px;
            height: 150px;
            border-radius: 150px;
            box-shadow: inset 18px 18px 30px #d1d9e6, 
                        inset -18px -18px 30px #ffffff;
            color: #2d3035;
            background-color: #ecf0f3;
            display: flex;
            justify-content: center;
            align-items: center;
        `}>
            <div style=${css `
                width: 80px;
                height: 80px;
                border-radius: 100px;
                box-shadow: 18px 18px 30px #d1d9e6, 
                            -18px -18px 30px #ffffff;
                color: #2d3035;
                background-color: #ecf0f3;
            `}></div>
        </div>`
    }

    const attrs3 = Object.entries({
        blur: '30px',
        'X and Y': '-18px',
        opacity: '100%',
        color: '#FFFFFF',
    }).map(([k, v]) =>
        html `<span>${k}</span>: <b>${v}</b><br/>`)

    const row2col = (content = '') => {
        return html `<div style=${css`
        display: flex;
        justify-content: space-between;
    `}>${content}</div>`
    }

    return AppMobile(html `
    <div ref=${[backDiv]}>
    <p>Neumorphism UI Trend 2020</p>
    ${row2col([
        soft1(),
        html`<div>
        <small>DROP SHADOW</small>
        <h3>bg color</h3>
        color: <b>#ECF0F3</b>
    </div>`
    ])}
    ${row2col([
        soft2(),
        html`<div>
        <small>INNER SHADOW</small>
        <h3>shadow 1</h3>
        ${attrs2} </div>`])
    }
    ${row2col([
        soft3(),
        html`<div>
        <small>INNER SHADOW</small>
        <h3>shadow 2</h3>
        ${attrs3} </div>`])
    }
    </div>`)
}


const Mobile4 = () => {
    // #3993fd blue
    // #f20909 red
    // #dc9e00 yellow
    const {
        styleRef: backDiv
    } = useStyle({
        ...css `
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        color: #fff;
        background-color: #3f3f3f;
        font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;
    `,
        '.secondary,small': css `
        font-weight: 100;
        color: #fff;
    `,
        '> *': css `
        margin-bottom: 2rem;
    `
    }, )

    const card = (
        content = '', {
            style
        } = {}) => {
        const {
            styleRef
        } = useStyle({
            ...css `
            border-radius: 15px;
            background: #3f3f3f;
            box-shadow:  5px 5px 10px #262626, 
                        -5px -5px 10px #585858;
        `,
            ...style
        })
        return html `<div ref=${[styleRef]}>${content}</div>`
    }

    const Icon = (icon = 'face') => html `<span class="material-icons flex-center">${() => icon}</span>`
    const topleftBtn = () => {
        return html `<div class='div1'>${card(Icon('dehaze'), {
            style: {width: '50px', height: '50px', display: 'flex', 'justify-content': 'center', 'align-self': 'center'}
        })}</div>`
    }
    const toprightBtn = () => {
        return html `<div class='div3'>${card(Icon('notifications_none'), {
            style: {width: '50px', height: '50px', display: 'flex', 'justify-content': 'center', 'align-self': 'center'}
        })}</div>`
    }
    const topAvatar = () => {
        const style = css `
            width: 80px;
            height: 80px;
            display: flex;
            justify-content: center;
            align-self: center;
            overflow: hidden;
            border: 0.5rem solid transparent;
            box-sizing: border-box;
            border-radius: 50px;
        `
        return html `<div class='div2'>${card(AdjustImage('https://cdn.dribbble.com/users/3701389/avatars/small/b5ae84b42a2ade3d8416bf818aa1ff34.jpg?1560253672'), {
            style,
        })}</div>`
    }
    const dateSelector = () => {
        const style = css `
            width: 100%;
            height: 5.5rem;
        `
        const dates = {
            Mon: 20,
            Tue: 21,
            We: 22,
            Thu: 23,
            Fri: 24,
            Sat: 25,
            Sun: 26
        }
        const btnStyle = css `
            display: flex;
            flex-flow: column;
            align-items: center;
            justify-content: space-evenly;
            color: rgba(255,255,255,0.6);
            background: #2a2a2a;
            width: 2rem;
            box-sizing: border-box;
            margin: 1rem 0;
            border-radius: 10px;
            font-size: 10px;
        `
        const dateBtn = (text, number) => html `<div style=${{...btnStyle, color: number === 23 ? 'rgba(57, 147, 253, 0.8)' : btnStyle.color}}>
            <span><b>${text}</b></span>
            <span>${number.toString && number.toString()}</span>
        </div>`
        const content = html `<div style=${{
            display: 'flex',
            'justify-content': 'space-between',
            'align-self': 'center',
            height: '100%',
            padding: '0 1rem'
        }}>
            ${Icon('keyboard_arrow_left')}
            ${Object.entries(dates).map(([k,v])=> dateBtn(k,v))}
            ${Icon('keyboard_arrow_right')}
        </div>`
        return html `<div class='div4'>${card(content, {
            style,
        })}</div>`
    }
    const panel = (
        className = '',
        content = 'panel', {
            style
        } = {}) => {
        const cardStyle = css `
            width: 100%;
            height: 5.5rem;
        `
        return html `<div class=${className}>${card(content, {
            style: {...cardStyle, ...style},
        })}</div>`
    }

    const panel1 = () => {
        return html `<div>
        today s tasks
        </div>`
    }
    const panel2 = () => {
        return html `<div>
        upcoming cyclic tasks
        </div>`
    }
    const panel3 = () => {
        return html `<div>
        Lists
        </div>`
    }
    const panel4 = () => {
        return html `<div>
        Calendar
        </div>`
    }

    return AppMobile(html `
    <div ref=${[backDiv]} id='mobile4' style=${{ padding: '1rem' }}>
        ${[
            topleftBtn(),
            toprightBtn(),
            topAvatar(),
            dateSelector(),
            panel('div5', panel1, { style: { height: '7rem' } }),
            panel('div6', panel2, { style: { height: '7rem' } }),
            panel('div7', panel3),
            panel('div8', panel4),
        ]}
    </div>`, {
        style: {
            overflow: 'hidden',
        }
    })
}

const Mobile5 = () => {
    return AppMobile(`<div class="flex-center fill">👻整改中👻</div>`)
    // https://dribbble.com/shots/9324927-Models-social-app/attachments/1368688?mode=media
    const background = './transbackimg.png';
    const bodyimg = './transparent.png'

    const {
        styleRef: backDiv
    } = useStyle({
        ...css `
        position: absolute;
        top: 0;
        bottom: 0;
        left: -100px;
        right: -100px;
        color: #fff;
        font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;
        background-image: url('${background}');
        background-size: auto 100%;
        background-position: 100%;
        background-repeat: no-repeat;
        border-radius:
    `,
        '.secondary,small': css `
        font-weight: 100;
        color: #fff;
    `,
        '#juice-body': css `
        position: absolute;
        top: 0;
        bottom: 0;
        left: -100px;
        right: -100px;
        background-image: url('${bodyimg}');
        background-size: auto 100%;
        background-position: 400%;
        background-repeat: no-repeat;
    `
    }, )
    const {
        styleRef: optBackRef
    } = useStyle({
        ...css `
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #f1f3f6;
        border-radius: 0.5rem;
    `
    })
    const mouse = useMouse()
    const {
        isVisibility,
        visibleRef
    } = useVisible()
    const offsetMouse = useValue(mouse, ({
        screenY,
        screenX
    }) => {
        if (!isVisibility()) {
            return {
                deltaY: 0,
                deltaX: 0
            }
        }
        const {
            outerHeight,
            outerWidth
        } = window
        const deltaY = (screenY - outerHeight / 2) / outerHeight / 2
        const deltaX = (screenX - outerWidth / 2) / outerWidth / 2
        return {
            deltaY,
            deltaX
        }
    })

    const body = () => {
        const {
            styleRef
        } = useStyle({
            ...css `
            width: 100%;
            height: 80%;
            border-bottom-right-radius: 5rem;
            border-bottom-left-radius: 5rem;
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            overflow: hidden;
        `
        })
        const descStyle = css `
            position: relative;
            overflow: hidden;
            color: #fff;
            width: 15rem;
            margin-top: 70%;
            margin-left: auto;
            margin-right: auto;
            padding: 1rem;
            -webkit-backdrop-filter: blur(10px);	
            backdrop-filter: blur(10px);	
            border-radius: 1.5rem;
            box-shadow:  15px 15px 29px rgba(0,0,0,0.2);
        `
        const cameraStyle = css `
            position: absolute;
            right: 80px;
            bottom: 235px;
            color: #fff;
            padding: 0.5rem;
            -webkit-backdrop-filter: blur(20px);	
            backdrop-filter: blur(20px);	
            border-radius: 0.5rem;
            box-shadow:  15px 15px 29px rgba(0,0,0,0.2);
        `
        return html `<div ref=${[styleRef]}>
            <div ref=${[backDiv, visibleRef]} id='mobile4' style=${() => {
                return {
                    transform: `translate(${(offsetMouse.v.deltaX || 0) * 100}px, 0px)`,
                }
            }}>
                <div id='juice-body' style=${() => {
                    return {
                        transform: `translate(${((offsetMouse.v.deltaX || 0) * 50).toFixed(2)}px, ${ ((offsetMouse.v.deltaY || 0) * 10).toFixed(2)}px)`,
                    }
                }}></div>
            </div>
            <div style=${descStyle}>
                <h1>阿冷</h1>
                <p style=${{ 'font-size': '14px', 'word-break': 'break-all' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse aliquam tortor quis ante cursus, non cursus dolor malesuada.</p>
            </div>
            <div style=${cameraStyle}>
                <span class="material-icons" style=${{ 'font-size': '2rem' }}>
                    linked_camera
                </span>
            </div>
        </div>`
    }


    const btn = (content = '', style = {}) => {
        const {
            styleRef
        } = useStyle({
            ...css `
            user-select: none;
            cursor: pointer;
            border: 2px solid #f5f6f8;
            padding: 1rem 0.5rem;
            border-radius: 1rem;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1rem;
            font-weight: 600;
            background: #f1f3f6;
            box-shadow:  15px 15px 29px #cfd0d3, 
                        -15px -15px 29px #ffffff;
        `
        })
        return html `<div ref=${[styleRef]} style=${{...style}}>${content}</div>`
    }
    const footer = () => {
        const {
            styleRef
        } = useStyle({
            ...css `
            width: 92%;
            height: 15%;
            background-color: #f1f3f6;
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 1rem;
            border-radius: 0.5rem;
        `
        })
        return html `<div ref=${[styleRef]}>
            ${btn('Skip', { width: '9rem'})}
            ${btn('→', { width: '2rem' })}
        </div>`
    }

    return AppMobile(html `
    <div ref=${[optBackRef]}>
        ${body()}
        ${footer()}
    </div>
    `, {
        style: {
            overflow: 'hidden',
        }
    })
}

const App = () => {
    const {
        styleRef
    } = useStyle(css `
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        color: #99a9c4;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-flow: wrap;
        justify-content: center;
        align-items: center;
        background: #fff;
        overflow: auto;
        position: relative;
    `)

    const body = [
        Mobile1(),
        Mobile2(),
        Mobile3(),
        Mobile4(),
        Mobile5()
    ]

    return html `<div ref=${[styleRef]}>${body}</div>`
}

const setup = () => {
    const root = document.getElementById('root');
    root.appendChild(App()())
}


window.onload = setup

// ------------------------------------------
// ------------------------------------------
// ------------------------------------------
// ------------------------------------------
// ------------------------------------------

const UI_BASE = {
    h: 3
};

const Span = ({
    col,
    row
} = {
    col: 1,
    row: 1
}, content = '') => {
    return html `<div style=${{
        'grid-column': `span ${col}`,
        'grid-rows': `span ${row}`,
    }}>${content}</div>`
}

const useMouseDown = () => {
    const state = useState(false)
    let elemRef = null
    return {
        state,
        ref(elem) {
            elemRef - elem
            elem.addEventListener('mousedown', () => state.v = true)
            elem.addEventListener('mouseup', () => state.v = false)
        }
    }
}

const Button = (content = '', round = false) => {
    const {
        styleRef
    } = useStyle({
        ...css `
        color: #99a9c4;
        box-sizing: border-box;
        overflow: hidden;
        font-weight: bold;
        user-select: none;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 50px;
        max-height: 100%;
        margin: 1rem;
        border-radius: ${round ? '50' : '10'}px;
        transition: all 0.1s ease-out;
        background: #f2f3f7;
        border: 4px solid #f2f3f7;
        box-shadow:  ${UI_BASE.h}px ${UI_BASE.h}px ${UI_BASE.h * 2}px #dadbde, 
                    -${UI_BASE.h}px -${UI_BASE.h}px ${UI_BASE.h * 3}px #ffffff;
    `,
        //     '&:hover': css `
        //     background: linear-gradient(315deg, #dadbde, #ffffff);
        // `,
        '&:active': css `
        background: #f2f3f7;
        box-shadow:  ${UI_BASE.h}px ${UI_BASE.h}px ${UI_BASE.h * 2}px #dadbde, 
                    -${UI_BASE.h}px -${UI_BASE.h}px ${UI_BASE.h * 3}px #ffffff,
                    inset ${UI_BASE.h}px ${UI_BASE.h}px ${UI_BASE.h * 2}px #dadbde, 
                    inset -${UI_BASE.h}px -${UI_BASE.h}px ${UI_BASE.h * 2}px #ffffff;
        `,
    })
    return html `<div ref=${[styleRef]}>${content}</div>`
}

const Input = (props = {}) => {
    const {
        styleRef
    } = useStyle({
        ...css `
        color: #99a9c4;
        box-sizing: border-box;
        outline: none;
        border: 0;
        padding: 0.5rem 1rem;
        height: 50px;
        max-height: 100%;
        margin: 1rem;
        border-radius: 50px;
        background: #f2f3f7;
        box-shadow: inset ${UI_BASE.h}px ${UI_BASE.h}px ${UI_BASE.h * 2}px #dadbde, 
                    inset -${UI_BASE.h}px -${UI_BASE.h}px ${UI_BASE.h * 2}px #ffffff;
    `,
    })
    return html `<input type='text' ref=${[styleRef]} ${props}/>`
}


const Card = (content = '', props = {}) => {
    const {
        border = false,
            style = {},
    } = props
    const {
        styleRef
    } = useStyle({
        ...css `
        color: #99a9c4;
        box-sizing: border-box;
        overflow: hidden;
        font-weight: bold;
        margin: 1rem;
        border-radius: 10px;
        background: #f2f3f7;
        border: 4px solid #f2f3f7;
        box-shadow:  ${UI_BASE.h}px ${UI_BASE.h}px ${UI_BASE.h * 2}px #dadbde, 
                    -${UI_BASE.h}px -${UI_BASE.h}px ${UI_BASE.h * 3}px #ffffff ${
                        border ? `,inset ${UI_BASE.h}px ${UI_BASE.h}px ${UI_BASE.h * 2}px #dadbde, 
                    inset -${UI_BASE.h}px -${UI_BASE.h}px ${UI_BASE.h * 2}px #ffffff` : ''
                    };
    `,
    })
    return html `<div ref=${[styleRef]} style=${style}>${content}</div>`
}