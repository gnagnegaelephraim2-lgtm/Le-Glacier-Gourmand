const https = require('https');

const data = JSON.stringify({
  name: 'glacier_gourmand_unsigned',
  unsigned: true,
  folder: 'products'
});

const options = {
  hostname: 'api.cloudinary.com',
  port: 443,
  path: '/v1_1/aworuara/upload_presets',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from('356256677558187:wJJX5DpR7BWLtpHyzunIO-iqGiU').toString('base64'),
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let resData = '';
  res.on('data', d => { resData += d; });
  res.on('end', () => {
    console.log('Response:', resData);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
