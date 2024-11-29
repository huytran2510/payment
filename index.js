const axios = require("axios")
const express = require("express")
const app = express()
const crypto = require("crypto")

app.use(express.json()); // Thêm dấu ngoặc tròn ở đây
app.use(express.urlencoded({ extended: true })); // Thêm dấu ngoặc tròn ở đây
app.post("/momo/payment", async (req, res) => {
    {
        //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
        //parameters
        var accessKey = 'F8BBA842ECF85';
        var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        var orderInfo = 'pay with MoMo';
        var partnerCode = 'MOMO';
        var redirectUrl = 'http://localhost:3000/menu';
        var ipnUrl = 'https://09a6-42-119-80-31.ngrok-free.app/callback';
        var requestType = "payWithMethod";
        var amount = '50000';
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
            url :"https://test-payment.momo.vn/v2/gateway/api/create",
            headers: {
                "Content-Type" : "application/json",
                "Content-Length" : Buffer.byteLength(requestBody)
            },
            data: requestBody
        }

        let result;
        try {
            result = await axios(options)
            return res.status(200).json(result.data)
        } catch (error){
            return res.status(500).json({
                statusCode: 500,
                messages: "Server error"
            })
        }
    }
})

app.post("/momo/callback", async (req,res) => {
    console.log("callback:: ")
    console.log(req.body);

    return res.status(200).json(req.body)
})

app.post("")




app.listen(5000, () => {
    console.log("server is running at port 5000")
})