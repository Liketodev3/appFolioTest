module.exports = async function(answer){
    async function getElement(query, delay = 500, maxAwait = 5000, delayBeforeReturn = 1000) {
        let realAwait = 0;
        return new Promise((resolve) => {
            const setIntervalMy = setInterval(() => {
                const element = document.querySelector(query);
                if (element || realAwait >= maxAwait) {
                    clearInterval(setIntervalMy);
                    setTimeout(() => resolve(element), delayBeforeReturn);
                }
                realAwait += delay;
            }, delay);
        });
    }

    const messageBox = await getElement('.msg-form__contenteditable p');
    if(!messageBox)
        return;

    const event = document.createEvent("Events");
    event.initEvent("input", true, true);
    messageBox.innerText = answer;
    messageBox.parentElement.dispatchEvent(event);
    const sendMessageButton = await getElement('.msg-form__send-button');
    if(!sendMessageButton)
        return;

    sendMessageButton.click();
        return true;
};