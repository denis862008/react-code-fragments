import React from 'react';
import PropTypes from 'prop-types';
import { bindAll, isEmpty } from 'framework/libs';
import Track from '../templates/Track/index';
import TrainingItemContent from './TrainingItemContent/index';
import './index.styl';

class Training extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            events: null,
            eventsArchive: null // Вырезать из trackData и поместить сюда
        };

        bindAll(this, [
            'checkRenderBtnToggle',
            'getTrackItemContent',
            'getTeacherInfo',
            'checkDisplayShiftLesson',
            'getItemTitle',
            'getHTMLClassModificator',
            'sortEvents',
            'searchArchiveEvent'
        ]);
    }
    componentWillMount() {
        document.querySelector('body > .grid').classList.add('hide');

        if (this.props.userStore.token) {
            this.props.setTrack();
        }
    }
    componentWillReceiveProps(nextProps) {
        const { track } = nextProps.userStore;

        if (this.props.userStore.token !== nextProps.userStore.token) {
            nextProps.setTrack();
        }
        if (track) {
            const { events } = track;
            const groupByDateArray = this.groupByDate(events);
            const groupByDate = this.normalizeGroupArrays(groupByDateArray);
            const sortEvents = this.sortEvents(groupByDate);

            this.setState({
                events: sortEvents.events,
                eventsArchive: sortEvents.eventsArchive
            });
        }
    }
    componentWillUnmount() {
        document.querySelector('body > .grid').classList.remove('hide');
    }
    getTrackItemContent(item, colClassName) {
        const teacherInfo = this.getTeacherInfo(item.teacher, colClassName);
        const displayShiftLesson = this.checkDisplayShiftLesson(colClassName);
        const goal = item.goal || null;

        return (
            <TrainingItemContent
                teacherInfo={teacherInfo}
                displayShiftLesson={displayShiftLesson}
                goal={goal}
            />
        );
    }
    getTeacherInfo(teacher, colClassName) {
        if (isEmpty(teacher)) return null;

        const { first_name: firstName, last_name: lastName, avatar_url: avatarURL } = teacher;
        let teacherName = '';

        if (colClassName === 'col-4') {
            teacherName = `${firstName} ${lastName}`;
        } else {
            teacherName = `${firstName} ${lastName.substr(0, 1).toUpperCase()}.`;
        }

        return { teacherName, avatarURL };
    }
    getItemTitle(item) {
        if (item.type === 'intro') return 'Вводный урок';
        if (item.type === 'exam') return 'Экзамен';
        return `Урок ${item.index}`;
    }
    getHTMLClassModificator(item) {
        return this.checkRenderBtnToggle(item) ? '' : 'track-item_exam';
    }
    searchArchiveEvent(event, idx) {
        if (event.state.status === 'completed') return idx;
        return -1;
    }
    sortEvents(data) {
        const eventsArchive = [];

        for (let monthIdx = 0; monthIdx < data.length; monthIdx++) {
            const archiveMonth = [];
            const month = data[monthIdx];

            for (let eventIdx = 0; eventIdx < month.length; eventIdx++) {
                const event = month[eventIdx];
                const eventIsArray = Object.prototype.toString.call(event) === '[object Array]';
                let search;

                if (eventIsArray) {
                    for (let eventItemIdx = 0; eventItemIdx < event.length; eventItemIdx++) {
                        const eventItem = event[eventItemIdx];

                        search = this.searchArchiveEvent(eventItem, eventItemIdx);

                        if (search !== -1)  {
                            archiveMonth.push(eventItem);
                            event.splice(search, 1);
                            eventItemIdx--;
                        }
                    }
                } else {
                    search = this.searchArchiveEvent(event, eventIdx);

                    if (search !== -1)  {
                        archiveMonth.push(event);
                        month.splice(search, 1);
                        eventIdx--;
                    }
                }
            }

            if (archiveMonth.length) eventsArchive.push(archiveMonth);
        }

        const events = this.normalizeGroup(data);

        return { eventsArchive, events };
    }
    checkRenderBtnToggle(item) {
        return item.type !== 'exam';
    }
    checkDisplayShiftLesson(colClassName) {
        return colClassName === 'col-4';
    }
    normalizeGroupArrays(data) {
        const normalizeGroup = [];

        data.map(item => {
            const month = [];

            for (const key in item) {
                if (item.hasOwnProperty(key)) {
                    const days = item[key].length === 1 ? item[key][0] : item[key];

                    month.push(days);
                }
            }

            normalizeGroup.push(month);
        });

        return normalizeGroup;
    }
    normalizeGroup(data) {
        for (let monthIdx = 0; monthIdx < data.length; monthIdx++) {
            const month = data[monthIdx];

            if (!month.length) {
                data.splice(monthIdx, 1);
                monthIdx--;
            } else {
                for (let eventIdx = 0; eventIdx < month.length; eventIdx++) {
                    const event = month[eventIdx];
                    const eventIsArray = Object.prototype.toString.call(event) === '[object Array]';

                    if (eventIsArray && !event.length) {
                        month.splice(eventIdx, 1);
                        eventIdx--;
                    }
                }
            }
        }

        return data;
    }
    groupByDate(arr) {
        const result = arr.reduce((accumulator, elem) => {
            const acc = accumulator;
            const day = elem.date.split(' ')[0];
            const month = day.split('-')[1];

            if (!acc[month]) acc[month] = [];
            if (!acc[month][day]) acc[month][day] = [];

            acc[month][day].push(elem);
            return acc;
        }, {});

        return Object.getOwnPropertyNames(result).map(k => result[k]);
    }
    render() {
        return (
            <Track
                trackData={this.state.events}
                getTrackItemContent={this.getTrackItemContent}
                checkRenderBtnToggle={this.checkRenderBtnToggle}
                getItemTitle={this.getItemTitle}
                getHTMLClassModificator={this.getHTMLClassModificator}
            />
        );
    }
}

Training.propTypes = {
    userStore: PropTypes.any,
    setTrack: PropTypes.func.isRequired
};

Training.defaultProps = {};

export default Training;
