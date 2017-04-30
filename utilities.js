var dateFormat = require('dateformat');

function getMonthFromString(monthName){
   var currentDate = new Date();
   var d = new Date("1-"+monthName+"-"+currentDate.getFullYear());
   return d;
};

function setDateParamByMonthName(monthName){
  var startDate = getMonthFromString(monthName);
  var rangeStart = dateFormat(startDate, "yyyy-mm-dd");
  rangeStart += "T00:00:00Z";

  var endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
  var rangeEnd = dateFormat(endDate, "yyyy-mm-dd");
  rangeEnd += "T00:00:00Z";

  return "&start_date.range_start="+rangeStart+"&start_date.range_end="+rangeEnd;
};
exports.setDateParamByMonthName = setDateParamByMonthName;

function setDateParam(url, entity, message){
      var returnValue = "";
      if(entity.name == 'date'){
        if(entity.raw == 'today'){
          returnValue = "&start_date.keyword=today";
        } else {
          var datetime = new Date();
          var date1 = Date.parse(datetime.toString());
          var currentDate = dateFormat(date1, "yyyy-mm-dd");
          currentDate += "T00:00:00Z";
          returnValue = "&start_date.range_start="+currentDate;
        }
      } 
      else if(entity.name == 'datetime'){
        if(entity.raw == 'next week'){
          param = 'next_week';
          returnValue = "&start_date.keyword=next_week";
        } else if(entity.raw != 'this' && entity.raw != 'next'){
          var startDate = new Date(entity.iso);
          var startDateParsed = Date.parse(entity.iso);
          var rangeStart = dateFormat(startDateParsed, "yyyy-mm-dd");
          rangeStart += "T00:00:00Z";

          var endDate;
          var endDateParsed;
          var rangeEnd;
          if(entity.accuracy == 'month'){
            endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
            endDateParsed = Date.parse(endDate);
            rangeEnd = dateFormat(endDateParsed, "yyyy-mm-dd");
            rangeEnd += "T00:00:00Z";
          } else if(entity.accuracy == 'month,day'){
            endDate = new Date(entity.iso);
            endDateParsed = Date.parse(endDate);
            rangeEnd = dateFormat(endDateParsed, "yyyy-mm-dd");
            rangeEnd += "T23:59:59Z";
          } else if(entity.accuracy == 'year,month,day'){
            endDate = new Date(entity.iso);
            endDateParsed = Date.parse(entity.iso);
            rangeEnd = dateFormat(endDateParsed, "yyyy-mm-dd");
            rangeEnd += "T23:59:59Z";
          } else if(entity.accuracy == 'year'){
            endDate = new Date(startDate.getFullYear()+1, 1, 0);
            endDateParsed = Date.parse(endDate);
            rangeEnd = dateFormat(endDateParsed, "yyyy-mm-dd");
            rangeEnd += "T00:00:00Z";
          } else if(entity.accuracy == 'year,month'){
            endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
            endDateParsed = Date.parse(endDate);
            rangeEnd = dateFormat(endDateParsed, "yyyy-mm-dd");
            rangeEnd += "T00:00:00Z";
          }
          console.log("rangeStart = "+ rangeStart);
          console.log("rangeEnd = "+rangeEnd);
          returnValue = "&start_date.range_start="+rangeStart+"&start_date.range_end="+rangeEnd;
        } 
      } else if(entity.name == 'temporal_clue'){
        if(entity.raw == 'week'){
          if(message.toString().includes('this week')){
            returnValue = "&start_date.keyword=this_week";
          } else if(message.toString().includes('next week')){
            returnValue = "&start_date.keyword=next_week";
          }
        } else if(entity.raw == 'month'){
          if(message.toString().includes('this month')){
            returnValue = "&start_date.keyword=this_month";
          } else if(message.toString().includes('next month')){
            returnValue = "&start_date.keyword=next_month";
          }
        } else if(entity.raw == 'weekend'){
          if(message.toString().includes('this weekend')){
            returnValue = "&start_date.keyword=this_weekend";
          } else if(message.toString().includes('next weekend')){
            returnValue = "&start_date.keyword=next_weekend";
          }
        } else {
          var startDate = new Date(entity.iso);
          var startDateParsed = Date.parse(startDate.toString());
          var rangeStart = dateFormat(startDateParsed, "yyyy-mm-dd");
          var endDate;
          endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
          var endDateParsed = Date.parse(endDate.toString());
          var rangeEnd = dateFormat(endDateParsed, "yyyy-mm-dd");
          rangeStart += "T00:00:00Z";
          rangeEnd += "T00:00:00Z";
          returnValue = "&start_date.range_start="+rangeStart+"&start_date.range_end="+rangeEnd;
        }
      } else {
        returnValue = "";
      }     

      return returnValue;                   
  
};

exports.setDateParam = setDateParam;

function searchData(keyword, array, defaultReturnMessage){
  var returnMessage = "";
  for(var i = 0; i< array.length; i++){
    if(keyword.toLowerCase().includes(array[i].toLowerCase())){
      if(defaultReturnMessage == null || defaultReturnMessage == ''){
        returnMessage += " in "+array[i];
        break;
      } else {
        returnMessage += defaultReturnMessage + array[i];
      }
    }
  }
  return returnMessage;
};

exports.searchData = searchData;

function constructFinalMessage(event, counter){
  var message = "";
  var startDate = new Date(event.start.utc);
  var endDate = new Date(event.end.utc);
  var date = "";
  if(endDate.getMonth() > startDate.getMonth() || endDate.getDate() > startDate.getDate()){
    date += startDate.getFullYear() + " " + month[startDate.getMonth()] + " " + startDate.getDate() + ", " + startDate.getHours() + ":" + startDate.getMinutes();
    date += " - ";
    date += endDate.getFullYear() + " " + month[endDate.getMonth()] + " " + endDate.getDate() + ", " + endDate.getHours() + ":" + endDate.getMinutes();
  } else {
    date += startDate.getFullYear() + " " + month[startDate.getMonth()] + " " + startDate.getDate() + ", " + startDate.getHours() + ":" + startDate.getMinutes();
    date += " - ";
    date += endDate.getHours() + ":" + endDate.getMinutes();
  }
  message += counter+"."+event.name.text + "\n" + event.url + "\n" + "Date and Time :\n" + date +"\n\n";

  return message;
};
exports.constructFinalMessage = constructFinalMessage;