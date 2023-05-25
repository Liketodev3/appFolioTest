module.exports = async function(){
    async function getElements(query, delay = 500, maxAwait = 10000, delayBeforeReturn = 500) {
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

    const messageBlocks = await getElements('.msg-conversations-container__conversations-list > li a', 7000, 15000);
    if(!messageBlocks.length)
        return false;

    for(const messageBlock of messageBlocks){
        if(!messageBlock.querySelector('.notification-badge__count'))
            continue;

        messageBlock.click();
        return true;
    }

    return false;
};