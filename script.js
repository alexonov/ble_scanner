let rawData = [];

initApp();

const parseHeartRateValues = (data) => {
    // В Chrome 50+ используется DataView.
    const value = data.buffer ? data : new DataView(data);
    const flags = value.getUint8(0);
  
    // Определяем формат
    const rate16Bits = flags & 0x1;
    const result = {};
    let index = 1;
  
    // Читаем в зависимости от типа
    if (rate16Bits) {
      result.heartRate = value.getUint16(index, /* littleEndian= */true);
      index += 2;
    } else {
      result.heartRate = value.getUint8(index);
      index += 1;
    }
  
    // RR интервалы
    const rrIntervalPresent = flags & 0x10;
    if (rrIntervalPresent) {
      const rrIntervals = [];
      for (; index + 1 < value.byteLength; index += 2) {
        rrIntervals.push(value.getUint16(index, /* littleEndian= */true));
      }
      result.rrIntervals = rrIntervals;
    }
  
    return result;
  };

function initApp() {
    const btn = document.querySelector("[start-button]");
    btn.addEventListener('click', onButtonClick);
}

function log(message) {
    console.log(message);
}

function onButtonClick() {
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

function handleCharacteristicValueChanged(e) {
    const value = parseHeartRateValues(e.target.value).rrIntervals;
    rawData.push(value);
    log(value);
    
}

function pushData(index, value) {
    heartRateData[index].push({
        x: Date.now(),
        y: value
    });
    heartRateData = [...heartRateData];
}