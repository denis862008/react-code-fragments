import React from 'react';
import PropTypes from 'prop-types';
import { bindAll } from 'framework/libs';
import './index.styl';

class TrackItem extends React.Component {
    constructor(props) {
        super(props);

        bindAll(this, [ 'handleClick' ]);
    }
    handleClick(event) {
        this.props.onClick(event);
    }
    render() {
        const {
            data: {
                itemTitle,
                date,
                content,
                renderBtnToggle,
                htmlClassModificator
            },
            colIdx,
            itemId,
            isOpen
        } = this.props;

        return (
            <div className={`track-item ${ htmlClassModificator }`} id={itemId || null} data-track-col={colIdx}>
                <div className='track-item__header'>
                    <div className='fLeft'>
                        <span className='track-item__topic'>{ itemTitle }</span>
                        { date ? <span className='track-item__date'> { date }</span> : null }
                    </div>
                    { renderBtnToggle ?
                        <span
                            className={`btn btn_track-toggle fRight ${ isOpen ?
                                'btn_track-toggle_open' : 'btn_track-toggle_close' }`}
                            onClick={this.handleClick}
                        /> : null }
                </div>
                {
                    content || this.props.children ?
                        <div className={`track-item__content ${ (!isOpen && renderBtnToggle) ? 'hide' : '' }`}>
                            { content || this.props.children }
                        </div> : null
                }
            </div>
        );
    }
}

TrackItem.propTypes = {
    onClick: PropTypes.func,
    isOpen: PropTypes.bool,
    data: PropTypes.any,
    colIdx: PropTypes.number,
    itemId: PropTypes.number,
    children: PropTypes.any
};

TrackItem.defaultProps = {
    section: false
};

export default TrackItem;
