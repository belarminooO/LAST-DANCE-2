

import { DatabaseJSON, LocalStorageDatabaseJSON } from "./Database.js";
import { Picture, ColorHistogram, ColorMoments } from "./Image_Processing.js";

/**
 * Represents an Image Search Engine.
 */
class ISearchEngine {
    /**
     * Constructs an ISearchEngine instance.
     * @param {string} dbase - The path to the JSON database file.
     */
    constructor(dbase) {
        // Pool for all pictures, initialized with a size of 5000
        this.img_paths = new Pool(5000);
        this.allpictures = new Pool(5000);
        this.num_Images = 100;
        // Color information for color histogram
        this.colors = ["red", "orange", "yellow", "green", "Blue-green", "blue", "purple", "pink", "white", "grey", "black", "brown"];
        // Color components for Red, Green, Blue in each color
        this.redColor = [204, 251, 255, 0, 3, 0, 118, 255, 255, 153, 0, 136];
        this.greenColor = [0, 148, 255, 204, 192, 0, 44, 152, 255, 153, 0, 84];
        this.blueColor = [0, 11, 0, 0, 198, 255, 167, 191, 255, 153, 0, 24];

        // Categories for classification used in the search
        this.categories = [
            "burj khalifa",
            "chichen itza",
            "christ the reedemer",
            "eiffel tower",
            "great wall of china",
            "machu pichu",
            "pyramids of giza",
            "roman colosseum",
            "statue of liberty",
            "stonehenge",
            "taj mahal",
            "venezuela angel falls"
        ];

        // Database and JSON file information
        this.jsonFile = dbase;
        this.db = new DatabaseJSON(); // Instance of the DatabaseJSON class
        this.lsDb = new LocalStorageDatabaseJSON(); // Instance of the LocalStorageDatabaseJSON class

        // Number of images per category for image processing
        this.numImages = 1;
        // Number of images to show in canvas as a search result
        this.numShownPic = 30;

        // Image dimensions for rendering
        this.imgWidth = 190;
        this.imgHeight = 140;

        // Reference to the canvas for rendering images
        this.viewCanvas = null;

        // Canvas used for image processing (invisible to the user)
        this.processingCanvas = document.createElement("canvas"); // aqui
        this.processingCanvas.width = 1920;
        this.processingCanvas.height = 1080;
    }

    /**
     * Initializes the Image Search Engine.
     * @param {HTMLCanvasElement} cnv - The canvas element for image rendering.
     * @returns {Promise<void>} - A promise that resolves when initialization is complete.
     */
    async init(cnv) {
        this.viewCanvas = cnv; // Set the reference for the canvas

        // Load the JSON data from the file
        this.jsonData = await this.db.loadFile(this.jsonFile);
        console.log(this.jsonData); // Log the loaded data

        // Start processing the database with the loaded data
        // this.databaseProcessing(this.viewCanvas);
        this.databaseProcessing(this.processingCanvas);

        //TODO: Later you should switch from the "viewCanvas" to the invisible "processingCanvas".
        //this.databaseProcessing(this.viewCanvas);
    }

    /**
     * Processes the image database for color histogram and color moments.
     * @param {HTMLCanvasElement} cnv - The canvas element for image processing.
     */
    databaseProcessing(cnv) {
        console.log("Iniciando processamento do banco de dados...");
        const h12color = new ColorHistogram(this.redColor, this.greenColor, this.blueColor);
        const colmoments = new ColorMoments();

        for (let i = 0; i < this.jsonData.images.length; i++) {
            const imageData = this.jsonData.images[i];
            const img = new Picture(0, 0, 100, 100, imageData.path, imageData.class);
            const eventname = "processed_picture_" + img.impath;
            const eventP = new Event(eventname);
            this.imageProcessed(img, eventname);
            // Ouça o evento
            // document.addEventListener(eventname, () => {
            //     console.log(`Evento ${eventname} capturado`);
            //     this.imageProcessed(img, eventname);
            // });

            console.log(`Processando imagem: ${img.impath}`);
            img.computation(cnv, h12color, colmoments, eventP);
            console.log(`Evento disparado: ${eventname}`);

            //Verifica se é o último elemento do array
            if (i === this.jsonData.images.length - 1) {
                console.log("ULTIMA IMAGEM PROCESSADA CHECKED:", this.jsonData.images.length);
                console.log("ULTIMA IMAGEM PROCESSADA CHECKED:", img);
            }
        }
        console.log("PROCESSO CONCLUIDO");
    }

    /**
     * Handles the image processed event.
     * @param {Picture} img - The processed image.
     * @param {string} eventname - The event name.
     */
    imageProcessed(img, eventname) {
        // When the image is processed, this method is called to check if all images are processed.
        // If all images are processed, save the processed data to localStorage for future queries.
        console.log("entrouuuuuuuuuuuuu");
        this.allpictures.insert(img); // Insert the processed image into the pool
        console.log("Event:\n" + eventname + "Histogram:\n", img.hist, "\nColor Moments:", img.color_moments); // Log the results

        // Check if all images are processed
        if (this.allpictures.stuff.length >= Math.min(this.jsonData.images.length, this.categories.length * this.numImages)) {
            console.log("All Images Processed");
            console.log("debug - chamou o metodo");
            console.log("=========11111111111111111==============");
            console.log(this.allpictures);
            console.log("=======================");

            this.createColorDatabaseLS();
            // this.createIExampledatabaseLS();
        }
    }

    /**
     * Creates the color database in Local Storage.
     * This method creates the color query database in localStorage.
     */
    createColorDatabaseLS() {
        const colorButtons = [
            { name: "red", rgb: [205, 9, 12] },
            { name: "orange", rgb: [252, 148, 15] },
            { name: "yellow", rgb: [255, 255, 6] },
            { name: "green", rgb: [47, 204, 21] },
            { name: "teal", rgb: [44, 193, 198] },
            { name: "blue", rgb: [3, 21, 255] },
            { name: "purple", rgb: [118, 44, 168] },
            { name: "pink", rgb: [252, 152, 191] },
            { name: "white", rgb: [255, 255, 255] },
            { name: "gray", rgb: [153, 153, 153] },
            { name: "black", rgb: [0, 0, 0] },
            { name: "brown", rgb: [136, 84, 29] }
        ];
    
        // Objeto para armazenar as imagens organizadas por cor
        const colorDatabase = {};
    
        // Inicializa cada cor com uma lista vazia
        colorButtons.forEach(button => {
            colorDatabase[button.name] = [];
        });
    
        // Itera sobre todas as imagens no JSON
        this.jsonData.images.forEach(image => {
            // Obtém a cor dominante da imagem no formato hex (#RRGGBB)
            const hexColor = image.dominantcolor;
    
            // Converte a cor hex para RGB
            const dominantRGB = this.hexToRGB(hexColor);
    
            // Calcula a distância Euclidiana para cada cor dos botões
            let closestColor = null;
            let minDistance = Infinity;
    
            colorButtons.forEach(button => {
                const distance = this.calculateEuclideanDistance(dominantRGB, button.rgb);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestColor = button.name;
                }
            });
    
            // Adiciona a imagem à cor mais próxima
            colorDatabase[closestColor].push({
                class: image.class,
                path: image.path,
                dominantcolor: closestColor
            });
        });
    
        // Armazena o banco de dados de cores no localStorage
        localStorage.setItem("colorDatabase", JSON.stringify(colorDatabase));
        console.log("Banco de dados de cores criado com sucesso:", colorDatabase);
    }
    // createColorDatabaseLS() {
    //     // Mapeamento das cores dos botões para os valores RGB
    //     const buttonColors = {
    //         red: { r: 205, g: 9, b: 12 },
    //         orange: { r: 252, g: 148, b: 15 },
    //         yellow: { r: 255, g: 255, b: 6 },
    //         green: { r: 47, g: 204, b: 21 },
    //         teal: { r: 44, g: 193, b: 198 },
    //         blue: { r: 3, g: 21, b: 255 },
    //         purple: { r: 118, g: 44, b: 168 },
    //         pink: { r: 252, g: 152, b: 191 },
    //         white: { r: 255, g: 255, b: 255 },
    //         gray: { r: 153, g: 153, b: 153 },
    //         black: { r: 0, g: 0, b: 0 },
    //         brown: { r: 136, g: 84, b: 29 }
    //     };
    
    //     // Função para calcular a distância euclidiana entre duas cores
    //     const calculateDistance = (color1, color2) => {
    //         return Math.sqrt(
    //             Math.pow(color1.r - color2.r, 2) +
    //             Math.pow(color1.g - color2.g, 2) +
    //             Math.pow(color1.b - color2.b, 2)
    //         );
    //     };
    
    //     // Objeto para armazenar as imagens agrupadas por cor
    //     const colorDatabase = {};
    
    //     // Inicializar categorias de cor no banco de dados
    //     Object.keys(buttonColors).forEach((color) => {
    //         colorDatabase[color] = [];
    //     });
    
    //     // Iterar por todas as imagens no JSON
    //     this.jsonData.images.forEach((image) => {
    //         // Converter a cor dominante HEX para RGB
    //         const dominantColor = image.dominantcolor;
    //         const r = parseInt(dominantColor.slice(1, 3), 16);
    //         const g = parseInt(dominantColor.slice(3, 5), 16);
    //         const b = parseInt(dominantColor.slice(5, 7), 16);
    
    //         const imageColor = { r, g, b };
    
    //         // Encontrar a cor mais próxima
    //         let closestColor = null;
    //         let smallestDistance = Infinity;
    
    //         Object.keys(buttonColors).forEach((color) => {
    //             const distance = calculateDistance(imageColor, buttonColors[color]);
    //             if (distance < smallestDistance) {
    //                 smallestDistance = distance;
    //                 closestColor = color;
    //             }
    //         });
    
    //         // Adicionar a imagem à categoria correspondente
    //         colorDatabase[closestColor].push({
    //             class: closestColor,
    //             path: image.path
    //         });
    //     });
    
    //     // Gravar os dados no localStorage
    //     Object.keys(colorDatabase).forEach((color) => {
    //         const data = { images: colorDatabase[color] };
    //         localStorage.setItem(color, JSON.stringify(data));
    //     });
    
    //     console.log("Color database successfully created and saved in localStorage.");
    // }
    


    // createColorDatabaseLS() {
    //     // Mapeamento das cores dos botões para os valores RGB
    //     const buttonColors = {
    //         red: { r: 205, g: 9, b: 12 },
    //         orange: { r: 252, g: 148, b: 15 },
    //         yellow: { r: 255, g: 255, b: 6 },
    //         green: { r: 47, g: 204, b: 21 },
    //         teal: { r: 44, g: 193, b: 198 },
    //         blue: { r: 3, g: 21, b: 255 },
    //         purple: { r: 118, g: 44, b: 168 },
    //         pink: { r: 252, g: 152, b: 191 },
    //         white: { r: 255, g: 255, b: 255 },
    //         gray: { r: 153, g: 153, b: 153 },
    //         black: { r: 0, g: 0, b: 0 },
    //         brown: { r: 136, g: 84, b: 29 }
    //     };
    
    //     // Função para calcular a distância euclidiana entre duas cores
    //     const calculateDistance = (color1, color2) => {
    //         return Math.sqrt(
    //             Math.pow(color1.r - color2.r, 2) +
    //             Math.pow(color1.g - color2.g, 2) +
    //             Math.pow(color1.b - color2.b, 2)
    //         );
    //     };
    
    //     // Objeto para armazenar todas as imagens agrupadas por cor
    //     const colorDatabase = {};
    
    //     // Inicializar categorias de cor no banco de dados
    //     Object.keys(buttonColors).forEach((color) => {
    //         colorDatabase[color] = [];
    //     });
    
    //     // Iterar por todas as imagens no JSON
    //     this.jsonData.images.forEach((image) => {
    //         // Converter a cor dominante HEX para RGB
    //         const dominantColor = image.dominantcolor;
    //         const r = parseInt(dominantColor.slice(1, 3), 16);
    //         const g = parseInt(dominantColor.slice(3, 5), 16);
    //         const b = parseInt(dominantColor.slice(5, 7), 16);
    
    //         const imageColor = { r, g, b };
    
    //         // Encontrar a cor mais próxima
    //         let closestColor = null;
    //         let smallestDistance = Infinity;
    
    //         Object.keys(buttonColors).forEach((color) => {
    //             const distance = calculateDistance(imageColor, buttonColors[color]);
    //             if (distance < smallestDistance) {
    //                 smallestDistance = distance;
    //                 closestColor = color;
    //             }
    //         });
    
    //         // Adicionar a imagem à categoria correspondente
    //         colorDatabase[closestColor].push({
    //             class: image.class,
    //             path: image.path
    //         });
    //     });
    
    //     // Gravar todo o banco de dados consolidado em uma única chave no localStorage
    //     const consolidatedDatabase = { imagesByColor: colorDatabase };
    //     localStorage.setItem("colorDatabase", JSON.stringify(consolidatedDatabase));
    
    //     console.log("Color database successfully created and saved in localStorage.");
    // }
    







    /**
     * Converte uma cor hexadecimal (#RRGGBB) para um array RGB.
     * @param {string} hex - A cor hexadecimal.
     * @returns {number[]} - Um array [R, G, B].
     */
    hexToRGB(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b];
    }
    
    /**
     * Calcula a distância Euclidiana entre duas cores RGB.
     * @param {number[]} rgb1 - O primeiro array RGB [R, G, B].
     * @param {number[]} rgb2 - O segundo array RGB [R, G, B].
     * @returns {number} - A distância Euclidiana.
     */
    calculateEuclideanDistance(rgb1, rgb2) {
        return Math.sqrt(
            Math.pow(rgb1[0] - rgb2[0], 2) +
            Math.pow(rgb1[1] - rgb2[1], 2) +
            Math.pow(rgb1[2] - rgb2[2], 2)
        );
    }
    

    /**
     * Creates the image similarity database in Local Storage.
     * This method should be implemented later to create the image similarity database.
     */
    createIExampledatabaseLS() {
        // Method to create the JSON database in the localStorage for Image Example queries
        this.zscoreNormalization(); // Normalize the color moments before saving

        //TODO: Implement this method
    }

    /**
     * Performs z-score normalization on color moments.
     * This method normalizes the color moments to have zero mean and unit variance.
     */
    zscoreNormalization() {
        const overall_mean = []; // Mean for each color moment
        const overall_std = []; // Standard deviation for each color moment

        // Initialize the mean and std arrays
        for (let i = 0; i < this.allpictures.stuff[0].color_moments.length; i++) {
            overall_mean.push(0);
            overall_std.push(0);
        }

        // Compute the mean of the color moments
        for (let i = 0; i < this.allpictures.stuff.length; i++) {
            for (let j = 0; j < this.allpictures.stuff[0].color_moments.length; j++) {
                overall_mean[j] += this.allpictures.stuff[i].color_moments[j];
            }
        }

        // Finalize the mean values
        for (let i = 0; i < this.allpictures.stuff[0].color_moments.length; i++) {
            overall_mean[i] /= this.allpictures.stuff.length;
        }

        // Compute the standard deviation of the color moments
        for (let i = 0; i < this.allpictures.stuff.length; i++) {
            for (let j = 0; j < this.allpictures.stuff[0].color_moments.length; j++) {
                overall_std[j] += Math.pow((this.allpictures.stuff[i].color_moments[j] - overall_mean[j]), 2);
            }
        }

        // Finalize the standard deviation values
        for (let i = 0; i < this.allpictures.stuff[0].color_moments.length; i++) {
            overall_std[i] = Math.sqrt(overall_std[i] / this.allpictures.stuff.length);
        }

        // Apply z-score normalization to each image's color moments
        for (let i = 0; i < this.allpictures.stuff.length; i++) {
            for (let j = 0; j < this.allpictures.stuff[0].color_moments.length; j++) {
                this.allpictures.stuff[i].color_moments[j] = (this.allpictures.stuff[i].color_moments[j] - overall_mean[j]) / overall_std[j];
            }
        }
    }

    /**
     * Searches images based on a selected color from andatabase.
     * @param {string} category - The category to search within.
     * @param {string} color - The selected color.
     */
    searchColor(color) {
        console.log("BUSCA PELA COR");

        // Remove o prefixo '#' antes de buscar no localStorage
        const normalizedColor = color.startsWith("#") ? color.substring(1).toLowerCase() : color.toLowerCase();

        // Lê o banco de dados de cores
        let jsonDoc = this.lsDb.read("colorDatabase");
        console.log("=============");
        console.log(jsonDoc);
        console.log("=============");

        if (!jsonDoc || !jsonDoc[normalizedColor]) {
            console.error(`Nenhuma imagem encontrada para a cor: ${color}`);
            return;
        }

        let imageList = this.db.search(normalizedColor, jsonDoc, null);

        console.log("Conteúdo de img_paths antes de esvaziar:", this.img_paths.stuff);
        this.img_paths.emptyPool();
        console.log("Conteúdo de img_paths depois de esvaziar:", this.img_paths.stuff);

        this.clearCanvas(this.viewCanvas);

        // Insere as imagens filtradas na lista de caminhos de imagem
        imageList.forEach((element) => {
            this.img_paths.insert(element);
        });

        console.log("*******DEBUG IMGPATHS******");
        console.log("img_paths:", this.img_paths.stuff);
        console.log("*******DEBUG IMGPATHS******");

        // Atualiza as imagens relevantes e exibe-as
        this.relevantPictures();
        this.gridView(this.viewCanvas);
    }

    /**
     * Searches images based on keywords.
     * @param {string} category - The category to search within.
     * @param {string[]} keywords - An array of keywords to search for.
     * @returns {Promise<void>} - A promise that resolves when the search is complete.
     */
    
    
    
    searchKeywords(category, canvas) {
        // Busca imagens pela categoria
        const search_query = this.db.search(
            category,
            this.jsonData,
            this.num_Images
        );

        console.log("*******DEBUG******");
        console.log("search_query:", search_query); // Print para verificar o conteúdo de search_query

        console.log("*******DEBUG******");

        // Limpa as pools existentes
        this.img_paths.emptyPool(); // Corrected method name
        this.allpictures.emptyPool(); // Corrected method name

        // Adiciona os caminhos retornados à pool de img_paths
        search_query.forEach((element) => {
            this.img_paths.insert(element);
        });

        console.log("*******DEBUG IMGPATHS******");
        console.log("img_paths:", this.img_paths.stuff); // Print para verificar o conteúdo de img_paths
        console.log("*******DEBUG IMGPATHS******");

        // Atualiza imagens relevantes e exibe no canvas
        this.relevantPictures();
        this.gridView(canvas);
    }

    /**
     * Searches images based on image similarity.
     * @param {string} IExample - The example image path.
     * @param {number} dist - The distance threshold.
     */
    searchISimilarity(IExample, dist) {
        // Method to search images based on image similarities.
        //TODO: Implement this method
    }

    /**
     * Calculates the Manhattan distance between two images based on color moments.
     * @param {Picture} img1 - The first image.
     * @param {Picture} img2 - The second image.
     * @returns {number} - The calculated Manhattan distance.
     */
    calcManhattanDist(img1, img2) {
        //Method to compute the Manhattan difference between 2 images which is one way of measure the similarity between images.
        let manhattan = 0;

        for (let i = 0; i < img1.color_moments.length; i++) {
            manhattan += Math.abs(img1.color_moments[i] - img2.color_moments[i]);
        }
        manhattan /= img1.color_moments.length;
        return manhattan;
    }

    /**
     * Sorts a list of distances by Manhattan distance.
     * @param {Object[]} list - The list of distances to be sorted. Each item should have a 'distance' property.
     * This method sorts the list of images based on the Manhattan distance between their color moments.
     * The lower the distance, the higher the image ranks in the sorted list.
     */
    sortbyManhattanDist(list) {
        // Method to sort images according to the Manhattan distance measure
        // This will sort the 'list' of distances in ascending order.
        //TODO: this method should be completed by the students
    }

    /**
     * Sorts a list of images based on the number of pixels of a selected color.
     * @param {number} idxColor - The index of the color in the color array.
     * @param {Picture[]} list - The list of images to be sorted.
     * This method sorts the list of images based on the number of pixels in a specific color,
     * as determined by the histogram at the index `idxColor`. 
     * The images with the most pixels of the selected color appear first in the sorted list.
     */
    sortbyColor(idxColor, list) {
        // Method to sort images according to the number of pixels of a selected color
        list.sort(function (a, b) {
            return b.hist[idxColor] - a.hist[idxColor]; // Sort by the color count in the histogram
        });
    }

    /**
     * Displays images in a grid view on a specified canvas.
     * @param {HTMLCanvasElement} canvas - The canvas element for rendering the grid view.
     * This method arranges the images in a grid on the canvas. The number of images per row 
     * and the layout of the grid should be determined dynamically, depending on the size of the canvas.
     * It will draw the images in their corresponding positions, creating a visual grid of images.
     */
    gridView(canvas) {
        let posX = 75; // Starting X position
        let posY = 30; // Starting Y position
        let col = 0; // Current column count
        let maxCol = 5; // Maximum columns per row

        // Certifique-se de que `this.allpictures.stuff` está definido e contém elementos
        if (!this.allpictures || !this.allpictures.stuff || this.allpictures.stuff.length === 0) {
            console.error("allpictures is not initialized or empty.");
            return;
        }

        // Loop through the number of images to be shown
        for (let i = 0; i < Math.min(this.numShownPic, this.allpictures.stuff.length); i++) {
            if (!this.allpictures.stuff[i]) {
                console.error(`Image at index ${i} is undefined.`);
                continue;
            }

            this.allpictures.stuff[i].setPosition(posX, posY); // Set position for the image
            this.allpictures.stuff[i].draw(canvas); // Draw the image on the canvas
            col++; // Increment column count
            posX += 215; // Move to the next X position
            if (col === maxCol) { // Check if max columns reached
                posY += 175; // Move to the next row
                posX = 75; // Reset X position
                col = 0; // Reset column count
            }
        }
    }

    relevantPictures() {
        this.allpictures.emptyPool(); // Limpa apenas se necessário

        for (let i = 0; i < this.img_paths.stuff.length; i++) {
            let img = new Picture(
                0,
                0,
                this.imgWidth,
                this.imgHeight,
                this.img_paths.stuff[i],
                "create"
            );
            this.allpictures.insert(img);
        }

        console.log("*******DEBUG ALLPICTURES******");
        console.log("allpictures:", this.allpictures.stuff);
        console.log("*******DEBUG ALLPICTURES******");

        this.img_paths.emptyPool(); // Limpa após transferir
    }

    /**
     * Clears the canvas and draws a rectangle.
     * @param {HTMLCanvasElement} canvas - The canvas element to clear.
     */
    clearCanvas(canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
        ctx.fillStyle = "white"; // Define a cor do retângulo
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Desenha um retângulo branco
    }
}

/**
 * Represents a Pool that manages a collection of objects.
 * This class allows inserting, removing, and emptying objects from the pool,
 * ensuring that the pool does not exceed its maximum capacity.
 */
class Pool {
    /**
     * Constructs a Pool instance with a specified maximum size.
     * @param {number} maxSize - The maximum size of the pool. 
     * The pool will not accept more objects than this limit.
     */
    constructor(maxSize) {
        this.size = maxSize; // Maximum size of the pool, limits the number of objects
        this.stuff = []; // Collection of objects currently stored in the pool
    }

    /**
     * Inserts an object into the pool if there is available space.
     * If the pool is full, it alerts the user that no more objects can be added.
     * @param {*} obj - The object to be inserted into the pool.
     */
    insert(obj) {
        if (this.stuff.length < this.size) {
            this.stuff.push(obj); // Insert the object into the pool if space is available
        } else {
            alert("The application is full: there isn't more memory space to include objects");
            // Alert the user if the pool has reached its maximum capacity
        }
    }

    /**
     * Removes an object from the pool if there are objects present.
     * If the pool is empty, it alerts the user that there are no objects to remove.
     */
    remove() {
        if (this.stuff.length !== 0) {
            this.stuff.pop(); // Remove the last object added to the pool
        } else {
            alert("There aren't objects in the application to delete");
            // Alert the user if the pool is empty and there are no objects to remove
        }
    }

    /**
     * Empties the entire pool by removing all objects.
     * This method repeatedly calls remove() until the pool is empty.
     */
    emptyPool() {
        while (this.stuff.length > 0) {
            this.remove(); // Remove objects until the pool is empty
        }
    }
}

export { ISearchEngine, Pool }















































