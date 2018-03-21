window.onload = ()=>{
	var html = '';
	library.forEach( (section)=> {
		var header = '<div class="section-title container-fluid"><h1>' + section.section +  '</h1></div>';
        var list = '<div class="music-list">';
        section.list.forEach((piece)=>{
            var note = piece.note ? '<small>' + piece.note + '</small>' : '';
            var disabled = piece.sheets ? ' disabled' : '';
            var item = '<div class="piece' + disabled + '" id="'
                + piece.name + '"><div>' + piece.name + note + '</div></div>';
            if (piece.id) {
                item = '<a href="sheets/' + piece.id + '.html">' + item + '</a>';
            }
            list += item;
        })
        list += '</div>';
        html += '<div class="section">' + header + list + '</div>';
	})
    $('body').html(html);
};