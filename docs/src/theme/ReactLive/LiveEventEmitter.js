class LiveEventEmitter {
    constructor() {
        this._events = {};
    }

    once(name, listener) {
        if (!this._events[name]) {
            this._events[name] = listener;
        }
    }

    removeListener(name) {
        if (!this._events[name]) {
            throw new Error(`Can't remove the listener. Event "${name}" doesn't exits.`);
        }

        this._events[name] = null;
    }

    emit(name, data) {
        if (!this._events[name]) {
            throw new Error(`Can't emit an event. Event "${name}" doesn't exits.`);
        }

        this._events[name](data);
    }
}

export default LiveEventEmitter;