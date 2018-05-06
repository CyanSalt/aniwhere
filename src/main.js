import Vue from 'vue'
import Flux from './plugins/flux'
import I18N from './plugins/i18n'
import Root from './components/root'
import Store from './components/store'

Vue.use(I18N)
Vue.use(Flux, Store)

new Vue(Root)
