class Transition {
    constructor(startX, startY, endX, endY) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;

        this.duration = 2;
        this.startTime = null;
    }

    setTransitionSpeed(speed) {
        let xDistance = this.endX - this.startX;
        let yDistance = this.endY - this.startY;
        let distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
        this.duration = distance / speed;
    }

    start() {
        this.startTime = Date.now();
    }

    getCurrentTimeState() {
        if (!this.startTime) return 0;
        return (Date.now() - this.startTime) / (this.duration * 1000);
    }

    getCurrentPosition() {
        const timeFraction = this.getCurrentTimeState();

        let deltaX = (this.endX - this.startX) * timeFraction;
        let deltaY = (this.endY - this.startY) * timeFraction;

        return [[this.startX + deltaX, this.startY + deltaY], timeFraction >= 1];
    }
}