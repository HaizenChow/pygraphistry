import { constructFieldString, SplunkPivot } from './SplunkPivot.js';
import logger from '../../logger.js'
import _ from 'underscore';
import stringhash from 'string-hash';

const log = logger.createLogger('pivot-app', __filename);

const SPLUNK_INDICES = {
    EVENT_GEN: 'index=event_gen',
    PAN: 'index=event_gen | search vendor="Palo Alto Networks"'
};

const PAN_NODE_COLORS = { 'EventID': 7, 'user': 1, 'dest': 3, 'threat_name': 5 };

const PAN_NODE_SIZES = { 'EventID': 0.1, 'dest': 1.1, 'user': 5, 'threat_name': 10 };

const PAN_ENCODINGS = {
    point: {
        pointColor: function(node) {
            node.pointColor = PAN_NODE_COLORS[node.type];
            if (node.pointColor === undefined) {
                node.pointColor = stringhash(node.type) % 12;
            }
        },
        pointSizes: function(node) {
            node.pointSize = PAN_NODE_SIZES[node.type];
        }
    }
};

const PAN_SHAPES = {
    userToThreat: {
        connections: [ 'user', 'threat_name'],
        attributes: ['vendor_action', 'category', 'time', 'url', 'severity', 'action']
    },
    userToDest: {
        connections: [ 'dest', 'user' ],
        attributes: [ 'action', 'time']
    },
};

function expandOnEntityAndShape({source, target, filter = '', attributes}) {
    return {
        name: `PAN - Expand From ${source} to ${target}`,
        id: `expand-from-${source}-to-${target}`,
        label: 'Expand on ',
        kind: 'button',
        pivotParameterKeys: ['pivotRef'],
        pivotParametersUI: {
            pivotRef: {
                inputType: 'pivotCombo',
                label: 'Any URL in:',
            }
        },
        toSplunk: function(pivotParameters, pivotCache) {
            const subSearchId = pivotParameters.pivotRef;
            const isGlobalSearch = (subSearchId === '*');
            var subsearch = '';
            if (isGlobalSearch) {
                const list  = _.map(
                    Object.keys(pivotCache), (pivotId) =>
                        (`[| loadjob "${pivotCache[pivotId].splunkSearchId}"
                          | fields ${source} | dedup ${source}]`));
                subsearch = list.join(' | append ');
            } else {
                subsearch = `[| loadjob "${pivotCache[subSearchId].splunkSearchId}" |  fields ${source} | dedup ${source}]`;
            }

            return `search ${SPLUNK_INDICES.PAN}
                    | search ${filter} ${subsearch} ${constructFieldString(this)}`;

        },
        connections: [source, target],
        attributes: attributes,
        encodings: PAN_ENCODINGS
    };
}

function searchAndShape({connections, attributes}) {
    return {
        name: `PAN - Search ${connections.join('-')}`,
        id: `pan-search-to-${connections.join('-')}`,
        pivotParameterKeys: ['query'],
        pivotParametersUI: {
            query: {
                inputType: 'text',
                label: 'Search',
                placeholder: 'severity="critical"'
            }
        },
        connections,
        attributes,
        encodings: PAN_ENCODINGS,
        toSplunk: function(pivotParameters) {
            return `search ${SPLUNK_INDICES.PAN} ${pivotParameters.query}
                ${constructFieldString(this)}
                | head 100`;
        }
    };
}

const PAN_SEARCH_USER_DEST= new SplunkPivot(
    searchAndShape(
        {
            connections: ['user', 'dest'],
            attributes: PAN_SHAPES.userToDest.attributes
        }
    )
);

const PAN_DEST_USER = new SplunkPivot(
    expandOnEntityAndShape(
        {
            source: 'dest',
            target: 'user',
            attributes: PAN_SHAPES.userToDest.attributes
        }
    )
);

export const PAN_SEARCH_TO_USER_THREAT = new SplunkPivot(
    searchAndShape(
        {
            connections: ['user', 'threat_name'],
            attributes: PAN_SHAPES.userToThreat.attributes
        }
    )
);

const contextFilter = '(severity="critical" OR severity="medium" OR severity="low")';

export const PAN_EXPAND_USER_TO_THREAT = new SplunkPivot(
    expandOnEntityAndShape(
        {
            source: 'user',
            target:'threat_name',
            attributes: PAN_SHAPES.userToThreat.attributes,
            filter: contextFilter
        }
    )
);
