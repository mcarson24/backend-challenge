import Vue from 'vue';

import APIComponent from './components/APIComponent.vue';

new Vue({
  el: '#app',
  render: createElement => createElement(APIComponent)
});
