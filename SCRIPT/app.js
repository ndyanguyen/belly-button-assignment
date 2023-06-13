// Use d3 to read samples
const sampleUrl = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";
let samplesPromise = d3.json(sampleUrl);

//upload the data to console
samplesPromise.then(data => console.log(data));

// variable for the dropdown menu
let dropdownMenu = d3.select("#selDataset") 

function populateDropdown(data){
    for (i=0; i < data.names.length; i++) {
        let newOption = dropdownMenu.append("option");
        newOption.attr("value", data.names[i]);
        newOption.text(data.names[i]);
    }
};

// Create a function to return the sample that identifies with the dropdown selection
function currentSample(data) {
    let sample = {};
    for (i=0; i<data.samples.length; i++) {
        if (dropdownMenu.node().value == data.samples[i].id) {
            sample = data.samples[i];
        };
    };
    return sample
};

// populate the demographic data by creating a function
function populateDemographics(data) {
    let subjectMetadata = {};
    for (i=0; i<data.metadata.length; i++) {
        if (dropdownMenu.node().value == data.metadata[i].id) {
            subjectMetadata = data.metadata[i];
        };
    };
    console.log(subjectMetadata);
    let metadataKeys = Object.keys(subjectMetadata);
    let metadataValues = Object.values(subjectMetadata);

    let demographicString = "";
    for (i=0; i<metadataKeys.length; i++) {
        let key = metadataKeys[i];
        let value = metadataValues[i];
        
        let newString = `${metadataKeys[i]}: ${metadataValues[i]}<br>`;
        demographicString += newString;
    };

    d3.select("#sample-metadata").html(demographicString);
    
};

function init(data) {
    // POPULATE DROPDOWN
    populateDropdown(data);

    // POPULATE DEMOGRAPHICS
    populateDemographics(data);

    // Get the current sample based on the dropdown
    let sample = currentSample(data);
    console.log(sample);

    // CREATE BAR CHART

    // Put samples into an array of objects
    let samplesArray = [];
    for (i=0; i<sample.otu_ids.length; i++) {
        let newSample = {};
        newSample.otu_id = `OTU ${String(sample.otu_ids[i])}`;
        newSample.sample_value = sample.sample_values[i];
        newSample.otu_label = sample.otu_labels[i];
        samplesArray.push(newSample)

    };
    console.log(samplesArray);

    // Get the top 10 values based on sample_value then order those in ascending order for Plotly
    let topTenSamples = samplesArray.sort(function(a,b) {
        return b.sample_value - a.sample_value;
    }).slice(0,10).reverse();
    console.log(topTenSamples);

    // Build trace of top ten sample values
    let barTrace = {
        x: topTenSamples.map(sample => sample.sample_value),
        y: topTenSamples.map(sample => sample.otu_id),
        text: topTenSamples.map(sample => sample.otu_label),
        type: 'bar',
        orientation: 'h'
    };
    
    let barLayout = {
        title: `Top 10 Sample Values for Subject ${dropdownMenu.node().value}`,
        height: 700,
        width: 1000
    }

    let barTraceData = [barTrace];
    Plotly.newPlot("bar", barTraceData, barLayout);

    // CREATE BUBBLE CHART
    let bubbleTrace = {
        x: sample.otu_ids.map(oid => oid),
        y: sample.sample_values.map(value => value),
        text: sample.otu_labels.map(label => label),
        mode: 'markers',
        marker: {
            color: sample.otu_ids.map(oid => oid),
            size: sample.sample_values.map(value => value)
        }
      };
    
    let bubbleTraceData = [bubbleTrace];

    let bubbleLayout = {
        title: `Subject ${dropdownMenu.node().value} Bubble Chart of Sample Values`,
        xaxis: {title: "OTU IDs"},
        showlegend: false,
        height: 700,
        width: 1000
      };
    
    Plotly.newPlot("bubble", bubbleTraceData, bubbleLayout);
};

function updateCharts(data) {
    // POPULATE DEMOGRAPHICS
    populateDemographics(data);

    // Get the current sample based on the dropdown
    let sample = currentSample(data);
    console.log(sample);

    // Put samples into an array of objects
    let samplesArray = [];
    for (i=0; i<sample.otu_ids.length; i++) {
        let newSample = {};
        newSample.otu_id = `OTU ${String(sample.otu_ids[i])}`;
        newSample.sample_value = sample.sample_values[i];
        newSample.otu_label = sample.otu_labels[i];
        samplesArray.push(newSample)

    };
    console.log(samplesArray);

    // Get the top 10 values based on sample_value then order those in ascending order for Plotly
    let topTenSamples = samplesArray.sort(function(a,b) {
        return b.sample_value - a.sample_value;
    }).slice(0,10).reverse();
    console.log(topTenSamples);

    let updateBarX = topTenSamples.map(sample => sample.sample_value);
    let updateBarY = topTenSamples.map(sample => sample.otu_id);
    let updateBarText = topTenSamples.map(sample => sample.otu_label);
    
    // Restyle bar chart
    Plotly.restyle("bar", "x", [updateBarX]);
    Plotly.restyle("bar", "y", [updateBarY]);
    Plotly.restyle("bar", "text", [updateBarText]);
    Plotly.relayout("bar", "title", `Top 10 Sample Values for Subject ${dropdownMenu.node().value}`);

     // UPDATE BUBBLE CHART
    let updateBubbleOid = sample.otu_ids.map(oid => oid);
    let updateBubbleValue =  sample.sample_values.map(value => value);
    let updateBubbleText = sample.otu_labels.map(label => label);

    // Restyle bubble chart
    Plotly.restyle("bubble", "x", [updateBubbleOid]);
    Plotly.restyle("bubble", "y", [updateBubbleValue]);
    Plotly.restyle("bubble", "text", [updateBubbleText]);
    Plotly.restyle("bubble", "marker.color", [updateBubbleOid]);
    Plotly.restyle("bubble", "marker.size", [updateBubbleValue]);

    Plotly.relayout("bubble", "title", `Subject ${dropdownMenu.node().value} Bubble Chart of Sample Values`);
};

// Function to execute when the dropdown selection is changed
function optionChanged() {
    samplesPromise.then(updateCharts);
};

// Initialize the webpage
samplesPromise.then(init);