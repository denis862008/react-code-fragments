import React from 'react';
import PropTypes from 'prop-types';
import Parallax from 'framework/plugins/Parallax';
import { bindAll } from 'framework/libs';
import moment from 'moment';
import './index.styl';

class ModalDateList extends React.Component {
    constructor(props) {
        super(props);

        bindAll(this, [
            'renderContent',
            'handleSelectItem',
            'setDay'
        ]);
    }
    handleSelectItem(event) {
        const { target } = event;
        const isListItem = target.classList.contains('modal-date-list__item');
        const { activeId } = this.props;
        let itemVal;

        if (!isListItem) return;
        if (activeId === 'day') {
            const locale = window.navigator.language;
            const dayNumber = target.innerHTML.split(' ')[0];
            const dayName = moment().locale(locale).day(target.innerHTML.split(' ')[2]).format('dddd');

            itemVal = this.setDay(dayName, dayNumber);
        } else {
            itemVal = target.innerHTML;
        }

        this.props.closeModal();
        this.props.dataSet(activeId, itemVal);
    }
    setDay(name, number) {
        return (
            <div>
                <span>{ number } число</span>
                <span>{ name }</span>
            </div>
        );
    }
    renderContent(item, idx) {
        return (
            <div
                key={idx}
                className='modal-date-list__item'
            >
                { item }
            </div>
        );
    }
    render() {
        const wrapperStyles = {
            left: this.props.posLeft
        };
        const { data } = this.props;

        return (
            <div
                style={wrapperStyles}
                className='modal-date-list'
            >
                <Parallax hide>
                    <div
                        className='modal-date-list__container'
                        onClick={this.handleSelectItem}
                    >
                        { data && data.length ? data.map(this.renderContent) : null }
                    </div>
                </Parallax>
            </div>
        );
    }
}

ModalDateList.propTypes = {
    activeId: PropTypes.string,
    children: PropTypes.node,
    posLeft: PropTypes.string,
    data: PropTypes.array,
    closeModal: PropTypes.func,
    dataSet: PropTypes.func
};

ModalDateList.defaultProps = {};

export default ModalDateList;
