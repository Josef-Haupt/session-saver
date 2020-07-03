const tabs = createPromiseHandler('tabs');
const storage = createPromiseHandler('storage.sync');
const chromeWindow = createPromiseHandler('windows');
const tabSaveKey = "tabs";

async function saveHandler(_) {
    let qtabs = await tabs.query({ currentWindow: true });

    if (!qtabs) {
        return;
    }

    qtabs = qtabs.map(el => {
        return {
            active: el.active,
            url: el.url
        };
    });

    storage.set({ [tabSaveKey]: qtabs });
    window.close(); //closes popup
}

async function loadHandler(_) {
    const result = await storage.get(tabSaveKey);
    
    if (!result) {
        return;
    }

    const savedTabs = result[tabSaveKey];

    if (savedTabs) {
        const win = await chromeWindow.create({ state: 'maximized' });

        for (var i = 0; i < savedTabs.length; i++) {
            const tab = savedTabs[i];
            tabs.create({
                url: tab.url,
                active: tab.active,
                windowId: win.id
            });
            
            //setzt aber den letzten Tab an den Anfang
            //darum
            // tabs().move(currentTab.id, { windowId: win.id, index: -1 });
        }
        //close Schnellwahl, am Ende weil sich das Fenster ohne Tabs wieder schließt
        tabs.remove(win.tabs[0].id);
        window.close(); //closes popup
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById("save-btn");
    saveBtn.addEventListener('click', saveHandler);

    const loadBtn = document.getElementById("load-btn");
    loadBtn.addEventListener('click', loadHandler);
});