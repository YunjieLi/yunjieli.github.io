var fs = require('fs');

var musicTitle = "梅花三弄";
var musicID = "meihua";
var musicSheets = ["meihua1.jpg", "meihua2.jpg", "meihua3.jpg"];

var head = '<head><title>"' + musicTitle + '</title>'
		    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
		    + '<meta http-equiv="Content-Type" content="text\/html; charset=utf-8">'
		    + '<link rel="stylesheet" href="../static\/swiper.min.css" \/>'
		    + '<script src="../static\/swiper.min.js"><\/script>'
		    + '<link rel="stylesheet" href="../sheet.css" \/><\/head>';

var sheets = '';
var chevrons = '';
var script = '';
musicSheets.forEach((sheet)=>{
	sheets += '<div class="swiper-slide sheet" style="background-image: url(images/' + sheet + ')"></div>';
});
if (musicSheets.length > 1) {
	chevrons = '<div class="swiper-button-prev"></div><div class="swiper-button-next"></div>';
	script = '<script>'
  		+ 'var mySwiper = new Swiper (".swiper-container",'
  		+ '{loop: true, navigation: {nextEl: ".swiper-button-next",prevEl: ".swiper-button-prev",}})'
  		+ '</script>'
}

var body = '<body><div class="swiper-container"><div class="swiper-wrapper">' + sheets + '</div>'
			 + chevrons + '</div>' + script;

var html = '<html lang="zh">' + head + body + '</html>';

fs.writeFile('sheets/' + musicID + '.html', html, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 