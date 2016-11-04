import React, { PropTypes } from 'react';
import styles from './styles.less';

import {
    compose,
    getContext,
    shallowEqual
} from 'recompose';

import { Tab, Tabs, Table, Pagination, FormControl, InputGroup, Button } from 'react-bootstrap';





const datatablePropTypes = {
    columns: React.PropTypes.array,
    results: React.PropTypes.array,
    sort: React.PropTypes.object,
    toggleColumnSort: React.PropTypes.func,
    numPages: React.PropTypes.number,
    activePage: React.PropTypes.number,
    handlePageSelect: React.PropTypes.func
};

const datatableDefaultProps = {
    toggleColumnSort: (field) => {
        console.log('toggle column sort on', field);
    },
    handlePageSelect: (pageNumber) => {
        console.log('handle page select of page', pageNumber);
    }
};

class DataTable extends React.Component {
    constructor(props) {
        super(props);
        console.log('DataTable props', props);
    }

    render () {
        return (
            <div>
                <div className={styles['inspector-table-header']}>

                     <Pagination
                        prev
                        next
                        first
                        last
                        ellipsis
                        boundaryLinks
                        items={this.props.numPages}
                        maxButtons={5}
                        activePage={this.props.activePage}
                        onSelect={this.props.handlePageSelect} />

                    <InputGroup>
                         <FormControl
                            type="text"
                            value={this.props.searchText}
                            placeholder="Search"
                          />
                        <Button>
                            <i className={`
                                ${styles['fa']}
                                ${styles['fa-fw']}
                                ${styles['fa-search']}`}></i>
                        </Button>
                    </InputGroup>


                </div>
                <Table className={styles['inspector-table']}
                    striped={true} bordered={true} condensed={true} hover={true}>
                <thead>
                    {this.props.columns.map((field) => <th onClick={ () => this.props.toggleColumnSort(field) }>
                        {field}
                        { this.props.sort && this.props.sort.column === field
                            ? <i className={`
                                ${styles['sort-active']}
                                ${styles['fa']}
                                ${styles['fa-fw']}
                                ${styles['fa-sort-' + (this.props.sort.ascending ? 'asc' : 'desc')]}`}></i>
                            : <i className={`
                                ${styles['sort-inactive']}
                                ${styles['fa']}
                                ${styles['fa-fw']}
                                ${styles['fa-sort']}`}></i>
                        }
                    </th>)}
                </thead>
                <tbody>
                    {this.props.results.map((item) => {
                        return (<tr>{
                            this.props.columns.map((field) => <td>{item[field]}</td>)
                        }</tr>);
                    })}
                </tbody>
            </Table>
        </div>);
    }
}

DataTable.propTypes = datatablePropTypes;
DataTable.defaultProps = datatableDefaultProps;



class Inspector extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        const {openTab, open, onSelect} = this.props;


        const fakeData = {
            sort: {
                column: 'name',
                ascending: true
            },
            numPages: 1,
            activePage: 0,
            results: [
                    {
                        "id": 0,
                        "name": "Mayer Leonard",
                        "city": "Kapowsin",
                        "state": "Hawaii",
                        "country": "United Kingdom",
                        "company": "Ovolo",
                        "favoriteNumber": 7
                    },
                     {
                        "id": 10,
                        "name": "Bullwinkle",
                        "city": "Moscow",
                        "stata": null,
                        "country": "USSR",
                        "company": "ACME",
                        "favoriteNumber": 10
                    },
                ],
            cols: ['id', 'name', 'city', 'company', 'favoriteNumber']
        };


        return <div className={styles.inspector}>
            <Tabs defaultActiveKey={openTab} className={styles.inspectorTabs} onSelect={onSelect}>
                <Tab eventKey={'points'} title="Points">
                    <DataTable
                        results={fakeData.results}
                        columns={fakeData.cols}
                        sort={fakeData.sort}
                        activePage={fakeData.activePage}
                        numPages={fakeData.numPages}
                        entityType={"Node"}/>
                </Tab>
                <Tab eventKey={'edges'} title="Edges">
                    <DataTable
                        results={fakeData.results}
                        columns={fakeData.cols.slice(0,3)}
                        sort={fakeData.sort}
                        activePage={fakeData.activePage}
                        numPages={fakeData.numPages}
                        entityType={"Edge"}/>
                </Tab>
            </Tabs>
        </div>;

    }
}

export { Inspector };



