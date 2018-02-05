/* eslint-disable camelcase,no-lonely-if */
import React from 'react';
import PropTypes from 'prop-types';
import { bindAll } from 'framework/libs';
import axios from 'axios';
import moment from 'moment';
import { API_ENDPOINT } from 'constants/settings';
import './index.styl';

class SelectDate extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            schedule: null,
            actualMonthSchedule: null,
            year: null,
            month: null,
            day: null,
            time: null
        };

        bindAll(this, [
            'handleModalListOpen',
            'handleSubmit',
            'setDay',
            'getDataMonths',
            'getDataDays',
            'getDataTime',
            'setActualMonthSchedule',
            'checkFormData',
            'getFormFieldsValues'
        ]);
    }
    componentWillMount() {
        axios({
            method: 'GET',
            url: `${API_ENDPOINT}/teachers/schedule`,
            slot_type: 'opened',
            headers: {
                'authorization': this.props.token
            }
        }).then((resp) => {
            if (resp && resp.data.error_code === 0) {
                const data  = resp.data.data.schedule;
                const schedule = [];

                if (data.length) {
                    data.map((item) => {
                        const { start_date: startDate, end_date: endDate } = item;
                        const localStartDate = moment.utc(startDate).toDate();
                        const localEndDate = moment.utc(endDate).toDate();

                        schedule.push({
                            startDate: moment(localStartDate).format('YYYY-MM-DD HH:mm'),
                            endDate: moment(localEndDate).format('YYYY-MM-DD HH:mm')
                        });
                    });
                    this.setState({ schedule });
                }
            }
        });
    }
    componentWillReceiveProps(nextProps) {
        const { schedule } = this.state;
        const locale = window.navigator.language;
        const formDataIsEmpty = this.checkFormData(nextProps.formData);
        let formFields;
        let monthNumberWanted;

        if (nextProps.activeId === 'month' && nextProps.formData.month) {
            let { actualMonthSchedule } = this.state;

            monthNumberWanted = moment().locale(locale).month(nextProps.formData.month).format('MM');

            if (!actualMonthSchedule) {
                actualMonthSchedule = this.setActualMonthSchedule(monthNumberWanted);
                formFields = this.getFormFieldsValues(actualMonthSchedule);

                this.setState({
                    ...formFields,
                    actualMonthSchedule
                });
            }

            if (actualMonthSchedule) {
                const dateOfActualSchedule = actualMonthSchedule[0].startDate.split(' ')[0];
                const monthNumberOfActualSchedule = dateOfActualSchedule.split('-')[1];

                if (monthNumberOfActualSchedule !== monthNumberWanted) {
                    actualMonthSchedule = this.setActualMonthSchedule(monthNumberWanted);
                    formFields = this.getFormFieldsValues(actualMonthSchedule);

                    this.props.dataSet(nextProps.activeId, { day: formFields.day, time: formFields.time });

                    this.setState({
                        ...formFields,
                        actualMonthSchedule
                    });
                }
            }
        } else if (!formDataIsEmpty || nextProps.activeId) {
            this.setState({
                month: nextProps.formData.month || this.state.month,
                day: nextProps.formData.day || this.state.day,
                time: nextProps.formData.time || this.state.time
            });
        } else if (schedule) {
            let { actualMonthSchedule } = this.state;

            formFields = this.getFormFieldsValues(schedule);

            if (!actualMonthSchedule) {
                monthNumberWanted = schedule[0].startDate.split(' ')[0];
                actualMonthSchedule = this.setActualMonthSchedule(monthNumberWanted.split('-')[1]);
            }

            this.setState({
                ...formFields,
                actualMonthSchedule
            });
        }
    }
    handleModalListOpen(event) {
        const { target } = event;
        const { id } = target;
        const coord = target.parentNode.getBoundingClientRect();
        let data = null;

        switch (id) {
            case 'month':
                data = this.getDataMonths();
                break;
            case 'day':
                data = this.getDataDays();
                break;
            case 'time':
                data = this.getDataTime();
                break;
            default:
                data = null;
        }

        this.props.openModalList(id, data, coord);
    }
    handleSubmit() {
        const locale = window.navigator.language;
        const { year } = this.state;
        let { month, time } = this.state;
        let day = this.day.querySelectorAll('span')[0].innerHTML;

        month = moment().locale(locale).month(month).format('MM');
        day = day.replace(/<!--[\s\S]*?-->/g, '').split(' ')[0];
        time = time.split(' ')[0];

        const date = `${ year }-${ month }-${ day } ${ time }`;
        const dateUTC = moment.utc(moment(date).format()).format('YYYY-MM-DD HH:mm');

        this.props.onSubmit(dateUTC);
    }
    getFormFieldsValues(schedule) {
        const locale = window.navigator.language;
        const initialDate = schedule[0].startDate.split(' ')[0];
        const startDate = schedule[0].startDate.split(' ')[1];
        const endDate = schedule[0].endDate.split(' ')[1];
        const year = initialDate.split('-')[0];
        const month = moment().locale(locale).month(initialDate.split('-')[1] - 1).format('MMMM');
        const time = `${ startDate } - ${ endDate }`;
        const dayName = moment(initialDate).locale(locale).format('dddd');
        const dayNumber = moment(initialDate).format('DD');
        const day = this.setDay(dayName, dayNumber);

        return { year, month, day, time };
    }
    getDataMonths() {
        const { schedule } = this.state;
        const locale = window.navigator.language;
        const months = [];

        for (let i = 0; i < schedule.length; i++) {
            const item = schedule[i];
            const date = item.startDate.split(' ')[0];
            const month = parseInt(date.split('-')[1], 10);
            const lastMonthInList = months.length ? moment().locale(locale).month(months[months.length - 1]).format('M') : null;

            if (months.length && parseInt(lastMonthInList, 10) === month) continue;
            months.push(
                moment().locale(locale).set('month', month - 1).format('MMMM')
            );
        }
        return months;
    }
    getDataDays() {
        const schedule = this.state.actualMonthSchedule ? this.state.actualMonthSchedule : this.state.schedule;
        const locale = window.navigator.language;
        const days = [];

        for (let i = 0; i < schedule.length; i++) {
            const item = schedule[i];
            const date = item.startDate.split(' ')[0];
            const dayNumber = date.split('-')[2];
            const nameDay = moment(date).locale(locale).format('ddd');
            const lastDayInList = days.length ? days[days.length - 1].split(' ')[0] : null;

            if (days.length && dayNumber === lastDayInList) continue;
            days.push(`${ dayNumber } / ${ nameDay }`);
        }
        return days;
    }
    getDataTime() {
        const schedule = this.state.actualMonthSchedule ? this.state.actualMonthSchedule : this.state.schedule;
        const time = [];

        for (let i = 0; i < schedule.length; i++) {
            const item = schedule[i];
            const startTime = item.startDate.split(' ')[1];
            const endTime = item.endDate.split(' ')[1];
            const timeItem = `${ startTime } - ${ endTime }`;
            const lastTimeInList = time.length ? time[time.length - 1] : null;

            if (time.length && lastTimeInList === timeItem) continue;
            time.push(timeItem);
        }
        return time;
    }
    setDay(name, number) {
        return (
            <div>
                <span>{ number } число</span>
                <span>{ name }</span>
            </div>
        );
    }
    setActualMonthSchedule(monthNumberWanted) {
        const { schedule } = this.state;

        return schedule.filter(item => {
            const date = item.startDate.split(' ')[0];
            const monthNumber = date.split('-')[1];

            return monthNumber === monthNumberWanted;
        });
    }
    checkFormData(formData) {
        for (const prop in formData) {
            if (formData.hasOwnProperty(prop) && formData[prop]) return false;
        }
        return true;
    }
    render() {
        const { month, day, time } = this.state;

        return (
            <div className='select-date'>
                <div className='row'>
                    <div className='col-4'>
                        <div className='select-date__item select-date__item_month'>
                            <div className='select-date__item__content'>
                                <div className='value' ref={val => this.month = val}>
                                    { month }
                                </div>
                            </div>
                            <div className='btn btn-open-list'
                                id='month'
                                onClick={this.handleModalListOpen}
                            />
                        </div>
                    </div>
                    <div className='col-4'>
                        <div className='select-date__item select-date__item_day'>
                            <div className='select-date__item__content'>
                                <div className='value' ref={val => this.day = val}>
                                    { day }
                                </div>
                            </div>
                            <div className='btn btn-open-list'
                                id='day'
                                onClick={this.handleModalListOpen}
                            />
                        </div>
                    </div>
                    <div className='col-4'>
                        <div className='select-date__item select-date__item_time'>
                            <div className='select-date__item__content'>
                                <div className='value' ref={val => this.time = val}>
                                    { time }
                                </div>
                            </div>
                            <div className='btn btn-open-list'
                                id='time'
                                onClick={this.handleModalListOpen}
                            />
                        </div>
                    </div>
                </div>
                <div
                    className='btn btn-save-rec'
                    onClick={this.handleSubmit}
                >
                    {this.props.btnText}
                </div>
            </div>
        );
    }
}

SelectDate.propTypes = {
    activeId: PropTypes.string,
    btnText: PropTypes.string,
    getSchedule: PropTypes.func,
    token: PropTypes.string,
    openModalList: PropTypes.func,
    formData: PropTypes.any,
    dataSet: PropTypes.func,
    onSubmit: PropTypes.func
};

SelectDate.defaultProps = {};

export default SelectDate;
