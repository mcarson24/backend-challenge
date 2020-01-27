import Vue from 'vue';

import TestComponent from './components/TestComponent.vue';
// const TestComponent = require('./components/TestComponent.vue').default;

Vue.component('test', TestComponent);

const app = new Vue({
  el: '#app'
});
