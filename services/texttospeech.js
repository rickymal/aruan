const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const fs = require('fs');

function createSpeech(onDataReceived,filestream = fs.createReadStream('C://audio-file.flac')){
  
  const speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
      apikey: '<APIKEY>',
    }),
    url: "<URL>",
    disableSslVerification: true,
  });
  
  var params = {
      objectMode: true,
      contentType: 'audio/mp3',
      model: 'pt-BR_NarrowbandModel', // pt-BR_NarrowbandModel en-US_BroadbandModel
      keywords: ['aula', 'exercicio', 'dever'], // ['colorado', 'tornado', 'tornadoes']
      keywordsThreshold: 0.5,
      maxAlternatives: 1, //3
      interimResults : false //testa com true depois
    };
  
  
    params = {
      objectMode: true,
      contentType: 'audio/flac',
      model: 'en-US_BroadbandModel', // pt-BR_NarrowbandModel en-US_BroadbandModel
      keywords: ['colorado', 'tornado', 'tornadoes'], // ['colorado', 'tornado', 'tornadoes']
      keywordsThreshold: 0.5,
      maxAlternatives: 3, //3
      interimResults : false //testa com true depois
    };
  
  // criando o soquete
  
  var recognizedStream = speechToText.recognizeUsingWebSocket(params);
  
  
  // Pipe in the audio.
  filestream.pipe(recognizedStream);
  
  recognizedStream.on('data',onDataReceived)
  
  recognizedStream.on('error',function(event){
      console.log("Algum erro aconteceu aqui");
      onEvent('Error:', event);
  })
  
  recognizedStream.on('close',function(event){
      console.log("Alguma coisa foi fechada aqui");
      onEvent('Close:', event);
  })
  
  function onEvent(name, event) {
      console.log(name, JSON.stringify(event, null, 2));
  };
  

}

module.exports = createSpeech;
