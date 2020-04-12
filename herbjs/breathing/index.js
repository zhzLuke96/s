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
    useEventListener,
    GetValue,
    nextTick,
    useValue,
    css,
    useMouse,
    Stateify,
} = herb;
const delay = ms => new Promise((resolve) => setTimeout(resolve, ms))

const throttle = (fn, time = 500) => {
    let canRun = true;
    return (...args) => {
        if (!canRun) return;
        canRun = false;
        setTimeout(() => {
            fn.apply(null, args);
            canRun = true;
        }, time);
    };
}

const sToHHMMSS = (seconds) => {
    var sec_num = seconds
    if (typeof seconds === 'string') {
        sec_num = parseInt(seconds, 10);
    }
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = Math.floor(sec_num - (hours * 3600) - (minutes * 60));

    if (hours == 0 || hours == '00') {
        if (minutes == 0 || minutes == '00') {
            return seconds + '秒';
        }
        return minutes + '分 ' + seconds + '秒';
    }
    return hours + '小时 ' + minutes + '分 ' + seconds + '秒';
}

const url2elem = new Map();
const useAudioFile = (url) => {
    const audio = getAudioElem(url)
    const start = () => {
        audio.currentTime = 0;
        audio.play();
    }
    const stop = () => {
        audio.pause();
        setTimeout(() => {
            audio.currentTime = 0;
        }, 1)
    }
    const pause = () => {
        audio.pause();
    }
    const setVolume = (n = 1) => audio.volume = n
    return {
        start,
        stop,
        pause,
        setVolume,
        toggle: () => audio.paused ? start() : stop()
    }
    // =================================================================
    function getAudioElem(src) {
        if (!url2elem.has(src)) {
            const audio = document.createElement('audio');
            audio.src = src;
            audio.style.display = 'none';
            url2elem.set(src, audio);
        }
        return url2elem.get(src);
    }
}

const mkArr = length => Array.from({
    length
})

const useMouseDelta = () => {
    const mouse = useMouse()
    const {
        isVisibility,
        visibleRef
    } = useVisible()
    const MouseDelta = useValue(mouse, ({
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
    return {
        MouseDelta,
        visibleRef
    }
}

const useAutoUpNumber = (from = 0, to = 100, ms = 300) => {
    const n = useState(from)
    let timer = null
    const pause = () => {
        if (timer) {
            clearInterval(timer)
        }
    }
    const stop = v => {
        pause()
        n.v = v;
    }
    const raise = (costTime = 1000) => {
        stop(from);
        const step = (to - from) / (costTime / ms)
        const isEnded = (() => {
            if (to > from) {
                return v => v > to
            } else {
                return v => v < to
            }
        })()
        return new Promise((resolve) => {
            timer = setInterval(() => {
                n.v += step;
                if (isEnded(n.v)) {
                    n.v = to
                    pause();
                    resolve();
                }
            }, ms)
        })
    }
    const reduce = (costTime = 1000) => {
        stop(to);
        const step = (to - from) / (costTime / ms)
        const isEnded = (() => {
            if (to > from) {
                return v => v < from
            } else {
                return v => v > from
            }
        })()
        return new Promise((resolve) => {
            timer = setInterval(() => {
                n.v -= step;
                if (isEnded(n.v)) {
                    n.v = from;
                    pause();
                    resolve();
                }
            }, ms)
        })
    }
    return {
        n,
        pause,
        stop,
        raise,
        reduce
    }
}

// -----------------------------------

const dragableModifyNumber = (
    initial = 0, {
        max = Infinity,
        min = -Infinity
    } = {}) => {

    const {
        styleRef
    } = useStyle(css `
            position: relative;
        `)

    const number = Stateify(initial)

    const {
        max: _max,
        min: _min
    } = Math
    const limitNum = useValue(number, undefined, x => _max(min, _min(max, x)))
    const scrollRef = useEventListener('mousewheel', throttle(ev => {
        const delta = ev.wheelDelta
        limitNum.v += delta > 0 ? 1 : -1
    }, 100))
    const promptNumber = () => {
        const value = prompt('新值', limitNum.v)
        if (value === null) {
            return
        }
        limitNum.v = Number(value)
    }

    return html `<div ref=${[scrollRef, styleRef]} onclick=${promptNumber}>${()=>GetValue(limitNum)}</div>`
}

const breather = (base, msg, ref) => {
    const makeCricle = (_, idx = 0) => {
        const {
            styleRef
        } = useStyle(css `
            position: absolute;
            width: 10rem;
            height: 10rem;
            border-radius: 10rem;
            background: linear-gradient(#4f55e2, #73affa);
            transition: all 0.3s;
        `)
        const makeStyle = () => {
            const baseOffset = Number(GetValue(base));
            const offset = 20 * baseOffset + 10
            const [x, y] = [
                [offset, offset],
                [offset, -offset],
                [0, -offset * 1.3],
                [-offset, -offset],
                [-offset, offset],
                [0, offset * 1.3]
            ][idx]
            return css `
                opacity: ${ 1 - (offset / 60) / 3};
                transform: translate(${x.toString()}px,${y.toString()}px) rotate(${(180 * (idx/6)).toString()}deg);
            `
        }
        return html `<div ref=${[styleRef]} style=${makeStyle}></div>`
    }
    const processBar = () => {
        const baseDelay = useValue(base, undefined, undefined, 33.33)
        let barElem = null
        const mkStyle = () => {
            const baseOffset = Number(GetValue(baseDelay));
            if (!barElem) {
                return {}
            }
            const totallen = barElem ? barElem.getTotalLength() : 0;
            return css `stroke-dasharray: ${(totallen * baseOffset).toString()};`
        }
        return html `
<svg width="10rem" height="10rem" style=${css `z-index: 100;`}>
    <circle ref=${e => barElem = e} style=${mkStyle} r="4.7rem" cy="5rem" cx="5rem" stroke-width="0.1rem" stroke="#73affa" stroke-linejoin="round" stroke-linecap="round" fill="none" stroke-dashoffset="0px"  stroke-dasharray="0px" />
</svg>
        `
    }
    const {
        styleRef
    } = useStyle(css `
        position: relative;
        width: 10rem;
        height: 10rem;
        display: flex;
        justify-content: center;
        align-items: center;
    `)
    const {
        styleRef: mainStyleRef
    } = useStyle(css `
        position: absolute;
        width: 10rem;
        height: 10rem;
        border-radius: 10rem;
        background: #fff;
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    `)
    return html `<div ref=${[styleRef, ref]}>
        ${processBar()}
        <div ref=${mainStyleRef}>${() => GetValue(msg)}</div>
        ${mkArr(6).map(makeCricle)}
    </div>`
}

const App = () => {
    const backStyle = {
        ...css `
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        color: #99a9c4;
        max-width: 640px;
        height: 100vh;
        margin: 0 auto;
        background: #fff;
        overflow: auto;
        position: relative;
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        grid-template-rows: repeat(9, 1fr);
        grid-column-gap: 0px;
        grid-row-gap: 0px;
    `,
        ">.div1": css `grid-area:1 / 1 / 2 / 4;`,
        ">.div2": css `grid-area:1 / 4 / 2 / 7;`,
        ">.div3": css `grid-area:2 / 2 / 3 / 6;`,
        ">.div4": css `grid-area:3 / 2 / 6 / 3;`,
        ">.div5": css `grid-area:3 / 5 / 6 / 6;`,
        ">.div6": css `grid-area:3 / 3 / 6 / 5;`,
        ">.div7": css `grid-area:6 / 2 / 8 / 6;`,
        ">.div9": css `grid-area:8 / 1 / 10 / 4;`,
        ">.div10": css `grid-area:8 / 4 / 10 / 7;`,
    }
    const mainControlStyle = {
        ...css `
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            grid-template-rows: repeat(2, 1fr);
            grid-column-gap: 0px;
            grid-row-gap: 0px;
        `,
        ">.div1": css `grid-area: 1 / 1 / 2 / 2;`,
        ">.div2": css `grid-area: 1 / 5 / 2 / 6;`,
        ">.div3": css `grid-area: 1 / 2 / 2 / 5;`,
        ">.div4": css `grid-area: 2 / 1 / 3 / 6;`,
    }
    const {
        styleRef
    } = useStyle({
        ...backStyle,
        ".main-control": mainControlStyle
    })

    const {
        n: breath,
        raise: breathUp,
        reduce: breathDown
    } = useAutoUpNumber(0, 1, 30)

    const muted = useState(false)
    const hu = useAudioFile('./呼.mp3')
    const xi = useAudioFile('./吸.mp3')

    useEffect(() => {
        if (muted.v) {
            hu.setVolume(0);
            xi.setVolume(0);
        } else {
            hu.setVolume(1);
            xi.setVolume(1);
        }
    })

    const breathTimes = useState(6);
    const topMsg = useState('深呼吸是最好的减压方式之一。');
    const resetMsg = () => topMsg.v = '深呼吸是最好的减压方式之一。'

    const actionMsg = useState('')

    const huTime = useState(5000)
    const huSecond = useValue(huTime, ms => ~~(ms / 1000), s => ~~(s * 1000))
    const xiTime = useState(5000)
    const xiSecond = useValue(xiTime, ms => ~~(ms / 1000), s => ~~(s * 1000))

    const startBreath = () => {
        xi.start()
        hu.stop()
        actionMsg.v = '♻️♻️~吸气~♻️♻️'
        return breathUp(Math.max(1000, huTime.v))
    }

    const startUnbreath = () => {
        hu.start()
        xi.stop()
        actionMsg.v = '🐳🐳~呼气~🐳🐳'
        return breathDown(Math.max(1000, xiTime.v))
    }

    let loopRunning = useState(false)
    const startBreathLoop = () => {
        if (loopRunning.v) return;
        loopRunning.v = true;
        let currentTime = 0
        const once = async () => {
            topMsg.v = `呼吸循环 ${'一二三四五六七八九十'.split('')[currentTime]}轮`
            await startBreath()
            await delay(100)
            await startUnbreath()
            await delay(100)
            currentTime++;
            if (currentTime >= breathTimes.v) {
                loopRunning.v = false;
                topMsg.v = `🎉🎉恭喜，你已经完成训练！🎉🎉`
                actionMsg.v = '🎉'
                await delay(2000)
                actionMsg.v = ''
                resetMsg()
                return
            }
            once();
        }
        once();
    }

    const totalCostTime = () => sToHHMMSS((huTime.v + xiTime.v) * breathTimes.v / 1000)

    return html `<div ref=${[styleRef]}>
        <div class="div1 flex-center">
            <h1>呼吸训练</h1>
        </div>
        <div class="dev2 flex-center">
            <span class="material-icons btn-like" onclick=${() => muted.v = !muted.v}>
                ${() => !muted.v ? 'volume_up' : 'volume_off'}
            </span>
        </div>
        <div class="div3 flex-center">${() => topMsg.v }</div>
        <div class="div4 flex-center">...</div>
        <div class="div5 flex-center">...</div>
        <div class="div6 flex-center" style=${() => ({ opacity: loopRunning.v ? 1 : 0.6, transition: 'all 0.3s' })}>
            ${breather(breath, actionMsg)}
        </div>
        <div class="div7 main-control">
            <div class="div1 flex-center btn-like" onclick=${() => (breathTimes.v - 1) && (breathTimes.v -= 1)}>
                <span class="material-icons">
                    remove
                </span>
            </div>
            <div class="div3 text-center">
                <p>${() => breathTimes.v} 周期</p>
                <p>${totalCostTime}</p>
            </div>
            <div class="div2 flex-center btn-like" onclick=${() => breathTimes.v += 1}>
                <span class="material-icons">
                    add
                </span>
            </div>
            <div class="div4 flex-center">
                <button onclick=${startBreathLoop} disabled=${loopRunning}>START</button>
            </div>
        </div>
        <div class="div9 flex-center">
            ${dragableModifyNumber(huSecond, {max:15,min:3})}S 
            <span onclick=${startBreath}>吸气</span>
        </div>
        <div class="div10 flex-center">
            ${dragableModifyNumber(xiSecond, {max:15,min:3})}S 
            <span onclick=${startUnbreath}>呼气</span>
        </div>
    </div>`
}


const setup = () => {
    const root = document.getElementById('root');
    root.appendChild(App()())
}


window.onload = setup