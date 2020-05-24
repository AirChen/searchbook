function onRequest(request, response, modules) {
    var token = "wechat";         //这里的值必须与在微信公众号后台填入的token值一致
    var crypto = modules.oCrypto; //使用加解密模块
    var httptype = modules.oHttptype;　//获取调用云函数的是post或者get方式
    var xml2js = modules.oXml2js;　//实现xml和js格式之间的相互转换
    var db = modules.oData;         //数据库对象
    var http = modules.oHttp;

    let sendText = text => {
        //构造公众号后台所需要的xml格式，并返回给公众号后台  
        var result = {
            xml: {
            ToUserName: request.body.xml.FromUserName,
            FromUserName: request.body.xml.ToUserName ,
            CreateTime: new Date().getTime(),
            MsgType: 'text',
            Content: text
            }
        }
        var builder = new xml2js.Builder();
        var xml = builder.buildObject(result); //利用模块xml2js，把json对象转换为一个xml文本
        response.set('Content-Type', 'text/xml'); //设置返回的http header
        response.end(xml);
    }

    if ("get" == httptype) {
        　//是get方法,则是微信验证回调的url是否有效
          var oriStr = [token, request.query.timestamp, request.query.nonce].sort().join('')
          var code = crypto.createHash('sha1').update(oriStr).digest('hex');
          if (code == request.query.signature) {　//验证通过，输出
              response.end(request.query.echostr);
          } else {
              response.end("Unauthorized");
          }
    } else {
           //是post,接收定阅者发送过来的消息后返回，把反馈意见存储表“message”中。
            db.insert({
              "table":"message",             //表名
              "data":{"userId":request.body.xml.FromUserName, "content":request.body.xml.Content}           
            },function(err,data) {                   
                let content = request.body.xml.Content
                if (content == '天气') {
                    http('http://wttr.in/BeiJing?format=3', function (error, res, body) {
                        sendText(body)
                    });
                } else {
                    sendText('你好，你发送的反馈内容「' + request.body.xml.Content + '」已收到。')
                }
            });
    }
} 