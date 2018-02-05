import React from 'react';
import PropTypes from 'prop-types';
import './index.styl';
import { NavLink } from 'react-router-dom';

class TrainingItemContent extends React.Component {
    render() {
        const { teacherInfo, displayShiftLesson, goal } = this.props;

        if (goal) {
            return (
                <div className='track-item__content__inner'>
                    <div className='target'>
                        { `Цель: ${ goal } баллов` }
                    </div>
                </div>
            );
        }

        return (
            <div className='track-item__content__inner'>
                <div className='skills'>
                    <div className='skills__item'>грамматика</div>
                    <div className='skills__item'>грамматика</div>
                </div>
                { teacherInfo ?
                    <div className='teacher'>
                        <div className='teacher__avatar'><img src={teacherInfo.avatarURL} /></div>
                        <div className='teacher__info'>
                            <div className='teacher__name'>{ teacherInfo.teacherName }</div>
                            <a href='#' className='teacher__about'>О преподавателе</a>
                        </div>
                    </div> : null
                }

                { displayShiftLesson ? <div className='btn btn-black btn-shift-lesson'>перенести урок</div> : ''}
                <div className='btn btn-light-green btn-pay'>оплатить урок</div>
                { displayShiftLesson ? (
                    <div>
                        <NavLink to='/lession' className='btn btn-light-green btn-pay' style={
                            {
                                width: '100%',
                                margin: '10px 0 0 0',
                                textDecoration: 'none'
                            }
                        }
                        >
                            Перейти к уроку
                        </NavLink>
                    </div>
                ) : null}
            </div>
        );
    }
}

TrainingItemContent.propTypes = {
    displayShiftLesson: PropTypes.bool,
    teacherInfo: PropTypes.object,
    goal: PropTypes.any
};

TrainingItemContent.defaultProps = {};

export default TrainingItemContent;
