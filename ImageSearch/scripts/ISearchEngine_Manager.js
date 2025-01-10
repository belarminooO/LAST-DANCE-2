/**
 * @fileoverview Main entry point of the ISearchEngine application.
 * This script initializes the application with a specified database
 * and a canvas element from the DOM, and it provides a global reference
 * to the ISearchEngine instance for debugging purposes.
 */

import { ISearchEngine } from "./ISearchEngine.js";

// Global variable to hold the application instance
let app = null;

/**
 * Main function to initialize the ISearchEngine application.
 * 
 * @function main
 */
function main() {
    // Get the canvas element from the DOM by its ID
    const canvas = document.getElementById("canvas");

    // Create an instance of ISearchEngine with a reference to the database file
    app = new ISearchEngine("database.json");

    /**
     * Exposing the application instance globally for debugging purposes.
     * 
     * WARNING: Avoid exposing sensitive objects or data globally in production
     * environments as it can pose security risks.
     */
    window.app = app;

    // Initialize the ISearchEngine application with the canvas element
    app.init(canvas).then(() => {
        // Log a success message once the initialization process is complete
        console.log("ISearchEngine Database Initialized...");
        // TODO: Add further application logic or UI updates here if required.
    }).catch(error => {
        // Handle potential errors during the initialization process
        console.error("Error initializing ISearchEngine:", error);
    });

    


    const clickSound = new Audio('Click.mp3');

    // // Seleciona todos os botões de cor
    // const colorButtons = document.querySelectorAll('.btn.color');

    // // Adiciona um listener de evento de clique a cada botão de cor
    // colorButtons.forEach(button => {
    //     button.addEventListener('click', () => {
    //         clickSound.currentTime = 0; // Reinicia o som
    //         clickSound.play(); // Reproduz o som
    //     });
    // });

    // Seleciona o botão de busca
    const searchButton = document.getElementById('searchButton');

    // Adiciona um listener de evento de clique ao botão de busca
    searchButton.addEventListener('click', () => {
        clickSound.currentTime = 0; // Reinicia o som
        clickSound.play(); // Reproduz o som
    });







    // const galleryButton = document.getElementById('galleryButton');

    // galleryButton.addEventListener('click', () => {
    //     console.error("Entrou");
    //     clickSound.currentTime = 0;
    //     clickSound.play();
    // });

    // const questyButton = document.getElementById('questyButton');

    // questyButton.addEventListener('click', () => {
    //     console.error("Entrou");
    //     clickSound.currentTime = 0;
    //     clickSound.play();
    // });

    // const statsyButton = document.getElementById('statsyButton');

    // statsyButton.addEventListener('click', () => {
    //     console.log("Entrou");
    //     clickSound.currentTime = 0;
    //     clickSound.play();
    // });

    // const ImportExportyButton = document.getElementById('ImportExportyButton');
    
    // ImportExportyButton.addEventListener('click', () => {
    //     console.log("Entrou");
    //     clickSound.currentTime = 0;
    //     clickSound.play();
    // });

    







    // let red = document.getElementById("color-red");

    // red.addEventListener("click", function() {
    //     // Obtendo o valor do input de busca
    //     let redValue = document.getElementById("color-red").value;
    
    //     // Chamando a função app.searchKeywords com os parâmetros corretos
    //     app.searchColor(document.getElementById("searchSpace").value, redValue);
    // });
    const colorButtons = document.querySelectorAll('.btn.color');

    // Adiciona um listener de evento de clique a cada botão de cor
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            clickSound.currentTime = 0; // Reinicia o som
            clickSound.play(); // Reproduz o som
            
            // Obtendo o valor do botão clicado
            let colorValue = button.value;

            // Chamando a função app.searchColor com os parâmetros corretos
            app.searchColor(document.getElementById("searchSpace").value, colorValue);
        });
    
    });










    let search_button = document.getElementById("searchButton");

    search_button.addEventListener("click", function() {
        // Obtendo o valor do input de busca
        let searchValue = document.getElementById("searchSpace").value;
    
        // Chamando a função app.searchKeywords com os parâmetros corretos
        app.searchKeywords(searchValue, canvas);
    });
    
}

// Invoke the main function to start the application
main();
