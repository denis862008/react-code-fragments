/* eslint-disable no-alert */
import React from 'react';
import PropTypes from 'prop-types';
import InputMask from 'react-input-mask';
import FacebookLogin from 'react-facebook-login';
import { isEmailAdress } from '../../libs/index';
import './index.styl';
class Login extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleAuthVK = this.handleAuthVK.bind(this);
        this.authFB = this.authFB.bind(this);
        this.vkLogin = this.vkLogin.bind(this);
    }
    componentDidMount() {
        this.focus.querySelector('input').focus();
    }
    handleSubmit(event) {
        event.preventDefault();
        this.props.onSubmit(this.value);
    }
    handleAuthVK(event) {
        event.preventDefault();
        const apiId = 'Your App ID';
        const { VK } = window;
        const btnIsDisabled = event.target.classList.contains('Login__soc-disabled');

        if (!VK) {
            alert('В данный момент отсутствует возможность авторизации через Вконтакте');
            return;
        }

        if (btnIsDisabled) return;

        this.vkBtn.classList.add('Login__soc-disabled');
        VK.init({ apiId });

        const host = window.location.origin;
        const pathName = '/vk-login.html';
        const redirectURI = host + pathName;
        const url = `https://oauth.vk.com/authorize?client_id=${ apiId }&display=page&redirect_uri=${ redirectURI }&scope=email&response_type=token&v=5.71`;
        let newTab = null;
        let timeExpired = false;
        let hash = null;
        let email = null;

        newTab = window.open(url, 'vk-login', 'width=650,height=370');

        const expiredGetEmailTime = setTimeout(() => {
            timeExpired = true;
        }, 180000);

        const interval = setInterval(() => {
            if (newTab.closed && !email) {
                clearInterval(interval);
                clearTimeout(expiredGetEmailTime);
                this.vkLogin();
            }

            if (timeExpired || email) {
                clearInterval(interval);
                clearTimeout(expiredGetEmailTime);
                if (!newTab.closed) newTab.close();

                this.vkLogin(email);
            }

            if (!timeExpired && !email && !newTab.closed) {
                if (newTab.document.body && newTab.document.body.classList.contains('vk-login')) {
                    hash = newTab.location.hash.substr(1);
                    hash = hash.split('&');
                    email = isEmailAdress(hash[hash.length - 1].split('=')[1]) ? hash[hash.length - 1].split('=')[1] : null;
                    newTab.close();
                }
            }
        }, 1000);
    }
    vkLogin(email = null) {
        const { VK } = window;

        VK.Auth.login((paramsVK) => {
            this.vkBtn.classList.remove('Login__soc-disabled');

            if (paramsVK.status === 'connected') {
                const { expire, mid, secret, sid, sig, user } = paramsVK.session;
                const params = { expire, mid, secret, sid, sig };
                const token = Array.from(Object.keys(params), param => {
                    return `${param}=${params[param]}`;
                }).join('&');

                user.email = email;

                this.props.onSubmitVK({ token, user });
            }
        });
    }
    authFB(resp) {
        const { error } = resp;

        if (!resp.hasOwnProperty('status') && !error) {
            const {
                first_name: firstName,
                last_name: lastName,
                email,
                id: userID,
                accessToken
            } = resp;

            this.props.onSubmitFB({ accessToken, userID, firstName, lastName, email });
        } else {
            return null;
        }
    }
    render() {
        return (
            <div className='Login'>
                <div className='LoginForm'>
                    <label className='col-4 LoginForm__label black' htmlFor='loginform_login'>
                        Телефон <span className='required'>*</span>
                    </label>
                    <form onSubmit={this.handleSubmit} ref={focus => this.focus = focus}>
                        <InputMask
                            mask='+7(999) 999-99-99'
                            maskChar=' '
                            className='col-8 input__phone black'
                            alwaysShowMask
                            id='loginform_login'
                            ref={phone => this.phone = phone}
                            onChange={this.handleChange}
                        />
                    </form>
                    <div className='login__line col-offset-4 col-8' />
                </div>
                <div className='Login__buttons'>
                    <a
                        href='#'
                        className='Login__log black'
                        onClick={this.handleSubmit}
                    >
                        войти
                    </a>
                    { this.props.renderSocialBtns ? (
                        <div>
                            <div className='Login__text bold'>
                                Или войдите<br />через социальные сети
                            </div>
                            <FacebookLogin
                                appId='Your App ID'
                                textButton='войти с помощью Facebook'
                                autoload
                                fields='first_name,last_name,email'
                                cssClass='col-6 bold Login__fb'
                                callback={this.authFB}
                            />
                            <a href='#' className='col-6 bold Login__vk'
                                onClick={this.handleAuthVK}
                                ref={vkVal => this.vkBtn = vkVal}
                            >
                                войти с помощью vk
                            </a>
                            <div className='login__socblock'>&nbsp;</div>
                        </div>
                    ) : ''}
                </div>
            </div>
        );
    }
}

Login.propTypes = {
    children: PropTypes.node,
    onSubmit: PropTypes.func,
    onSubmitVK: PropTypes.func,
    onSubmitFB: PropTypes.func,
    renderSocialBtns: PropTypes.bool
};
Login.defaultProps = {
    renderSocialBtns: true
};

export default Login;
