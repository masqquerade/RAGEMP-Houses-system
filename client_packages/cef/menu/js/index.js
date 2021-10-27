var house = new Vue({
    el: '#house',
    data: {
        ownerName: '',
        houseClass: '',
        gm: '',
        price: ''
    },
    methods: {
        buyHouse() {
            mp.trigger('buyHouse::CLIENT')
        },

        enterHouse() {
            mp.trigger('enterHouse::CLIENT')
        },

        sellHouse() {
            mp.trigger('sellHouse::CLIENT')
        },

        closeHouse() {
            mp.trigger('closeHouse::CLIENT')
        },
        
        openHouse() {
            mp.trigger('openHouse::CLIENT')
        }
    }
})
