const fs = require('fs');
const _ = require('lodash');
const shuffleSeed = require('shuffle-seed');

function extractColumns(data, columnNames) {
  const headers = _.first(data);

  const indexes = _.map(columnNames, column => headers.indexOf(column));
  const extracted = _.map(data, row => _.pullAt(row, indexes));

  return extracted;
};

function loadCSV(fileName, { dataColumns = [], labelColumns = [], shuffle = true, splitTest = false, converters = {} }) {
  let data = fs.readFileSync(fileName, {encoding: 'utf-8'});
  data = data.split('\n').map(row => row.split(','));
  data = data.map(row => _.dropRightWhile(row, val => val === ''));
  const headers = _.first(data);

  data = data.map((row, index) => {
    if (index === 0) {
      return row;
    };
    
    return row.map((element, index) => {
      if(converters[headers[index]]) {
        const converted = converters[headers[index]](element);
        return _.isNaN(converted) ? element : converted;
      }

      const result = parseFloat(element);
      return _.isNaN(result) ? element : result;
    });
  });

  let labels = extractColumns(data, labelColumns);
  data = extractColumns(data, dataColumns);

  labels.shift();
  data.shift();

  if (shuffle) {
    labels = shuffleSeed.shuffle(labels, 'phrase');
    data = shuffleSeed.shuffle(data, 'phrase');
  };

  if (splitTest) {
    const trainSize = _.isNumber(splitTest) ? splitTest : Math.floor(data.length / 2);

    return {
      labels: labels.slice(0, trainSize),
      features: data.slice(0, trainSize),
      testLabels: labels.slice(trainSize),
      testFeatures: data.slice(trainSize)
    };
  } else {
    return { features: labels, data};
  };
};

const {labels, features, testLabels, testFeatures} = loadCSV('data.csv', {
  dataColumns: ['height', 'value'],
  labelColumns: ['passed'],
  shuffle: true,
  splitTest: 1,   // can be a number or a boolean
  converters: {
    passed: val => val === 'TRUE'
  }
});

console.log('labels: ', labels);
console.log('features: ', features);
console.log('testLabels: ', testLabels);
console.log('testFeatures: ', testFeatures);
