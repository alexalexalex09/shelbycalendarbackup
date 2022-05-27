var view = $("#cal").fullCalendar("getView");

var data = {
  filters: {},
  view: null,
  start: view.intervalStart.format("YYYY-MM-DD"),
  end: view.intervalEnd.format("YYYY-MM-DD"),
  viewType: com.simple.Calendar.view.viewType,
  name: view.name,
};

$.each(com.simple.Calendar.view.filtersSelected, function (key, val) {
  if (com.simple.Calendar.view.filtersSelected[key].length) {
    $("#filters li a[data-type='" + key + "']").addClass("hasActiveFilter");
    data.filters[key] = val;
  }
});
const options = {
  method: "POST",
  body: {},
  headers: {
    "Content-Type": "application/json",
  },
};
fetch("/calendar/downloadEvents?" + $.param(data), options).then((response) => {
  response.text().then((res) => {
    console.log("converting to array...");
    let csvArray = CSVToArray(res, ",");
    console.log(csvArray.length);
    console.log(csvArray[0]);
    for (var i = 0; i < csvArray.length; i++) {
      var toSwitch = csvArray[i].splice(6, 1);
      csvArray[i].splice(0, 0, toSwitch);
    }
    csvArray[0][0] = "Subject";
    let date = csvArray[1][2];
    let month = date.substring(0, 2);
    let year = date.substring(6, 10);
    month = getMonthName(month);
    csv = arrayToCSV(csvArray, true);
    var downloadLink = document.createElement("a");
    var blob = new Blob(["\ufeff", csv]);
    var url = URL.createObjectURL(blob);
    downloadLink.href = url;

    downloadLink.download = month + " " + year + ".csv";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  });
});

function getMonthName(month) {
  console.log(month);
  switch (month) {
    case "01":
      return "January";
    case "02":
      return "February";
    case "03":
      return "March";
    case "04":
      return "April";
    case "05":
      return "May";
    case "06":
      return "June";
    case "07":
      return "July";
    case "08":
      return "August";
    case "09":
      return "September";
    case "10":
      return "October";
    case "11":
      return "November";
    case "12":
      return "December";
  }
}

const arrayToCSV = (array, hasQuotes) => {
  return array
    .map((row) =>
      row.map((cell) => (!!hasQuotes ? `"${cell}"` : cell.toString())).join(`,`)
    )
    .join(`\n`);
};

function CSVToArray(strData, strDelimiter) {
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = strDelimiter || ",";

  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
    // Delimiters.
    "(\\" +
      strDelimiter +
      "|\\r?\\n|\\r|^)" +
      // Quoted fields.
      '(?:"([^"]*(?:""[^"]*)*)"|' +
      // Standard fields.
      '([^"\\' +
      strDelimiter +
      "\\r\\n]*))",
    "gi"
  );

  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]];

  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = null;

  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while ((arrMatches = objPattern.exec(strData))) {
    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[1];

    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);
    }

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      var strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
    } else {
      // We found a non-quoted value.
      var strMatchedValue = arrMatches[3];
    }

    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
  }

  // Return the parsed data.
  return arrData;
}
