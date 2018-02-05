import React from 'react';
import PropTypes from 'prop-types';
import { bindAll } from 'framework/libs';
import './index.styl';

class InfoModalContent extends React.Component {
    constructor(props) {
        super(props);

        bindAll(this, [
            'handleCallback'
        ]);
    }
    handleCallback() {
        // const { id } = this.props;

        this.props.callback();
    }
    render() {
        const { id, content: { textBody, textSelected, textBtn } } = this.props;

        return (
            <div className='info-modal__wrapper'>
                <div className='info-modal__inner'>
                    <div className={`info-modal__icon info-modal__icon_${ id }`} />
                    <div className='info-modal__content'>
                        <div className='info-modal__content__text__default'>
                            <p>{ textBody }</p>
                        </div>
                        <div className='info-modal__content__text__selected'>
                            <span>{ textSelected }</span>
                        </div>
                    </div>
                </div>
                <div className='btn btn-info' onClick={this.handleCallback}>
                    { textBtn }
                </div>
            </div>
        );
    }
}

InfoModalContent.propTypes = {
    id: PropTypes.string.isRequired,
    content: PropTypes.object.isRequired,
    callback: PropTypes.func.isRequired
};

InfoModalContent.defaultProps = {};

export default InfoModalContent;
