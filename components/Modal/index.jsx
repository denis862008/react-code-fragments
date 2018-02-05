import React from 'react';
import PropTypes from 'prop-types';
import './index.styl';
import Parallax from 'framework/plugins/Parallax';
// import { CSSTransition } from 'react-transition-group';
class Modal extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            exit: false
        };
    }
    handleExiting() {
        this.setState({
            ...this.state,
            exit: true
        });
    }
    render() {
        const { renderCloseBtn } = this.props;

        return (
            <div className='modalContainer'>
                <Parallax
                    exit={this.state.exit}
                    hide
                >
                    <div className='container'>
                        <div className={`modal ${this.props.className}`}>
                            {this.props.title && <div className='modal__title bold'>
                                {this.props.title}
                            </div>
                            }
                            {this.props.children}
                            {
                                renderCloseBtn ?
                                    <a href='#' className='modal__close' onClick={this.props.onClose}/> : null
                            }
                        </div>
                    </div>
                </Parallax>
            </div>
        );
    }
}

Modal.propTypes = {
    className: PropTypes.string,
    title: PropTypes.node,
    children: PropTypes.node,
    onClose: PropTypes.func,
    renderCloseBtn: PropTypes.bool
};
Modal.defaultProps = {
    className: '',
    renderCloseBtn: true
};

export default Modal;
