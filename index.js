


const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3')
const { IamAuthenticator } = require('ibm-watson/auth');
const languageTranslator = new LanguageTranslatorV3({
    version: '2018-05-01',
    authenticator: new IamAuthenticator({
        apikey: '<APIKEY>',
    }),
    url: '<URL>',
});

const translateParams = {
    text: ['Hello, World',"How are you?"],
    modelId: 'en-es',
};

languageTranslator.translate(translateParams)
.then(translationResult => {
    console.log(JSON.stringify(translationResult, null, 2));
})
.catch(err => {
    console.log('error:', err);
});
console.log("Fim da execução da aplicação xD")
/*
  */