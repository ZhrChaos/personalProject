import { createStore } from 'redux';
import reducer from './dux/messages'

export default createStore(reducer)