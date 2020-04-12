(async () => {
    const unpkgURL = 'https://www.unpkg.com/qrcode@1.4.4/build/qrcode.min.js'

    const usePkg = (src) => new Promise((resolve) => {
        var _script = document.createElement('script');
        _script.setAttribute('type', 'text/javascript');
        _script.setAttribute('src', src);
        document.body.appendChild(_script);

        _script.onload = () => resolve(window.QRCode)
    })

    // -----------------------------------
    const qr = await usePkg(unpkgURL);
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `height: 132px;width: 132px;position: fixed;top: 0;right: 0;`
    canvas.onclick = () => {
        const opacity = Number(canvas.style.opacity) || 1;
        if (isNaN(opacity)) {
            canvas.style.opacity = 0.9
            return
        }
        if (opacity - 0.25 <= 0) {
            canvas.style.display = 'none'
            return
        }
        canvas.style.opacity = opacity - 0.25
    }
    document.body.appendChild(canvas);

    qr.toCanvas(canvas, 'https://www.baidu.com/', function (error) {
        if (error) console.error(error)
        console.log('success!');
    })
})()