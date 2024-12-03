const axios = require("axios")
const express = require("express")
const app = express()
const crypto = require("crypto")
const cors = require('cors');
const moment = require("moment/moment");
const CryptoJS = require("crypto-js");
const qs = require("qs");


app.use(express.json()); // Thêm dấu ngoặc tròn ở đây
app.use(express.urlencoded({extended: true})); // Thêm dấu ngoặc tròn ở đây
app.use(cors({
    origin: 'http://localhost:3000', // Chỉ cho phép yêu cầu từ localhost:3000
    methods: ['GET', 'POST'],       // Các phương thức HTTP được phép
    allowedHeaders: ['Content-Type', 'Authorization'], // Các header được phép
}));


app.post("/momo/payment/:amount", async (req, res) => {
    {
        //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
        //parameters
        var accessKey = 'F8BBA842ECF85';
        var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        var orderInfo = 'pay with MoMo';
        var partnerCode = 'MOMO';
        var redirectUrl = 'http://localhost:3000/success';
        var ipnUrl = 'https://7f4f-1-53-50-45.ngrok-free.app/momo/callback';
        var requestType = "payWithMethod";
        var amount = req.params.amount;
        var orderId = partnerCode + new Date().getTime();
        var requestId = orderId;
        var extraData = '';
        // var paymentCode = 'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==';
        var orderGroupId = '';
        var autoCapture = true;
        var lang = 'vi';

        //before sign HMAC SHA256 with format
        //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
        var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;
//puts raw signature
        console.log("--------------------RAW SIGNATURE----------------")
        console.log(rawSignature)
//signature
        const crypto = require('crypto');
        var signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');
        console.log("--------------------SIGNATURE----------------")
        console.log(signature)

//json object send to MoMo endpoint
        const requestBody = JSON.stringify({
            partnerCode: partnerCode,
            partnerName: "Test",
            storeId: "MomoTestStore",
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            lang: lang,
            requestType: requestType,
            autoCapture: autoCapture,
            extraData: extraData,
            orderGroupId: orderGroupId,
            signature: signature
        });

        const options = {
            method: "post",
            url: "https://test-payment.momo.vn/v2/gateway/api/create",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(requestBody)
            },
            data: requestBody
        }

        let result;
        try {
            result = await axios(options)
            return res.status(200).json(result.data)
        } catch (error) {
            return res.status(500).json({
                statusCode: 500,
                messages: "Server error"
            })
        }
    }
})

const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 8080});

let clients = [];





app.post("/momo/callback", async (req, res) => {
    console.log("callback:: ")
    console.log(req.body);

    return res.status(200).json(req.body)
})


// app.post("/momo/callback", async (req,res) => {
//     console.log("callback:: ")
//     console.log(req.body);
//     // clients.forEach((client) => {
//     //     if (client.readyState === WebSocket.OPEN) {
//     //         client.send(JSON.stringify(req.body));
//     //     }
//     // });
//
//     return res.status(200).json(req.body)
// })

app.post("")


//ZaloPay
const config = {
    app_id: "554",
    key1: "8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn",
    key2: "uUfsWgfLkRLzq6W2uNXTCxrfxs51auny",
    endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};

app.post('/zalopay/payment', async (req, res) => {
    const embed_data = {
        //sau khi hoàn tất thanh toán sẽ đi vào link này (thường là link web thanh toán thành công của mình)
        redirecturl: 'http://localhost:3000/success',
    };

    const items = [];
    const transID = Math.floor(Math.random() * 1000000);

    const order = {
        app_id: config.app_id,
        app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
        app_user: 'user123',
        app_time: Date.now(), // miliseconds
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: 50000,
        //khi thanh toán xong, zalopay server sẽ POST đến url này để thông báo cho server của mình
        //Chú ý: cần dùng ngrok để public url thì Zalopay Server mới call đến được
        callback_url: 'https://7f4f-1-53-50-45.ngrok-free.app/zalopay/callback',
        description: `Lazada - Payment for the order #${transID}`,
        bank_code: '',
    };

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data =
        config.app_id +
        '|' +
        order.app_trans_id +
        '|' +
        order.app_user +
        '|' +
        order.amount +
        '|' +
        order.app_time +
        '|' +
        order.embed_data +
        '|' +
        order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    try {
        const result = await axios.post(config.endpoint, null, {params: order});
        console.log("data : ", result.data)
        return res.status(200).json(result.data);
    } catch (error) {
        console.log(error);
    }
});

/**
 * method: POST
 * description: callback để Zalopay Server call đến khi thanh toán thành công.
 * Khi và chỉ khi ZaloPay đã thu tiền khách hàng thành công thì mới gọi API này để thông báo kết quả.
 */
app.post('/zalopay/callback', (req, res) => {
    let result = {};
    console.log(req.body);
    try {
        let dataStr = req.body.data;
        let reqMac = req.body.mac;

        let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
        console.log('mac =', mac);

        // kiểm tra callback hợp lệ (đến từ ZaloPay server)
        if (reqMac !== mac) {
            // callback không hợp lệ
            result.return_code = -1;
            result.return_message = 'mac not equal';
        } else {
            // thanh toán thành công
            // merchant cập nhật trạng thái cho đơn hàng ở đây
            let dataJson = JSON.parse(dataStr, config.key2);
            console.log(
                "update order's status = success where app_trans_id =",
                dataJson['app_trans_id'],
            );

            result.return_code = 1;
            result.return_message = 'success';
        }
    } catch (ex) {
        console.log('lỗi:::' + ex.message);
        result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
        result.return_message = ex.message;
    }

    // thông báo kết quả cho ZaloPay server
    res.json(result);
});

/**
 * method: POST
 * Sandbox	POST	https://sb-openapi.zalopay.vn/v2/query
 * Real	POST	https://openapi.zalopay.vn/v2/query
 * description:
 * Khi user thanh toán thành công,
 * ZaloPay sẽ gọi callback (notify) tới merchant để merchant cập nhật trạng thái
 * đơn hàng Thành Công trên hệ thống. Trong thực tế callback có thể bị miss do lỗi Network timeout,
 * Merchant Service Unavailable/Internal Error...
 * nên Merchant cần hiện thực việc chủ động gọi API truy vấn trạng thái đơn hàng.
 */

app.post('/check-status-order', async (req, res) => {
    const {app_trans_id} = req.body;

    let postData = {
        app_id: config.app_id,
        app_trans_id, // Input your app_trans_id
    };

    let data = postData.app_id + '|' + postData.app_trans_id + '|' + config.key1; // appid|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    let postConfig = {
        method: 'post',
        url: 'https://sb-openapi.zalopay.vn/v2/query',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify(postData),
    };

    try {
        const result = await axios(postConfig);
        console.log(result.data);
        return res.status(200).json(result.data);
        /**
         * kết quả mẫu
         {
         "return_code": 1, // 1 : Thành công, 2 : Thất bại, 3 : Đơn hàng chưa thanh toán hoặc giao dịch đang xử lý
         "return_message": "",
         "sub_return_code": 1,
         "sub_return_message": "",
         "is_processing": false,
         "amount": 50000,
         "zp_trans_id": 240331000000175,
         "server_time": 1711857138483,
         "discount_amount": 0
         }
         */
    } catch (error) {
        console.log('lỗi');
        console.log(error);
    }
});


app.listen(5000, () => {
    console.log("server is running at port 5000")
})