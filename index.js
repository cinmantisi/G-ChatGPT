import { Extension, HPacket, HDirection, HUserProfile } from 'gnode-api';
import { Configuration, OpenAIApi } from 'openai';

const extensionInfo = {
    name: "G-ChatGPT",
    description: "Use ChatGPT on your hotel with your private OpenAI token",
    version: "0.1",
    author: "constflare"
}

const configuration = new Configuration({
      apiKey: 'Your OpenAI private key',
    });
    const openai = new OpenAIApi(configuration);


// Create new extension with extensionInfo
let ext = new Extension(extensionInfo);

// Start connection to G-Earth
ext.run();

ext.on('init', async => {
    const response1 = openai.createCompletion({
      model: "text-davinci-003",
      prompt: 'Hey GPT-3!',
      temperature: 0,
      max_tokens: 3000,
    });
    response1.then(function(result) {
    console.log(result.data.choices[0].text)
    })
    console.log("Connected to G-Earth");
  }); 
  ext.on('connect', (host, connectionPort, hotelVersion, clientIdentifier, clientType) => {
  });
  ext.interceptByHeaderId(HDirection.TOCLIENT, 1446, hMessage => {
    let packet = hMessage.getPacket();
    let userIndex = packet.readInteger();
    let msg = packet.readString();
    if(msg.includes("!gpt")) {
      let newMsg = msg.replace("!gpt", "")
    const response = openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${newMsg}`,
      temperature: 0,
      max_tokens: 3000,
    });
        response.then(function(result) {
        if(result.data.choices[0].text.length >= 100) {
                      let shortanswer = result.data.choices[0].text.substring(0, 99)
                      let hPacket = new HPacket(`{h:1314}{s:"${shortanswer}"}{i:0}{i:0}`);
                      let hPacket1 = new HPacket(`{h:1314}{s:"I can't write the full answer because it was too long."}{i:0}{i:0}`);
                      ext.sendToServer(hPacket);
                        ext.sendToServer(hPacket1);
          }
              let hPacket = new HPacket(`{h:1314}{s:"${result.data.choices[0].text}"}{i:0}{i:0}`);
              ext.sendToServer(hPacket)
        console.log(result.data.choices[0].text)
        })
  }
  });
  });
