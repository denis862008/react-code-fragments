import React from 'react';
import PropTypes from 'prop-types';
import './index.styl';

class SidebarItem extends React.Component {
    render() {
        return (
            <div className='sidebar-item'>
                { this.props.children }
            </div>
        );
    }
}

SidebarItem.propTypes = {
    children: PropTypes.node
};

SidebarItem.defaultProps = {};

export default SidebarItem;
