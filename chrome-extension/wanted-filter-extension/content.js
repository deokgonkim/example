
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
    chrome.storage.local.get('positionIds', ({ positionIds }) => {
        if (!positionIds) return;
    
        positionIds.forEach((positionId) => {
            const el = document.querySelector(`[data-position-id="${positionId}"]`);
            if (el) {
                console.log(`highlighting positionId: ${positionId}`);
                el.parentElement.classList.add('highlight');
                // el.classList.add('highlight');
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
        const el = document.querySelector(`[data-position-id="${positionId}"]`);
        if (el) {
            if (onOff) {
                el.parentElement.classList.add('highlight');
            } else {
                el.parentElement.classList.remove('highlight');
            }
        }
    }
});
