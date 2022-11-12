const scheduleTick = () => {
    return setTimeout(() => {
        secondsElapsed += 1;
        postMessage(secondsElapsed);

        timeoutHandle = scheduleTick();
    }, 1000);
};

let secondsElapsed = 0;
let timeoutHandle: NodeJS.Timeout;

onmessage = (event) => {
    const { data } = event;

    if (data === 'start') {
        timeoutHandle = scheduleTick();
    } else {
        clearTimeout(timeoutHandle);
        secondsElapsed = 0;
    }
};

export { };