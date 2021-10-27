let houseColshapes = []
let houseBlips = []
let houseLabels = []
let garageColshapes = []
let garageMarkers = []
let inHouseColshapes = []
let inHouseMarkers = []
let _houses = []
var currentId = null
let localPlayer = mp.players.local

global.console_log = function (msg) {
    mp.events.callRemote('console_log', msg)
}

mp.events.add({
    'loadHousesObjects::CLIENT': (houses) => {
        _houses = houses
        for (let i = 0; i < houses[0].length; i++) {
            let labelStatus = (houses[0][i].status == 1) ? '~b~(Свободен)' : '~r~(Занят)';
            let blipColor = (houses[0][i].status == 2) ? 59 : 25;
            houseBlips.push(mp.blips.new(40, new mp.Vector3(houses[0][i].x, houses[0][i].y, houses[0][i].z),
                {
                    name: `Дом #${i + 1}`,
                    scale: 0.6,
                    color: blipColor,
                    dimension: 0,
                }))

            houseLabels.push(mp.labels.new(`Дом #${i + 1} ${labelStatus}`, new mp.Vector3(houses[0][i].x, houses[0][i].y, houses[0][i].z),
                {
                    los: true,
                    drawDistance: 20,
                    dimension: 0
                }))

            houseColshapes.push(mp.colshapes.newSphere(houses[0][i].x, houses[0][i].y, houses[0][i].z, 1, 0))
        }
    },

    'loadInHouseObjects::CLIENT': (houses, ids) => {
        for (let i = 0; i < houses[0].length; i++) {
            switch (houses[0][i].class) {
                case 'high':
                    inHouseMarkers.push(mp.markers.new(20, new mp.Vector3(-785.083, 323.596, 211.997), 1,
                        {
                            visible: true,
                            dimension: ids[i] + 10
                        }))

                    inHouseColshapes.push(mp.colshapes.newSphere(-785.083, 323.596, 211.997, 1, ids[i] + 10))

                    garageMarkers.push(mp.markers.new(20, new mp.Vector3(240.311, -1004.840, -99.000), 1,
                    {
                        visible: true,
                        dimension: ids[i] + 10
                    }))

                    garageColshapes.push(mp.colshapes.newSphere(240.311, -1004.840, -99.000, 1, ids[i] + 10))
                    break;

                case 'medium':
                    inHouseMarkers.push(mp.markers.new(20, new mp.Vector3(346.491, -1012.418, -99.196), 1,
                        {
                            visible: true,
                            dimension: ids[i] + 10
                        }))

                    inHouseColshapes.push(mp.colshapes.newSphere(346.491, -1012.418, -99.196, 1, ids[i] + 10))

                    garageMarkers.push(mp.markers.new(20, new mp.Vector3(212.012, -999.059, -99.000), 1,
                    {
                        visible: true,
                        dimension: ids[i] + 10
                    }))

                    garageColshapes.push(mp.colshapes.newSphere(212.012, -999.059, -99.000, 1, ids[i] + 10))
                    break;

                case 'low':
                    inHouseMarkers.push(mp.markers.new(20, new mp.Vector3(266.033, -1007.094, -100.953), 1,
                        {
                            visible: true,
                            dimension: ids[i] + 10
                        }))

                    inHouseColshapes.push(mp.colshapes.newSphere(266.033, -1007.094, -100.953, 1, ids[i] + 10))

                    garageMarkers.push(mp.markers.new(20, new mp.Vector3(179.086, -1000.814, -99.000), 1,
                    {
                        visible: true,
                        dimension: ids[i] + 10
                    }))

                    garageColshapes.push(mp.colshapes.newSphere(179.086, -1000.814, -99.000, 1, ids[i] + 10))
                    break;
            }
        }
    }
})

mp.events.add({
    'playerEnterColshape' : (shape) => {
        inHouseColshapes.forEach(el => {
            if (shape == el) {
                mp.keys.bind(0x45, true, () => {
                    mp.events.call('chooseBrowserToggle::CLIENT', true)
                })
            }
        })

        garageColshapes.forEach(el => {
            if (shape == el) {
                mp.keys.bind(0x45, true, () => {
                    mp.events.call('chooseGarageToggle::CLIENT', true)
                })
            }
        })
    }
})

mp.events.add({
    'playerEnterColshape': (shape) => {
        for (var [key, value] of Object.entries(houseColshapes)) {
            if (shape == value) {
                mp.events.call('eKeyToggle::CLIENT', true)
                mp.events.call('bindMainColshape::CLIENT', _houses[0][key].id)
            }
        }
    },

    'playerExitColshape': (shape) => {
        houseColshapes.forEach(colshape => {
            if (shape == colshape) {
                mp.events.call('unbindEkey::CLIENT')
                mp.events.call('eKeyToggle::CLIENT', false)
            }
        })
    }
})

mp.events.add({
    'setOwnHouseColor::CLIENT': (id, color) => {
        houseBlips[id].setColour(parseInt(color))
    },

    'setLabelStatus::CLIENT': (id, status) => {
        switch (status) {
            case 'Свободен':
                houseLabels[id].text = `Дом #${id} ~b~(${status})`
                break
            
            case 'Занят':
                houseLabels[id].text = `Дом #${id} ~r~(${status})`
                break
        }
    }
})

//

mp.events.add('executeHouseInfo::CLIENT', (owner, houseClass, gm, price) => {
    houseMenuBrowser.execute(`house.ownerName = '${owner}'`)
    houseMenuBrowser.execute(`house.houseClass = '${houseClass}'`)
    houseMenuBrowser.execute(`house.price = ${price} + '$'`)
})

mp.events.add({
    'bindMainColshape::CLIENT': (id) => {
        mp.keys.bind(0x45, true, () => {
            currentId = id
            mp.events.callRemote('sendHouseInfo::SERVER', currentId)
            mp.events.call('houseMenuToggle::CLIENT', true)
        })
    },

    'unbindEkey::CLIENT': () => {
        mp.keys.unbind(0x45, true)
    }
})

mp.events.add({
    'buyHouse::CLIENT': () => {
        mp.events.callRemote('buyHouse::SERVER', currentId)
    },

    'sellHouse::CLIENT': () => {
        mp.events.callRemote('sellHouse::SERVER', currentId)
    },

    'enterHouse::CLIENT': () => {
        mp.events.callRemote('enterHouse::SERVER', currentId)
    },

    'enterGarage::CLIENT': () => {
        mp.events.callRemote('enterGarage::SERVER', currentId)
    },

    'enterStreet::CLIENT': () => {
        mp.events.callRemote('enterStreet::SERVER', currentId)
    },

    'closeHouse::CLIENT': () => {
        mp.events.callRemote('closeHouse::SERVER', currentId)
    },

    'openHouse::CLIENT': () => {
        mp.events.callRemote('openHouse::SERVER', currentId)
    }
})