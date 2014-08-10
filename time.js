var timePicker = {
    x: null,
    y: null,        
    canvas: null,
    context: null,
    radius: 100,
    hours: 0,
    minutes: 0,
    pm: false,
  
    init: function(id) {
        this.canvas = document.getElementById(id);        
        this.context = this.canvas.getContext('2d');

        this.canvas.addEventListener('mousemove', function(evt) {
            timePicker.move(evt);
        }, false);       
        
        this.canvas.addEventListener('click', function(evt) {
            timePicker.click(evt);
        }, false);       
        $('#' + id).attr('width', this.radius * 2 + 2);
        $('#' + id).attr('height', this.radius * 2 + 2);
        this.draw();
     },

    pol2dec: function(r, a) {
        var xx = this.radius + Math.round(Math.cos(a) * r);
        var yy = this.radius + Math.round(Math.sin(a) * r);
        return {
            x: xx,
            y: yy
        };
    }, 

    dec2pol: function(x, y) {
        x = x - this.radius;
        y = y - this.radius;
        if (x < 0) y = -y;
        var r = Math.sqrt(x * x + y * y);
        var a = Math.asin(y / r)
        if (x < 0) a += Math.PI;
        return {
            radius: r,
            angle: a        
        };
    },

    move: function(evt) {
        var rect = this.canvas.getBoundingClientRect();
        this.x = evt.clientX - rect.left;
        this.y = evt.clientY - rect.top;
    },
            
    click: function(evt) {
        var coords = this.dec2pol(this.x, this.y);
        coords.angle += Math.PI / 2;
        if (coords.radius > this.radius * 0.75) { //hours
            var h = Math.round(coords.angle * 12 / (Math.PI*2));
            if (h == 12) h = 0;
            this.hours = h;
            this.draw();
        }
        if ( (coords.radius > this.radius * 0.5) && (coords.radius < this.radius * 0.75) ) { //minutes
            var m = Math.round(coords.angle * 60 / (Math.PI*2));
            if ((m >= 53) || (m < 8)) m = 0;
            else if ((m >= 9) && (m < 23)) m = 15;
            else if ((m >= 23) && (m < 38)) m = 30;
            else if ((m >= 38) && (m < 53)) m = 45;
            this.minutes = m;
            this.draw();
        }
        if (coords.radius < this.radius * 0.5) { // am/pm 
            this.pm = (this.y - this.radius > 0);
            this.draw();
        }
    },

    getCenter: function() {
        return {
            x: this.radius,
            y: this.radius        
        };
    },
            
    drawLabels: function() {
        this.context.font = "12px Helvetica";
        this.context.lineWidth = 1;
        this.context.strokeStyle = '#000000';
        
        var a = 0;
        var i = 0;
        var coords = null;
        
        for(i = 1; i < 13; i++) {
            a = (i * Math.PI / 6) - Math.PI / 2;
            coords = this.pol2dec(this.radius * 0.95 + Math.floor((i % 12)/10) * 4, a);
            this.context.strokeText(i + '', coords.x - 3, coords.y + 6);
        }
        
        for(i = 0; i < 4; i++) {
            a = (i * Math.PI / 2) - Math.PI / 2;
            coords = this.pol2dec(this.radius * 0.62 + Math.floor(i/3) * 4, a);
            this.context.strokeText(i * 15 + '', coords.x - 3, coords.y + 6);
        }
        
        coords = this.pol2dec(this.radius * 0.3, -Math.PI / 2);
        this.context.strokeText('AM', coords.x - 9, coords.y + 8);
        coords = this.pol2dec(this.radius * 0.3, Math.PI / 2);
        this.context.strokeText('PM', coords.x - 9, coords.y);
    },
            
    draw: function() {
        this.context.clearRect(0, 0, this.radius * 2 + 2, this.radius * 2 + 2);
        this.context.lineWidth = 3;
        this.context.strokeStyle='#F99E36';
        this.context.beginPath();
        //this.context.arc(this.radius + 1, this.radius + 1, this.radius, 0, 2*Math.PI);        
        this.context.stroke();        
        this.context.beginPath();
        this.context.arc(this.radius + 1, this.radius + 1, this.radius * 0.75, 0, 2*Math.PI);
        this.context.stroke();        
        this.context.beginPath();
        this.context.arc(this.radius + 1, this.radius + 1, this.radius * 0.5, 0, 2*Math.PI);
        this.context.stroke();        
        for(var i = Math.PI/12; i < 2*Math.PI; i += Math.PI/6) {
            var coords1 = this.pol2dec(this.radius, i);
            var coords2 = this.pol2dec(this.radius * 0.75, i);
            this.context.beginPath();    
            this.context.moveTo(coords1.x, coords1.y);
            this.context.lineTo(coords2.x, coords2.y);
            this.context.stroke();
        }        
        for(var i = Math.PI / 4; i < 2*Math.PI; i += Math.PI/2) {
            var coords1 = this.pol2dec(this.radius * 0.75, i);            
            var coords2 = this.pol2dec(this.radius * 0.5, i);
            this.context.beginPath();    
            this.context.moveTo(coords1.x, coords1.y);
            this.context.lineTo(coords2.x, coords2.y);
            this.context.stroke();            
        }
        this.context.beginPath();    
        var coords1 = this.pol2dec(this.radius * 0.5, Math.PI);
        var coords2 = this.pol2dec(this.radius * 0.5, 0);        
        this.context.moveTo(coords1.x, coords1.y);
        this.context.lineTo(coords2.x, coords2.y);        
        this.context.stroke();      
        
        this.selectHour();
        this.selectMin();
        this.selectAmPm();
        this.drawLabels();
        this.drawTime();
    },
            
    drawTime: function() {        
        var min = this.getMinutes();
        if (min === 0) min = '00';
        var text = this.getHours() + ':' + min;
        var size = this.context.measureText(text);
        var offsetX = Math.round(size.width / 2) + 6;
        var offsetY = 10;
        var center = this.getCenter();
        this.context.clearRect(center.x - 30, center.y - 10, 60, 20);        
        
        this.context.font = "14px Helvetica";
        this.context.lineWidth = 1;
        this.context.strokeStyle = '#000000';
        this.context.strokeText(text, center.x - offsetX + 5, center.y + 5);
    },
            
    selectHour: function() {
        if (this.hours === null) return;
        var a = ((this.hours) * Math.PI / 6 - Math.PI / 12) - Math.PI / 2;
        var b = a + Math.PI / 6;
        this.context.beginPath();    
        this.context.lineWidth = 10;
        this.context.strokeStyle='#F99E36';        
        this.context.arc(this.radius + 1, this.radius + 1, this.radius * 0.75 + 5, a, b);        
        this.context.stroke();
    },
    
    selectMin: function() {
        if (this.minutes === null) return;
        var a = ((this.minutes) * Math.PI / 30 - Math.PI / 4) - Math.PI / 2;
        var b = a + Math.PI / 2; 
        this.context.beginPath();    
        this.context.lineWidth = 10;     
        this.context.strokeStyle='#F99E36';        
        this.context.arc(this.radius + 1, this.radius + 1, this.radius * 0.5 + 5, a, b);        
        this.context.stroke();        
    },
    
    selectAmPm: function() {
        this.context.lineWidth = 14;     
        this.context.strokeStyle='#F99E36';        
        this.context.beginPath();            
        if (!this.pm) {
            var a1 = -3 * Math.PI / 4;
            var a2 = -Math.PI / 4;            
        } else {
            var a1 = Math.PI / 4;
            var a2 = 3 * Math.PI / 4;                        
        }
        var r = 0.37;
        var coords = this.pol2dec(this.radius * r, a1);        
        this.context.moveTo(coords.x, coords.y);
        coords = this.pol2dec(this.radius * r, a2);
        this.context.lineTo(coords.x, coords.y);        
        this.context.stroke();                
    },
    
    getHours: function() {
        return this.pm ? this.hours + 12 : this.hours;
    },
    
    getMinutes: function() {
        return this.minutes;
    }        
           
};

$(document).ready(function() {
    timePicker.init('myCanvas');
});

