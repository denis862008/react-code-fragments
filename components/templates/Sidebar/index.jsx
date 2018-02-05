import React from 'react';
import PropTypes from 'prop-types';
import './index.styl';

class SideBar extends React.Component {
    render() {
        const { position } = this.props;

        return (
            <div className={`sidebar sidebar_${ position }`}>
                { this.props.children }
            </div>
        );
    }
}

SideBar.propTypes = {
    position: PropTypes.string,
    children: PropTypes.node
};

SideBar.defaultProps = {};

export default SideBar;
