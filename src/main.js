import Vue from 'vue'
import Flux from './plugins/flux'
import I18N from './plugins/i18n'
import FileStorage from './plugins/storage'
import Root from './components/root'
import Store from './components/store'

Vue.use(I18N)
Vue.use(FileStorage)
Vue.use(Flux, Store)

new Vue(Root)
