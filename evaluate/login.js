module.exports = async function(message){
    function sleep(delay){
        return new Promise(resolve => setTimeout(resolve, delay));
    }


    async function awaitToRemoveElement(query){
        return new Promise((resolve) => {
            const setIntervalMy = setInterval(() => {
                const element = document.querySelector(query);
                if(!element){
                    clearInterval(setIntervalMy);
                    resolve(true);
                }
            }, 200);
        });
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

    async function main() {
        if(window.find('Eron Kalda'))
            return 'message-sent';

        await sleep(3000);

        const loginButtons = await getElements('.form-control');

        if(!loginButtons.length)
            return;

        loginButtons[0].value = 'liketodev3@gmail.com';
        loginButtons[1].value = 'Davmark11';

        const loginButton = await getElement('input.btn-primary');
        if(!loginButton)
            return;

        loginButton.click();

        return 'message-sent';
    }

    return await main();
};