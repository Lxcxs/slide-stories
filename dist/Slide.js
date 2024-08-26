import Timeout from "./Timeout.js";
export default class Slide {
    container;
    slides;
    controls;
    time;
    index;
    slide;
    timeout;
    paused;
    pausedTimeout;
    thumbItems;
    thumb;
    constructor(container, slides, controls, time = 5000) {
        this.container = container;
        this.slides = slides;
        this.controls = controls;
        this.time = time;
        this.index = localStorage.getItem("activeSlide")
            ? Number(localStorage.getItem("activeSlide"))
            : 0;
        this.slide = this.slides[this.index];
        this.timeout = null;
        this.paused = false;
        this.pausedTimeout = null;
        this.thumbItems = null;
        this.thumb = null;
        this.init();
    }
    hide(el) {
        el.classList.remove("activeSlide");
        if (el instanceof HTMLVideoElement) {
            el.currentTime = 0;
            el.pause();
        }
    }
    showSlide(index) {
        this.index = index;
        this.slide = this.slides[this.index];
        localStorage.setItem("activeSlide", String(this.index));
        if (this.thumbItems) {
            this.thumb = this.thumbItems[this.index];
            this.thumbItems.forEach((el) => el.classList.remove("activeSlide"));
            this.thumb.classList.add("activeSlide");
        }
        this.slides.forEach((el) => this.hide(el));
        this.slide.classList.add("activeSlide");
        if (this.slide instanceof HTMLVideoElement) {
            this.autoVideo(this.slide);
        }
        else {
            this.auto(this.time);
        }
    }
    autoVideo(video) {
        video.muted = true;
        video.play();
        let firstPlay = true;
        video.addEventListener("playing", () => {
            if (firstPlay)
                this.auto(video.duration * 1000);
            firstPlay = false;
        });
    }
    auto(time) {
        this.timeout?.clear();
        this.timeout = new Timeout(() => this.forward(), time);
        if (this.thumb)
            this.thumb.style.animationDuration = `${time}ms`;
    }
    back() {
        const prevSlide = this.index > 0 ? this.index - 1 : this.slides.length - 1;
        this.showSlide(prevSlide);
    }
    forward() {
        if (this.paused)
            return;
        const nextSlide = this.index + 1 < this.slides.length ? this.index + 1 : 0;
        this.showSlide(nextSlide);
    }
    pause() {
        document.body.classList.add("paused");
        this.pausedTimeout = new Timeout(() => {
            this.timeout?.pause();
            this.thumb?.classList.add("paused");
            this.paused = true;
            if (this.slide instanceof HTMLVideoElement)
                this.slide.pause();
        }, 300);
    }
    continue() {
        document.body.classList.remove("paused");
        if (this.paused) {
            this.pausedTimeout?.clear();
            this.paused = false;
            this.thumb?.classList.remove("paused");
            this.timeout?.continue();
            if (this.slide instanceof HTMLVideoElement)
                this.slide.play();
        }
    }
    addControls() {
        const prevButton = document.createElement("button");
        const nextButton = document.createElement("button");
        prevButton.innerText = "←";
        nextButton.innerText = "→";
        this.controls.appendChild(prevButton);
        this.controls.appendChild(nextButton);
        this.controls.addEventListener("pointerdown", () => this.pause());
        document.addEventListener("pointerup", () => this.continue());
        document.addEventListener("touchend", () => this.continue());
        prevButton.addEventListener("pointerup", () => this.back());
        nextButton.addEventListener("pointerup", () => this.forward());
    }
    addThumbItems() {
        const thumbContainer = document.createElement("div");
        thumbContainer.id = "slide-thumb";
        for (let i = 0; i < this.slides.length; i++) {
            thumbContainer.innerHTML +=
                '<span><span class="thumb-item"></span></span>';
        }
        this.controls.appendChild(thumbContainer);
        this.thumbItems = Array.from(document.querySelectorAll(".thumb-item"));
    }
    init() {
        this.addControls();
        this.addThumbItems();
        this.showSlide(this.index);
    }
}
//# sourceMappingURL=Slide.js.map