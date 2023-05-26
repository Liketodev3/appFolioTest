module.exports = async function(code){
    window.set = new Set();

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

    async function main(code) {
        console.log(code);

        const rememberMe = await getElement('#user_remember_my_device');
        if(rememberMe.checked === false)
            rememberMe.click();


        const verificationCodeInput = await getElement('#user_verification_code');
        if(!verificationCodeInput) return 'error';

        verificationCodeInput.value = code;

        const signInButton = await getElement('#sign_in_button');
        if(!signInButton) return 'error';

        signInButton.disabled = false;

        signInButton.click();
    }

    return await main(code);
};
