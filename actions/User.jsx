import axios from 'axios';
import moment from 'moment';
import {
    USER_STEP_AUTH_VK, USER_STEP_AUTH_FB, USER_STEP_INPUTPASS, USER_TRAINING_TRACK
} from 'constants/User';
import { API_ENDPOINT } from 'constants/settings';

export function authPass(password) {
    return (dispatch, getState) => {
        const phoneNumber = getState().user.phone;
        const socialApiParams = getState().user.social ? getState().user.social.apiParams : null;
        let paramsReq = { password,  phone_number: phoneNumber };

        if (socialApiParams) {
            paramsReq = { ...paramsReq, ...socialApiParams };
        }

        axios({
            method: 'POST',
            url: `${API_ENDPOINT}/auth`,
            data: {
                ...paramsReq
            }
        }).then((resp) => {
            if (resp && resp.data.error_code === 0) {
                const { is_registered: isRegistered } = resp.data.data;

                if (isRegistered) {
                    const { user, access_token } = resp.data.data;

                    dispatch({
                        type: USER_LOG_IN,
                        payload: {
                            token: access_token,
                            userID: user.user_id,
                            avatar: user.avatar_url,
                            email: user.email,
                            firstName: user.first_name,
                            lastName: user.last_name,
                            phone: user.phone_number,
                            role: user.roles[0]
                        }
                    });
                } else {
                    alert('Ошибка авторизации');
                }
            } else {
                console.error('Error ', resp.data.error_message);
                alert(resp.data.error_message);
            }
        }).catch(error => {
            console.error('Error API', error);
        });
    };
}

export function authVK(params) {
    return (dispatch) => {
        axios({
            method: 'POST',
            url: `${API_ENDPOINT}/auth`,
            data: {
                vk_auth_web: params.token,
                vk_id: params.user.id
            }
        }).then(resp => {
            if (resp && resp.data.error_code === 0) {
                const { is_registered } = resp.data.data;
                const { first_name, last_name } = params.user;

                if (!is_registered) {
                    dispatch({
                        type: USER_STEP_AUTH_VK,
                        payload: {
                            apiParams: {
                                vk_id: params.user.id,
                                vk_auth_web: params.token
                            },
                            dataUser: {
                                firstName: first_name,
                                lastName: last_name,
                                email: params.user.email || ''
                            }
                        }
                    });

                    dispatch({
                        type: USER_STEP_AUTH
                    });
                } else {
                    const { user, access_token } = resp.data.data;

                    dispatch({
                        type: USER_LOG_IN,
                        payload: {
                            token: access_token,
                            userID: user.user_id,
                            avatar: user.avatar_url,
                            email: user.email,
                            firstName: user.first_name,
                            lastName: user.last_name,
                            phone: user.phone_number,
                            role: user.roles[0]
                        }
                    });
                }
            }
        }).catch(error => {
            console.error('Error Authorization', error);
        });
    };
}

export function authFB(params) {
    return (dispatch) => {
        axios({
            method: 'POST',
            url: `${API_ENDPOINT}/auth`,
            data: {
                fb_access_token: params.accessToken,
                fb_id: params.userID
            }
        }).then((resp) => {
            if (resp && resp.data.error_code === 0) {
                const { is_registered } = resp.data.data;

                if (!is_registered) {
                    dispatch({
                        type: USER_STEP_AUTH_FB,
                        payload: {
                            apiParams: {
                                fb_id: params.userID,
                                fb_access_token: params.accessToken
                            },
                            dataUser: {
                                firstName: params.firstName,
                                lastName: params.lastName,
                                email: params.email
                            }
                        }
                    });

                    dispatch({
                        type: USER_STEP_AUTH
                    });
                } else {
                    const { user, access_token } = resp.data.data;

                    dispatch({
                        type: USER_LOG_IN,
                        payload: {
                            token: access_token,
                            userID: user.user_id,
                            avatar: user.avatar_url,
                            email: user.email,
                            firstName: user.first_name,
                            lastName: user.last_name,
                            phone: user.phone_number,
                            role: user.roles[0]
                        }
                    });
                }
            } else {
                console.error('Error code #', resp.data.error_code, ' Message: ', resp.data.error_message);
            }
        }).catch(error => {
            console.error('Error Authorization', error);
        });
    };
}

export function setTrainingTrack() {
    return (dispatch, getState) => {
        axios({
            method: 'GET',
            url: `${API_ENDPOINT}/lesson_events`,
            headers: {
                'authorization': getState().user.token
            }
        }).then((resp) => {
            if (resp && resp.data.error_code === 0) {
                const { events } = resp.data.data;

                events.map(track => {
                    const trackItem = track;
                    const localDate = moment.utc(trackItem.date).toDate();

                    trackItem.date = moment(localDate).format('YYYY-MM-DD HH:mm');
                });

                dispatch({
                    type: USER_TRAINING_TRACK,
                    payload: {
                        track: { events }
                    }
                });
            }
        });
    };
}
