import request from 'request';
import axios from 'axios';
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function parserProxyString(proxystring) {
    proxystring = proxystring || ""
    let authInfoI = ""
    let proxyAddressI = proxystring
    proxystring = proxystring.replace("https://", "").replace("http://", "")
    if ((proxystring || "").includes("@")) {
        const [authInfo, proxyAddress] = proxystring.split('@');
        proxyAddressI = proxyAddress;
        authInfoI = authInfo
    }
    const [username, password] = authInfoI.split(':');
    const [host, port] = proxyAddressI.split(':');
    if (port && host)
        return { "protocol": "http", username, password, host, port }
}
async function getEmailTempIOExist(email_input,proxy_list=null) {
    try{
        let proxy = "";
        let data_email = email_input.split('@')
        let name_email = data_email[0]
        let domain_email = data_email[1]
        if(proxy_list && proxy_list.length){
            proxy = proxy_list[Math.floor(Math.random() * proxy_list.length)];
        }
        let url = `https://api.internal.temp-mail.io/api/v3/email/new`
        let data_post = {"name": name_email, "domain": domain_email}
        let res = await makeRequest({
            url, 
            headers: {
                "Application-Name": "web",
                "sec-ch-ua-platform": "macOS",
                "Application-Version": "4.0.0",
                "Referer": "https://temp-mail.io/",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
                "Content-Type": "application/json"
            }, 
            method: "POST", 
            body: JSON.stringify(data_post),
            proxy: proxy,
            proxy_list: proxy_list
        })
        let { body, bodyJson, status, headers, error} = res;
        //{"email":"ebpzwdc8sy@wnbaldwy.com","token":"aktXZvXHgLynvfF7VyH4"}
        if(!body) return false;
        let { email, token } = bodyJson;
        console.log("getEmailTempIOExist",bodyJson)
        return {email, token, status: true}
    }catch(e){
        console.log("error getEmailTempIOExist",e)
        return false
    }
}
async function getMessageTempIO({email,token, proxy_list=null}) {
    
    try{
        let proxy = "";
        if(proxy_list && proxy_list.length){
            proxy = proxy_list[Math.floor(Math.random() * proxy_list.length)];
        }
        let url = `https://api.internal.temp-mail.io/api/v3/email/${email}/messages`
        // console.log(url)
        let res = await makeRequest({url, headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }, method: "GET", proxy: proxy, proxy_list: proxy_list})
        let { body, bodyJson, status, headers, error} = res;
        /**
     * bodyJson = [
    {
        "id": "bf80b590-c1ca-433a-8321-be467c5c1037",
        "from": "\"TikTok\" \u003cnoreply@account.tiktok.com\u003e",
        "to": "wwx0pxgwl1@ibolinva.com",
        "cc": null,
        "subject": "642531 là mã xác minh của bạn",
        "body_text": "Mã xác minh\n\nĐể xác minh tài khoản của bạn, hãy nhập mã này vào TikTok:\n\n642531\n\nMã xác minh hết hạn sau 48 giờ.\n\nNếu bạn không yêu cầu mã, bạn có thể bỏ qua tin nhắn này.\n\nNhóm Hỗ trợ TikTok\n\nTrung tâm Trợ giúp TikTok: https://support.tiktok.com/\n\nBạn có câu hỏi?\nHãy xem mục trung tâm trợ giúp hoặc liên hệ với chúng tôi trong ứng dụng bằng cách sử dụng Cài đặt \u003e Báo cáo Vấn đề.\nĐây là email được tạo tự động. Thư trả lời gửi đến địa chỉ email này không được giám sát.\n\nChính sách Quyền riêng tư ( https://www.tiktok.com/en/privacy-policy?lang=vi )\nTikTok, 10100 Venice Bivd, Culver City, CA 90232",
        "body_html": "\u003chtml class=\"vi\"\u003e\n\n\u003chead\u003e\n  \u003cmeta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"\u003e\n  \u003cmeta name=\"viewport\"\n    content=\"width-device-width,initial-scale=1.0,maximum-scale=1.0, minimum-scale=1.0,user-scalable=no, minimal-ui\"\u003e\n  \u003cstyle\u003e\n    * {\n      margin: 0;\n      font-family: Helvetica;\n      box-sizing: border-box;\n    }\n\n    a {\n      text-decoration: none;\n      background-color: transparent;\n      outline: none;\n      cursor: pointer;\n    }\n\n    html.ar {\n      direction: rtl;\n    }\n\n    html.ar input {\n      text-align: right;\n    }\n  \u003c/style\u003e\n\u003c/head\u003e\n\n\u003cbody style=\"display: flex; justify-content: center;\"\u003e\n  \u003cdiv style=\"width:100%;max-width: 440px; padding: 0 20px;\"\u003e\n    \u003cdiv style=\"width: 100%; padding: 40px 7px;\"\u003e\n      \u003cimg style=\"width: 150px;\"\n        src=\"http://p16-tiktokcdn-com.akamaized.net/obj/tiktok-obj/f70f9d0dc867d6c71ce2cd684a0ffff0\"\n        style=\"margin: 40px 12px 40px 12px; width: 150px; height: 40px;\"\u003e\n    \u003c/div\u003e\n    \u003cdiv\n      style=\"max-width:100%;background-color: #f1f1f1; padding: 20px 16px; font-weight: bold;font-size: 20px;color: rgb(22,24, 35)\"\u003e\n      Mã xác minh\n    \u003c/div\u003e\n    \u003cdiv\n      style=\"max-width:100%;background-color: #f8f8f8; padding: 24px 16px;font-size: 17px;color: rgba(22,24, 35, 0.75);line-height: 20px;\"\u003e\n      \u003cp style=\"margin-bottom:20px;\"\u003eĐể xác minh tài khoản của bạn, hãy nhập mã này vào TikTok:\u003c/p\u003e\n      \u003cp style=\"margin-bottom:20px;color: rgb(22,24,35);font-weight: bold;\"\u003e642531\u003c/p\u003e\n      \u003cp style=\"margin-bottom:20px;\"\u003eMã xác minh hết hạn sau 48 giờ.\u003c/p\u003e\n      \u003cp style=\"margin-bottom:20px;\"\u003eNếu bạn không yêu cầu mã, bạn có thể bỏ qua tin nhắn này.\u003c/p\u003e\n\n      \u003cp\u003eNhóm Hỗ trợ TikTok\u003c/p\u003e\n      \u003cp style=\"word-break: break-all;\"\u003e\n        Trung tâm Trợ giúp TikTok: \n        \u003ca style=\"color: rgb(0, 91, 158);\" href=\"https://support.tiktok.com/\"\u003ehttps://support.tiktok.com/\u003c/a\u003e\n      \u003c/p\u003e\n    \u003c/div\u003e\n\n    \u003cdiv style=\"max-width:100%;padding: 40px 16px 20px;font-size: 15px;color: rgba(22, 24, 35, 0.5);line-height:18px;\"\u003e\n      \u003cdiv\u003eBạn có câu hỏi?\u003c/div\u003e\n      \u003cdiv style=\"margin-bottom:20px;\"\u003eHãy xem mục trung tâm trợ giúp hoặc liên hệ với chúng tôi trong ứng dụng bằng cách sử dụng\n        \u003cspan style=\"color: rgb(0, 91, 158);font-weight: bold;\"\u003eCài đặt \u0026gt; Báo cáo Vấn đề.\u003c/span\u003e\u003c/div\u003e\n      \u003cdiv\u003eĐây là email được tạo tự động. Thư trả lời gửi đến địa chỉ email này không được giám sát.\u003c/div\u003e\n    \u003c/div\u003e\n    \u003cdiv style=\"border: 0; background-color: rgba(0, 0, 0, 0.12); height: 1px;margin-bottom:16px;\"\u003e\u003c/div\u003e\n    \u003cdiv style=\"color: rgba(22, 24, 35, 0.5); margin: 20px 16px 40px 16px;font-size: 12px;line-height:18px;\"\u003e\n      \u003cdiv style=\"word-break: break-all;\"\u003e\n        \u003ca style=\"color: rgba(22, 24, 35, 0.5);text-decoration:underline;\"\n          href=\"https://www.tiktok.com/en/privacy-policy?lang=vi\"\u003eChính sách Quyền riêng tư\n        \u003c/a\u003e\n      \u003c/div\u003e\n      \u003cdiv\u003eTikTok, 10100 Venice Bivd, Culver City, CA 90232\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n  \u003c/div\u003e\n\u003cimg src=\"http://url7709.account.tiktok.com/wf/open?upn=u001.Tmk6aTS-2B7KoyOfOJyjlmlA6IJA1GE6Lb3a1v86GeasKdxPtoKsqRVKDzSIsxDkJA-2F-2FrQKZdhmPYdlNbFTsNd4GWUHxDbwyArU-2Bcvj7jHLiuv6grhp2RWRHZfxqU8d2VVDk392ji09-2F8VF7hgoDrARdlEzq8uQK4pNe-2Frnnlouorzs1RVDj56tp4JZcNKteI46G9tWmydtOOTrdqmLqqbGDRQmsLgYRbH8Jya43jL90duc0cFYhCNKeih5nc1x8SMusJUjfmldflr-2BJSW-2BfGtMp9imowQsNno5LuZ7TStvuYuQfPPGOJp9BymroeElOZ3FN-2B02GwmrX5DPlPmA8VcshUQeP3UcPZWkvzXzeLGqxgxKgn1k4Z7x6Z3MEx3OlQuknYLG1PGqlj8hJDSGciAlA-3D-3D\" alt=\"\" width=\"1\" height=\"1\" border=\"0\" style=\"height:1px !important;width:1px !important;border-width:0 !important;margin-top:0 !important;margin-bottom:0 !important;margin-right:0 !important;margin-left:0 !important;padding-top:0 !important;padding-bottom:0 !important;padding-right:0 !important;padding-left:0 !important;\"/\u003e\u003c/body\u003e\n\n\u003c/html\u003e\n",
        "created_at": "2025-08-15T08:47:52.909773Z",
        "attachments": []
    }
]
     */
        if(!body) return [];
        let messages = bodyJson;
        if(!messages || !messages.length) return [];
        let messages_new = messages.map(i=>{
            let {id, from, to, cc, subject, body_text, body_html, created_at, attachments} = i;
            return {id, from, to, cc, subject, created_at, attachments}
        })
        return messages_new;
        
    }catch(e){
        console.log("error getMessageTempIO",e)
        return []
    }
}
async function getTiktokCodeTempIO({email, token, proxy_list}) {
    let code = ""
    let current = 0;
    while(current < 7){
        try{
            let messages = await getMessageTempIO({email, token, proxy_list})
            if(messages && messages.length){
                let message = messages[0];
                let {subject} = message;
                // lay so tu string subject
                code = subject.match(/\d+/)[0];
                break;
            }
        }catch(e){
            console.log("error getTiktokCodeTempIO",e)
        }
        await delay(5000);
        current++;
    }
    
    return code;
}

/**
* makeRequest
* @param {options: {url, headers, method, proxy,retryCount, body, timeout, proxy_list, form, isRetry, isGetBody, preCheckRetry, retryTime }}  options
* @return {{ body, stautus, bodyJson, headers}}
*/
async function makeRequest(options) {

    let { url, headers, method, proxy, retryCount, body, timeout, retryTime, proxy_list, form, preCheckRetry, name, retryAfter, formData } = options
    method = method || "get"
    retryTime = retryTime || 2;
    retryAfter = retryAfter || 1000
    let isGetBody = true;
    if (options.hasOwnProperty("isGetBody")) {
        isGetBody = options.isGetBody
    }
    let isRetry = true;
    if (options.hasOwnProperty("isRetry")) {
        isRetry = options.isRetry
    }
    let retry = retryCount || 0;
    let head = await new Promise(r => {
        const options = {
            url,
            method: method.toUpperCase(),
            headers: headers,
            body,
            timeout: timeout || 10000
        }
        if (body) options.body = body;
        if (form) options.form = form;
        if (formData) options.formData = formData;
        let done = false;
        setTimeout(() => {
            if (!done) {
                done = true;
                return r({ error: "Request timeout", body: "", headers: {}, status: null })
            }
        }, timeout || 10000)

        if (proxy) {
            let proxystr = ""
            if (typeof proxy == "string") {
                proxystr = proxy
                if (!proxy.includes("https" || !proxy.includes("http"))) {
                    let { protocol, host, port, username, password } = parserProxyString(proxy);
                    proxystr = `${protocol || "http"}://${username && password ? `${username}:${password}@` : ''}${host}:${port}`
                }
            } else {
                let { protocol, host, port, username, password } = proxy;
                proxystr = `${protocol || "http"}://${username && password ? `${username}:${password}@` : ''}${host}:${port}`
            }
            options.proxy = proxystr
        }
        request(options, (error, response, body) => {
            if (!done) {
                done = true;
                return r({ error, body, headers: response ? response.headers : {}, status: response ? response.statusCode : null })
            }
        })
    })
    let isRetryPreCheck = false
    if ("function" == typeof preCheckRetry) {
        try {
            isRetryPreCheck = await preCheckRetry(head.body || "", head)
            isRetryPreCheck
        } catch (e) {
            console.log("err pre", e)
        }
    }

    let bodyJson = {};
    try { bodyJson = JSON.parse(head.body) } catch (e) { }
    head.bodyJson = bodyJson
    if (isRetryPreCheck || head.error || (!head.body && isGetBody)) {
        if (retry < retryTime && isRetry) {
            // console.log("retry request:",name)
            if (proxy_list && proxy_list.length > 0) {
                options.proxy = proxy_list[Math.floor((Math.random() * proxy_list.length))]
            }
            retry++
            options.retryCount = retry
            await delay(retryAfter || 1000)
            return await makeRequest(options)
        }
        return head

    }

    return head
}

 async function getInitGmail({cookie_string}){
  try {
    let res = await axios.get("https://mail.google.com/mail/u/0/?sw=2#all",{
        headers :{
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'accept-language': 'vi',
                'cache-control': 'no-cache',
                'cookie': cookie_string,
                'dnt': '1',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'upgrade-insecure-requests': '1',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
            }
    })
    let bodyHtml = res.data;
    let [grge, data_link] = /id="embedded_data_iframe" src="(.*?)"/.exec(bodyHtml) || []
    data_link= data_link.replaceAll('&amp;','&')
    let [gewr, sdpc] = /"sdpc","(.*?)"/.exec(bodyHtml) || []
    let [t, GM_ID_KEY] = /GM_ID_KEY = '(.*?)'/.exec(bodyHtml) || []
    let [t2, date_p] = /pinto-server_(.*?)"/.exec(bodyHtml) || []



    return {data_link,sdpc,GM_ID_KEY,date_p}
  } catch(e){

    console.log("error getInitGmail",e)
    return  {e}

  }
   
}
async function getMessagesGmail(url, cookie_string){
    try {
        let headers = {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'vi',
            'cache-control': 'no-cache',
            'cookie': cookie_string,
            'dnt': '1',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
          }
        const response = await axios.get(url, {
          headers: headers
        });
        let messages = parseMessagesGmail(response.data)
        return messages;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}
function parseMessagesGmail(data){
    let messages = []
    try{
        let [grge, date_p] = /GM_TRACING_RESULTS_CHUNK_START(.*?)GM_TRACING_POST_RESULTS_CHUNK_END/.exec(data) || [];
        // console.log(grge, date_p)
            let [tr, da] = /top._GM_setData\({(.*?)}\);/.exec(date_p) || [];
        da = "{" + da + "}"
        if (da) {
          let json = (JSON.parse(da))
          // console.log(da)
          let data = JSON.parse(json.a6jdv[0][2])
          
          if (data) {
            try{
                // console.log(data)
              (data[0][0].map((i => {
                let [title, content, timstamp, threadid, author] = i[4]

                let [te, email, display] = author[0][1]
                let code = getcodeOther(title)
                if(display == "shareearn.net"){
                    code = getcodeOther(content)
                }
                if(content){
                  messages.push({ title, content,code, timstamp, email, display, threadid: i[1] })
                }
              })))
            
            }catch(e){

            }
            
          }

        }
    }catch(e){}
    if(true){
        try{
            let [grge, date_p] = /GM_TRACING_POST_RESULTS_CHUNK_START(.*?)GM_TRACING_POST_RESULTS_CHUNK_END/.exec(data) || [];
            let [tr, da] = /top._GM_setData\({(.*?)}\);/.exec(date_p) || [];
        da = "{" + da + "}"
            let json = {}
            if(da){
              
            json = (JSON.parse(da)) 

            }
            // console.log(json)
            if(json.VWNrn){
              let data = JSON.parse(json.VWNrn[1][2])
              if (data) {
                try{
                  (data[0][0].map((i => {
                    let [title, content, timstamp, threadid, author] = i[4]
          
                    let [te, email, display] = author[0][1]
                    let code = getcodeOther(title)
                    if(display == "shareearn.net"){
                        code = getcodeOther(content)
                    }
                    if(content){
                        let _index = messages.findIndex(i=>{
                            return  i.threadid == threadid
                        })
                        if(_index ==-1){
                            messages.push({ title, content,code, timstamp, email, display,threadid: i[1]  })

                        }
                    }
                  })))
                
                }catch(e){
          
                }
                
              }
            }
        }catch(e){}
    }
    return messages
}
function isNumericString(str) {
    return /^[0-9]+$/.test(str);
}
 function getUrlActive(message){
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.data_html_text.match(urlRegex);
    if (!urls) return ""; // Nếu không tìm thấy URL, trả về mảng rỗng
    urls.map(url =>
        url
            .replace(/&amp;/g, '&') // Thay &amp; thành &
            .replace(/&#39;/g, "'") // Thay &#39; thành '
            .replace(/&quot;/g, '"') // Thay &quot; thành "
            .replace(/&lt;/g, '<') // Thay &lt; thành <
            .replace(/&gt;/g, '>') // Thay &gt; thành >
    );
    return urls[0]
    // switch(message.display.toLowerCase()) {
    //     case "facebook":
    //         break;
    //     case "reverso":

    //         break;
    //     default:
            
    // }
    // return ""
}
 function getTextFromHtml(htmlContent) {
    // Loại bỏ tất cả các thẻ script, style và nội dung của chúng
    htmlContent = htmlContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    htmlContent = htmlContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Loại bỏ tất cả các thẻ HTML khác
    const text = htmlContent.replace(/<[^>]*>/g, '');

    // Loại bỏ khoảng trắng thừa và xuống dòng không cần thiết
    return text.replace(/\s+/g, ' ').trim();
}
 async function parserMesssageHtml({messages, cookie_string,sdpc,GM_ID_KEY,date_p}){
    try {
  let body_post = messages.map(i=>{
            let [t,id]= i.threadid.split(":")
            return  [
                "thread-f:"+id,
                null,
                [
                  "msg-f:"+id
                ]
              ]
    
        })
        let data = JSON.stringify([body_post,2]);

    let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://mail.google.com/sync/u/0/i/fd?hl=vi&c=18&rt=r&pt=ji',
    headers: { 
        'accept': '*/*', 
        'accept-language': 'vi,en-US;q=0.9,en;q=0.8,vi-VN;q=0.7', 
        'cache-control': 'no-cache', 
        'content-type': 'application/json', 
        'cookie': cookie_string, 
        'dnt': '1', 
        'origin': 'https://mail.google.com', 
        'pragma': 'no-cache', 
        'priority': 'u=1, i', 
        'referer': 'https://mail.google.com/mail/u/0/', 
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"', 
        'sec-ch-ua-arch': '"arm"', 
        'sec-ch-ua-bitness': '"64"', 
        'sec-ch-ua-full-version': '"131.0.6778.109"', 
        'sec-ch-ua-full-version-list': '"Google Chrome";v="131.0.6778.109", "Chromium";v="131.0.6778.109", "Not_A Brand";v="24.0.0.0"', 
        'sec-ch-ua-mobile': '?0', 
        'sec-ch-ua-model': '""', 
        'sec-ch-ua-platform': '"macOS"', 
        'sec-ch-ua-platform-version': '"15.0.0"', 
        'sec-ch-ua-wow64': '?0', 
        'sec-fetch-dest': 'empty', 
        'sec-fetch-mode': 'cors', 
        'sec-fetch-site': 'same-origin', 
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 


        'x-framework-xsrf-token': sdpc, 
        'x-gmail-btai': '[null,null,[null,null,null,null,null,null,null,null,null,1,null,null,1,null,0,1,1,0,1,null,null,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,"vi","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",1,0,25,null,0,1,0,1,1,1,1,1,null,1,1,0,1,1,0,0,null,0,1,null,1,0,null,null,0,null,1,0,1,1,null,0,0,null,null,null,1,100,1,1,0,1,0,null,0,1,0,1,1,null,null,0,1,1,0,1,0,0,0,0],null,"'+GM_ID_KEY+'",null,25,"gmail.pinto-server_'+date_p+'",1,5,"",25200000,"+07:00",null,null,702735795,"","",1733821461030,null,1869458]', 
        
        'x-google-btd': '1'
    },
    data : data
    };


    const response = await axios.request(config);
    let datas = (response.data);
    if(datas[1]?.length){
        datas[1].forEach(i=>{
            try {
                let [threadid, n, contens] = i

                let data_html = contens[0][1][5][1][0][2][1]
                let index = messages.findIndex(item=>item.threadid == threadid);
                if(index>=-1){
                    messages[index].data_html = data_html
                }
            } catch(e){

            }
          
        })
    }
    
       
    } catch(e){
        console.log("error parserMessageHtml",e)
    }
    return messages


}
 function getcodeOther(text){
    const pattern = /\b\d{4,}\b/g;
    const match = text.match(pattern);
    let code = ''
    if(match){
        code = match[0]
    }
    if(isNumericString(code)){
        return code;
      }else{
        return ''
      }
  
}
async function getCodeTiktok({  cookie, current=0}) {
    let  {data_link,sdpc,GM_ID_KEY,date_p} = await getInitGmail({cookie_string:cookie})

    let decryptedData = {
    "url": data_link,
                        "cookie": cookie
                    
                }
    let email_messages = []
    if(decryptedData){
        let messages = await getMessagesGmail(decryptedData.url,decryptedData.cookie)
        messages = await parserMesssageHtml({messages, cookie_string:cookie,sdpc,GM_ID_KEY,date_p})
        messages.map(function(a){
            a.data_html_text = getTextFromHtml(a.data_html)
            a.url_active = getUrlActive(a)
            a.code_content = getcodeOther(a.data_html_text)
            delete a.data_html
            delete a.data_html_text
        })
       email_messages = messages
    }
    let code = ""
    let message = email_messages.find(i=>i.display.toLowerCase().includes("tiktok") && i.code_content);
    if(message){
        code = message.code_content
    }
    if(code){
        return code
    }
    if(current <3){
        await delay(5000)
        return await getCodeTiktok({ cookie, current: current +1})
    }
    return ""
}
function generateRandomName(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}
async function updateAccountToServer({email, account, proxy_list=null}) {
    try{
        let proxy = "";
        if(proxy_list && proxy_list.length){
            proxy = proxy_list[Math.floor(Math.random() * proxy_list.length)];
        }
        let url = ("http://217.15.163.20:3002" || "http://localhost:3000")+"/api/accounts/updateAccountInfo?email="+email
        let res = await makeRequest({
            url, 
            headers: {
                "Content-Type": "application/json"
            }, 
            method: "POST", 
            body: JSON.stringify(account),
            proxy: proxy,
            proxy_list: proxy_list
        })
        let { body, bodyJson, status, headers, error} = res;
        console.log("updateAccountToServer",bodyJson)
        return bodyJson
    }catch(e){
        console.log("error updateAccountToServer",e)
        return false
    }
}
async function getEmailTempIO(proxy_list=null) {
    let all_domain = `vwhins.com,jxpomup.com,ibolinva.com,wyoxafp.com,osxofulk.com,jkotypc.com,cmhvzylmfc.com,zudpck.com,daouse.com,illubd.com,mkzaso.com,mrotzis.com,xkxkud.com,wnbaldwy.com,bwmyga.com`.split(',')
    all_domain = `zudpck.com,daouse.com,illubd.com,mkzaso.com,mrotzis.com,xkxkud.com,wnbaldwy.com,bwmyga.com`.split(',')
    let email_input = generateRandomName(12)+getRandomInt(111111, 888888).toString()+"@"+all_domain[Math.floor(Math.random() * all_domain.length)];
    return await getEmailTempIOExist(email_input, proxy_list)
}
export { getEmailTempIOExist, getMessageTempIO, getTiktokCodeTempIO, makeRequest, delay, parserProxyString ,    getMessagesGmail, getInitGmail, parserMesssageHtml, getcodeOther, getTextFromHtml,getUrlActive,getCodeTiktok,parseMessagesGmail,getEmailTempIO,updateAccountToServer };