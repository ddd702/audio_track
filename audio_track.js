  var el_audio = document.querySelector('#j-audio');
    var el_canvas = document.querySelector('#j-canvas');
    var el_file = document.querySelector('#j-file');
    var el_audio1 = document.querySelector('#j-audio1');
    var el_canvas1 = document.querySelector('#j-canvas1');
    var el_file1 = document.querySelector('#j-file1');
    var el_audioBtn=document.querySelector('#j-audioBtn');
    el_canvas.width = document.querySelector('body').clientWidth;
    el_canvas.height = document.querySelector('body').clientHeight / 2;
    var AudioTrack = function(a, c, f,b) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
        this.audio = a;
        this.btns=b;
        this.canvas = c;
        this.canvasCtx = c.getContext('2d');
        this.fileInput = f;
        this.file = null;
        this.drawVisual=null;
        this.audioCtx = new AudioContext();
        this.source=null;
    }
    AudioTrack.prototype = {
        init: function() {
            this._setEvent();
        },
        _fileDecode: function(e) {
            var _this = this;
            var fileReader = new FileReader();
            this.file = e.target.files[0];
            fileReader.readAsArrayBuffer(this.file);
            //console.warn('正在解析文件');
            var canvasCtx = this.canvasCtx;
            canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            canvasCtx.font="20px Georgia";
            canvasCtx.fillStyle="rgb(0,0,0)";
            canvasCtx.fillText('正在解析：'+this.file.name,10,50);
            if (this.source) {
                this.source.stop();
            }
            fileReader.onload = function(e) {
                var audioData = e.target.result;
                _this.audioCtx.decodeAudioData(audioData).then(function(decodedData) { //解析音频文件
                    console.log(decodedData);
                    _this._showTrack(decodedData);
                });
            }
        },
        _showTrack: function(decodedData) {
        	var _this=this;
        	var WIDTH = this.canvas.width;
            var HEIGHT = this.canvas.height;
            var analyser = this.audioCtx.createAnalyser();
        	if (this.drawVisual) {
        		cancelAnimationFrame(this.drawVisual);
        	}
            this.source = this.audioCtx.createBufferSource();
            this.source.buffer = decodedData;
            this.source.connect(this.audioCtx.destination);
            this.source.start();
            this.source.connect(analyser);
            this.source.onended = function() {
 				cancelAnimationFrame(_this.drawVisual);
			}
			analyser.fftSize = 256;
    		var bufferLength = analyser.frequencyBinCount;
            canvasCtx = this.canvasCtx;
            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
            canvasCtx.font="20px Georgia";
            //canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
           //canvasCtx.fillStyle="rgb(255,255,255)";
            canvasCtx.fillText(this.file.name,10,50);

            function draw() {

            	var dataArray = new Uint8Array(bufferLength); 
                analyser.getByteFrequencyData(dataArray);
                canvasCtx.fillStyle = 'rgb(255, 255, 255)';
                canvasCtx.fillRect(0, 70, WIDTH, HEIGHT-70);

                var barWidth = (WIDTH / bufferLength);
                var barHeight;
                var x = 0;
                for (var i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i]/1.5;
                    canvasCtx.fillStyle = 'rgb(0,0,0)';
                    canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
                    x += barWidth+3;
                }
                _this.drawVisual = requestAnimationFrame(draw);
            };
            draw();
        },
        _setEvent: function() {
            var _this = this;
            var stopBtn= this.btns.querySelector('.audio-btn-stop');
            stopBtn.addEventListener('click',function(){
            	_this.source.stop();
            },false);
            this.fileInput.addEventListener('change', function(e) {
                _this._fileDecode(e);
            }, false);
        }
    }
    var at = new AudioTrack(el_audio, el_canvas, el_file,el_audioBtn);
    at.init();