import {
    parseHeartRateValues
} from './process.js';

import {
    MOCK_DATA
} from './mockData.js';

/*************************************************************
   configuration
 *************************************************************/

const MODES = {
    MOCK: 0,
    REAL: 1
}

const CURRENT_MODE = MODES.MOCK;

/*************************************************************
   variables
 *************************************************************/

const STATES = {
    OFF: 0,
    ON: 1
};

let currentState = STATES.OFF;

let rawData = [];


/*************************************************************
    functions
 *************************************************************/

const log = message => {
    console.log(message);
}

const pushData = dataPoints => {
    if(Array.isArray(dataPoints)) {
        dataPoints.forEach(p => {
            if (p) {
                rawData.push(p);
                log(p);
            }
        })
    } else {
        rawData.push(dataPoints);
        log(dataPoints);
    }
}

const startService = () => {
    navigator.bluetooth.requestDevice({
            filters: [{
                services: ['heart_rate']
            }],
        })
        .then(device => device.gatt.connect())
        .then(server => server.getPrimaryService('heart_rate'))
        .then(service => service.getCharacteristic('heart_rate_measurement'))
        .then(characteristic => characteristic.startNotifications())
        .then(characteristic => characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged))
        .catch(error => console.log(error));
};

const startMockService = () => {
    let i = 0;
    currentState = STATES.ON;

    const mocker = function () {
        if (currentState === STATES.ON) {

            // get previous rr interval and persist
            const previousDataPoint = MOCK_DATA[i % MOCK_DATA.length];
            pushData(previousDataPoint);

            // set up next callback
            const dataPoint = MOCK_DATA[++i % MOCK_DATA.length];
            setTimeout(mocker, dataPoint);
        }
    }

    setTimeout(mocker, MOCK_DATA[i % MOCK_DATA.length]);
}

const onStartClick = e => {
    e.target.classList.add('active');

    const btns = document.querySelectorAll('[start-options] button');
    btns.forEach(b => {
        b.classList.add('disabled');
    });

    switch (e.target.id) {
        case 'start-sensor':
            startService();
            break;

        case 'start-mock':
            startMockService();
            break;

        default:
            break;
    }
}

const renderPlot = () => {

}

const handleCharacteristicValueChanged = e => {
    const value = parseHeartRateValues(e.target.value).rrIntervals;
    rawData.push(value);
    log(value);



}

const initApp = () => {
    const btns = document.querySelectorAll('[start-options] button');
    btns.forEach(b => {
        b.addEventListener('click', onStartClick);
    });
}



/*************************************************************
    main flow
 *************************************************************/

document.addEventListener('DOMContentLoaded', initApp);