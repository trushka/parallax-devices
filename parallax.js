var imgDir='images/', videoURL='images/surf.mp4',
	pos0=450, pos1=1200, effHeight=1500,
	maxRatio=2553/1484, minRatio=1.36,
	devices=[{
		img:"display.png",
		x:10.3,y:58.7,width:671,height:525,
		video:{h:0.72,y:0.259,w:0.968,x:0.016}
	}, {
		img:"phone.png",
		width:425,height:314, x:557.1,y:-121.7,z:80
	}, {
		img:"tablet.png",
		width:318,height:244, x:302.8,y:-130,z:150,
		video:{h:0.927,y:0.035,w:0.944,x:0.027}
	}, {
		img:"laptop.png",
		video:{h:0.82,y:0.127,w:0.771,x:0.115},
		z:80,width:558,height:320,x:-517,y:-105.9
	}, {
		img:"h_phone.png",
		video:{h:0.944,y:0.027,w:0.957,x:0.022},
		z:120,width:263,height:125,x:-227.4,y:-237.3
	}, {
		img:"v_phone.png",
		video:{h:0.963,y:0.021,w:0.911,x:0.046},
		z:160,width:135,height:262,x:2.4,y:-174.2
	}, {
		img:"gateway.png",
		z:300,width:190,height:160,x:220,y:-273.3
	}, {
		img:"sos.png",
		z:320,width:79,height:79,x:358.4,y:-307.7
	},{
		img:"beacon.png",z:220,width:104,height:94,x:-477.6,y:-317.7
	}],
	scrl=0, ds=0, camera, scene, renderer, pos0,
	container=document.querySelector('.content_3d'),
	canvas=document.querySelector('#renderer'),
	vec3=function(x,y,z){return new THREE.Vector3(x||0, y||0, z||0)},
	lookAt=vec3(0,0,0), PI=Math.PI;

THREE.Clock.prototype.getDelta=function(max, min){
	var old=this._elapsedTime, now=(window.performance||Date).now()/1000,
		d=Math.min(now-old, isNaN(max)? this.maxDelta||.1 :max);
	this.realDelta=now-this.elapsedTime;
	this.elapsedTime=now;
	if (d<(min||this.minDelta||.022)) return 0;
	this._elapsedTime=now;
	this.oldTime=old;
	return this.delta=d||0;
}
var clock = new THREE.Clock(); clock.getDeltaLim

//init();
//animate();

//function init() {

	renderer = new THREE.WebGLRenderer( { alpha:true, antialias:true, canvas: canvas } );//
	//renderer.setSize( window.innerWidth, window.innerHeight );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, pos0*.4, pos1*1.5 );
	//camera.lookAt(0,0,0);
	var _pos1=vec3(0,0,pos1), posTarg=vec3(), corY,
		body=document.body, html=body.parentNode,
		wrapper=document.querySelector('.scroll-wrapper');
	function onWresize() {
		var el=renderer.domElement, w=el.offsetWidth, h=el.offsetHeight;
		camera.aspect = w / h;
		camera.zoom=Math.max(1, w/h/maxRatio);
		corY=Math.min(1, w/h/minRatio+.02);
		_pos1.z=pos1*(camera.zoom)/corY;

		camera.far=_pos1.z*camera.zoom*1.5;
		camera.updateProjectionMatrix();
		renderer.setSize( w, h );
		renderer.setPixelRatio( window.devicePixelRatio=window.devicePixelRatio||1 );
		el.style.cssText=''
	};
	//onWresize();
	renderer.setSize(1,1,!1);
	addEventListener('resize', onWresize);

	// controls = new THREE.OrbitControls( camera );
	// controls.target.set( 0, 100, 0 );
	// controls.update();

	scene = new THREE.Scene();

	var video=document.createElement('video'), loading=1;
	function loaded() {
		if (--loading) return;
		video.play();
		camera.position.copy(_pos1);
		renderer.render(scene, camera);
		onWresize();
		canvas.parentNode.style.opacity=1;
	}
	video.autoplay=video.loop=video.muted=true;
	video.crossOrigin='';
	video.src=videoURL;
	video.oncanplay=loaded;
	var d0, vTex = new THREE.VideoTexture(video),
		tLoader=new THREE.TextureLoader(), //vTex=tLoader.load('images/display.png')
		pGeo= new THREE.PlaneBufferGeometry(1,1),
		objects={};

	vTex.matrixAutoUpdate=false;
	devices.forEach(function(el, i){
		var name=el.img.replace('.png', ''),
			material=new THREE.MeshBasicMaterial({
				color: '#fff',
				map: tLoader.load(imgDir+el.img, loaded),
				transparent:true
			}),
			obj=objects[name]=new THREE.Mesh(pGeo, material);
			loading++;
		//material.map.
		scene.add(obj);
		if (el.video) {
			material=new THREE.MeshBasicMaterial({
				color: '#fff',
				map: vTex, //tLoader.load(imgDir+el.img),i?{__proto__: vTex}:
				alphaMap: tLoader.load(imgDir+'mask_'+el.img, loaded),
				alphaTest: .01,
				
				onBeforeCompile: function(sh){ //if (i) return;
					sh.vertexShader='varying vec2 vUv0;\n'+
					sh.vertexShader.replace('<uv_vertex>', '<uv_vertex>\n	vUv0=uv;');

					sh.fragmentShader='varying vec2 vUv0;\n'+
					sh.fragmentShader.replace('#include <alphamap_fragment>', 'diffuseColor.a *= texture2D( alphaMap, vUv0 ).g;')
					//console.log(sh.vertexShader, sh.fragmentShader)
				}
			});
			loading++;
			obj.add(obj.video=new THREE.Mesh(pGeo, material));
			obj.video.onBeforeRender=function(){
				if (!video.videoWidth) return;
				if (!obj.vMatrix ) { //set video texture matrix
					var v=el.video,
					 vRatio=video.videoWidth/video.videoHeight,
					 eRatio=el.width/el.height,
					 ratio=v.w/v.h*eRatio, w, h;
					if (ratio>vRatio) {
					 	w=v.w;
					 	h=w*eRatio/vRatio;
					} else {
					 	h=v.h;
					 	w=h*vRatio/eRatio;
					}
					//w=h=.3
					obj.vMatrix=new THREE.Matrix3().getInverse(
						new THREE.Matrix3().translate(-.5, -.5)
						.scale(w, h).translate(.5, .5)
						.translate(v.x-(1-v.w)/2, v.y-(1-v.h)/2)
					)
				}
				vTex.matrix=obj.vMatrix;
			}
		}
		obj.data=el;
		(obj.setZ=function(z){
			var k=(pos1-z)/pos1;
			obj.scale.set(el.width, el.height, 1).multiplyScalar(k);
			obj.position.set(el.x, el.y).multiplyScalar(k);
			obj.position.z=z
		})(el.z||0);
		if (name=='display') pos0=vec3(obj.position.x, obj.position.y+63, pos0);
	});
	camera.position.copy(pos0);
	body.style.height=wrapper.scrollHeight+'px';
	wrapper.className+=' animated';

	var vTop=0, lastTop, topCor=effHeight*.16, scrDir=1,
		footer_3d=document.querySelector('.footer-3d'),
		header_3d=document.querySelector('.header-3d');

	function toRealPx(val) {
		return Math.round(val*devicePixelRatio)/devicePixelRatio;
	}

with (Math) {requestAnimationFrame( function animate() {
	// canvas.parentNode.style.transform='rotate('+video.currentTime*10+'deg)';
	requestAnimationFrame( animate );
	body.style.height=wrapper.scrollHeight+effHeight+'px';
	var _scrTop, curTop=window.scrollY||html.scrollTop, top=curTop,
		top0=container.offsetTop, h=canvas.offsetHeight,
		effTop=top0+effHeight, bottom=top+effHeight;
	if (lastTop===undefined) console.log(lastTop=curTop);
	var delta=clock.getDelta(.1, .01), delta0=clock.realDelta;
	var curDTop=top - lastTop,
		lastDTop=vTop*delta0,
		dTop=toRealPx((lastDTop+curDTop)/2*min(1, delta0*20));
	if (lastDTop*curDTop>=0 && abs(dTop)>abs(curDTop)) dTop=curDTop;

	vTop=(dTop)/delta0;
	scrTop=top=lastTop+=dTop;
	if (top>=top0) scrTop=max(top0+topCor-cos(max(0, top+.56*topCor-effHeight-top0)/topCor)*topCor, top-effHeight);

	if (loading>0 ) return;
	wrapper.scrollTop=scrTop;
	
	//var ,// box=container.getBoundingClientRect(),
	if (scrTop>=top0+container.offsetHeight || scrTop<=top0-h) return video.pause();
	var h0=container.offsetHeight-h, dh=bottom-h*1.2, dy=dh/h, dp,
	 k=1-max(0, (top-top0)/effHeight*1.1);
	k=.5-cos(max(k,0)*PI)/2;
	canvas.style.opacity=(h-top0+scrTop)/h*1.3;
	dp=_pos1.clone().sub(pos0).multiplyScalar(k);
	if (scrTop>top0) {
		canvas.style.transform='translateY('+(top0-scrTop)+'px)';
	} else {
		canvas.style.transform=''
	};

	footer_3d.classList[(curTop>effTop-topCor*.87)?'remove':'add']('hidden');
	header_3d.style.transform='translateY('+toRealPx(top0-top)+'px)';
	header_3d.classList[abs(top-top0+(scrDir=sign(dTop||scrDir))*h*.08)>h*.4?'add':'remove']('hidden');

	if (!delta) return;

	posTarg.copy(_pos1).sub(dp);

	if (loading) camera.position.add(posTarg.sub(camera.position).multiplyScalar(delta*8))
	else camera.position.copy(posTarg);
	camera.projectionMatrix.elements[9]=(1/camera.position.z-1/pos0.z)/corY*80
	loading=-1;


	//ds=(scrl*parallax+innerHeight)/((scrl=scrollY)*parallax+innerHeight);
	//console.log(camera.position);
	// camera.position.z/=ds;
	renderer.render( scene, camera );
	if (video.paused) video.play();
	//console.log(camera.position);
})}

function getSizes() {
	ctx=document.createElement('canvas').getContext('2d');
	ctx.canvas.width=1000;
	ctx.canvas.height=1000;
	ctx.scale(1,-1)

	devices.forEach((el, i)=>{
		if (el.matrix) {
			el.x = +el.matrix[12].toFixed(1);
			el.y = +el.matrix[13].toFixed(1);
			delete el.matrix;
		}
		if (!el.video) return;
		ctx.drawImage(objects[el.img.replace('.png', '')].video.material.alphaMap.image, 0, 0, 1000, -1000);
		var vbox=el.video={};

		var idata=ctx.getImageData(200,0,1,1000).data;
		idata.forEach((p,i)=>{
			if (i%4==3) return;
		    if (!vbox.y && p ) vbox.y=+(i/idata.length).toFixed(3);
		    if (!vbox.h && !p ) vbox.h=+(i/idata.length-vbox.y).toFixed(3);
		}) 
		idata=ctx.getImageData(0,500,1000,1).data;
		idata.forEach((p,i)=>{
			if (i%4==3) return;
		    if (!vbox.x && p ) vbox.x=+(i/idata.length).toFixed(3);
		    if (!vbox.w && !p ) vbox.w=+(i/idata.length-vbox.x).toFixed(3);
		}) 
	})//, null, ' '
	return JSON.stringify(devices).replace(/"(\w+)":/g, '$1:')
}

