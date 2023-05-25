

module.exports = async function(message){
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

    async function main() {
        const data = [];
        await sleep(3000);

        const rangeFromInput = await getElement('#filters_received_on_from');
        if(!rangeFromInput)
            return;
        //
        // rangeFromInput.focus();
        // rangeFromInput.value = '05/15/2023';

        const updateButton = await getElement('.report-customization-modal button.btn-primary');
        if(!updateButton)
            return;

        await sleep(7000);

        updateButton.click();

        await sleep(1000);

        const a = await awaitToRemoveElement('.modal__title');

        const r = await getElements('.fixedDataTableRowLayout_body > div:first-child');
        if(!r.length)
            return;


        r.forEach(item => {
            const a = item.querySelector('a');
            if(a)
                window.set.add(a.href);
            item.addEventListener('DOMSubtreeModified', function(e){
                if(e.target.parentElement.nodeName === 'A'){
                    console.log(e.target.parentElement.href);
                    window.set.add(e.target.parentElement.href);
                }
            })
        });

        // const list = await getElements('.fixedDataTableRowLayout_rowWrapper');
        //
        // if(!list.length)
        //     return;
        //
        // list.forEach((row, index) => {
        //     if(index < 2)
        //         return;
        //
        //     data.push({
        //         name: row.querySelector('[columnindex="0"]') ? row.querySelector('[columnindex="0"]').textContent: '',
        //         inquiryReceived: row.querySelector('[columnindex="3"]') ? row.querySelector('[columnindex="3"]').textContent: '',
        //         lastActivity: row.querySelector('[columnindex="4"]') ? row.querySelector('[columnindex="4"]').textContent: '',
        //     });
        // });

        return data;
    }

    return await main();
};
