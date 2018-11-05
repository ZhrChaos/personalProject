const initialState = {
  account: {}
}

const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT'


export function updateAccount(data) {
  return {
    type: UPDATE_ACCOUNT,
    payload: data
  }
}


export default function reducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_ACCOUNT:
      return Object.assign({}, state, { account: action.payload })
    default:
      return state
  }
}