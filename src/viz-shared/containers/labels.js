import { Settings } from 'viz-shared/containers/settings';
import { container } from '@graphistry/falcor-react-redux';
import {
    Label as LabelComponent,
    Labels as LabelsComponent
} from 'viz-shared/components/labels';

import {
    addFilter,
    selectLabel,
    addExclusion,
} from 'viz-shared/actions/labels';

let Label = container({
    fragment: () => `{
        type, index, title, columns
    }`,
    dispatchers: {
        onFilter: addFilter,
        onExclude: selectLabel,
        onPinChange: addExclusion,
    }
})(LabelComponent);

const onClick = ({ type, title }) => {
   console.log('clicked', {type, title});
};

const onFilter = ({ type, field, value }) => {
   console.log('click filter', {type, field, value});
};

const onExclude = ({ type, field, value }) => {
   console.log('click exclude', {type, field, value});
};

const onPinChange = ({ type, title }) => {
   console.log('click pin change', {type, title});
};

let Labels = ({ simulating,
                labelMouseMove,
                labelTouchStart,
                sceneSelectionType,
                enabled, poiEnabled, opacity,
                foreground: { color: color } = {},
                background: { color: background } = {},
                point = [], highlight, selection, ...props }) => {

    let labels = [];

    if (enabled) {
        if (poiEnabled && point && point.length) {
            labels = point.slice(0);
            // console.log(`rendering point labels`, labels);
        }
        if (selection && highlight && (
            selection.type === highlight.type) && (
            selection.index === highlight.index)) {
            highlight = undefined;
        }
        highlight && labels.push(highlight);
        selection && labels.push(selection);
    }

    return (
        <LabelsComponent labels={labels}
                         enabled={enabled}
                         highlight={highlight}
                         selection={selection}
                         poiEnabled={poiEnabled}
                         {...props}>
        {enabled && labels.filter(Boolean).map((label, index) =>
            <Label data={label}
                   color={color}
                   opacity={opacity}
                   key={`label-${index}`}
                   simulating={simulating}
                   background={background}
                   pinned={label === selection}
                   onMouseMove={labelMouseMove}
                   onTouchStart={labelTouchStart}
                   sceneSelectionType={sceneSelectionType}
                   showFull={label === highlight || label === selection}/>
        ) || []}
        </LabelsComponent>
    );
};

Labels = container({
    fragment: ({ edge = [], point = [], settings } = {}) => `{
        id, name, timeZone,
        opacity, enabled, poiEnabled,
        ['background', 'foreground']: { color },
        ...${ Settings.fragment({ settings }) },
        ['highlight', 'selection']: ${
            Label.fragment()
        },
        point: {
            length, [0...${point.length || 0}]: ${
                Label.fragment()
            }
        }
    }`,
})(Labels);

export { Labels, Label }
