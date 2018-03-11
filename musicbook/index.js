const library = [
{
    section: "古曲 Classic",
    list: [{
            name: "阳关三叠",
            sheets: []
        },
        {
            name: "梅花三弄",
            sheets: ["梅花三弄1.jpg", "梅花三弄2.jpg", "梅花三弄3.jpg"]
        },
        {
            name: "关山月",
            sheets: []
        },
        {
            name: "妆台秋思",
            sheets: []
        },
        {
            name: "苏武牧羊",
            sheets: []
        },
        {
            name: "夕阳箫鼓",
            sheets: [],
            note: "筒音2"
        }]
}, {
    section: "无词 More Music",
    list: [{
            name: "落霞",
            sheets: []
        },
        {
            name: "绿野仙踪",
            sheets: []
        },
        {
            name: "御剑江湖",
            sheets: [],
            note: "仙剑三"
        },
        {
            name: "回梦游仙",
            sheets: [],
            note: "仙剑四"
        },
        {
            name: "你离开了南京，从此没有人和我说话",
            sheets: []
        }
    ]
}, {
    section: "有箫的气质的歌 Great Songs for Xiao",
    list: [{
            name: "女儿情",
            sheets: [],
            note: "西游记"
        },
        {
            name: "明月几时有",
            sheets: [],
            note: "中秋"
        },
        {
            name: "葬花吟",
            sheets: []
        },
        {
            name: "枉凝眉",
            sheets: []
        },
        {
            name: "一生所爱",
            sheets: [],
            note: "大话西游"
        },
        {
            name: "乌兰巴托的夜",
            sheets: []
        },
        {
            name: "传奇",
            sheets: []
        },
        {
            name: "烟花易冷",
            sheets: []
        },
        {
            name: "青花瓷",
            sheets: [],
            note: "好听的过门"
        }
    ]
}, {
    section: "也可以吹 More Music",
    list: [{
            name: "清风徐来",
            sheets: []
        },
        {
            name: "后会无期",
            sheets: [],
            note: "The end of the world"
        },
        {
            name: "芳华",
            sheets: []
        },
        {
            name: "不可说",
            sheets: [],
            note: "花千骨"
        },
        {
            name: "转身之间",
            sheets: [],
            note: "此间的少年"
        },
        {
            name: "遥远的歌",
            sheets: [],
            note: "你好旧时光"
        },
        {
            name: "还珠格格",
            sheets: [],
            note: "各种"
        },
        {
            name: "莫听穿林打叶声",
            sheets: [],
            note: "将进酒，墨梅，苔"
        },
        {
            name: "卷珠帘",
            sheets: []
        },
        {
            name: "亲密爱人",
            sheets: [],
            note: "梅艳芳"
        }
    ]
}, {
    section: "非中国 International",
    list: [{
            name: "Londonderry Air",
            sheets: [],
            note: "Danny Boy"
        },
        {
            name: "Carmen Act III: Entr'acte",
            sheets: [],
            note: "flute"
        },
        {
            name: "The last rose of summer",
            sheets: []
        },
        {
            name: "乘着歌声的翅膀",
            sheets: [],
            note: "难"
        },
        {
            name: "Grieg Morning Song",
            sheets: [],
            note: "Peer Gynt"
        },
        {
            name: "La Vie en Rose",
            sheets: [],
            note: "玫瑰人生"
        },
        {
            name: "J'ai Deux Amours",
            sheets: []
        }
    ]
}];

window.onload = ()=>{
	var html = '';
	library.forEach( (section)=> {
		var header = '<div class="section-title container-fluid"><h1>' + section.section +  '</h1></div>';
        var list = '<div class="music-list">';
        section.list.forEach((piece)=>{
            var note = piece.note ? '<small>' + piece.note + '</small>' : '';
            var disabled = piece.sheets ? ' disabled' : '';
            list += '<div class="piece' + disabled + '" id="'
                + piece.name + '"><div>' + piece.name + note + '</div></div>'
        })
        list += '</div>';
        html += '<div class="section">' + header + list + '</div>';
	})
    $('body').html(html);
};