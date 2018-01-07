/**
 * pvp Header JS
 * Author: sonichuang
 * Create: 2017-05-31
 */
var pvpHeader = (function(){
	var util = {},
		fn = {},
		$header = "",
		init = function(){};

	var isOldHeader = $("body").hasClass("old-header") ? true : false;

	fn = {
		jsLoader: function(url, callback, options) {
			options = options || {};
			var head = document.getElementsByTagName('head')[0] || document.documentElement,
				script = document.createElement('script'),
				done = false;
			script.src = url;
			if (options.charset) {controller
				script.charset = options.charset;
			}
			script.onerror = script.onload = script.onreadystatechange = function() {
				if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
					done = true;
					if (callback) {
						callback();
					}
					script.onerror = script.onload = script.onreadystatechange = null;
					head.removeChild(script);
				}
			};
			head.insertBefore(script, head.firstChild);
		}
	};

	util.addHeaderHTML = function(){
		if(isOldHeader){
			var loginSup = '';
			var loginSub = '';
				loginSub +='<!--=========周免英雄和用户登录==========-->';
				loginSub +='<div class="info-box clearfix">';
				loginSub +='  <div class="hero-box fl pr">';
				loginSub +='	<p id="FreeHeros-Title"><b>周免英雄（<span id="freeHerosPeriod"></span>）</b></p>';
				loginSub +='	<ul id="FreeHeros-Cont" class="hero-list clearfix">加载中...</ul>';
				loginSub +='	<a href="/web201605/herolist.shtml" onclick="PTTSendClick(\'head\',\'morehero\',\'更多英难\');" target="_blank" title="更多英雄" class="more-hero pa">更<br>多<br>英<br>雄</a>';
				loginSub +='  </div>';
				loginSub +='  <div class="login-box clearfix fl pr">';
				loginSub +='	<a class="avatar pa spr" href="/web201605/personal.shtml">';
				loginSub +='	  <img src="//game.gtimg.cn/images/yxzj/web201605/main/avatar1.jpg" width="75" height="75">';
				loginSub +='	  <span class="pa spr level-ico db">0</span>';
				loginSub +='	</a>';
				loginSub +='	<!--=====登录后已选择大区=====-->';
				loginSub +='	<div id="logined_selected" class="per-infor fl" style="display:none;">';
				loginSub +='	  <p class="user-name f12">';
				loginSub +='		<em>用户名称</em>';
				loginSub +='		<i id="nickname">--</i>';
				loginSub +='		<a class="logout_btn" href="javascript:void(0)">注销</a>';
				loginSub +='		<a class="select_role" style="color:#2d84d3" href="javascript:void(0)">切换大区&gt;</a>';
				loginSub +='	  </p>';
				loginSub +='	  <ul class="userinfo-list tc">';
				loginSub +='		<li><em class="grade_level">倔强青铜III</em><i>段位</i></li>';
				loginSub +='		<li><em class="win_count">-</em><i>胜场</i></li>';
				loginSub +='		<li><em class="hero_count">-</em><i>英雄数</i></li>';
				loginSub +='		<li><em class="skin_count">-</em><i>皮肤数</i></li>';
				loginSub +='	  </ul>';
				loginSub +='	</div>';
				loginSub +='	<!--=====登录前=====-->';
				loginSub +='	<div id="unlogin" class="per-infor txt2 fl" style="display:block;">';
				loginSub +='	  <p class="user-name">';
				loginSub +='		亲爱的召唤师，欢迎';
				loginSub +='  <a href="javascript:TGDialogS(\'login_select\');" onclick="PTTSendClick(\'head\',\'loginBtnSub\',\'登录\');">登录</a>';
				loginSub +='	  </p>';
				loginSub +='	</div>';
				loginSub +='	<!--=====登录后未选择大区=====-->';
				loginSub +='	<div id="logined_not_selected" class="per-infor txt2 fl" style="display:none;">';
				loginSub +='	  <p class="user-name">';
				loginSub +='		您已登录，请<a class="select_role" href="javascript:void(0)">选择大区</a>，或者<a class="logout_btn" href="javascript:void(0)">注销</a>';
				loginSub +='		<!--您已登录，个人中心暂未开放<a class="logout_btn" href="javascript:void(0)">注销</a>-->';
				loginSub +='	  </p>';
				loginSub +='	  <!--p>登录后查看自己的英雄联盟游戏信息，包括召唤师等级、游戏胜场数、账户信息、声望值 等。</p-->';
				loginSub +='	</div>';
				loginSub +='  </div>';
				loginSub +='</div><!--=========周免英雄和用户登录==========-->';
				// loginSub +='<a target="_blank" href="javascript:;" onClick="PTTSendClick(\'btn\',\'subtopkv\',\'进入专题\');"  class="kv-link" title="查看详情">查看详情</a>';		
				loginSub +='<a target="_blank" href="//pvp.qq.com/cp/a20170925wzhd/" onclick="PTTSendClick(\'btn\',\'topkv-anni1\',\'周年庆-国庆活动\');" class="kv-anni kv-anni-1" title="国庆活动">周年定制机</a>';
				loginSub +='<a href="javascript:;" onclick="TGDialogS(\'vote1001\');PTTSendClick(\'btn\',\'topkv-anni2\',\'周年庆-返场投票\');" class="kv-anni kv-anni-2" title="返场投票">返场投票</a>';
				loginSub +='<a target="_blank" href="//pvp.qq.com/cp/a20170926wzrymusic_pc/" onclick="PTTSendClick(\'btn\',\'topkv-anni3\',\'周年庆-英雄主打歌\');" class="kv-anni kv-anni-3" title="英雄主打歌">英雄主打歌</a>';
				loginSub +='<a target="_blank" href="//pvp.qq.com/cp/a20170925trds/" onclick="PTTSendClick(\'btn\',\'topkv-anni4\',\'周年庆-同人大赛\');" class="kv-anni kv-anni-4" title="同人大赛">同人大赛</a>';
		}else{
			var loginSub = '';
			var loginSup = '';
				loginSup +='      <!--=====登录模块=====-->';
				loginSup +='      <div class="login_pannel clearfix pa">';
				loginSup +='        <a class="avatar user_pic " href="/web201605/personal.shtml">';
				loginSup +='          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAABGdBTUEAALGPC/xhBQAAARpQTFRF88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JY88JYAAAA88JYAMCn0QAAAF10Uk5TZBSP1dYNDujnLPuA3/zQAos0UjmnB8KcgZrNkfGwCdhthtnjysFgCFAZSuQWKYNXh9IbREw+9iRhdyPlZRNdvRwnMRrvNf3F3isBtz+eRfPha+v3O+718Gm0eB4AqcfmkwAAAUBJREFUOMvt1FWTg0AMAOCeu7u71t3dFS+FJv//b9wCnbu5YwI83VPzsBvYb2aRbHzgOXxzartTLbGhVPVAN9Z0NurrXVdaE9GkKNZcaFPBVBJ6kEyh0nSksoqYAVgEyCCqsgMdcIjIpxOYSPMs4wYkHY3RiPwSLufNbDyiqIp/Q6Iob6MqRZ9t9ImiNzZ6R9ELG72k6Dl22q1v1mp38JSiE9SgLpR3mNssC3XQ2DVBD62lBR2zRSPR8JiiR9jIrgDEwhiOAazqDTyjaI7trMQhwqYIxBU2XVH01nibCYTYGGIPzuKBLJdrkwb86A9YVCfpI1uNBkHmZAhGDSqQ9MUspwLkwGcV2StJh9bHn8J09hs+Sfo2/EXFd6ezVZB+aP/D+cQebM+odN9z6wPFvkl3ux66y95WBSr7J/NW/F/0C0EhZNPgBN3FAAAAAElFTkSuQmCC" width="42" height="42">';
				loginSup +='        </a>';
				loginSup +='        <!--=====登录后已选择大区=====-->';
				loginSup +='        <div id="logined_selected" class="per-infor" style="display:none;">';
				loginSup +='          <p class="user-name f12">';
				loginSup +='            <i id="nickname">--</i>';
				loginSup +='            <a class="logout_btn" href="javascript:void(0)">注销</a>';        
				loginSup +='            <!--<a class="select_role" style="color:#2d84d3" href="javascript:void(0)">切换大区&gt;</a>-->';
				loginSup +='          </p>';
				loginSup +='          <p class="personal_link"><a href="//pvp.qq.com/web201605/personal.shtml">点击查看游戏战绩</a></p>';
				loginSup +='          <ul class="userinfo-list tc">';
				loginSup +='            <li><em class="grade_level">倔强青铜III</em><i>段位</i></li>';
				loginSup +='            <li><em class="win_count">-</em><i>胜场</i></li>';
				loginSup +='            <li><em class="hero_count">-</em><i>英雄数</i></li>';
				loginSup +='            <li><em class="skin_count">-</em><i>皮肤数</i></li>';
				loginSup +='          </ul>';
				loginSup +='        </div>';
				loginSup +='        <div id="unlogin" class="per-infor unlogin_pannel">';
				loginSup +='          <span class="unlogin_user_pic"></span>';
				loginSup +='          <div class="unlogin_info">';
				loginSup +='            <a href="javascript:TGDialogS(\'login_select\');" onclick="PTTSendClick(\'head\',\'loginBtnSup\',\'欢迎登录\');">欢迎登录</a>';
				loginSup +='            <p>登录后查看游戏战绩</p>';
				loginSup +='          </div>';
				loginSup +='        </div>';
				loginSup +='        <!--=====登录后未选择大区=====-->';
				loginSup +='        <div id="logined_not_selected" class="per-infor" style="display:none;">';
				loginSup +='          <div class="user-name">';
				loginSup +='            您已登录';
				loginSup +='            <p>请<a class="select_role" href="javascript:void(0)">选择大区</a>，或者<a class="logout_btn" href="javascript:void(0)">注销</a></p>';
				loginSup +='            <!--您已登录，个人中心暂未开放<a class="logout_btn" href="javascript:void(0)">注销</a>-->';
				loginSup +='          </div>';
				loginSup +='        </div>';
				loginSup +='      </div><!--=====登录模块=====-->';
		}
		var headerHTML = '';
		headerHTML +='<div id="header" class="header">';
		headerHTML +='    <div class="header-inner">';
		headerHTML +='      <h1><a href="//pvp.qq.com/" class="logo pa" title="王者荣耀" onclick="PTTSendClick(\'headNav\',\'logo\',\'logo\');">王者荣耀</a></h1>';
		headerHTML +='      <!--=========主导航==========-->';
		headerHTML +='      <ul class="main-nav clearfix">';
		headerHTML +='        <li class="first-nav">';
		headerHTML +='          <a href="//pvp.qq.com/" target="_blank" title="官网首页" onclick="PTTSendClick(\'headNav\',\'home\',\'官网首页\');">官网首页<em>HOME</em></a>';
		headerHTML +='        </li>';
		headerHTML +='        <li>';
		headerHTML +='          <a href="/web201605/herolist.shtml" target="_blank" title="游戏资料" onclick="PTTSendClick(\'headNav\',\'data\',\'游戏资料\');">游戏资料<em>DATA</em></a>';
		headerHTML +='        </li>';
		headerHTML +='        <li>';
		headerHTML +='          <a href="/raiders/" target="_blank" title="攻略中心" onclick="PTTSendClick(\'headNav\',\'strategy\',\'攻略中心\');">攻略中心<em>RAIDERS</em></a>';
		headerHTML +='        </li>';
		headerHTML +='        <li>';
		headerHTML +='          <a href="/match/kpl/index.shtml" target="_blank" title="赛事中心" onclick="PTTSendClick(\'headNav\',\'match\',\'赛事中心\');">赛事中心<em>MATCH</em></a>';
		headerHTML +='        </li>';
		headerHTML +='        <li>';
		headerHTML +='          <a href="/mall/" target="_blank" title="商城/合作" onclick="PTTSendClick(\'headNav\',\'store\',\'商城合作\');">商城/合作<em>STORE</em></a>';
		headerHTML +='        </li>';
		headerHTML +='        <li>';
		headerHTML +='          <a href="javascript:void(0)" title="社区互动" onclick="PTTSendClick(\'headNav\',\'Community\',\'社区互动\');">社区互动<em>COMMUNITY</em></a>';
		headerHTML +='        </li>';
		headerHTML +='        <li>';
		headerHTML +='          <a href="javascript:void(0)" target="_blank" title="玩家支持" onclick="PTTSendClick(\'headNav\',\'player\',\'玩家支持\');">玩家支持<em>PLAYER</em></a>';
		headerHTML +='        </li>';
		headerHTML +='      </ul>';
		headerHTML += loginSup;
		headerHTML +='    </div>';
		headerHTML +='    <!--=====二级导航=====-->';
		headerHTML +='      <div id="J_subNav" class="sub-nav">';
		headerHTML +='        <ul class="sub-nav-inner">';
		headerHTML +='          <li class="down-nav">';
		headerHTML +='             &nbsp;';
		headerHTML +='          </li>';
		headerHTML +='          <li class="down-nav">';
		headerHTML +='             <a href="/cp/a20170829bbgxsm/index.html" target="_blank" title="版本介绍" onclick="PTTSendClick(\'headNav\',\'data_ver\',\'版本介绍\');">版本介绍</a>';
		headerHTML +='             <a href="/web201605/introduce.shtml" target="_blank" title="游戏介绍" onclick="PTTSendClick(\'headNav\',\'data_moba\',\'游戏介绍\');">游戏介绍</a>';
		headerHTML +='             <a href="/web201605/herolist.shtml" target="_blank" title="英雄资料" onclick="PTTSendClick(\'headNav\',\'data_hero\',\'英雄资料\');">英雄资料</a>';
		headerHTML +='             <a href="/coming/" target="_blank" title="爆料站" onclick="PTTSendClick(\'headNav\',\'data_coming\',\'爆料站\');">爆料站</a>';
		headerHTML +='             <a href="javascript:void(0)" title="故事站" onclick="TGDialogS(\'story\');PTTSendClick(\'headNav\',\'data_story\',\'故事站\');">故事站</a>';
		headerHTML +='             <a href="/web201605/wallpaper.shtml" target="_blank" title="游戏壁纸" onclick="PTTSendClick(\'headNav\',\'data_wallpaper\',\'游戏壁纸\');">游戏壁纸</a>';
		headerHTML +='          </li>';
		headerHTML +='          <li class="down-nav">';
		headerHTML +='             <a href="/raiders/" target="_blank" title="攻略中心" onclick="PTTSendClick(\'headNav\',\'strategy_center\',\'攻略中心\');">攻略中心</a>';
		headerHTML +='             <a href="/strategy/" target="_blank" title="英雄攻略" onclick="PTTSendClick(\'headNav\',\'strategy_hero\',\'英雄攻略\');">英雄攻略</a>';
		headerHTML +='             <a href="/v/" target="_blank" title="视频中心" onclick="PTTSendClick(\'headNav\',\'strategy_video\',\'视频中心\');">视频中心</a>';
		headerHTML +='          </li>';
		headerHTML +='          <li class="down-nav">';
		headerHTML +='             <a href="/match/kpl/" target="_blank" title="KPL职业联赛" onclick="PTTSendClick(\'headNav\',\'match_KPL\',\'KPL\');">KPL职业联赛</a>';
		headerHTML +='             <a href="/match/kcc.shtml" target="_blank" title="KCC王者冠军杯" onclick="PTTSendClick(\'headNav\',\'match_KCC\',\'KCC\');">KCC王者冠军杯</a>';
		headerHTML +='             <a href="/cp/a20170808city/index.shtml" target="_blank" title="KOC王者城市赛" onclick="PTTSendClick(\'headNav\',\'match_KOC\',\'KOC\');">KOC王者城市赛</a>';
		headerHTML +='             <a href="https://ui.ptlogin2.qq.com/cgi-bin/login?style=9&appid=809041606&daid=18&low_login=0&s_url=http%3A%2F%2Fyouxi.vip.qq.com%2Fm%2Fact%2F201603%2Fcfm_yxzj_qgc.html%3Fjsonid%3D90228%26game%3Dsgame%26onlyqq%3Dfalse%26_wv%3D1" target="_blank" title="QGC夏季联赛" onclick="PTTSendClick(\'headNav\',\'match_QGC\',\'QGC\');">QGC夏季联赛</a>';
		headerHTML +='             <a href="//tga.qq.com/match/2016/shouyou/game.html?game=wzry&tga=1" target="_blank" title="TGA大奖赛" onclick="PTTSendClick(\'headNav\',\'match_TGA\',\'TGA\');">TGA大奖赛</a>';
		headerHTML +='             <a href="javascript:alert(\'敬请期待\')" target="_blank" title="WGC精英赛" onclick="PTTSendClick(\'headNav\',\'match_WGC\',\'WGC\');">WGC精英赛</a>';
		headerHTML +='             <a href="//pvp.qq.com/cp/a20170818school/index.shtml" target="_blank" title="王者高校联赛" onclick="PTTSendClick(\'headNav\',\'match_gaoxiao\',\'王者高校联赛\');">王者高校联赛</a>';
		headerHTML +='          </li>';
		headerHTML +='          <li class="down-nav">';
		headerHTML +='             <a href="/mall/" target="_blank" title="周边商城" onclick="PTTSendClick(\'headNav\',\'mall\',\'周边商城\');">周边商城</a>';
		headerHTML +='             <a href="/cp/a20170707zhhz" target="_blank" title="王者信用卡" onclick="PTTSendClick(\'headNav\',\'life_Credit\',\'王者信用卡\');">王者信用卡</a>';
		headerHTML +='             <a href="/history/" target="_blank" title="王者文化站" onclick="PTTSendClick(\'headNav\',\'history\',\'王者文化站\');">王者文化站</a>';
		headerHTML +='          </li>';
		headerHTML +='          <li class="down-nav">';
		headerHTML +='            <a href="javascript:void(0)" title="官方助手" onclick="TGDialogS(\'zhushou\');PTTSendClick(\'headNav\',\'Community_tools\',\'官方助手\');">官方助手</a>';
		headerHTML +='            <a href="https://buluo.qq.com/p/barindex.html?bid=227061" target="_blank" title="手Q部落" onclick="PTTSendClick(\'headNav\',\'Community_qq\',\'手Q部落\');">手Q部落</a>';
		headerHTML +='            <a href="javascript:void(0)" target="_blank" title="微信圈子" onclick="TGDialogS(\'weiquan\');PTTSendClick(\'headNav\',\'Community_wx\',\'微信圈子\');">微信圈子</a>';
		headerHTML +='            <a href="//weibo.com/heromoba" target="_blank" title="官方微博" onclick="PTTSendClick(\'headNav\',\'Community_wb\',\'官方微博\');">官方微博</a>';
		headerHTML +='            <a href="javascript:void(0)" title="微信公众号" onclick="TGDialogS(\'weixin\');PTTSendClick(\'headNav\',\'Community_wxgzh\',\'微信公众号\');">微信公众号</a>';
		headerHTML +='            <a href="javascript:void(0)" title="手Q订阅号" onclick="TGDialogS(\'qq\');PTTSendClick(\'headNav\',\'Community_qqdyh\',\'手Q订阅号\');">手Q订阅号</a>';
		headerHTML +='          </li>';
		headerHTML +='          <li class="down-nav">';
		headerHTML +='             <a href="https://jiazhang.qq.com/jz/home.html " target="_blank" title="成长守护平台" onclick="PTTSendClick(\'headNav\',\'player_watch\',\'成长守护平台\');"><i class="icon-guard"></i>成长守护平台</a>';
		headerHTML +='             <a href="/cp/a20170726hsbbspc/index.html" target="_blank" title="健康系统" onclick="PTTSendClick(\'headNav\',\'player_healthy\',\'健康系统\');"><i class="icon-health"></i>健康系统</a>';
		headerHTML +='             <a href="javascript:void(0)" target="_blank" title="客服专区" onclick="TGDialogS(\'kefu\');PTTSendClick(\'headNav\',\'player_kf\',\'客服专区\');">客服专区</a>';
		headerHTML +='             <a href="/webplat/info/news_version3/15592/24091/24092/24095/m15241/201508/370256.shtml" title="礼包兑换" onclick="PTTSendClick(\'headNav\',\'player_feedback\',\'礼包兑换\');" target="_blank">礼包兑换</a>';
		headerHTML +='             <a href="https://tool.helper.qq.com/v3/wzry/official_website/index.html" title="自助服务" onclick="PTTSendClick(\'headNav\',\'player_service\',\'自助服务\');" target="_blank">自助服务</a>';
		headerHTML +='          </li>';
		headerHTML +='        </ul>';
		headerHTML +='      </div>';
		headerHTML += loginSub;
		headerHTML +='</div>';
		headerHTML +='<div class="header-dialog">';
		headerHTML +='  <div class="pop pr" style="display:none;" id="login_select">';
		headerHTML +='    <a href="javascript:showDialog.hide()" class="close pa db ht">关闭</a>';
		headerHTML +='    <a href="javascript:void(0)" id="wxlogin" class="wx-login pa db ht">微信用户登录</a>';
		headerHTML +='    <a href="javascript:void(0)" id="qqlogin" class="qq-login pa db ht">QQ用户登录</a>';
		headerHTML +='  </div>';
		headerHTML +='  <div class="pop2 pr" style="display:none;" id="area_select">';
		headerHTML +='    <a href="javascript:showDialog.hide()" class="close pa db ht">关闭</a>';
		headerHTML +='    <div class="se-input">';
		headerHTML +='      <select name="channelContentId" id="channelContentId"><option selected>选择渠道</option></select>';
		headerHTML +='      <select name="areaContentId" id="areaContentId"><option selected>选择大区</option></select>';
		headerHTML +='      <select name="roleContentId" id="roleContentId"><option selected>选择角色</option></select>';
		headerHTML +='    </div>';
		headerHTML +='    <div class="se-btn clearfix">';
		headerHTML +='      <a id="RoleSelectBtn" href="javascript:showDialog.hide()" class="fl ht">确定</a>';
		headerHTML +='      <a href="javascript:showDialog.hide()" class="fl ht">取消</a>';
		headerHTML +='    </div>';
		headerHTML +='  </div>';
		headerHTML +='  <div class="zhushou pr" id="zhushou" style="display:none">';
		headerHTML +='    <div class="dia-zhushou pr">';
		headerHTML +='       <a class="dia-close" href="javascript:showDialog.hide()" title="关闭"></a>';
		headerHTML +='    </div>';
		headerHTML +='  </div>';
		headerHTML +='  <div class="weixin pr" id="weixin" style="display:none">';
		headerHTML +='    <div class="dia-weixin pr">';
		headerHTML +='       <a class="dia-close" href="javascript:showDialog.hide()" title="关闭"></a>';
		headerHTML +='    </div>';
		headerHTML +='  </div>';
		headerHTML +='  <div class="story pr" id="story" style="display:none">';
		headerHTML +='    <div class="dia-story">';
		headerHTML +='      <a class="dia-close" href="javascript:showDialog.hide()" title="关闭"></a>';
		headerHTML +='    </div>';
		headerHTML +='  </div>';
		headerHTML +='  <div class="skin pr" id="skin" style="display:none">';
		headerHTML +='    <div class="dia-skin">';
		headerHTML +='      <a class="dia-close" href="javascript:showDialog.hide()" title="关闭"></a>';
		headerHTML +='    </div>';
		headerHTML +='  </div>';
		headerHTML +='  <div class="version pr" id="version" style="display:none">';
		headerHTML +='    <div class="dia-version">';
		headerHTML +='      <a class="dia-close" href="javascript:showDialog.hide()" title="关闭"></a>';
		headerHTML +='    </div>';
		headerHTML +='  </div>';
		headerHTML +='   <div class="weiquan pr" id="weiquan" style="display:none">';
		headerHTML +='    <div class="dia-weiquan">';
		headerHTML +='      <a class="dia-close" href="javascript:showDialog.hide()" title="关闭"></a>';
		headerHTML +='    </div>';
		headerHTML +='  </div>';
		headerHTML +='  <div class="hero_pop pr" id="hero_pop" style="display:none">';
		headerHTML +='    <div class="dia-hero-pop">';
		headerHTML +='      <a class="dia-close" href="javascript:showDialog.hide()" title="关闭"></a>';
		headerHTML +='    </div>';
		headerHTML +='  </div>';
		headerHTML +='  <div class="kefu pr" id="kefu" style="display:none">';
		headerHTML +='    <div class="dia-kefu">';
		headerHTML +='      <a class="dia-close" href="javascript:showDialog.hide()" title="关闭"></a>';
		headerHTML +='      <p>微信扫一扫，联系客服</p>';
		headerHTML +='    </div> ';
		headerHTML +='  </div>';
		headerHTML +='  <div class="qq pr" id="qq" style="display:none">';
		headerHTML +='    <div class="dia-qq">';
		headerHTML +='      <a class="dia-close" href="javascript:showDialog.hide()" title="关闭"></a>';
		headerHTML +='    </div>';
		headerHTML +='  </div>';
 		headerHTML +='  <div class="vote1001 pr" id="vote1001" style="display:none">';
		headerHTML +='    <div class="dia-vote1001">';
		headerHTML +='      <a class="dia-close" href="javascript:showDialog.hide()" title="关闭"></a>';
		headerHTML +='    </div>';
		headerHTML +='  </div>';
		headerHTML +='</div>';
		$("#header").remove(); // if include header.inc, remove div#header
		$("body").prepend(headerHTML);
		$header = $("#header");
	};

	util.headerFunc = function(){
		 $('#header .header-inner, #J_subNav').hover(function(){
		   $('#J_subNav').css('visibility','visible');
		 },function(){
		   $('#J_subNav').css('visibility','hidden');})
		if(isOldHeader){
			util.headerFreeHeroPeriod();
			util.headerFreeHeroInit();
			util.setKVLink();
		}
	};

	util.headerFreeHeroInit = function(){
		sUrl = 'http://game.gtimg.cn/images/yxzj/img201606/heroimg/';

		$("#FreeHeros-Cont").on("mouseenter","li",function(){
			var _self = $(this),
				_selfImg = _self.find("img"),
				hid = _selfImg.data("id");
			// console.log(hid);
			_selfImg.attr('src',sUrl+hid+'/'+hid+'-freehover.png');
			_self.siblings("li").find("img").each(function(i){
				hhid = $(this).data("id");
				// console.log(hhid);
				$(this).attr("src",sUrl+hhid+'/'+hhid+'.jpg');
			});
			_self.addClass("active").siblings("li").removeClass("active");

		});
		$.ajax({
			url: '//pvp.qq.com/web201605/js/herolist.json',
			dataType: 'json',
			success: function(data) {
				// console.log(data);
				var freeHeroData = [],
					freeHeroHtml = "";
				for(var i=0; i<data.length; i++){
					var payarr = [],
                		payarr = ('' + data[i].pay_type).split(',');
					if(payarr == 10 || payarr[0] == 10 || payarr[1] == 10){
						freeHeroData.push(data[i]);
					}
				}
				// console.log(freeHeroData);
				for(var i=0; i<freeHeroData.length; i++){
					var hid = freeHeroData[i].ename;
					freeHeroHtml += '<li>';
					freeHeroHtml += '	<a href="http://pvp.qq.com/web201605/herodetail/'+hid+'.shtml" target="_blank" onclick="PTTSendClick(\'header\',\'freeHero-'+i+'\',\'周免英雄\');">';
					freeHeroHtml += '		<img data-id="'+hid+'" src="'+sUrl+''+hid+'/'+hid+'.jpg" width="69" height="69">';
					freeHeroHtml += '	</a>';
					freeHeroHtml += '</li>';
				}
				// console.log(freeHeroHtml);
				$("#FreeHeros-Cont").html(freeHeroHtml);
				$("#FreeHeros-Cont li").eq(0).trigger("mouseenter");
			},
			error: function (xhr, type) {
				console.log("get herolist.json error!")
			}
		});
	};

	util.headerFreeHeroPeriod = function(){
		/* 英雄限费时间填充，一般为周1-周日 */
		// 获取当前服务器时间
		function getServerTime(callback) {
			$.getScript('//apps.game.qq.com/CommArticle/app/reg/gdate.php?t=' + new Date().getTime(), function() {
				var serverDate = json_curdate,
					date = new Date(serverDate.replace(/-/g,"/"));
				callback && callback(date);
			});
		}
		function getDateStr(date,offset){
			var dateSet = date || new Date(),
				offset = offset || 0;
			var h = new Date();
			h.setDate(dateSet.getDate()+offset);
			var set =[];
			set.push(h.getFullYear());
			set.push(h.getMonth() + 1);
			set.push(h.getDate());
			// return set[0] + '-' + set[1] + '-' + set[2];
			return set[1] + '月' + set[2] + '日';
		}
		var freeHeroDayFill = function(d){
			var d = d || new Date();
			var day = d.getDay();
			var d1,d2;
			switch (day){
				case 0: //日
					d1 = getDateStr(d,+1);
					d2 = getDateStr(d,+7);
					break;
				case 1: //一
					d1 = getDateStr(d,0);
					d2 = getDateStr(d,+6);
					break;
				case 2: //二
					d1 = getDateStr(d,-1);
					d2 = getDateStr(d,+5);
					break;
				case 3: //三
					d1 = getDateStr(d,-2);
					d2 = getDateStr(d,+4);
					break;
				case 4: //四
					d1 = getDateStr(d,-3);
					d2 = getDateStr(d,+3);
					break;
				case 5: //五
					d1 = getDateStr(d,-4);
					d2 = getDateStr(d,+2);
					break;
				case 6: //六
					d1 = getDateStr(d,-5);
					d2 = getDateStr(d,+1);
					break;
			}
			if(d1 && d2 ){$("#freeHerosPeriod").html(d1+"-"+d2)}
		}
		// 拿当前服务器时间计算得出本周1 - 下周日
		getServerTime(freeHeroDayFill);
	};

	util.setKV = function(){
		var $wrapper = $(".wrapper");
		if(!$wrapper[0]){return}
		$.getScript("//game.qq.com/time/qqadv/Info_new_15191.js",function(){
			var kvPos = "pos16040";
			if(!oDaTaNew15191 || !oDaTaNew15191[kvPos]) return
				var kvImg = "//game.gtimg.cn/upload/adw/" + oDaTaNew15191[kvPos][2],
					kvLink = oDaTaNew15191[kvPos][1];
				$(".wrapper").css("background-image",'url(' + kvImg + ')');
				$("#kvLink").attr("url",kvLink);
				// console.log($(".wrapper").css("background-image"))
		})
	};

	util.setKVLink = function(){
		function setLink(){
			var link = $(".kv-bg .kv_link").attr("href");
			if(link){
				$("#header .kv-link").attr("href",link)
			}else{
				$("#header .kv-link").hide();
			}
		}
		setTimeout(setLink,500);
	};

	util.addFooterHTML = function(){
		var footerHTML = '';
		footerHTML +='<div class="footer-wrap">';
		footerHTML +='  <div class="footer bc">';
		footerHTML +='    <div class="foot-t clearfix">';
		footerHTML +='      <div class="foot-logo fl clearfix">';
		footerHTML +='        <a href="//ieg.tencent.com/" target="_blank" class="logo1 spr fl ht">腾讯互动娱乐</a>';
		footerHTML +='        <a href="//timi.qq.com/" target="_blank" class="logo2 spr fl ht">timi</a>';
		footerHTML +='      </div>';
		footerHTML +='      <div class="fl media-pic">';
		footerHTML +='        <a href="http://www.youxibao.com/wzlm/?ADTAG=main.coop.img1" target="_blank" class="m1"></a>';
		footerHTML +='        <a href="http://pvp.uuu9.com/?ADTAG=main.coop.img2" target="_blank" class="m2"></a>';
		footerHTML +='        <a href="http://lh.mofang.com/?ADTAG=main.coop.img3" target="_blank" class="m3"></a>';
		footerHTML +='        <a href="http://www.youxiduo.com/game/121033/?ADTAG=main.coop.img4" target="_blank" class="m4"></a>';
		footerHTML +='        <a href="http://www.18183.com/yxzjol/?ADTAG=main.coop.img5" target="_blank" class="m5"></a>';
		footerHTML +='        <a href="http://news.17173.com/z/pvp?ADTAG=main.coop.img6" target="_blank" class="m6"></a>';
		footerHTML +='      </div>   ';
		footerHTML +='      <div id="media" class="foot-media pr fr" onclick="PTTSendClick(\'footer\',\'media\',\'合作媒体\');">';
		footerHTML +='        <h3 class="media-tit">合作媒体</h3>';
		footerHTML +='        <div class="arrow-ico-btn pa"><span class="arrow-ico db spr"></span></div>';
		footerHTML +='			<ul style="display: none;" id="mediaCon" class="media-list pa">';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201703/559618.shtml">全球电竞网</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/490079.shtml">52pk</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/490076.shtml">游久</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/490074.shtml">魔方网</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/490073.shtml">游戏多</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/490072.shtml">17173</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/490071.shtml">18183</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/490070.shtml">任玩堂</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/485141.shtml">口袋巴士</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/485140.shtml">掌游宝</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/485139.shtml">着迷网</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/485138.shtml">搞趣网</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/485137.shtml">多玩</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/485136.shtml">电玩巴士</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/485135.shtml">178</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/485134.shtml">易游</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/485133.shtml">玩略猫</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/485132.shtml">游民星空</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/485131.shtml">爱拍</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/485130.shtml">兔玩网</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/485129.shtml">15W</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/485128.shtml">游戏狗</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/484756.shtml">4399</a></li>';
		footerHTML +='				<li><a target="_blank" href="/webplat/info/news_version3/15592/24091/25063/m11740/201607/484754.shtml">游戏园</a></li>';
		footerHTML +='			</ul>';
		footerHTML +='      </div>';
		footerHTML +='    </div>';
		footerHTML +='    <div class="clearfix">';
		footerHTML +='      <div class="foot-tips fl">';
		footerHTML +='        <p class="fb">温馨提示：本游戏适合16岁(含)以上玩家娱乐</p>';
		footerHTML +='        <p class="f12"><em>抵制不良游戏</em><em>拒绝盗版游戏</em><em>注意自我保护</em><em>谨防受骗上当</em><em>适度游戏益脑</em><em>沉迷游戏伤身</em><em>合理安排时间</em><em>享受健康生活</em></p>';
		footerHTML +='        <p class="intro">《王者荣耀》全部背景故事发生于架空世界“王者大陆”中。相关人物、地理、事件均为艺术创作，并非正史。若因观看王者故事对相关历史人物产生兴趣，建议查阅正史记载。</p>';
		footerHTML +='      </div>';
		footerHTML +='      <div class="foot-b f12 tr">';
		footerHTML +='          <p><a target="_blank" href="http://ieg.tencent.com">腾讯互动娱乐</a> | <a target="_blank" href="http://game.qq.com/contract.shtml">服务条款</a> | <a target="_blank" href="http://adver.qq.com/">广告服务</a> | <a target="_blank" href="http://game.qq.com/hr/">腾讯游戏招聘</a> | <a target="_blank" href="http://service.qq.com/">腾讯游戏客服</a> | <a target="_blank" href="http://game.qq.com/gnav">游戏地图</a> | <a target="_blank" href="http://tgact.qq.com/">游戏活动</a> | <a target="_blank" href="http://game.qq.com/brand/business.htm">商务合作</a> | <a target="_blank" href="http://www.qq.com/map/">网站导航</a></p>';
		footerHTML +='          <p class="foot-txt"><em class="fl">COPYRIGHT &copy; 1998 &ndash; 2017 TENCENT. ALL RIGHTS RESERVED.</em><a target="_blank" href="http://www.tencent.com/law/mo_law.shtml?/law/copyright.htm" class="fr">腾讯公司 版权所有</a></p>';
		footerHTML +='          <p class="cb"><a target="_blank" href=" http://www.qq.com/culture.shtml">粤网文[2017]6138-1456号 &amp; ISBN 978-7-7979-8408-9</a> | <a target="_blank" href="http://game.qq.com/culture2.htm">新出网证（粤）字010号</a> | 文网游备字[2016]M-CSG 0059</p>';
		footerHTML +='          <p class="cb">批准文号：新广出审[2017] 6712号 | 全国文化市场统一举报电话：12318</p>';
		footerHTML +='      </div>';
		footerHTML +='    </div>';
		footerHTML +='  </div>';
		footerHTML +=' </div>';
		$("body").append(footerHTML);
		
	};
	util.footerFunc = function(){
		$("#media").hover(function(){$("#mediaCon").show();},function(){$("#mediaCon").hide();})
	};

	init = function(){
		function n(){
			util.addHeaderHTML();
			util.headerFunc();
			util.addFooterHTML();
			util.footerFunc();
			// util.setKV();
		}
		function nJS(){
			fn.jsLoader("//pvp.qq.com/web201605/js/logic.js",function(){
				n()
			})
		}
		var libFile = (window.milo) ? "" : "//game.gtimg.cn/images/js/milo/milo-min.js"
		libFile ? fn.jsLoader(libFile,nJS()) : nJS();
	};

	return{
		init : init
	}
})()
pvpHeader.init();