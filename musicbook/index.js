const library = [
{
    section: "殿堂 Ultimate Wishlist",
    list: [
        {
            name: "梅花三弄",
            sheets: ["梅花三弄1.jpg", "梅花三弄2.jpg", "梅花三弄3.jpg"]
        },{
            name: "夕阳箫鼓",
            sheets: []
        },{
            name: "落霞",
            sheets: []
        },
        {
            name: "Carmen Act III: Entr'acte",
            sheets: [],
            note: "Bizet"
        },
        {
            name: "Morning Song",
            sheets: [],
            note: "Grieg"
        }
    ]
}, {
    section: "本命 Xiao Classic",
    list: [{
            name: "阳关三叠",
            sheets: []
        },{
            name: "关山月",
            sheets: []
        },{
            name: "妆台秋思",
            sheets: []
        },{
            name: "苏武牧羊",
            sheets: []
        },{
            name: "绿野仙踪",
            sheets: [],
            note: "陈悦"
        }]
}, {
    section: "古风 Traditional",
    list: [{
            name: "女儿情",
            sheets: [],
            note: "西游记"
        },{
            name: "明月几时有",
            sheets: []
        },{
            name: "葬花吟",
            sheets: []
        },{
            name: "枉凝眉",
            sheets: []
        },{
            name: "青花瓷",
            sheets: []
        },{
            name: "御剑江湖",
            sheets: [],
            note: "仙剑三"
        },{
            name: "回梦游仙",
            sheets: [],
            note: "仙剑四"
        }
    ]
}, {
    section: "美好 Beautiful",
    list: [
        {
            name: "一生所爱",
            sheets: [],
            note: "大话西游"
        },{
            name: "乌兰巴托的夜",
            sheets: []
        },
        {
            name: "传奇",
            sheets: []
        },{
            name: "烟花易冷",
            sheets: []
        },{
            name: "清风徐来",
            sheets: []
        },{
            name: "后会无期",
            sheets: [],
            note: "The end of the world"
        },{
            name: "芳华",
            sheets: []
        },{
            name: "你离开了南京，从此没有人和我说话",
            sheets: []
        },{
            name: "遥远的歌",
            sheets: [],
            note: "你好旧时光"
        },{
            name: "还珠格格",
            sheets: [],
            note: "各种"
        },{
            name: "将进酒",
            sheets: [],
            note: "莫听穿林打叶声，墨梅，苔"
        },{
            name: "卷珠帘",
            sheets: []
        },{
            name: "那些花儿",
            sheets: []
        },{
            name: "Canon in D",
            sheets: [],
            note: "Johann Pachelbel"
        },{
            name: "Time to say goodbye",
            sheets: []
        },{
            name: "La Vie en Rose",
            sheets: [],
            note: "玫瑰人生"
        },{
            name: "Vois sur ton chemin",
            sheets: [],
            note: "放牛班的春天"
        },
        {
            name: "Phantom of the opera",
            sheets: [],
            note: "Think of me"
        },
        {
            name: "Memories",
            sheets: [],
            note: "Cats"
        },
        {
            name: "天空之城",
            sheets: []
        },
        {
            name: "From the New World",
            sheets: [],
            note: "Dvořák"
        },
        {
            name: "Andante Cantabile",
            sheets: [],
            note: "Tchaikovsky"
        }
    ]
}, {
    section: "民歌 Folk Songs",
    list: [
        {
            name: "在那遥远的地方",
            sheets: [],
            note: "青海"
        },
        {
            name: "小河淌水",
            sheets: [],
            note: "云南"
        },
        {
            name: "Londonderry Air",
            sheets: [],
            note: "Danny Boy"
        },
        {
            name: "The last rose of summer",
            sheets: []
        },
        {
            name: "Scarborough Fair",
            sheets: []
        },
        {
            name: "El Condor Pasa",
            sheets: []
        },
        {
            name: "Au Claire de Fontaine",
            sheets: []
        }
    ]
}
];

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