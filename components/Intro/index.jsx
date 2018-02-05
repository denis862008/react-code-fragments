import React from 'react';
import PropTypes from 'prop-types';
import Grid from 'framework/Grid';
import SideBar from '../templates/Sidebar/index';
import SidebarItem from '../templates/Sidebar/SidebarItem/index';
import TrackItem from '../templates/Track/TrackItem/index';
import Modal from 'framework/Modal';
import ModalDateList from './ModalDateList/index';
import SelectDate from '../../SelectDateForm/index';
import InfoModalContent from './InfoModalContent/index';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { bindAll } from 'framework/libs';
import { API_ENDPOINT } from 'constants/settings';
import axios from 'axios';
import moment from 'moment';
import './index.styl';

class Intro extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pending: false,
            lessonId: null,
            lessonCancel: false,
            lessonContent: null,
            isModalFormOpen: false,
            submitDateMethod: 'POST',
            formData: {
                year: null,
                month: null,
                day: null,
                time: null
            },
            dateListModal: {
                isOpen: false,
                isAnimate: false,
                posLeft: '',
                activeId: null,
                data: null
            },
            infoModal: {
                isOpen: false,
                selectedID: null,
                reschedule: {
                    renderCloseBtn: true,
                    header: 'Перенос',
                    content: {
                        textBody: 'Подтвердите перенос  времени урока',
                        textSelected: 'Перенести время можно не поздее, чем  за 6 часов до начала.',
                        textBtn: 'не смогу присутствовать'
                    }
                },
                cancelTime: {
                    renderCloseBtn: true,
                    header: 'Отмена',
                    content: {
                        textBody: 'Отдохните и заходите завтра,  чтобы записаться на новое время.',
                        textSelected: 'подтвердите отмену',
                        textBtn: 'не смогу присутствовать'
                    }
                },
                successSelectTime: {
                    renderCloseBtn: false,
                    header: 'Отлично!',
                    content: {
                        textBody: 'Время вводного урока успешно забронировано за вами.',
                        textSelected: 'Перенести время можно не поздее, чем  за 6 часов до начала',
                        textBtn: 'огонь!'
                    }
                }
            },
            info: {
                items: [
                    {
                        itemTitle: 'Чтение',
                        date: '30 упр. / 40ч.'
                    },
                    {
                        itemTitle: 'Аудирование',
                        date: '30 упр. / 40ч.'
                    },
                    {
                        itemTitle: 'Письмо',
                        date: '30 упр. / 40ч.'
                    },
                    {
                        itemTitle: 'Говорение',
                        date: '30 упр. / 40ч.'
                    },
                    {
                        itemTitle: 'Лексика',
                        date: '30 упр. / 40ч.'
                    },
                    {
                        itemTitle: 'Грамматика',
                        date: '30 упр. / 40ч.'
                    }
                ]
            },
            sidebar: {
                items: [
                    'ближайший урок',
                    'февраль',
                    'март',
                    'апрель',
                    'май'
                ]
            }
        };

        bindAll(this, [
            'renderSidebarItems',
            'renderInfoSection',
            'handleSelectDate',
            'handleOpenInfoModal',
            'handleCloseSelectDateModal',
            'handleCloseInfoModal',
            'handleSubmitForm',
            'handleSuccessSelectTime',
            'handleReschedule',
            'handleCancelTime',
            'openModalList',
            'modalOpenListInit',
            'modalListClose',
            'clearDataModalList',
            'clearFormData',
            'dateFormDataSet',
            'setCSSModificator',
            'setLessonContent',
            'btnSetCallback',
            'infoModalSetCallback',
            'btnRenderText',
            'btnSetId',
            'checkForIntro'
        ]);
    }
    componentWillMount() {
        document.querySelector('body > .grid').classList.add('hide');
        this.setState({ pending: true });

        if (this.props.token) {
            this.checkForIntro(this.props.token);
        }

        this.interval = setInterval(() => {
            if (this.props.token) {
                this.checkForIntro(this.props.token);
            }
        }, 1800000);
    }
    componentWillReceiveProps(nextProps) {
        const { token } = nextProps;

        if (this.props.token !== token) {
            this.checkForIntro(token);
        }
    }
    componentWillUnmount() {
        document.querySelector('body > .grid').classList.remove('hide');
        if (this.interval) clearInterval(this.interval);
    }
    handleSelectDate() {
        this.wrapper.classList.add('modal-open');
        this.setState({ isModalFormOpen: !this.state.isModalFormOpen });
    }
    handleCloseSelectDateModal(event) {
        if (event) event.preventDefault();

        if (this.state.dateListModal.isOpen) {
            this.modalListClose();
            setTimeout(() => {
                this.wrapper.classList.add('modal-closed');
                this.setState({ isModalFormOpen: false });

                setTimeout(() => {
                    this.wrapper.classList.remove('modal-open');
                    this.wrapper.classList.remove('modal-closed');
                    this.setState({ formData: this.clearFormData() });
                }, 600);
            }, 300);
        } else {
            this.wrapper.classList.add('modal-closed');
            this.clearDataModalList();
            this.setState({ isModalFormOpen: false });

            setTimeout(() => {
                this.wrapper.classList.remove('modal-open');
                this.wrapper.classList.remove('modal-closed');
                this.setState({ formData: this.clearFormData() });
            }, 600);
        }
    }
    handleCloseInfoModal(event) {
        if (event) event.preventDefault();

        const { infoModal } = this.state;

        infoModal.isOpen = false;
        this.wrapper.classList.add('modal-closed');
        this.setState({ infoModal });

        setTimeout(() => {
            this.wrapper.classList.remove('modal-open');
            this.wrapper.classList.remove('modal-closed');
        }, 600);
    }
    handleOpenInfoModal(event) {
        const { target } = event;
        const { id } = target;
        const { infoModal } = this.state;

        this.wrapper.classList.add('modal-open');
        infoModal.isOpen = true;
        infoModal.selectedID = id;
        this.setState({ infoModal });
    }
    handleSubmitForm(date) {
        const { token } = this.props;
        const { lessonId, dateListModal } = this.state;
        let method = this.state.submitDateMethod;
        const data = {};
        let url = `${API_ENDPOINT}/lesson_events`;

        data.date = date;

        if (method === 'POST') data.type = 'intro';
        if (method === 'PUT') url = `${API_ENDPOINT}/lesson_events/${ lessonId }`;

        axios({
            method,
            url,
            headers: {
                'authorization': token
            },
            data: {
                ...data
            }
        }).then((resp)  => {
            if (resp && resp.data.error_code === 0) {
                const { infoModal } = this.state;

                if (method === 'POST') {
                    infoModal.isOpen = true;
                    infoModal.selectedID = 'successSelectTime';
                }

                this.clearDataModalList();
                this.handleCloseSelectDateModal();

                if (method === 'PUT') method = 'POST';

                this.setState({
                    dateListModal,
                    submitDateMethod: method,
                    infoModal
                });

                this.checkForIntro(token);
            }
        });
    }
    handleSuccessSelectTime() {
        const { token } = this.props;

        this.checkForIntro(token);
    }
    handleReschedule() {
        const { infoModal } = this.state;

        infoModal.isOpen = false;
        this.setState({
            infoModal,
            isModalFormOpen: true,
            submitDateMethod: 'PUT'
        });
    }
    handleCancelTime() {
        const { lessonId } = this.state;
        const { token } = this.props;

        axios({
            method: 'DELETE',
            url: `${API_ENDPOINT}/lesson_events/${ lessonId }`,
            headers: {
                'authorization': token
            }
        }).then((resp) => {
            if (resp && resp.data.error_code === 0) {
                this.checkForIntro(token);
            }
        });
    }
    setLessonContent(lesson) {
        const teacherName = `${ lesson.teacher.first_name } ${ lesson.teacher.last_name }`;

        return (
            <div>
                <div className='static-text-section'>
                    Мы пригласим вас на урок  за 5 минут до начала
                </div>
                <div className='skills'>
                    {
                        lesson.skills.length ?
                            lesson.skills.map((skill, idx) => (
                                <div className='skills__item' key={idx}>{ skill }</div>
                            )) : null
                    }
                </div>
                <div className='teacher'>
                    <div className='teacher__avatar'><img src={lesson.teacher.avatar_url} /></div>
                    <div className='teacher__info'>
                        <div className='teacher__name'>{ teacherName }</div>
                        <a href='#' className='teacher__about'>О преподавателе</a>
                    </div>
                </div>
            </div>
        );
    }
    setCSSModificator() {
        const { lessonId, lessonCancel } = this.state;

        if (lessonId && !lessonCancel) {
            return 'btn-black';
        } else if (lessonId && lessonCancel) {
            return 'btn-red';
        }

        return 'btn-light-green';
    }
    static interval = null;
    openModalList(id, data, coord) {
        const { dateListModal } = this.state;

        if (dateListModal.isAnimate) return;
        dateListModal.isAnimate = true;
        this.setState({ dateListModal });

        if (dateListModal.isOpen && dateListModal.activeId !== id) {
            this.modalListClose();
            setTimeout(() => {
                this.modalOpenListInit(id, data, coord);
            }, 600);
        } else {
            this.modalOpenListInit(id, data, coord);
        }
    }
    modalOpenListInit(id, data, coord) {
        const { dateListModal } = this.state;

        dateListModal.isOpen = true;
        dateListModal.activeId = id;
        dateListModal.data = data;
        dateListModal.posLeft = `${ coord.left }px`;
        dateListModal.isAnimate = false;
        this.setState({ dateListModal });
    }
    modalListClose() {
        const { dateListModal } = this.state;

        dateListModal.isOpen = false;
        this.clearDataModalList();
        this.setState({ dateListModal });
    }
    clearDataModalList() {
        const { dateListModal } = this.state;

        dateListModal.activeId = null;
        dateListModal.posLeft = '';
        dateListModal.data = null;
    }
    clearFormData() {
        const { formData } = this.state;

        for (const prop in formData) {
            if (formData.hasOwnProperty(prop)) formData[prop] = null;
        }
        return formData;
    }
    dateFormDataSet(activeId, data) {
        const { dateListModal } = this.state;
        let { formData } = this.state;

        dateListModal.activeId = activeId;
        if (typeof data === 'object') {
            formData = { ...formData, ...data };
        } else {
            formData[activeId] = data;
        }

        this.setState({
            formData,
            dateListModal
        });
    }
    btnSetCallback() {
        const { lessonId } = this.state;

        return lessonId ? this.handleOpenInfoModal : this.handleSelectDate;
    }
    infoModalSetCallback() {
        const { lessonId, lessonCancel } = this.state;

        if (lessonId && !lessonCancel) {
            return this.handleReschedule;
        } else if (lessonId && lessonCancel) {
            return this.handleCancelTime;
        }

        return this.handleSuccessSelectTime;
    }
    btnSetId() {
        const { lessonId, lessonCancel } = this.state;

        if (lessonId && !lessonCancel) {
            return 'reschedule';
        } else if (lessonId && lessonCancel) {
            return 'cancelTime';
        }

        return 'selectTime';
    }
    btnRenderText() {
        const { lessonId, lessonCancel } = this.state;

        if (lessonId && !lessonCancel) {
            return 'Перенести время';
        } else if (lessonId && lessonCancel) {
            return 'Не смогу присутствовать';
        }

        return 'Выбрать время';
    }
    checkForIntro(token) {
        const { infoModal: { isOpen } } = this.state;

        axios({
            method: 'GET',
            url: `${API_ENDPOINT}/lesson_events`,
            headers: {
                'authorization': token
            }
        }).then((resp) => {
            if (resp && resp.data.error_code === 0) {
                let lessonId = null;
                let lessonCancel = false;
                const now = moment().format('YYYY-MM-DD HH:mm');
                // const dateNow = now.split(' ')[0];
                // const timeNow = parseFloat(now.split(' ')[1].replace(/:/g, '.'));
                const { events } = resp.data.data;
                let lessonContent;

                for (let e = 0; e < events.length; e++) {
                    const event = events[e];

                    if (event.type === 'intro') {
                        const dateFromUTC = moment.utc(event.date).toDate();
                        const eventFullDate = moment(dateFromUTC).format('YYYY-MM-DD HH:mm');
                        // const eventDate = eventFullDate.split(' ')[0];
                        // const eventTime = this.handleEventTime(eventFullDate.split(' ')[1].replace(/:/g, '.'));
                        const timeDiff = moment(eventFullDate).diff(moment(now), 'hours');

                        if (timeDiff < 6 && timeDiff >= 0) {
                            lessonCancel = true;
                        }

                        lessonId = event.id;
                        lessonContent = this.setLessonContent(event);
                        break;
                    }
                }

                if (!lessonId) {
                    lessonContent = 'Мы определим ваш уровень и составим  персональный трек обучения';
                    if (lessonCancel) lessonCancel = false;
                }

                this.setState({
                    lessonId,
                    lessonCancel,
                    lessonContent,
                    pending: false
                });
                if (isOpen) this.handleCloseInfoModal();
            }
        });
    }
    renderSidebarItems() {
        const { items } = this.state.sidebar;
        const cols = [];

        items.map((item, idx) => {
            cols.push(
                <div key={idx} className={idx === 0 ? 'col-4' : 'col-2'}>
                    <SidebarItem>{ item }</SidebarItem>
                </div>
            );
        });

        return cols;
    }
    renderInfoSection() {
        const { items } = this.state.info;
        const articles = [];

        items.map((item, idx) => {
            articles.push(
                <TrackItem
                    key={idx}
                    data={
                        {
                            itemTitle: item.itemTitle,
                            date: item.date,
                            htmlClassModificator: 'track-item_info'
                        }
                    }
                />
            );
        });
        return articles;
    }
    render() {
        return (
            <div
                className='page__intro__wrapper'
                ref={val => this.wrapper = val}
            >
                <div className='intro'>
                    <Grid />
                    <div className='intro__inner'>
                        <div className='row'>
                            <div className='col-4'>
                                <TrackItem
                                    data={{
                                        itemTitle: 'Вводный урок',
                                        htmlClassModificator: 'track-item_intro'
                                    }}
                                >
                                    <div className='track-item__content__inner'>
                                        { !this.state.pending ?
                                            this.state.lessonContent : null
                                        }
                                    </div>
                                    {
                                        !this.state.pending ?
                                            <div className={`btn btn-select-time ${ this.setCSSModificator() }`}
                                                onClick={this.btnSetCallback()}
                                                id={this.btnSetId()}
                                            >
                                                { this.btnRenderText() }
                                            </div> : null
                                    }
                                </TrackItem>
                            </div>
                            <div className='col-6'>
                                { this.renderInfoSection() }
                            </div>
                            <div className='col-2'>
                                <TrackItem
                                    data={{
                                        itemTitle: 'Экзамен ЕГЭ',
                                        htmlClassModificator: 'track-item_exam'
                                    }}
                                >
                                    <div className='track-item__content__inner'>
                                        <div className='target'>Цель: 90 баллов</div>
                                    </div>
                                </TrackItem>
                            </div>
                        </div>
                    </div>
                    <SideBar position='bottom'>
                        <div className='sidebar__control sidebar__control_left'/>
                        <div className='sidebar__control sidebar__control_right'/>
                        <div className='row'>
                            { this.renderSidebarItems() }
                        </div>
                    </SideBar>
                </div>
                <div className='page__intro__overlay'>
                    <TransitionGroup>
                        {
                            this.state.isModalFormOpen ?
                                <CSSTransition
                                    classNames='parallax'
                                    timeout={{ enter: 400, exit: 400 }}
                                >
                                    <Modal
                                        title={<span>Выберите дату и время</span>}
                                        onClose={this.handleCloseSelectDateModal}
                                        className='modal-intro'
                                    >
                                        <SelectDate
                                            activeId={this.state.dateListModal.activeId}
                                            formData={this.state.formData}
                                            btnText='записаться'
                                            token={this.props.token}
                                            openModalList={this.openModalList}
                                            dataSet={this.dateFormDataSet}
                                            onSubmit={this.handleSubmitForm}
                                        />
                                    </Modal>
                                </CSSTransition> : null
                        }
                        {
                            this.state.dateListModal.isOpen ?
                                <CSSTransition
                                    classNames='parallax'
                                    timeout={{ enter: 300, exit: 300 }}
                                >
                                    <ModalDateList
                                        activeId={this.state.dateListModal.activeId}
                                        posLeft={this.state.dateListModal.posLeft}
                                        data={this.state.dateListModal.data}
                                        closeModal={this.modalListClose}
                                        dataSet={this.dateFormDataSet}
                                    />
                                </CSSTransition> : null
                        }
                        {
                            this.state.infoModal.isOpen ?
                                <CSSTransition
                                    classNames='parallax'
                                    timeout={{ enter: 400, exit: 400 }}
                                >
                                    <Modal
                                        title={<span>{ this.state.infoModal[this.state.infoModal.selectedID].header }</span>}
                                        onClose={this.handleCloseInfoModal}
                                        className='modal-intro modal-intro_info-modal'
                                        renderCloseBtn={this.state.infoModal[this.state.infoModal.selectedID].renderCloseBtn}
                                    >
                                        <InfoModalContent
                                            id={this.state.infoModal.selectedID}
                                            content={this.state.infoModal[this.state.infoModal.selectedID].content}
                                            callback={this.infoModalSetCallback()}
                                        />
                                    </Modal>
                                </CSSTransition> : null
                        }
                    </TransitionGroup>
                </div>
            </div>
        );
    }
}

Intro.propTypes = {
    token: PropTypes.string
};

Intro.defaultProps = {};

export default Intro;
