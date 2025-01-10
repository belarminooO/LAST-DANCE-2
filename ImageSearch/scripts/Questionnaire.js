
let userResponses = JSON.parse(sessionStorage.getItem("userResponses")) || {};


const formQuestionnaireP1 = document.getElementById("questionaire-p1");

if (formQuestionnaireP1) {
    formQuestionnaireP1.onsubmit = function(e) {
        e.preventDefault();

        userResponses.age = document.querySelector('input[name="age"]:checked').value;
        userResponses.gender = document.querySelector('input[name="genero"]:checked').value;
        userResponses.internetUsage = document.querySelector('input[name="internet"]:checked').value;


        userResponses.browser1 = document.getElementById("primeiro").value;
        userResponses.browser2 = document.getElementById("segundo").value;
        userResponses.browser3 = document.getElementById("terceiro").value;

        userResponses.knowsImageSites = document.querySelector('input[name="SN"]:checked').value;
        userResponses.imageSiteResponse = document.getElementById("Textarea1").value;


        sessionStorage.setItem("userResponses", JSON.stringify(userResponses));


        location.href = "questionnaire_p2.html";
    };
}


const formQuestionnaireP2 = document.getElementById("questionnaire-p2");

if (formQuestionnaireP2) {
    formQuestionnaireP2.onsubmit = function(e) {
        e.preventDefault();

        userResponses.task1 = document.getElementById("TextareaP2_1").value;
        userResponses.task2 = document.getElementById("TextareaP2_2").value;
        userResponses.task3 = document.getElementById("TextareaP2_3").value;
        userResponses.task4 = document.getElementById("TextareaP2_4").value;
        userResponses.comparison = document.getElementById("TextareaP2_5").value;

      
        sessionStorage.setItem("userResponses", JSON.stringify(userResponses));

       
        location.href = "questionnaire_p3.html";
    };
}


const formQuestionnaireP3 = document.getElementById("questionaire-p3");

if (formQuestionnaireP3) {
    formQuestionnaireP3.onsubmit = function(e) {
        e.preventDefault();

      
        userResponses.susResponses = [];
        for (let i = 1; i <= 10; i++) {
            const value = document.querySelector(`input[name="RadioP3p${i}"]:checked`).value;
            userResponses.susResponses.push(value);
        }

    
        userResponses.slider1 = document.getElementById("customRange1").value;
        userResponses.slider2 = document.getElementById("customRange2").value;
        userResponses.slider3 = document.getElementById("customRange3").value;
        userResponses.slider4 = document.getElementById("customRange4").value;

 
        const uniqueKey = crypto.randomUUID();

      
        localStorage.setItem(uniqueKey, JSON.stringify(userResponses));

       
        sessionStorage.removeItem("userResponses");


        alert("Questionário finalizado! Obrigado por participar.");


        location.href = "questionnaire.html";
    };
}










function checkBrowser(elemento) {
    let opcao1 = document.getElementById("primeiro");
    let opcao2 = document.getElementById("segundo");
    let opcao3 = document.getElementById("terceiro"); 

    atualizarOpcoes();
}

function atualizarOpcoes() {
    let opcao1 = document.getElementById("primeiro");
    let opcao2 = document.getElementById("segundo");
    let opcao3 = document.getElementById("terceiro");

    let selecionados = [opcao1.value, opcao2.value, opcao3.value];

    desativarOpcoes(opcao1, selecionados);
    desativarOpcoes(opcao2, selecionados);
    desativarOpcoes(opcao3, selecionados);
}

function desativarOpcoes(select, selecionados) {
    for (let i = 0; i < select.options.length; i++) {
        let option = select.options[i];
        option.disabled = selecionados.includes(option.value)
    }
}

function Write_Text() {
    const textArea = document.getElementById("Textarea1");
    const radioSim = document.getElementById("RadioP1_14");

    if (radioSim.checked) {
        textArea.disabled = false;
        textArea.required = true;
    } else {
        textArea.disabled = true;
        textArea.required = false;
    }
}

