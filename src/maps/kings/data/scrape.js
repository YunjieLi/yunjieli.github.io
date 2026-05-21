var heros = { heros: []};

const heroList = $('.herolist.clearfix').children();

for (var i=0; i<heroList.length; i++) {
	var li = heroList[i];
	var href = li.children[0].href;
	var id = getID(href);
	var name = li.children[0].children[0].alt;
	var avatar = li.children[0].children[0].src;
	var bg = "game.gtimg.cn/images/yxzj/img201606/skin/hero-info/" 
			+ id + "/" + id + "-bigskin-1.jpg";
	heros.heros.push({
		id: id,
		name: name,
		href: href,
		bg: bg,
		avatar: avatar
	});

	function getID(href) {
		// http://pvp.qq.com/web201605/herodetail/195.shtml
		var array = href.split('/');
		var id = array[array.length-1].replace('.shtml','');
		return id;
	} 
};

console.log(JSON.stringify(heros));