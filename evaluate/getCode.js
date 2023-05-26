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
        const getCodeButton = await getElement('#send_verification_code', 500, 10000);
        if(!getCodeButton) return 'error';

        getCodeButton.click();

        await sleep(2000);

        const codeInput = await getElement('#user_verification_code', 500, 10000);
        if(codeInput) return 'find';

        return 'error'
    }

    return await main();
};