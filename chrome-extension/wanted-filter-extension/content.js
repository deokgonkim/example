
const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
        if (timeoutId) {
            // console.log('clearing timeout', timeoutId);
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
        // console.log('setting timeout', timeoutId);
    };
}

const highlightSavedItems = () => {
    const site = window.location.hostname;
    const localStorageKey = `${site}_positionIds`;
    chrome.storage.local.get(localStorageKey, (response) => {
        if (!response[localStorageKey]) return;
    
        response[localStorageKey].forEach((positionId) => {
            const wantedEl = document.querySelectorAll(`[data-position-id="${positionId}"]`);
            const jumpitEl = document.querySelectorAll(`a[href="/position/${positionId}"]`);
            if (wantedEl && wantedEl.length > 0) {
                wantedEl.forEach((el) => {
                    console.log(`highlighting positionId: ${positionId}`);
                    el.parentElement.classList.add('highlight');
                });
                // el.classList.add('highlight');
            } else if (jumpitEl && jumpitEl.length > 0) {
                jumpitEl.forEach((el) => {
                    console.log(`highlighting positionId: ${positionId}`);
                    el.parentElement.classList.add('highlight');
                });
                // jumpitEl.classList.add('highlight');
            } else {
                console.log(`positionId: ${positionId} not found`);
            }
        });
    });
}

const debouncedHighlightSavedItems = debounce(highlightSavedItems, 1000);

// Initial call
// highlightSavedItems();
debouncedHighlightSavedItems();

// Observe future DOM updates
const observer = new MutationObserver(() => {
    // highlightSavedItems();
    debouncedHighlightSavedItems();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// document.querySelectorAll('a[data-position-id]').forEach((el, index) => {
//     if (!el.id) {
//         el.id = `position-link-${index}`;
//     }

//     el.addEventListener('contextmenu', () => {
//         console.log('context menu called', el.id);
//         chrome.runtime?.sendMessage?.( { elementId: el.id });
//     });
// });

// message listner
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('message received', request);
    if (request.action === "updateHighLights") {
        const { positionId, onOff } = request;
        const wantedEl = document.querySelectorAll(`[data-position-id="${positionId}"]`);
        const jumpitEl = document.querySelectorAll(`a[href="/position/${positionId}"]`);
        if (wantedEl && wantedEl.length > 0) {
            wantedEl.forEach((el) => {
                if (onOff) {
                    el.parentElement.classList.add('highlight');
                } else {
                    el.parentElement.classList.remove('highlight');
                }
            });
        } else if (jumpitEl && jumpitEl.length > 0) {
            jumpitEl.forEach((el) => {
                if (onOff) {
                    el.parentElement.classList.add('highlight');
                } else {
                    el.parentElement.classList.remove('highlight');
                }
            });
        }
    }
});
