(() => {
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
    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext || window.oAudioContext;

    const usePlayer = () => {
        const audioContext = new AudioContext()
        let playList = useState([])
        let playIndex = useState(0)

        const emptyNode = {
            file: null,
            offset: 0,
            start: null,
            source: null,
            buffer: null
        }

        return {

        }
    }


    class Dispatcher {
        constructor() {
            this.handlers = []
        }

        listen(handler) {
            this.handlers.push(handler)
        }

        emit(...args) {
            this.handlers.forEach(handler => {
                handler(...args)
            })
        }
    }

    class Player {
        constructor() {
            this.audioContext = new AudioContext()
            this.playList = []
            this.playIndex = 0

            this.emptyNode = {
                file: null,
                offset: 0,
                start: null,
                source: null,
                buffer: null
            }

            this.onPlay = new Dispatcher()
            this.onPause = new Dispatcher()
            this.onChange = new Dispatcher()
            this.onReady = new Dispatcher()
        }

        async readAudioBuffer(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = async evt => {
                    this.audioContext
                        .decodeAudioData(evt.target.result)
                        .then(resolve, reject)
                }
                reader.onerror = reject
                reader.readAsArrayBuffer(file)
            })
        }

        async append(file) {
            const isEmpty = this.isEmpty
            this.playList.push({
                file,
                offset: 0,
                start: null,
                source: null,
                buffer: await this.readAudioBuffer(file)
            })
            if (isEmpty) {
                this.onReady.emit(this)
            }
        }

        play() {
            if (!this.playList.length || this.current.source) {
                return
            }
            const source = this.audioContext.createBufferSource()
            source.buffer = this.current.buffer
            source.onended = this.next.bind(this)
            // source.connect(this.audioContext.destination)

            var gainNode = this.audioContext.createGain()
            gainNode.gain.value = 0.1 // 10 %

            window.volume = gainNode
            source.connect(gainNode)
            gainNode.connect(this.audioContext.destination)

            source.start(0, this.current.offset)
            this.current.source = source
            this.current.start = this.audioContext.currentTime

            this.onPlay.emit(this)
        }

        pause() {
            if (!this.playList.length || !this.current.source) {
                return
            }
            this.current.source.stop(0)
            this.current.source.disconnect(0)
            this.current.source.onended = null
            this.current.source = null
            this.current.offset = this.position
            this.current.start = null

            this.onPause.emit(this)
        }

        stop() {
            this.pause()
            this.current.offset = 0
            this.current.start = null
        }

        next() {
            this.stop()
            this.playIndex++
            if (this.playIndex >= this.playList.length) {
                this.playIndex = 0
            }
            this.play()
            this.onChange.emit(this)
        }

        prev() {
            this.stop()
            this.playIndex--
            if (this.playIndex < 0) {
                this.playIndex = Math.max(this.playList.length - 1, 0)
            }
            this.play()
            this.onChange.emit(this)
        }

        get isEmpty() {
            return this.current === this.emptyNode
        }

        get current() {
            return this.playList[this.playIndex] || this.emptyNode
        }

        get position() {
            if (!this.playList.length) {
                return 0
            }
            return (
                this.current.offset +
                (this.current.start !== null ?
                    this.audioContext.currentTime - this.current.start :
                    0)
            )
        }

        set position(val) {
            if (!this.playList.length) {
                return
            }
            this.stop()
            this.current.offset = val
            this.current.start = null
            this.play()
        }

        get duration() {
            return this.current.buffer ? this.current.buffer.duration : 0.001
        }
    }

    window.player = new Player()
})()