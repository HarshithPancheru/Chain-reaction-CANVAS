class Ball {
    constructor(x, y, x_speed, y_speed) {
        this.color = new_color();
        this.x = x;
        this.y = y;
        this.x_speed = x_speed;
        this.y_speed = y_speed;
        this.wallCollided = false;
        this.ballCollided = false;
        this.parents = []
        this.isInfant = true;
    }

    //Draws ball
    draw(time) {
        if (time > 0.017) {
            time = 0.017;
        }

        this.move(time);

        ctx.lineWidth = 1;
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, ballSize, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }

    //changes speed and position of the ball
    move(time) {
        //Check for collission with wall
        if (!this.wallCollided && Math.sqrt((width / 2 - this.y) ** 2 + (width / 2 - this.x) ** 2) > circleRadius - circleLineWidth - ballSize
            && ((this.x - width / 2 < 0 && this.x_speed < 0) || (this.x - width / 2 > 0 && this.x_speed > 0)
                || (this.y - width / 2 < 0 && this.y_speed < 0) || (this.y - width / 2 > 0 && this.y_speed > 0))) {
            let r = this.wallCollision();
            this.x_speed = r[0][0] * wallElasticity * ballElasticity;
            this.y_speed = r[1][0] * wallElasticity * ballElasticity;
            this.ballCollided = false;
            this.wallCollided = true;
            this.isInfant = false;
        }
        //Check for collission with another ball
        else {
            const temp = this.checkBallCollision();
            
            //If no collission occurs, then position & speed of the ball updated
            if (!temp) {
                this.ballCollided = false;
                this.wallCollided = false;
                this.x += this.x_speed * time;
                this.y += this.y_speed * time;
                this.x_speed += gravity_x * time;
                this.y_speed += gravity_y * time;
            }
        }
    }

    //Changes speed of the ball when wall collission occurs
    wallCollision() {
        let x = this.x - width / 2;
        let y = this.y - width / 2;
        let x_s = this.x_speed;
        let y_s = this.y_speed;

        //Matrix algebra
        let v_vec = [[x_s], [y_s]];
        let det = (y * y + x * x)
        let inverse = [[y / det, -x / det], [x / det, y / det]];
        let r = matrixMultiplication(inverse, v_vec);
        return matrixMultiplication([[y, x], [-x, y]], [[r[0][0]], [-r[1][0]]]);
    }
    //Checks whether ball collission occured and changes speed of the ball, creates new ball
    checkBallCollision() {
        if (this.ballCollided)
            return false

        var flag = false;
        for (let i = 0; i < balls.length; i++) {

            if (balls[i] == this)
                continue

            //Check distance between two balls
            if (Math.sqrt((this.x - balls[i].x) ** 2 + (this.y - balls[i].y) ** 2) <= 2 * ballSize) {

                this.ballCollided = true;
                this.wallCollided = false;

                let x_dif = this.x - balls[i].x;
                let y_dif = this.y - balls[i].y;

                //Checks whether direction of the balls opposite to each other
                if (((x_dif < 0 && this.x_speed > 0 && balls[i].x_speed < 0)) || ((x_dif > 0 && this.x_speed < 0 && balls[i].x_speed > 0)) ||
                    ((y_dif < 0 && this.y_speed > 0 && balls[i].y_speed < 0)) || ((y_dif > 0 && this.y_speed < 0 && balls[i].y_speed > 0))) {
                    let temp;

                    if (this.isInfant || balls[i].isInfant) {
                        if (!(balls[i] in this.parents))
                            this.isInfant = false;
                        if (!(this in balls[i].parents))
                            balls[i].isInfant = false
                    }
                    //if balls are colliding with speed greater than threshold speed, create new ball
                    else if (ballCount > balls.length && (Math.abs(this.x_speed - balls[i].x_speed) > threshold || Math.abs(this.y_speed - balls[i].y_speed) > threshold)) {
                        temp = new Ball((this.x + balls[i].x) / 2, (this.y + balls[i].y) / 2, (this.x_speed + balls[i].x_speed) / 2, (this.y_speed + balls[i].y_speed) / 2);
                        //assign parent balls to new ball
                        temp.parents = [this, balls[i]];
                        balls.push(temp);
                    }

                    //swap velocity of both balls
                    temp = [this.x_speed, this.y_speed]
                    this.x_speed = balls[i].x_speed * ballElasticity ** 2;
                    this.y_speed = balls[i].y_speed * ballElasticity ** 2;
                    balls[i].x_speed = temp[0] * ballElasticity ** 2;
                    balls[i].y_speed = temp[1] * ballElasticity ** 2;
                    flag = true;
                }
            }
        }
        return flag;
    }
}

//sets size of the circle according to screen size
function resizeCanvas() {
    can.width = can.height = canbck.width = canbck.height = width =  Math.min(window.innerWidth, window.innerHeight)*96/100;
}

//Function for matrix multiplication
function matrixMultiplication(matrixA, matrixB) {
    let result = [];
    for (let i = 0; i < matrixA.length; i++) {
        let row = [];
        for (let j = 0; j < matrixB[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < matrixA[i].length; k++)   sum += matrixA[i][k] * matrixB[k][j];
            row.push(sum);
        }
        result.push(row);
    }
    return result;
}

//returns color for new ball
function new_color() {
    if (i < colors.length)
        i += 1;
    else
        i = 1;
    return colors[i - 1];
}

//Draws circle and background
function draw_bc() {
    //draw background
    ctxbck.lineWidth = circleLineWidth;
    ctxbck.strokeStyle = 'rgb(252, 2, 186)';
    ctxbck.fillStyle = "black";
    ctxbck.fillRect(0, 0, width, width);

    ctxbck.globalCompositeOperation = 'destination-out'

    //draw circle
    ctxbck.fillStyle = "rgba(0,0,0,1)"
    ctxbck.beginPath();
    ctxbck.arc(width / 2, width / 2, circleRadius, 0, Math.PI * 2, true);
    ctxbck.closePath();
    ctxbck.fill();
    ctxbck.globalCompositeOperation = 'source-over'
    ctxbck.stroke();
}

//Calls recursively
function animate(timeStamp) {
    ctx.clearRect(0, 0, width, width);
    
    //time variable is used to measure time between two frames of the animation 
    time = (timeStamp - previousTime) / 1000;
    previousTime = timeStamp;

    //update position, speed and displayit
    balls.forEach(ball => {
        ball.draw(time);
    });
    requestAnimationFrame(animate);
}

const can = document.getElementById("can");
const ctx = can.getContext("2d");
const canbck = document.getElementById("canBack");
const ctxbck = canbck.getContext("2d");

//colors used for balls
const colors = [
    "rgb(115, 222, 86)", "rgb(58, 205, 216)", "rgb(69, 84, 218)", "rgb(241, 73, 204)", "rgb(228, 42, 42)", "rgb(141, 196, 255)", "rgb(6, 134, 60)", "rgb(173, 27, 222)"
];

//maximum number of balls
const ballCount = 100;

//elasticity index
const wallElasticity = 1;
const ballElasticity = 1;

//threshold speed above which new ball is created 
const threshold = 500;

//gravity values
const gravity_x = 0;
const gravity_y = 500;

var time;
var previousTime = 0;
var i = 0;
var width;

resizeCanvas();

//line width of the circle
const circleLineWidth = width / 100;
const circleRadius = width / 2 - circleLineWidth;

const ballSize = width / 50;
var started = false;

//Initialization
var balls = [];

canbck.addEventListener('click', (event) => {
    balls.push(new Ball(event.offsetX, event.offsetY, 0, 0))
    if(!started){        
requestAnimationFrame(animate);
started = true;
    }
})

canbck.addEventListener('touchend', (event) => {
    balls.push(new Ball(event.offsetX, event.offsetY, 0, 0))
    if(!started){        
        requestAnimationFrame(animate);
        started = true;
    }
})

//Starting point of the code
ctx.font = width/15+'px Arial';
ctx.fillStyle = 'white';
ctx.fillText('Click/Touch here to add new ball', width/50,width/2)
draw_bc();