import {
    USER_STEP_AUTH_VK, USER_STEP_AUTH_FB, USER_STEP_INPUTPASS, USER_TRAINING_TRACK
} from 'constants/User';

const initialState = {
    token: '',
    userID: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    avatar: '',
    status: null,
    social: null
};

export default function User(state = initialState, action) {
    switch (action.type) {
        case USER_STEP_INPUTPASS:
            return {
                ...state,
                status: USER_STEP_INPUTPASS,
                phone: action.payload
            };
        case USER_STEP_AUTH_VK:
            return {
                ...state,
                status: USER_STEP_AUTH_VK,
                social: action.payload
            };
        case USER_STEP_AUTH_FB:
            return {
                ...state,
                status: USER_STEP_AUTH_FB,
                social: action.payload
            };
        case USER_TRAINING_TRACK:
            return {
                ...state,
                track: action.payload.track
            };
        default:
            return state;
    }
}
