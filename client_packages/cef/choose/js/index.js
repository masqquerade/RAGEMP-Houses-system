var house = new Vue({
    el: '#house',
    methods: {
        enterGarage() {
            mp.trigger('enterGarage')
        },

        enterGarage() {
            mp.trigger('enterGarage::CLIENT')
        },

        enterStreet() {
            mp.trigger('enterStreet::CLIENT')
        }
    }
})

