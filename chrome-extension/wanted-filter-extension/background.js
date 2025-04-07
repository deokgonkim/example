const POSITION_LINK_PATTERN = /https:\/\/www\.wanted\.co.kr\/wd\/\d+/;

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "addToList",
        title: "Add this to the list",
        contexts: ["all"]
    });
    chrome.contextMenus.create({
        id: "removeFromList",
        title: "Remove this from the list",
        contexts: ["all"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const { linkUrl } = info;
    if (!linkUrl || !POSITION_LINK_PATTERN.test(linkUrl)) {
        console.log('not a position link', linkUrl);
        return;
    }
    const positionId = linkUrl.split('/').pop();
    if (info.menuItemId === "addToList" && linkUrl && POSITION_LINK_PATTERN.test(linkUrl)) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (linkUrl, positionId) => {
                console.log('context menu called', linkUrl, positionId);
                if (positionId) {
                    chrome.runtime.sendMessage({
                        action: "savePositionId",
                        positionId,
                    });
                }
            },
            args: [linkUrl, positionId],
        });
    } else if (info.menuItemId === "removeFromList") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (linkUrl, positionId) => {
                console.log('context menu called', linkUrl, positionId);
                if (positionId) {
                    chrome.runtime.sendMessage({
                        action: "removePositionId",
                        positionId,
                    });
                }
            },
            args: [linkUrl, positionId],
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('message', message);
    if (message.action == 'savePositionId') {
        chrome.storage.local.get(['positionIds'], (result) => {
            const current = result.positionIds || [];
            if (!current.includes(message.positionId)) {
                current.push(message.positionId);
                chrome.storage.local.set({ positionIds: current });
            }
        });

        chrome.tabs.sendMessage(sender.tab.id, {
            action: "updateHighLights",
            positionId: message.positionId,
            onOff: true,
        });
    } else if (message.action == 'removePositionId') {
        chrome.storage.local.get(['positionIds'], (result) => {
            const current = result.positionIds || [];
            if (current.includes(message.positionId)) {
                const newPositionIds = current.filter(id => id !== message.positionId);
                chrome.storage.local.set({ positionIds: newPositionIds });
            }
        });

        chrome.tabs.sendMessage(sender.tab.id, {
            action: "updateHighLights",
            positionId: message.positionId,
            onOff: false,
        });
    }
});
