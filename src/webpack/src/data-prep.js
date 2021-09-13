
import * as d3 from "d3";
import {average, median, arraysEqual, sum, arrayMin, arrayMax, normalize, undoNormalize, shuffleArray, sortJsObject} from "../utilities.js"


export function sample_with_bins(domain,threshold,vectors) {
	
	var histGenerator = d3.bin()
	  .domain(domain)    // Set the domain to cover the entire intervall [0;]
	  .thresholds(threshold);  // number of thresholds; this will create 10+1 bins

	var bins = histGenerator(vectors.map(e => e.label))
	.filter(e => e.length>=1).map(e => [arrayMin(e),e.length,arrayMax(e)])

	//console.log(bins);

	var mean_most_common_least_common_count = median(bins.map(e => e[1]));

	var selectVectors = [];

	for(var i = 0; i<mean_most_common_least_common_count;i++){
		bins.forEach(e => {
		var temp = vectors.filter(each => each.label>=e[0] && each.label<=e[2])
		selectVectors.push(temp[Math.floor(Math.random() * temp.length)])
		})
	}
	return selectVectors;
}