mp.events.addCommand('setHouse', (player, _, price, houseClass) => {
    let pos = player.position
    DB.query('INSERT INTO houses SET ownerScId = ?, price = ?, payments = ?, x = ?, y = ?, z = ?, class = ?, status = ?, lockedStatus = ?', [null, parseInt(price), null, pos.x, pos.y, pos.z, houseClass, 1, 1], function(err) {
        if (err) return console.log(err)
    })
    player.notify('Требуется перезапуск ~g~сервера.')
})

mp.events.addCommand('pos', (player) => {
    let pos = player.position
    console.log(`${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)}`)
})

/////////////////////////////////

var mysql = require('mysql')

global.DB = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ragemp'
})

let houses = []
let ids = []

let housesPos = [
    [
        { x: -785.083, y: 323.596, z: 211.997, class: 'high' }
    ],

    [
        { x: 346.491, y: -1012.418, z: -99.196, class: 'medium' }
    ],

    [
        { x: 266.033, y: -1007.094, z: -100.953, class: 'low' }
    ]
]

mp.events.add('packagesLoaded', () => {
    DB.query('SELECT * FROM houses', function(err, res) {
        if (err) {
            console.log(err)
        } else {
            houses.push(res)
        }
    })
})  

mp.events.add('playerReady', (player) => {
    player.position = new mp.Vector3(-1189.982, 291.911, 69.897)
    DB.query('SELECT id FROM houses', [], (err, res) => {
        if (err) return console.log(err)
        for (let i = 0; i < res.length; i++) {
            ids.push(res[i].id)
        }
        player.call('loadHousesObjects::CLIENT', [houses])
        player.call('loadInHouseObjects::CLIENT', [houses, ids])
    })
})

mp.events.add('console_log', (player, arg) => {
    console.log(arg);
})

mp.events.add('sendHouseInfo::SERVER', (player, id) => {
    player.currentId = id
    DB.query('SELECT * FROM houses WHERE id = ?', [id], (err, res) => {
        if (err) {
            console.log(err)
        } else {
            if (res[0].class == 'high') {
                res[0].class = 'Высокий'
            } else if (res[0].class == 'medium') {
                res[0].class = 'Средний'
            } else if (res[0].class == 'low') {
                res[0].class = 'Низкий'
            }

            let ifOwner = (res[0].ownerScId == null) ? res[0].ownerScId = 'Государство' : `${res[0].ownerScId}`
            player.call('executeHouseInfo::CLIENT', [ifOwner, res[0].class, 3, res[0].price])
        }
    })
})

//

mp.events.add('closeHouse::SERVER', (player, id) => {
    DB.query('SELECT ownerScId, lockedStatus FROM houses WHERE id = ?', [id], (err, res) => {
        if (err) return console.log(err)
        if (res[0].ownerScId == player.rgscId) {
            DB.query('UPDATE houses SET lockedStatus = ? WHERE id = ? AND ownerScId = ?', [2, id, player.rgscId])
            if (res[0].lockedStatus == 2) {
                player.notify(`Вы закрыли дом с ID: ${id}`)
                player.call('houseMenuToggle::CLIENT', [false])
            } else {
                player.call('houseMenuToggle::CLIENT', [false])
            }
        } else {
            player.call('houseMenuToggle::CLIENT', [false])
            player.notify('Это не Ваш дом.')
        }
    })
})

mp.events.add('openHouse::SERVER', (player, id) => {
    DB.query('SELECT ownerScId, lockedStatus FROM houses WHERE id = ?', [id], (err, res) => {
        if (err) return console.log(err)
        if (res[0].ownerScId == player.rgscId) {
            DB.query('UPDATE houses SET lockedStatus = ? WHERE id = ? AND ownerScId = ?', [1, id, player.rgscId])
            if (res[0].lockedStatus == 2) {
                player.notify(`Вы открыли дом с ID: ${id}`)
                player.call('houseMenuToggle::CLIENT', [false])
            } else {
                player.call('houseMenuToggle::CLIENT', [false])
            }
        } else {
            player.call('houseMenuToggle::CLIENT', [false])
            player.notify('Это не Ваш дом.')
        }
    })
})

mp.events.add('buyHouse::SERVER', (player, id) => {
    DB.query('SELECT * FROM houses WHERE id = ? AND ownerScId = ?', [id, player.rgscId], (err, res) => {
        if (err) {
            console.log(err)
        } else {
            if (res[0] != undefined && res[0].ownerScId == player.rgscId) {
                player.notify('Это уже Ваш дом.')
                player.call('houseMenuToggle::CLIENT', [false])
            } else if (res[0] != undefined && res[0].ownerScId != player.rgscId) {
                player.notify('Этот дом уже выкуплен.')
                player.call('houseMenuToggle::CLIENT', [false])
            } else {
                mp.players.forEach(player => {
                    player.call('setOwnHouseColor::CLIENT', [id, 59])
                    player.call('setLabelStatus::CLIENT', [id, 'Занят'])
                })
                DB.query('UPDATE houses SET ownerScId = ?, status = ? WHERE id = ?', [player.rgscId, 2, id])
                player.notify('Вы купили дом с ID: ' + id)
                player.call('houseMenuToggle::CLIENT', [false])
            }
        }
    })
})

mp.events.add('sellHouse::SERVER', (player, id) => {
    DB.query('SELECT price, ownerScId FROM houses WHERE id = ?', [id], (err, res) => {
        if (err) {
            console.log(err)
        } else if (res[0].ownerScId == player.rgscId) {
            mp.players.forEach(player => {
                player.call('setOwnHouseColor::CLIENT', [id, 25])
                player.call('setLabelStatus::CLIENT', [id, 'Свободен'])
            })
            DB.query('UPDATE houses SET ownerScId = ?, status = ? WHERE id = ?', [null, 1, id])
            player.call('houseMenuToggle::CLIENT', [false])
            player.notify(`Вы получили за продажу: ${res[0].price * (30 / 100)}$`)
        } else {
            player.notify('Это не Ваш дом.')
            player.call('houseMenuToggle::CLIENT', [false])
        }
    })
})

mp.events.add('enterHouse::SERVER', (player, id) => {
    DB.query('SELECT class, ownerScId, lockedStatus FROM houses WHERE id = ?', [id], (err, res) => {
        if (err) {
            console.log(err)
        } else {
            if (res[0].lockedStatus == 2) {
                player.notify('Этот дом закрыт.')
            } else {
                if (res[0] != undefined) {
                    switch (res[0].class) {
                        case 'high' :
                            player.position = new mp.Vector3(housesPos[0][0].x, housesPos[0][0].y, housesPos[0][0].z)
                            player.dimension = id + 10
                            player.call('houseMenuToggle::CLIENT', [false])
                            player.call('chooseGarageToggle::CLIENT', [false])
                            player.call('unbindEkey::CLIENT')
                            break;
    
                        case 'medium' :
                            player.position = new mp.Vector3(housesPos[1][0].x, housesPos[1][0].y, housesPos[1][0].z)
                            player.dimension = id + 10
                            player.call('houseMenuToggle::CLIENT', [false])
                            player.call('chooseGarageToggle::CLIENT', [false])
                            player.call('unbindEkey::CLIENT')
                            break;
    
                        case 'low' :
                            player.position = new mp.Vector3(housesPos[2][0].x, housesPos[2][0].y, housesPos[2][0].z)
                            player.dimension = id + 10
                            player.call('houseMenuToggle::CLIENT', [false])
                            player.call('chooseGarageToggle::CLIENT', [false])
                            player.call('unbindEkey::CLIENT')
                            break;
                    }
                }
            }
        }
    })
})

mp.events.add({
    'enterGarage::SERVER' : (player, id) => {
        DB.query('SELECT class FROM houses WHERE id = ?', [id], (err, res) => {
            if (err) return console.log(err)
            try {
                switch (res[0].class) {
                    case 'high' :
                        player.position = new mp.Vector3(240.311, -1004.840, -99.000)
                        player.call('chooseBrowserToggle::CLIENT', [false])
                        player.call('chooseGarageToggle::CLIENT', [false])
                        player.call('unbindEkey::CLIENT')
                    break;

                    case 'medium' :
                        player.position = new mp.Vector3(207.239, -999.057, -99.000)
                        player.call('chooseBrowserToggle::CLIENT', [false])
                        player.call('chooseGarageToggle::CLIENT', [false])
                        player.call('unbindEkey::CLIENT')
                    break;

                    case 'low' :
                        player.position = new mp.Vector3(178.793, -1005.373, -99.000)
                        player.call('chooseBrowserToggle::CLIENT', [false])
                        player.call('chooseGarageToggle::CLIENT', [false])
                        player.call('unbindEkey::CLIENT')
                    break;
                }
            } catch(e) {
                console.log(e)
            }
        })
    },

    'enterStreet::SERVER' : (player, id) => {
        DB.query('SELECT x, y, z FROM houses WHERE id = ?', [id], (err, res) => {
            if (err) return console.log(err)
            try {
                player.position = new mp.Vector3(res[0].x, res[0].y, res[0].z)
                player.call('chooseBrowserToggle::CLIENT', [false])
                player.call('chooseGarageToggle::CLIENT', [false])
                player.call('unbindEkey::CLIENT')
                player.dimension = 0
            } catch(e) {
                console.log(e)
            }
        })
    }
})