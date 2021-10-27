var house = new Vue({
    el: '#house',
    methods: {
        enterHouse() {
            mp.trigger('enterHouse::CLIENT')
        },

        enterStreet() {
            mp.trigger('enterStreet::CLIENT')
        }
    }
})

