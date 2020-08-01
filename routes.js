const express  =require('express');
const routes = express.Router();
const request = require('request')
const binaryRouter = express.Router()

const texttospeech = require('./services/texttospeech')
const {Classroom,Teacher,lof_teachers} = require('./objects');
const { text } = require('express');
routes.use(express.json()); //dizendo o formato do corpo da requisição
binaryRouter.use(express.raw());


var count = 0;
var token_info = 0;
// responsável por fazer o login (recebe o nome do professor, instituição disponível, salas e horários disponíveis,
// recebe o horário da aula, quando vai ser)



routes.get('/',function(request,response){
    return response.json({
        status : "Olá mundo",
        lof_teachers
    })
})


routes.post('/createTeacher',function(request,response){
    var teacher_data = request.body.teacher_info

    var teacher_instance = new Teacher(name = teacher_data.name,
        classes = [], materia = teacher_data.materia)

    lof_teachers.push(teacher_instance)


    return response.json({
        statun : "OK",
    })

    

})
// nesse caso na requisição o professor solicita a sala de aula e libera uma instancia para os alunos
routes.post('/createClassroom',function(request,response){
    // descobrir porque o código da turma não foi inserido
    var teacher = {
        name : request.body.teacher_name,
        turma : request.body.turma
    }


    count++;
    var filtered_teacher = lof_teachers.filter(function(prop){
        if (prop.name === teacher.name){
            return true;
        }
        else{
            return false;
        }
    })[0]
    filtered_teacher.classes.push(new Classroom(teacher = filtered_teacher.name,students = [],turma_ID = request.body.turma,questions = []))

    
    return response.json({
        status : "OK",
        teacher : filtered_teacher
    })
})


//rota para criar ou associar estudante
routes.post('/some',function(request,response){
    

    var student = request.body.student
    var room = request.body.room

    student.desired_knowledge_queue = []
    student.scores = 0

    for(var i = 0; i < lof_teachers.length;i++)  {
        for (var j = 0; j < lof_teachers[i].classes.length;j++){
            if(lof_teachers[i].classes[j].turma_ID === room){
                lof_teachers[i].classes[j].students.push(student)
                return response.json({
                    status : "OK",
                    student_registered : lof_teachers[i].classes[j].students,
                })
            }
        }
    }

    return response.json({
        status : "FAILED"
    })

    var classes_disposable = lof_teachers.map((e) => e.classes)

    classes_disposable.map(function(e){
        if (e.turma_ID === room){
            return true
        }
        else{
            return false
        }
    })


    return response.json({
        status : "OK"
    })
})



routes.post('/questCreation',function(request,response){
    const room = request.body.room
    var Questions= request.body.Questions

    for(var i = 0; i < lof_teachers.length;i++)  {
        for (var j = 0; j < lof_teachers[i].classes.length;j++){
            if(lof_teachers[i].classes[j].turma_ID === room){
                //lof_teachers[i].classes[j].questions.push(Questions)
                lof_teachers[i].classes[j].questions = Questions
                return response.json({
                    status : "OK",
                    Questions_registered : lof_teachers[i].classes[j].questions,
                })
            }
        }
    }

    return response.json({
        status : "FAILED"
    })

})


routes.get('/twilioClassroom',function(request,response){
    const twillioService = require('./services/twilio')
    const jwtToken = twillioService()
    return response.json({
        acessToken : jwtToken
    })
})


// esta função recebe o json do audio e retorna uma ação para ser executada na lista de ações
function handleTeacherAction(text_return,room,content){

    //Procurando associar com as palavras chave a ação de obter uma questão
    //a variavel content armazena apenas a questão (chamei de content, mas devia ser question, algo assim)

    var actions_to_return = []

    for(var i = 0;i < content.question.length;i++){
        question_object = content.question[i]

        var keywords = question_object.Keyword
        for (var j = 0; j < keywords.length;j++){
            final_text = keywords[j]
            if (text_return.includes(final_text)){
                actions_to_return.push({
                        action : "Quest",
                        Question : question_object,
                        room : room,
                    })

            if (text_return.includes("Qr Code")){
                const text_splitted = text_return.split("Qr Code")[1].split(" ")[1]
                actions_to_return.push({
                    action : "Qr Code",
                    QrCodeWord : text_splitted,
                    room : room
                })

            }
                //return {
                //    action : "Quest",
                //    Question : question_object,
                //    room : room,
                //}
            }
        }

        return actions_to_return
    }

    for (question_object in content.question){
        const keyworkd = question_object.Keyword
        for (tt in keywords){
            if (text_return.includes(tt)){
                return {
                    action : "Question",
                    Question : question_object,
                    room : room,
                }
            }
        }
    }

    return null


    console.log("OI");
    return {
        action : "Question",
        data : 0
    }
}

// Recebe os dados em texto do professor utilizando a API (preciso manda IAM em vez da chave de API)
routes.post('/putKnowledge',function(request,response){
    var room = request.body.room
    var data = request.body.data
    var text_return = ""

    for(var i = 0; i < lof_teachers.length;i++)  {
        for (var j = 0; j < lof_teachers[i].classes.length;j++){
            if(lof_teachers[i].classes[j].turma_ID === room){
                var turma = lof_teachers[i].classes[j]
                //const json_data_text = texttospeech(onDataReceived = function(event){
                //    const json = JSON.stringify(event, null, 2)
                //    text_return = json
                //    return json
                //})

                
                const action = handleTeacherAction(data.text,room,content = {
                    question : lof_teachers[i].classes[j].questions,
                })
                
                if (action === null){
                    
                }
                else{
                    lof_teachers[i].classes[j].students.map(function(e){
                        e.desired_knowledge_queue.push(action)
                    })
                }

                // Como enviar os dados para todos os clientes conectados?
                return response.json({
                    status : "OK",
                    action : action,
                })
            }
        }
    }

})


function handleAction_knowledge(student,room,queue_content){

    console.log("OI")

    return queue_content
}

//o cliente do aluno automaticamente procurará um QrCode ou uma pergunta para ser respondida
routes.post('/requestKnowledge',function(request,response){
    var knowledge_to_return = null
    var room = request.body.room
    var student_name = request.body.student_name



    for(var i = 0; i < lof_teachers.length;i++)  {
        for (var j = 0; j < lof_teachers[i].classes.length;j++){
            if(lof_teachers[i].classes[j].turma_ID === room){
                var turma = lof_teachers[i].classes[j]


                for (var k = 0; k < lof_teachers[i].classes[j].students.length;k++){
                    var student =  lof_teachers[i].classes[j].students[k]

                    if (student.name === student_name){
                        var queue_knowledge_content = student.desired_knowledge_queue.pop()
                        var action_to_return = handleAction_knowledge(student = student,room = turma,queue_content = queue_knowledge_content)
                        // Como enviar os dados para todos os clientes conectados?
                        return response.json({
                            status : "OK",
                            action : action_to_return,
                        })

                    }
                    else{
                        continue
                    }

                    
                }

            }
        }
    }

    return response.json({
        status : "NOTFOUND",
        action : null,
    })

})

//função que receberá a pontuação total do aluno
routes.post('/updateScore',function(request,response){
    const score = request.body.score
    const student_name = request.body.student_name
    const room = request.body.room


    for(var i = 0; i < lof_teachers.length;i++)  {
        for (var j = 0; j < lof_teachers[i].classes.length;j++){
            if(lof_teachers[i].classes[j].turma_ID === room){
                var turma = lof_teachers[i].classes[j]
                for (var k = 0; k < lof_teachers[i].classes[j].students.length;k++){
                    var student =  lof_teachers[i].classes[j].students[k]
                    if (student.name === student_name){
                        lof_teachers[i].classes[j].students[k].scores = score
                    }

                    
                }

                

                // Como enviar os dados para todos os clientes conectados?
                return response.json({
                    status : "OK",
                })
            }
        }
    }

})

routes.post('/requestScores',function(request,response){
    const room = request.body.room


    for(var i = 0; i < lof_teachers.length;i++)  {
        for (var j = 0; j < lof_teachers[i].classes.length;j++){
            if(lof_teachers[i].classes[j].turma_ID === room){
                var turma = lof_teachers[i].classes[j]

                const students_scores = lof_teachers[i].classes[j].students.map(function(e){
                    return {
                        name : e.name,
                        score : e.scores,
                    }
                })
                
                return response.json({
                    status : "OK",
                    data_scores : students_scores,
                })


                for (var k = 0; k < lof_teachers[i].classes[j].students.length;k++){
                    var student =  lof_teachers[i].classes[j].students[k]
                    if (student.name === student_name){
                        lof_teachers[i].classes[j].students[k].scores = score
                    }

                    
                }
                // Como enviar os dados para todos os clientes conectados?
            }
        }
    }
    
})

module.exports = routes;