const email = require('./email');

// デジタル信号エラーチェック
exports.digitalErrorCheck = (device_name, arr, to) => {
  const mailList = [];
  arr.forEach((e, index) => {
    if(e[`errors_${index+1}`] !== 0) mailList.push(`errors_${index+1}`);
  });

  if(mailList.length !== 0) {
    const errorsResult =  mailList.join('\n');
  
    const cc = 'arikawa@kkhamada.co.jp';
    const subject = '【bms】デジタル信号のエラーフラッグが立ちました';
    const body = `デジタル信号のエラーフラッグが立っております。\nエラー内容は下記の通りです。\n\n■デバイスID\n${device_name}\n\n■エラー箇所\n${errorsResult}\n\nエラー内容の確認をお願いいたします。`
  
    email.sendEmail(to, cc, subject, body);
  }
};

// 残量チェック関数
exports.socErrorCheck = (device_name, soc, to) => {
  const cc = 'arikawa@kkhamada.co.jp';
  const subject = '【bms】バッテリー残量が30％以下になりました';
  const body = `下記IDのバッテリー残量が30％以下になりました。\n\n■デバイスID\n${device_name}\n\n■バッテリー残量\n${soc}％`

  email.sendEmail(to, cc, subject, body);
}