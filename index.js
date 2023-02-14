// ==============node_modules==============

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

// ==============original functions==============

const unitConversion = require('./functions/unitCoversion');
const email = require('./functions/email');
const isError = require('./functions/isError');

// ==============express==============

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

// ==============mysql==============

const con = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

con.connect((err) => {
  if (err) throw err;
  console.log('Connected');
});


// ==============sql function==============

const insertSql = (reqList) => {
  con.query(
    `insert into accumulations
    (
      device_id,
      sum_volt,
      load_volt,
      current,
      soc,
      temp,
      cell_1,
      cell_2,
      cell_3,
      cell_4,
      cell_5,
      cell_6,
      cell_7,
      cell_8,
      cell_9,
      cell_10,
      cell_11,
      cell_12,
      cell_13,
      cell_14,
      cell_15,
      cell_16,
      cell_17,
      cell_18,
      cell_19,
      cell_20,
      error_1,
      error_2,
      error_3,
      error_4,
      error_5,
      error_6,
      error_7,
      error_8,
      created_at
    )
    values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)  
    `,
    [
      reqList.device_id,
      reqList.sum_volt,
      reqList.load_volt,
      reqList.current,
      reqList.soc,
      reqList.temp,
      reqList.cell_1,
      reqList.cell_2,
      reqList.cell_3,
      reqList.cell_4,
      reqList.cell_5,
      reqList.cell_6,
      reqList.cell_7,
      reqList.cell_8,
      reqList.cell_9,
      reqList.cell_10,
      reqList.cell_11,
      reqList.cell_12,
      reqList.cell_13,
      reqList.cell_14,
      reqList.cell_15,
      reqList.cell_16,
      reqList.cell_17,
      reqList.cell_18,
      reqList.cell_19,
      reqList.cell_20,
      reqList.error_1,
      reqList.error_2,
      reqList.error_3,
      reqList.error_4,
      reqList.error_5,
      reqList.error_6,
      reqList.error_7,
      reqList.error_8,
      reqList.created_at
    ],
    (err, result) => {
      if(err) throw `in insertSql sql error: ${err}`;
      return `${result.insertId} is inserted` 
    }
  );
}

const checkError = (id, deviceName, errorsList, soc) => {
  con.query('select email from emails where device_id=?', [id], (err, result) => {
    if(err) throw `in checkError sql error: ${err}`;
    // エラーフラッグが立っていたらメール通知を行う
    isError.digitalErrorCheck(deviceName, errorsList, result[0].email);

    // 残容量が30％以上の場合メール通知を行う
    if(Number(soc) <= process.env.LIMMIT_SOC) {
      isError.socErrorCheck(deviceName, Number(soc), result[0].email);
    }
  });
}

// ==============route==============

app.post('/daly_bms/insert', (req, res) => {
  
  // マイコンから届いた通信の中にあるパスワードを確認し、環境変数である.envファイルのAPI_KEYと一致しなかったら処理をストップする
  if(req.header('x-api-key') !== process.env.API_KEY) return res.json('処理は実行されませんでした');

  let reqList = {
    device_name: req.body.device_name,
    sum_volt: unitConversion.toATenthFunc(req.body.SumVolt),
    load_volt: unitConversion.toATenthFunc(req.body.LoadVolt),
    current: req.body.Current,
    soc: req.body.SOC,
    temp: req.body.Temp,
    cell_1: unitConversion.toMilliFunc(req.body.Cell_01),
    cell_2: unitConversion.toMilliFunc(req.body.Cell_02),
    cell_3: unitConversion.toMilliFunc(req.body.Cell_03),
    cell_4: unitConversion.toMilliFunc(req.body.Cell_04),
    cell_5: unitConversion.toMilliFunc(req.body.Cell_05),
    cell_6: unitConversion.toMilliFunc(req.body.Cell_06),
    cell_7: unitConversion.toMilliFunc(req.body.Cell_07),
    cell_8: unitConversion.toMilliFunc(req.body.Cell_08),
    cell_9: unitConversion.toMilliFunc(req.body.Cell_09),
    cell_10: unitConversion.toMilliFunc(req.body.Cell_10),
    cell_11: unitConversion.toMilliFunc(req.body.Cell_11),
    cell_12: unitConversion.toMilliFunc(req.body.Cell_12),
    cell_13: unitConversion.toMilliFunc(req.body.Cell_13),
    cell_14: unitConversion.toMilliFunc(req.body.Cell_14),
    cell_15: unitConversion.toMilliFunc(req.body.Cell_15),
    cell_16: unitConversion.toMilliFunc(req.body.Cell_16),
    cell_17: unitConversion.toMilliFunc(req.body.Cell_17),
    cell_18: unitConversion.toMilliFunc(req.body.Cell_18),
    cell_19: unitConversion.toMilliFunc(req.body.Cell_19),
    cell_20: unitConversion.toMilliFunc(req.body.Cell_20),
    error_1: req.body.Error_1,
    error_2: req.body.Error_2,
    error_3: req.body.Error_3,
    error_4: req.body.Error_4,
    error_5: req.body.Error_5,
    error_6: req.body.Error_6,
    error_7: req.body.Error_7,
    error_8: req.body.Error_8,
    created_at: req.body.DataTime
  };

  // デジタル信号エラーチェック関数に渡す引数として利用する
  const errorsList = [
    {errors_1: Number(reqList.error_1)},
    {errors_2: Number(reqList.error_2)},
    {errors_3: Number(reqList.error_3)},
    {errors_4: Number(reqList.error_4)},
    {errors_5: Number(reqList.error_5)},
    {errors_6: Number(reqList.error_6)},
    {errors_7: Number(reqList.error_7)},
    {errors_8: Number(reqList.error_8)},
  ];

  // device_nameがdevicesに登録されている場合はidを取得、登録されていない場合は新規登録してidを取得する
  con.query('select * from devices', (devices_err, devices_result) => {
    if(devices_err) throw `device_sql error: ${devices_err}`;
    
    let device_obj = {};

    // devicesのデータのkeyとvalueを入れ替えてdevice_objに格納
    devices_result.forEach(device => {
      device_obj[device.device_name] = device.id; 
    });

    // req.body.device_nameが既にDBに登録されているか確認。無い場合は新たなデバイスとして登録して外れ値チェックを飛ばしてデータ登録
    if(req.body.device_name in device_obj === false) {
      con.query('insert into devices (device_name) values (?)', [req.body.device_name], (device_err, device_result) => {
        if(device_err) throw `device_insert_sql error: ${device_err}`;
        reqList['device_id'] = device_result.insertId;
        con.query('insert into emails(device_id, email) values(?,?)', [reqList['device_id'], process.env.INSERT_DEFAULT_EMAIL], (email_err, email_result) => {
          if(email_err) throw `email_insert_sql error: ${email_err}`;
        });
        insertSql(reqList);
        checkError(reqList.device_id, eq.body.device_name, errorsList, reqList.soc);

      });
      return res.json('new device');
    } else {
      // デバイスが既に登録されている場合
      reqList['device_id'] = device_obj[req.body.device_name];
      insertSql(reqList);
      checkError(reqList.device_id, eq.body.device_name, errorsList, reqList.soc);

      return res.json('add data');
    }
  });
});


// ==============node-cron==============
// 2分,12分,22分,32分,42分,52分と2分から10分おきにデータが登録されているか確認し、新しいデータが登録されていない場合はアラート通知を飛ばす
cron.schedule('1 2,12,22,32,42,52 * * * *', () => {
  const date = new Date();
  con.query('select id from devices', (device_err, device_result) => {
    if(device_err) throw `in cron device_err : ${device_err}`;
    let device_id_list = [];
    if(device_err) console.log(device_err);
    device_result.forEach(e => {
      device_id_list.push(e['id']);
    });
    device_id_list.forEach(e => {
      con.query('select created_at from accumulations where device_id = ? order by id desc limit 1', [e], (err, result) => {
        if(err) throw `in cron created_at error : ${err}`;
        console.log(e);
        if(typeof result[0] !== 'undefined') {
          const span = date - result[0]['created_at'];
          console.log(span);
          if(span > 600000) {
            con.query('select email from emails where device_id=?', [e], (email_err, email_result) => {
              if(email_err) throw `in cron email_select_error: ${email_err}`;
              con.query('select device_name from devices where id = ?', [e], (device_name_err, device_name_result) => {
                if(device_name_err) console.log(`device_name_error: ${device_name_err}`);
                const to = email_result[0].email;
                const cc = process.env.CC_EMAIL;
                const subject = 'データ登録機能が正常に動作していない可能性があります';
                const body = `
                  <h3>Error : データ登録がありません</h3>
                  <P>10分起きのデータ登録がありませんした。デバイスの状況確認をお願いします。</p>
                  <p>デバイス名：${device_name_result[0]['device_name']}
                `;
                email.sendEmail(to, cc, subject, body);
              });
            });
          }
        }
      });
    });
  });
});


//portを開く
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`);
});