var eKeyBrowser = mp.browsers.new('package://cef/eKey/main.html')
var houseMenuBrowser = mp.browsers.new('package://cef/menu/main.html')
var chooseBrowser = mp.browsers.new('package://cef/choose/main.html')
var chooseGarageBrowser = mp.browsers.new('package://cef/chooseG/main.html')

eKeyBrowser.active = false
houseMenuBrowser.active = false
chooseBrowser.active = false
chooseGarageBrowser.active = false

mp.events.add({
    'eKeyToggle::CLIENT' : (toggle) => {
        eKeyBrowser.active = toggle
    },

    'houseMenuToggle::CLIENT' : (toggle) => {
        houseMenuBrowser.active = toggle
        mp.gui.cursor.show(toggle, toggle)
    },

    'chooseBrowserToggle::CLIENT' : (toggle) => {
        chooseBrowser.active = toggle
        mp.gui.cursor.show(toggle, toggle)
    },

    'chooseGarageToggle::CLIENT' : (toggle) => {
        chooseGarageBrowser.active = toggle
        mp.gui.cursor.show(toggle, toggle)
    }
})