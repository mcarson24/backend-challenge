import Vue from 'vue';

import APIComponent from './components/APIComponent.vue';

Vue.component('test', APIComponent);

const app = new Vue({
  el: '#app'
});
