class Classroom {

    constructor(teacher,students,turma_ID,questions,services) {
        this.teacher = teacher;
        this.students = students;
        this.turma_ID = turma_ID
        this.questions = questions
        this.services = services
    }

}

class Teacher{
    constructor(name,classes,materia){
        this.name = name
        this.classes = classes
        this.materia = materia
    }

    requestTwillioToken(){
        this.token = require('./services/twilio')();
        return this.token;
    }
}
class Question {
    constructor(questionSrings,responsesString,trueResponse){
        this.questionSrings = questionSrings
        this.responsesString = responsesString
        this.trueResponse = trueResponse
    }
}




var lof_teachers = []

module.exports = {
    Classroom,
    Teacher,
    lof_teachers,
}