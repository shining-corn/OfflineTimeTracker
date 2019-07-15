import { TYPE, HTML_EVENT } from "./consts.js";

export default class Observable {
    constructor() {
        this.functions = {};

        window.onresize = (() => this.trigger(HTML_EVENT.ON_RESIZE));
    }

    on(event, func) {
        if (typeof this.functions[event] === TYPE.UNDEFINED) {
            this.functions[event] = [];
        }
        this.functions[event].push(func);
    }

    trigger(event, ...args) {
        if (Array.isArray(this.functions[event])) {
            this.functions[event].map((func) => {
                if (func && typeof func === TYPE.FUNCTION) {
                    func(...args);
                }
            });
        }
    }
}
