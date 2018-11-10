var week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
var month = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];
var day = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th','13th','14th','15th','16th','17th','18th','19th','20th','21st','22nd','23rd','24th','25th','26th','27th','28th','29th','30th','31st'];

var timerID = setInterval(updateTime, 1000);
updateTime();
function updateTime() {
    var cd = new Date();
    var time = document.getElementById("timeDisplay");
    var date = document.getElementById("dateDisplay");
    var hr = cd.getHours()
    var back = " AM";
    if (hr >= 12) back = " PM"
    if (hr > 12) hr = hr - 12;
    time.innerHTML = zeroPadding(hr, 2) + ':' + zeroPadding(cd.getMinutes(), 2) + ':' + zeroPadding(cd.getSeconds(), 2) + back;
    date.innerHTML = month[cd.getMonth()] + ' ' + day[cd.getDay()-1] + ', ' + zeroPadding(cd.getFullYear(), 4)
    //date.innerHTML = zeroPadding(cd.getFullYear(), 4) + '/' + zeroPadding(cd.getMonth()+1, 2) + '/' +  + ' ' + week[cd.getDay()];
};

function zeroPadding(num, digit) {
    var zero = '';
    for(var i = 0; i < digit; i++) {
        zero += '0';
    }
    return (zero + num).slice(-digit);
}
