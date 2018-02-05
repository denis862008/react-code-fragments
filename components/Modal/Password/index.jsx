/* eslint-disable no-alert */
import React from 'react';
import PropTypes from 'prop-types';
// import InputMask from 'react-input-mask';
import './index.styl';
class Password extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    componentDidMount() {
        this.focus.querySelector('input').focus();
    }
    handleChange() {
        this.passwordValue = this.password.value;
    }
    handleSubmit(event) {
        event.preventDefault();
        if (!this.passwordValue) {
            alert('Введите пароль');
            return;
        }
        this.props.onSubmit(this.passwordValue);
    }
    render() {
        return (
            <div className='Login'>
                <div className='LoginForm'>
                    <label className='col-4 LoginForm__label black' htmlFor='loginform_password'>
                        Пароль <span className='required'>*</span>
                    </label>
                    <form onSubmit={this.handleSubmit} ref={focus => this.focus = focus}>
                        <input
                            type='password'
                            className='col-8 input__phone black'
                            id='loginform_password'
                            ref={inputValue => this.password = inputValue}
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
                        Отправить
                    </a>
                </div>
            </div>
        );
    }
}

Password.propTypes = {
    children: PropTypes.node,
    onSubmit: PropTypes.func
};
Password.defaultProps = {};

export default Password;
