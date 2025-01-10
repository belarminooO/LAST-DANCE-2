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
        this.categories = ["burj khalifa",
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
                           "venezuela angel falls"];

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
                console.log("ULTIMA IMAGEM PROCESSADA CHECKED:",this.jsonData.images.length);
                console.log("ULTIMA IMAGEM PROCESSADA CHECKED:", img);
            }
        }
        console.log("PROCESSO CONCLUIDO");
    }
    // databaseProcessing(cnv) {
        //     const h12color = new ColorHistogram(this.redColor, this.greenColor, this.blueColor);
        //     const colmoments = new ColorMoments();
        
        //     const img = new Picture(0, 0, 100, 100, "Images/isel.jpg", "test");
        //     const eventname = `processed_picture_${img.impath}`;
        //     const eventP = new Event(eventname);
        //     this.imageProcessed(img, eventname);
        //     // Adicionar o listener para o evento antes do início do processamento
        //     // document.addEventListener(eventname, () => {
            //     //     this.imageProcessed(img, eventname);
            //     //     console.log("Event listener executed: ", eventname);
            //     // });
            
            //     // Iniciar o processamento
            //     img.computation(cnv, h12color, colmoments, eventP);
            // }
            
            
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
                console.log("Debug - criando banco de dados de imagens por cor");
            
                const self = this;
            
                // Iterar por cada categoria
                this.categories.forEach(function (category) {
                    // Objeto para armazenar as imagens categorizadas por cor para a categoria atual
                    const categoryDatabase = {
                        images: []
                    };
            
                    // Filtrar imagens pela categoria
                    let imgCategory = self.allpictures.stuff.filter(function (img) {
                        return img.category === category;
                    });
            
                    // Iterar por cada cor
                    self.colors.forEach(function (color) {
                        // Ordenar as imagens pela cor selecionada
                        self.sortbyColor(self.colors.indexOf(color), imgCategory);
            
                        // Adicionar as 30 imagens com maior número de pixels para a cor atual
                        for (let i = 0; i < self.numShownPic && i < imgCategory.length; i++) {
                            if (imgCategory[i].impath) {
                                categoryDatabase.images.push({
                                    class: color,
                                    path: imgCategory[i].impath
                                });
                            } else {
                                console.warn(`Imagem sem caminho (impath) encontrada em ${category}, cor ${color}:`, imgCategory[i]);
                            }
                        }
                    });
            
                    // Salvar o banco de dados da categoria como uma string JSON no localStorage
                    try {
                        localStorage.setItem(category, JSON.stringify(categoryDatabase));
                        console.log(`Banco de dados da categoria ${category} salvo no localStorage:`, categoryDatabase);
                    } catch (e) {
                        console.error(`Erro ao salvar no localStorage para a categoria ${category}:`, e);
                    }
                });
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
             * Searches images based on a selected color from an XML database.
             * @param {string} category - The category to search within.
             * @param {string} color - The selected color.
            */
          searchColor(category, color) {
    console.log("BUSCA PELA COR");

    // Lê o banco de dados XML para a categoria especificada
    let jssonDoc = this.lsDb.read(category); // Supondo que lsDb tenha um método para ler XML

    // Busca imagens no XML
    let image_list = this.db.search(color.toLowerCase(), jssonDoc, this.numImages);

    // Insere as imagens filtradas na lista de caminhos de imagem
    image_list.forEach((element) => {
        this.img_paths.insert(element);
    });

    console.log("*******DEBUG IMGPATHS******");
    console.log("img_paths:", this.img_paths.stuff); // Print para verificar o conteúdo de img_paths
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
        const self = this;
    
        // Limpa a pool de imagens existentes
        this.allpictures.emptyPool(); // Método corrigido
    
        // Cria novos objetos Picture com base nos caminhos retornados
        for (let i = 0; i < this.img_paths.stuff.length; i++) {
            let img = new Picture(
                0,
                0,
                self.imgWidth,
                self.imgHeight,
                self.img_paths.stuff[i],
                "create"
            );
            this.allpictures.insert(img);
            console.log("==================");
            console.log(this.allpictures);
            console.log("==================");
        }
    
        // Limpa a pool de caminhos
        this.img_paths.emptyPool(); // Método corrigido
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
