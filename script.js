document.addEventListener('DOMContentLoaded', () => {
    const graphic = document.getElementById('graphic');
    const steps = document.querySelectorAll('.step');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const step = entry.target.dataset.step;
                updateGraphic(step);
            }
        });
    }, { threshold: 0.5 });

    steps.forEach(step => {
        observer.observe(step);
    });

    function updateGraphic(step) {
        graphic.textContent = `Graphic for Step ${step}`;
        // Update your graphic based on the current step
    }
});

// Initialize scrollama
const scroller = scrollama();

// Array of names
const names = ['Alvaro', 'Douglas', 'Gabriela', 'Karen', 'Marcelo', 'Maria Elena', 'Medina', 'Victor', 'Yorling'];

// Callback for scrollama events
function handleStepEnter(response) {
    console.log(response);
    const chartElement = document.getElementById('chart');
    if (chartElement && response.index < names.length) {
        chartElement.textContent = names[response.index];
    }
}

// Function to populate photo galleries and audio players
function populateGalleriesAndAudio() {
    names.forEach(name => {
        const galleryId = `gallery-${name.replace(/\s+/g, '')}`;
        const audioContainerId = `audio-${name.replace(/\s+/g, '')}`;
        const gallery = document.getElementById(galleryId);
        const audioContainer = document.getElementById(audioContainerId);
        
        if (gallery) {
            // Populate photo gallery
            for (let i = 1; i <= 5; i++) {
                const img = document.createElement('img');
                img.src = `images/${name.replace(/\s+/g, '_')}/${i}.jpg`;
                img.alt = `${name}'s photo ${i}`;
                img.style.display = i === 1 ? 'block' : 'none'; // Show only the first image
                gallery.appendChild(img);
            }
            setupGalleryNavigation(gallery);
        }
        
        if (audioContainer) {
            // Add audio player with progressive loading
            const audioPath = `/audio/${name}.mp3`;
            const audio = document.createElement('audio');
            audio.controls = true;
            audioContainer.appendChild(audio);

            // Set up MediaSource
            const mediaSource = new MediaSource();
            audio.src = URL.createObjectURL(mediaSource);

            mediaSource.addEventListener('sourceopen', () => {
                const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
                let index = 0;
                const chunkSize = 64 * 1024; // 64 KB chunks

                function loadNextChunk() {
                    fetch(audioPath, {
                        headers: {
                            Range: `bytes=${index}-${index + chunkSize - 1}`
                        }
                    })
                    .then(response => response.arrayBuffer())
                    .then(chunk => {
                        sourceBuffer.appendBuffer(chunk);
                        index += chunk.byteLength;
                        if (mediaSource.readyState === 'open') {
                            loadNextChunk();
                        }
                    })
                    .catch(error => {
                        console.error('Error loading audio chunk:', error);
                        if (index === 0) {
                            audioContainer.style.display = 'none';
                        }
                    });
                }
                sourceBuffer.addEventListener('updateend', () => {
                    if (!audio.paused && mediaSource.readyState === 'open') {
                        loadNextChunk();
                    }
                });

                loadNextChunk();
            });

            audio.addEventListener('play', () => {
                if (mediaSource.readyState === 'open') {
                    loadNextChunk();
                }
            });
        }
    });
            // Add audio player
            // const audioPath = `/audio/${name}.mp3`;
            // fetch(audioPath)
            //     .then(response => {
            //         if (response.ok) {
            //             const audio = document.createElement('audio');
            //             audio.controls = true;
            //             audio.src = audioPath;
            //             audioContainer.appendChild(audio);
            //         } else {
            //             audioContainer.style.display = 'none';
            //         }
            //     })
            //     .catch(() => {
            //         audioContainer.style.display = 'none';
            //     });
        }
    });
}
//test
// Function to setup gallery navigation
function setupGalleryNavigation(gallery) {
    const container = gallery.closest('.photo-gallery-container');
    const prevBtn = container.querySelector('.prev');
    const nextBtn = container.querySelector('.next');
    const images = gallery.querySelectorAll('img');
    let currentIndex = 0;

    function showImage(index) {
        images.forEach((img, i) => {
            img.style.display = i === index ? 'block' : 'none';
        });
    }

    function navigateGallery(direction) {
        currentIndex = (currentIndex + direction + images.length) % images.length;
        showImage(currentIndex);
    }

    prevBtn.addEventListener('click', () => navigateGallery(-1));
    nextBtn.addEventListener('click', () => navigateGallery(1));

    // Show the first image initially
    showImage(currentIndex);
}

// Add a function to set the initial name
function setInitialName() {
    const chartElement = document.getElementById('chart');
    if (chartElement) {
        chartElement.textContent = names[0];
    }
}

// Object to store quotes for each participant
const participantQuotes = {
    Alvaro: [
        "Quote 1 from Alvaro",
        "Quote 2 from Alvaro",
        // ... add more quotes
    ],
    Douglas: [
        "Quote 1 from Douglas",
        "Quote 2 from Douglas",
        // ... add more quotes
    ],
    // ... repeat for all participants
};

function setupQuoteRotation() {
    names.forEach(name => {
        const quoteContainer = document.getElementById(`quote-${name.replace(/\s+/g, '')}`);
        if (quoteContainer && participantQuotes[name]) {
            let currentQuoteIndex = 0;
            
            function rotateQuote() {
                quoteContainer.style.opacity = 0;
                setTimeout(() => {
                    quoteContainer.textContent = participantQuotes[name][currentQuoteIndex];
                    quoteContainer.style.opacity = 1;
                    currentQuoteIndex = (currentQuoteIndex + 1) % participantQuotes[name].length;
                }, 500);
            }

            rotateQuote(); // Initial quote
            setInterval(rotateQuote, 20000); // Rotate every 20 seconds
        }
    });
}

// Modify the init function to include setupQuoteRotation
function init() {
    populateGalleriesAndAudio();
    setInitialName();
    createWordFrequencyChart();
    createSentimentChart();  // Add this line

    // Setup the scroller
    scroller
        .setup({
            step: '.step',
            offset: 0.5,
            debug: false
        })
        .onStepEnter(handleStepEnter);

    // Setup resize event
    window.addEventListener('resize', scroller.resize);
}

function createWordFrequencyChart() {
    const margin = {top: 40, right: 30, bottom: 60, left: 100};
    const width = 600 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    const svg = d3.select("#word-frequency-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    d3.csv("data/word_freq_total.csv").then(function(data) {
        const wordsToOmit = ["adonde", "arbol", "humano", "foto", "alli", "mas", "gusta", "tambien", "asi", "congo", "zona", "medio", "dia", "tome", "mira", "aparte", "pequena", "persona", "sentir", "sirve", "ve", "aca", "despues", "ahi", "paso", "habia", "vemos", "anda", "mire", "heche", "decimos", "media", "forma", "habian", "echamos", "aveces", "alla", "linea", "orilla", "palos", "andar", "peses", "senora", "llama", "teniamos", "digo", "sale", "hablamos", "viene", "tomar", "mil", "ustedes", "lugares", "entrada", "queria", "quedo", "comen", "dije", "huevos", "fascina", "usando", "llevamos", "llegan", "ven", "sentimos", "estabamos", "llega", "decia", "cosa", "tomando", "trabajando", "siento", "botar", "amo"];

        // Filter, sort the data, and take only the top 33 words
        const filteredData = data
            .filter(d => !wordsToOmit.includes(d.word) && +d.frequency > 1)
            .sort((a, b) => d3.descending(+a.frequency, +b.frequency))
            .slice(0, 33);

        // Set up scales
        const x = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => +d.frequency)])
            .range([0, width]);

        const y = d3.scaleBand()
            .domain(filteredData.map(d => d.word))
            .range([0, height])
            .padding(0.1);

        // Add x-axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(0,5)")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-family", "'Open Sans', sans-serif");

        // Add y-axis
        svg.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "12px")
            .style("font-family", "'Open Sans', sans-serif");

        // Add bars
        svg.selectAll("myRect")
            .data(filteredData)
            .enter()
            .append("rect")
            .attr("x", x(0))
            .attr("y", d => y(d.word))
            .attr("width", d => x(+d.frequency))
            .attr("height", y.bandwidth())
            .attr("fill", "#69b3a2")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("fill", "#28a745");  // Highlight color
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`<span class="tooltip-word">"${d.word}"</span> was used <span class="tooltip-frequency">${d.frequency} times</span> by photo-voice participants to describe their photos`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                d3.select(this).attr("fill", "#69b3a2");  // Original color
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add x-axis label with arrow
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 5)
            .attr("font-size", "14px")
            .style("font-family", "'Open Sans', sans-serif")
            .text("Frequency");

        // Add arrow to Frequency label
        svg.append("svg:defs").append("svg:marker")
            .attr("id", "arrow")
            .attr("refX", 3)
            .attr("refY", 3)
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 0 6 3 0 6 1.5 3")
            .style("fill", "black");

        svg.append("line")
            .attr("x1", width / 2 + 40)
            .attr("y1", height + margin.bottom - 10)
            .attr("x2", width / 2 + 50)
            .attr("y2", height + margin.bottom - 10)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("marker-end", "url(#arrow)");

        // Add y-axis label
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 10)
            .attr("x", -height / 2)
            .attr("font-size", "14px")
            .style("font-family", "'Open Sans', sans-serif")
            .text("Word");
    });
}

function createSentimentChart() {
    const chartContainer = document.getElementById("sentiment-chart");
    const containerWidth = chartContainer.offsetWidth;
    const margin = {top: 40, right: 30, bottom: 60, left: 60};
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#sentiment-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    d3.csv("data/sent_total.csv").then(function(data) {
        console.log("Raw data:", data);  // Log raw data

        // Convert string to number and rename columns if necessary
        data.forEach(d => {
            d.sent_CAT = +d.sent_CAT || +d.Number_of_Comments;  // Try both column names
            d.sent = d.sent || d.Sentiment;  // Try both column names
        });

        // Sort the data to ensure the correct order
        data.sort((a, b) => {
            const order = {"NEG": 0, "NEU": 1, "POS": 2};
            return order[a.sent] - order[b.sent];
        });

        console.log("Processed data:", data);  // Log processed data

        // Color scale for sentiment (muted colors)
        const colorScale = d3.scaleOrdinal()
            .domain(["NEG", "NEU", "POS"])
            .range(["#E67E5A", "#E1A95F", "#2C5F2D"]);

        // X axis
        const x = d3.scaleBand()
            .range([0, width])
            .domain(["NEG", "NEU", "POS"])
            .padding(0.2);
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d => {
                if (d === "NEG") return "Negative";
                if (d === "NEU") return "Neutral";
                if (d === "POS") return "Positive";
                return d;
            }))
            .selectAll("text")
            .attr("transform", "translate(0,5)")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-family", "'Open Sans', sans-serif");

        // Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.sent_CAT)])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "12px")
            .style("font-family", "'Open Sans', sans-serif");

        // Bars
        svg.selectAll("mybar")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => x(d.sent))
            .attr("y", d => y(d.sent_CAT))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.sent_CAT))
            .attr("fill", d => colorScale(d.sent))
            .on("mouseover", function(event, d) {
                d3.select(this).attr("opacity", 0.8);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`<strong style="color:${colorScale(d.sent)}">${d.sent_CAT}</strong> comments from photo-voice participants were <strong style="color:${colorScale(d.sent)}">${d.sent === "NEG" ? "NEGATIVE" : d.sent === "NEU" ? "NEUTRAL" : "POSITIVE"}</strong>`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                d3.select(this).attr("opacity", 1);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        console.log("Chart elements:", svg.selectAll("rect").nodes());  // Log chart elements

        // Add labels on top of bars
        svg.selectAll(".text")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", (d) => x(d.sent) + x.bandwidth() / 2)
            .attr("y", (d) => y(d.sent_CAT) - 5)
            .attr("text-anchor", "middle")
            .text((d) => d.sent_CAT)
            .attr("fill", "#4A3C31")
            .style("font-family", "'Open Sans', sans-serif")
            .style("font-size", "12px");

        // Add X axis label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .text("Sentiment")
            .attr("fill", "#4A3C31")
            .style("font-family", "'Open Sans', sans-serif")
            .style("font-size", "14px");

        // Add Y axis label (centered)
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 10)
            .attr("x", -height / 2)
            .text("Number of Comments")
            .attr("fill", "#4A3C31")
            .style("font-family", "'Open Sans', sans-serif")
            .style("font-size", "14px");
    }).catch(function(error) {
        console.log("Error loading the CSV file:", error);
    });
}

// Kick things off
init();