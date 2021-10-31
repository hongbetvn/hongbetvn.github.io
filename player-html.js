
jQuery(document).ready(()=>{
	jQuery('.eps_title').click((evt)=>{
		var eps_id = jQuery(evt.target).attr('data-eps-id');
		if(eps_id>0){
			loadEpsNoNimble(eps_id,true);
		}
	});

});

function generateM3u8File(ver_data){
	var ver_res = ver_data.res;
	var ver_bitrate = ver_data.bitrate;
	var ver_key = ver_data.key;
	var ver_parts = ver_data.parts;
	var content  = '';
	content = '#EXTM3U'+"\n";
	content+= '#EXT-X-VERSION:3'+"\n";
	content+= '#EXT-X-TARGETDURATION:11'+"\n";
	content+= '#EXT-X-MEDIA-SEQUENCE:0'+"\n";
	
	var link_prefix = 'http://localhost:8051/';
	if(window.location.hostname!='localhost' && window.location.hostname!='192.168.1.33'){
		/*
		link_prefix = 'http://23.237.178.122/';
		if(window.location.hostname=='xongphim.best'){
			link_prefix = 'http://50.7.61.3/';
		}
		*/
		link_prefix = 'http://49.12.65.170/';
		if(window.location.hostname=='xongphim.cc'){
			link_prefix = 'http://49.12.65.170/';
		}
		
	}
	content+= '#EXT-X-KEY:METHOD=AES-128,URI="'+link_prefix+'/m3u8/key_'+ver_key+'.key"'+"\n";
	for(var i in ver_parts){
		var part = ver_parts[i];
		content+= '#EXTINF:'+part[0]+"\n";
		//content+='https://drive.google.com/uc?export=download&id='+part[1]+"\n";
		//content+='https://docs.googleusercontent.com/docs/securesc/*/'+part[1]+'?e=download'+"\n";
		content+= link_prefix+'drive_home.php?drive_id='+part[1]+"\n";
	}
	content+= '#EXT-X-ENDLIST'+"\n";
	return content;
}
var first_setup = true;
function firstSetup(){
	if(first_setup){
		
		if(jwplayer().getQualityLevels().length>0){
			console.log("Setting Auto quality");
			jwplayer().setCurrentQuality(0);
			jwplayer().addCues([{"begin": 600,"cueType": "custom","text": "10 phút","color":"#ffff80"}]);
			console.log("Auto quality done");
			first_setup = false;
		}
	}
}
var expectSeekingPosition = 0;
function playURL(url,auto_play){
	var player = jwplayer('player');
	var options = {
		"sources":[
			{
				"type":"hls",
				//"file":'/drive/test_local.m3u8'
				"file":url,
			}
		],
		cast: {
			"appid": "00000000",
			"customAppId":"00000000"
		},
		aspectratio:"16:9",
		width:"100%",
		autostart:auto_play
	};
	expectSeekingPosition = 0;
	player.setup(options);
	
	player.on('ready',()=>{
		//console.log("Setup ready",jwplayer().getQualityLevels().length);
		firstSetup();
	});
	player.on('seek',(t,e,n)=>{
		var seekPos=t.offset%10;
		
		if(seekPos>0){
			expectSeekingPosition = t.offset-seekPos;
			console.log("==>Set expect pos=",expectSeekingPosition);
		}
	});
	player.on('seeked',(t,e,n)=>{
		if(player.getPosition()!=expectSeekingPosition && expectSeekingPosition>0){
			var newSeekingPos = expectSeekingPosition;
			expectSeekingPosition=0;
			//console.log("actually jumping to ",newSeekingPos);
			player.seek(newSeekingPos);
		}
	});
	player.on('play',()=>{
		//console.log("play===");
		firstSetup();
	});
	player.addButton('/wp-content/plugins/kem/assets/img/forward-10.png','Forward 10 seconds', ()=>{player.seek(player.getCurrentTime()+10)}, 'forward-10', 'jw-icon-forward');
	
	
}
function loadEps(eps_id,auto_play=false){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', "https://cdn3ii.diebutx.com/us1/01/pro.mp4", true);

	xhr.onreadystatechange = function () {
		
		if(xhr.responseURL.indexOf("nimble")>0){
			var nimble = xhr.responseURL.substr(xhr.responseURL.indexOf('?'));
			xhr.abort();
			jQuery.get('/movie_8.m3u8',{eps_id},(data)=>{
				//console.log(data,window.location);
				data = data.replaceAll('.txt','.txt'+nimble);
				var blob = new Blob([data],{type:'text/plain'});
				var url = URL.createObjectURL(blob);
				console.log(url);
				playURL(url,auto_play);
				
				
			});
		}
	  
	};

	xhr.send();
	return false;
	
}

function loadEpsNoNimble(eps_id,auto_play=false){
	jQuery.get('/movie_8.m3u8',{eps_id},(data)=>{
			//console.log(data,window.location);
			//data = data.replaceAll('.txt','.txt'+nimble);
			var blob = new Blob([data],{type:'text/plain'});
			var url = URL.createObjectURL(blob);
			console.log(url);
			playURL(url,auto_play);
			
			
		});
}