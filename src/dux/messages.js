const initialState = {
  messages: []
}

const UPDATE_MESSAGES = 'UPDATE_MESSAGES'


export function updateMessage(data) {
  return {
    type: UPDATE_MESSAGES,
    payload: data
  }
}


export default function reducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_MESSAGES:
      return state.push(action.payload)
    default:
      return state
  }
}