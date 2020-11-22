"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.time = exports.date = exports.datetime = void 0;
function datetime(suffix, base) {
    const dt = base || new Date();
    return `${date(dt)} ${time(dt)}${suffix || ""}`;
}
exports.datetime = datetime;
function date(base) {
    const date = base || new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day}`;
}
exports.date = date;
function time(base) {
    const date = base || new Date();
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    return `${hour < 10 ? "0" : ""}${hour}:${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
}
exports.time = time;
async function delay(delayMs) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, delayMs);
    });
}
exports.delay = delay;
//# sourceMappingURL=datetime.js.map