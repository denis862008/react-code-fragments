/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import Grid from 'framework/Grid';
import TrackItem from './TrackItem/index';
import SideBar from '../Sidebar/index';
import SidebarItem from '../Sidebar/SidebarItem/index';
import { bindAll } from 'framework/libs';
import moment from 'moment';
import './index.styl';

class Track extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            trackData: null,
            cols: [],
            colWide: true,
            limit: null,
            offset: 0
        };

        bindAll(this, [
            'createTrack',
            'createTrackCols',
            'dataColItemParse',
            'parseDate',
            'handleClick',
            'renderList',
            'getItemState',
            'getRowItemsNumber'
        ]);
    }
    componentWillReceiveProps(nexProps) {
        const { trackData } = nexProps;

        if (trackData) {
            const { cols } = this.state;
            let { limit } = this.state;

            // ------------------------------ Fake cols pushing ----------------------------------
            // trackData.push(
            //     [
            //         {
            //             date: '2018-05-05 19:00',
            //             id: '100d7362faa78135e0e1a200',
            //             index: '11',
            //             lesson_id: '599d7362faa78135e0e1a200',
            //             payment: {},
            //             skills: ['gramma', 'audio'],
            //             state: {
            //                 status: 'not_started',
            //                 block_id: '',
            //                 task_id: '',
            //                 question_id: ''
            //             },
            //             teacher: {
            //                 id: 'jG85zz',
            //                 first_name: 'Константин',
            //                 last_name: 'Константинопольский',
            //                 avatar_url: 'http://data-smart-education-predprod.prostream.ru/download/87'
            //             }
            //         }
            //     ],
            //     [
            //         {
            //             date: '2018-06-05 19:00',
            //             id: '100d7362faa78135e0e1a201',
            //             index: '12',
            //             lesson_id: '599d7362faa78135e0e1a201',
            //             payment: {},
            //             skills: ['gramma', 'audio'],
            //             state: {
            //                 status: 'not_started',
            //                 block_id: '',
            //                 task_id: '',
            //                 question_id: ''
            //             },
            //             teacher: {
            //                 id: 'jG85czd',
            //                 first_name: 'Константин',
            //                 last_name: 'Константинопольский',
            //                 avatar_url: 'http://data-smart-education-predprod.prostream.ru/download/87'
            //             }
            //         }
            //     ]
            // );
            // ------------------------------ Fake cols pushing ----------------------------------

            for (let col = 0; col < trackData.length; col++) {
                for (let colItem = 0; colItem < trackData[col].length; colItem++) {
                    const event = trackData[col][colItem];
                    const eventIsArray = Object.prototype.toString.call(event) === '[object Array]';

                    if (!cols[col]) cols[col] = [];

                    const colLength = cols[col].length;
                    let colItemId = 1;

                    if (colLength) colItemId = cols[col][colLength - 1].id + 1;
                    if (eventIsArray) {
                        for (let e = 0; e < event.length; e++) {
                            cols[col].push({
                                id: colItemId,
                                isOpen: false
                            });
                            colItemId++;
                        }
                    } else {
                        cols[col].push({
                            id: colItemId,
                            isOpen: false
                        });
                    }
                }
            }

            limit = this.getLimitColsRender(this.getRowItemsNumber(trackData), trackData.length);
            this.setState({
                trackData,
                cols,
                limit
            });
        }
    }
    handleClick(event) {
        const { cols } = this.state;
        const { target } = event;
        const firedItem = target.parentNode.parentNode;
        const { id, dataset: { trackCol } } = firedItem;
        const idx = cols[trackCol].findIndex(item => item.id === parseInt(id, 10));
        const isOpen = cols[trackCol][idx].isOpen;

        if (!isOpen) {
            for (let i = 0; i < cols[trackCol].length; i++) {
                const colItem = cols[trackCol][i];

                colItem.isOpen = false;
            }
        }

        cols[trackCol][idx].isOpen = !cols[trackCol][idx].isOpen;
        this.setState({ cols });
    }
    getLimitColsRender(rowItemsNumber, trackDataLength) {
        const { offset } = this.state;

        if (rowItemsNumber > 1 && offset === 0) return 5;
        if (rowItemsNumber > 1 && offset > 0) return 6;

        return trackDataLength;
    }
    getRowItemsNumber(trackData) {
        const { offset } = this.state;

        if ((offset === 0 && trackData.length < 5) || (offset !== 0 && trackData.length <= 6)) return 1;
        return 2;
    }
    getColClassName(colIdx) {
        const { offset } = this.state;

        if (colIdx === 0 && offset === 0 && !this.isSet) return 'col-4';
        return 'col-2';
    }
    getItemState(colIdx, itemID) {
        const { cols } = this.state;
        const indexItem = cols[colIdx].findIndex(item => item.id === itemID);

        return cols[colIdx][indexItem].isOpen;
    }
    static isSet = false;
    createTrackCols(rowIdx, isTrackDefault) {
        const { trackData, limit, offset } = this.state;
        const cols = [];
        let maxColsNumber = trackData.length > 6 ? 7 : trackData.length;
        let colIdx = limit * rowIdx + offset;
        let itemMonth;

        if (offset === 0 && maxColsNumber < 7) maxColsNumber++;

        for (colIdx; colIdx < maxColsNumber; colIdx++) {
            if (colIdx > 0) {
                const trackItem = trackData[colIdx - 1][0];
                const trackItemIsArray = Object.prototype.toString.call(trackItem) === '[object Array]';

                console.log('testme', trackItem);
                let date = trackItemIsArray ? trackItem[0].date : trackItem.date;

                date = date.split(' ')[0];
                itemMonth = parseInt(date.split('-')[1], 10) - 1;
            }

            if (rowIdx === 0 && offset === 0 && colIdx === 5) break;
            cols.push(
                <div className={this.getColClassName(colIdx)} key={colIdx}>{
                    isTrackDefault ?
                        this.renderColItems(colIdx) :
                        <SidebarItem>
                            { offset === 0 && colIdx === 0 ?
                                'Ближайший урок' :
                                `${ moment().locale('ru').set('month', itemMonth).format('MMMM') }` }
                        </SidebarItem>
                }
                </div>
            );
        }

        return cols;
    }
    createTrack(trackType = 'default') {
        const { trackData } = this.state;
        const rows = [];
        const isTrackDefault = trackType === 'default';
        const rowItemsNumber = this.getRowItemsNumber(trackData);

        for (let rowIdx = 0; rowIdx < rowItemsNumber; rowIdx++) {
            rows.push(
                <div className='row__item' key={rowIdx}>
                    { this.createTrackCols(rowIdx, isTrackDefault) }
                </div>
            );
        }

        return rows;
    }
    parseDate(itemDate) {
        const date = itemDate.split(' ')[0].split('-');
        const time = itemDate.split(' ')[1];

        return `${date[2]}.${date[1]} / ${time}`;
    }
    dataColItemParse(item, colClassName) {
        return {
            date: this.parseDate(item.date),
            itemTitle: this.props.getItemTitle(item),
            content: this.props.getTrackItemContent(item, colClassName),
            renderBtnToggle: this.props.checkRenderBtnToggle(item),
            htmlClassModificator: this.props.getHTMLClassModificator(item)
        };
    }
    renderList(list, colIdx, itemId) {
        const colClassName = this.getColClassName(colIdx);
        let itemID = itemId;

        return (
            <div className='track-section-items' key={itemId}>
                {
                    list.map((listItem, listItemIdx) => {
                        const data = this.dataColItemParse(listItem, colClassName);

                        itemID++;
                        const isOpen = this.getItemState(colIdx, itemID);

                        return (
                            <TrackItem
                                key={listItemIdx}
                                itemId={itemID}
                                colIdx={colIdx}
                                isOpen={isOpen}
                                data={data}
                                onClick={this.handleClick}
                            />
                        );
                    })
                }
            </div>
        );
    }
    renderColItems(colIndex) {
        const { trackData, offset } = this.state;
        const colItems = [];
        let colIdx = colIndex;
        const colClassName = this.getColClassName(colIdx);
        let item;
        let data;
        let itemId = 0;

        if (colIdx > 0 && offset === 0) colIdx--;

        for (let idx = 0; idx < trackData[colIdx].length; idx++) {
            item = trackData[colIdx][idx];
            const isListItems = Object.prototype.toString.call(item) === '[object Array]';

            if (colIdx > 0 && this.isSet) this.isSet = false;

            if (colIdx === 0 && offset === 0 && !this.isSet) {
                item = trackData[colIdx][0];
                if (isListItems) {
                    item = trackData[colIdx][0][0];
                }
                console.log('THIS IS SPARTA', trackData, isListItems);
                data = this.dataColItemParse(item, colClassName);
                this.isSet = true;

                data.renderBtnToggle = false;
                colItems.push(
                    <TrackItem
                        key='next'
                        data={data}
                    />
                );
                break;
            }
            if (!isListItems) {
                if (colIdx === 0 && offset === 0 && idx === 0) continue;
            }
            if (isListItems) {
                if (colIdx === 0 && offset === 0 && idx === 0) {
                    item.shift();
                }
                colItems.push(this.renderList(item, colIdx, itemId));
                itemId = itemId + item.length;
            } else {
                data = this.dataColItemParse(item, colClassName);

                itemId = itemId + 1;
                const isOpen = this.getItemState(colIdx, itemId);

                colItems.push(
                    <TrackItem
                        key={idx}
                        itemId={itemId}
                        colIdx={colIdx}
                        isOpen={isOpen}
                        data={data}
                        onClick={this.handleClick}
                    />
                );
            }
        }

        return colItems;
    }
    render() {
        const { trackData } = this.state;

        // console.log(trackData);
        // console.log('props: ', this.props);
        return (
            <div className='track'>
                <Grid />
                <SideBar position='left'>
                    <a href='' className='achievements'>достижения</a>
                    <a href='' className='archive'>архив</a>
                </SideBar>
                <div className='track__inner'>
                    <div className='row'>
                        { trackData ? this.createTrack() : '' }
                    </div>
                </div>
                <SideBar position='bottom'>
                    <div className='row'>
                        { trackData ? this.createTrack('sidebar') : '' }
                    </div>
                </SideBar>
            </div>
        );
    }
}

Track.propTypes = {
    trackData: PropTypes.array,
    getItemTitle: PropTypes.func,
    getHTMLClassModificator: PropTypes.func,
    getTrackItemContent: PropTypes.func,
    checkRenderBtnToggle: PropTypes.func
};

export default Track;
