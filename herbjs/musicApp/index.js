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
    nextTick,
    css
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

const addOnceEventListener = (elem, type, callback) => {
    const handler = (...args) => {
        callback(...args)
        elem.removeEventListener(type, handler)
    }
    elem.addEventListener(type, handler)
}
let uploadElement = null
const useFileUpload = () => {
    if (!uploadElement) {
        const fileInput = document.createElement('input')
        fileInput.type = 'file';
        fileInput.multiple = 'multiple';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        uploadElement = fileInput
    }
    return {
        open: (cb) => {
            uploadElement.click()
            if (cb) {
                addOnceEventListener(uploadElement, 'change', cb)
            }
        },
        select: () => {
            return new Promise((resolve, reject) => {
                if (!uploadElement) {
                    resolve(null)
                    return
                }
                try {
                    uploadElement.click()
                    addOnceEventListener(uploadElement, 'change', (e) => {
                        resolve(Array.from(e.target.files))
                    })
                    return
                } catch (error) {
                    reject(error)
                }
                resolve(null)
                return
            })
        }
    }
}

// const globalState = reactive({
//     currentSrc: '',

// })

// const progressWidth = useState(0)

// setInterval(() => {
//     progressWidth.value = Number(Math.random() * 100)
// }, 1000)

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

const progress = (props) => {
    const {
        value = 0, max = 100, min = 0, onchange
    } = props
    const {
        styleRef
    } = useStyle({
        ...css `
        width: 100%;
        border: none;
        border-radius: 9999rem;
        display: block;
        overflow: hidden;
        padding: 0;
        height: 0.4rem;
        background-color: rgba(66, 66, 66, 0.1);
        margin-top: 0.5rem;
        appearance: none;
        -moz-appearance: none;
        -webkit-appearance: none;
        cursor: pointer;
    `,
        '>div': css `
        background-color: #c0779d;
        height: 100%;
        transition: width 0.1s;
    `
    })
    let innerDiv = null;
    const setwidth = () => {
        const val = GetValue(value)
        if (!innerDiv) {
            return
        }
        innerDiv.style.width = ((val - min) / (max - min)).toFixed(4) * 100 + '%';
    }
    useEffect(() => {
        setwidth()
    })
    return html `<div ref=${[styleRef]} onclick=${(e)=>{
        onchange(e.offsetX/e.currentTarget.offsetWidth)
    }}><div ref=${elem=>{
        innerDiv = elem
        setwidth()
    }}></div></div>`
}

const fileNameToBase64Map = new Map()

const getImageBase64FromFile = (file) => {
    var jsmediatags = window.jsmediatags;
    return new Promise((resolve, reject) => {
        const {
            name
        } = file
        if (fileNameToBase64Map.has(name)) {
            resolve(fileNameToBase64Map.get(name))
            return
        }
        jsmediatags.read(file, {
            onSuccess: function (tag) {
                var tags = tag.tags;
                var image = tags.picture;
                if (image) {
                    var base64String = "";
                    for (var i = 0; i < image.data.length; i++) {
                        base64String += String.fromCharCode(image.data[i]);
                    }
                    var base64 = 'data:' + (image.format || 'image/jpeg') + ';base64,' + window.btoa(base64String);
                    fileNameToBase64Map.set(name, base64)
                    resolve(base64)
                } else {
                    fileNameToBase64Map.set(name, '')
                    resolve('')
                }
            },
            onError: reject
        });
    })
}

const Player = () => {
    const {
        styleRef: mainBoxStyle
    } = useStyle(css `
        width: 25rem;
        background: #fff;
        border-radius: 0.5rem;
        box-shadow: 0 15px 20px rgba(0, 0, 0, 0.3);
        height: 4rem;
        position: relative;
    `)
    const {
        styleRef: recordStyle
    } = useStyle({
        ...css `
        position:absolute;
        z-index:15;
        left:1rem;
        height:6rem;
        width:6rem;
        background-color:#FC9;
        border-radius:360px;
        top:-50px;
        box-shadow:0 5px 25px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        animation: 10s linear 0s infinite normal none running loadingCircle; 
    `,
        '>img': css `
        height:6rem;
        width:6rem;
    `,
        '>.kernel': css `
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        height: 1rem;
        width: 1rem;
        background: #fff;
        border-radius: 1rem;
    `
    })
    const {
        styleRef: btnsStyle
    } = useStyle(css `
        position: absolute;
        left: 7rem;
        right: 0;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        height: 4rem;
    `)
    const {
        styleRef: btnStyle
    } = useStyle({
        ...css `
        cursor: pointer;
        color: #ddd;
        font-size: 0.5rem;
        border-radius: 0.25rem;
    `,
        '&:hover': css `
        color: #fff;
        background: #ddd;
    `,
        '.material-icons': css `
        padding: 0.75rem;
        font-size: 1rem;`
    })
    const {
        styleRef: backStyle
    } = useStyle({
        ...css `
        position: absolute;
        top: -4rem;
        left: 0.5rem;
        right: 0.5rem;
        height: 4rem;
        border-radius: 0.5rem;
        background-color: rgba(255, 255, 255, 0.4);
        padding: 0.5rem;
    `,
        '>.inner': {
            'padding-left': '7rem',
            '>span': {
                display: 'block',
                'font-weight': '900'
            },
            '>small': {
                'font-weight': '600',
                color: 'rgba(0,0,0,0.3)'
            }
        }
    })

    const {
        select: fileSelector
    } = useFileUpload()
    const progressPostition = useState(0)
    const isplaying = useState(false)
    const filename = useState('****')
    const coverImage = useState('')

    const changeFile = async (file) => {
        if (!file) {
            return
        }
        filename.v = file ? file.name : '****'

        const backImage = document.querySelector('#backimg>img')

        const base64 = await getImageBase64FromFile(file)
        coverImage.v = base64
        backImage.setAttribute('src', base64)
    }

    if (window.player) {
        window.player.onPlay.listen(() => {
            isplaying.v = true
            changeFile(window.player.current.file)
        })
        window.player.onPause.listen(() => isplaying.v = false)
        window.player.onChange.listen(() => {
            changeFile(window.player.current.file)
        })
        setInterval(() => {
            progressPostition.v = (window.player.position / window.player.duration) * 100
        }, 50)
    }

    return html `<div ref=${[mainBoxStyle]}>
        <div ref=${[backStyle]}>
            <div class='inner'>
                <span class='title-overflow'>${()=>filename.v}</span>
                <small>
                    ${() => {
                        const duration = secondsToHHMMSS(window.player.duration)
                        const position = secondsToHHMMSS(progressPostition.v / 100 * window.player.duration)
                        return `${position}/${duration}`
                    }}
                </small>
                ${progress({
                    value: progressPostition,
                    onchange: (newPostition) => {
                        window.player.position = newPostition * window.player.duration
                    },
                    max: 100,
                    min: 0
                })}
            </div>
        </div>
        <div class="record" ref=${[recordStyle]} style=${()=>({
            'animation-play-state': !isplaying.v ? 'paused' : 'unset',
        })} onclick=${async ()=> {
            const files = await fileSelector()
            if(!window.player && !files && files.length === 0){
                return
            }
            files.forEach(async (file) => {
                await window.player.append(file)
            })
        }}>
            <img src=${coverImage}/>
            <div class="kernel"></div>
        </div>
        <div ref=${[btnsStyle]}>
            <dev ref=${[btnStyle]} onclick=${()=>{
                if(!window.player){
                    return
                }
                window.player.prev()
            }}>
                <span class="material-icons">
                    skip_previous
                </span>
            </dev>
            <dev ref=${[btnStyle]} onclick=${()=>{
                if(!window.player){
                    return
                }
                if(!isplaying.v){
                    window.player.play()
                }else{
                    window.player.pause()
                }
            }}>
                <span class="material-icons">
                    ${() => !isplaying.v ? 'play_arrow' : 'pause'}
                </span>
            </dev>
            <dev ref=${[btnStyle]} onclick=${()=>{
                if(!window.player){
                    return
                }
                window.player.next()
            }}>
                <span class="material-icons">
                    skip_next
                </span>
            </dev>
        </div>
    </div>`
}

const setup = () => {
    const root = document.getElementById('root');
    root.appendChild(Player()())
}


window.onload = setup