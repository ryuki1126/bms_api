const AWS = require('aws-sdk');
require('dotenv').config();

// メールを送信する関数
exports.sendEmail = (to, cc, subject, body) => {
  const config = {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION  
  };

  const ses = new AWS.SES(config);
  const from = process.env.FROM_EMAIL;

  const params = {
    // From
    Source: from,
    // To
    Destination: {
      CcAddresses: [
        cc,
      ],
      ToAddresses: [
        to,
      ]
    },
    // contents
    Message: {
      Subject: {
        Data: subject
      },
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      }
    }
  };
  ses.sendEmail(params, (err, data) => {
    err ? console.log(err, err.stack) : console.log(data);
  });
};
