exports.toMilliFunc = (num) => {
  const result = (Number(num) / 1000).toFixed(3);
  return result;
};

exports.toATenthFunc = (num) => {
  const result = (Number(num) / 10).toFixed(1);
  return result;
};
