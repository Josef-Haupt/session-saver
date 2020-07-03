function createPromiseHandler(path) {
    return new BrowserHandler(path);
}

class BrowserHandler {

    constructor(path) {
        try {
            this.isChrome = chrome !== undefined;
        } catch {
            this.isChrome = false;
        }

        try {
            this.isFirefox = browser !== undefined;
        } catch {
            this.isFirefox = false;
        }

        const paths = path.split('.');
        let temp = this.resolvePath(paths);

        for (const key in temp) {
            if (temp.hasOwnProperty(key)) {
                const element = temp[key];
                
                if (typeof element === 'function') {
                    this[key] = async (arg) => this.promisify(paths, arg, key);
                }
            }
        }
    }

    resolvePath(path) {
        let temp = this.isChrome ? chrome : browser;

        for (const p of path) {
            temp = temp[p]
        }

        return temp;
    }

    async promisify(path, arg, call) {
        if (this.isFirefox) {
            let temp = this.resolvePath(path);
            
            return temp[call](arg);
        }

        if (this.isChrome) {
            let temp = this.resolvePath(path);

            return new Promise(resolve => {
                temp[call](arg, resolve);
            });
        }

        return Promise.reject("Browser not found.");
    }
}