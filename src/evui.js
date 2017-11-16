import Chart from './vue/chartT/Chart.vue'
import Grid from './vue/grid/Grid.vue'
import Tree from './vue/tree/Tree.vue'

export default {
    install (Vue, params = {}) {
        Vue.component('Chart', Chart);
        Vue.component('Grid', Grid);
        Vue.component('Tree', Tree);
    }
}
