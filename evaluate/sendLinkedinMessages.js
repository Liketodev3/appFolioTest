module.exports = async function(){

    console.log('okoko');

    function sleep(delay){
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    async function getElement(query, delay = 500, maxAwait = 5000, delayBeforeReturn = 500) {
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

    async function getElements(query, delay = 500, maxAwait = 5000, delayBeforeReturn = 500) {
        let realAwait = 0;
        return new Promise((resolve) => {
            const setIntervalMy = setInterval(() => {
                const element = document.querySelectorAll(query);
                if (element.length || realAwait >= maxAwait) {
                    clearInterval(setIntervalMy);
                    setTimeout(() => resolve(element), delayBeforeReturn);
                }
                realAwait += delay;
            }, delay);
        });
    }

    async function findConnectButtonInActions(){
        let connectButton;
        const menuButtons = await getElements('.pv-top-card-v2-ctas .pvs-profile-actions button', 500, 4000, 1000);

        for(const button of menuButtons) {
            if (button.textContent.trim() === 'Connect'){
                connectButton = button;
                break;
            }
        }

        if(connectButton)
            return connectButton
    }

    async function findConnectButtonInMoreMenu(){
        let connectButton = null;
        const menuBar = await getElement('.pvs-overflow-actions-dropdown__content ul', 500, 5000, 500);
        if(!menuBar) return;

        const actions = menuBar.querySelectorAll("[role='button'] .display-flex");
        if(!actions) return;

        for(const element of actions) {
            if (element.textContent === 'Connect'){
                connectButton = element;
                break;
            }
        }

        return connectButton;
    }

    async function connectToUser() {
        const connectButton = await findConnectButtonInActions() || await findConnectButtonInMoreMenu();
        if(!connectButton) return;

        connectButton.click();
        const choiceOtherButton = await getElement('.artdeco-pill-choice-group [aria-label="Other"]', 500, 4000, 1000);
        if (!choiceOtherButton) return;

        choiceOtherButton.click();
        const sendConnectButton = await getElement('.artdeco-modal__actionbar [aria-label="Connect"]', 500, 4000, 2000);
        if(!sendConnectButton) return;

        sendConnectButton.click();
    }

    async function main() {
        await sleep(3000);

        const authorized = await getElement('.global-nav__me', 500, 5000, 1000);
        if(!authorized) return 'unauthorized';

        await connectToUser();

        const addANote = await getElement('[aria-label="Add a note"]', 500, 4000, 3000);
        if (!addANote) return;

        addANote.click();
        const textArea = await getElement('#custom-message', 500, 4000, 3000);
        if (!textArea) return;

        const event = document.createEvent("Events");
        event.initEvent("change", true, true);
        textArea.value = message;
        textArea.focus();
        textArea.dispatchEvent(event);

        const sendButton = await getElement('[aria-label="Send now"]', 500, 4000, 3000);
        if (!sendButton) return;

        sendButton.click();

        const connectLimitPast = window.find('While there’s a limit to the number of');
        if(connectLimitPast) return 'connect-limit-past';

        return 'message-sent';
    }

    return await main();
};