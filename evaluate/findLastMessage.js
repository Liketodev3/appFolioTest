module.exports = async function(){
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

    async function getConversationLastMessages(memberName){
        let message = [];
        let messageParts = [];

        const allMessages = await getElements('.msg-s-message-list-content .msg-s-message-list__event');

        console.log(allMessages);

        for (let i = allMessages.length - 1; i > -1; i--) {
            const appAwareLink = allMessages[i].querySelector('.app-aware-link');
            const messageBody = allMessages[i].querySelector('.msg-s-event-listitem__body');


            console.log(messageBody);

            messageParts.unshift(messageBody.textContent.trim());

            if(!appAwareLink)
                continue;

            if(appAwareLink.textContent.trim().startsWith(memberName))
                message = [...messageParts, ...message];
            else
                break;

            messageParts = [];
        }


        console.log(message.join(' '));

        return message.join(' ');
    }

    let memberName = await getElement('#thread-detail-jump-target');
    if(!memberName)
        return '';


    console.log(memberName);

    return await getConversationLastMessages(memberName.textContent.trim());
};