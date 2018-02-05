/* eslint-disable no-alert,camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import InputMask from 'react-input-mask';
import './index.styl';
import update from 'immutability-helper';
class Register extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleOnChangeInput = this.handleOnChangeInput.bind(this);

        this.state = {
            firstName: '',
            lastName: '',
            email: ''
        };
    }
    componentWillMount() {
        const params = this.props.onPrefillData();

        if (params) {
            this.setState({
                firstName: params.firstName,
                lastName: params.lastName,
                email: typeof params.email === 'undefined' ? '' : params.email
            });
        }
    }
    componentDidMount() {
        this.firstName.focus();
    }
    handleSubmit() {
        const remove = ['+7', '(', ')', ' ', '_', '-'];
        const { firstName: first_name, lastName: last_name, email } = this.state;
        const password = this.validatePassword();
        let phoneValue = this.props.phone;

        if (password === -1) return;

        remove.map(item => {
            phoneValue = phoneValue.split(item).join('');
        });

        this.props.onSubmit({
            first_name,
            last_name,
            phone_number: phoneValue,
            email,
            password
        });
    }
    handleOnChangeInput(event) {
        const { value } = event.target;
        const inputField = event.target.id;

        this.setState(update(this.state, { [inputField]: { $set: value } }));
    }
    verifyPassLength() {
        const value = this.password.value;

        if (value.length < 6) {
            alert('Длина пароля должна составлять не менее 6 символов');
            return false;
        }

        return true;
    }
    verifyPassMatch() {
        if (this.password.value !== this.confirmPassword.value) {
            alert('Пароли не совпадают');
            return false;
        }

        return this.verifyPassNumber();
    }
    verifyPassNumber() {
        const password = Array.from(this.password.value);

        for (let i = 0; i < password.length; i++) {
            const symbol = parseInt(password[i], 10);

            if (!isNaN(symbol)) return true;
        }

        alert('Пароль должен содержать минимум 1 цифру');
        return false;
    }
    verifyPass() {
        const passLength = this.verifyPassLength();

        if (passLength) return this.verifyPassMatch();

        return false;
    }
    validatePassword() {
        const password = this.password.value;
        const confirmPassword = this.confirmPassword.value;

        if (password && confirmPassword) {
            if (!this.verifyPass()) return -1;

            return this.password.value;
        } else if (!password && confirmPassword) {
            alert('Необходимо ввести пароль');
            return -1;
        } else if (password && !confirmPassword) {
            alert('Подтвердите пароль');
            return -1;
        }

        return undefined;
    }
    render() {
        return (

            <div className='Login Register'>
                <div className='row'>
                    <div className='LoginForm col-6'>
                        <label className='col-4 LoginForm__label black' htmlFor='firstName'>
                            Имя <span className='required'>*</span>
                        </label>
                        <input
                            className='col-8 input__phone black'
                            id='firstName'
                            value={this.state.firstName}
                            onChange={this.handleOnChangeInput}
                            ref={inputValue => this.firstName = inputValue}
                        />
                        <div className='login__line col-offset-4 col-8' />
                    </div>
                    <div className='LoginForm col-6'>
                        <label className='col-4 LoginForm__label black' htmlFor='password'>
                            Пароль
                        </label>
                        <input
                            type='password'
                            className='col-8 input__phone black'
                            id='password'
                            ref={inputValue => this.password = inputValue}
                            tabIndex='1'
                        />
                        <div className='login__line col-offset-4 col-8' />
                    </div>
                </div>
                <div className='row'>
                    <div className='LoginForm col-6'>
                        <label className='col-4 LoginForm__label black' htmlFor='lastName'>
                            Фамилия <span className='required'>*</span>
                        </label>
                        <input
                            className='col-8 input__phone black'
                            id='lastName'
                            value={this.state.lastName}
                            onChange={this.handleOnChangeInput}
                            tabIndex='0'
                        />
                        <div className='login__line col-offset-4 col-8' />
                    </div>
                    <div className='LoginForm col-6'>
                        <label className='col-4 LoginForm__label black' htmlFor='confirmPassword'>
                            Подтвердите
                        </label>
                        <input
                            type='password'
                            className='col-8 input__phone black'
                            id='confirmPassword'
                            ref={inputValue => this.confirmPassword = inputValue}
                            tabIndex='1'
                        />
                        <div className='login__line col-offset-4 col-8' />
                    </div>
                </div>
                <div className='row'>
                    <div className='LoginForm col-6'>
                        <label className='col-4 LoginForm__label black' htmlFor='phone'>
                            Телефон <span className='required'>*</span>
                        </label>
                        <InputMask
                            mask='+7(999) 999 99 99'
                            maskChar='_'
                            className='col-8 input__phone black'
                            value={this.props.phone}
                            disabled
                            alwaysShowMask
                            id='phone'
                        />
                        <div className='login__line col-offset-4 col-8' />
                    </div>
                    <div className='LoginForm col-6' />
                </div>
                <div className='row'>
                    <div className='LoginForm col-6'>
                        <label className='col-4 LoginForm__label black' htmlFor='email'>
                            E-mail <span className='required'>*</span>
                        </label>
                        <input
                            className='col-8 input__phone black'
                            id='email'
                            placeholder='your@email'
                            value={this.state.email}
                            onChange={this.handleOnChangeInput}
                            tabIndex='0'
                        />
                        <div className='login__line col-offset-4 col-8' />
                    </div>
                    <div className='LoginForm col-6' />
                </div>
                <div className='row'>
                    <div className='Login__buttons col-6'>
                        <a
                            href='#'
                            className='Login__log black'
                            onClick={this.handleSubmit}
                        >
                            сохранить
                        </a>
                    </div>
                    <div className='Login__buttons col-6'>
                        <a
                            href='#'
                            className='Login__log Register__later black'
                            ref={inputValue => this.fillLater = inputValue}
                        >
                            заполнить позднее
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

Register.propTypes = {
    children: PropTypes.node,
    onSubmit: PropTypes.func,
    phone: PropTypes.string,
    onPrefillData: PropTypes.func
};
Register.defaultProps = {};

export default Register;
